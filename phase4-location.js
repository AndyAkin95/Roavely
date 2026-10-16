(function addLocationTools(){
 const prev=render,prevHome=home,prevModal=modalHTML,api=window.roavelyNext;
 function localCheckins(){s.extras=s.extras||{};s.extras.checkins=s.extras.checkins||{};return s.extras.checkins[s.current]||(s.extras.checkins[s.current]=[])}
 window.saveCheckin=e=>{e.preventDefault();const f=new FormData(e.target),place=String(f.get('place')||'').trim().slice(0,120);if(place){localCheckins().unshift({id:'c'+Date.now(),place,by:s.profile?.name||'Andy',expires:Date.now()+7200000});modal=null;persist()}};
 window.clearCheckin=id=>{const a=localCheckins(),i=a.findIndex(x=>x.id===id);if(i>=0){a.splice(i,1);persist()}};
 function checkins(){
  const arr=localCheckins().filter(x=>x.expires>Date.now());
  return `<main class="content"><div class="page-heading"><h2>Group check-ins</h2><p>Leave an optional, temporary meeting-point note.</p></div><div class="card soft-card"><b>Local-only preview</b><div class="sub">Friends cannot see these yet. No GPS coordinates are collected, and check-ins expire after two hours.</div></div><button class="btn blue" onclick="openModal('checkin')">+ I'm here</button>${arr.map(x=>`<div class="card row"><div><b>📍 ${esc(x.place)}</b><div class="sub">${esc(x.by)} · expires ${new Date(x.expires).toLocaleTimeString()}</div></div><button class="text-button" onclick="clearCheckin('${x.id}')">Remove</button></div>`).join('')||'<div class="empty">No current check-ins.</div>'}</main>`;
 }
 function nearby(){
  const cats=[['🍜','Food','restaurants'],['☕','Coffee','cafes'],['🏛️','Museums','museums'],['🥾','Trails','hiking trails'],['📸','Views','scenic viewpoints'],['🎭','Attractions','attractions']];
  return `<main class="content"><div class="page-heading"><h2>Nearby discoveries</h2><p>Find experiences nearby with your permission.</p></div><div class="card soft-card"><b>Your location stays private</b><div class="sub">A category tap can request browser location and opens an external map; coordinates are not saved in Roavely.</div></div><div class="feature-grid">${cats.map(([icon,title,key])=>`<button class="feature-tile" onclick="findTravelPlaces('${key}')"><span>${icon}</span><b>${title}</b><small>Map search</small></button>`).join('')}</div><div id="nearby-result" class="small-note"></div></main>`;
 }
 window.findTravelPlaces=key=>{
  const label=document.getElementById?.('nearby-result');
  if(!navigator.geolocation){if(label)label.textContent='This browser cannot provide location.';return}
  if(label)label.textContent='Requesting location permission…';
  navigator.geolocation.getCurrentPosition(p=>{
    const q=key+' near '+p.coords.latitude.toFixed(5)+','+p.coords.longitude.toFixed(5);
    window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q),'_blank','noopener,noreferrer');
    if(label)label.textContent='Map opened without storing location.';
  },e=>{if(label)label.textContent=e.message},{enableHighAccuracy:false,maximumAge:120000,timeout:10000});
 };
 modalHTML=function(){if(modal==='checkin')return sheet('Check in for 2 hours',`<form onsubmit="saveCheckin(event)"><div class="field"><label>Place or meeting point</label><input name="place" maxlength="120" required></div><button class="btn blue">Check in</button></form>`);return prevModal()};
 home=function(){return prevHome().replace('</main>',`<div class="feature-grid"><button class="feature-tile" onclick="tab='checkins';render()"><span>📍</span><b>Check-ins</b><small>Temporary group note</small></button><button class="feature-tile" onclick="tab='nearby';render()"><span>🧭</span><b>Nearby</b><small>Explore your area</small></button></div></main>`)};
 render=function(){if(tab==='checkins'||tab==='nearby'){api.renderPage(tab==='checkins'?checkins():nearby());return}prev()};
 save();render();
})();
