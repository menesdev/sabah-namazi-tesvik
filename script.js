// TARİH
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
      
      const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${dd}-${mm}-${yyyy}`);
      const json = await res.json();
      
      if (json.code === 200) {
        const hijriMonths = ['Muharrem','Safer','Rebiülevvel','Rebiülâhir','Cemâziyelevvel','Cemâziyelâhir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'];
        const hd = json.data.hijri;
        const hMonthIndex = parseInt(hd.month.number) - 1;
        document.getElementById('displayHijri').textContent = hd.day + ' ' + hijriMonths[hMonthIndex] + ' ' + hd.year;
      } else {
        document.getElementById('displayHijri').textContent = toHijri(d);
      }
    } catch(e) {
      document.getElementById('displayHijri').textContent = toHijri(d);
    }
  }

  function toHijri(d) {
    const hijriMonths = ['Muharrem','Safer','Rebiülevvel','Rebiülâhir','Cemâziyelevvel','Cemâziyelâhir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'];
    const jd = Math.floor((d.getTime()/86400000)+2440587.5);
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l-1)/10631);
    l = l - 10631*n + 354;
    const j = Math.floor((10985-l)/5965);
    l = l - Math.floor(j*5965/11);
    let m = Math.floor(l/30);
    const dy = l - Math.floor(m*29.5001) + 29 + j;
    let mo = ((m + 1) % 12) + 1;
    const yr = 30*n + 11 - j + Math.floor((m+2)/12);
    return dy + ' ' + hijriMonths[mo-1] + ' ' + yr;
  }

  // NAMAZ TOGGLE
  function toggleNamaz(el, name) {
    if (event && event.target.tagName === 'INPUT') return;
    el.classList.toggle('done');
    updateStats();
  }

  // CHECKLIST TOGGLE
  function toggleCheck(li, e) {
    if (e && e.target.closest('.btn-del')) return;
    li.classList.toggle('checked');
    updateStats();
  }

  
  // Item silme fonksiyonu
  function deleteItem(btn, e) {
    if (e) e.stopPropagation();
    const item = btn.closest('li') || btn.closest('.reading-item') || btn.closest('.time-block') || btn.closest('.goal-item');
    if(item) {
      item.remove();
      updateStats();
    }
  }

  function addSabah() {
    const inp = document.getElementById('sabahInput');
    const val = inp.value.trim();
    if (!val) return;
    const li = document.createElement('li');
    li.onclick = function(e){ toggleCheck(this, e); };
    li.innerHTML = '<div class="checkbox"></div><span class="check-text">' + val + '</span><button class="btn-del" onclick="deleteItem(this, event)">✕</button>';
    document.getElementById('sabahList').appendChild(li);
    inp.value = '';
    updateStats();
  }

  function addVird() {
    const inp = document.getElementById('virdInput');
    const val = inp.value.trim();
    if (!val) return;
    const li = document.createElement('li');
    li.onclick = function(e){ toggleCheck(this, e); };
    li.innerHTML = '<div class="checkbox"></div><span class="check-text">' + val + '</span><button class="btn-del" onclick="deleteItem(this, event)">✕</button>';
    document.getElementById('virdList').appendChild(li);
    inp.value = '';
    updateStats();
  }

  function addProgram() {
    const tInp = document.getElementById('progTime');
    const cInp = document.getElementById('progContent');
    const tVal = tInp.value.trim() || '00:00-00:00';
    const cVal = cInp.value.trim();
    if (!cVal) return;
    
    const li = document.createElement('li');
    li.className = 'time-block';
    li.innerHTML = `
      <input class="tb-time-input" type="text" value="${tVal}" />
      <input class="tb-content" type="text" value="${cVal}" />
      <select class="tb-pill pill-calisma" onchange="changePill(this)">
        <option value="pill-ibadet">İbadet</option>
        <option value="pill-calisma" selected>Çalışma</option>
        <option value="pill-kisisel">Kişisel</option>
        <option value="pill-dinlenme">Dinlenme</option>
      </select>
      <button class="btn-del" onclick="deleteItem(this, event)">✕</button>
    `;
    document.querySelector('.time-block-list').appendChild(li);
    tInp.value = '';
    cInp.value = '';
    updateStats();
  }

  function addReading() {
    const tInp = document.getElementById('readTitle');
    const maxInp = document.getElementById('readMax');
    const tVal = tInp.value.trim();
    const maxVal = parseInt(maxInp.value) || 100;
    if (!tVal) return;
    
    // Generate a unique id
    const newId = 'read-' + Date.now();
    
    const div = document.createElement('div');
    div.className = 'reading-item';
    div.innerHTML = `
      <div class="reading-header">
        <span class="reading-title">📖 ${tVal}</span>
        <span class="reading-pct" id="${newId}-pct">0%</span>
        <button class="btn-del" onclick="deleteItem(this, event)">✕</button>
      </div>
      <div class="reading-bar-bg">
        <div class="reading-bar" id="${newId}-bar" style="width:0%"></div>
      </div>
      <div class="reading-controls">
        <input type="range" min="0" max="${maxVal}" value="0" id="${newId}-range" oninput="updateReading('${newId}',this.value,${maxVal})" />
        <span class="reading-note" id="${newId}-note">0 / ${maxVal} sayfa</span>
      </div>
    `;
    document.querySelector('.reading-items').appendChild(div);
    tInp.value = '';
    maxInp.value = '';
    updateStats();
  }


  // GOAL
  function addGoal() {
    const inp = document.getElementById('goalInput');
    const val = inp.value.trim();
    if (!val) return;
    const li = document.createElement('li');
    li.className = 'goal-item';
    li.onclick = function(){ toggleGoal(this, event); };
    li.innerHTML = '<div class="goal-cb"></div><span class="goal-text">' + val + '</span><button class="btn-del" onclick="deleteItem(this, event)">✕</button>';
    document.getElementById('goalList').appendChild(li);
    inp.value = '';
    updateStats();
  }

  function toggleGoal(li, e) {
    if (e && e.target.closest('.btn-del')) return;
    li.classList.toggle('done-goal');
    updateStats();
  }

  // OKUMA
  function updateReading(id, v, max) {
    const pct = Math.round((v/max)*100);
    document.getElementById(id+'-bar').style.width = pct+'%';
    document.getElementById(id+'-pct').textContent = pct+'%';
    document.getElementById(id+'-note').textContent = v+' / '+max+' sayfa';
    updateStats();
  }

  // YILDIZ
  function rateStar(n) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((s,i) => { s.classList.toggle('lit', i < n); });
  }

  // STATS GÜNCELLE
  function updateStats() {
    const namazDone = document.querySelectorAll('#namazGrid .namaz-item.done').length;
    document.getElementById('namazCount').textContent = namazDone+'/5';

    const virdTotal = document.querySelectorAll('#virdList li').length;
    const virdDone = document.querySelectorAll('#virdList li.checked').length;
    document.getElementById('virdCount').textContent = virdDone+'/'+virdTotal;

    const hedefTotal = document.querySelectorAll('#goalList li').length;
    const hedefDone = document.querySelectorAll('#goalList li.done-goal').length;
    document.getElementById('hedefCount').textContent = hedefDone+'/'+hedefTotal;

    const readingPcts = Array.from(document.querySelectorAll('.reading-pct'));
    let totalReadPct = 0;
    readingPcts.forEach(p => {
       totalReadPct += parseInt(p.textContent) || 0;
    });
    const avgRead = readingPcts.length > 0 ? Math.round(totalReadPct / readingPcts.length) : 0;
    document.getElementById('okumaCount').textContent = avgRead+'%';

    // GLOBAL PROGRESS
    const sabahDone = document.querySelectorAll('#sabahList li.checked').length;
    const sabahTotal = document.querySelectorAll('#sabahList li').length;
    const totalItems = 5 + virdTotal + hedefTotal + sabahTotal;
    const donedItems = namazDone + virdDone + hedefDone + sabahDone;
    const pct = totalItems > 0 ? Math.round((donedItems/totalItems)*100) : 0;
    document.getElementById('globalProgress').style.width = pct+'%';
    document.getElementById('globalPct').textContent = pct+'%';
  }

  updateStats();
  function changePill(selectEl) {
    // Remove old pill-* class
    selectEl.classList.remove('pill-ibadet', 'pill-calisma', 'pill-kisisel', 'pill-dinlenme');
    // Add new selected class
    selectEl.classList.add(selectEl.value);
  }
