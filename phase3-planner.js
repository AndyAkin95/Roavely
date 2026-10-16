(function phase3Planner(){
  const previousRender=render,previousHome=home;
  const api=window.roavelyNext;
  const asMoney=api.money;
  const user=()=>s.profile?.name||'Andy';
  function bag(){
    s.extras=s.extras||{};
    s.extras.savings=s.extras.savings||{};
    return s.extras.savings[s.current]||(s.extras.savings[s.current]={saved:0,goal:null});
  }
  function estimate(){
    const b=trip().estimate||{flights:900,lodging:900,transport:250,food:450,activities:300,misc:150};
    const itinerary=(s.itinerary[s.current]||[]).flatMap(x=>x.items);
    const activities=itinerary.reduce((a,b)=>a+(Number(b[3])||0),0);
    return ['flights','lodging','transport','food','misc'].reduce((n,k)=>n+Number(b[k]||0),0)+Math.max(Number(b.activities||0),activities);
  }
  function savings(){
    const p=bag(),goal=p.goal==null?estimate():Number(p.goal),saved=Number(p.saved)||0,left=Math.max(0,goal-saved),start=new Date(trip().start+'T12:00:00'),day=Math.max(0,Math.ceil((start-Date.now())/86400000)),periods=Math.max(1,Math.ceil(day/30.44)),complete=goal?Math.min(100,Math.round(saved/goal*100)):100;
    return `<section class="card savings-card"><div class="row"><div><b>💰 Your savings plan</b><div class="sub">Separate from expenses paid by your group.</div></div><span class="pill">${complete}% funded</span></div><div class="savings-line">${asMoney(saved)} <span>of ${asMoney(goal)}</span></div><div class="progress"><i style="width:${complete}%"></i></div>
      <div class="row"><div class="sub">Monthly savings needed</div><b>${asMoney(left/periods)}</b></div><p class="small-note">${periods} monthly saving period${periods===1?'':'s'} before departure · ${asMoney(left)} remaining.</p>
      <form onsubmit="roavelySaveMoney(event)" class="savings-controls"><label>Add saved money<input name="amount" aria-label="Amount saved" type="number" min="0.01" step="0.01" placeholder="100" required></label><button class="btn blue">+ Add</button></form>
      <button class="text-button" onclick="openModal('goal')">Edit savings target →</button></section>`;
  }
  window.roavelySaveMoney=e=>{
    e.preventDefault();
    const n=Number(new FormData(e.target).get('amount'));
    if(!Number.isFinite(n)||n<=0)return;
    bag().saved=Math.round((bag().saved+n)*100)/100;persist();toast('Savings updated');
  };
  window.roavelySaveGoal=e=>{
    e.preventDefault();const f=new FormData(e.target),goal=Number(f.get('goal')),saved=Number(f.get('saved'));
    if(!Number.isFinite(goal)||goal<0||!Number.isFinite(saved)||saved<0)return;
    bag().goal=goal;bag().saved=saved;modal=null;persist();
  };
  const oldModal=modalHTML;
  modalHTML=function(){
    if(modal==='goal'){
      const p=bag();
      return sheet('Personal savings target',`<form onsubmit="roavelySaveGoal(event)"><div class="field"><label>Savings goal, USD</label><input name="goal" type="number" required min="0" step="0.01" value="${p.goal??estimate()}"></div><div class="field"><label>Amount already saved, USD</label><input name="saved" type="number" required min="0" step="0.01" value="${p.saved||0}"></div><div class="actions"><button class="btn secondary" type="button" onclick="closeModal()">Cancel</button><button class="btn blue">Update</button></div></form>`);
    }
    return oldModal();
  };
  function smart(){
    const ideasList=(s.ideas[s.current]||[]).filter(x=>x.kind!=='destination');
    const scheduled=(s.itinerary[s.current]||[]).flatMap(d=>d.items).map(i=>String(i[1]).toLowerCase());
    const unscheduled=ideasList.filter(x=>!scheduled.includes(String(x.title).toLowerCase()));
    const votes=x=>{const v=Object.values(x.v||{});return {yes:v.filter(y=>y==='love'||y==='yes').length,maybe:v.filter(y=>y==='maybe').length,no:v.filter(y=>y==='no').length}};
    const score=x=>{const v=votes(x);return v.yes*2+v.maybe*.5-v.no*2};
    const city=x=>String(x.city||'Unspecified').split(/[·•,]/)[0].trim()||'Unspecified';
    const cities=[...new Set(unscheduled.map(city))];
    return `<main class="content"><div class="page-heading"><div class="sub">SMART PLANNER</div><h2>From votes to itinerary.</h2><p>Group the most-liked experiences by city, then schedule them in a few taps.</p></div>
      <div class="card soft-card"><b>Smart city grouping</b><div class="sub">Organized using cities you entered. Exact route optimization, transit times and opening hours require a geocoding and directions integration.</div></div>
      ${unscheduled.length?cities.map(name=>{
        const group=unscheduled.filter(x=>city(x)===name).sort((a,b)=>score(b)-score(a));
        return `<section class="card"><div class="row"><b>📍 ${esc(name)}</b><span class="pill">${group.length} ideas</span></div>${group.map(i=>{const v=votes(i);return `<div class="smart-row"><div><b>${esc(i.emoji)} ${esc(i.title)}</b><div class="sub">${v.yes} interested · ${v.no} pass · ${asMoney(i.cost)}</div></div><button class="btn secondary" onclick="openActivity('${i.id}')">+ Plan</button></div>`}).join('')}</section>`;
      }).join(''):'<div class="empty">Everything has been scheduled, or no activity suggestions have been added yet.</div>'}
      <button class="btn blue full-width" onclick="tab='itinerary';render()">Open itinerary →</button></main>`;
  }
  function tripMode(){
    const all=s.itinerary[s.current]||[];
    const date=new Date(),yyyy=date.getFullYear(),mm=String(date.getMonth()+1).padStart(2,'0'),dd=String(date.getDate()).padStart(2,'0'),today=`${yyyy}-${mm}-${dd}`;
    const planned=all.find(x=>x.date===today)||all[0];
    return `<main class="content"><div class="page-heading"><div class="sub">ON THE ROAD</div><h2>Trip mode.</h2><p>Quick access to your schedule, reservations, map and group.</p></div><section class="card trip-now"><div class="sub">${planned?.date===today?'TODAY':'NEXT PLANNED DAY'}</div><h3>${esc(planned?.day||'Nothing planned')}</h3>${planned?planned.items.map(i=>`<div class="event"><time>${esc(i[0])}</time><b>${esc(i[2])} ${esc(i[1])}</b></div>`).join(''):'<div class="sub">Add activities to your itinerary to see them here.</div>'}</section>
      <div class="feature-grid"><button class="feature-tile" onclick="openModal('reservations')"><span>🎟️</span><b>Reservations</b><small>Saved booking details</small></button><button class="feature-tile" onclick="tab='places';render()"><span>📍</span><b>Saved places</b><small>Open map search</small></button><button class="feature-tile" onclick="openModal('checklist')"><span>☑️</span><b>Checklist</b><small>Things to do</small></button><button class="feature-tile" onclick="tab='chat';render()"><span>💬</span><b>Group chat</b><small>Trip conversation</small></button></div><p class="small-note">Live flight alerts, route times, and reservation synchronization need external providers.</p></main>`;
  }
  home=function(){
    const body=previousHome();
    return body.replace('</main>',`<div class="section-title"><h3>Trip tools</h3><button onclick="tab='alerts';render()">🔔 Updates</button></div><div class="feature-grid"><button class="feature-tile" onclick="tab='smart';render()"><span>🧭</span><b>Smart planner</b><small>Turn votes into days</small></button><button class="feature-tile" onclick="tab='travelmode';render()"><span>🛫</span><b>Trip mode</b><small>On-the-go schedule</small></button><button class="feature-tile" onclick="tab='dates';render()"><span>📆</span><b>Availability</b><small>Pick dates together</small></button><button class="feature-tile" onclick="tab='chat';render()"><span>💬</span><b>Group chat</b><small>Discuss everything</small></button></div></main>`);
  };
  render=function(){
    if(tab==='smart'||tab==='travelmode'){api.renderPage(tab==='smart'?smart():tripMode());return}
    previousRender();
    if(tab==='budget'){
      const main=$('main.content');
      if(main&&!main.querySelector('.savings-card'))main.insertAdjacentHTML('beforeend',savings()+`<button class="btn secondary full-width" onclick="tab='wallet';render()">View group expenses →</button>`);
    }
    if(tab==='itinerary'){
      const main=$('main.content');
      if(main&&!main.querySelector('.smart-planner-link'))main.insertAdjacentHTML('beforeend',`<button class="btn secondary full-width smart-planner-link" onclick="tab='smart';render()">🧭 Organize ideas by city</button>`);
    }
  };
  save();render();
})();
