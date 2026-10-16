(function recommendedSpots(){
 const previous=render;
 let category='All',query='',savedOnly=false;
 const icons={'Hotels':'🏨','Restaurants':'🍽️','Food spots':'🍜','Activities':'🎟️','Attractions':'📸'};
 const saved=()=>{s.extras??={};return s.extras.savedSpots??=[]};
 const score=p=>p.tags.filter(t=>(s.profile?.interests||[]).includes(t));
 window.filterSpots=(key,value)=>{if(key==='category')category=value;if(key==='query')query=value;if(key==='saved')savedOnly=value;render();if(key==='query'){const input=document.getElementById('spot-query');input?.focus();input?.setSelectionRange(query.length,query.length)}};
 window.saveSpot=id=>{if(!window.roavelySpots.some(p=>p.id===id))return;const a=saved(),i=a.indexOf(id);if(i<0)a.push(id);else a.splice(i,1);persist()};
 window.pitchSpot=id=>{
  const p=window.roavelySpots.find(p=>p.id===id);if(!p)return;
  const form=document.createElement('form');
  for(const [name,value] of Object.entries({title:p.name+' — '+p.url,city:p.city,cost:'0'})){
   const input=document.createElement('input');input.name=name;input.value=value;form.appendChild(input);
  }
  addIdea({preventDefault(){},target:form});

 };
 function page(){
  const destination=trip().destination||'';
  const inTrip=p=>[destination,...(trip().route||[])].some(d=>String(d).toLowerCase().includes(p.destination.toLowerCase())||String(d).toLowerCase().includes(p.city.toLowerCase()));
  const places=window.roavelySpots.filter(p=>inTrip(p)&& (category==='All'||p.category===category)&&(!savedOnly||saved().includes(p.id))&&(!query||[p.name,p.city,...p.tags].join(' ').toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>score(b).length-score(a).length||a.name.localeCompare(b.name));
  return `<main class="content"><button class="text-button" onclick="tab='discover';render()">← Discover</button><div class="page-heading"><div class="sub">PICKED AROUND YOUR INTERESTS</div><h2>Spots worth the trip.</h2><p>Places to stay, eat, and explore around ${esc(destination)}.</p></div><div class="card"><label for="spot-query">Search spots, cities, or interests</label><input id="spot-query" type="search" value="${esc(query)}" oninput="filterSpots('query',this.value)" placeholder="Try food, photography, Tokyo…"><div class="chip-wrap" style="margin-top:14px">${['All',...Object.keys(icons)].map(c=>`<button class="chip ${category===c?'selected':''}" onclick="filterSpots('category','${c}')">${icons[c]||'✦'} ${c}</button>`).join('')}</div><label class="spot-saved"><input type="checkbox" ${savedOnly?'checked':''} onchange="filterSpots('saved',this.checked)"> Saved spots only</label><p class="small-note">Ranked by your profile interests. <button class="text-button" onclick="tab='profile';render()">Edit interests</button></p></div><p class="small-note">Curated starter listings for Japan and Australia. Photos, when available, come from the linked official site's preview image; each card credits its source. Check official sites for more photos, videos, pricing, and availability.</p><div class="spots-grid">${places.map(p=>{const matches=score(p);return `<article class="card spot-card"><div class="spot-media">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)} — official website preview" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="spot-placeholder" hidden>${icons[p.category]}<small>Photo unavailable</small></div>`:`<div class="spot-placeholder">${icons[p.category]}<small>See photos on official website</small></div>`}</div><div class="sub">${esc(p.category)} · ${esc(p.city)}</div><h3>${esc(p.name)}</h3><div class="tag-row">${p.tags.map(t=>`<span class="tag ${matches.includes(t)?'match':''}">${esc(t)}</span>`).join('')}</div><p class="small-note">${matches.length?`Matches your ${matches.map(esc).join(', ')} interests.`:'A chance to try something new.'}</p><a class="btn blue spot-website" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Official website ↗</a><p class="small-note">Source: ${esc(new URL(p.url).hostname)}</p><div class="swipe-buttons"><button class="btn secondary" aria-pressed="${saved().includes(p.id)}" onclick="saveSpot('${p.id}')">${saved().includes(p.id)?'★ Saved':'☆ Save'}</button><button class="btn secondary" onclick="pitchSpot('${p.id}')">+ Suggest to group</button></div></article>`}).join('')}</div>${!places.length?'<div class="empty">No spots match this view yet. Try another filter. For destinations outside the starter collection, use Nearby to open a map search.</div>':''}<button class="btn secondary" onclick="tab='nearby';render()">Browse nearby on a map</button><p class="small-note">Saved spots stay on this device. This collection is curated; live listing search and automatic photo updates are not connected.</p></main>`;
 }
 render=function(){if(tab==='spots'){window.roavelyNext.renderPage(page());return}previous();if(tab==='discover')document.querySelector('.feature-grid')?.insertAdjacentHTML('afterbegin',`<button class="feature-tile" onclick="tab='spots';render()"><span>🧭</span><b>Recommended spots</b><small>Stay · Eat · Explore</small></button>`)};
 render();
})();
