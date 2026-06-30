const profiles = {
  teacher: { name: 'Elif Yılmaz', title: 'Matematik Öğretmeni', avatar: 'EY', greeting: 'Günaydın, Elif Öğretmen <em>👋</em>', intro: 'Bugün 4 dersiniz var. İlk dersiniz 12 dakika sonra başlıyor.' },
  parent: { name: 'Melis Demir', title: 'Arda Demir’in Velisi', avatar: 'MD', greeting: 'Günaydın, Melis Hanım <em>👋</em>', intro: 'Arda şu anda okulda ve Matematik dersinde.' },
  management: { name: 'Ahmet Kaya', title: 'Müdür Yardımcısı', avatar: 'AK', greeting: 'Günaydın, Ahmet Bey <em>👋</em>', intro: 'Okulunuzdaki canlı katılım ve yoklama durumunu görüntülüyorsunuz.' },
  admin: { name: 'Zeynep Aydın', title: 'Sistem Yöneticisi', avatar: 'ZA', greeting: 'Günaydın, Zeynep <em>👋</em>', intro: 'Sistem genelinde 1.482 kullanıcı ve 684 öğrenci bulunuyor.' }
};

const accounts = {
  'ogretmen@okulda.test': { role: 'teacher', password: '1234' },
  'veli@okulda.test': { role: 'parent', password: '1234' },
  'idare@okulda.test': { role: 'management', password: '1234' },
  'admin@okulda.test': { role: 'admin', password: '1234' }
};

let currentUser = null;
let activeView = null;
const roleButtons = document.querySelectorAll('.role-switcher button');
const roleSwitcher = document.querySelector('.role-switcher');
const loginScreen = document.querySelector('#loginScreen');

function updateIdentity(profile) {
  document.querySelector('#userName').textContent = profile.name;
  document.querySelector('#userTitle').textContent = profile.title;
  document.querySelector('#avatar').textContent = profile.avatar;
}

function switchRole(role) {
  if (!currentUser) return;
  if (currentUser.role !== 'admin' && role !== currentUser.role) {
    showToast('Erişim engellendi', 'Bu panel hesabınızın yetki alanında değil.');
    return;
  }
  activeView = role;
  document.querySelector('#moduleView').classList.remove('active');
  document.querySelector('.welcome').style.display = '';
  roleButtons.forEach(button => button.classList.toggle('active', button.dataset.role === role));
  document.querySelectorAll('.role-view').forEach(view => view.classList.remove('active'));
  document.querySelector(`#${role}View`).classList.add('active');
  if (currentUser.role === 'admin' && role !== 'admin') {
    document.querySelector('#greeting').innerHTML = `${profiles[role].title} paneli <em>↗</em>`;
    document.querySelector('#intro').textContent = `Admin yetkisiyle ${profiles[role].name} görünümünü inceliyorsunuz.`;
  } else {
    document.querySelector('#greeting').innerHTML = profiles[role].greeting;
    document.querySelector('#intro').textContent = profiles[role].intro;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyNavigationPermissions(role) {
  document.querySelectorAll('#mainNav button[data-roles]').forEach(button => {
    const allowed = button.dataset.roles.split(',');
    button.classList.toggle('role-hidden', role !== 'admin' && !allowed.includes(role));
  });
}

function login(role) {
  currentUser = { role, ...profiles[role] };
  updateIdentity(profiles[role]);
  applyNavigationPermissions(role);
  roleSwitcher.classList.toggle('visible', role === 'admin');
  loginScreen.classList.add('hidden');
  document.body.style.overflow = '';
  switchRole(role);
}

document.querySelector('#loginForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = document.querySelector('#loginEmail').value.trim().toLocaleLowerCase('tr');
  const password = document.querySelector('#loginPassword').value;
  const account = accounts[email];
  if (!account || account.password !== password) {
    document.querySelector('#loginError').textContent = 'E-posta adresi veya şifre hatalı.';
    return;
  }
  document.querySelector('#loginError').textContent = '';
  login(account.role);
});

document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#loginEmail').value = button.dataset.demo;
  document.querySelector('#loginPassword').value = '1234';
  document.querySelector('#loginError').textContent = '';
}));

document.querySelector('#togglePassword').addEventListener('click', event => {
  const input = document.querySelector('#loginPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
  event.currentTarget.textContent = input.type === 'password' ? 'Göster' : 'Gizle';
});

document.querySelector('#logoutButton').addEventListener('click', () => {
  currentUser = null;
  activeView = null;
  loginScreen.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.querySelector('#loginPassword').value = '1234';
});

roleButtons.forEach(button => button.addEventListener('click', () => switchRole(button.dataset.role)));

const students = [
  ['Arda Demir', '184', 'AD', 'present'],
  ['Beril Aksoy', '191', 'BA', 'present'],
  ['Can Eren', '203', 'CE', 'absent'],
  ['Defne Kaya', '216', 'DK', 'present'],
  ['Ege Yıldız', '224', 'EY', 'late'],
  ['Funda Şen', '231', 'FŞ', 'present']
];
const labels = { present: 'Geldi', absent: 'Gelmedi', late: 'Geç', excused: 'İzinli' };
const studentList = document.querySelector('#studentList');

function renderStudents(filter = '') {
  studentList.innerHTML = '';
  students.filter(student => student[0].toLocaleLowerCase('tr').includes(filter.toLocaleLowerCase('tr'))).forEach(student => {
    const actualIndex = students.indexOf(student);
    const row = document.createElement('div');
    row.className = 'student-row';
    row.innerHTML = `<span class="student-avatar">${student[2]}</span><p><b>${student[0]}</b><small>Okul no: ${student[1]}</small></p><div class="status-options">${Object.entries(labels).map(([key, label]) => `<button data-index="${actualIndex}" data-status="${key}" class="${student[3] === key ? 'active' : ''}">${label}</button>`).join('')}</div>`;
    studentList.appendChild(row);
  });
  updateCounts();
}

function updateCounts() {
  Object.keys(labels).forEach(status => document.querySelector(`#${status}Count`).textContent = students.filter(student => student[3] === status).length);
  document.querySelector('#markedText').textContent = `${students.length} öğrenci işaretlendi`;
}

studentList.addEventListener('click', event => {
  const button = event.target.closest('button[data-status]');
  if (!button) return;
  students[Number(button.dataset.index)][3] = button.dataset.status;
  renderStudents(document.querySelector('#studentSearch').value);
});
renderStudents();

const attendanceModal = document.querySelector('#attendanceModal');
function openModal(modal) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.querySelectorAll('.open-attendance').forEach(button => button.addEventListener('click', () => {
  if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') openModal(attendanceModal);
}));
document.querySelector('#closeModal').addEventListener('click', () => closeModal(attendanceModal));
attendanceModal.addEventListener('click', event => { if (event.target === attendanceModal) closeModal(attendanceModal); });
document.querySelector('#studentSearch').addEventListener('input', event => renderStudents(event.target.value));
document.querySelector('#allPresent').addEventListener('click', () => {
  students.forEach(student => { student[3] = 'present'; });
  renderStudents(document.querySelector('#studentSearch').value);
});

const toast = document.querySelector('#toast');
function showToast(title = 'İşlem tamamlandı', detail = 'Değişiklikler başarıyla kaydedildi.') {
  toast.querySelector('b').textContent = title;
  toast.querySelector('small').textContent = detail;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3600);
}

document.querySelector('#saveAttendance').addEventListener('click', () => {
  const absent = students.filter(student => student[3] === 'absent').length;
  closeModal(attendanceModal);
  showToast('Yoklama kaydedildi', absent ? `${absent} gelmeyen öğrencinin velisine bildirim gönderildi.` : 'Tüm öğrenciler derste olarak işaretlendi.');
  document.querySelector('#parentNotification b').textContent = absent ? 'Arda’nın yoklaması güncellendi' : 'Arda Matematik dersinde';
  const classCard = document.querySelector('[data-class="7A"]');
  classCard.classList.add('complete', 'just-completed');
  classCard.querySelector('small').textContent = `${students.filter(student => student[3] === 'present').length} / ${students.length} öğrenci`;
  classCard.querySelector('em').textContent = '✓ Yoklama alındı';
  setTimeout(() => classCard.classList.remove('just-completed'), 700);
});

const messageModal = document.querySelector('#messageModal');
let messageRecipient = '';
function openMessage(recipient, context) {
  messageRecipient = recipient;
  document.querySelector('#recipientName').textContent = recipient;
  document.querySelector('#recipientAvatar').textContent = recipient.split(' ').map(word => word[0]).join('').slice(0, 2);
  document.querySelector('#messageContext').textContent = context;
  document.querySelector('#messageSubject').value = '';
  document.querySelector('#messageBody').value = '';
  document.querySelector('#charCount').textContent = '0';
  openModal(messageModal);
}
document.querySelectorAll('.open-message').forEach(button => button.addEventListener('click', () => openMessage(button.dataset.recipient, button.dataset.context)));
document.querySelector('#closeMessage').addEventListener('click', () => closeModal(messageModal));
document.querySelector('#cancelMessage').addEventListener('click', () => closeModal(messageModal));
messageModal.addEventListener('click', event => { if (event.target === messageModal) closeModal(messageModal); });
document.querySelector('#messageBody').addEventListener('input', event => { document.querySelector('#charCount').textContent = event.target.value.length; });
document.querySelector('#messageForm').addEventListener('submit', event => {
  event.preventDefault();
  closeModal(messageModal);
  showToast('Mesaj gönderildi', `Mesajınız yalnızca ${messageRecipient} kullanıcısına iletildi.`);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal(attendanceModal);
    closeModal(messageModal);
  }
});

const moduleView = document.querySelector('#moduleView');
const permissionMap = {
  teacher: ['schedule', 'attendance', 'messages', 'notifications', 'settings'],
  parent: ['schedule', 'messages', 'notifications', 'settings'],
  management: ['schedule', 'attendance', 'classes', 'students', 'parents', 'notifications', 'reports', 'settings'],
  admin: ['schedule', 'attendance', 'messages', 'classes', 'students', 'parents', 'notifications', 'reports', 'settings']
};

const studentRecords = [
  ['Arda Demir', '184', '7/A', 'Melis Demir', '%98', 'Aktif'], ['Beril Aksoy', '191', '7/A', 'Serkan Aksoy', '%96', 'Aktif'],
  ['Can Eren', '203', '7/A', 'Ayşe Eren', '%89', 'Takip'], ['Defne Kaya', '216', '7/A', 'Ahmet Kaya', '%100', 'Aktif'],
  ['Ege Yıldız', '224', '7/A', 'Pelin Yıldız', '%94', 'Aktif'], ['Zeynep Koç', '318', '6/B', 'Murat Koç', '%91', 'Aktif']
];
const parentRecords = [
  ['Melis Demir', 'Arda Demir', '7/A', '0532 555 12 12', 'Doğrulandı'], ['Serkan Aksoy', 'Beril Aksoy', '7/A', '0541 232 44 10', 'Doğrulandı'],
  ['Ayşe Eren', 'Can Eren', '7/A', '0553 984 21 10', 'Doğrulandı'], ['Pelin Yıldız', 'Ege Yıldız', '7/A', '0533 621 08 44', 'Bekliyor'],
  ['Murat Koç', 'Zeynep Koç', '6/B', '0542 844 31 09', 'Doğrulandı']
];
const extraClasses = [];
const customNotifications = [];
const customLessons = [];

function pageHeader(title, description, action = '') {
  return `<div class="module-head"><div><h2>${title}</h2><p>${description}</p></div><div class="module-actions"><input id="moduleSearch" placeholder="Ara..."><button class="secondary" data-export>↓ Dışa aktar</button>${action}</div></div>`;
}

function scheduleTemplate() {
  const title = currentUser.role === 'parent' ? 'Arda’nın Ders Programı' : currentUser.role === 'teacher' ? 'Ders Programım' : 'Okul Ders Programı';
  const action = ['management', 'admin'].includes(currentUser.role) ? '<button class="primary open-action" data-action="lesson">+ Ders ekle</button>' : '';
  return `${pageHeader(title, '30 Haziran — 4 Temmuz haftası', action)}
  <div class="module-tabs"><button class="active">Haftalık</button><button>Günlük</button><button>Sınıf bazlı</button></div>
  ${customLessons.map(item=>`<div class="panel notification-row" style="margin-bottom:10px"><span>▦</span><p><b>${item[0]} · ${item[1]}</b><small>${item[2]} · Derslik ${item[3]}</small></p><time>Yeni</time></div>`).join('')}
  <article class="panel weekly-schedule"><div class="schedule-grid">
    <div class="schedule-label">SAAT</div><div class="schedule-label">PAZARTESİ</div><div class="schedule-label">SALI</div><div class="schedule-label">ÇARŞAMBA</div><div class="schedule-label">PERŞEMBE</div><div class="schedule-label">CUMA</div>
    <div class="period">08:20<br>09:00</div><div class="lesson-block"><b>Matematik</b><small>6/B · 105</small></div><div class="lesson-block blue"><b>Fen Bilimleri</b><small>7/A · 105</small></div><div class="lesson-block"><b>Matematik</b><small>8/C · 302</small></div><div class="lesson-block orange"><b>Türkçe</b><small>7/A · 204</small></div><div class="lesson-block"><b>Matematik</b><small>6/A · 106</small></div>
    <div class="period">09:00<br>09:40</div><div class="lesson-block blue"><b>Fen Bilimleri</b><small>7/A · 105</small></div><div class="lesson-block"><b>Matematik</b><small>7/A · 203</small></div><div class="lesson-block orange"><b>Türkçe</b><small>6/B · 104</small></div><div class="lesson-block"><b>Matematik</b><small>8/A · 301</small></div><div class="lesson-block blue"><b>Fen Bilimleri</b><small>7/A · Lab.</small></div>
    <div class="period">10:00<br>10:40</div><div class="lesson-block orange"><b>Türkçe</b><small>7/A · 204</small></div><div class="lesson-block"><b>Matematik</b><small>8/C · 302</small></div><div class="lesson-block blue"><b>Fen Bilimleri</b><small>6/A · Lab.</small></div><div class="lesson-block orange"><b>Türkçe</b><small>7/B · 205</small></div><div class="lesson-block"><b>Matematik</b><small>7/A · 203</small></div>
    <div class="period">11:00<br>11:40</div><div class="lesson-block"><b>Matematik</b><small>7/B · 205</small></div><div class="lesson-block orange"><b>Türkçe</b><small>8/C · 302</small></div><div class="lesson-block"><b>Matematik</b><small>7/A · 203</small></div><div class="lesson-block blue"><b>Fen Bilimleri</b><small>8/A · Lab.</small></div><div class="lesson-block orange"><b>Türkçe</b><small>6/B · 104</small></div>
  </div></article>`;
}

function attendanceTemplate() {
  const teacher = currentUser.role === 'teacher';
  return `${pageHeader(teacher ? 'Yoklamalarım' : 'Yoklama Yönetimi', teacher ? 'Derslerinizin yoklama durumunu yönetin.' : 'Tüm sınıfların güncel yoklama durumunu izleyin.', teacher ? '<button class="primary open-attendance">+ Yoklama al</button>' : '')}
  <div class="attendance-board"><article><small>TAMAMLANAN</small><b>42</b><p>Bugünkü 51 dersin %82’si</p></article><article><small>BEKLEYEN</small><b>9</b><p>3 ders için uyarı gerekli</p></article><article><small>GENEL KATILIM</small><b>%94</b><p>642 öğrenci okulda</p></article></div>
  <article class="panel data-panel" style="margin-top:16px"><div class="filter-row"><input id="tableSearch" placeholder="Sınıf veya öğretmen ara"><select><option>Tüm durumlar</option><option>Tamamlandı</option><option>Bekliyor</option></select><select><option>Bugün</option><option>Bu hafta</option></select></div><table class="data-table"><thead><tr><th>DERS / SINIF</th><th>ÖĞRETMEN</th><th>SAAT</th><th>KATILIM</th><th>DURUM</th><th></th></tr></thead><tbody>
  <tr data-search-row><td><b>Matematik · 6/B</b><small>Derslik 105</small></td><td>Elif Yılmaz</td><td>08:20</td><td>26 / 28</td><td><span class="status-pill">Tamamlandı</span></td><td><button class="row-action">Detay</button></td></tr>
  <tr data-search-row><td><b>Matematik · 7/A</b><small>Derslik 203</small></td><td>Elif Yılmaz</td><td>09:00</td><td>—</td><td><span class="status-pill warn">Devam ediyor</span></td><td><button class="row-action open-attendance">Yoklama al</button></td></tr>
  <tr data-search-row><td><b>Türkçe · 7/B</b><small>Derslik 205</small></td><td>Deniz Acar</td><td>09:00</td><td>—</td><td><span class="status-pill red">Gecikti</span></td><td><button class="row-action">Uyar</button></td></tr>
  <tr data-search-row><td><b>Fen Bilimleri · 5/A</b><small>Laboratuvar</small></td><td>Selin Çetin</td><td>09:00</td><td>24 / 25</td><td><span class="status-pill">Tamamlandı</span></td><td><button class="row-action">Detay</button></td></tr>
  </tbody></table></article>`;
}

function classesTemplate() {
  const cards = ['5/A|25|%96','5/B|28|%97','6/A|29|%93','6/B|28|%94','7/A|28|%96','7/B|30|%90','8/A|26|%98','8/C|27|%92', ...extraClasses];
  return `${pageHeader('Sınıf Yönetimi', 'Sınıfları, şubeleri ve öğrenci dağılımını yönetin.', '<button class="primary open-action" data-action="class">+ Sınıf oluştur</button>')}<div class="entity-grid">${cards.map((item, i) => { const [name,count,rate]=item.split('|'); return `<button class="entity-card" data-entity="${name}"><span>${name.replace('/','')}</span><b>${name} Sınıfı</b><small>${count} öğrenci · ${i%2?'2. Kat':'1. Kat'}</small><em>${rate} aylık katılım →</em></button>`; }).join('')}</div>`;
}

function studentsTemplate() {
  return `${pageHeader('Öğrenci Yönetimi', 'Öğrenci kayıtları, sınıf bilgileri ve devam durumları.', '<button class="primary open-action" data-action="student">+ Öğrenci ekle</button>')}<article class="panel data-panel"><div class="filter-row"><input id="tableSearch" placeholder="Öğrenci, numara veya sınıf ara"><select><option>Tüm sınıflar</option><option>7/A</option><option>6/B</option></select></div><table class="data-table"><thead><tr><th>ÖĞRENCİ</th><th>NO</th><th>SINIF</th><th>VELİ</th><th>KATILIM</th><th>DURUM</th><th></th></tr></thead><tbody>${studentRecords.map(row=>`<tr data-search-row><td><b>${row[0]}</b><small>${row[0].toLocaleLowerCase('tr').replace(' ','.')}@ogrenci.test</small></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td><span class="status-pill ${row[5]==='Takip'?'warn':''}">${row[5]}</span></td><td><button class="row-action">Düzenle</button></td></tr>`).join('')}</tbody></table></article>`;
}

function parentsTemplate() {
  return `${pageHeader('Veli Yönetimi', 'Velileri doğrulayın ve öğrencilerle eşleştirin.', '<button class="primary open-action" data-action="parent">+ Veli ekle</button>')}<div class="stats three"><article><span class="stat-icon green">✓</span><div><small>EŞLEŞTİRİLEN</small><b>684</b><p>Aktif veli</p></div></article><article><span class="stat-icon orange">!</span><div><small>BEKLEYEN</small><b>12</b><p>Doğrulama gerekli</p></div></article><article><span class="stat-icon blue">♙</span><div><small>TOPLAM VELİ</small><b>736</b><p>%94 doğrulandı</p></div></article></div><article class="panel data-panel"><div class="filter-row"><input id="tableSearch" placeholder="Veli veya öğrenci ara"><select><option>Tüm durumlar</option><option>Doğrulandı</option><option>Bekliyor</option></select></div><table class="data-table"><thead><tr><th>VELİ</th><th>ÖĞRENCİ</th><th>SINIF</th><th>TELEFON</th><th>DURUM</th><th></th></tr></thead><tbody>${parentRecords.map(row=>`<tr data-search-row><td><b>${row[0]}</b><small>${row[0].toLocaleLowerCase('tr').replace(' ','.')}@email.com</small></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td><span class="status-pill ${row[4]==='Bekliyor'?'warn':''}">${row[4]}</span></td><td><button class="row-action">${row[4]==='Bekliyor'?'Doğrula':'Düzenle'}</button></td></tr>`).join('')}</tbody></table></article>`;
}

function messagesTemplate() {
  const teacher = currentUser.role === 'teacher';
  const first = teacher ? 'Melis Demir' : 'Elif Yılmaz';
  const context = teacher ? 'Arda Demir’in velisi' : 'Matematik Öğretmeni';
  return `${pageHeader('Mesajlar', 'Öğretmen ve veli arasındaki güvenli birebir iletişim.', '<button class="primary open-message" data-recipient="'+first+'" data-context="'+context+'">+ Yeni mesaj</button>')}<article class="panel message-layout"><aside class="conversation-list"><div class="conversation-search"><input placeholder="Mesajlarda ara"></div><button class="conversation-item active"><span>${teacher?'MD':'EY'}</span><p><b>${first}</b><small>Arda’nın bugünkü katılımı hakkında...</small></p><time>09:18</time></button><button class="conversation-item"><span>${teacher?'SA':'DA'}</span><p><b>${teacher?'Serkan Aksoy':'Deniz Acar'}</b><small>Teşekkür ederim, iyi çalışmalar.</small></p><time>Dün</time></button></aside><section class="chat"><div class="chat-head"><span>${teacher?'MD':'EY'}</span><p><b>${first}</b><small>${context}</small></p></div><div class="chat-body" id="chatBody"><div class="bubble">Merhaba, Arda’nın bugünkü Matematik dersine katılımı hakkında bilgi alabilir miyim?<time>09:12</time></div><div class="bubble mine">Merhaba, Arda derse zamanında katıldı ve şu anda sınıfta.<time>09:15 · İletildi</time></div></div><form class="chat-compose" id="chatForm"><input id="chatInput" placeholder="Bir mesaj yazın..." required><button class="primary">Gönder →</button></form></section></article>`;
}

function notificationsTemplate() {
  const personal = currentUser.role === 'parent';
  return `${pageHeader('Bildirim Merkezi', personal ? 'Arda ile ilgili okul bildirimleri.' : 'Otomatik ve manuel bildirimleri yönetin.', personal ? '' : '<button class="primary open-action" data-action="notification">+ Bildirim gönder</button>')}<div class="module-grid"><article class="panel"><div class="panel-head"><div><h3>Son Bildirimler</h3><p>Bugün gönderilen iletiler</p></div><span>${24 + customNotifications.length} bildirim</span></div><div class="notification-list">${customNotifications.map(item=>`<div class="notification-row"><span>♢</span><p><b>${item[0]}</b><small>${item[1]}</small></p><time>Şimdi</time></div>`).join('')}<div class="notification-row"><span>✓</span><p><b>Yoklama tamamlandı</b><small>Arda Demir · Matematik · Derste</small></p><time>Şimdi</time></div><div class="notification-row"><span>!</span><p><b>Devamsızlık bildirimi</b><small>Can Eren’in velisine otomatik gönderildi</small></p><time>09:06</time></div><div class="notification-row"><span>▦</span><p><b>Program değişikliği</b><small>7/A Cuma günü 4. ders güncellendi</small></p><time>08:42</time></div><div class="notification-row"><span>♢</span><p><b>Okul duyurusu</b><small>Yarınki veli toplantısı hatırlatması</small></p><time>Dün</time></div></div></article><article class="panel info-card"><h3>Bildirim Kanalları</h3><div class="info-list"><div><span>▣</span><p><b>Uygulama içi</b><small>Anlık bildirim</small></p><em>Aktif</em></div><div><span>SMS</span><p><b>SMS</b><small>Acil durumlar</small></p><em>Aktif</em></div><div><span>✉</span><p><b>E-posta</b><small>Rapor ve duyurular</small></p><em>Aktif</em></div></div></article></div>`;
}

function reportsTemplate(period = 'Günlük') {
  const values = period === 'Aylık' ? ['%91','%94','%95','%93','%96'] : period === 'Yıllık' ? ['%90','%92','%94','%93','%96'] : ['%92','%95','%93','%97','%94'];
  return `${pageHeader('Raporlar', 'Katılım eğilimlerini inceleyin ve raporları dışa aktarın.', '<button class="primary" data-export>↓ Rapor indir</button>')}<div class="module-tabs report-tabs">${['Günlük','Haftalık','Aylık','Yıllık'].map(p=>`<button class="${p===period?'active':''}" data-period="${p}">${p}</button>`).join('')}</div><article class="panel report-hero"><div><small>GENEL KATILIM · ${period.toLocaleUpperCase('tr')}</small><b>${period==='Yıllık'?'%93,8':'%94,2'}</b><p>Önceki döneme göre ↑ %1,8 artış</p></div><div class="report-mini"><div><small>GELMEYEN</small><b>34</b></div><div><small>GEÇ GELEN</small><b>8</b></div><div><small>İZİNLİ</small><b>12</b></div></div></article><div class="module-grid" style="margin-top:16px"><article class="panel"><div class="panel-head"><div><h3>Katılım Eğilimi</h3><p>${period} karşılaştırma</p></div></div><div class="report-chart">${values.map((v,i)=>`<div><b>${v}</b><i style="--v:${[67,78,72,85,76][i]}%"></i><span>${['Pzt','Sal','Çar','Per','Cum'][i]}</span></div>`).join('')}</div></article><article class="panel info-card"><h3>En Yüksek Katılım</h3><div class="info-list"><div><span>1</span><p><b>8/A Sınıfı</b><small>26 öğrenci</small></p><em>%98</em></div><div><span>2</span><p><b>5/B Sınıfı</b><small>28 öğrenci</small></p><em>%97</em></div><div><span>3</span><p><b>7/A Sınıfı</b><small>28 öğrenci</small></p><em>%96</em></div></div></article></div>`;
}

function settingsTemplate() {
  return `${pageHeader('Ayarlar', 'Hesap, güvenlik ve bildirim tercihlerinizi yönetin.')}<div class="settings-grid"><aside class="panel settings-nav"><button class="active">Hesap bilgileri</button><button>Güvenlik</button><button>Bildirim tercihleri</button><button>Görünüm</button></aside><article class="panel settings-content"><h3>Hesap ve Tercihler</h3><p>Değişiklikler bu kullanıcı hesabına uygulanır.</p><div class="setting-row"><p><b>Profil bilgileri</b><small>${currentUser.name} · ${currentUser.title}</small></p><button class="secondary open-action" data-action="profile">Düzenle</button></div><div class="setting-row"><p><b>Uygulama bildirimleri</b><small>Yoklama ve mesaj bildirimleri</small></p><button class="toggle on" aria-label="Uygulama bildirimleri"></button></div><div class="setting-row"><p><b>E-posta özeti</b><small>Haftalık katılım raporu</small></p><button class="toggle on" aria-label="E-posta özeti"></button></div><div class="setting-row"><p><b>SMS bildirimleri</b><small>Acil durum ve devamsızlık</small></p><button class="toggle" aria-label="SMS bildirimleri"></button></div><div class="setting-row"><p><b>İki aşamalı doğrulama</b><small>Hesabınız için ek güvenlik</small></p><button class="secondary">Etkinleştir</button></div></article></div>`;
}

function renderModule(page) {
  if (!currentUser || !permissionMap[currentUser.role].includes(page)) {
    showToast('Erişim engellendi', 'Bu modül hesabınızın yetki alanında değil.');
    return;
  }
  document.querySelectorAll('.role-view').forEach(view => view.classList.remove('active'));
  document.querySelector('.welcome').style.display = 'none';
  moduleView.classList.add('active');
  const templates = { schedule: scheduleTemplate, attendance: attendanceTemplate, messages: messagesTemplate, classes: classesTemplate, students: studentsTemplate, parents: parentsTemplate, notifications: notificationsTemplate, reports: reportsTemplate, settings: settingsTemplate };
  moduleView.innerHTML = templates[page]();
  moduleView.dataset.page = page;
  bindModuleInteractions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindModuleInteractions() {
  const search = document.querySelector('#tableSearch');
  if (search) search.addEventListener('input', event => document.querySelectorAll('[data-search-row]').forEach(row => row.classList.toggle('filtered', !row.textContent.toLocaleLowerCase('tr').includes(event.target.value.toLocaleLowerCase('tr')))));
  const moduleSearch = document.querySelector('#moduleSearch');
  if (moduleSearch) moduleSearch.addEventListener('input', event => document.querySelectorAll('[data-search-row], [data-entity]').forEach(item => item.classList.toggle('filtered', !item.textContent.toLocaleLowerCase('tr').includes(event.target.value.toLocaleLowerCase('tr')))));
  document.querySelectorAll('.open-action').forEach(button => button.addEventListener('click', () => openAction(button.dataset.action)));
  document.querySelectorAll('[data-export]').forEach(button => button.addEventListener('click', () => showToast('Dosya hazırlandı', 'Rapor başarıyla dışa aktarıldı.')));
  document.querySelectorAll('.toggle').forEach(button => button.addEventListener('click', () => button.classList.toggle('on')));
  document.querySelectorAll('.report-tabs [data-period]').forEach(button => button.addEventListener('click', () => { moduleView.innerHTML = reportsTemplate(button.dataset.period); bindModuleInteractions(); }));
  document.querySelectorAll('.open-message').forEach(button => button.addEventListener('click', () => openMessage(button.dataset.recipient, button.dataset.context)));
  document.querySelectorAll('.open-attendance').forEach(button => button.addEventListener('click', () => openModal(attendanceModal)));
  document.querySelectorAll('[data-entity]').forEach(button => button.addEventListener('click', () => showToast(`${button.dataset.entity} Sınıfı`, 'Sınıf detayları ve öğrenci listesi görüntülendi.')));
  document.querySelectorAll('.module-tabs:not(.report-tabs) button').forEach(button => button.addEventListener('click', () => { button.parentElement.querySelectorAll('button').forEach(item=>item.classList.remove('active')); button.classList.add('active'); showToast(button.textContent, 'Görünüm güncellendi.'); }));
  document.querySelectorAll('.settings-nav button').forEach(button => button.addEventListener('click', () => { button.parentElement.querySelectorAll('button').forEach(item=>item.classList.remove('active')); button.classList.add('active'); document.querySelector('.settings-content h3').textContent=button.textContent; }));
  document.querySelectorAll('.conversation-item').forEach(button => button.addEventListener('click', () => { button.parentElement.querySelectorAll('.conversation-item').forEach(item=>item.classList.remove('active')); button.classList.add('active'); document.querySelector('.chat-head b').textContent=button.querySelector('b').textContent; }));
  document.querySelectorAll('.row-action:not(.open-attendance)').forEach(button => button.addEventListener('click', () => showToast(button.textContent, 'İlgili kayıt ekranı açıldı ve işlem tamamlandı.')));
  const chatForm = document.querySelector('#chatForm');
  if (chatForm) chatForm.addEventListener('submit', event => { event.preventDefault(); const input=document.querySelector('#chatInput'); if(!input.value.trim())return; document.querySelector('#chatBody').insertAdjacentHTML('beforeend', `<div class="bubble mine">${escapeText(input.value)}<time>Şimdi · İletildi</time></div>`); input.value=''; document.querySelector('#chatBody').scrollTop=document.querySelector('#chatBody').scrollHeight; });
}

function escapeText(value) { const div=document.createElement('div'); div.textContent=value; return div.innerHTML; }

const actionModal = document.querySelector('#actionModal');
const actionConfig = {
  student: ['Öğrenci ekle', 'Yeni öğrenci kaydı oluşturun.', [['Ad soyad','text'],['Okul numarası','number'],['Sınıf','select'],['Doğum tarihi','date']]],
  parent: ['Veli ekle', 'Veliyi öğrenciyle eşleştirin.', [['Ad soyad','text'],['Telefon','tel'],['E-posta','email'],['Öğrenci','select']]],
  class: ['Sınıf oluştur', 'Yeni sınıf ve şube bilgilerini girin.', [['Sınıf adı','text'],['Şube','text'],['Derslik','text'],['Sınıf öğretmeni','select']]],
  lesson: ['Ders ekle', 'Ders programına yeni saat ekleyin.', [['Ders','text'],['Sınıf','select'],['Başlangıç saati','time'],['Derslik','text']]],
  notification: ['Bildirim gönder', 'Seçili alıcılara anlık bildirim gönderin.', [['Başlık','text'],['Alıcı grubu','select'],['Mesaj','text','full']]],
  profile: ['Profili düzenle', 'Hesap bilgilerinizi güncelleyin.', [['Ad soyad','text'],['E-posta','email'],['Telefon','tel'],['Unvan','text']]],
  user: ['Kullanıcı ekle', 'Rol ve erişim bilgilerini belirleyin.', [['Ad soyad','text'],['E-posta','email'],['Rol','select'],['Telefon','tel']]]
};
let activeAction = '';
function openAction(type) {
  activeAction = type;
  const [title, description, fields] = actionConfig[type];
  document.querySelector('#actionTitle').textContent = title;
  document.querySelector('#actionDescription').textContent = description;
  document.querySelector('#actionFields').className = 'action-fields';
  document.querySelector('#actionFields').innerHTML = fields.map(field => `<label class="${field[2]||''}">${field[0]}${field[1]==='select'?'<select required><option value="">Seçin</option><option>7/A</option><option>6/B</option><option>Öğretmen</option><option>Veli</option></select>':`<input type="${field[1]}" required>`}</label>`).join('');
  openModal(actionModal);
}
document.querySelector('#closeAction').addEventListener('click', () => closeModal(actionModal));
document.querySelector('#cancelAction').addEventListener('click', () => closeModal(actionModal));
actionModal.addEventListener('click', event => { if (event.target === actionModal) closeModal(actionModal); });
document.querySelector('#actionForm').addEventListener('submit', event => {
  event.preventDefault();
  const values = [...document.querySelectorAll('#actionFields input, #actionFields select')].map(field => field.value || field.options?.[field.selectedIndex]?.text || '');
  if (activeAction === 'student') studentRecords.unshift([values[0], values[1], values[2] || '7/A', 'Eşleştirme bekliyor', '%100', 'Aktif']);
  if (activeAction === 'parent') parentRecords.unshift([values[0], values[3] || 'Eşleştirme bekliyor', '7/A', values[1], 'Bekliyor']);
  if (activeAction === 'class') extraClasses.unshift(`${values[0]}/${values[1]}|0|%0`);
  if (activeAction === 'notification') customNotifications.unshift([values[0], `${values[1]} · ${values[2]}`]);
  if (activeAction === 'lesson') customLessons.unshift([values[0], values[1], values[2], values[3]]);
  if (activeAction === 'user') {
    const table = document.querySelector('.user-table .table');
    if (table) table.insertAdjacentHTML('beforeend', `<div class="tr"><span class="person"><i>${values[0].split(' ').map(word=>word[0]).join('').slice(0,2)}</i><b>${escapeText(values[0])}<small>${escapeText(values[1])}</small></b></span><span><em class="role-tag parent">${escapeText(values[2])}</em></span><span>Yeni kullanıcı</span><span class="active-state">● Aktif</span><button>•••</button></div>`);
  }
  const title = actionConfig[activeAction][0];
  closeModal(actionModal);
  showToast(`${title} tamamlandı`, 'Kayıt sisteme başarıyla eklendi.');
  if (['students', 'parents', 'classes', 'notifications', 'schedule'].includes(moduleView.dataset.page)) renderModule(moduleView.dataset.page);
});

document.querySelector('#addUser').addEventListener('click', () => openAction('user'));
document.querySelector('#settingsButton').addEventListener('click', () => renderModule('settings'));
document.querySelector('#notificationButton').addEventListener('click', () => renderModule('notifications'));
document.querySelectorAll('#mainNav button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('#mainNav button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  if (button.dataset.page === 'home') switchRole(currentUser.role === 'admin' ? activeView || 'admin' : currentUser.role);
  else renderModule(button.dataset.page);
  document.querySelector('#sidebar').classList.remove('open');
}));
document.querySelector('#menuButton').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));

document.body.style.overflow = 'hidden';

// Browser installation and offline support
let installPrompt = null;
const installButton = document.querySelector('#installApp');
installButton.hidden = true;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (installPrompt) {
    await installPrompt.prompt();
    installPrompt = null;
    installButton.hidden = true;
  } else {
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent);
    showToast('Ana ekrana ekleyin', isApple ? 'Safari’de Paylaş düğmesine, ardından “Ana Ekrana Ekle” seçeneğine dokunun.' : 'Tarayıcı menüsünden “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğini kullanın.');
  }
});
window.addEventListener('appinstalled', () => showToast('Uygulama yüklendi', 'Okulda mı? ana ekranınıza eklendi.'));
window.addEventListener('offline', () => {
  const banner = document.createElement('div');
  banner.className = 'offline-banner';
  banner.id = 'offlineBanner';
  banner.textContent = 'Çevrimdışısınız · Kayıtlı ekranlar kullanılabilir';
  document.body.appendChild(banner);
});
window.addEventListener('online', () => document.querySelector('#offlineBanner')?.remove());
if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}
