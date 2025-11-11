// global small scripts: announcements, forms, calendar, nav
(function(){
  // Utility
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Set years in footer
  const ys = [ '#year','#year-2','#year-3','#year-4','#year-5','#year-6'];
  ys.forEach(id => {
    const el = document.querySelector(id);
    if(el) el.textContent = new Date().getFullYear();
  });

  // mobile nav toggle
  ['#nav-toggle','#nav-toggle-2','#nav-toggle-3','#nav-toggle-4','#nav-toggle-5','#nav-toggle-6'].forEach(btnId=>{
    const btn = document.querySelector(btnId);
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      const menu = document.querySelector('.main-nav');
      if(menu) menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    });
  });

  // Announcements & Callboard 
  const initialAnnouncements = [
    {id:1, title:"Auditions this Friday", body:"Auditions for 'Echoes in the Atrium' — bring a 1-minute monologue. 6pm-9pm."},
    {id:2, title:"Tech rehearsal", body:"Tech run Thursday 18:00. Please be on time."},
  ];
  function getAnnouncements(){ return JSON.parse(localStorage.getItem('aurora.ann') || 'null') || initialAnnouncements }
  function saveAnnouncements(arr){ localStorage.setItem('aurora.ann', JSON.stringify(arr)) }
  function renderAnnouncements(){
    const list = $('#announcements');
    if(!list) return;
    list.innerHTML = '';
    getAnnouncements().forEach(a=>{
      const box = document.createElement('div');
      box.className = 'notice';
      box.innerHTML = `<strong>${a.title}</strong><p class="muted">${a.body}</p>`;
      list.appendChild(box);
    });
    // callboard sample
    const cb = $('#callboard-list');
    if(cb){
      cb.innerHTML = '';
      const items = ["Props meeting 4pm", "Volunteer training Sat 10am", "Poster distribution needed"];
      items.forEach(i=>{
        const li = document.createElement('li'); li.textContent = i; cb.appendChild(li);
      });
    }
  }
  renderAnnouncements();

  // Quick add announcement 
  const newAnnBtn = $('#new-ann-btn');
  if(newAnnBtn){
    newAnnBtn.addEventListener('click', ()=>{
      const title = prompt('Quick note title');
      if(!title) return;
      const body = prompt('Short message');
      const arr = getAnnouncements();
      arr.unshift({id:Date.now(), title, body});
      saveAnnouncements(arr.slice(0,8));
      renderAnnouncements();
      toast('Note added to announcements');
    });
  }

  // Toast
  function toast(msg, time=2200){
    const t = $('#toast');
    if(!t) return;
    t.hidden = false;
    t.textContent = msg;
    t.style.opacity = 1;
    setTimeout(()=>{ t.style.opacity = 0; setTimeout(()=>t.hidden=true,300); }, time);
  }


const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby47m_bHMCCpjIxd1AzallQK2EEpN4M_wRIEf-olLC3ThClsCvOTbe9awrRgrlT_cD2/exec'; 

function handleForm(formEl, formType){
  if(!formEl) return;
  formEl.addEventListener('submit', e=>{
    e.preventDefault();

    const formData = new FormData(formEl);
    formData.append('formType', formType);

    const params = new URLSearchParams();
    for(const [k,v] of formData.entries()){ 
      params.append(k,v); 
    }

    fetch(WEB_APP_URL, {
      method: 'POST',
      body: params
    })
    .then(res => res.json())
    .then(res => {
      toast('Submission successful!');
      alert(`"${formType}" form submitted successfully!`); 
      formEl.reset();
    })
    .catch(err => {
      console.error('Form submission error:', err);
      toast('Failed to submit form. Check console.');
    });
  });
}

// Attach handlers to both forms
handleForm($('#contact-form'), 'Contact');
handleForm($('#bio-form-el'), 'Bio');

  // Contact sheet CSV download
  const downloadContacts = $('#download-contacts');
  if(downloadContacts){
    downloadContacts.addEventListener('click', ()=>{
      const rows = [
        ["Name","Role","Email","Phone"],
        ["Jordan Kim","Artistic Director","jordan@aurora.example","+1 416 555 0101"],
        ["Sana Patel","Producer","sana@aurora.example","+1 416 555 0102"],
        ["Box Office","Box Office","tickets@aurora.example","+1 416 555 0110"]
      ];
      const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'contacts.csv'; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast('Contacts CSV downloaded');
    });
  }

  // Secure page demo
  const secureCheck = $('#secure-check');
  if(secureCheck){
    secureCheck.addEventListener('click', ()=>{
      const pw = $('#secure-password').value;
      // demo password: "aurora2025" - change as desired
      if(pw === 'aurora2025'){
        $('#secure-area').hidden = false;
        toast('Access granted');
      } else {
        toast('Incorrect password');
      }
    });
  }

  /* ===== Calendar (simple month grid, events in array) ===== */
  const events = [
    {id:1,title:'Auditions',date:'2025-11-07',type:'rehearsal',desc:'Auditions 6–9pm'},
    {id:2,title:'Tech Run',date:'2025-11-19',type:'tech',desc:'Full tech run 10:00–16:00'},
    {id:3,title:'Preview',date:'2025-11-20',type:'performance',desc:'Preview night 19:30'},
    {id:4,title:'Performance',date:'2025-11-27',type:'performance',desc:'Opening night 19:30'},
  ];

  function buildMonthGrid(year, month, filter='all'){
    const calendarEl = $('#calendar');
    if(!calendarEl) return;
    calendarEl.innerHTML = '';
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0..6
    const daysInMonth = new Date(year, month+1, 0).getDate();
    // add weekday headers
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    weekdays.forEach(w=>{
      const h = document.createElement('div'); h.className='cell'; h.innerHTML = `<div class="muted">${w}</div>`; calendarEl.appendChild(h);
    });
    // create blank cells for startDay
    for(let i=0;i<startDay;i++){
      const cell = document.createElement('div'); cell.className='cell'; calendarEl.appendChild(cell);
    }
    for(let d=1; d<=daysInMonth; d++){
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cell = document.createElement('div'); cell.className='cell';
      const dateNode = document.createElement('div'); dateNode.className='date'; dateNode.textContent = d;
      cell.appendChild(dateNode);
      // add event pills
      events.filter(ev=>{
        if(filter!=='all' && ev.type!==filter) return false;
        return ev.date === dateStr;
      }).forEach(ev=>{
        const pill = document.createElement('span'); pill.className='event-pill'; pill.textContent = ev.title;
        pill.title = ev.desc;
        cell.appendChild(pill);
      });
      calendarEl.appendChild(cell);
    }
    // upcoming events list
    const upcoming = $('#upcoming-events');
    if(upcoming){
      upcoming.innerHTML = '';
      events.filter(ev => new Date(ev.date) >= new Date()).slice(0,8).forEach(ev=>{
        const li = document.createElement('li'); li.textContent = `${ev.date} — ${ev.title} (${ev.type})`; upcoming.appendChild(li);
      });
    }
  }

  // populate month/year selects if present
  const mSel = $('#month-select'), ySel = $('#year-select'), fSel = $('#event-filter');
  if(mSel && ySel){
    const now = new Date();
    for(let m=0;m<12;m++){
      const opt = document.createElement('option'); opt.value = m; opt.textContent = new Date(2020,m,1).toLocaleString(undefined,{month:'long'});
      mSel.appendChild(opt);
    }
    for(let y = now.getFullYear()-1; y <= now.getFullYear()+1; y++){
      const opt = document.createElement('option'); opt.value = y; opt.textContent = y; ySel.appendChild(opt);
    }
    mSel.value = now.getMonth();
    ySel.value = now.getFullYear();

    function redraw(){
      const yr = parseInt(ySel.value,10);
      const m = parseInt(mSel.value,10);
      const filter = fSel ? fSel.value : 'all';
      buildMonthGrid(yr,m,filter);
    }
    mSel.addEventListener('change', redraw);
    ySel.addEventListener('change', redraw);
    if(fSel) fSel.addEventListener('change', redraw);
    redraw();
  }

  // initial render for announcements on other pages
  document.addEventListener('DOMContentLoaded', ()=>{ renderAnnouncements(); });

})();




