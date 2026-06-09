(() => {
  const LS = 'bloomcal_v1';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const sampleEvents = [
    {id:'e1',title:'Cumpleaños Laura',date:'2026-05-25',time:'19:00',color:'#ffb4c6',emoji:'🎂',photo:'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=60',tags:['cumpleaños'],desc:'Cena sorpresa con amigas.',stickers:['🎉','💖'],comments:['¡Trae la tarta!']},
    {id:'e2',title:'Viaje a Sevilla',date:'2026-06-12',time:'08:00',color:'#ffd6a5',emoji:'✈️',photo:'https://images.unsplash.com/photo-1502920917128-1aa500764b7b?w=800&q=60',tags:['viaje'],desc:'Reservar hotel y entradas.',stickers:['🌸','📸'],comments:['No olvidar la cámara.']},
    {id:'e3',title:'Concierto - Aurora',date:'2026-05-30',time:'21:00',color:'#c4b5fd',emoji:'🎵',photo:'https://images.unsplash.com/photo-1508973378834-1b8f63d0d9a8?w=800&q=60',tags:['concierto'],desc:'Ir con Marta.',stickers:['✨'],comments:[]},
    {id:'e4',title:'Examen Filosofía',date:'2026-06-02',time:'09:00',color:'#bbf7d0',emoji:'📚',photo:'',tags:['examen'],desc:'Repasar apuntes.',stickers:['📝'],comments:['Repasar capítulo 3.']},
    {id:'e5',title:'Día de autocuidado',date:'2026-05-22',time:'10:00',color:'#fbcfe8',emoji:'🛁',photo:'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&q=60',tags:['autocuidado'],desc:'Spa y lectura.',stickers:['🫧','🌸'],comments:['Reservar masaje.']},
    {id:'e6',title:'Rutina Gym',date:'2026-05-20',time:'07:00',color:'#bbdefb',emoji:'🏋️‍♀️',photo:'',tags:['rutina'],desc:'Pecho y cardio',stickers:['💪'],comments:[]},
    {id:'e7',title:'Noche de películas',date:'2026-05-28',time:'21:30',color:'#fce7f3',emoji:'🎬',photo:'',tags:['ocio'],desc:'Maratón con amigas',stickers:['🍿'],comments:['Películas: Inception']},
    {id:'e8',title:'Cita médica',date:'2026-05-26',time:'11:00',color:'#c7f9cc',emoji:'🩺',photo:'',tags:['salud'],desc:'Chequeo anual',stickers:['❤️'],comments:[]},
    {id:'e9',title:'Vacaciones - Costa',date:'2026-07-10',time:'',color:'#ffd6e0',emoji:'🏖️',photo:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60',tags:['vacaciones'],desc:'Reservar actividades',stickers:['🌞'],comments:[]}
  ];

  let state = { events: [] , theme:'light', period:{lastStart:'2026-05-01',length:5,cycle:28}};

  function load(){ const raw = localStorage.getItem(LS); if(raw) state = JSON.parse(raw); else { state.events = sampleEvents; save(); } render(); }
  function save(){ localStorage.setItem(LS, JSON.stringify(state)); }

  // Calendar helpers
  let curDate = new Date();
  function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
  function render(){ renderMonth(curDate); renderTodaySummary(); renderCountdown(); }

  function renderMonth(d){
    const start = startOfMonth(d); const year = start.getFullYear(); const month = start.getMonth();
    const title = start.toLocaleString('es',{month:'long', year:'numeric'});
    $('#monthTitle').textContent = title.charAt(0).toUpperCase()+title.slice(1);
    const grid = $('#calendarGrid'); grid.innerHTML='';
    const firstWeekday = start.getDay(); const days = new Date(year, month+1, 0).getDate();
    // pad
    for(let i=0;i<firstWeekday;i++){ const cell=document.createElement('div'); cell.className='day empty'; grid.appendChild(cell); }
    for(let day=1; day<=days; day++){
      const cell = document.createElement('div'); cell.className='day'; const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      cell.innerHTML = `<div class="date">${day}</div><div class="events" id="day-${dateStr}"></div>`;
      const evs = state.events.filter(e=> e.date===dateStr);
  evs.slice(0,3).forEach(ev=>{ const pill = document.createElement('div'); pill.className='note-pill'; pill.style.background = ev.color; pill.textContent = (ev.emoji? ev.emoji+' ':'')+ev.title; pill.addEventListener('click',(e)=>{ e.stopPropagation(); openEvent(ev); }); cell.querySelector('.events').appendChild(pill); });
      // period highlight
      if(isPeriodDay(dateStr)){ cell.style.boxShadow = 'inset 0 0 0 2px rgba(219,39,119,0.12)'; }
      cell.addEventListener('click', ()=>{ openDay(dateStr); });
      grid.appendChild(cell);
    }
  }

  function prevMonth(){ curDate.setMonth(curDate.getMonth()-1); render(); }
  function nextMonth(){ curDate.setMonth(curDate.getMonth()+1); render(); }

  function openDay(dateStr){ // show events list
    const list = state.events.filter(e=> e.date===dateStr);
    // populate agendaList
    const agenda = $('#agendaList'); agenda.innerHTML='';
    if(list.length===0) agenda.innerHTML = '<div class="text-sm text-gray-500">No hay eventos</div>';
    list.forEach(ev=>{
      const div = document.createElement('div'); div.className='ev-item'; div.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong style="display:flex;align-items:center;gap:8px">${ev.emoji?'<span style=\"font-size:20px\">'+ev.emoji+'</span>':''}<span>${ev.title}</span></strong><div class="text-xs">${ev.time||''} • ${ev.tags.join(', ')}</div></div><div><button class="btn-edit-ev" data-id="${ev.id}">Editar</button></div></div>`; agenda.appendChild(div);
      div.querySelector('.btn-edit-ev')?.addEventListener('click', ()=> openEvent(ev));
    });
  }

  function openEvent(ev){ // open modal with event data
    $('#eventModal').classList.remove('hidden'); $('#eventModal').classList.add('fade-in');
    $('#evTitle').value = ev.title; $('#evLocation').value = ev.location||''; $('#evDesc').value = ev.desc||''; $('#evDate').value = ev.date; $('#evTime').value = ev.time||''; $('#evColor').value = ev.color||'#ff8aa2'; $('#evEmoji').value = ev.emoji||''; $('#evPhoto').value = ev.photo||''; $('#evMusic').value = ev.music||''; $('#eventModal').dataset.editId = ev.id;
    // stickers
    const sdiv = $('#eventStickers'); sdiv.innerHTML=''; (ev.stickers||[]).forEach(st=>{ const sp = document.createElement('div'); sp.className='sticker'; sp.textContent = st; sdiv.appendChild(sp); });
    // comments
    const cm = $('#comments'); cm.innerHTML=''; (ev.comments||[]).forEach(c=>{ const p = document.createElement('div'); p.className='text-sm'; p.textContent = c; cm.appendChild(p); });
  }

  function newEvent(){ $('#eventModal').classList.remove('hidden'); $('#eventModal').classList.add('fade-in'); $('#eventModal').dataset.editId=''; $('#evTitle').value=''; $('#evDesc').value=''; $('#evDate').value = new Date().toISOString().slice(0,10); $('#evTime').value=''; $('#evColor').value='#ff8aa2'; $('#evEmoji').value=''; $('#evPhoto').value=''; }

  function saveEvent(){ const id = $('#eventModal').dataset.editId || ('ev'+Date.now()); const ev = state.events.find(x=>x.id===id); const data = {id,title:$('#evTitle').value, desc:$('#evDesc').value, date:$('#evDate').value, time:$('#evTime').value, color:$('#evColor').value, emoji:$('#evEmoji').value, photo:$('#evPhoto').value, tags:[]}; if(ev){ Object.assign(ev,data);} else state.events.push(data); save(); $('#eventModal').classList.add('hidden'); render(); }

  // add comment
  $('#addComment')?.addEventListener('click', ()=>{
    const id = $('#eventModal').dataset.editId; if(!id) return; const ev = state.events.find(e=> e.id===id); if(!ev) return; const txt = $('#newComment').value; if(!txt) return; ev.comments = ev.comments||[]; ev.comments.push(txt); save(); openEvent(ev); $('#newComment').value='';
  });

  // stickers drag/drop simple
  $$('#stickersPanel .sticker').forEach(s=>{
    s.addEventListener('dragstart', (ev)=>{ ev.dataTransfer.setData('text/plain', s.dataset.sticker); });
  });
  document.addEventListener('dragover', (e)=> e.preventDefault());
  document.addEventListener('drop', (e)=>{
    const data = e.dataTransfer.getData('text/plain'); if(!data) return; // if drop over event modal, add sticker
    const rect = $('#eventModal')?.getBoundingClientRect(); if(rect && e.clientX>rect.left && e.clientX<rect.right && e.clientY>rect.top && e.clientY<rect.bottom){ const id = $('#eventModal').dataset.editId; if(!id) return; const ev = state.events.find(x=>x.id===id); ev.stickers = ev.stickers||[]; ev.stickers.push(data); save(); openEvent(ev); }
  });

  // memories
  function renderMemories(){ const mem = $('#memories'); mem.innerHTML=''; state.events.filter(e=> e.photo).slice(0,4).forEach(e=>{ const img = document.createElement('img'); img.src = e.photo; mem.appendChild(img); }); }

  // stats chart
  function renderStats(){ const ctx = document.getElementById('statsChart'); if(!ctx) return; const months = Array.from({length:6}).map((_,i)=>{ const d = new Date(); d.setMonth(d.getMonth()-i); return d.toLocaleString('es',{month:'short'}); }).reverse(); const counts = months.map(m=> Math.floor(Math.random()*8)+2); new Chart(ctx,{type:'bar',data:{labels:months,datasets:[{label:'Eventos',data:counts,backgroundColor:'#fbcfe8'}]}});
  }


  // countdown to nearest event
  function renderCountdown(){ const future = state.events.filter(e=> new Date(e.date+'T'+(e.time||'00:00')) > new Date()).sort((a,b)=> new Date(a.date+'T'+(a.time||'00:00')) - new Date(b.date+'T'+(b.time||'00:00')))[0]; if(!future){ $('#countdown').textContent = '-'; return; } const diff = new Date(future.date+'T'+(future.time||'00:00')) - new Date(); const days = Math.floor(diff / (1000*60*60*24)); $('#countdown').textContent = `${future.emoji||''} ${future.title}: ${days} días`; }

  // Period tracking (simple prediction)
  function isPeriodDay(dateStr){ if(!state.period.lastStart) return false; const last = new Date(state.period.lastStart); const daysSince = (new Date(dateStr) - last) / (1000*60*60*24); const cycle = state.period.cycle || 28; const mod = ((daysSince % cycle)+cycle)%cycle; return mod >=0 && mod < (state.period.length||5); }

  function renderTodaySummary(){ const today = new Date().toISOString().slice(0,10); const evs = state.events.filter(e=> e.date===today); if(evs.length===0) $('#todaySummary').textContent = 'No hay eventos hoy'; else $('#todaySummary').textContent = evs.map(e=> (e.emoji? e.emoji+' ':'')+e.title + ' @'+(e.time||'')).join(' · ');
  }

  // events
  $('#prevM').addEventListener('click', prevMonth); $('#nextM').addEventListener('click', nextMonth);
  $('#newEvent').addEventListener('click', newEvent); $('#closeEvent').addEventListener('click', ()=> $('#eventModal').classList.add('hidden'));
  $('#saveEvent').addEventListener('click', saveEvent);
  $('#toggleTheme').addEventListener('click', ()=>{ document.body.classList.toggle('dark'); });
  $('#eventModal').addEventListener('click', (e)=>{ if(e.target.id==='eventModal') $('#eventModal').classList.add('hidden'); });

  function render(){ renderMonth(curDate); renderTodaySummary(); renderCountdown(); renderMemories(); renderStats(); }

  document.addEventListener('DOMContentLoaded', load);

})();
