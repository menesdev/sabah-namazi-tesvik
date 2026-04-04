// ═══════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type !== 'success') toast.classList.add('toast-' + type);
  toast.textContent = message;
  container.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-show'));
  });
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ═══════════════════════════════════
// DARK MODE
// ═══════════════════════════════════
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
initTheme();

// ═══════════════════════════════════
// LIVE CLOCK
// ═══════════════════════════════════
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const el = document.getElementById('liveClock');
  if (el) el.textContent = h + ':' + m + ':' + s;
  highlightCurrentPrayer();
}
setInterval(updateClock, 1000);
updateClock();

// ═══════════════════════════════════
// PRAYER HIGHLIGHTING
// ═══════════════════════════════════
function highlightCurrentPrayer() {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const items = document.querySelectorAll('#namazGrid .namaz-item');
  let lastPassedIndex = -1;

  items.forEach((item, i) => {
    item.classList.remove('current-prayer');
    const inp = item.querySelector('.namaz-time-input');
    if (!inp) return;
    const parts = inp.value.split(':');
    if (parts.length < 2) return;
    const prayerMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    if (currentMins >= prayerMins) lastPassedIndex = i;
  });

  if (lastPassedIndex >= 0 && !items[lastPassedIndex].classList.contains('done')) {
    items[lastPassedIndex].classList.add('current-prayer');
  }
}

// ═══════════════════════════════════
// ROTATING AYET
// ═══════════════════════════════════
const AYETLER = [
  { text: '"Sabah namazını kıl! Çünkü sabah namazı gerçekten şahitlidir."', source: '— İsrâ Sûresi, 17:78' },
  { text: '"Allah\'ın rahmeti, iyilik edenlere yakındır."', source: '— A\'râf Sûresi, 7:56' },
  { text: '"Şüphesiz namaz, mümminlere belirli vakitlerde farz kılınmıştır."', source: '— Nisâ Sûresi, 4:103' },
  { text: '"Sabır ve namazla Allah\'tan yardım isteyin."', source: '— Bakara Sûresi, 2:45' },
  { text: '"Kim Allah\'a tevekkül ederse Allah ona yeter."', source: '— Talâk Sûresi, 65:3' },
  { text: '"Gerçekten zorluğun yanında kolaylık vardır."', source: '— İnşirâh Sûresi, 94:5' },
  { text: '"Allah, hiçbir nefse taşıyamayacağı yükü yüklemez."', source: '— Bakara Sûresi, 2:286' },
  { text: '"O hâlde beni anın ki ben de sizi anayım."', source: '— Bakara Sûresi, 2:152' },
];
let ayetIndex = Math.floor(Math.random() * AYETLER.length);

function rotateAyet() {
  ayetIndex = (ayetIndex + 1) % AYETLER.length;
  const ayet = AYETLER[ayetIndex];
  const textEl = document.getElementById('ayetText');
  const srcEl = document.getElementById('ayetSource');
  if (!textEl || !srcEl) return;
  textEl.style.opacity = '0';
  srcEl.style.opacity = '0';
  setTimeout(() => {
    textEl.textContent = ayet.text;
    srcEl.textContent = ayet.source;
    textEl.style.transition = 'opacity 0.4s';
    srcEl.style.transition = 'opacity 0.4s';
    textEl.style.opacity = '1';
    srcEl.style.opacity = '1';
  }, 250);
}

// ═══════════════════════════════════
// DATE
// ═══════════════════════════════════
const today = new Date();
const dp = document.getElementById('datePicker');
dp.value = today.toISOString().split('T')[0];
updateDate(dp.value);

async function updateDate(v) {
  const d = new Date(v + 'T12:00:00');
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  document.getElementById('displayDate').textContent = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
  document.getElementById('displayHijri').textContent = 'Hesaplanıyor...';

  try {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const res = await fetch('https://api.aladhan.com/v1/gToH?date=' + dd + '-' + mm + '-' + yyyy);
    const json = await res.json();
    if (json.code === 200) {
      const hijriMonths = ['Muharrem','Safer','Rebiülevvel','Rebiülâhir','Cemâziyelevvel','Cemâziyelâhir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'];
      const hd = json.data.hijri;
      document.getElementById('displayHijri').textContent = hd.day + ' ' + hijriMonths[parseInt(hd.month.number) - 1] + ' ' + hd.year;
    } else {
      document.getElementById('displayHijri').textContent = toHijri(d);
    }
  } catch(e) {
    document.getElementById('displayHijri').textContent = toHijri(d);
  }
}

function toHijri(d) {
  const hijriMonths = ['Muharrem','Safer','Rebiülevvel','Rebiülâhir','Cemâziyelevvel','Cemâziyelâhir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'];
  const jd = Math.floor((d.getTime() / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5965);
  l = l - Math.floor(j * 5965 / 11);
  let m = Math.floor(l / 30);
  const dy = l - Math.floor(m * 29.5001) + 29 + j;
  const mo = ((m + 1) % 12) + 1;
  const yr = 30 * n + 11 - j + Math.floor((m + 2) / 12);
  return dy + ' ' + hijriMonths[mo - 1] + ' ' + yr;
}

// ═══════════════════════════════════
// NAMAZ TOGGLE
// ═══════════════════════════════════
function toggleNamaz(el, name) {
  if (event && event.target.tagName === 'INPUT') return;
  el.classList.toggle('done');
  updateStats();
  scheduleAutoSave();
}

// ═══════════════════════════════════
// CHECKLIST TOGGLE
// ═══════════════════════════════════
function toggleCheck(li, e) {
  if (e && e.target.closest('.btn-del')) return;
  li.classList.toggle('checked');
  updateStats();
  scheduleAutoSave();
}

// ═══════════════════════════════════
// DELETE ITEM
// ═══════════════════════════════════
function deleteItem(btn, e) {
  if (e) e.stopPropagation();
  const item = btn.closest('li') || btn.closest('.reading-item') || btn.closest('.time-block') || btn.closest('.goal-item');
  if (item) {
    item.style.transition = 'opacity 0.2s, transform 0.2s';
    item.style.opacity = '0';
    item.style.transform = 'translateX(8px)';
    setTimeout(() => {
      item.remove();
      updateStats();
    }, 200);
  }
}

// ═══════════════════════════════════
// SAFE ITEM CREATION (fixes XSS)
// ═══════════════════════════════════
function createChecklistItem(text, badgeText, badgeClass) {
  const li = document.createElement('li');
  li.addEventListener('click', function(e) { toggleCheck(this, e); });

  const checkbox = document.createElement('div');
  checkbox.className = 'checkbox';

  const textSpan = document.createElement('span');
  textSpan.className = 'check-text';
  textSpan.textContent = text;

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-del';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', function(e) { deleteItem(this, e); });

  li.appendChild(checkbox);
  li.appendChild(textSpan);

  if (badgeText) {
    const badge = document.createElement('span');
    badge.className = 'check-badge' + (badgeClass ? ' ' + badgeClass : '');
    badge.textContent = badgeText;
    li.appendChild(badge);
  }

  li.appendChild(delBtn);
  return li;
}

function createGoalItem(text) {
  const li = document.createElement('li');
  li.className = 'goal-item';
  li.addEventListener('click', function(e) { toggleGoal(this, e); });

  const cb = document.createElement('div');
  cb.className = 'goal-cb';

  const textSpan = document.createElement('span');
  textSpan.className = 'goal-text';
  textSpan.textContent = text;

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-del';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', function(e) { deleteItem(this, e); });

  li.appendChild(cb);
  li.appendChild(textSpan);
  li.appendChild(delBtn);
  return li;
}

// ═══════════════════════════════════
// ADD FUNCTIONS
// ═══════════════════════════════════
function addSabah() {
  const inp = document.getElementById('sabahInput');
  const val = inp.value.trim();
  if (!val) return;
  document.getElementById('sabahList').appendChild(createChecklistItem(val));
  inp.value = '';
  updateStats();
  scheduleAutoSave();
}

function addVird() {
  const inp = document.getElementById('virdInput');
  const val = inp.value.trim();
  if (!val) return;
  document.getElementById('virdList').appendChild(createChecklistItem(val));
  inp.value = '';
  updateStats();
  scheduleAutoSave();
}

function addProgram() {
  const tInp = document.getElementById('progTime');
  const cInp = document.getElementById('progContent');
  const tVal = tInp.value.trim() || '00:00-00:00';
  const cVal = cInp.value.trim();
  if (!cVal) return;

  const li = document.createElement('li');
  li.className = 'time-block';

  const timeInput = document.createElement('input');
  timeInput.className = 'tb-time-input';
  timeInput.type = 'text';
  timeInput.value = tVal;

  const contentInput = document.createElement('input');
  contentInput.className = 'tb-content';
  contentInput.type = 'text';
  contentInput.value = cVal;

  const select = document.createElement('select');
  select.className = 'tb-pill pill-calisma';
  select.addEventListener('change', function() { changePill(this); });
  [['pill-ibadet','İbadet'],['pill-calisma','Çalışma'],['pill-kisisel','Kişisel'],['pill-dinlenme','Dinlenme']].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    if (val === 'pill-calisma') opt.selected = true;
    select.appendChild(opt);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-del';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', function(e) { deleteItem(this, e); });

  li.appendChild(timeInput);
  li.appendChild(contentInput);
  li.appendChild(select);
  li.appendChild(delBtn);
  document.querySelector('.time-block-list').appendChild(li);
  tInp.value = '';
  cInp.value = '';
  scheduleAutoSave();
}

function addReading() {
  const tInp = document.getElementById('readTitle');
  const maxInp = document.getElementById('readMax');
  const tVal = tInp.value.trim();
  const maxVal = parseInt(maxInp.value) || 100;
  if (!tVal) return;

  const newId = 'read-' + Date.now();
  const div = document.createElement('div');
  div.className = 'reading-item';

  const header = document.createElement('div');
  header.className = 'reading-header';

  const title = document.createElement('span');
  title.className = 'reading-title';
  title.textContent = '📖 ' + tVal;

  const pct = document.createElement('span');
  pct.className = 'reading-pct';
  pct.id = newId + '-pct';
  pct.textContent = '0%';

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-del';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', function(e) { deleteItem(this, e); });

  header.appendChild(title);
  header.appendChild(pct);
  header.appendChild(delBtn);

  const barBg = document.createElement('div');
  barBg.className = 'reading-bar-bg';
  const bar = document.createElement('div');
  bar.className = 'reading-bar';
  bar.id = newId + '-bar';
  bar.style.width = '0%';
  barBg.appendChild(bar);

  const controls = document.createElement('div');
  controls.className = 'reading-controls';
  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = String(maxVal);
  range.value = '0';
  range.id = newId + '-range';
  range.addEventListener('input', function() { updateReading(newId, this.value, maxVal); });

  const note = document.createElement('span');
  note.className = 'reading-note';
  note.id = newId + '-note';
  note.textContent = '0 / ' + maxVal + ' sayfa';

  controls.appendChild(range);
  controls.appendChild(note);

  div.appendChild(header);
  div.appendChild(barBg);
  div.appendChild(controls);
  document.querySelector('.reading-items').appendChild(div);
  tInp.value = '';
  maxInp.value = '';
  updateStats();
  scheduleAutoSave();
}

function addGoal() {
  const inp = document.getElementById('goalInput');
  const val = inp.value.trim();
  if (!val) return;
  document.getElementById('goalList').appendChild(createGoalItem(val));
  inp.value = '';
  updateStats();
  scheduleAutoSave();
}

// ═══════════════════════════════════
// TOGGLE GOAL
// ═══════════════════════════════════
function toggleGoal(li, e) {
  if (e && e.target.closest('.btn-del')) return;
  li.classList.toggle('done-goal');
  updateStats();
  scheduleAutoSave();
}

// ═══════════════════════════════════
// READING UPDATE
// ═══════════════════════════════════
function updateReading(id, v, max) {
  const pct = Math.round((v / max) * 100);
  const barEl = document.getElementById(id + '-bar');
  const pctEl = document.getElementById(id + '-pct');
  const noteEl = document.getElementById(id + '-note');
  if (barEl) barEl.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (noteEl) noteEl.textContent = v + ' / ' + max + ' sayfa';
  updateStats();
  scheduleAutoSave();
}

// ═══════════════════════════════════
// STAR RATING
// ═══════════════════════════════════
function rateStar(n) {
  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('lit', i < n);
  });
  scheduleAutoSave();
}

// ═══════════════════════════════════
// PILL CHANGE
// ═══════════════════════════════════
function changePill(selectEl) {
  selectEl.classList.remove('pill-ibadet', 'pill-calisma', 'pill-kisisel', 'pill-dinlenme');
  selectEl.classList.add(selectEl.value);
}

// ═══════════════════════════════════
// STATS UPDATE
// ═══════════════════════════════════
function updateStats() {
  const namazDone = document.querySelectorAll('#namazGrid .namaz-item.done').length;
  const namazEl = document.getElementById('namazCount');
  namazEl.textContent = namazDone + '/5';
  namazEl.classList.toggle('all-done', namazDone === 5);

  const virdTotal = document.querySelectorAll('#virdList li').length;
  const virdDone = document.querySelectorAll('#virdList li.checked').length;
  const virdEl = document.getElementById('virdCount');
  virdEl.textContent = virdDone + '/' + virdTotal;
  virdEl.classList.toggle('all-done', virdDone === virdTotal && virdTotal > 0);

  const hedefTotal = document.querySelectorAll('#goalList li').length;
  const hedefDone = document.querySelectorAll('#goalList li.done-goal').length;
  const hedefEl = document.getElementById('hedefCount');
  hedefEl.textContent = hedefDone + '/' + hedefTotal;
  hedefEl.classList.toggle('all-done', hedefDone === hedefTotal && hedefTotal > 0);

  const readingPcts = Array.from(document.querySelectorAll('.reading-pct'));
  const totalReadPct = readingPcts.reduce((sum, p) => sum + (parseInt(p.textContent) || 0), 0);
  const avgRead = readingPcts.length > 0 ? Math.round(totalReadPct / readingPcts.length) : 0;
  document.getElementById('okumaCount').textContent = avgRead + '%';

  // Global progress
  const sabahTotal = document.querySelectorAll('#sabahList li').length;
  const sabahDone = document.querySelectorAll('#sabahList li.checked').length;
  const totalItems = 5 + virdTotal + hedefTotal + sabahTotal;
  const doneItems = namazDone + virdDone + hedefDone + sabahDone;
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  document.getElementById('globalProgress').style.width = pct + '%';
  document.getElementById('globalPct').textContent = pct + '%';
}

// ═══════════════════════════════════
// LOCAL STORAGE AUTO-SAVE
// ═══════════════════════════════════
let autoSaveTimer = null;

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveToLocalStorage, 1500);
}

function saveToLocalStorage() {
  try {
    const dateStr = document.getElementById('datePicker').value;
    const data = collectPageData();
    localStorage.setItem('planner_' + dateStr, JSON.stringify(data));
    showAutosaveIndicator();
  } catch(e) {
    // silently ignore storage errors
  }
}

function showAutosaveIndicator() {
  // Small non-intrusive visual cue handled by CSS
}

function loadFromLocalStorage() {
  try {
    const dateStr = document.getElementById('datePicker').value;
    const raw = localStorage.getItem('planner_' + dateStr);
    if (!raw) return;
    const data = JSON.parse(raw);

    // Restore namaz states
    if (data.namazStates) {
      const items = document.querySelectorAll('#namazGrid .namaz-item');
      items.forEach((item, i) => {
        if (data.namazStates[i]) item.classList.add('done');
      });
    }

    // Restore prayer times
    if (data.namazTimes) {
      const inputs = document.querySelectorAll('#namazGrid .namaz-time-input');
      inputs.forEach((inp, i) => {
        if (data.namazTimes[i]) inp.value = data.namazTimes[i];
      });
    }

    // Restore sabah list
    if (data.sabahList) {
      const ul = document.getElementById('sabahList');
      ul.innerHTML = '';
      data.sabahList.forEach(item => {
        const li = createChecklistItem(item.text, item.badge, item.badgeClass);
        if (item.checked) li.classList.add('checked');
        ul.appendChild(li);
      });
    }

    // Restore vird list
    if (data.virdList) {
      const ul = document.getElementById('virdList');
      ul.innerHTML = '';
      data.virdList.forEach(item => {
        const li = createChecklistItem(item.text, item.badge, item.badgeClass);
        if (item.checked) li.classList.add('checked');
        ul.appendChild(li);
      });
    }

    // Restore goals
    if (data.goalsList) {
      const ul = document.getElementById('goalList');
      ul.innerHTML = '';
      data.goalsList.forEach(item => {
        const li = createGoalItem(item.text);
        if (item.checked) li.classList.add('done-goal');
        ul.appendChild(li);
      });
    }

    // Restore star rating
    if (data.stars) rateStar(data.stars);

    // Restore text fields
    if (data.sukran) document.getElementById('sukranInput').value = data.sukran;
    if (data.notes) document.getElementById('notesArea').value = data.notes;
    if (data.dua) document.getElementById('duaInput').value = data.dua;

    updateStats();
  } catch(e) {
    // ignore
  }
}

function collectPageData() {
  const namazStates = Array.from(document.querySelectorAll('#namazGrid .namaz-item')).map(el => el.classList.contains('done'));
  const namazTimes = Array.from(document.querySelectorAll('#namazGrid .namaz-time-input')).map(el => el.value);

  const sabahList = Array.from(document.querySelectorAll('#sabahList li')).map(li => ({
    text: li.querySelector('.check-text')?.textContent || '',
    checked: li.classList.contains('checked'),
    badge: li.querySelector('.check-badge')?.textContent || null,
    badgeClass: li.querySelector('.check-badge.gold') ? 'gold' : null,
  }));

  const virdList = Array.from(document.querySelectorAll('#virdList li')).map(li => ({
    text: li.querySelector('.check-text')?.textContent || '',
    checked: li.classList.contains('checked'),
    badge: li.querySelector('.check-badge')?.textContent || null,
    badgeClass: li.querySelector('.check-badge.gold') ? 'gold' : null,
  }));

  const goalsList = Array.from(document.querySelectorAll('#goalList li')).map(li => ({
    text: li.querySelector('.goal-text')?.textContent || '',
    checked: li.classList.contains('done-goal'),
  }));

  let stars = 0;
  document.querySelectorAll('#stars .star').forEach((s, i) => {
    if (s.classList.contains('lit')) stars = i + 1;
  });

  return {
    namazStates, namazTimes, sabahList, virdList, goalsList, stars,
    sukran: document.getElementById('sukranInput')?.value || '',
    notes: document.getElementById('notesArea')?.value || '',
    dua: document.getElementById('duaInput')?.value || '',
    savedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════
// KEYBOARD SHORTCUT: Ctrl+S / Cmd+S
// ═══════════════════════════════════
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (typeof window.saveDayData === 'function') {
      window.saveDayData();
    } else {
      saveToLocalStorage();
      showToast('Yerel olarak kaydedildi (giriş yapınız)', 'info');
    }
  }
});

// ═══════════════════════════════════
// AUTO-SAVE ON TEXT INPUT CHANGES
// ═══════════════════════════════════
['sukranInput', 'notesArea', 'duaInput'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', scheduleAutoSave);
});

// ═══════════════════════════════════
// INIT
// ═══════════════════════════════════
updateStats();
loadFromLocalStorage();
highlightCurrentPrayer();

// Reload localStorage when date changes
document.getElementById('datePicker').addEventListener('change', function() {
  updateDate(this.value);
  loadFromLocalStorage();
});
