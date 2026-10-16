(function addPackingOnly(){
 const older=render,oldHome=home,oldModal=modalHTML,api=window.roavelyNext;
 function items(){s.extras=s.extras||{};s.extras.packing=s.extras.packing||{};return s.extras.packing[s.current]||(s.extras.packing[s.current]=[])}
 function recommendations(){const r=[['Documents','Passport or ID'],['Documents','Check entry requirements'],['Essentials','Clothes and comfortable shoes'],['Essentials','Medications'],['Electronics','Phone charger'],['Electronics','Power adapter'],['Preparation','Check destination weather']];const tags=s.profile?.interests||[];if(tags.includes('Photography'))r.push(['Photography','Camera'],['Photography','Memory cards']);if(tags.includes('Hiking')||tags.includes('Adventure'))r.push(['Adventure','Hiking shoes'],['Adventure','Daypack']);if(tags.includes('Beaches'))r.push(['Adventure','Swimwear'],['Adventure','Sunscreen']);return r}
 window.addPackingRecommendations=()=>{const a=items(),old=new Set(a.map(x=>x.label));recommendations().forEach(([category,label])=>{if(!old.has(label))a.push({id:'p'+Date.now()+Math.random(),category,label,done:false})});persist()};
 window.togglePack=id=>{const x=items().find(x=>String(x.id)===id);if(x){x.done=!x.done;persist()}};
 window.removePack=id=>{const a=items(),i=a.findIndex(x=>String(x.id)===id);if(i>=0){a.splice(i,1);persist()}};
 window.createPack=e=>{e.preventDefault();const f=new FormData(e.target),label=String(f.get('label')||'').trim();if(label){items().push({id:'p'+Date.now(),category:'Other',label:label.slice(0,150),done:false});modal=null;persist()}};
 function page(){
  const a=items(),cats=[...new Set(a.map(x=>x.category))];
  const body=cats.map(cat=>`<div class="section-title"><h3>${esc(cat)}</h3></div><div class="card">${a.filter(x=>x.category===cat).map(x=>`<div class="row packing-row"><label><input type="checkbox" ${x.done?'checked':''} onchange="togglePack('${x.id}')"> <span class="${x.done?'packed':''}">${esc(x.label)}</span></label><button class="icon-button" onclick="removePack('${x.id}')">✕</button></div>`).join('')}</div>`).join('');
  return `<main class="content"><div class="page-heading"><h2>Packing list</h2><p>Recommended items based on your interests, editable for each trip.</p></div><div class="card"><b>${a.filter(x=>x.done).length} / ${a.length} packed</b><div class="progress"><i style="width:${a.length?100*a.filter(x=>x.done).length/a.length:0}%"></i></div><div class="swipe-buttons"><button class="btn secondary" onclick="addPackingRecommendations()">✦ Suggestions</button><button class="btn blue" onclick="openModal('pack')">+ Item</button></div></div>${body||'<div class="empty">Generate suggestions to start.</div>'}<p class="small-note">Check current weather and entry rules separately.</p></main>`;
 }
 modalHTML=function(){if(modal==='pack')return sheet('Add packing item',`<form onsubmit="createPack(event)"><div class="field"><label>What to pack</label><input name="label" maxlength="150" required></div><button class="btn blue">Add</button></form>`);return oldModal()};
 home=function(){return oldHome().replace('</main>',`<div class="card row"><div><b>🎒 Packing list</b><div class="sub">Stay ready for your trip</div></div><button class="btn secondary" onclick="tab='packing';render()">Open</button></div></main>`)};
 render=function(){if(tab==='packing'){api.renderPage(page());return}older()};
 save();render();
})();
