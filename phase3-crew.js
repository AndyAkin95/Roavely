(function addCrew() {
  const prevRender=render,prevPlan=plan,prevModal=modalHTML;
  const api=window.roavelyNext;
  let view='ideas';
  function bucket(key){
    s.extras=s.extras||{};
    s.extras[key]=s.extras[key]||{};
    return s.extras[key][s.current]||(s.extras[key][s.current]=[]);
  }
  api.alert=note=>{bucket('alerts').unshift({note,when:new Date().toISOString(),read:false});bucket('alerts').length=Math.min(bucket('alerts').length,100);save()};
  const fmt=value=>new Date(value+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
  const username=()=>s.profile?.name||'Andy';
  window.setCrewPanel=x=>{view=x;render()};
  window.addCrewMessage=e=>{
    e.preventDefault();const value=String(new FormData(e.target).get('message')||'').trim().slice(0,1000);
    if(!value)return;
    bucket('messages').push({by:username(),message:value,when:new Date().toISOString()});
    api.alert('Message added to the local group chat');persist();toast('Message saved on this device');
  };
  window.addCrewDates=e=>{
    e.preventDefault();const f=new FormData(e.target),from=String(f.get('from')),to=String(f.get('to'));
    if(!from||!to||to<from){toast('Select a valid date range');return}
    bucket('dates').unshift({id:'dates'+Date.now(),from,to,by:username(),votes:{[username()]:'yes'}});
    api.alert('New date option proposed');modal=null;persist();
  };
  window.voteCrewDates=(id,val)=>{
    const row=bucket('dates').find(x=>x.id===id);if(!row)return;
    row.votes=row.votes||{};
    if(row.votes[username()]===val)delete row.votes[username()];else row.votes[username()]=val;
    api.alert('Updated date availability');persist();
  };
  window.pickCrewDates=id=>{
    const d=bucket('dates').find(x=>x.id===id);
    if(!d||!confirm('Set these as the trip dates?'))return;
    trip().start=d.from;trip().end=d.to;api.alert('Trip dates updated');persist();
  };
  function chat(){
    return `<div class="card"><b>💬 ${esc(trip().name)} chat</b><p class="small-note">Messages are saved on this device only until live accounts are connected.</p><div class="chat-messages">${bucket('messages').map(x=>`<div class="chat-msg"><b>${esc(x.by)}</b><div class="sub">${new Date(x.when).toLocaleString()}</div><div>${esc(x.message)}</div></div>`).join('')||'<div class="empty">No messages yet. Start the conversation!</div>'}</div><form class="comment-form" onsubmit="addCrewMessage(event)"><input name="message" maxlength="1000" required placeholder="Message your crew…" aria-label="Chat message"><button aria-label="Send">➤</button></form></div>`;
  }
  function dates(){
    return `<div class="group-intro"><div><b>📆 Group availability</b><div class="sub">Suggest windows and agree on dates.</div></div><button class="btn blue" onclick="openModal('crewdates')">+ Dates</button></div>${bucket('dates').map(d=>{
      const yes=Object.values(d.votes||{}).filter(v=>v==='yes').length;
      return `<div class="card"><div class="row"><div><b>${esc(fmt(d.from))} – ${esc(fmt(d.to))}</b><div class="sub">Proposed by ${esc(d.by)}</div></div><span class="pill">${yes} available</span></div><div class="vote-row voting">${[['yes','✓ Yes'],['maybe','? Maybe'],['no','✕ No']].map(([val,label])=>`<button class="vote ${d.votes?.[username()]===val?'active':''}" onclick="voteCrewDates('${d.id}','${val}')">${label}</button>`).join('')}</div><button class="text-button" onclick="pickCrewDates('${d.id}')">Use these trip dates →</button></div>`;
    }).join('')||'<div class="empty">No available date windows proposed yet.</div>'}<div class="card soft-card"><b>No calendar connection yet</b><div class="sub">Group members will vote from their own accounts once live sync is enabled.</div></div>`;
  }
  plan=function(){
    const labels=[['ideas','Ideas'],['polls','Polls'],['chat','Chat'],['dates','Dates']];
    return `<main class="content"><div class="page-heading"><div class="sub">YOUR CREW</div><h2>Plan together.</h2><p>Find common ground, vote and discuss the best ideas.</p>${api.demoLabel()}</div><div class="segment four-tabs">${labels.map(([id,label])=>`<button class="${view===id?'active':''}" onclick="setCrewPanel('${id}')">${label}</button>`).join('')}</div>${view==='ideas'?ideas():view==='polls'?decisions():view==='chat'?chat():dates()}<button class="text-button" onclick="openModal('group')">👥 View group & invite code →</button></main>`;
  };
  modalHTML=function(){
    if(modal==='crewdates')return sheet('Propose dates',`<form onsubmit="addCrewDates(event)"><div class="field"><label>Start</label><input type="date" name="from" required></div><div class="field"><label>End</label><input type="date" name="to" required></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Add dates</button></div></form>`);
    return prevModal();
  };
  function alerts(){
    const rows=bucket('alerts');
    return `<main class="content"><div class="page-heading"><div class="sub">ACTIVITY</div><h2>Trip updates.</h2><p>This is an in-app activity feed, not remote push notifications.</p></div><button class="btn secondary" onclick="markCrewAlerts()">Mark read</button>${rows.map(x=>`<div class="card"><b>${esc(x.note)}</b><div class="sub">${new Date(x.when).toLocaleString()}</div></div>`).join('')||'<div class="empty">No updates yet.</div>'}</main>`;
  }
  window.markCrewAlerts=()=>{bucket('alerts').forEach(x=>x.read=true);persist()};
  const getCity=i=>String(i.city||'Unknown').split(/[·•,]/)[0].trim();
  function places(){
    const towns=[...new Set((s.ideas[s.current]||[]).map(getCity).filter(Boolean))];
    return `<main class="content"><div class="page-heading"><div class="sub">TRAVEL MAPS</div><h2>Search saved places.</h2><p>Open places in OpenStreetMap.</p></div><form class="card" onsubmit="crewMapSearch(event)"><div class="field"><label>Location</label><input name="place" required placeholder="Arashiyama Kyoto"></div><button class="btn blue full-width">Search map ↗</button></form>${towns.map(x=>`<div class="card row"><b>📍 ${esc(x)}</b><button class="btn secondary" onclick="crewOpenMap('${encodeURIComponent(x)}')">Map ↗</button></div>`).join('')}<p class="small-note">These open external map searches, not an in-app routing engine.</p></main>`;
  }
  window.crewOpenMap=key=>window.open('https://www.openstreetmap.org/search?query='+key,'_blank','noopener,noreferrer');
  window.crewMapSearch=e=>{e.preventDefault();window.crewOpenMap(encodeURIComponent(String(new FormData(e.target).get('place'))))};
  render=function(){
    if(tab==='chat'||tab==='dates'){view=tab;tab='plan'}
    if(tab==='alerts'||tab==='places'){api.renderPage(tab==='alerts'?alerts():places());return}
    prevRender();
  };
  save();render();
})();
