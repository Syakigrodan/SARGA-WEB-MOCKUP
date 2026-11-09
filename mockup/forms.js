/**
 * Form submissions and dialogs. Mutations go through data.js, then the current screen re-renders.
 * Loaded before app.js; helpers resolve at call time.
 */

function formValue(form, name) {
  const field = form.elements.namedItem(name);
  if (!field) return '';
  return String(field.value || '').trim();
}

function formChecked(form, name) {
  const field = form.elements.namedItem(name);
  return !!(field && field.checked);
}

function signIn(user) {
  const memberships = store.membershipsOfUser(user.id);
  const active = memberships.find((membership) => membership.status === 'Aktif');
  const chosen = active || memberships[0] || null;
  session = { userId: user.id, orgId: chosen ? chosen.orgId : null };
  saveSession();
}

function sanitizeInvite(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function suggestInvite(name) {
  const word = sanitizeInvite(name).slice(0, 10) || 'ORGANISASI';
  return word + new Date().getFullYear();
}

function uniqueInvite(base) {
  let code = sanitizeInvite(base);
  if (code.length < 4) code = suggestInvite(base);
  let candidate = code;
  let counter = 2;
  while (store.db.organizations.some((org) => org.inviteCode.toUpperCase() === candidate)) {
    candidate = code + counter;
    counter += 1;
  }
  return candidate;
}

function openOtpModal() {
  const waField = document.getElementById('login-wa');
  const wa = waField ? waField.value : '081298765432';
  openModal('Masuk dengan kode OTP', `
    <form data-form="otp">
      <div class="modal-body">
        <div class="alert alert-info" style="margin-bottom:1rem"><strong>Kode demo</strong>Masukkan enam angka apa pun. Pada sistem nyata, kode dikirim ke WhatsApp terdaftar.</div>
        <div class="field">
          <label class="label" for="otp-wa">Nomor WhatsApp</label>
          <input class="form-input" id="otp-wa" name="wa" type="tel" inputmode="tel" value="${esc(wa)}" required>
        </div>
        <div class="field">
          <label class="label" for="otp-code">Kode 6 angka</label>
          <input class="form-input mono" id="otp-code" name="code" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" required>
          <p class="hint">Kode berlaku 5 menit pada sistem nyata.</p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" type="button" data-action="close-modal">Batal</button>
        <button class="btn-primary" type="submit">Masuk</button>
      </div>
    </form>`);
}

function openRejectMemberModal(membershipId) {
  const membership = store.db.memberships.find((item) => item.id === membershipId);
  if (!membership) return;
  const user = store.userById(membership.userId);
  if (!user) return;
  openModal('Tolak pendaftaran', `
    <form data-form="reject-member">
      <div class="modal-body">
        <input type="hidden" name="id" value="${esc(membership.id)}">
        <p class="small">Alasan akan terlihat oleh <span class="strong">${esc(user.name)}</span> di halaman status akun dan dikirim ke WhatsApp pada sistem nyata.</p>
        <div class="field" style="margin-top:.9rem">
          <label class="label" for="reject-member-reason">Alasan penolakan</label>
          <textarea class="form-input" id="reject-member-reason" name="reason" rows="4" placeholder="Contoh: foto dokumen tidak terbaca. Silakan unggah ulang." required></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" type="button" data-action="close-modal">Batal</button>
        <button class="btn-danger" type="submit">Tolak pendaftaran</button>
      </div>
    </form>`);
}

function openRejectLoanModal(loanId) {
  const loan = store.loanById(loanId);
  if (!loan) return;
  const item = store.itemById(loan.itemId);
  const borrower = store.userById(loan.borrowerId);
  openModal('Tolak pengajuan pinjaman', `
    <form data-form="reject-loan">
      <div class="modal-body">
        <input type="hidden" name="id" value="${esc(loan.id)}">
        <p class="small">Pengajuan <span class="strong">${esc(borrower ? borrower.name : 'anggota')}</span> untuk <span class="strong">${esc(item ? item.name : 'barang')}</span> akan ditolak.</p>
        <div class="field" style="margin-top:.9rem">
          <label class="label" for="reject-loan-reason">Alasan penolakan</label>
          <textarea class="form-input" id="reject-loan-reason" name="reason" rows="4" placeholder="Contoh: barang sedang dipakai untuk kegiatan organisasi pada tanggal tersebut." required></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" type="button" data-action="close-modal">Batal</button>
        <button class="btn-danger" type="submit">Tolak pengajuan</button>
      </div>
    </form>`);
}

function openLoanModal(loanId) {
  const loan = store.loanById(loanId);
  if (!loan) return;
  const item = store.itemById(loan.itemId);
  const borrower = store.userById(loan.borrowerId);
  const owner = loan.ownerId ? store.userById(loan.ownerId) : null;
  const logs = store.auditOf(loan.orgId)
    .filter((entry) => entry.loanId === loan.id)
    .slice()
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  const timeline = [
    `<li class="timeline-item done"><span class="timeline-dot"></span><div><strong>Pengajuan dikirim</strong><p>${fmtDateTime(loan.createdAt)} · ${esc(borrower ? borrower.name : 'Anggota')}</p></div></li>`,
    ...logs.map((entry) => `<li class="timeline-item done"><span class="timeline-dot"></span><div><strong>${esc(entry.action)}</strong><p>${fmtDateTime(entry.createdAt)} · ${esc(userName(entry.actorId))}</p>${entry.note ? `<p>${esc(entry.note)}</p>` : ''}</div></li>`)
  ];

  if (loan.status === 'Selesai' && loan.completedAt) {
    timeline.push(`<li class="timeline-item done"><span class="timeline-dot"></span><div><strong>Pengembalian dikonfirmasi</strong><p>${fmtDateTime(loan.completedAt)}</p></div></li>`);
  } else if (loan.status === 'Menunggu') {
    timeline.push(`<li class="timeline-item current"><span class="timeline-dot"></span><div><strong>Menunggu keputusan</strong><p>Pemilik atau pengurus belum menyetujui pengajuan ini.</p></div></li>`);
  } else if (loan.status === 'Ditolak') {
    timeline.push(`<li class="timeline-item"><span class="timeline-dot"></span><div><strong>Pengajuan ditolak</strong><p>${esc(loan.rejectionReason || 'Alasan tercatat oleh pengurus.')}</p></div></li>`);
  } else if (loan.status === 'Dibatalkan') {
    timeline.push(`<li class="timeline-item"><span class="timeline-dot"></span><div><strong>Dibatalkan peminjam</strong><p>Pengajuan tidak dilanjutkan.</p></div></li>`);
  }

  const me = currentUser();
  const ownerOrAdmin = isOrgAdmin() || (!!me && loan.ownerId === me.id);
  let actions = `<button class="btn-secondary" type="button" data-action="close-modal">Tutup</button>`;
  if (loan.status === 'Menunggu' && ownerOrAdmin) {
    actions = `<button class="btn-secondary" type="button" data-action="close-modal">Tutup</button><button class="btn-danger" type="button" data-action="reject-loan" data-id="${esc(loan.id)}">Tolak</button><button class="btn-primary" type="button" data-action="approve-loan" data-id="${esc(loan.id)}">Setujui</button>`;
  } else if (loan.status === 'Menunggu' && me && loan.borrowerId === me.id) {
    actions = `<button class="btn-secondary" type="button" data-action="close-modal">Tutup</button><button class="btn-danger" type="button" data-action="cancel-loan" data-id="${esc(loan.id)}">Batalkan pengajuan</button>`;
  } else if (loan.status === 'Aktif' && ownerOrAdmin) {
    actions = `<button class="btn-secondary" type="button" data-action="close-modal">Tutup</button><button class="btn-primary" type="button" data-action="return-loan" data-id="${esc(loan.id)}">Konfirmasi pengembalian</button>`;
  }

  openModal('Rincian transaksi', `
    <div class="modal-body">
      <div class="item-head">
        <div>
          <span class="cell-main">${esc(item ? item.name : 'Barang dihapus')}</span>
          <span class="cell-sub">${esc(item ? item.code : '—')} · ${fmtDate(loan.start)} – ${fmtDate(loan.end)}</span>
        </div>
        ${tag(loan.status === 'Aktif' && isOverdue(loan) ? 'Terlambat' : loan.status)}
      </div>
      <dl class="definition-list">
        <div><dt>Peminjam</dt><dd>${esc(borrower ? borrower.name : 'Anggota')}</dd></div>
        <div><dt>Pemilik</dt><dd>${esc(owner ? owner.name : 'Aset organisasi')}</dd></div>
        <div><dt>Keperluan</dt><dd>${esc(loan.purpose)}</dd></div>
      </dl>
      <hr class="divider">
      <h3 style="font-size:.95rem;margin-bottom:.35rem">Jejak transaksi</h3>
      <ol class="timeline">${timeline.join('')}</ol>
    </div>
    <div class="modal-actions">${actions}</div>`, true);
}

function handleFormSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const type = form.dataset.form;

  if (type === 'login') {
    const wa = normalizeWa(formValue(form, 'wa'));
    const password = formValue(form, 'password');
    if (wa.length < 9) return formError(form, 'Nomor WhatsApp belum lengkap.', 'wa');
    const user = store.userByWa(wa);
    if (!user) return formError(form, 'Nomor WhatsApp ini belum terdaftar. Periksa kembali atau daftar dengan kode undangan.', 'wa');
    if (user.status === 'Nonaktif') return formError(form, 'Akun ini dinonaktifkan. Hubungi pengurus organisasi.', 'wa');
    if (user.password !== password) return formError(form, 'Kata sandi tidak cocok.', 'password');
    signIn(user);
    closeMobileMenu();
    toast('Masuk berhasil', `Selamat datang, ${user.name}.`, 'success');
    navigate(user.status === 'Aktif' ? '#/beranda' : '#/status-akun');
    return;
  }

  if (type === 'otp') {
    const wa = normalizeWa(formValue(form, 'wa'));
    const code = formValue(form, 'code');
    const user = store.userByWa(wa);
    if (!user) return formError(form, 'Nomor WhatsApp belum terdaftar.', 'wa');
    if (!/^\d{6}$/.test(code)) return formError(form, 'Masukkan kode 6 angka.', 'code');
    signIn(user);
    closeModal();
    toast('Masuk berhasil', `Kode diterima. Anda masuk sebagai ${user.name}.`, 'success');
    navigate(user.status === 'Aktif' ? '#/beranda' : '#/status-akun');
    return;
  }

  if (type === 'register') {
    const name = formValue(form, 'name');
    const wa = normalizeWa(formValue(form, 'wa'));
    const password = formValue(form, 'password');
    const invite = formValue(form, 'invite');
    if (name.length < 3) return formError(form, 'Isi nama lengkap minimal 3 karakter.', 'name');
    if (wa.length < 9) return formError(form, 'Nomor WhatsApp belum lengkap.', 'wa');
    if (password.length < 6) return formError(form, 'Kata sandi minimal 6 karakter.', 'password');
    if (store.userByWa(wa)) return formError(form, 'Nomor WhatsApp ini sudah terdaftar. Silakan masuk.', 'wa');
    const org = store.orgByInvite(invite);
    if (!org) return formError(form, 'Kode undangan tidak valid atau sudah kedaluwarsa.', 'invite');

    const documentField = form.elements.namedItem('document');
    const documentName = documentField && documentField.files && documentField.files[0] ? documentField.files[0].name : '';
    const user = {
      id: store.nextId('u'),
      name,
      wa,
      password,
      address: '',
      status: 'Menunggu Verifikasi',
      createdAt: todayISO(),
      documentName,
      documentNote: documentName ? 'Dokumen pendukung diunggah saat pendaftaran.' : ''
    };
    store.db.users.push(user);
    store.db.memberships.push({
      id: store.nextId('m'),
      orgId: org.id,
      userId: user.id,
      role: 'Anggota',
      position: 'Anggota',
      status: 'Menunggu Verifikasi',
      joinedAt: todayISO()
    });
    store.addAudit({
      orgId: org.id,
      actorId: user.id,
      action: 'Mengajukan keanggotaan',
      target: user.name,
      note: 'Pendaftaran mandiri memakai kode undangan.'
    });
    store.persist();
    session = { userId: user.id, orgId: org.id };
    saveSession();
    toast('Pendaftaran terkirim', `Pengurus ${org.name} akan memeriksa data Anda.`, 'success');
    navigate('#/status-akun');
    return;
  }

  if (type === 'loan') {
    const me = currentUser();
    const org = currentOrg();
    const item = store.itemById(formValue(form, 'item'));
    const start = formValue(form, 'start');
    const end = formValue(form, 'end');
    const purpose = formValue(form, 'purpose');
    if (!me || !org) return formError(form, 'Sesi anggota tidak ditemukan. Masuk ulang.');
    if (!item || item.orgId !== org.id) return formError(form, 'Barang tidak ditemukan di organisasi ini.', 'item');
    if (item.status !== 'Tersedia') return formError(form, 'Barang ini sedang tidak tersedia.', 'item');
    if (item.ownerId === me.id) return formError(form, 'Anda tidak bisa meminjam barang milik sendiri.', 'item');
    if (!parseDate(start) || !parseDate(end)) return formError(form, 'Isi tanggal mulai dan tanggal kembali.', 'start');
    if (parseDate(start) < parseDate(todayISO())) return formError(form, 'Tanggal mulai tidak boleh sebelum hari ini.', 'start');
    if (parseDate(end) < parseDate(start)) return formError(form, 'Tanggal kembali harus setelah tanggal mulai.', 'end');
    const days = diffDays(start, end) + 1;
    if (days > item.maxDays) return formError(form, `Maksimal peminjaman ${item.maxDays} hari. Rentang yang dipilih ${days} hari.`, 'end');
    if (purpose.length < 10) return formError(form, 'Tuliskan keperluan minimal 10 karakter.', 'purpose');
    if (!formChecked(form, 'agree')) return formError(form, 'Centang persetujuan ketentuan peminjaman.');
    const duplicate = store.db.loans.some((loan) => loan.itemId === item.id && loan.borrowerId === me.id && loan.status === 'Menunggu');
    if (duplicate) return formError(form, 'Anda sudah punya pengajuan menunggu untuk barang ini.', 'item');

    const loan = {
      id: store.nextId('ln'),
      orgId: org.id,
      itemId: item.id,
      ownerId: item.ownerId,
      borrowerId: me.id,
      start,
      end,
      status: 'Menunggu',
      purpose,
      createdAt: todayISO()
    };
    store.db.loans.push(loan);
    store.addAudit({
      orgId: org.id,
      actorId: me.id,
      action: 'Mengajukan pinjaman',
      target: item.name,
      note: purpose,
      loanId: loan.id
    });
    store.persist();
    toast('Pengajuan terkirim', 'Pemilik atau pengurus akan memeriksa permintaan Anda.', 'success');
    navigate('#/pinjaman-saya');
    return;
  }

  if (type === 'add-item' || type === 'edit-item') {
    const me = currentUser();
    const org = currentOrg();
    if (!me || !org) return formError(form, 'Sesi anggota tidak ditemukan. Masuk ulang.');
    const isEdit = type === 'edit-item';
    const item = isEdit ? store.itemById(formValue(form, 'id')) : null;
    if (isEdit && !item) return formError(form, 'Barang tidak ditemukan.');
    if (isEdit && item.ownerId !== me.id && !isOrgAdmin()) return formError(form, 'Anda tidak punya akses mengubah barang ini.');

    const name = formValue(form, 'name');
    const category = formValue(form, 'category');
    const maxDays = Number(formValue(form, 'maxDays'));
    const location = formValue(form, 'location');
    const description = formValue(form, 'description');
    const instructions = formValue(form, 'instructions');
    const image = formValue(form, 'image');
    const contents = formValue(form, 'contents').split('\n').map((line) => line.trim()).filter(Boolean);

    if (name.length < 4) return formError(form, 'Nama barang minimal 4 karakter.', 'name');
    if (!CATEGORIES.includes(category)) return formError(form, 'Pilih kategori yang tersedia.', 'category');
    if (!Number.isFinite(maxDays) || maxDays < 1 || maxDays > 14) return formError(form, 'Maksimal pinjam antara 1 sampai 14 hari.', 'maxDays');
    if (location.length < 3) return formError(form, 'Isi lokasi pengambilan.', 'location');
    if (description.length < 10) return formError(form, 'Deskripsi minimal 10 karakter.', 'description');
    if (instructions.length < 5) return formError(form, 'Tuliskan catatan pemakaian.', 'instructions');

    if (isEdit) {
      item.name = name;
      item.category = category;
      item.maxDays = maxDays;
      item.location = location;
      item.description = description;
      item.instructions = instructions;
      item.contents = contents;
      item.image = image;
      store.addAudit({ orgId: org.id, actorId: me.id, action: 'Mengubah barang', target: name, note: 'Data barang diperbarui.' });
      store.persist();
      toast('Perubahan tersimpan', 'Data barang sudah diperbarui.', 'success');
      navigate(`#/detail-barang?id=${item.id}`);
    } else {
      let code = `ITM-${String(store.itemsOf(org.id).length + 1).padStart(3, '0')}`;
      while (store.db.items.some((entry) => entry.code === code)) code += 'A';
      const created = {
        id: store.nextId('itm'),
        code,
        orgId: org.id,
        ownerId: me.id,
        name,
        category,
        maxDays,
        location,
        status: 'Tersedia',
        description,
        contents,
        instructions,
        image
      };
      store.db.items.push(created);
      store.addAudit({ orgId: org.id, actorId: me.id, action: 'Menambahkan barang', target: name, note: 'Barang tayang di katalog.' });
      store.persist();
      toast('Barang tayang', 'Barang Anda sudah masuk katalog organisasi.', 'success');
      navigate(`#/detail-barang?id=${created.id}`);
    }
    return;
  }

  if (type === 'org') {
    const org = currentOrg();
    if (!org || !isOrgAdmin()) return formError(form, 'Hanya pengurus yang bisa mengubah profil organisasi.');
    const name = formValue(form, 'name');
    if (name.length < 3) return formError(form, 'Nama organisasi minimal 3 karakter.', 'name');
    org.name = name;
    org.type = formValue(form, 'type');
    org.address = formValue(form, 'address');
    org.contact = formValue(form, 'contact');
    org.inviteExpires = formValue(form, 'inviteExpires');
    store.addAudit({ orgId: org.id, actorId: currentUser().id, action: 'Mengubah profil organisasi', target: org.name, note: 'Profil dan masa berlaku undangan diperbarui.' });
    store.persist();
    toast('Profil tersimpan', 'Data organisasi sudah diperbarui.', 'success');
    render();
    return;
  }

  if (type === 'create-org') {
    if (!isPlatformAdmin()) return formError(form, 'Hanya admin platform yang bisa membuat organisasi.');
    const name = formValue(form, 'name');
    if (name.length < 3) return formError(form, 'Nama organisasi minimal 3 karakter.', 'name');
    const invite = uniqueInvite(formValue(form, 'invite') || suggestInvite(name));
    const me = currentUser();
    const org = {
      id: store.nextId('org'),
      name,
      type: formValue(form, 'type'),
      address: formValue(form, 'address'),
      contact: formValue(form, 'contact'),
      inviteCode: invite,
      inviteExpires: formValue(form, 'inviteExpires'),
      status: 'Aktif',
      createdAt: todayISO()
    };
    store.db.organizations.push(org);
    store.db.memberships.push({
      id: store.nextId('m'),
      orgId: org.id,
      userId: me.id,
      role: 'Org Admin',
      position: 'Ketua',
      status: 'Aktif',
      joinedAt: todayISO()
    });
    store.addAudit({ orgId: org.id, actorId: me.id, action: 'Membuat organisasi', target: org.name, note: `${me.name} menjadi Org Admin pertama.` });
    store.persist();
    session.orgId = org.id;
    saveSession();
    toast('Organisasi dibuat', `Kode undangan ${org.inviteCode} siap dibagikan.`, 'success');
    navigate('#/admin-organisasi');
    return;
  }

  if (type === 'member-add') {
    if (!isOrgAdmin()) return formError(form, 'Hanya pengurus yang bisa menambah anggota.');
    const org = currentOrg();
    const name = formValue(form, 'name');
    const wa = normalizeWa(formValue(form, 'wa'));
    const address = formValue(form, 'address');
    const role = formValue(form, 'role');
    const position = formValue(form, 'position') || 'Anggota';
    if (name.length < 3) return formError(form, 'Nama minimal 3 karakter.', 'name');
    if (wa.length < 9) return formError(form, 'Nomor WhatsApp belum lengkap.', 'wa');
    if (!ROLE_OPTIONS.includes(role)) return formError(form, 'Pilih peran yang tersedia.', 'role');

    let user = store.userByWa(wa);
    if (user) {
      if (store.membership(user.id, org.id)) return formError(form, 'Nomor ini sudah menjadi anggota organisasi.', 'wa');
      user.status = 'Aktif';
      if (!user.address && address) user.address = address;
    } else {
      user = {
        id: store.nextId('u'),
        name,
        wa,
        password: 'sarga123',
        address,
        status: 'Aktif',
        createdAt: todayISO()
      };
      store.db.users.push(user);
    }
    store.db.memberships.push({
      id: store.nextId('m'),
      orgId: org.id,
      userId: user.id,
      role,
      position,
      status: 'Aktif',
      joinedAt: todayISO()
    });
    store.addAudit({ orgId: org.id, actorId: currentUser().id, action: 'Menambahkan anggota', target: user.name, note: `Ditambahkan sebagai ${role}.` });
    store.persist();
    toast('Anggota ditambahkan', `${user.name} langsung aktif di organisasi.`, 'success');
    navigate('#/admin-anggota');
    return;
  }

  if (type === 'member-edit') {
    if (!isOrgAdmin()) return formError(form, 'Hanya pengurus yang bisa mengubah keanggotaan.');
    const membership = store.db.memberships.find((item) => item.id === formValue(form, 'id'));
    if (!membership || membership.orgId !== currentOrg().id) return formError(form, 'Data anggota tidak ditemukan.');
    const role = formValue(form, 'role');
    const position = formValue(form, 'position') || 'Anggota';
    const status = formValue(form, 'status');
    if (!ROLE_OPTIONS.includes(role)) return formError(form, 'Pilih peran yang valid.', 'role');
    if (!MEMBER_STATUSES.includes(status)) return formError(form, 'Pilih status yang valid.', 'status');
    if (membership.userId === currentUser().id && status !== 'Aktif') return formError(form, 'Anda tidak bisa menonaktifkan akun sendiri.');
    if (membership.role === 'Org Admin' && role !== 'Org Admin') {
      const admins = store.membersOf(membership.orgId).filter((m) => m.role === 'Org Admin' && m.status === 'Aktif');
      if (admins.length <= 1) return formError(form, 'Organisasi harus punya minimal satu Org Admin aktif. Angkat anggota lain terlebih dahulu.');
    }
    membership.role = role;
    membership.position = position;
    membership.status = status;
    const user = store.userById(membership.userId);
    if (user) user.status = status;
    store.addAudit({ orgId: membership.orgId, actorId: currentUser().id, action: 'Mengubah keanggotaan', target: userName(membership.userId), note: `Peran ${role}, status ${status}.` });
    store.persist();
    toast('Keanggotaan diperbarui', `${userName(membership.userId)} sekarang berperan sebagai ${role}.`, 'success');
    render();
    return;
  }

  if (type === 'announcement') {
    if (!isOrgAdmin()) return formError(form, 'Hanya pengurus yang bisa mengirim pengumuman.');
    const title = formValue(form, 'title');
    const body = formValue(form, 'body');
    if (title.length < 5) return formError(form, 'Judul minimal 5 karakter.', 'title');
    if (body.length < 10) return formError(form, 'Isi pengumuman minimal 10 karakter.', 'body');
    const org = currentOrg();
    store.db.announcements.unshift({
      id: store.nextId('an'),
      orgId: org.id,
      title,
      body,
      authorId: currentUser().id,
      createdAt: todayISO()
    });
    store.addAudit({ orgId: org.id, actorId: currentUser().id, action: 'Mengirim pengumuman', target: title, note: 'Dikirim ke seluruh anggota.' });
    store.persist();
    toast('Pengumuman terkirim', 'Pengumuman tampil di halaman organisasi.', 'success');
    render();
    return;
  }

  if (type === 'join-org') {
    const me = currentUser();
    const org = store.orgByInvite(formValue(form, 'invite'));
    if (!org) return formError(form, 'Kode undangan tidak valid atau sudah kedaluwarsa.', 'invite');
    if (store.membership(me.id, org.id)) return formError(form, 'Anda sudah terdaftar di organisasi ini.', 'invite');
    store.db.memberships.push({
      id: store.nextId('m'),
      orgId: org.id,
      userId: me.id,
      role: 'Anggota',
      position: 'Anggota',
      status: 'Menunggu Verifikasi',
      joinedAt: todayISO()
    });
    store.addAudit({ orgId: org.id, actorId: me.id, action: 'Mengajukan keanggotaan', target: me.name, note: 'Bergabung lewat kode undangan.' });
    store.persist();
    const hasActive = store.membershipsOfUser(me.id).some((m) => m.status === 'Aktif' && m.orgId !== org.id);
    if (!hasActive) {
      session.orgId = org.id;
      saveSession();
      toast('Menunggu verifikasi', `Pengurus ${org.name} akan memeriksa keanggotaan Anda.`, 'success');
      navigate('#/status-akun');
    } else {
      toast('Pengajuan terkirim', `Keanggotaan di ${org.name} menunggu persetujuan pengurus.`, 'success');
      render();
    }
    return;
  }

  if (type === 'password') {
    const me = currentUser();
    const current = formValue(form, 'current');
    const next = formValue(form, 'next');
    const confirm = formValue(form, 'confirm');
    if (me.password !== current) return formError(form, 'Kata sandi saat ini tidak cocok.', 'current');
    if (next.length < 6) return formError(form, 'Kata sandi baru minimal 6 karakter.', 'next');
    if (next !== confirm) return formError(form, 'Ulangi kata sandi baru dengan tepat.', 'confirm');
    me.password = next;
    if (currentOrg()) {
      store.addAudit({ orgId: currentOrg().id, actorId: me.id, action: 'Mengubah kata sandi', target: me.name, note: 'Kata sandi akun diperbarui.' });
    }
    store.persist();
    form.reset();
    toast('Kata sandi diperbarui', 'Gunakan kata sandi baru pada masuk berikutnya.', 'success');
    return;
  }

  if (type === 'reject-member') {
    if (!isOrgAdmin()) return formError(form, 'Hanya pengurus yang bisa menolak pendaftaran.');
    const membership = store.db.memberships.find((item) => item.id === formValue(form, 'id'));
    if (!membership) return formError(form, 'Data pendaftar tidak ditemukan.');
    const reason = formValue(form, 'reason');
    if (reason.length < 5) return formError(form, 'Tuliskan alasan penolakan minimal 5 karakter.', 'reason');
    membership.status = 'Ditolak';
    const user = store.userById(membership.userId);
    if (user) {
      user.status = 'Ditolak';
      user.rejectionReason = reason;
    }
    store.addAudit({ orgId: membership.orgId, actorId: currentUser().id, action: 'Menolak pendaftaran', target: userName(membership.userId), note: reason });
    store.persist();
    closeModal();
    toast('Pendaftaran ditolak', 'Alasan sudah dicatat pada status akun pemohon.', 'danger');
    render();
    return;
  }

  if (type === 'reject-loan') {
    if (!isOrgAdmin() && !store.db.loans.some((loan) => loan.id === formValue(form, 'id') && loan.ownerId === currentUser().id)) {
      return formError(form, 'Anda tidak berwenang menolak pengajuan ini.');
    }
    const loan = store.loanById(formValue(form, 'id'));
    if (!loan || loan.status !== 'Menunggu') return formError(form, 'Pengajuan ini sudah diproses.');
    const reason = formValue(form, 'reason');
    if (reason.length < 5) return formError(form, 'Tuliskan alasan penolakan minimal 5 karakter.', 'reason');
    loan.status = 'Ditolak';
    loan.rejectionReason = reason;
    const item = store.itemById(loan.itemId);
    store.addAudit({ orgId: loan.orgId, actorId: currentUser().id, action: 'Menolak pinjaman', target: item ? item.name : 'Barang', note: reason, loanId: loan.id });
    store.persist();
    closeModal();
    toast('Pengajuan ditolak', 'Peminjam bisa melihat alasan pada rincian transaksi.', 'danger');
    render();
    return;
  }

  if (type === 'structure') {
    if (!isOrgAdmin()) return formError(form, 'Hanya pengurus yang bisa mengubah bagan.');
    const org = currentOrg();
    const members = store.activeMembersOf(org.id);
    const proposed = members.map((membership) => {
      const role = form.elements.namedItem(`role-${membership.id}`) ? String(form.elements.namedItem(`role-${membership.id}`).value) : membership.role;
      const position = form.elements.namedItem(`position-${membership.id}`) ? String(form.elements.namedItem(`position-${membership.id}`).value).trim() : membership.position;
      return { membership, role, position };
    });
    if (!proposed.some((entry) => entry.role === 'Org Admin')) return formError(form, 'Minimal satu anggota harus menjadi Org Admin.');
    const me = currentUser();
    const self = proposed.find((entry) => entry.membership.userId === me.id);
    if (self && self.role === 'Anggota') return formError(form, 'Anda tidak bisa menurunkan peran akun sendiri menjadi Anggota.');
    proposed.forEach((entry) => {
      entry.membership.role = entry.role;
      entry.membership.position = entry.position || entry.role;
    });
    store.addAudit({ orgId: org.id, actorId: me.id, action: 'Mengubah bagan organisasi', target: org.name, note: 'Posisi dan peran anggota diperbarui.' });
    store.persist();
    toast('Bagan tersimpan', 'Struktur organisasi sudah diperbarui.', 'success');
    navigate('#/struktur');
    return;
  }
}
