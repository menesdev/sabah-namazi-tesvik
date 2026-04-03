import { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc } from './firebase-config.js';

let currentUser = null;

// Gözlemci
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById('loginBtn');
  if (user) {
    currentUser = user;
    if(loginBtn) {
      loginBtn.textContent = 'Çıkış Yap';
      loginBtn.onclick = async () => {
        await signOut(auth);
      };
    }
  } else {
    currentUser = null;
    if(loginBtn) {
      loginBtn.textContent = 'Google İle Giriş Yap';
      loginBtn.onclick = async () => {
        try {
          await signInWithPopup(auth, provider);
        } catch(e) {
          console.error("Giriş hatası:", e);
          alert("Giriş başarısız (" + e.code + "). Lütfen Firebase yapılandırmanızı kontrol edin.");
        }
      };
    }
  }
});

window.saveDayData = async function() {
  if (!currentUser) {
    alert("Verilerinizi kaydedebilmek için lütfen önce Google ile Giriş yapın.");
    return;
  }
  
  const saveBtn = document.getElementById('saveDayBtn');
  saveBtn.textContent = 'Kaydediliyor...';
  saveBtn.disabled = true;

  try {
    const dateStr = document.getElementById('datePicker').value;

    const namazCount = document.getElementById('namazCount').textContent;
    const virdCount = document.getElementById('virdCount').textContent;
    const hedefCount = document.getElementById('hedefCount').textContent;
    const okumaCount = document.getElementById('okumaCount').textContent;

    // Sabah list
    const sabahList = [];
    document.querySelectorAll('#sabahList li').forEach(li => {
      sabahList.push({
        text: li.querySelector('.check-text').textContent,
        checked: li.classList.contains('checked')
      });
    });

    // Vird list
    const virdList = [];
    document.querySelectorAll('#virdList li').forEach(li => {
      virdList.push({
        text: li.querySelector('.check-text').textContent,
        checked: li.classList.contains('checked')
      });
    });

    // Program list
    const programList = [];
    document.querySelectorAll('.time-block-list .time-block').forEach(li => {
      programList.push({
        time: li.querySelector('.tb-time-input').value,
        content: li.querySelector('.tb-content').value,
        pill: li.querySelector('.tb-pill').value // it's a select now
      });
    });

    // Reading list
    const readingList = [];
    document.querySelectorAll('.reading-items .reading-item').forEach(item => {
      const title = item.querySelector('.reading-title').textContent.replace('📖 ', '').trim();
      const pct = item.querySelector('.reading-pct').textContent;
      const note = item.querySelector('.reading-note').textContent;
      readingList.push({ title, pct, note });
    });

    // Goals list
    const goalsList = [];
    document.querySelectorAll('#goalList li').forEach(li => {
      goalsList.push({
        text: li.querySelector('.goal-text').textContent,
        checked: li.classList.contains('done-goal')
      });
    });

    // Rating
    let stars = 0;
    document.querySelectorAll('#stars .star').forEach((s, i) => {
      if (s.classList.contains('lit')) stars = i + 1;
    });

    const sukran = document.getElementById('sukranInput')?.value || '';
    const notes = document.querySelector('.notes-area')?.value || '';
    const dua = document.querySelector('.dua-input')?.value || '';

    const dayData = {
      date: dateStr,
      namazCount,
      virdCount,
      hedefCount,
      okumaCount,
      sabahList,
      virdList,
      programList,
      readingList,
      goalsList,
      evaluation: {
        stars,
        sukran,
        notes,
        dua
      },
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, 'users', currentUser.uid, 'days', dateStr);
    await setDoc(docRef, dayData);

    alert("Gününüz başarıyla buluta kaydedildi!");
  } catch(e) {
    console.error("Kaydetme hatası:", e);
    alert("Bir hata oluştu: " + e.message);
  } finally {
    saveBtn.textContent = 'Günü Kaydet';
    saveBtn.disabled = false;
  }
};
