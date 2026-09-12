(() => {
  'use strict';

  const STORAGE_KEY = 'plottingJadwalJumatSabtu_v5';
  const PREVIOUS_STORAGE_KEYS = ['plottingJadwalJumatSabtu_v4', 'plottingJadwalJumatSabtu_v3', 'plottingJadwalJumatSabtu_v2'];
  const LEGACY_STORAGE_KEY = 'plottingJadwalKuliah_v1';
  const DATA_VERSION = 5;

  const PROGRAM_STUDIES = [
    'Magister Teknologi Informasi',
    'Magister Manajemen',
    'Magister Hukum'
  ];
  const COHORT_START_YEAR = 2025;
  const COHORT_FUTURE_YEARS = 10;

  const SESSIONS = {
    Jumat: [
      { id: 'JMT-1', start: '16:00', end: '16:50' },
      { id: 'JMT-2', start: '16:50', end: '17:40' },
      { id: 'JMT-3', start: '17:40', end: '18:30' },
      { id: 'JMT-4', start: '18:30', end: '19:20' },
      { id: 'JMT-5', start: '19:20', end: '20:10' },
      { id: 'JMT-6', start: '20:10', end: '21:00' }
    ],
    Sabtu: [
      { id: 'SBT-1', start: '14:00', end: '14:50' },
      { id: 'SBT-2', start: '14:50', end: '15:40' },
      { id: 'SBT-3', start: '15:40', end: '16:30' },
      { id: 'SBT-4', start: '16:30', end: '17:20' },
      { id: 'SBT-5', start: '17:20', end: '18:10' },
      { id: 'SBT-6', start: '18:30', end: '19:20' },
      { id: 'SBT-7', start: '19:20', end: '20:10' },
      { id: 'SBT-8', start: '20:10', end: '21:00' }
    ]
  };

  const defaultRooms = () => Array.from({ length: 6 }, (_, i) => ({
    id: uid('room'),
    name: `Ruang ${i + 1}`,
    capacity: ''
  }));

  const defaultPdfSettings = () => {
    const year = new Date().getFullYear();
    return {
      institution: 'Universitas Duta Bangsa Surakarta',
      semester: 'Semester 1',
      academicYear: `${year}/${year + 1}`
    };
  };

  const emptyData = () => ({
    version: DATA_VERSION,
    lecturers: [],
    rooms: defaultRooms(),
    schedules: [],
    pdfSettings: defaultPdfSettings()
  });

  const $ = (id) => document.getElementById(id);
  const els = {
    lecturerForm: $('lecturerForm'),
    lecturerName: $('lecturerName'),
    lecturerCode: $('lecturerCode'),
    lecturerList: $('lecturerList'),
    roomForm: $('roomForm'),
    roomName: $('roomName'),
    roomCapacity: $('roomCapacity'),
    roomList: $('roomList'),
    scheduleForm: $('scheduleForm'),
    scheduleId: $('scheduleId'),
    scheduleFormTitle: $('scheduleFormTitle'),
    courseCode: $('courseCode'),
    courseName: $('courseName'),
    courseNameEn: $('courseNameEn'),
    programStudy: $('programStudy'),
    cohort: $('cohort'),
    daySelect: $('daySelect'),
    sessionSelect: $('sessionSelect'),
    endSessionSelect: $('endSessionSelect'),
    sksSelect: $('sksSelect'),
    roomSelect: $('roomSelect'),
    lecturerChoices: $('lecturerChoices'),
    lecturerSearch: $('lecturerSearch'),
    btnClearLecturers: $('btnClearLecturers'),
    notes: $('notes'),
    conflictBox: $('conflictBox'),
    btnSaveSchedule: $('btnSaveSchedule'),
    btnCancelEdit: $('btnCancelEdit'),
    scheduleList: $('scheduleList'),
    filterDay: $('filterDay'),
    detailLecturerSelect: $('detailLecturerSelect'),
    lecturerDetailSummary: $('lecturerDetailSummary'),
    lecturerDetailList: $('lecturerDetailList'),
    plotTables: $('plotTables'),
    statLecturers: $('statLecturers'),
    statRooms: $('statRooms'),
    statSchedules: $('statSchedules'),
    statFilledSessions: $('statFilledSessions'),
    btnPdf: $('btnPdf'),
    btnPrint: $('btnPrint'),
    btnPrintPlot: $('btnPrintPlot'),
    pdfSettingsForm: $('pdfSettingsForm'),
    pdfInstitution: $('pdfInstitution'),
    pdfSemester: $('pdfSemester'),
    pdfAcademicYear: $('pdfAcademicYear'),
    pdfProgramList: $('pdfProgramList'),
    btnExport: $('btnExport'),
    btnExportLarge: $('btnExportLarge'),
    importFile: $('importFile'),
    btnReset: $('btnReset'),
    toast: $('toast'),
    confirmModal: $('confirmModal'),
    confirmTitle: $('confirmTitle'),
    confirmMessage: $('confirmMessage'),
    confirmCancel: $('confirmCancel'),
    confirmOk: $('confirmOk')
  };

  let data = loadData();
  let draftLecturerIds = new Set();
  let toastTimer;
  let confirmResolver = null;

  init();

  function init() {
    renderCohortOptions();
    bindEvents();
    renderAll();
  }

  function bindEvents() {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });

    els.lecturerForm.addEventListener('submit', onAddLecturer);
    els.roomForm.addEventListener('submit', onAddRoom);
    els.scheduleForm.addEventListener('submit', onSaveSchedule);
    els.daySelect.addEventListener('change', () => {
      renderSessionOptions();
      previewConflict();
    });
    els.sessionSelect.addEventListener('change', () => {
      renderDurationOptions();
      previewConflict();
    });
    els.endSessionSelect.addEventListener('change', () => {
      syncSksFromEndSession();
      previewConflict();
    });
    els.sksSelect.addEventListener('change', () => {
      syncEndSessionFromSks();
      previewConflict();
    });
    els.roomSelect.addEventListener('change', previewConflict);
    els.lecturerChoices.addEventListener('change', (event) => {
      const checkbox = event.target.closest('input[name="lecturerIds"]');
      if (checkbox) {
        if (checkbox.checked) draftLecturerIds.add(checkbox.value);
        else draftLecturerIds.delete(checkbox.value);
      }
      previewConflict();
    });
    els.lecturerSearch.addEventListener('input', () => renderLecturerChoices());
    els.btnClearLecturers.addEventListener('click', () => {
      draftLecturerIds.clear();
      renderLecturerChoices();
      previewConflict();
    });
    els.btnCancelEdit.addEventListener('click', resetScheduleForm);
    els.filterDay.addEventListener('change', renderScheduleList);
    els.detailLecturerSelect.addEventListener('change', renderLecturerDetail);
    els.btnPdf.addEventListener('click', () => activateTab('pdf'));
    els.pdfSettingsForm.addEventListener('submit', savePdfSettings);
    els.pdfProgramList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-pdf-program]');
      if (button) downloadProgramPdf(button.dataset.pdfProgram);
    });
    els.btnPrint.addEventListener('click', printPlot);
    els.btnPrintPlot.addEventListener('click', printPlot);
    els.btnExport.addEventListener('click', exportData);
    els.btnExportLarge.addEventListener('click', exportData);
    els.importFile.addEventListener('change', importData);
    els.btnReset.addEventListener('click', resetAllData);

    els.confirmCancel.addEventListener('click', () => closeConfirm(false));
    els.confirmOk.addEventListener('click', () => closeConfirm(true));
    els.confirmModal.addEventListener('click', (event) => {
      if (event.target === els.confirmModal) closeConfirm(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !els.confirmModal.classList.contains('hidden')) closeConfirm(false);
    });
  }

  function activateTab(name) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
    const target = $(`tab-${name}`);
    if (target) target.classList.add('active');
    if (name === 'plot') renderPlot();
    if (name === 'lecturer-detail') renderLecturerDetail();
    if (name === 'pdf') renderPdfPanel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function uid(prefix = 'id') {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeText(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function displayTime(start, end) {
    return `${start.replace(':', '.')} – ${end.replace(':', '.')}`;
  }

  function sessionById(day, id) {
    return (SESSIONS[day] || []).find((session) => session.id === id) || null;
  }

  function sessionIndex(day, id) {
    return (SESSIONS[day] || []).findIndex((session) => session.id === id);
  }

  function sessionsForRange(day, startSessionId, endSessionId) {
    const sessions = SESSIONS[day] || [];
    const startIndex = sessionIndex(day, startSessionId);
    const endIndex = sessionIndex(day, endSessionId);
    if (startIndex < 0 || endIndex < startIndex) return [];
    return sessions.slice(startIndex, endIndex + 1);
  }

  function scheduleSessions(schedule) {
    return sessionsForRange(schedule.day, schedule.startSessionId, schedule.endSessionId);
  }

  function scheduleCoversSession(schedule, sessionId) {
    return scheduleSessions(schedule).some((session) => session.id === sessionId);
  }

  function scheduleTimeLabel(schedule) {
    const sessions = scheduleSessions(schedule);
    if (!sessions.length) return '-';
    return displayTime(sessions[0].start, sessions[sessions.length - 1].end);
  }

  function timeToMinutes(time) {
    const [h, m] = String(time).split(':').map(Number);
    return h * 60 + m;
  }

  function sortRooms(rooms) {
    return [...rooms].sort((a, b) => a.name.localeCompare(b.name, 'id', { numeric: true, sensitivity: 'base' }));
  }

  function sortLecturers(lecturers) {
    return [...lecturers].sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return sanitizeData(JSON.parse(raw));

      for (const previousKey of PREVIOUS_STORAGE_KEYS) {
        const previousRaw = localStorage.getItem(previousKey);
        if (previousRaw) {
          const migrated = sanitizeData(JSON.parse(previousRaw));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }

      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const migrated = migrateOldData(JSON.parse(legacyRaw));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch (error) {
      console.warn('Gagal membaca data lokal:', error);
    }
    return emptyData();
  }

  function normalizeSchedule(item) {
    const day = item.day;
    const sessions = SESSIONS[day] || [];
    const legacySessionId = item.sessionId || sessions.find((session) => session.start === item.startTime && session.end === item.endTime)?.id || '';
    let startSessionId = String(item.startSessionId || legacySessionId || '');
    let endSessionId = String(item.endSessionId || '');
    let startIndex = sessionIndex(day, startSessionId);

    if (startIndex < 0) return null;

    if (sessionIndex(day, endSessionId) < startIndex) {
      const requestedSks = Math.max(1, Number.parseInt(item.sks, 10) || 1);
      const endIndexFromSks = Math.min(sessions.length - 1, startIndex + requestedSks - 1);
      endSessionId = sessions[endIndexFromSks]?.id || startSessionId;
    }

    const range = sessionsForRange(day, startSessionId, endSessionId);
    if (!range.length) return null;

    return {
      id: String(item.id),
      courseCode: normalizeText(item.courseCode),
      courseName: normalizeText(item.courseName),
      courseNameEn: normalizeText(item.courseNameEn),
      programStudy: normalizeText(item.programStudy || 'Belum diisi'),
      cohort: normalizeText(item.cohort || item.className || 'Belum diisi'),
      day,
      startSessionId,
      endSessionId,
      sks: range.length,
      roomId: String(item.roomId || ''),
      lecturerIds: Array.isArray(item.lecturerIds) ? [...new Set(item.lecturerIds.map(String))] : (item.lecturerId ? [String(item.lecturerId)] : []),
      notes: normalizeText(item.notes),
      createdAt: item.createdAt || new Date().toISOString()
    };
  }

  function sanitizeData(candidate) {
    const safe = {
      version: DATA_VERSION,
      lecturers: Array.isArray(candidate?.lecturers) ? candidate.lecturers : [],
      rooms: Array.isArray(candidate?.rooms) && candidate.rooms.length ? candidate.rooms : defaultRooms(),
      schedules: Array.isArray(candidate?.schedules) ? candidate.schedules : [],
      pdfSettings: candidate?.pdfSettings && typeof candidate.pdfSettings === 'object' ? candidate.pdfSettings : defaultPdfSettings()
    };

    safe.lecturers = safe.lecturers
      .filter((item) => item && item.id && item.name)
      .map((item) => ({ id: String(item.id), name: normalizeText(item.name), code: normalizeText(item.code) }));

    safe.rooms = safe.rooms
      .filter((item) => item && item.id && item.name)
      .map((item) => ({ id: String(item.id), name: normalizeText(item.name), capacity: normalizeText(item.capacity) }));

    safe.schedules = safe.schedules
      .filter((item) => item && item.id && (item.day === 'Jumat' || item.day === 'Sabtu'))
      .map(normalizeSchedule)
      .filter(Boolean);

    const defaults = defaultPdfSettings();
    safe.pdfSettings = {
      institution: normalizeText(safe.pdfSettings.institution) || defaults.institution,
      semester: normalizeText(safe.pdfSettings.semester) || defaults.semester,
      academicYear: normalizeText(safe.pdfSettings.academicYear) || defaults.academicYear
    };

    return safe;
  }

  function migrateOldData(old) {
    const migrated = sanitizeData({
      version: DATA_VERSION,
      lecturers: old?.lecturers || [],
      rooms: old?.rooms || [],
      schedules: (old?.schedules || []).map((schedule) => {
        if (!['Jumat', 'Sabtu'].includes(schedule.day)) return null;
        const matchingSession = (SESSIONS[schedule.day] || []).find((session) => session.start === schedule.startTime && session.end === schedule.endTime);
        if (!matchingSession) return null;
        return {
          ...schedule,
          startSessionId: matchingSession.id,
          endSessionId: matchingSession.id,
          sks: 1,
          lecturerIds: schedule.lecturerId ? [schedule.lecturerId] : [],
          programStudy: schedule.programStudy || 'Belum diisi',
          cohort: schedule.cohort || schedule.className || 'Belum diisi'
        };
      }).filter(Boolean)
    });
    if (!migrated.rooms.length) migrated.rooms = defaultRooms();
    return migrated;
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function onAddLecturer(event) {
    event.preventDefault();
    const name = normalizeText(els.lecturerName.value);
    const code = normalizeText(els.lecturerCode.value);
    if (!name) return;

    const duplicate = data.lecturers.some((item) => item.name.toLocaleLowerCase('id') === name.toLocaleLowerCase('id'));
    if (duplicate) {
      showToast('Nama dosen tersebut sudah ada. Gunakan nama yang berbeda.', 'error');
      els.lecturerName.focus();
      return;
    }

    data.lecturers.push({ id: uid('lecturer'), name, code });
    saveData();
    els.lecturerForm.reset();
    renderAll();
    showToast('Dosen berhasil ditambahkan.', 'success');
  }

  function onAddRoom(event) {
    event.preventDefault();
    const name = normalizeText(els.roomName.value);
    const capacity = normalizeText(els.roomCapacity.value);
    if (!name) return;

    const duplicate = data.rooms.some((item) => item.name.toLocaleLowerCase('id') === name.toLocaleLowerCase('id'));
    if (duplicate) {
      showToast('Nama ruang tersebut sudah ada. Gunakan nama yang berbeda.', 'error');
      els.roomName.focus();
      return;
    }

    data.rooms.push({ id: uid('room'), name, capacity });
    saveData();
    els.roomForm.reset();
    renderAll();
    showToast('Ruang berhasil ditambahkan.', 'success');
  }

  async function removeLecturer(id) {
    const lecturer = data.lecturers.find((item) => item.id === id);
    if (!lecturer) return;

    const used = data.schedules.filter((schedule) => schedule.lecturerIds.includes(id));
    if (used.length) {
      showToast(`Dosen masih digunakan pada ${used.length} jadwal. Hapus atau ubah jadwalnya terlebih dahulu.`, 'error');
      return;
    }

    const ok = await askConfirm('Hapus Dosen', `Hapus ${lecturer.name} dari data dosen?`);
    if (!ok) return;
    data.lecturers = data.lecturers.filter((item) => item.id !== id);
    draftLecturerIds.delete(id);
    saveData();
    renderAll();
    showToast('Dosen berhasil dihapus.', 'success');
  }

  async function removeRoom(id) {
    const room = data.rooms.find((item) => item.id === id);
    if (!room) return;

    const used = data.schedules.filter((schedule) => schedule.roomId === id);
    if (used.length) {
      showToast(`Ruang masih digunakan pada ${used.length} jadwal. Hapus atau ubah jadwalnya terlebih dahulu.`, 'error');
      return;
    }

    const ok = await askConfirm('Hapus Ruang', `Hapus ${room.name} dari data ruang?`);
    if (!ok) return;
    data.rooms = data.rooms.filter((item) => item.id !== id);
    saveData();
    renderAll();
    showToast('Ruang berhasil dihapus.', 'success');
  }

  function getSelectedLecturerIds() {
    return [...draftLecturerIds];
  }

  function getScheduleFormValue() {
    const selectedSessions = sessionsForRange(els.daySelect.value, els.sessionSelect.value, els.endSessionSelect.value);
    return {
      id: els.scheduleId.value || uid('schedule'),
      courseCode: normalizeText(els.courseCode.value),
      courseName: normalizeText(els.courseName.value),
      courseNameEn: normalizeText(els.courseNameEn.value),
      programStudy: normalizeText(els.programStudy.value),
      cohort: normalizeText(els.cohort.value),
      day: els.daySelect.value,
      startSessionId: els.sessionSelect.value,
      endSessionId: els.endSessionSelect.value,
      sks: selectedSessions.length || Number.parseInt(els.sksSelect.value, 10) || 0,
      roomId: els.roomSelect.value,
      lecturerIds: getSelectedLecturerIds(),
      notes: normalizeText(els.notes.value),
      createdAt: new Date().toISOString()
    };
  }

  function validateSchedule(candidate, ignoreId = '') {
    const errors = [];
    if (!candidate.courseCode) errors.push('Kode mata kuliah wajib diisi.');
    if (!candidate.courseName) errors.push('Nama mata kuliah wajib diisi.');
    if (!candidate.programStudy) errors.push('Program studi wajib diisi.');
    else if (!PROGRAM_STUDIES.includes(candidate.programStudy)) errors.push('Pilih program studi dari daftar yang tersedia.');
    if (!candidate.cohort) errors.push('Angkatan wajib diisi.');
    else if (!/^\d{4}$/.test(candidate.cohort) || Number(candidate.cohort) < COHORT_START_YEAR) errors.push(`Angkatan harus tahun ${COHORT_START_YEAR} atau setelahnya.`);
    if (!['Jumat', 'Sabtu'].includes(candidate.day)) errors.push('Pilih hari Jumat atau Sabtu.');

    const candidateSessions = sessionsForRange(candidate.day, candidate.startSessionId, candidate.endSessionId);
    if (!candidate.startSessionId || !sessionById(candidate.day, candidate.startSessionId)) errors.push('Pilih sesi mulai yang tersedia.');
    if (!candidate.endSessionId || !sessionById(candidate.day, candidate.endSessionId)) errors.push('Pilih sesi selesai yang tersedia.');
    if (candidate.startSessionId && candidate.endSessionId && !candidateSessions.length) errors.push('Sesi selesai harus sama dengan atau setelah sesi mulai.');
    if (candidateSessions.length && candidate.sks !== candidateSessions.length) errors.push('Jumlah SKS harus sesuai dengan jumlah sesi. 1 SKS = 1 sesi = 50 menit.');
    if (!candidate.roomId || !data.rooms.some((room) => room.id === candidate.roomId)) errors.push('Pilih ruang yang tersedia.');
    if (!candidate.lecturerIds.length) errors.push('Pilih minimal satu dosen pengampu.');
    if (candidate.lecturerIds.some((id) => !data.lecturers.some((lecturer) => lecturer.id === id))) errors.push('Terdapat dosen yang sudah tidak tersedia.');

    if (!candidateSessions.length) return { errors, conflicts: [] };

    const candidateSessionIds = new Set(candidateSessions.map((session) => session.id));
    const conflicts = [];
    for (const existing of data.schedules) {
      if (existing.id === ignoreId || existing.day !== candidate.day) continue;
      const existingSessions = scheduleSessions(existing);
      const overlappingSessions = existingSessions.filter((session) => candidateSessionIds.has(session.id));
      if (!overlappingSessions.length) continue;

      if (existing.roomId === candidate.roomId) {
        conflicts.push({ type: 'room', schedule: existing, roomId: candidate.roomId, overlappingSessions });
      }

      const lecturerClashes = candidate.lecturerIds.filter((id) => existing.lecturerIds.includes(id));
      lecturerClashes.forEach((lecturerId) => conflicts.push({ type: 'lecturer', schedule: existing, lecturerId, overlappingSessions }));
    }

    return { errors, conflicts };
  }

  function onSaveSchedule(event) {
    event.preventDefault();
    const candidate = getScheduleFormValue();
    const editingId = els.scheduleId.value;
    const validation = validateSchedule(candidate, editingId);

    if (validation.errors.length || validation.conflicts.length) {
      showConflict(validation);
      showToast('Jadwal belum dapat disimpan. Periksa pesan validasi.', 'error');
      return;
    }

    if (editingId) {
      const index = data.schedules.findIndex((item) => item.id === editingId);
      if (index >= 0) candidate.createdAt = data.schedules[index].createdAt || candidate.createdAt;
      if (index >= 0) data.schedules[index] = candidate;
    } else {
      data.schedules.push(candidate);
    }

    saveData();
    resetScheduleForm();
    renderAll();
    showToast(editingId ? 'Perubahan jadwal berhasil disimpan.' : 'Jadwal berhasil ditambahkan.', 'success');
  }

  function showConflict(validation) {
    const lines = [];
    validation.errors.forEach((message) => lines.push(`<li>${escapeHtml(message)}</li>`));

    const seen = new Set();
    validation.conflicts.forEach((conflict) => {
      const schedule = conflict.schedule;
      const rangeText = `${scheduleTimeLabel(schedule)} (${schedule.sks} SKS)`;
      if (conflict.type === 'room') {
        const room = data.rooms.find((item) => item.id === conflict.roomId);
        const key = `room-${schedule.id}-${conflict.roomId}`;
        if (!seen.has(key)) {
          lines.push(`<li><b>Bentrok ruang:</b> ${escapeHtml(room?.name || 'Ruang')} sudah dipakai oleh <b>${escapeHtml(schedule.courseName)}</b> pada ${escapeHtml(rangeText)}.</li>`);
          seen.add(key);
        }
      } else {
        const lecturer = data.lecturers.find((item) => item.id === conflict.lecturerId);
        const key = `lecturer-${schedule.id}-${conflict.lecturerId}`;
        if (!seen.has(key)) {
          lines.push(`<li><b>Bentrok dosen:</b> ${escapeHtml(lecturer?.name || 'Dosen')} sudah mengajar <b>${escapeHtml(schedule.courseName)}</b> pada ${escapeHtml(rangeText)}.</li>`);
          seen.add(key);
        }
      }
    });

    if (!lines.length) {
      els.conflictBox.classList.add('hidden');
      els.conflictBox.innerHTML = '';
      return;
    }

    els.conflictBox.innerHTML = `<strong>Jadwal belum dapat disimpan:</strong><ul>${lines.join('')}</ul>`;
    els.conflictBox.classList.remove('hidden');
  }

  function previewConflict() {
    if (!els.daySelect.value || !els.sessionSelect.value || !els.endSessionSelect.value) {
      els.conflictBox.classList.add('hidden');
      return;
    }
    const candidate = getScheduleFormValue();
    const validation = validateSchedule(candidate, els.scheduleId.value);
    const relevant = { errors: [], conflicts: validation.conflicts };
    showConflict(relevant);
  }

  function editSchedule(id) {
    const schedule = data.schedules.find((item) => item.id === id);
    if (!schedule) return;

    els.scheduleId.value = schedule.id;
    els.courseCode.value = schedule.courseCode || '';
    els.courseName.value = schedule.courseName;
    els.courseNameEn.value = schedule.courseNameEn || '';
    els.programStudy.value = PROGRAM_STUDIES.includes(schedule.programStudy) ? schedule.programStudy : '';
    renderCohortOptions(schedule.cohort);
    els.cohort.value = schedule.cohort;
    els.daySelect.value = schedule.day;
    renderSessionOptions();
    els.sessionSelect.value = schedule.startSessionId;
    renderDurationOptions();
    els.endSessionSelect.value = schedule.endSessionId;
    els.sksSelect.value = String(schedule.sks);
    els.roomSelect.value = schedule.roomId;
    els.notes.value = schedule.notes || '';
    els.lecturerSearch.value = '';
    renderLecturerChoices(schedule.lecturerIds);
    els.scheduleFormTitle.textContent = 'Edit Jadwal Perkuliahan';
    els.btnSaveSchedule.textContent = 'Simpan Perubahan';
    els.btnCancelEdit.classList.remove('hidden');
    els.conflictBox.classList.add('hidden');
    activateTab('schedule');
    els.courseName.focus();
  }

  async function removeSchedule(id) {
    const schedule = data.schedules.find((item) => item.id === id);
    if (!schedule) return;
    const ok = await askConfirm('Hapus Jadwal', `Hapus jadwal ${schedule.courseName} (${schedule.day})?`);
    if (!ok) return;
    data.schedules = data.schedules.filter((item) => item.id !== id);
    saveData();
    if (els.scheduleId.value === id) resetScheduleForm();
    renderAll();
    showToast('Jadwal berhasil dihapus.', 'success');
  }

  function resetScheduleForm() {
    els.scheduleForm.reset();
    els.scheduleId.value = '';
    els.scheduleFormTitle.textContent = 'Tambah Jadwal Perkuliahan';
    els.btnSaveSchedule.textContent = 'Simpan Jadwal';
    els.btnCancelEdit.classList.add('hidden');
    els.conflictBox.classList.add('hidden');
    els.conflictBox.innerHTML = '';
    els.lecturerSearch.value = '';
    draftLecturerIds.clear();
    renderCohortOptions();
    els.cohort.value = '';
    renderSessionOptions();
    renderLecturerChoices();
    renderRoomOptions();
  }

  function renderAll() {
    renderStats();
    renderLecturerList();
    renderRoomList();
    renderRoomOptions();
    renderSessionOptions(true);
    renderLecturerChoices(getSelectedLecturerIds());
    renderScheduleList();
    renderDetailLecturerOptions();
    renderLecturerDetail();
    renderPlot();
    renderCohortOptions(els.cohort.value);
    renderPdfPanel();
  }

  function renderStats() {
    els.statLecturers.textContent = data.lecturers.length;
    els.statRooms.textContent = data.rooms.length;
    els.statSchedules.textContent = data.schedules.length;
    const sessionKeys = new Set();
    data.schedules.forEach((schedule) => {
      scheduleSessions(schedule).forEach((session) => sessionKeys.add(`${schedule.day}|${session.id}`));
    });
    els.statFilledSessions.textContent = sessionKeys.size;
  }

  function renderLecturerList() {
    const lecturers = sortLecturers(data.lecturers);
    if (!lecturers.length) {
      els.lecturerList.innerHTML = '<div class="empty-state"><strong>Belum ada dosen.</strong>Tambahkan dosen agar dapat dipilih pada jadwal.</div>';
      return;
    }

    els.lecturerList.innerHTML = lecturers.map((lecturer) => {
      const count = data.schedules.filter((schedule) => schedule.lecturerIds.includes(lecturer.id)).length;
      return `
        <div class="master-item">
          <div>
            <div class="master-item-name">${escapeHtml(lecturer.name)}</div>
            <small>${escapeHtml(lecturer.code || 'NIDN/Kode belum diisi')} • ${count} jadwal</small>
          </div>
          <div class="master-actions">
            <button class="icon-btn" type="button" data-detail-lecturer="${escapeHtml(lecturer.id)}">Detail</button>
            <button class="icon-btn danger" type="button" data-remove-lecturer="${escapeHtml(lecturer.id)}">Hapus</button>
          </div>
        </div>`;
    }).join('');

    els.lecturerList.querySelectorAll('[data-remove-lecturer]').forEach((button) => {
      button.addEventListener('click', () => removeLecturer(button.dataset.removeLecturer));
    });
    els.lecturerList.querySelectorAll('[data-detail-lecturer]').forEach((button) => {
      button.addEventListener('click', () => {
        activateTab('lecturer-detail');
        els.detailLecturerSelect.value = button.dataset.detailLecturer;
        renderLecturerDetail();
      });
    });
  }

  function renderRoomList() {
    const rooms = sortRooms(data.rooms);
    if (!rooms.length) {
      els.roomList.innerHTML = '<div class="empty-state"><strong>Belum ada ruang.</strong>Tambahkan ruang sebelum membuat jadwal.</div>';
      return;
    }

    els.roomList.innerHTML = rooms.map((room) => {
      const count = data.schedules.filter((schedule) => schedule.roomId === room.id).length;
      return `
        <div class="master-item">
          <div>
            <div class="master-item-name">${escapeHtml(room.name)}</div>
            <small>${room.capacity ? `Kapasitas ${escapeHtml(room.capacity)} • ` : ''}${count} jadwal</small>
          </div>
          <button class="icon-btn danger" type="button" data-remove-room="${escapeHtml(room.id)}">Hapus</button>
        </div>`;
    }).join('');

    els.roomList.querySelectorAll('[data-remove-room]').forEach((button) => {
      button.addEventListener('click', () => removeRoom(button.dataset.removeRoom));
    });
  }

  function renderRoomOptions() {
    const current = els.roomSelect.value;
    const rooms = sortRooms(data.rooms);
    els.roomSelect.innerHTML = '<option value="">Pilih ruang</option>' + rooms.map((room) => `<option value="${escapeHtml(room.id)}">${escapeHtml(room.name)}</option>`).join('');
    if (rooms.some((room) => room.id === current)) els.roomSelect.value = current;
  }

  function renderSessionOptions(preserve = false) {
    const day = els.daySelect.value;
    const currentStart = preserve ? els.sessionSelect.value : '';
    const currentEnd = preserve ? els.endSessionSelect.value : '';
    const currentSks = preserve ? els.sksSelect.value : '';

    if (!day || !SESSIONS[day]) {
      els.sessionSelect.disabled = true;
      els.sessionSelect.innerHTML = '<option value="">Pilih hari terlebih dahulu</option>';
      resetDurationOptions();
      return;
    }

    els.sessionSelect.disabled = false;
    els.sessionSelect.innerHTML = '<option value="">Pilih sesi mulai</option>' + SESSIONS[day]
      .map((session, index) => `<option value="${session.id}">Sesi ${index + 1} • ${displayTime(session.start, session.end)}</option>`)
      .join('');

    if (currentStart && sessionById(day, currentStart)) {
      els.sessionSelect.value = currentStart;
      renderDurationOptions(currentEnd, currentSks);
    } else {
      resetDurationOptions();
    }
  }

  function resetDurationOptions() {
    els.endSessionSelect.disabled = true;
    els.endSessionSelect.innerHTML = '<option value="">Pilih sesi mulai terlebih dahulu</option>';
    els.sksSelect.disabled = true;
    els.sksSelect.innerHTML = '<option value="">Pilih sesi mulai terlebih dahulu</option>';
  }

  function renderDurationOptions(preferredEnd = '', preferredSks = '') {
    const day = els.daySelect.value;
    const startId = els.sessionSelect.value;
    const sessions = SESSIONS[day] || [];
    const startIndex = sessionIndex(day, startId);

    if (startIndex < 0) {
      resetDurationOptions();
      return;
    }

    const available = sessions.slice(startIndex);
    els.endSessionSelect.disabled = false;
    els.sksSelect.disabled = false;

    els.endSessionSelect.innerHTML = available.map((session, offset) => {
      const sks = offset + 1;
      return `<option value="${session.id}">Sesi ${startIndex + offset + 1} • selesai ${session.end.replace(':', '.')} • ${sks} SKS</option>`;
    }).join('');

    els.sksSelect.innerHTML = available.map((_, offset) => {
      const sks = offset + 1;
      return `<option value="${sks}">${sks} SKS • ${sks * 50} menit • ${sks} sesi</option>`;
    }).join('');

    const preferredEndIndex = sessionIndex(day, preferredEnd);
    if (preferredEnd && preferredEndIndex >= startIndex) {
      els.endSessionSelect.value = preferredEnd;
      syncSksFromEndSession();
      return;
    }

    const numericSks = Number.parseInt(preferredSks, 10);
    if (numericSks >= 1 && numericSks <= available.length) {
      els.sksSelect.value = String(numericSks);
      syncEndSessionFromSks();
      return;
    }

    els.endSessionSelect.value = startId;
    els.sksSelect.value = '1';
  }

  function syncSksFromEndSession() {
    const day = els.daySelect.value;
    const startIndex = sessionIndex(day, els.sessionSelect.value);
    const endIndex = sessionIndex(day, els.endSessionSelect.value);
    if (startIndex < 0 || endIndex < startIndex) return;
    els.sksSelect.value = String(endIndex - startIndex + 1);
  }

  function syncEndSessionFromSks() {
    const day = els.daySelect.value;
    const sessions = SESSIONS[day] || [];
    const startIndex = sessionIndex(day, els.sessionSelect.value);
    const sks = Number.parseInt(els.sksSelect.value, 10);
    if (startIndex < 0 || !Number.isInteger(sks) || sks < 1) return;
    const endIndex = startIndex + sks - 1;
    if (!sessions[endIndex]) return;
    els.endSessionSelect.value = sessions[endIndex].id;
  }

  function renderLecturerChoices(forceSelectedIds = null) {
    if (forceSelectedIds !== null) draftLecturerIds = new Set(forceSelectedIds);
    const selected = draftLecturerIds;
    const search = normalizeText(els.lecturerSearch.value).toLocaleLowerCase('id');
    const lecturers = sortLecturers(data.lecturers).filter((lecturer) => {
      return !search || lecturer.name.toLocaleLowerCase('id').includes(search) || lecturer.code.toLocaleLowerCase('id').includes(search);
    });

    if (!data.lecturers.length) {
      els.lecturerChoices.innerHTML = '<div class="empty-state"><strong>Data dosen masih kosong.</strong>Tambahkan dosen pada menu Data Dosen & Ruang.</div>';
      return;
    }
    if (!lecturers.length) {
      els.lecturerChoices.innerHTML = '<div class="empty-state">Nama dosen tidak ditemukan.</div>';
      return;
    }

    els.lecturerChoices.innerHTML = lecturers.map((lecturer) => `
      <label class="lecturer-choice">
        <input type="checkbox" name="lecturerIds" value="${escapeHtml(lecturer.id)}" ${selected.has(lecturer.id) ? 'checked' : ''} />
        <span>${escapeHtml(lecturer.name)}<small>${escapeHtml(lecturer.code || 'Tanpa NIDN/Kode')}</small></span>
      </label>`).join('');
  }

  function scheduleSortValue(schedule) {
    const dayOrder = schedule.day === 'Jumat' ? 0 : 1;
    const session = sessionById(schedule.day, schedule.startSessionId);
    return dayOrder * 10000 + (session ? timeToMinutes(session.start) : 9999);
  }

  function renderScheduleList() {
    const filter = els.filterDay.value || 'Semua';
    const list = [...data.schedules]
      .filter((schedule) => filter === 'Semua' || schedule.day === filter)
      .sort((a, b) => scheduleSortValue(a) - scheduleSortValue(b) || a.courseName.localeCompare(b.courseName, 'id'));

    if (!list.length) {
      els.scheduleList.innerHTML = '<div class="empty-state"><strong>Belum ada jadwal pada pilihan ini.</strong>Isi formulir di sebelah kiri untuk mulai membuat plotting.</div>';
      return;
    }

    els.scheduleList.innerHTML = list.map((schedule) => {
      const room = data.rooms.find((item) => item.id === schedule.roomId);
      const lecturers = schedule.lecturerIds.map((id) => data.lecturers.find((item) => item.id === id)?.name).filter(Boolean);
      return `
        <article class="schedule-item">
          <div>
            <h3 class="schedule-title">${schedule.courseCode ? `<span class="course-code-inline">${escapeHtml(schedule.courseCode)}</span> ` : ``}${escapeHtml(schedule.courseName)}</h3>
            <div class="schedule-subtitle">${escapeHtml(schedule.programStudy)} • Angkatan ${escapeHtml(schedule.cohort)}${schedule.courseNameEn ? ` • ${escapeHtml(schedule.courseNameEn)}` : ``}</div>
            <div class="schedule-meta">
              <span class="meta-pill primary">${escapeHtml(schedule.day)}</span>
              <span class="meta-pill">${escapeHtml(scheduleTimeLabel(schedule))}</span>
              <span class="meta-pill">${schedule.sks} SKS • ${schedule.sks * 50} menit efektif</span>
              <span class="meta-pill">${escapeHtml(room?.name || 'Ruang tidak ditemukan')}</span>
            </div>
            <div class="lecturer-line"><b>Dosen:</b> ${lecturers.length ? lecturers.map(escapeHtml).join('; ') : 'Dosen tidak ditemukan'}</div>
            ${schedule.notes ? `<div class="schedule-notes">Catatan: ${escapeHtml(schedule.notes)}</div>` : ''}
          </div>
          <div class="schedule-actions">
            <button class="icon-btn" type="button" data-edit-schedule="${escapeHtml(schedule.id)}">Edit</button>
            <button class="icon-btn danger" type="button" data-remove-schedule="${escapeHtml(schedule.id)}">Hapus</button>
          </div>
        </article>`;
    }).join('');

    els.scheduleList.querySelectorAll('[data-edit-schedule]').forEach((button) => {
      button.addEventListener('click', () => editSchedule(button.dataset.editSchedule));
    });
    els.scheduleList.querySelectorAll('[data-remove-schedule]').forEach((button) => {
      button.addEventListener('click', () => removeSchedule(button.dataset.removeSchedule));
    });
  }

  function renderDetailLecturerOptions() {
    const current = els.detailLecturerSelect.value;
    const lecturers = sortLecturers(data.lecturers);
    els.detailLecturerSelect.innerHTML = lecturers.length
      ? lecturers.map((lecturer) => `<option value="${escapeHtml(lecturer.id)}">${escapeHtml(lecturer.name)}</option>`).join('')
      : '<option value="">Belum ada dosen</option>';

    if (lecturers.some((lecturer) => lecturer.id === current)) {
      els.detailLecturerSelect.value = current;
    }
  }

  function renderLecturerDetail() {
    const lecturerId = els.detailLecturerSelect.value;
    const lecturer = data.lecturers.find((item) => item.id === lecturerId);
    if (!lecturer) {
      els.lecturerDetailSummary.innerHTML = '';
      els.lecturerDetailList.innerHTML = '<div class="empty-state"><strong>Belum ada data dosen.</strong>Tambahkan dosen terlebih dahulu pada menu Data Dosen & Ruang.</div>';
      return;
    }

    const schedules = data.schedules
      .filter((schedule) => schedule.lecturerIds.includes(lecturerId))
      .sort((a, b) => scheduleSortValue(a) - scheduleSortValue(b));
    const courses = new Set(schedules.map((schedule) => schedule.courseName.toLocaleLowerCase('id'))).size;
    const programs = new Set(schedules.map((schedule) => schedule.programStudy.toLocaleLowerCase('id'))).size;

    els.lecturerDetailSummary.innerHTML = `
      <div class="summary-box"><span>Total Jadwal</span><strong>${schedules.length}</strong></div>
      <div class="summary-box"><span>Mata Kuliah</span><strong>${courses}</strong></div>
      <div class="summary-box"><span>Program Studi</span><strong>${programs}</strong></div>`;

    if (!schedules.length) {
      els.lecturerDetailList.innerHTML = `<div class="empty-state"><strong>${escapeHtml(lecturer.name)} belum memiliki jadwal.</strong>Jadwal yang melibatkan dosen ini akan tampil di sini.</div>`;
      return;
    }

    els.lecturerDetailList.innerHTML = schedules.map((schedule) => {
      const room = data.rooms.find((item) => item.id === schedule.roomId);
      return `
        <div class="detail-item">
          <div class="detail-item-top">
            <div>
              <div class="detail-course">${schedule.courseCode ? `${escapeHtml(schedule.courseCode)} • ` : ``}${escapeHtml(schedule.courseName)}</div>
              <div class="detail-program">${escapeHtml(schedule.programStudy)} • Angkatan ${escapeHtml(schedule.cohort)}</div>
            </div>
            <span class="meta-pill primary">${escapeHtml(schedule.day)}</span>
          </div>
          <div class="detail-meta">
            <span class="meta-pill">${escapeHtml(scheduleTimeLabel(schedule))}</span>
            <span class="meta-pill">${schedule.sks} SKS • ${schedule.sks * 50} menit efektif</span>
            <span class="meta-pill">${escapeHtml(room?.name || 'Ruang tidak ditemukan')}</span>
          </div>
        </div>`;
    }).join('');
  }

  function renderPlot() {
    const rooms = sortRooms(data.rooms);
    if (!rooms.length) {
      els.plotTables.innerHTML = '<div class="empty-state"><strong>Belum ada data ruang.</strong>Tambahkan minimal satu ruang untuk menampilkan plot.</div>';
      return;
    }

    els.plotTables.innerHTML = ['Jumat', 'Sabtu'].map((day) => buildPlotTable(day, rooms)).join('');
  }

  function buildPlotTable(day, rooms) {
    const header = rooms.map((room) => `<th>${escapeHtml(room.name)}</th>`).join('');
    const rows = [];

    SESSIONS[day].forEach((session, index) => {
      if (day === 'Sabtu' && index === 5) {
        rows.push(`<tr class="break-row"><td colspan="${rooms.length + 1}">ISTIRAHAT 18.10 – 18.30</td></tr>`);
      }

      const cells = rooms.map((room) => {
        const schedules = data.schedules.filter((schedule) => schedule.day === day && scheduleCoversSession(schedule, session.id) && schedule.roomId === room.id);
        if (!schedules.length) return '<td></td>';
        return `<td class="occupied">${schedules.map((schedule) => buildPlotEntry(schedule)).join('')}</td>`;
      }).join('');

      rows.push(`<tr><td class="time-col">${escapeHtml(displayTime(session.start, session.end))}</td>${cells}</tr>`);
    });

    return `
      <section class="plot-section">
        <div class="plot-section-title">
          <h3>${day.toUpperCase()}</h3>
          <span>${SESSIONS[day].length} sesi perkuliahan</span>
        </div>
        <div class="table-scroll">
          <table class="plot-table">
            <thead><tr><th class="time-col">${day.toUpperCase()}</th>${header}</tr></thead>
            <tbody>${rows.join('')}</tbody>
          </table>
        </div>
      </section>`;
  }

  function buildPlotEntry(schedule) {
    const lecturers = schedule.lecturerIds
      .map((id) => data.lecturers.find((item) => item.id === id)?.name)
      .filter(Boolean);
    return `
      <div class="plot-entry">
        <div class="plot-course">${schedule.courseCode ? `${escapeHtml(schedule.courseCode)} • ` : ``}${escapeHtml(schedule.courseName)}</div>
        <div class="plot-class">${escapeHtml(schedule.programStudy)} • Angkatan ${escapeHtml(schedule.cohort)} • ${schedule.sks} SKS</div>
        <div class="plot-lecturers">${lecturers.map((name, index) => `${index + 1}. ${escapeHtml(name)}`).join('<br>')}</div>
      </div>`;
  }

  function renderCohortOptions(preferredValue = '') {
    const currentYear = new Date().getFullYear();
    const latestStoredYear = Math.max(
      COHORT_START_YEAR,
      ...data.schedules
        .map((schedule) => Number.parseInt(schedule.cohort, 10))
        .filter((year) => Number.isInteger(year) && year >= COHORT_START_YEAR)
    );
    const selectedYear = Number.parseInt(preferredValue || els.cohort?.value, 10);
    const endYear = Math.max(currentYear + COHORT_FUTURE_YEARS, latestStoredYear, Number.isInteger(selectedYear) ? selectedYear : COHORT_START_YEAR);
    const currentValue = preferredValue || els.cohort?.value || '';
    const options = ['<option value="">Pilih angkatan</option>'];
    for (let year = COHORT_START_YEAR; year <= endYear; year += 1) {
      options.push(`<option value="${year}">${year}</option>`);
    }
    els.cohort.innerHTML = options.join('');
    if (currentValue && Number(currentValue) >= COHORT_START_YEAR) els.cohort.value = String(currentValue);
  }

  function savePdfSettings(event) {
    event.preventDefault();
    const institution = normalizeText(els.pdfInstitution.value);
    const semester = normalizeText(els.pdfSemester.value);
    const academicYear = normalizeText(els.pdfAcademicYear.value);
    if (!institution || !semester || !academicYear) {
      showToast('Lengkapi identitas PDF terlebih dahulu.', 'error');
      return;
    }
    data.pdfSettings = { institution, semester, academicYear };
    saveData();
    renderPdfPanel();
    showToast('Identitas PDF berhasil disimpan.', 'success');
  }

  function renderPdfPanel() {
    if (!els.pdfProgramList || !els.pdfSettingsForm) return;
    const settings = data.pdfSettings || defaultPdfSettings();
    els.pdfInstitution.value = settings.institution;
    els.pdfSemester.value = settings.semester;
    els.pdfAcademicYear.value = settings.academicYear;

    const groups = new Map();
    data.schedules.forEach((schedule) => {
      const name = normalizeText(schedule.programStudy);
      if (!name) return;
      const key = name.toLocaleLowerCase('id');
      if (!groups.has(key)) groups.set(key, { name, schedules: [] });
      groups.get(key).schedules.push(schedule);
    });
    const programs = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
    if (!programs.length) {
      els.pdfProgramList.innerHTML = '<div class="empty-state"><strong>Belum ada program studi yang dapat diekspor.</strong>Tambahkan jadwal terlebih dahulu pada menu Buat Jadwal.</div>';
      return;
    }

    els.pdfProgramList.innerHTML = programs.map((group) => {
      const missingCode = group.schedules.filter((schedule) => !schedule.courseCode).length;
      const totalSks = group.schedules.reduce((sum, schedule) => sum + (Number(schedule.sks) || 0), 0);
      return `<div class="pdf-program-item">
        <div>
          <div class="pdf-program-name">${escapeHtml(group.name)}</div>
          <div class="pdf-program-meta">${group.schedules.length} mata kuliah • ${totalSks} SKS${missingCode ? ` • <span class="warning-text">${missingCode} kode mata kuliah belum diisi</span>` : ''}</div>
        </div>
        <button class="btn btn-primary btn-small" type="button" data-pdf-program="${escapeHtml(group.name)}">Unduh PDF</button>
      </div>`;
    }).join('');
  }

  function pdfTimeLabel(schedule) {
    const sessions = scheduleSessions(schedule);
    if (!sessions.length) return '-';
    return `${sessions[0].start.replace(':', '.')}-${sessions[sessions.length - 1].end.replace(':', '.')} WIB`;
  }

  function downloadProgramPdf(programStudy) {
    if (!globalThis.SchedulePdf || typeof globalThis.SchedulePdf.buildPdf !== 'function') {
      showToast('Modul pembuat PDF tidak dapat dimuat.', 'error');
      return;
    }
    const schedules = data.schedules
      .filter((schedule) => schedule.programStudy.toLocaleLowerCase('id') === String(programStudy).toLocaleLowerCase('id'))
      .sort((a, b) => scheduleSortValue(a) - scheduleSortValue(b) || a.courseName.localeCompare(b.courseName, 'id'));
    if (!schedules.length) {
      showToast('Jadwal untuk program studi tersebut belum tersedia.', 'error');
      return;
    }

    const rows = schedules.map((schedule) => {
      const room = data.rooms.find((item) => item.id === schedule.roomId);
      const lecturers = schedule.lecturerIds
        .map((id) => data.lecturers.find((item) => item.id === id)?.name)
        .filter(Boolean);
      return {
        day: schedule.day,
        time: pdfTimeLabel(schedule),
        courseCode: schedule.courseCode || '-',
        courseName: schedule.courseName,
        courseNameEn: schedule.courseNameEn || '',
        sks: schedule.sks,
        lecturers,
        room: room?.name || '-'
      };
    });

    try {
      const bytes = globalThis.SchedulePdf.buildPdf({
        programStudy,
        settings: data.pdfSettings || defaultPdfSettings(),
        schedules: rows
      });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const academic = (data.pdfSettings?.academicYear || '').replace(/[^0-9A-Za-z]+/g, '-').replace(/^-+|-+$/g, '');
      const safeProgram = globalThis.SchedulePdf.safeFilename(programStudy);
      a.href = url;
      a.download = `jadwal-${safeProgram}${academic ? `-${academic}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`PDF ${programStudy} berhasil diunduh.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('PDF gagal dibuat. Periksa data jadwal lalu coba lagi.', 'error');
    }
  }

  function exportData() {
    const payload = {
      app: 'Plotting Jadwal Jumat Sabtu',
      version: DATA_VERSION,
      exportedAt: new Date().toISOString(),
      data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    a.href = url;
    a.download = `backup-jadwal-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Backup data berhasil diunduh.', 'success');
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const candidate = parsed?.data || parsed;
      if (!candidate || !Array.isArray(candidate.lecturers) || !Array.isArray(candidate.rooms) || !Array.isArray(candidate.schedules)) {
        throw new Error('Format file tidak dikenali.');
      }
      const ok = await askConfirm('Impor Backup', 'Data saat ini akan diganti dengan isi file backup. Lanjutkan?');
      if (!ok) return;
      data = sanitizeData(candidate);
      saveData();
      resetScheduleForm();
      renderAll();
      showToast('Backup berhasil dipulihkan.', 'success');
    } catch (error) {
      console.error(error);
      showToast('File backup tidak valid atau tidak dapat dibaca.', 'error');
    } finally {
      event.target.value = '';
    }
  }

  async function resetAllData() {
    const ok = await askConfirm('Hapus Semua Data Jadwal', 'Semua jadwal akan dihapus. Data dosen dan ruang tetap dipertahankan. Lanjutkan?');
    if (!ok) return;
    data.schedules = [];
    saveData();
    resetScheduleForm();
    renderAll();
    showToast('Semua data jadwal berhasil dihapus.', 'success');
  }

  function printPlot() {
    renderPlot();
    activateTab('plot');
    setTimeout(() => window.print(), 120);
  }

  function showToast(message, type = '') {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.className = `toast show ${type}`.trim();
    toastTimer = setTimeout(() => { els.toast.className = 'toast'; }, 3200);
  }

  function askConfirm(title, message) {
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    els.confirmModal.classList.remove('hidden');
    els.confirmOk.focus();
    return new Promise((resolve) => { confirmResolver = resolve; });
  }

  function closeConfirm(result) {
    els.confirmModal.classList.add('hidden');
    if (confirmResolver) confirmResolver(result);
    confirmResolver = null;
  }
})();
