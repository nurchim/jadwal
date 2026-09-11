(() => {
  'use strict';

  const STORAGE_KEY = 'plottingJadwalKuliah_v1';
  const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const emptyData = () => ({ lecturers: [], rooms: [], schedules: [] });
  let data = loadData();
  let toastTimer;

  const $ = (id) => document.getElementById(id);
  const els = {
    lecturerForm: $('lecturerForm'), lecturerName: $('lecturerName'), lecturerCode: $('lecturerCode'), lecturerList: $('lecturerList'),
    roomForm: $('roomForm'), roomName: $('roomName'), roomCapacity: $('roomCapacity'), roomList: $('roomList'),
    scheduleForm: $('scheduleForm'), scheduleId: $('scheduleId'), courseName: $('courseName'), className: $('className'),
    lecturerSelect: $('lecturerSelect'), roomSelect: $('roomSelect'), daySelect: $('daySelect'), startTime: $('startTime'), endTime: $('endTime'), notes: $('notes'),
    conflictBox: $('conflictBox'), btnSaveSchedule: $('btnSaveSchedule'), btnCancelEdit: $('btnCancelEdit'), scheduleFormTitle: $('scheduleFormTitle'),
    scheduleList: $('scheduleList'), filterDay: $('filterDay'), weeklyPlot: $('weeklyPlot'),
    statLecturers: $('statLecturers'), statRooms: $('statRooms'), statSchedules: $('statSchedules'), statDays: $('statDays'),
    btnPrint: $('btnPrint'), btnPrintPlot: $('btnPrintPlot'), btnExport: $('btnExport'), btnExportLarge: $('btnExportLarge'), importFile: $('importFile'), btnReset: $('btnReset'),
    toast: $('toast')
  };

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyData();
      const parsed = JSON.parse(raw);
      return normalizeData(parsed);
    } catch (_) {
      return emptyData();
    }
  }

  function normalizeData(value) {
    return {
      lecturers: Array.isArray(value?.lecturers) ? value.lecturers : [],
      rooms: Array.isArray(value?.rooms) ? value.rooms : [],
      schedules: Array.isArray(value?.schedules) ? value.schedules : []
    };
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    renderAll();
  }

  function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.className = `toast show ${type}`;
    toastTimer = setTimeout(() => { els.toast.className = 'toast'; }, 2800);
  }

  function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === tabName));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${tabName}`));
  }

  function renderAll() {
    renderStats();
    renderMasterLists();
    renderSelects();
    renderSchedules();
    renderWeeklyPlot();
  }

  function renderStats() {
    els.statLecturers.textContent = data.lecturers.length;
    els.statRooms.textContent = data.rooms.length;
    els.statSchedules.textContent = data.schedules.length;
    els.statDays.textContent = new Set(data.schedules.map((s) => s.day)).size;
  }

  function renderMasterLists() {
    els.lecturerList.innerHTML = data.lecturers.length
      ? data.lecturers.slice().sort((a,b) => a.name.localeCompare(b.name, 'id')).map((l) => `
        <div class="master-item">
          <div><strong>${escapeHtml(l.name)}</strong>${l.code ? `<small>${escapeHtml(l.code)}</small>` : ''}</div>
          <button type="button" class="icon-btn danger" data-delete-lecturer="${l.id}" title="Hapus dosen">🗑️</button>
        </div>`).join('')
      : emptyState('👨‍🏫', 'Belum ada dosen', 'Tambahkan dosen menggunakan form di atas.');

    els.roomList.innerHTML = data.rooms.length
      ? data.rooms.slice().sort((a,b) => a.name.localeCompare(b.name, 'id')).map((r) => `
        <div class="master-item">
          <div><strong>${escapeHtml(r.name)}</strong>${r.capacity ? `<small>Kapasitas ${escapeHtml(r.capacity)} orang</small>` : ''}</div>
          <button type="button" class="icon-btn danger" data-delete-room="${r.id}" title="Hapus ruang">🗑️</button>
        </div>`).join('')
      : emptyState('🏫', 'Belum ada ruang', 'Tambahkan ruang menggunakan form di atas.');
  }

  function renderSelects() {
    const currentLecturer = els.lecturerSelect.value;
    const currentRoom = els.roomSelect.value;

    els.lecturerSelect.innerHTML = `<option value="">${data.lecturers.length ? 'Pilih dosen' : 'Tambahkan dosen terlebih dahulu'}</option>` +
      data.lecturers.slice().sort((a,b) => a.name.localeCompare(b.name, 'id')).map((l) => `<option value="${l.id}">${escapeHtml(l.name)}${l.code ? ` — ${escapeHtml(l.code)}` : ''}</option>`).join('');
    els.roomSelect.innerHTML = `<option value="">${data.rooms.length ? 'Pilih ruang' : 'Tambahkan ruang terlebih dahulu'}</option>` +
      data.rooms.slice().sort((a,b) => a.name.localeCompare(b.name, 'id')).map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');

    if (data.lecturers.some((l) => l.id === currentLecturer)) els.lecturerSelect.value = currentLecturer;
    if (data.rooms.some((r) => r.id === currentRoom)) els.roomSelect.value = currentRoom;
  }

  function emptyState(emoji, title, detail) {
    return `<div class="empty-state"><span class="emoji">${emoji}</span><strong>${title}</strong><div>${detail}</div></div>`;
  }

  function getLecturer(id) { return data.lecturers.find((l) => l.id === id); }
  function getRoom(id) { return data.rooms.find((r) => r.id === id); }

  function scheduleSort(a, b) {
    const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    return dayDiff || a.startTime.localeCompare(b.startTime) || a.courseName.localeCompare(b.courseName, 'id');
  }

  function renderSchedules() {
    const filter = els.filterDay.value || 'Semua';
    const schedules = data.schedules.slice().sort(scheduleSort).filter((s) => filter === 'Semua' || s.day === filter);

    els.scheduleList.innerHTML = schedules.length ? schedules.map((s) => {
      const lecturer = getLecturer(s.lecturerId);
      const room = getRoom(s.roomId);
      return `
        <article class="schedule-item">
          <div>
            <div><span class="badge">${escapeHtml(s.day)}</span></div>
            <h3 class="schedule-title">${escapeHtml(s.courseName)} — ${escapeHtml(s.className)}</h3>
            <div class="schedule-meta">
              <span>🕒 ${escapeHtml(s.startTime)}–${escapeHtml(s.endTime)}</span>
              <span>👨‍🏫 ${escapeHtml(lecturer?.name || 'Dosen terhapus')}</span>
              <span>🏫 ${escapeHtml(room?.name || 'Ruang terhapus')}</span>
            </div>
            ${s.notes ? `<div class="schedule-notes">📝 ${escapeHtml(s.notes)}</div>` : ''}
          </div>
          <div class="schedule-actions">
            <button type="button" class="icon-btn" data-edit-schedule="${s.id}" title="Edit jadwal">✏️</button>
            <button type="button" class="icon-btn danger" data-delete-schedule="${s.id}" title="Hapus jadwal">🗑️</button>
          </div>
        </article>`;
    }).join('') : emptyState('📭', 'Belum ada jadwal', filter === 'Semua' ? 'Buat jadwal pertama menggunakan form di sebelah kiri/atas.' : `Belum ada jadwal pada hari ${filter}.`);
  }

  function renderWeeklyPlot() {
    els.weeklyPlot.innerHTML = DAYS.map((day) => {
      const daySchedules = data.schedules.filter((s) => s.day === day).sort(scheduleSort);
      return `
        <section class="day-column">
          <div class="day-heading"><strong>${day}</strong><span class="day-count">${daySchedules.length} jadwal</span></div>
          ${daySchedules.length ? daySchedules.map((s) => {
            const lecturer = getLecturer(s.lecturerId);
            const room = getRoom(s.roomId);
            return `<div class="plot-item">
              <div class="plot-time">${escapeHtml(s.startTime)}–${escapeHtml(s.endTime)}</div>
              <div class="plot-course">${escapeHtml(s.courseName)}</div>
              <div class="plot-detail">${escapeHtml(s.className)}</div>
              <div class="plot-detail">👨‍🏫 ${escapeHtml(lecturer?.name || '-')}</div>
              <div class="plot-detail">🏫 ${escapeHtml(room?.name || '-')}</div>
            </div>`;
          }).join('') : `<div class="empty-state" style="padding:16px 8px"><span class="emoji">—</span><div>Belum ada jadwal</div></div>`}
        </section>`;
    }).join('');
  }

  function toMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  function overlaps(startA, endA, startB, endB) {
    return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);
  }

  function findConflicts(candidate, ignoreId = '') {
    return data.schedules.filter((existing) => {
      if (existing.id === ignoreId || existing.day !== candidate.day) return false;
      if (!overlaps(candidate.startTime, candidate.endTime, existing.startTime, existing.endTime)) return false;
      return existing.lecturerId === candidate.lecturerId || existing.roomId === candidate.roomId;
    }).map((existing) => {
      const lecturerConflict = existing.lecturerId === candidate.lecturerId;
      const roomConflict = existing.roomId === candidate.roomId;
      const reasons = [];
      if (lecturerConflict) reasons.push(`dosen ${getLecturer(existing.lecturerId)?.name || ''}`.trim());
      if (roomConflict) reasons.push(`ruang ${getRoom(existing.roomId)?.name || ''}`.trim());
      return { existing, reasons };
    });
  }

  function showConflicts(conflicts) {
    if (!conflicts.length) {
      els.conflictBox.classList.add('hidden');
      els.conflictBox.innerHTML = '';
      return;
    }
    els.conflictBox.innerHTML = `<strong>⚠️ Jadwal bentrok dan tidak dapat disimpan.</strong><br>` + conflicts.map(({ existing, reasons }) =>
      `• ${escapeHtml(existing.day)} ${escapeHtml(existing.startTime)}–${escapeHtml(existing.endTime)} (${escapeHtml(existing.courseName)}): ${escapeHtml(reasons.join(' dan '))} sudah digunakan.`
    ).join('<br>');
    els.conflictBox.classList.remove('hidden');
  }

  function resetScheduleForm() {
    els.scheduleForm.reset();
    els.scheduleId.value = '';
    els.btnSaveSchedule.textContent = '➕ Simpan Jadwal';
    els.btnCancelEdit.classList.add('hidden');
    els.scheduleFormTitle.textContent = 'Tambah Jadwal Kuliah';
    showConflicts([]);
  }

  function validateSchedule(candidate, ignoreId = '') {
    if (!candidate.courseName || !candidate.className || !candidate.lecturerId || !candidate.roomId || !candidate.day || !candidate.startTime || !candidate.endTime) {
      showToast('Lengkapi semua data wajib.', 'error');
      return false;
    }
    if (toMinutes(candidate.endTime) <= toMinutes(candidate.startTime)) {
      showToast('Jam selesai harus lebih besar dari jam mulai.', 'error');
      return false;
    }
    const conflicts = findConflicts(candidate, ignoreId);
    showConflicts(conflicts);
    if (conflicts.length) {
      showToast('Jadwal bentrok. Periksa pesan berwarna merah.', 'error');
      return false;
    }
    return true;
  }

  function exportData() {
    const payload = { app: 'Plotting Jadwal Perkuliahan', version: 1, exportedAt: new Date().toISOString(), ...data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `backup-jadwal-kuliah-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Backup berhasil diunduh.');
  }

  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

  els.lecturerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = els.lecturerName.value.trim();
    const code = els.lecturerCode.value.trim();
    if (!name) return;
    if (data.lecturers.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
      showToast('Nama dosen sudah ada.', 'error'); return;
    }
    if (code && data.lecturers.some((l) => (l.code || '').toLowerCase() === code.toLowerCase())) {
      showToast('NIDN/kode dosen sudah digunakan.', 'error'); return;
    }
    data.lecturers.push({ id: uid('dos'), name, code });
    els.lecturerForm.reset();
    saveData();
    showToast('Dosen berhasil ditambahkan.');
  });

  els.roomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = els.roomName.value.trim();
    const capacity = els.roomCapacity.value.trim();
    if (!name) return;
    if (data.rooms.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      showToast('Nama ruang sudah ada.', 'error'); return;
    }
    data.rooms.push({ id: uid('rng'), name, capacity });
    els.roomForm.reset();
    saveData();
    showToast('Ruang berhasil ditambahkan.');
  });

  els.lecturerList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete-lecturer]'); if (!btn) return;
    const id = btn.dataset.deleteLecturer;
    if (data.schedules.some((s) => s.lecturerId === id)) {
      showToast('Dosen tidak dapat dihapus karena masih dipakai pada jadwal.', 'error'); return;
    }
    if (!confirm('Hapus dosen ini?')) return;
    data.lecturers = data.lecturers.filter((l) => l.id !== id);
    saveData(); showToast('Dosen dihapus.');
  });

  els.roomList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete-room]'); if (!btn) return;
    const id = btn.dataset.deleteRoom;
    if (data.schedules.some((s) => s.roomId === id)) {
      showToast('Ruang tidak dapat dihapus karena masih dipakai pada jadwal.', 'error'); return;
    }
    if (!confirm('Hapus ruang ini?')) return;
    data.rooms = data.rooms.filter((r) => r.id !== id);
    saveData(); showToast('Ruang dihapus.');
  });

  els.scheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!data.lecturers.length || !data.rooms.length) {
      showToast('Tambahkan minimal satu dosen dan satu ruang terlebih dahulu.', 'error');
      switchTab('master'); return;
    }
    const id = els.scheduleId.value;
    const candidate = {
      id: id || uid('jdw'), courseName: els.courseName.value.trim(), className: els.className.value.trim(),
      lecturerId: els.lecturerSelect.value, roomId: els.roomSelect.value, day: els.daySelect.value,
      startTime: els.startTime.value, endTime: els.endTime.value, notes: els.notes.value.trim()
    };
    if (!validateSchedule(candidate, id)) return;
    if (id) {
      data.schedules = data.schedules.map((s) => s.id === id ? candidate : s);
      showToast('Jadwal berhasil diperbarui.');
    } else {
      data.schedules.push(candidate);
      showToast('Jadwal berhasil disimpan.');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    resetScheduleForm();
    renderAll();
  });

  ['change', 'input'].forEach((eventName) => {
    [els.daySelect, els.startTime, els.endTime, els.lecturerSelect, els.roomSelect].forEach((el) => el.addEventListener(eventName, () => {
      if (!els.daySelect.value || !els.startTime.value || !els.endTime.value || !els.lecturerSelect.value || !els.roomSelect.value) return showConflicts([]);
      const candidate = { day: els.daySelect.value, startTime: els.startTime.value, endTime: els.endTime.value, lecturerId: els.lecturerSelect.value, roomId: els.roomSelect.value };
      if (toMinutes(candidate.endTime) > toMinutes(candidate.startTime)) showConflicts(findConflicts(candidate, els.scheduleId.value));
    }));
  });

  els.scheduleList.addEventListener('click', (e) => {
    const edit = e.target.closest('[data-edit-schedule]');
    const del = e.target.closest('[data-delete-schedule]');
    if (edit) {
      const s = data.schedules.find((x) => x.id === edit.dataset.editSchedule); if (!s) return;
      els.scheduleId.value = s.id; els.courseName.value = s.courseName; els.className.value = s.className;
      els.lecturerSelect.value = s.lecturerId; els.roomSelect.value = s.roomId; els.daySelect.value = s.day;
      els.startTime.value = s.startTime; els.endTime.value = s.endTime; els.notes.value = s.notes || '';
      els.btnSaveSchedule.textContent = '💾 Simpan Perubahan';
      els.btnCancelEdit.classList.remove('hidden');
      els.scheduleFormTitle.textContent = 'Edit Jadwal Kuliah';
      showConflicts([]); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (del) {
      const s = data.schedules.find((x) => x.id === del.dataset.deleteSchedule); if (!s) return;
      if (!confirm(`Hapus jadwal ${s.courseName} (${s.className})?`)) return;
      data.schedules = data.schedules.filter((x) => x.id !== s.id);
      if (els.scheduleId.value === s.id) resetScheduleForm();
      saveData(); showToast('Jadwal dihapus.');
    }
  });

  els.btnCancelEdit.addEventListener('click', resetScheduleForm);
  els.filterDay.addEventListener('change', renderSchedules);
  els.btnPrint.addEventListener('click', () => { switchTab('plot'); setTimeout(() => window.print(), 100); });
  els.btnPrintPlot.addEventListener('click', () => window.print());
  els.btnExport.addEventListener('click', exportData);
  els.btnExportLarge.addEventListener('click', exportData);

  els.importFile.addEventListener('change', async () => {
    const file = els.importFile.files?.[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const normalized = normalizeData(parsed);
      const valid = normalized.lecturers.every((x) => x.id && x.name) && normalized.rooms.every((x) => x.id && x.name) &&
        normalized.schedules.every((x) => x.id && x.courseName && x.className && x.lecturerId && x.roomId && DAYS.includes(x.day) && x.startTime && x.endTime);
      if (!valid) throw new Error('Format tidak valid');
      if (!confirm('Impor backup akan mengganti seluruh data yang sekarang. Lanjutkan?')) { els.importFile.value = ''; return; }
      data = normalized; saveData(); resetScheduleForm(); els.importFile.value = ''; showToast('Backup berhasil dipulihkan.');
    } catch (_) {
      els.importFile.value = ''; showToast('File backup tidak valid atau rusak.', 'error');
    }
  });

  els.btnReset.addEventListener('click', () => {
    if (!confirm('PERINGATAN: Semua data dosen, ruang, dan jadwal akan dihapus dari browser ini. Lanjutkan?')) return;
    data = emptyData(); localStorage.removeItem(STORAGE_KEY); resetScheduleForm(); renderAll(); showToast('Semua data telah dihapus.');
  });

  renderAll();
})();
