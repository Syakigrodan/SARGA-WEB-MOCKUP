/**
 * Public and account screens: landing, login, registration, account status, and joining an organisation.
 * Loaded before app.js. Helpers come from app.js at call time.
 */

function boardItem(item) {
  return `
    <a class="board-item" href="#/detail-barang?id=${esc(item.id)}">
      <img class="board-thumb" src="${esc(item.image)}" alt="" loading="lazy" onerror="this.src='img/placeholder-item.svg'">
      <span>
        <strong>${esc(item.name)}</strong>
        <span>${esc(item.category)} · maksimal ${item.maxDays} hari</span>
      </span>
    </a>`;
}

function renderBeranda() {
  const user = currentUser();
  const org = currentOrg();
  const available = (org ? store.itemsOf(org.id) : store.db.items)
    .filter((item) => item.status === 'Tersedia')
    .slice(0, 4);
  const boardTitle = org ? `Tersedia di ${esc(org.name)}` : 'Contoh alat di jaringan SARGA';
  const firstName = user ? user.name.split(' ')[0] : '';

  return `
    <div class="page page-wide">
      <section class="hero">
        <div>
          <p class="kicker">Inventaris bersama</p>
          <h1>Alat bersama organisasi, tercatat sampai kembali.</h1>
          <p class="lede">Grup chat tenggelam, catatan pinjaman hilang. SARGA menyatukan katalog alat, pengajuan pinjaman, persetujuan pemilik, dan riwayat serah terima dalam satu halaman yang bisa dibaca semua anggota.</p>
          <div class="hero-actions">
            <a class="btn-primary" href="${user ? '#/katalog' : '#/daftar'}">${user ? 'Buka katalog alat' : 'Daftar sebagai anggota'}</a>
            <a class="btn-secondary" href="${user ? '#/gabung' : '#/login'}">${user ? 'Gabung organisasi lain' : 'Masuk ke akun'}</a>
          </div>
          <p class="hero-note">${user ? `Masuk sebagai ${esc(user.name)}${org ? ` di ${esc(org.name)}` : ''}.` : 'Data demo. Organisasi baru dibuat oleh admin, bukan lewat pendaftaran publik.'}</p>
        </div>

        <div class="hero-board" aria-label="Daftar alat yang tersedia">
          <div class="board-head">
            <strong>${boardTitle}</strong>
            <span>${available.length} alat</span>
          </div>
          ${available.length ? available.map(boardItem).join('') : emptyState('Belum ada alat tersedia', 'Pengurus atau anggota belum menayangkan alat di organisasi ini.', '')}
          <div class="board-foot">Status diperbarui setiap kali pinjaman disetujui atau barang dikembalikan.</div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Tiga langkah, tanpa tanya di grup</h2>
          <p>Alur yang sama dipakai semua organisasi: katalog, pengajuan, lalu serah terima.</p>
        </div>
        <ol class="steps">
          <li class="step">
            <span class="step-num">01</span>
            <div><strong>Cari alat yang tersedia</strong><p>Filter berdasarkan kategori, baca kelengkapan, dan lihat siapa pemiliknya.</p></div>
          </li>
          <li class="step">
            <span class="step-num">02</span>
            <div><strong>Ajukan tanggal dan keperluan</strong><p>Pemilik atau pengurus menyetujui dari daftar permintaan. Tidak perlu menebak siapa yang sudah membalas.</p></div>
          </li>
          <li class="step">
            <span class="step-num">03</span>
            <div><strong>Ambil, pakai, kembalikan</strong><p>Pemilik mengonfirmasi pengembalian. Status alat kembali tersedia dan riwayatnya tetap tersimpan.</p></div>
          </li>
        </ol>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Yang dicatat SARGA</h2>
          <p>Bukan sekadar daftar barang. Setiap perubahan punya jejak yang bisa diperiksa pengurus.</p>
        </div>
        <div class="feature-list">
          <div class="feature-row"><div class="feature-title">Ketersediaan alat</div><div class="feature-body">Status tersedia atau dipinjam, tanggal kembali, dan siapa yang sedang memegang.</div></div>
          <div class="feature-row"><div class="feature-title">Persetujuan pemilik</div><div class="feature-body">Permintaan masuk ke pemilik dan pengurus, lengkap dengan tanggal serta keperluan peminjaman.</div></div>
          <div class="feature-row"><div class="feature-title">Riwayat transaksi</div><div class="feature-body">Pengajuan, persetujuan, penolakan, dan pengembalian tercatat dengan waktu dan pelakunya.</div></div>
          <div class="feature-row"><div class="feature-title">Pengumuman pengurus</div><div class="feature-body">Jadwal pengecekan alat dan kebijakan hari libur tampil di halaman organisasi, bukan tertimbun chat.</div></div>
        </div>
      </section>

      <section class="cta-band">
        <div>
          <h2>${firstName ? `Siap meminjam, ${esc(firstName)}?` : 'Punya kode undangan dari pengurus?'}</h2>
          <p>${user ? 'Katalog dan pinjaman Anda ada di organisasi yang sedang aktif. Ganti organisasi dari header bila Anda menjadi anggota lebih dari satu.' : 'Minta kode undangan kepada pengurus organisasi. Setelah mendaftar, akun diperiksa dulu sebelum bisa meminjam.'}</p>
        </div>
        <div class="cta-actions btn-row">
          <a class="btn-primary" href="${user ? '#/katalog' : '#/daftar'}">${user ? 'Lihat katalog' : 'Mulai daftar'}</a>
          <a class="btn-secondary" href="${user ? '#/pinjaman-saya' : '#/status-akun'}">${user ? 'Pinjaman saya' : 'Cek status akun'}</a>
        </div>
      </section>
    </div>`;
}

function demoAccountRow(user) {
  const membership = primaryMembership(user.id);
  const org = membership ? store.orgById(membership.orgId) : null;
  const meta = membership
    ? `${membership.role}${org ? ' · ' + org.name : ''} · ${membership.status}`
    : 'Belum punya organisasi';
  return `
    <div class="demo-account">
      <div>
        <div class="demo-account-name">${esc(user.name)}</div>
        <div class="demo-account-meta">${esc(meta)}</div>
      </div>
      <button class="btn-secondary btn-sm" type="button" data-action="login-as" data-user="${esc(user.id)}">Masuk</button>
    </div>`;
}

function renderLogin() {
  const user = currentUser();
  const demoUsers = store.db.users
    .filter((item) => store.membershipsOfUser(item.id).length > 0)
    .slice(0, 6);

  return `
    <div class="page page-narrow">
      <div class="auth-card">
        <div class="auth-head">
          <img src="image.png" alt="">
          <h1>Masuk ke akun SARGA</h1>
          <p>Gunakan nomor WhatsApp yang tercatat pada data anggota organisasi.</p>
        </div>

        ${user ? `<div class="alert alert-info" style="margin-bottom:1rem"><strong>Anda sudah masuk</strong>Sebagai ${esc(user.name)}${currentOrg() ? ' di ' + esc(currentOrg().name) : ''}. <a class="link" href="#/beranda">Kembali ke beranda</a>.</div>` : ''}

        <form data-form="login" novalidate>
          <div class="field">
            <label class="label" for="login-wa">Nomor WhatsApp terdaftar</label>
            <input class="form-input" id="login-wa" name="wa" type="tel" inputmode="tel" autocomplete="tel" value="${user ? esc(user.wa) : '081298765432'}" required>
            <p class="hint">Contoh akun demo sudah terisi. Anda bisa menggantinya.</p>
          </div>
          <div class="field">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:1rem">
              <label class="label" for="login-password">Kata sandi</label>
              <button class="link" type="button" style="background:none;border:0;min-height:24px;padding:.35rem 0;font-size:.78rem" data-action="forgot-password">Lupa kata sandi?</button>
            </div>
            <input class="form-input" id="login-password" name="password" type="password" autocomplete="current-password" value="rahasia123" required>
          </div>
          <button class="btn-primary btn-block form-submit" type="submit">Masuk</button>
          <button class="btn-secondary btn-block form-submit" type="button" data-action="open-otp">Masuk dengan kode OTP</button>
        </form>

        <p class="hint" style="margin-top:1rem">Belum punya akun? <a class="link" href="#/daftar">Daftar dengan kode undangan pengurus</a>. Sudah mendaftar dan menunggu? <a class="link" href="#/status-akun">Lihat status akun</a>.</p>

        <div class="demo-accounts">
          <h2>Pilihan akun demo</h2>
          <p>Setiap akun menunjukkan keadaan yang berbeda: pengurus, admin organisasi, akun menunggu, dan akun ditolak.</p>
          ${demoUsers.map(demoAccountRow).join('')}
        </div>
      </div>
    </div>`;
}

function renderDaftar() {
  return `
    <div class="page page-mid">
      ${pageHead({
        kicker: 'Pendaftaran anggota',
        title: 'Daftar dengan kode undangan organisasi',
        lede: 'Pendaftaran tidak langsung memberi akses pinjam. Pengurus memeriksa nomor WhatsApp dan dokumen keanggotaan terlebih dahulu.'
      })}

      <div class="grid-2">
        <div class="panel panel-pad">
          <form data-form="register" novalidate>
            <div class="field">
              <label class="label" for="reg-name">Nama lengkap</label>
              <input class="form-input" id="reg-name" name="name" autocomplete="name" required>
            </div>
            <div class="field">
              <label class="label" for="reg-wa">Nomor WhatsApp</label>
              <input class="form-input" id="reg-wa" name="wa" type="tel" inputmode="tel" autocomplete="tel" required>
              <p class="hint">Nomor ini dipakai untuk masuk dan dihubungi pengurus.</p>
            </div>
            <div class="field">
              <label class="label" for="reg-password">Kata sandi</label>
              <input class="form-input" id="reg-password" name="password" type="password" autocomplete="new-password" minlength="6" required>
              <p class="hint">Minimal 6 karakter.</p>
            </div>
            <div class="field">
              <label class="label" for="reg-invite">Kode undangan organisasi</label>
              <input class="form-input mono" id="reg-invite" name="invite" autocomplete="off" required>
              <p class="hint">Contoh demo: <span class="mono">GRAHA2026</span>, <span class="mono">RT05-2026</span>, <span class="mono">NUSANTARA2026</span>.</p>
            </div>
            <div class="field">
              <label class="label" for="reg-document">Dokumen pendukung (opsional)</label>
              <input class="form-input" id="reg-document" name="document" type="file" accept="image/*,.pdf">
              <p class="hint">Untuk demo, hanya nama berkas yang disimpan.</p>
            </div>
            <button class="btn-primary btn-block form-submit" type="submit">Kirim pendaftaran</button>
          </form>
          <p class="hint" style="margin-top:.75rem">Sudah punya akun? <a class="link" href="#/login">Masuk di sini</a>.</p>
        </div>

        <div class="stack">
          <div class="panel panel-pad">
            <h2 style="font-size:1rem;margin-bottom:.6rem">Setelah formulir dikirim</h2>
            <ol class="timeline" style="margin:0">
              <li class="timeline-item done"><span class="timeline-dot"></span><div><strong>Pendaftaran dibuat</strong><p>Akun tersimpan dengan status menunggu verifikasi.</p></div></li>
              <li class="timeline-item current"><span class="timeline-dot"></span><div><strong>Pengurus memeriksa</strong><p>Nomor WhatsApp dan dokumen dicocokkan dengan data organisasi.</p></div></li>
              <li class="timeline-item"><span class="timeline-dot"></span><div><strong>Akun aktif</strong><p>Setelah disetujui, Anda bisa meminjam dan menayangkan alat.</p></div></li>
            </ol>
          </div>
          <div class="well">
            <p class="small strong">Organisasi baru tidak dibuat dari halaman ini.</p>
            <p class="small muted" style="margin-top:.25rem">Admin platform yang membuat organisasi dan menghasilkan kode undangan. Anggota cukup memakai kode dari pengurus.</p>
          </div>
        </div>
      </div>
    </div>`;
}

function signupTimeline(status) {
  const active = status === 'Aktif';
  const rejected = status === 'Ditolak';
  return `
    <ol class="timeline">
      <li class="timeline-item done"><span class="timeline-dot"></span><div><strong>Pendaftaran diterima</strong><p>Akun dan keanggotaan sudah tercatat.</p></div></li>
      <li class="timeline-item ${active ? 'done' : (rejected ? '' : 'current')}"><span class="timeline-dot"></span><div><strong>${rejected ? 'Pemeriksaan pengurus' : 'Pemeriksaan pengurus'}</strong><p>${rejected ? 'Pengurus menolak pendaftaran ini. Alasan dikirim ke WhatsApp pemohon.' : (active ? 'Pengurus menyetujui keanggotaan.' : 'Nomor WhatsApp dan dokumen sedang diperiksa pengurus.')}</p></div></li>
      <li class="timeline-item ${active ? 'done' : ''}"><span class="timeline-dot"></span><div><strong>Akun aktif</strong><p>${active ? 'Akun siap dipakai untuk meminjam dan menayangkan alat.' : 'Aktif setelah pengurus menyetujui pendaftaran.'}</p></div></li>
    </ol>`;
}

function renderStatusAkun() {
  const user = currentUser();
  if (!user) {
    return `<div class="page page-narrow">${pageHead({ kicker: 'Status akun', title: 'Masuk untuk melihat status', lede: 'Status pendaftaran terikat pada akun Anda.' })}<div class="panel panel-pad"><p class="small">Silakan <a class="link" href="#/login">masuk ke akun</a> terlebih dahulu.</p></div></div>`;
  }

  const memberships = store.membershipsOfUser(user.id);
  let membership = currentMembership();
  if (!membership && memberships.length) membership = memberships[0];
  const org = membership ? store.orgById(membership.orgId) : null;
  const status = membership ? membership.status : 'Tanpa organisasi';
  const documentName = user.documentName || '';

  let body = '';
  if (!membership) {
    body = `<div class="empty"><p class="empty-title">Akun belum terhubung ke organisasi</p><p class="empty-body">Minta kode undangan kepada pengurus, lalu gabung dari halaman organisasi.</p><a class="btn-primary" href="#/gabung">Gabung organisasi</a></div>`;
  } else if (status === 'Aktif') {
    body = `<div class="alert alert-success"><strong>Akun aktif</strong>Anda terdaftar sebagai ${esc(membership.role)} di ${esc(org.name)}. Anda bisa meminjam alat dan menayangkan barang sendiri.</div>
      ${signupTimeline(status)}
      <div class="btn-row"><a class="btn-primary" href="#/katalog">Buka katalog</a><a class="btn-secondary" href="#/profil">Lihat profil</a></div>`;
  } else if (status === 'Ditolak') {
    body = `<div class="alert alert-danger"><strong>Pendaftaran ditolak</strong>${esc(user.rejectionReason || 'Pengurus belum menuliskan alasan. Hubungi pengurus organisasi untuk keterangan lebih lanjut.')}</div>
      ${signupTimeline(status)}
      <div class="btn-row"><button class="btn-primary" type="button" data-action="resubmit-member" data-id="${esc(membership.id)}">Ajukan ulang</button><a class="btn-secondary" href="#/profil">Ganti akun</a></div>`;
  } else {
    body = `<div class="alert alert-warn"><strong>Menunggu verifikasi pengurus</strong>Pendaftaran Anda sudah masuk. Pengurus akan menghubungi nomor WhatsApp ${esc(user.wa)} setelah pemeriksaan selesai.</div>
      ${signupTimeline(status)}
      <p class="small muted">Pengurus organisasi: ${org ? `<a class="link" href="${waHref(org.contact)}" target="_blank" rel="noopener">${esc(org.contact)}</a>` : '—'}.</p>`;
  }

  return `
    <div class="page page-narrow">
      ${pageHead({
        kicker: 'Status akun',
        title: user.name,
        lede: org ? `Keanggotaan di ${org.name}.` : 'Belum ada organisasi aktif.'
      })}
      <div class="panel panel-pad">
        <div class="status-hero" style="border:0;padding:0">
          <div class="item-head">
            <div>
              <span class="cell-main">${esc(membership ? membership.role : 'Anggota')}</span>
              <span class="cell-sub">${esc(org ? org.name : 'Belum ada organisasi')} · ${esc(status)}</span>
            </div>
            ${membership ? tag(status) : ''}
          </div>
          ${body}
        </div>

        ${documentName ? `<hr class="divider"><p class="small"><span class="strong">Dokumen terkirim:</span> ${esc(documentName)}</p><p class="tiny muted">${esc(user.documentNote || 'Hanya nama berkas yang disimpan pada demo ini.')}</p>` : ''}

        ${memberships.length > 1 ? `<hr class="divider"><h2 style="font-size:.95rem;margin-bottom:.5rem">Keanggotaan lain</h2><div class="list">${memberships.map((m) => {
          const other = store.orgById(m.orgId);
          return `<div class="list-item row"><div><span class="cell-main">${esc(other.name)}</span><span class="cell-sub">${esc(m.role)} · ${esc(m.status)}</span></div><div class="actions"><button class="btn-secondary btn-sm" type="button" data-action="open-org" data-org="${esc(m.orgId)}">Buka</button></div></div>`;
        }).join('')}</div>` : ''}

        <hr class="divider">
        <div class="btn-row"><button class="btn-secondary" type="button" data-action="logout">Keluar dari akun</button></div>
      </div>
    </div>`;
}

function renderGabung() {
  const user = currentUser();
  if (!user) {
    return `<div class="page page-narrow">${pageHead({ kicker: 'Gabung organisasi', title: 'Masuk terlebih dahulu', lede: 'Keanggotaan terikat pada akun Anda.' })}<div class="panel panel-pad"><p class="small">Silakan <a class="link" href="#/login">masuk</a> atau <a class="link" href="#/daftar">daftar</a>.</p></div></div>`;
  }

  const memberships = store.membershipsOfUser(user.id);
  const cards = memberships.map((m) => {
    const org = store.orgById(m.orgId);
    return `<div class="list-item row">
      <div>
        <span class="cell-main">${esc(org.name)}</span>
        <span class="cell-sub">${esc(org.type)} · ${esc(m.role)} · sejak ${fmtDate(m.joinedAt)}</span>
      </div>
      <div class="actions">
        ${tag(m.status)}
        ${m.status === 'Aktif' ? `<button class="btn-secondary btn-sm" type="button" data-action="open-org" data-org="${esc(org.id)}">Buka</button>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
    <div class="page page-mid">
      ${pageHead({
        kicker: 'Keanggotaan',
        title: 'Gabung organisasi lain',
        lede: 'Satu akun bisa menjadi anggota beberapa organisasi. Setiap organisasi punya katalog dan pengurus sendiri.'
      })}

      <div class="grid-2">
        <div class="panel panel-pad">
          <h2 style="font-size:1rem;margin-bottom:.5rem">Kode undangan</h2>
          <form data-form="join-org" novalidate>
            <div class="field">
              <label class="label" for="join-code">Kode dari pengurus</label>
              <input class="form-input mono" id="join-code" name="invite" autocomplete="off" required>
              <p class="hint">Contoh demo: <span class="mono">NUSANTARA2026</span>.</p>
            </div>
            <button class="btn-primary btn-block form-submit" type="submit">Ajukan keanggotaan</button>
          </form>
          <p class="hint" style="margin-top:.75rem">Keanggotaan baru berstatus menunggu sampai disetujui pengurus organisasi tersebut.</p>
        </div>

        <div class="panel panel-pad">
          <h2 style="font-size:1rem;margin-bottom:.5rem">Organisasi Anda</h2>
          ${memberships.length ? `<div class="list">${cards}</div>` : emptyState('Belum ada organisasi', 'Gunakan kode undangan dari pengurus untuk bergabung.', '')}
        </div>
      </div>

      <div class="well" style="margin-top:1rem">
        <p class="small strong">Ingin membuat organisasi baru?</p>
        <p class="small muted" style="margin-top:.25rem">Pembuatan organisasi hanya tersedia untuk admin platform. Buka <a class="link" href="#/admin-direktori">direktori organisasi</a> bila akun Anda punya akses admin.</p>
      </div>
    </div>`;
}
