(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SchedulePdf = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PAGE_W = 841.89;
  const PAGE_H = 595.28;
  const MARGIN_X = 10;
  const FOOTER_Y = 576;
  const TABLE_TOP = 158;
  const HEADER_BG = [79, 129, 189];
  const ALT_BG = [219, 229, 241];
  const BORDER = [138, 169, 204];
  const TEXT = [20, 20, 20];
  const MUTED = [105, 105, 105];

  function ascii(value) {
    return String(value == null ? '' : value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[–—−]/g, '-')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/…/g, '...')
      .replace(/[^\x20-\x7E]/g, '?');
  }

  function pdfEscape(value) {
    return ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function n(value) {
    return Number(value).toFixed(2).replace(/\.00$/, '');
  }

  function rgb(arr) {
    return arr.map((v) => (v / 255).toFixed(3)).join(' ');
  }

  function rect(x, top, w, h, fill, stroke) {
    const y = PAGE_H - top - h;
    const ops = ['q'];
    if (fill) ops.push(`${rgb(fill)} rg`);
    if (stroke) ops.push(`${rgb(stroke)} RG 0.5 w`);
    ops.push(`${n(x)} ${n(y)} ${n(w)} ${n(h)} re`);
    ops.push(fill && stroke ? 'B' : fill ? 'f' : 'S', 'Q');
    return ops.join('\n') + '\n';
  }

  function line(x1, top1, x2, top2, color = BORDER, width = 0.5) {
    const y1 = PAGE_H - top1;
    const y2 = PAGE_H - top2;
    return `q ${rgb(color)} RG ${n(width)} w ${n(x1)} ${n(y1)} m ${n(x2)} ${n(y2)} l S Q\n`;
  }

  function text(x, topBaseline, value, size = 9, font = 'F1', color = TEXT, align = 'left', maxWidth = 0) {
    const clean = ascii(value);
    let tx = x;
    if (align !== 'left' && maxWidth > 0) {
      const est = estimateTextWidth(clean, size, font === 'F2' ? 0.52 : font === 'F3' ? 0.55 : 0.50);
      if (align === 'center') tx = x + Math.max(0, (maxWidth - est) / 2);
      if (align === 'right') tx = x + Math.max(0, maxWidth - est);
    }
    const y = PAGE_H - topBaseline;
    return `BT /${font} ${n(size)} Tf ${rgb(color)} rg 1 0 0 1 ${n(tx)} ${n(y)} Tm (${pdfEscape(clean)}) Tj ET\n`;
  }

  function estimateTextWidth(value, size, factor = 0.5) {
    const s = ascii(value);
    let units = 0;
    for (const ch of s) {
      if (' ilI.,:;!|\'`'.includes(ch)) units += 0.28;
      else if ('MW@#%&'.includes(ch)) units += 0.85;
      else if ('0123456789'.includes(ch)) units += 0.52;
      else if (ch === ' ') units += 0.30;
      else units += 0.52;
    }
    return units * size * (factor / 0.5);
  }

  function wrap(value, width, fontSize = 9, factor = 0.5) {
    const clean = ascii(value).trim();
    if (!clean) return [''];
    const words = clean.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (!current || estimateTextWidth(candidate, fontSize, factor) <= width) {
        current = candidate;
        continue;
      }
      lines.push(current);
      if (estimateTextWidth(word, fontSize, factor) <= width) {
        current = word;
      } else {
        let chunk = '';
        for (const ch of word) {
          const next = chunk + ch;
          if (chunk && estimateTextWidth(next, fontSize, factor) > width) {
            lines.push(chunk);
            chunk = ch;
          } else chunk = next;
        }
        current = chunk;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  }

  function rowModel(schedule, widths) {
    const pad = 6;
    const fontSize = 8.8;
    const lineH = 11.2;
    const dayLines = wrap(schedule.day || '-', widths[0] - pad * 2, fontSize);
    const timeLines = wrap(schedule.time || '-', widths[1] - pad * 2, fontSize);
    const codeLines = wrap(schedule.courseCode || '-', widths[2] - pad * 2, fontSize);
    const courseMain = wrap(schedule.courseName || '-', widths[3] - pad * 2, fontSize);
    const courseEn = schedule.courseNameEn ? wrap(`(${schedule.courseNameEn})`, widths[3] - pad * 2, fontSize, 0.52) : [];
    const sksLines = wrap(String(schedule.sks || '-'), widths[4] - pad * 2, fontSize);
    const lecturerLines = [];
    (schedule.lecturers || []).forEach((name, index) => {
      const item = `${index + 1}. ${name}`;
      const wrapped = wrap(item, widths[5] - pad * 2, fontSize);
      lecturerLines.push(...wrapped);
    });
    if (!lecturerLines.length) lecturerLines.push('-');
    const roomLines = wrap(schedule.room || '-', widths[6] - pad * 2, fontSize);
    const counts = [dayLines.length, timeLines.length, codeLines.length, courseMain.length + courseEn.length, sksLines.length, lecturerLines.length, roomLines.length];
    const height = Math.max(34, Math.max(...counts) * lineH + 12);
    return { dayLines, timeLines, codeLines, courseMain, courseEn, sksLines, lecturerLines, roomLines, lineH, fontSize, height, pad };
  }

  function drawLines(content, x, top, width, lines, model, opts = {}) {
    const { lineH, fontSize, pad } = model;
    const font = opts.font || 'F1';
    const align = opts.align || 'left';
    const start = top + 15;
    lines.forEach((item, index) => {
      content.push(text(x + pad, start + index * lineH, item, fontSize, font, TEXT, align, width - pad * 2));
    });
  }

  function drawHeader(content, programStudy, institution, semester, academicYear) {
    content.push(text(0, 29, 'Jadwal Perkuliahan', 17, 'F3', TEXT, 'center', PAGE_W));
    content.push(text(0, 64, programStudy || 'Program Studi', 15.5, 'F3', TEXT, 'center', PAGE_W));
    content.push(text(0, 99, institution || 'Universitas Duta Bangsa Surakarta', 14, 'F3', TEXT, 'center', PAGE_W));
    content.push(text(0, 133, `${semester || 'Semester 1'} - TA ${academicYear || ''}`.trim(), 12.5, 'F3', TEXT, 'center', PAGE_W));
  }

  function drawTableHeader(content, top, widths) {
    const labels = ['Hari', 'Jam', 'Kode', 'Mata Kuliah', 'SKS', 'Dosen Pengampu', 'Ruang'];
    let x = MARGIN_X;
    const h = 31;
    labels.forEach((label, i) => {
      content.push(rect(x, top, widths[i], h, HEADER_BG, BORDER));
      content.push(text(x, top + 20, label, 8.6, 'F3', [15, 15, 15], 'center', widths[i]));
      x += widths[i];
    });
    return top + h;
  }

  function drawDataRow(content, top, widths, model, rowIndex) {
    let x = MARGIN_X;
    const fill = rowIndex % 2 === 0 ? ALT_BG : [255, 255, 255];
    widths.forEach((w) => {
      content.push(rect(x, top, w, model.height, fill, BORDER));
      x += w;
    });

    x = MARGIN_X;
    drawLines(content, x, top, widths[0], model.dayLines, model, { font: 'F3', align: 'left' });
    x += widths[0];
    drawLines(content, x, top, widths[1], model.timeLines, model, { align: 'center' });
    x += widths[1];
    drawLines(content, x, top, widths[2], model.codeLines, model, {});
    x += widths[2];

    const courseStart = top + 15;
    model.courseMain.forEach((item, index) => content.push(text(x + model.pad, courseStart + index * model.lineH, item, model.fontSize, 'F1', TEXT)));
    model.courseEn.forEach((item, index) => content.push(text(x + model.pad, courseStart + (model.courseMain.length + index) * model.lineH, item, model.fontSize, 'F2', TEXT)));
    x += widths[3];

    drawLines(content, x, top, widths[4], model.sksLines, model, { align: 'center' });
    x += widths[4];
    drawLines(content, x, top, widths[5], model.lecturerLines, model, {});
    x += widths[5];
    drawLines(content, x, top, widths[6], model.roomLines, model, { align: 'center' });
  }

  function drawFooter(content, programStudy, academicYear, pageNo, totalPages) {
    const left = `Sekolah Pascasarjana UDB | Program Studi ${programStudy || '-'} | Jadwal Rinci OBE ${academicYear || ''}`;
    content.push(text(0, FOOTER_Y, left, 6.6, 'F1', MUTED, 'center', PAGE_W));
    if (totalPages > 1) content.push(text(PAGE_W - 52, FOOTER_Y, `${pageNo}/${totalPages}`, 6.6, 'F1', MUTED, 'right', 38));
  }

  function buildPages(input) {
    const settings = input.settings || {};
    const rows = Array.isArray(input.schedules) ? input.schedules : [];
    const widths = [48, 102, 64, 245, 40, 273, 50];
    const models = rows.map((row) => ({ row, model: rowModel(row, widths) }));
    const pages = [];
    let current = [];
    let y = TABLE_TOP;
    let rowIndex = 0;

    function startPage() {
      current = [];
      drawHeader(current, input.programStudy, settings.institution, settings.semester, settings.academicYear);
      y = drawTableHeader(current, TABLE_TOP, widths);
      pages.push(current);
    }

    startPage();
    if (!models.length) {
      const emptyTop = y;
      current.push(rect(MARGIN_X, emptyTop, widths.reduce((a, b) => a + b, 0), 42, [255, 255, 255], BORDER));
      current.push(text(MARGIN_X, emptyTop + 25, 'Belum ada jadwal untuk program studi ini.', 9.5, 'F1', MUTED, 'center', widths.reduce((a, b) => a + b, 0)));
    } else {
      models.forEach(({ model }) => {
        if (y + model.height > FOOTER_Y - 22) {
          startPage();
        }
        drawDataRow(current, y, widths, model, rowIndex);
        y += model.height;
        rowIndex += 1;
      });
    }

    const totalPages = pages.length;
    pages.forEach((page, index) => drawFooter(page, input.programStudy, settings.academicYear, index + 1, totalPages));
    return pages.map((ops) => ops.join(''));
  }

  function buildPdf(input) {
    const pageContents = buildPages(input || {});
    const objects = [];
    function addObject(body) {
      objects.push(body);
      return objects.length;
    }

    const catalogId = addObject('');
    const pagesId = addObject('');
    const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const fontItalicId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');
    const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

    const pageIds = [];
    pageContents.forEach((content) => {
      const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${n(PAGE_W)} ${n(PAGE_H)}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontItalicId} 0 R /F3 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    });

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

    let pdf = '%PDF-1.4\n%PDFGEN\n';
    const offsets = [0];
    objects.forEach((body, index) => {
      offsets[index + 1] = pdf.length;
      pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i += 1) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
    return bytes;
  }

  function safeFilename(value) {
    return ascii(value || 'program-studi')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'program-studi';
  }

  return { buildPdf, safeFilename, ascii };
});
