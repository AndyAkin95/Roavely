(function addMemoryAlbum(){
 const oldRender=render,oldHome=home,api=window.roavelyNext;
 let urls=[];
 function db(){
  return new Promise((resolve,reject)=>{
   if(typeof indexedDB==='undefined'){reject(Error('Browser storage unavailable'));return}
   const req=indexedDB.open('roavely-albums-v1',1);
   req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains('photos')){const s=d.createObjectStore('photos',{keyPath:'id'});s.createIndex('trip','trip',{unique:false})}};
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Browser storage unavailable'));
  });
 }
 async function access(action,payload){
  const d=await db();
  return new Promise((resolve,reject)=>{
   const tx=d.transaction('photos',action==='get'?'readonly':'readwrite'),s=tx.objectStore('photos');
   const q=action==='get'?s.index('trip').getAll(payload):action==='put'?s.put(payload):s.delete(payload);
   q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error||Error('Album operation failed'));
   tx.oncomplete=()=>d.close();tx.onerror=()=>d.close();
  });
 }
 function album(){
  return `<main class="content"><div class="page-heading"><h2>Trip memories</h2><p>A photo and video album for every adventure.</p></div><div class="card soft-card"><b>Photos stay on this device</b><div class="sub">This version stores media in browser storage, not cloud storage. Clearing browser data may erase it. Keep your originals backed up.</div></div>
  <form class="card" onsubmit="saveTripMemory(event)"><div class="field"><label>Photo or short video</label><input name="media" type="file" accept="image/*,video/*" required></div><div class="field"><label>Caption</label><input name="caption" maxlength="150"></div><div class="field"><label>Location</label><input name="place" maxlength="90"></div><button class="btn blue full-width">Save memory</button></form><div class="section-title"><h3>Photo album</h3></div><div id="roavely-album"><div class="empty">Loading photos...</div></div></main>`;
 }
 async function refresh(){
  const target=document.getElementById?.('roavely-album');
  if(!target)return;
  urls.forEach(x=>URL.revokeObjectURL(x));urls=[];
  try{
   const files=(await access('get',s.current)).sort((a,b)=>b.added-a.added);
   if(!document.getElementById?.('roavely-album'))return;
   target.innerHTML=files.map(x=>{
    const url=URL.createObjectURL(x.blob);urls.push(url);
    const media=x.type.startsWith('video/')?`<video controls preload="metadata" src="${url}"></video>`:`<img loading="lazy" src="${url}" alt="${esc(x.caption||'Travel memory')}">`;
    return `<article class="card memory-card">${media}<b>${esc(x.caption||'Trip memory')}</b><div class="sub">${esc(x.place||'')} · ${new Date(x.added).toLocaleDateString()}</div><button class="text-button" onclick="deleteTripMemory('${x.id}')">Delete</button></article>`;
   }).join('')||'<div class="empty">No memories saved on this device yet.</div>';
  }catch(e){target.textContent='Album storage unavailable: '+e.message}
 }
 window.saveTripMemory=async e=>{
  e.preventDefault();const f=new FormData(e.target),file=f.get('media');
  if(!(file instanceof Blob)||! /^(image|video)\//.test(file.type)){toast('Select a photo or video');return}
  if(file.size>(file.type.startsWith('video/')?80:15)*1024*1024){toast('File too large for local album');return}
  try{
   await access('put',{id:'pic'+Date.now()+Math.random().toString(36).slice(2),trip:s.current,blob:file,type:file.type,added:Date.now(),caption:String(f.get('caption')||'').slice(0,150),place:String(f.get('place')||'').slice(0,90)});
   e.target.reset();await refresh();toast('Saved to local album');
  }catch(err){toast('Could not save memory: '+err.message)}
 };
 window.deleteTripMemory=async id=>{if(!confirm('Delete this saved media?'))return;try{await access('delete',id);await refresh()}catch(e){toast('Cannot delete media')}};
 function recap(){
  const ideas=s.ideas[s.current]||[],days=s.itinerary[s.current]||[],completed=ideas.filter(x=>s.extras?.adventureBoard?.[s.current]?.items?.[x.id]?.status==='done').length;
  return `<main class="content"><div class="page-heading"><h2>${esc(trip().name)} recap</h2><p>Your journey so far, from ideas to memories.</p></div><div class="passport-hero"><div><b>${days.length}</b><span>planned days</span></div><div><b>${ideas.length}</b><span>ideas</span></div><div><b>${completed}</b><span>done</span></div></div>
  <div class="card"><b>📷 Trip album</b><p class="small-note">Photos and videos saved on this device appear in your memory album.</p><button class="btn blue" onclick="tab='memories';render()">Open album</button></div>
  <div class="card"><b>📄 Export plans</b><p class="small-note">Export the current trip's planning data as JSON. This may contain personal information. Photos are not part of this export.</p><button class="btn secondary" onclick="exportTripJSON()">Export JSON</button></div>
  <div class="card soft-card"><b>Automatic highlight videos</b><div class="sub">A video montage needs an editing/rendering service and is not yet connected.</div></div></main>`;
 }
 window.exportTripJSON=()=>{
  const obj={format:'roavely-trip-v1',trip:trip(),members:s.people[s.current],ideas:s.ideas[s.current],itinerary:s.itinerary[s.current],expenses:s.extras?.ledger?.[s.current]||[],bookings:s.extras?.vault?.[s.current]||[],packing:s.extras?.packing?.[s.current]||[]};
  const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='roavely-trip.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 };
 home=function(){return oldHome().replace('</main>',`<div class="feature-grid"><button class="feature-tile" onclick="tab='memories';render()"><span>📷</span><b>Trip memories</b><small>Photos and video</small></button><button class="feature-tile" onclick="tab='recap';render()"><span>📔</span><b>Trip recap</b><small>Review and export</small></button></div></main>`)};
 render=function(){
  if(tab==='memories'||tab==='recap'){api.renderPage(tab==='memories'?album():recap());if(tab==='memories')refresh();return}
  urls.forEach(x=>URL.revokeObjectURL(x));urls=[];oldRender();
 };
 render();
})();
