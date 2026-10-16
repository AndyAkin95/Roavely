/* Roavely browser bundle: ordered entrypoints. */

/* BEGIN app.js */
const KEY='roavely-demo-v3';
const seed={current:'japan27',trips:[{id:'japan27',emoji:'🇯🇵',name:'Japan 2027',destination:'Japan',start:'2027-04-03',end:'2027-04-17',budget:5200,route:['Tokyo','Hakone','Kyoto','Osaka','Hiroshima','Kumamoto'],invite:'JPN-27'},{id:'aus28',emoji:'🇦🇺',name:'Australia 2028',destination:'Australia',start:'2028-02-10',end:'2028-02-24',budget:4800,route:['Sydney','Wagga Wagga','Melbourne'],invite:'AUS-28'}],people:{japan27:['Andy','Mike','John','Matt'],aus28:['Andy']},ideas:{japan27:[{id:'i1',emoji:'🍜',title:'Ichiran Ramen — Shibuya',city:'Tokyo',cost:15,v:{Andy:'love',Mike:'yes',John:'yes'}},{id:'i2',emoji:'🦌',title:'Day trip to Nara',city:'Kyoto',cost:60,v:{Andy:'yes',Mike:'maybe',Matt:'yes'}},{id:'i3',emoji:'🌃',title:'Shibuya Sky at sunset',city:'Tokyo',cost:20,v:{Andy:'love',Mike:'love',John:'yes',Matt:'yes'}},{id:'i4',emoji:'⛩️',title:'Fushimi Inari early morning',city:'Kyoto',cost:0,v:{Andy:'love',John:'love'}}],aus28:[]},decisions:{japan27:[{id:'d1',title:'Pick our Tokyo hotel',options:['Shibuya base — $183/night','Shinjuku base — $169/night','Ginza base — $207/night'],votes:{Andy:0,Mike:0,John:1,Matt:0}},{id:'d2',title:'Free day: Fuji or more Tokyo?',options:['Mt. Fuji day trip','More Tokyo','Nikko'],votes:{Andy:0,Mike:0,John:1}}],aus28:[]},check:{japan27:[['Book international flights',true],['Choose Tokyo hotel',false],['Reserve Shinkansen seats',false],['Buy eSIMs',false],['Share emergency contacts',false]],aus28:[]},expenses:{japan27:[{title:'Tokyo hotel deposit',amount:1640,paid:'Mike',split:4,settled:['Mike']},{title:'TeamLab tickets',amount:128,paid:'Andy',split:4,settled:['Andy','John']}],aus28:[]},itinerary:{japan27:[{day:'Day 1 · Tokyo',items:[['3:10 PM','Land at Haneda','✈️'],['5:00 PM','Check in & reset','🏨'],['7:00 PM','Shibuya dinner','🍜']]},{day:'Day 2 · Tokyo',items:[['8:00 AM','Meiji Shrine','⛩️'],['10:30 AM','Harajuku & Omotesando','🛍️'],['5:00 PM','Shibuya Sky','🌃']]},{day:'Day 6 · Kyoto',items:[['7:15 AM','Leave hotel','🚶'],['8:03 AM','Train to Arashiyama','🚆'],['8:35 AM','Bamboo Grove','🎋'],['10:00 AM','Tenryu-ji','🏯']]}],aus28:[]},reservations:{japan27:[['✈️','Flight · JFK → HND','Apr 2 · confirmation pending'],['🏨','Tokyo hotel','Apr 3–7 · shortlist not final'],['🎟️','teamLab Borderless','Apr 5 · 4 tickets']],aus28:[]}};
let s=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch{return structuredClone(seed)}})();let tab='home',planMode='ideas',modal=null;
const $=q=>document.querySelector(q), save=()=>localStorage.setItem(KEY,JSON.stringify(s)), trip=()=>s.trips.find(x=>x.id===s.current)||s.trips[0], esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function days(){let d=new Date(trip().start+'T12:00:00');return Math.max(0,Math.ceil((d-Date.now())/86400000))}function toast(t){let e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),1800)}
function persist(){save();render()}function voteCounts(v={}){return Object.values(v).reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{})}
function roavelyHeader(){return `<div class="top"><div class="brand"><div><h1>Roavely</h1><small>Plan together. Go anywhere.</small></div><select class="trip-select" onchange="switchTrip(this.value)">${s.trips.map(t=>`<option value="${t.id}" ${t.id===s.current?'selected':''}>${t.emoji} ${esc(t.name)}</option>`).join('')}</select></div></div>`}
function hero(){let t=trip(),done=(s.check[t.id]||[]).filter(x=>x[1]).length,total=(s.check[t.id]||[]).length;return `<section class="hero"><div class="eyebrow">${t.emoji} ${esc(t.destination)} · ${days()} days to go</div><h2>${esc(t.name)}</h2><p>${t.route.map(esc).join(' → ')}</p><div class="stats"><div class="stat"><b>${(s.people[t.id]||[]).length}</b><span>travelers</span></div><div class="stat"><b>${(s.ideas[t.id]||[]).length}</b><span>saved ideas</span></div><div class="stat"><b>${total?Math.round(done/total*100):0}%</b><span>ready</span></div></div></section>`}
function home(){let t=trip(),open=(s.check[t.id]||[]).filter(x=>!x[1]).length,dec=(s.decisions[t.id]||[]).length;return `${hero()}<main class="content"><div class="section-title"><h3>Needs attention</h3><button onclick="openModal('trip')">+ Trip</button></div><div class="card"><div class="row"><div><b>${dec} group decisions</b><div class="sub">Vote before someone says “I’m good with anything.”</div></div><button class="btn secondary" onclick="tab='plan';planMode='decisions';render()">Vote</button></div></div><div class="card"><div class="row"><div><b>${open} checklist items left</b><div class="sub">Booking, documents and pre-trip jobs.</div></div><button class="btn secondary" onclick="openModal('checklist')">Open</button></div></div><div class="section-title"><h3>Trip tools</h3></div><div class="quick"><div class="card" onclick="openModal('reservations')">🎟️<b>Reservations</b><div class="sub">Flights, hotels & tickets</div></div><div class="card" onclick="openModal('group')">👥<b>Trips & people</b><div class="sub">Invite code ${t.invite}</div></div><div class="card" onclick="tab='wallet';render()">💸<b>Shared wallet</b><div class="sub">Track who owes what</div></div><div class="card" onclick="tab='map';render()">📍<b>Saved map</b><div class="sub">See ideas by area</div></div></div></main>`}
function ideas(){let arr=s.ideas[s.current]||[];return `${arr.length?arr.map(i=>{let c=voteCounts(i.v),mine=i.v.Andy;return `<div class="card"><div class="row"><div><div class="idea-title">${i.emoji} ${esc(i.title)}</div><div class="sub">${esc(i.city)} · ${i.cost?'~$'+i.cost:'Free'}</div></div><span class="pill">${(c.love||0)+(c.yes||0)} want it</span></div><div class="vote-row">${[['love','❤️'],['yes','👍'],['maybe','🤷'],['no','👎']].map(([v,e])=>`<button class="vote ${mine===v?'active':''}" onclick="ideaVote('${i.id}','${v}')">${e} ${c[v]||0}</button>`).join('')}</div></div>`}).join(''):'<div class="empty">No ideas yet.</div>'}<button class="btn blue" onclick="openModal('idea')">+ Add an idea</button>`}
function itinerary(){let a=s.itinerary[s.current]||[];return a.length?a.map(d=>`<div class="card"><b>${esc(d.day)}</b><div class="timeline" style="margin-top:14px">${d.items.map(x=>`<div class="event"><time>${x[0]}</time><div><b>${x[2]} ${esc(x[1])}</b></div></div>`).join('')}</div></div>`).join(''):'<div class="empty">No itinerary yet.</div>'}
function decisions(){let a=s.decisions[s.current]||[];return `${a.length?a.map(d=>`<div class="card"><b>${esc(d.title)}</b><div class="sub">Tap an option to vote</div>${d.options.map((o,n)=>{let count=Object.values(d.votes).filter(v=>v===n).length,sel=d.votes.Andy===n;return `<div class="decision-option ${sel?'selected':''}"><button onclick="decisionVote('${d.id}',${n})">${esc(o)} <span class="count">${count} vote${count===1?'':'s'}</span></button></div>`}).join('')}</div>`).join(''):'<div class="empty">No decisions yet.</div>'}<button class="btn blue" onclick="openModal('decision')">+ New decision</button>`}
function plan(){return `<main class="content"><div class="section-title"><h3>Plan together</h3></div><div class="segment"><button class="${planMode==='ideas'?'active':''}" onclick="planMode='ideas';render()">Ideas</button><button class="${planMode==='itinerary'?'active':''}" onclick="planMode='itinerary';render()">Itinerary</button><button class="${planMode==='decisions'?'active':''}" onclick="planMode='decisions';render()">Decisions</button></div>${planMode==='ideas'?ideas():planMode==='itinerary'?itinerary():decisions()}</main>`}
function map(){let a=s.ideas[s.current]||[];let pins=a.slice(0,6);return `<main class="content"><div class="section-title"><h3>Saved places</h3></div><div class="mapbox">${pins.map((p,i)=>{let pos=[[23,31],[63,27],[42,53],[75,62],[30,76],[62,83]][i]||[50,50];return `<div class="pin" style="left:${pos[0]}%;top:${pos[1]}%">${p.emoji}</div><div class="pin-label" style="left:${pos[0]}%;top:${pos[1]}%">${esc(p.city)}</div>`}).join('')}</div><div class="section-title"><h3>Nearby shortlist</h3></div>${a.map(x=>`<div class="card"><b>${x.emoji} ${esc(x.title)}</b><div class="sub">${esc(x.city)}</div></div>`).join('')||'<div class="empty">Add ideas to populate the map.</div>'}</main>`}
function wallet(){let a=s.expenses[s.current]||[],me='Andy';let owed=0;a.forEach(x=>{if(x.paid!==me&&!x.settled.includes(me))owed+=x.amount/x.split});return `<main class="content"><div class="section-title"><h3>Group wallet</h3></div><div class="card"><div class="sub">Your unsettled share</div><div class="money">$${owed.toFixed(2)}</div></div>${a.map((x,i)=>{let share=x.amount/x.split,sett=x.settled.includes(me);return `<div class="card"><div class="row"><div><b>${esc(x.title)}</b><div class="sub">$${x.amount.toFixed(2)} · paid by ${esc(x.paid)} · $${share.toFixed(2)}/person</div></div>${x.paid===me?'<span class="pill">You paid</span>':`<button class="btn secondary ${sett?'settled':''}" onclick="settle(${i})">${sett?'✓ Settled':'Mark paid'}</button>`}</div></div>`}).join('')||'<div class="empty">No expenses yet.</div>'}</main>`}
function tripMode(){let it=(s.itinerary[s.current]||[])[0];return `<main class="content"><div class="section-title"><h3>Trip Mode</h3><span class="pill">Live view</span></div><div class="card trip-now"><div class="sub">NEXT</div><div class="next">${it?it.items[0][2]+' '+esc(it.items[0][1]):'Nothing scheduled yet'}</div>${it?`<b>${it.items[0][0]}</b><div class="sub">${esc(it.day)}</div>`:''}</div>${it?`<div class="section-title"><h3>Later</h3></div>${it.items.slice(1).map(x=>`<div class="card"><div class="row"><b>${x[2]} ${esc(x[1])}</b><span class="pill">${x[0]}</span></div></div>`).join('')}`:''}<div class="card"><b>Quick tools</b><div class="vote-row"><button class="vote" onclick="openModal('reservations')">🎟️ Tickets</button><button class="vote" onclick="openModal('checklist')">☑️ Checklist</button><button class="vote" onclick="tab='map';render()">📍 Map</button></div></div></main>`}
function nav(){return `<nav class="tabs"><div class="tabs-inner">${[['home','⌂','Home'],['plan','✓','Plan'],['map','⌖','Map'],['wallet','¥','Wallet'],['trip','✈','Trip Mode']].map(x=>`<button class="tab ${tab===x[0]?'active':''}" onclick="tab='${x[0]}';render()"><span>${x[1]}</span>${x[2]}</button>`).join('')}</div></nav>`}
function switchTrip(id){s.current=id;persist()}function ideaVote(id,v){let x=(s.ideas[s.current]||[]).find(x=>x.id===id);if(x){x.v.Andy=v;persist()}}function decisionVote(id,n){let x=(s.decisions[s.current]||[]).find(x=>x.id===id);if(x){x.votes.Andy=n;persist()}}function settle(i){let x=s.expenses[s.current][i],n=x.settled.indexOf('Andy');n>=0?x.settled.splice(n,1):x.settled.push('Andy');persist()}
function openModal(x){modal=x;render()}function closeModal(){modal=null;render()}
function modalHTML(){if(!modal)return'';let t=trip();if(modal==='idea')return sheet('Add an idea',`<form onsubmit="addIdea(event)"><div class="field"><label>Idea</label><input name="title" required placeholder="Shibuya food tour"></div><div class="field"><label>City</label><input name="city" placeholder="Tokyo"></div><div class="field"><label>Emoji</label><input name="emoji" value="📍"></div><div class="field"><label>Approx. cost per person (USD)</label><input name="cost" type="number" min="0" value="0"></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Save idea</button></div></form>`);if(modal==='decision')return sheet('New group decision',`<form onsubmit="addDecision(event)"><div class="field"><label>Question</label><input name="title" required placeholder="Which Tokyo hotel?"></div><div class="field"><label>Option 1</label><input name="o1" required></div><div class="field"><label>Option 2</label><input name="o2" required></div><div class="field"><label>Option 3 (optional)</label><input name="o3"></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Create vote</button></div></form>`);if(modal==='trip')return sheet('Create a trip',`<form onsubmit="addTrip(event)"><div class="field"><label>Trip name</label><input name="name" required placeholder="Italy 2028"></div><div class="field"><label>Destination</label><input name="dest" required placeholder="Italy"></div><div class="field"><label>Emoji</label><input name="emoji" value="✈️"></div><div class="field"><label>Start date</label><input name="start" type="date" required></div><div class="field"><label>End date</label><input name="end" type="date" required></div><div class="field"><label>Budget per person</label><input name="budget" type="number" value="3000"></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Create trip</button></div></form>`);if(modal==='checklist'){let a=s.check[t.id]||[];return sheet('Trip checklist',`${a.map((x,i)=>`<div class="card check"><input type="checkbox" ${x[1]?'checked':''} onchange="checkItem(${i})"><div><b>${esc(x[0])}</b><div class="sub">${x[1]?'Done':'Still needed'}</div></div></div>`).join('')||'<div class="empty">No checklist items.</div>'}<button class="btn secondary" onclick="resetDemo()">Reset demo data</button>`)}if(modal==='reservations'){let a=s.reservations[t.id]||[];return sheet('Reservation Vault',a.map(x=>`<div class="card"><b>${x[0]} ${esc(x[1])}</b><div class="sub">${esc(x[2])}</div></div>`).join('')||'<div class="empty">No reservations yet.</div>')}if(modal==='group')return sheet('Trips & people',`<div class="card"><div class="sub">Invite code</div><div class="money">${esc(t.invite)}</div><button class="btn secondary" onclick="copyInvite()">Copy invite</button></div><div class="section-title"><h3>Travelers</h3></div>${(s.people[t.id]||[]).map((p,i)=>`<div class="card row"><b>👤 ${esc(p)}</b><span class="pill">${i===0?'Owner':'Member'}</span></div>`).join('')}<div class="sub" style="margin-top:14px">This phone test stores data locally. Live friend-to-friend sync comes with the dedicated Supabase backend.</div>`);return''}
function sheet(title,body){return `<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row"><h2>${title}</h2><button class="btn secondary" onclick="closeModal()">✕</button></div>${body}</div></div>`}
function addIdea(e){e.preventDefault();let f=new FormData(e.target);(s.ideas[s.current]??=[]).unshift({id:'i'+Date.now(),emoji:f.get('emoji')||'📍',title:f.get('title'),city:f.get('city')||'TBD',cost:+f.get('cost')||0,v:{Andy:'yes'}});modal=null;persist();toast('Idea added')}
function addDecision(e){e.preventDefault();let f=new FormData(e.target),opts=[f.get('o1'),f.get('o2'),f.get('o3')].filter(Boolean);(s.decisions[s.current]??=[]).unshift({id:'d'+Date.now(),title:f.get('title'),options:opts,votes:{}});modal=null;persist();toast('Decision created')}
function addTrip(e){e.preventDefault();let f=new FormData(e.target),id='t'+Date.now(),dest=f.get('dest');s.trips.push({id,emoji:f.get('emoji')||'✈️',name:f.get('name'),destination:dest,start:f.get('start'),end:f.get('end'),budget:+f.get('budget')||0,route:[dest],invite:'RV-'+Math.random().toString(36).slice(2,6).toUpperCase()});s.people[id]=[s.profile?.name||'Andy'];s.ideas[id]=[];s.decisions[id]=[];s.check[id]=[];s.expenses[id]=[];s.itinerary[id]=[];s.reservations[id]=[];s.current=id;modal=null;persist();toast('Trip created')}
function checkItem(i){s.check[s.current][i][1]=!s.check[s.current][i][1];persist()}function copyInvite(){navigator.clipboard?.writeText(trip().invite);toast('Invite code copied')}function resetDemo(){if(confirm('Reset all local Roavely demo data?')){localStorage.removeItem(KEY);s=structuredClone(seed);s.profile={name:'Andy',airport:'JFK',interests:['Food','Culture','Photography','Adventure','History'],pace:'Balanced',style:'Mid-range'};modal=null;render()}}
function render(){let body=tab==='home'?home():tab==='plan'?plan():tab==='map'?map():tab==='wallet'?wallet():tripMode();$('#app').innerHTML=`<div class="shell">${roavelyHeader()}${body}${nav()}${modalHTML()}</div>`}(function installRoavelyFeatures(){
  if (!s.profile) s.profile = {name:'Andy', airport:'JFK', interests:['Food','Culture','Photography','Adventure','History'], pace:'Balanced', style:'Mid-range'};
  if (!Array.isArray(s.profile.interests)) s.profile.interests=[];
  const interests=['Food','Culture','Photography','Adventure','Nature','History','Art','Nightlife','Beaches','Hiking','Shopping','Wildlife','Relaxation','Architecture','Road trips','Theme parks'];
  const destinations=[
    {id:'dest-japan',title:'Japan',emoji:'🇯🇵',city:'Tokyo • Kyoto • Osaka',cost:180,tags:['Food','Culture','Photography','History','Architecture'],detail:'City energy, regional food, shrines, mountains and unforgettable rail journeys.'},
    {id:'dest-iceland',title:'Iceland',emoji:'🇮🇸',city:'Reykjavík • South Coast',cost:250,tags:['Adventure','Nature','Photography','Road trips','Hiking'],detail:'Waterfalls, black-sand beaches, glaciers and a spectacular ring-road adventure.'},
    {id:'dest-italy',title:'Italy',emoji:'🇮🇹',city:'Rome • Florence • Amalfi',cost:210,tags:['Food','History','Architecture','Art','Beaches'],detail:'Historic cities, incredible dining and coastal escapes.'},
    {id:'dest-newzealand',title:'New Zealand',emoji:'🇳🇿',city:'Queenstown • South Island',cost:190,tags:['Adventure','Hiking','Nature','Photography','Road trips'],detail:'Alpine landscapes, hiking and thrill-seeking.'},
    {id:'dest-australia',title:'Australia',emoji:'🇦🇺',city:'Sydney • Melbourne',cost:200,tags:['Adventure','Beaches','Wildlife','Food','Road trips'],detail:'Coastal drives, surf, wildlife and varied cities.'},
    {id:'dest-norway',title:'Norway',emoji:'🇳🇴',city:'Bergen • Lofoten',cost:240,tags:['Nature','Photography','Hiking','Culture','Road trips'],detail:'Fjords, fishing villages, dramatic mountains and scenic roads.'},
    {id:'dest-switzerland',title:'Switzerland',emoji:'🇨🇭',city:'Interlaken • Zermatt',cost:280,tags:['Adventure','Nature','Hiking','Photography','Relaxation'],detail:'Mountain railways, alpine lakes and outdoor sports.'},
    {id:'dest-portugal',title:'Portugal',emoji:'🇵🇹',city:'Lisbon • Porto',cost:155,tags:['Food','Architecture','Beaches','History','Relaxation'],detail:'Colorful streets, coastal towns, food and laid-back exploring.'},
    {id:'dest-costa-rica',title:'Costa Rica',emoji:'🇨🇷',city:'La Fortuna • Manuel Antonio',cost:180,tags:['Adventure','Wildlife','Nature','Hiking','Beaches'],detail:'Rainforests, volcanoes, animals and surf beaches.'},
    {id:'dest-scotland',title:'Scotland',emoji:'🏴',city:'Edinburgh • Highlands',cost:190,tags:['History','Nature','Photography','Road trips','Architecture'],detail:'Castles, rugged landscapes and winding Highland drives.'}
  ];
  const experiences=[
    {id:'act-jp1',country:'Japan',title:'Tsukiji food walk',emoji:'🍣',city:'Tokyo',cost:45,tags:['Food','Culture'],detail:'Sample sushi, street snacks and market specialties.'},
    {id:'act-jp2',country:'Japan',title:'Shibuya Sky observation deck',emoji:'🌃',city:'Tokyo',cost:30,tags:['Photography','Architecture'],detail:'Skyline views at golden hour.'},
    {id:'act-jp3',country:'Japan',title:'Kyoto temple & old streets walk',emoji:'⛩️',city:'Kyoto',cost:20,tags:['History','Culture','Photography'],detail:'Historic lanes and shrines at a relaxed pace.'},
    {id:'act-jp4',country:'Japan',title:'Mt. Fuji lake adventure',emoji:'🗻',city:'Kawaguchiko',cost:90,tags:['Adventure','Nature','Photography','Hiking'],detail:'A full day exploring Fuji views and lakeside scenery.'},
    {id:'act-jp5',country:'Japan',title:'Osaka food crawl',emoji:'🍜',city:'Osaka',cost:65,tags:['Food','Nightlife','Culture'],detail:'Dotonbori after dark, with stops for local specialties.'},
    {id:'act-jp6',country:'Japan',title:'Hiroshima Peace Memorial visit',emoji:'🕊️',city:'Hiroshima',cost:15,tags:['History','Culture'],detail:'A meaningful visit to the memorial park and museum.'},
    {id:'act-jp7',country:'Japan',title:'Nara deer park & temples',emoji:'🦌',city:'Nara',cost:45,tags:['Wildlife','Nature','History'],detail:'A day trip from Kyoto or Osaka.'},
    {id:'act-au1',country:'Australia',title:'Bondi to Coogee coastal walk',emoji:'🏖️',city:'Sydney',cost:0,tags:['Beaches','Nature','Photography'],detail:'A beautiful coastal walk with plenty of swimming stops.'},
    {id:'act-au2',country:'Australia',title:'Learn to surf at Bondi',emoji:'🏄',city:'Sydney',cost:85,tags:['Adventure','Beaches'],detail:'A beginner-friendly lesson by the ocean.'},
    {id:'act-au3',country:'Australia',title:'Great Ocean Road trip',emoji:'🚙',city:'Melbourne',cost:120,tags:['Road trips','Photography','Nature'],detail:'Ocean overlooks and the Twelve Apostles.'},
    {id:'act-au4',country:'Australia',title:'Blue Mountains day hike',emoji:'🥾',city:'Sydney',cost:80,tags:['Hiking','Adventure','Nature'],detail:'Bushwalks and dramatic viewpoints.'}
  ];
  let discoverMode='destinations';
  let groupMode='ideas';
  let pendingIdea=null;
  let editDayIndex=null;
  const person=()=>s.profile.name.trim()||'Traveler';
  const cash=v=>String.fromCharCode(36)+Number(v||0).toLocaleString('en-US',{maximumFractionDigits:0});
  const matchScore=x=>(x.tags||[]).filter(tag=>s.profile.interests.includes(tag)).length;
  const sortMatch=a=>a.slice().sort((a,b)=>matchScore(b)-matchScore(a)||a.title.localeCompare(b.title));
  const oldModal=modalHTML;

  roavelyHeader=function(){
    return `<div class="top"><div class="brand"><div><h1>Roavely<span class="brand-star">✦</span></h1><small>Plan together. Go anywhere.</small></div><button class="avatar" aria-label="Edit your travel profile" onclick="tab='profile';render()">${esc(person().slice(0,1).toUpperCase())}</button></div><div class="top-trip"><select class="trip-select" aria-label="Current trip" onchange="switchTrip(this.value)">${s.trips.map(t=>`<option value="${esc(t.id)}" ${t.id===s.current?'selected':''}>${t.emoji} ${esc(t.name)}</option>`).join('')}</select><span class="demo-label">LOCAL PREVIEW</span></div></div>`;
  };
  nav=function(){
    return `<nav class="tabs"><div class="tabs-inner">${[['home','⌂','Home'],['discover','✦','Discover'],['plan','♥','Group'],['itinerary','☷','Itinerary'],['budget','USD','Budget']].map(x=>`<button class="tab ${tab===x[0]?'active':''}" onclick="tab='${x[0]}';render()"><span>${x[1]}</span>${x[2]}</button>`).join('')}</div></nav>`;
  };
  function interestChips(){
    return interests.map(x=>`<button type="button" class="chip ${s.profile.interests.includes(x)?'selected':''}" onclick="toggleInterest('${x}')">${s.profile.interests.includes(x)?'✓ ':''}${x}</button>`).join('');
  }
  function profilePage(){
    return `<main class="content"><div class="page-heading"><div class="sub">YOUR TRAVEL DNA</div><h2>Where should we go next?</h2><p>Tell Roavely what you love. Your Discover page will rank places and activities around your interests.</p></div><div class="card"><form onsubmit="saveTravelProfile(event)"><div class="field"><label>Your display name</label><input name="name" maxlength="40" required value="${esc(person())}" placeholder="Your name"></div><div class="field"><label>Home airport (for future flight estimates)</label><input name="airport" maxlength="30" value="${esc(s.profile.airport||'')}" placeholder="JFK"></div><div class="two-fields"><div class="field"><label>Travel pace</label><select name="pace">${['Relaxed','Balanced','Packed'].map(x=>`<option ${x===s.profile.pace?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>Travel style</label><select name="style">${['Budget','Mid-range','Luxury'].map(x=>`<option ${x===s.profile.style?'selected':''}>${x}</option>`).join('')}</select></div></div><button class="btn blue full-width">Save profile</button></form></div><div class="section-title"><h3>What are you into?</h3></div><div class="card"><p class="small-note">Choose as many interests as you like. Changes save automatically.</p><div class="chip-wrap">${interestChips()}</div></div><div class="card soft-card"><b>✦ Your recommendations update with you</b><div class="sub">Your preferences are saved on this device in the preview. Friends will have separate accounts once shared sync is connected.</div><button class="btn secondary" style="margin-top:14px" onclick="tab='discover';render()">Explore matches →</button></div></main>`;
  }
  window.toggleInterest=function(tag){
    if(!interests.includes(tag))return;
    const p=s.profile.interests,i=p.indexOf(tag);
    if(i<0)p.push(tag);else p.splice(i,1);
    persist();
  };
  window.saveTravelProfile=function(e){
    e.preventDefault();
    const f=new FormData(e.target);
    const old=person();
    s.profile.name=String(f.get('name')||'').trim().slice(0,40)||'Traveler';
    s.profile.airport=String(f.get('airport')||'').trim().slice(0,30);
    s.profile.pace=String(f.get('pace'));
    s.profile.style=String(f.get('style'));
    if(old!==person()){
      Object.values(s.ideas).flat().forEach(i=>{if(i.v&&Object.prototype.hasOwnProperty.call(i.v,old)&&!Object.prototype.hasOwnProperty.call(i.v,person())){i.v[person()]=i.v[old];delete i.v[old]}});
      Object.values(s.decisions).flat().forEach(i=>{if(i.votes&&Object.prototype.hasOwnProperty.call(i.votes,old)&&!Object.prototype.hasOwnProperty.call(i.votes,person())){i.votes[person()]=i.votes[old];delete i.votes[old]}});
      Object.values(s.people).forEach(group=>{let n=group.indexOf(old);if(n>=0)group[n]=person()});
    }
    persist();toast('Travel profile saved');
  };
  function recCard(r,isDest){
    const matched=r.tags.filter(t=>s.profile.interests.includes(t));
    const existing=(s.ideas[s.current]||[]).some(x=>x.sourceId===r.id);
    return `<article class="card rec-card"><div class="rec-top"><div class="rec-emoji">${r.emoji}</div><div class="rec-body"><div class="sub">${esc(r.city)}</div><b class="rec-title">${esc(r.title)}</b><div class="sub">${isDest?'Approx. daily spending / person: ':'Est. activity price / person: '}${cash(r.cost)}</div></div></div><p class="rec-description">${esc(r.detail)}</p><div class="tag-row">${r.tags.slice(0,4).map(t=>`<span class="tag ${matched.includes(t)?'match':''}">${matched.includes(t)?'✦ ':''}${esc(t)}</span>`).join('')}</div><div class="row rec-footer"><span class="match-text">${matched.length?matched.length+' interest match'+(matched.length===1?'':'es'):'Explore something new'}</span><button class="btn ${existing?'secondary':'blue'}" onclick="suggestRecommendation('${r.id}')">${existing?'✓ Suggested':'+ Suggest'}</button></div></article>`;
  }
  function discover(){
    const isDest=discoverMode==='destinations';
    let results=isDest?sortMatch(destinations):sortMatch(experiences.filter(x=>trip().destination.toLowerCase().includes(x.country.toLowerCase())||x.country.toLowerCase().includes(trip().destination.toLowerCase())));
    return `<main class="content"><div class="page-heading"><div class="sub">MADE FOR THE CURIOUS</div><h2>Discover your next adventure.</h2><p>Personalized ideas based on your profile, ready to pitch to the group.</p></div><div class="segment"><button class="${isDest?'active':''}" onclick="setDiscoverMode('destinations')">🌍 Destinations</button><button class="${!isDest?'active':''}" onclick="setDiscoverMode('activities')">📍 Things to do</button></div>${!s.profile.interests.length?'<div class="card soft-card">Pick your interests in Profile for better recommendations.</div>':''}${!isDest?`<div class="card mini-banner"><b>${trip().emoji} Around ${esc(trip().destination)}</b><div class="sub">Prices are planning estimates, not live quotes.</div></div>`:''}${results.length?results.map(x=>recCard(x,isDest)).join(''):'<div class="empty">No curated activities for this destination yet. You can still suggest any place or experience on the Group page.</div>'}<p class="small-note">These are curated sample recommendations and approximate USD costs; live prices, opening hours and availability are not connected yet.</p></main>`;
  }
  window.setDiscoverMode=function(m){discoverMode=m;render()};
  window.suggestRecommendation=function(id){
    const r=[...destinations,...experiences].find(x=>x.id===id);
    if(!r)return;
    const arr=s.ideas[s.current]??=[];
    if(arr.some(x=>x.sourceId===id)){tab='plan';groupMode='ideas';render();return}
    arr.unshift({id:'r'+Date.now(),sourceId:id,title:r.title,emoji:r.emoji,city:r.city,cost:r.cost,detail:r.detail,tags:r.tags,v:{[person()]:'yes'},comments:[],suggestedBy:person(),kind:destinations.includes(r)?'destination':'activity'});
    groupMode='ideas';tab='plan';persist();toast('Suggested to your group');
  };
  ideaVote=function(id,v){
    const x=(s.ideas[s.current]||[]).find(x=>x.id===id);
    if(!x)return;
    if(!x.v)x.v={};
    if(x.v[person()]===v)delete x.v[person()];else x.v[person()]=v;
    persist();
  };
  function commentThread(x){
    const a=x.comments||[];
    return `<div class="comment-thread"><div class="thread-title">💬 Discussion · ${a.length}</div>${a.map(c=>`<div class="comment"><span class="comment-initial">${esc(String(c.author||'T').slice(0,1).toUpperCase())}</span><div><div class="comment-author">${esc(c.author||'Traveler')}</div><div class="comment-text">${esc(c.text)}</div></div></div>`).join('')}<form class="comment-form" onsubmit="postIdeaComment(event,'${x.id}')"><input name="comment" maxlength="500" required placeholder="Discuss this idea…"><button type="submit" aria-label="Post comment">➤</button></form></div>`;
  }
  window.postIdeaComment=function(e,id){
    e.preventDefault();
    const f=new FormData(e.target),message=String(f.get('comment')||'').trim();
    const x=(s.ideas[s.current]||[]).find(x=>x.id===id);
    if(!x||!message)return;
    (x.comments??=[]).push({id:'c'+Date.now(),author:person(),text:message.slice(0,500),created:new Date().toISOString()});
    persist();
  };
  ideas=function(){
    let a=s.ideas[s.current]||[];
    return `<div class="group-intro"><div><b>Everyone gets a say.</b><div class="sub">Pitch it, vote on it, talk it out, then put it on the itinerary.</div></div><button class="btn blue" onclick="openModal('idea')">+ Idea</button></div>${a.map(x=>{let c=voteCounts(x.v),mine=x.v?.[person()],likes=(c.love||0)+(c.yes||0);return `<article class="card idea-card"><div class="row"><div><div class="idea-title">${esc(x.emoji)} ${esc(x.title)}</div><div class="sub">${esc(x.city)} · ${x.cost?cash(x.cost)+' / person':'Free or TBD'}${x.suggestedBy?' · suggested by '+esc(x.suggestedBy):''}</div></div><span class="pill">${likes} interested</span></div>${x.detail?`<p class="rec-description">${esc(x.detail)}</p>`:''}<div class="vote-row voting">${[['love','❤️ Love'],['yes','👍 Yes'],['maybe','🤷 Maybe'],['no','👎 Pass']].map(([v,t])=>`<button class="vote ${mine===v?'active':''}" onclick="ideaVote('${x.id}','${v}')">${t}<span>${c[v]||0}</span></button>`).join('')}</div><div class="row idea-actions"><span class="sub">${Object.keys(x.v||{}).length} votes</span><button class="text-button" onclick="openActivity('${x.id}')">+ Add to itinerary →</button></div>${commentThread(x)}</article>`}).join('')||'<div class="empty">No suggestions yet. Add an idea or discover something that matches your interests.</div>'}`;
  };
  function groupPeople(){
    const t=trip();
    return `<div class="card"><b>Invite code: ${esc(t.invite)}</b><div class="sub">This preview does not connect accounts. Invite codes are placeholders until group sync is launched.</div><button class="btn secondary" style="margin-top:12px" onclick="copyInvite()">Copy code</button></div>${(s.people[t.id]||[]).map((n,i)=>`<div class="card row"><div class="row"><span class="comment-initial">${esc(n.slice(0,1))}</span><b>${esc(n)}</b></div><span class="pill">${i===0?'Host':'Demo member'}</span></div>`).join('')}`;
  }
  plan=function(){
    return `<main class="content"><div class="page-heading"><div class="sub">YOUR TRAVEL CREW</div><h2>Plan better, together.</h2><p>Vote on the places worth making time for — and discuss before committing.</p></div><div class="segment"><button class="${groupMode==='ideas'?'active':''}" onclick="setGroupMode('ideas')">Ideas</button><button class="${groupMode==='decisions'?'active':''}" onclick="setGroupMode('decisions')">Polls</button><button class="${groupMode==='people'?'active':''}" onclick="setGroupMode('people')">People</button></div>${groupMode==='ideas'?ideas():groupMode==='decisions'?decisions():groupPeople()}</main>`;
  };
  window.setGroupMode=function(m){groupMode=m;render()};
  function ensureEstimate(t){
    if(!t.estimate){
      const japan=t.destination.toLowerCase().includes('japan');
      const aus=t.destination.toLowerCase().includes('australia');
      t.estimate=japan?{flights:1350,lodging:1250,transport:400,food:650,activities:400,misc:250}:aus?{flights:1650,lodging:1200,transport:350,food:600,activities:400,misc:250}:{flights:900,lodging:900,transport:250,food:450,activities:300,misc:150};
    }
    return t.estimate;
  }
  function activityTotal(){
    return (s.itinerary[s.current]||[]).reduce((sum,d)=>sum+d.items.reduce((a,item)=>a+Math.max(0,Number(item[3])||0),0),0);
  }
  function budgetPage(){
    const t=trip(),b=ensureEstimate(t),activityCost=activityTotal(),finalActivities=Math.max(b.activities,activityCost);
    const entries=[['✈️','Flights',b.flights],['🏨','Accommodation',b.lodging],['🚆','Transportation',b.transport],['🍜','Meals',b.food],['🎟️','Activities',finalActivities],['🧳','Miscellaneous',b.misc]];
    const total=entries.reduce((n,x)=>n+x[2],0),travelers=(s.people[t.id]||[]).length||1,target=Number(t.budget)||0;
    const pct=target?Math.min(100,Math.round(total/target*100)):0;
    return `<main class="content"><div class="page-heading"><div class="sub">PLAN SMARTER</div><h2>Your trip, within reach.</h2><p>A realistic starting forecast, updated as you build your itinerary.</p></div><section class="budget-hero"><div class="sub">ESTIMATED COST PER PERSON</div><div class="budget-number">${cash(total)}</div><div class="budget-caption">${travelers} traveler${travelers===1?'':'s'} · ${cash(total*travelers)} combined estimate</div><div class="budget-progress"><i style="width:${pct}%"></i></div><div class="row"><span>Personal target: ${cash(target)}</span><strong>${target?total>target?cash(total-target)+' over':cash(target-total)+' under':'Not set'}</strong></div></section><div class="section-title"><h3>Cost breakdown</h3><button onclick="openModal('estimate')">Edit estimates</button></div>${entries.map(x=>`<div class="card row budget-line"><span>${x[0]} ${x[1]}</span><b>${cash(x[2])}</b></div>`).join('')}<div class="card soft-card"><b>🎟️ Itinerary activity costs: ${cash(activityCost)}</b><div class="sub">The activity budget uses the greater of your planned activity total and your activity allowance, so the same activities aren't counted twice.</div></div><div class="card"><div class="row"><b>💸 Already tracked in your shared wallet</b><button class="text-button" onclick="tab='wallet';render()">See expenses →</button></div><div class="sub">${cash((s.expenses[s.current]||[]).reduce((n,x)=>n+x.amount,0))} recorded in group payments. This is separate from the forecast above — not an extra cost.</div></div><p class="small-note">USD planning estimates only, not flight searches, live hotel rates, confirmed quotes, or actual charges.</p></main>`;
  }
  function itineraryScreen(){
    const a=s.itinerary[s.current]||[];
    return `<main class="content"><div class="page-heading"><div class="sub">THE GAME PLAN</div><h2>Make every day count.</h2><p>Build a flexible timeline with times and estimated activity prices.</p></div><div class="row itinerary-bar"><div><b>${a.length} planned days</b><div class="sub">${cash(activityTotal())} scheduled activities per person</div></div><button class="btn blue" onclick="openModal('day')">+ Day</button></div>${a.map((d,idx)=>`<section class="card day-card"><div class="row day-heading"><div><div class="sub">DAY ${idx+1}</div><h3>${esc(d.day)}</h3>${d.date?`<div class="sub">${esc(d.date)}</div>`:''}</div><button class="btn secondary" onclick="openActivity(null,${idx})">+ Activity</button></div><div class="timeline">${d.items.map((item,j)=>`<div class="event"><time>${esc(item[0])}</time><div class="event-flex"><div><b>${esc(item[2])} ${esc(item[1])}</b><div class="sub">${Number(item[3])?cash(item[3])+' / person':'No cost entered'}</div></div><button class="icon-button" aria-label="Remove activity" onclick="deleteActivity(${idx},${j})">✕</button></div></div>`).join('')||'<div class="empty">This day is open. Add an experience!</div>'}</div></section>`).join('')||'<div class="empty">No days yet. Add your first day to start planning.</div>'}<button class="btn secondary full-width" onclick="openActivity()">+ Schedule an activity</button></main>`;
  }
  window.openActivity=function(id=null,dayIndex=null){
    pendingIdea=id?(s.ideas[s.current]||[]).find(x=>x.id===id)||null:null;
    editDayIndex=dayIndex;
    modal='activity';render();
  };
  window.deleteActivity=function(di,ii){
    const d=(s.itinerary[s.current]||[])[di];
    if(!d||!d.items[ii])return;
    d.items.splice(ii,1);persist();toast('Removed from itinerary');
  };
  window.createDay=function(e){
    e.preventDefault();const f=new FormData(e.target);
    const a=s.itinerary[s.current]??=[];
    const label=String(f.get('label')||'').trim()||('Day '+(a.length+1)+' · '+trip().destination);
    a.push({day:label,date:String(f.get('date')||''),items:[]});
    modal=null;tab='itinerary';persist();toast('Day added');
  };
  window.createActivity=function(e){
    e.preventDefault();const f=new FormData(e.target);
    const a=s.itinerary[s.current]??=[];
    if(!a.length){a.push({day:'Day 1 · '+trip().destination,items:[]})}
    const index=Math.max(0,Math.min(a.length-1,Number(f.get('day'))||0));
    a[index].items.push([String(f.get('time')||'Anytime').trim()||'Anytime',String(f.get('title')||'').trim(),String(f.get('emoji')||'📍'),Math.max(0,Number(f.get('cost'))||0)]);
    modal=null;pendingIdea=null;editDayIndex=null;tab='itinerary';persist();toast('Added to itinerary');
  };
  modalHTML=function(){
    if(modal==='day'){
      return sheet('Add itinerary day',`<form onsubmit="createDay(event)"><div class="field"><label>Day name</label><input name="label" maxlength="80" placeholder="Day 4 · Kyoto" required></div><div class="field"><label>Date (optional)</label><input type="date" name="date"></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Add day</button></div></form>`);
    }
    if(modal==='activity'){
      const a=s.itinerary[s.current]||[];
      return sheet('Schedule an activity',`<form onsubmit="createActivity(event)"><div class="field"><label>Day</label><select name="day">${a.length?a.map((d,i)=>`<option value="${i}" ${i===editDayIndex?'selected':''}>${esc(d.day)}</option>`).join(''):'<option value="0">Day 1 (created automatically)</option>'}</select></div><div class="field"><label>Experience</label><input name="title" maxlength="120" required value="${esc(pendingIdea?.title||'')}" placeholder="Dinner and sunset views"></div><div class="two-fields"><div class="field"><label>Time</label><input name="time" placeholder="6:30 PM" value="Anytime"></div><div class="field"><label>Emoji</label><input name="emoji" maxlength="4" value="${esc(pendingIdea?.emoji||'📍')}"></div></div><div class="field"><label>Estimated cost per person (USD)</label><input name="cost" type="number" step="0.01" min="0" value="${Number(pendingIdea?.cost||0)}"></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Add activity</button></div></form>`);
    }
    if(modal==='estimate'){
      const t=trip(),b=ensureEstimate(t);
      const labels=[['flights','Round-trip flights'],['lodging','Accommodation / person'],['transport','Local transportation'],['food','Meals / person'],['activities','Activity allowance / person'],['misc','Miscellaneous / buffer']];
      return sheet('Trip cost estimates',`<form onsubmit="saveEstimates(event)">${labels.map(([k,l])=>`<div class="field"><label>${l} (USD)</label><input name="${k}" type="number" min="0" step="1" required value="${Number(b[k])||0}"></div>`).join('')}<div class="field"><label>Your target budget / person</label><input type="number" name="target" min="0" step="1" value="${Number(t.budget)||0}"></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Save estimates</button></div></form>`);
    }
    return oldModal();
  };
  window.saveEstimates=function(e){
    e.preventDefault();const f=new FormData(e.target),t=trip();
    const b=ensureEstimate(t);
    for(const k of Object.keys(b)) b[k]=Math.max(0,Number(f.get(k))||0);
    t.budget=Math.max(0,Number(f.get('target'))||0);
    modal=null;persist();toast('Budget updated');
  };
  render=function(){
    let body=tab==='home'?home():tab==='discover'?discover():tab==='plan'?plan():tab==='itinerary'?itineraryScreen():tab==='budget'?budgetPage():tab==='profile'?profilePage():tab==='map'?map():tab==='wallet'?wallet():tripMode();
    $('#app').innerHTML=`<div class="shell">${roavelyHeader()}${body}${nav()}${modalHTML()}</div>`;
  };
})();
render();

/* END app.js */


/* BEGIN phase3-discover.js */
(function phase3Discovery() {
  const oldRender=render, oldHome=home;
  const candidates=[
    ['japan','🇯🇵','Japan','Tokyo · Kyoto · Osaka',['Food','Culture','History','Photography','Architecture'],175,1350],
    ['iceland','🇮🇸','Iceland','Reykjavík · South Coast',['Adventure','Nature','Photography','Road trips','Hiking'],240,850],
    ['italy','🇮🇹','Italy','Rome · Florence · Amalfi',['Food','Art','History','Architecture','Beaches'],180,1000],
    ['new-zealand','🇳🇿','New Zealand','Queenstown · South Island',['Adventure','Nature','Hiking','Photography','Road trips'],195,1700],
    ['australia','🇦🇺','Australia','Sydney · Melbourne',['Adventure','Beaches','Wildlife','Food','Road trips'],185,1650],
    ['norway','🇳🇴','Norway','Bergen · Lofoten',['Nature','Photography','Hiking','Road trips','Culture'],220,1100],
    ['switzerland','🇨🇭','Switzerland','Interlaken · Zermatt',['Adventure','Nature','Hiking','Photography','Relaxation'],255,1100],
    ['scotland','🏴','Scotland','Edinburgh · Highlands',['History','Nature','Photography','Architecture','Road trips'],170,800],
    ['costa-rica','🇨🇷','Costa Rica','La Fortuna · Manuel Antonio',['Adventure','Wildlife','Nature','Hiking','Beaches'],145,700],
    ['portugal','🇵🇹','Portugal','Lisbon · Porto',['Food','History','Architecture','Beaches','Relaxation'],140,900]
  ].map(x=>({id:x[0],emoji:x[1],name:x[2],regions:x[3],interests:x[4],daily:x[5],flight:x[6]}));
  const wildcards=[
    ['🧗','Canyoning through alpine waterfalls','Switzerland',165],
    ['🏄','Take a surfing lesson','Australia',95],
    ['🌙','Midnight street-food tour','Tokyo',85],
    ['🌳','Zipline over a rainforest','Costa Rica',110],
    ['🌌','Camp under the northern lights','Iceland',210],
    ['⛵','Sail at sunset','Portugal',95]
  ];
  let wildIndex=0,startX=null,startY=null;
  function init(){
    s.extras=s.extras||{};
    s.extras.swipes=s.extras.swipes||{};
    s.extras.swipes[s.current]=s.extras.swipes[s.current]||{};
    s.extras.demoProfiles=s.extras.demoProfiles||{
      Mike:{interests:['Food','Nightlife','Culture'],budget:4800},
      John:{interests:['History','Photography','Nature','Architecture'],budget:4400},
      Matt:{interests:['Adventure','Nature','Food','Wildlife'],budget:5100}
    };
  }
  init();
  window.roavelyNext=window.roavelyNext||{};
  const app=window.roavelyNext;
  app.init=init;
  app.money=v=>'$'+Math.round(Number(v)||0).toLocaleString('en-US');
  app.renderPage=html=>$('#app').innerHTML=`<div class="shell">${roavelyHeader()}${html}${nav()}${modalHTML()}</div>`;
  app.demoLabel=()=>`<span class="preview-note">LOCAL PREVIEW · OTHER TRAVELERS ARE DEMO DATA</span>`;
  app.candidates=candidates;
  app.score=d=>{
    const all=(s.people[s.current]||[]).map(name=>({name,p:name===(s.profile?.name||'Andy')?{interests:s.profile?.interests||[],budget:Number(trip().budget)||4000}:s.extras.demoProfiles[name]})).filter(x=>x.p);
    const duration=Math.max(5,Math.min(21,Math.ceil((new Date(trip().end)-new Date(trip().start))/86400000)||7));
    const forecast=d.flight+d.daily*duration;
    const each=all.map(({name,p})=>{
      const common=d.interests.filter(v=>p.interests.includes(v)).length;
      const interest=Math.round(100*common/3);
      const penalty=forecast<=p.budget?100:Math.max(0,100-160*(forecast/p.budget-1));
      return {name,score:Math.max(0,Math.min(100,Math.round(interest*.75+penalty*.25))),sample:name!==(s.profile?.name||'Andy')};
    });
    return {score:each.length?Math.round(each.reduce((n,x)=>n+x.score,0)/each.length):0,each,forecast,duration,missing:(s.people[s.current]||[]).filter(n=>!all.find(x=>x.name===n)).length};
  };
  const info=d=>app.score(d);
  const swipes=()=>s.extras.swipes[s.current];
  function hub(){
    return `<main class="content"><div class="page-heading"><div class="sub">DISCOVER</div><h2>Find your next adventure.</h2><p>Personal picks, group compatibility, and adventures outside your comfort zone.</p></div>
      <div class="feature-grid">
        <button class="feature-tile" onclick="tab='matches';render()"><span>🤝</span><b>Group matches</b><small>Find common ground</small></button>
        <button class="feature-tile" onclick="tab='swipe';render()"><span>↔️</span><b>Swipe to vote</b><small>Interested or pass?</small></button>
        <button class="feature-tile" onclick="tab='wildcard';render()"><span>🎲</span><b>The Wildcard</b><small>Try something bold</small></button>
        <button class="feature-tile" onclick="tab='places';render()"><span>📍</span><b>Place search</b><small>Open your map</small></button>
      </div><div class="card"><b>✦ Personalized recommendations</b><p class="small-note">Your profile-based activity suggestions are still available.</p><button class="btn blue" onclick="tab='recommendations';render()">Discover activities →</button></div></main>`;
  }
  function matches(){
    const all=candidates.map(d=>({d,...info(d)})).sort((a,b)=>b.score-a.score);
    return `<main class="content"><div class="page-heading"><div class="sub">DISCOVER TOGETHER</div><h2>Group compatibility</h2><p>Explore destinations ranked by your group's shared interests and individual budget targets.</p>${app.demoLabel()}</div>
      <div class="card soft-card"><b>How we score matches</b><p class="small-note">75% interests and 25% estimated budget fit. Scores use illustrative costs and clearly labeled sample preferences for friends who have not signed in.</p></div>
      ${all.map(({d,score,each,forecast,duration,missing})=>`<article class="card match-card"><div class="row"><div class="row"><span class="match-icon">${d.emoji}</span><div><div class="sub">${esc(d.regions)}</div><b class="rec-title">${esc(d.name)}</b></div></div><div class="score-pill">${score}%<small>match</small></div></div>
        <div class="progress"><i style="width:${score}%"></i></div><div class="tag-row">${d.interests.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div>
        <p class="small-note">Illustrative ${duration}-day budget: ${app.money(forecast)} per traveler, including example airfare.</p>
        <details class="match-details"><summary>Show each person's match</summary>${each.map(x=>`<div class="row profile-match"><span>${esc(x.name)} ${x.sample?'<small>(demo)</small>':''}</span><b>${x.score}%</b></div>`).join('')}${missing?`<div class="sub">${missing} traveler profiles still needed</div>`:''}</details>
        <div class="swipe-buttons"><button class="btn secondary" onclick="roavelyDestinationVote('${d.id}','no')">${swipes()[d.id]==='no'?'✓ ':''}Pass</button><button class="btn blue" onclick="roavelyDestinationVote('${d.id}','yes')">${swipes()[d.id]==='yes'?'✓ ':''}Interested</button><button class="btn secondary" onclick="roavelyDestinationVote('${d.id}','save')">${swipes()[d.id]==='save'?'★ ':'☆ '}Save</button></div></article>`).join('')}
      <p class="small-note">Scores are an estimate, not an assessment of friends who haven't shared their preferences.</p></main>`;
  }
  function swipe(){
    const next=candidates.slice().sort((a,b)=>info(b).score-info(a).score).find(d=>!swipes()[d.id]);
    if(!next)return `<main class="content"><div class="page-heading"><h2>All explored!</h2><p>You've responded to all ${candidates.length} example destinations.</p></div><button class="btn secondary" onclick="roavelyClearSwipes()">Reset choices</button></main>`;
    return `<main class="content"><div class="page-heading"><div class="sub">QUICK PICKS</div><h2>Swipe to explore.</h2><p>Swipe right for interested, left for pass, or use the buttons.</p></div><div class="card swipe-card" data-dest="${next.id}" onpointerdown="roavelySwipeStart(event)" onpointerup="roavelySwipeEnd(event)"><div class="swipe-big">${next.emoji}</div><h2>${esc(next.name)}</h2><p>${esc(next.regions)}</p><div class="score-pill">${info(next).score}% group match</div><div class="tag-row">${next.interests.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div></div>
      <div class="swipe-buttons"><button class="btn secondary" onclick="roavelyDestinationVote('${next.id}','no')">✕ Pass</button><button class="btn blue" onclick="roavelyDestinationVote('${next.id}','yes')">♥ Interested</button><button class="btn secondary" onclick="roavelyDestinationVote('${next.id}','save')">☆ Save</button></div><p class="small-note">${Object.keys(swipes()).length} / ${candidates.length} reviewed on this device.</p></main>`;
  }
  window.roavelySwipeStart=e=>{startX=e.clientX;startY=e.clientY};
  window.roavelySwipeEnd=e=>{
    if(startX===null)return;
    const x=e.clientX-startX,y=e.clientY-startY;startX=null;startY=null;
    if(Math.abs(x)<75||Math.abs(x)<Math.abs(y)*1.3)return;
    const node=e.target.closest('[data-dest]');
    if(node)window.roavelyDestinationVote(node.dataset.dest,x>0?'yes':'no');
  };
  window.roavelyClearSwipes=()=>{if(confirm('Clear your swipe answers on this device?')){s.extras.swipes[s.current]={};persist()}};
  window.roavelyDestinationVote=(id,answer)=>{
    const d=candidates.find(v=>v.id===id);
    if(!d)return;
    swipes()[id]=answer;
    if(answer==='yes'){
      const ideasList=s.ideas[s.current]||[];
      if(!ideasList.some(x=>x.sourceId==='destination-'+id))ideasList.unshift({id:'groupdest'+Date.now(),sourceId:'destination-'+id,title:`${d.name} — destination proposal`,emoji:d.emoji,city:d.regions,cost:0,kind:'destination',suggestedBy:s.profile?.name||'Andy',v:{[s.profile?.name||'Andy']:'yes'},comments:[]});
    }
    if(app.alert)app.alert('Destination choice saved: '+d.name+' — '+answer);
    persist();toast('Choice saved locally');
  };
  function wildcard(){
    const [emoji,title,city,cost]=wildcards[wildIndex];
    return `<main class="content"><div class="page-heading"><div class="sub">THE WILDCARD</div><h2>Something unexpected.</h2><p>Give the group a challenge outside the ordinary.</p></div>
      <div class="wildcard-card"><div class="wildcard-emoji">${emoji}</div><div class="sub">${esc(city)}</div><h2>${esc(title)}</h2><p>Illustrative price: ${app.money(cost)} per person</p></div><div class="swipe-buttons"><button class="btn secondary" onclick="roavelyShuffle()">↻ Another</button><button class="btn blue" onclick="roavelyPitch()">+ Pitch to group</button></div></main>`;
  }
  window.roavelyShuffle=()=>{wildIndex=(wildIndex+1+Math.floor(Math.random()*(wildcards.length-1)))%wildcards.length;render()};
  window.roavelyPitch=()=>{
    const [emoji,title,city,cost]=wildcards[wildIndex];
    (s.ideas[s.current]??=[]).unshift({id:'wild'+Date.now(),title,emoji,city,cost,kind:'activity',suggestedBy:s.profile?.name||'Andy',v:{[s.profile?.name||'Andy']:'yes'},comments:[]});
    if(app.alert)app.alert('A Wildcard experience was suggested.');
    tab='plan';persist();toast('Wildcard added to your group');
  };
  home=function(){
    return oldHome().replace('</main>',`<div class="section-title"><h3>Explore together</h3><button onclick="tab='matches';render()">See matches →</button></div><div class="feature-grid"><button class="feature-tile" onclick="tab='matches';render()"><span>🤝</span><b>Group compatibility</b><small>Find shared favorites</small></button><button class="feature-tile" onclick="tab='wildcard';render()"><span>🎲</span><b>The Wildcard</b><small>Discover a surprise</small></button></div></main>`);
  };
  render=function(){
    init();
    if(tab==='discover'||tab==='matches'||tab==='swipe'||tab==='wildcard'){
      app.renderPage(tab==='discover'?hub():tab==='matches'?matches():tab==='swipe'?swipe():wildcard());
      return;
    }
    if(tab==='recommendations'){
      tab='discover';
      oldRender();
      tab='recommendations';
      $('.content')?.insertAdjacentHTML('afterbegin',`<button class="text-button" onclick="tab='discover';render()">← Back to Explore</button>`);
      return;
    }
    oldRender();
  };
  save();render();
})();

/* END phase3-discover.js */


/* BEGIN phase3-crew.js */
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

/* END phase3-crew.js */


/* BEGIN phase3-planner.js */
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

/* END phase3-planner.js */


/* BEGIN phase4-board.js */
(function addAdventureBoard(){
  const oldRender=render,oldPlan=plan,oldHome=home,oldModal=modalHTML;
  const api=window.roavelyNext;
  const stages=['suggested','voting','approved','booked','done'];
  const names={suggested:'Suggested',voting:'Voting',approved:'Approved',booked:'Booked',done:'Done'};
  function records(){
    s.extras=s.extras||{};
    s.extras.adventureBoard=s.extras.adventureBoard||{};
    const key=s.current;
    if(!s.extras.adventureBoard[key])s.extras.adventureBoard[key]={config:{required:Math.max(1,Math.ceil((s.people[key]||[]).length/2))},items:{}};
    return s.extras.adventureBoard[key];
  }
  const people=()=>s.people[s.current]||[];
  const cfg=()=>records().config;
  const item=id=>{
    const x=records().items;
    return x[id]||(x[id]={status:'suggested',due:'',assignee:'',notes:''});
  };
  const tally=idea=>{
    const votes=Object.values(idea.v||{});
    return {approve:votes.filter(v=>v==='yes'||v==='love').length,no:votes.filter(v=>v==='no').length,abstain:votes.filter(v=>v==='maybe').length,total:votes.length};
  };
  function stageUI(idea){
    const record=item(idea.id),votes=tally(idea),needed=Number(cfg().required)||1,position=stages.indexOf(record.status);
    const meets=votes.approve>=needed;
    const next=position<4?stages[position+1]:null;
    return `<article class="card board-item"><div class="row"><div><b>${esc(idea.emoji||'📍')} ${esc(idea.title)}</b><div class="sub">${esc(idea.city||'Unspecified')} · ${(api.money)(idea.cost||0)}/person</div></div><span class="stage-label">${names[record.status]||'Suggested'}</span></div>
      <div class="board-progress">${stages.map((name,i)=>`<span class="${i<=position?'complete':''}" title="${names[name]}"></span>`).join('')}</div>
      <div class="row board-facts"><span>👍 ${votes.approve}/${needed} approvals</span><span>👎 ${votes.no} passes</span></div>
      ${record.assignee?`<p class="small-note">Responsible: ${esc(record.assignee)}</p>`:''}
      ${record.due?`<p class="small-note">Decision deadline: ${esc(record.due)}</p>`:''}
      <div class="row board-actions"><button class="btn secondary" onclick="editAdventureBoard('${esc(idea.id)}')">Manage</button>
       ${next?`<button class="btn blue" ${next==='approved'&&!meets?'disabled':''} onclick="advanceAdventureBoard('${esc(idea.id)}')">${next==='voting'?'Start voting':next==='approved'?'Approve':next==='booked'?'Mark booked':'Mark done'} →</button>`:`<span class="pill">✓ Completed</span>`}</div>
      ${next==='approved'&&!meets?`<div class="sub">Needs ${Math.max(0,needed-votes.approve)} more positive vote${needed-votes.approve===1?'':'s'} before approval.</div>`:''}
      ${record.status==='approved'||record.status==='booked'?`<button class="text-button" onclick="openActivity('${esc(idea.id)}')">+ Place on itinerary →</button>`:''}</article>`;
  }
  function board(){
    const all=s.ideas[s.current]||[];
    const buckets=stages.map(stage=>({stage,ideas:all.filter(i=>item(i.id).status===stage)}));
    const approved=buckets.filter(x=>x.stage==='approved'||x.stage==='booked'||x.stage==='done').reduce((n,x)=>n+x.ideas.length,0);
    return `<main class="content"><div class="page-heading"><div class="sub">FROM IDEA TO MEMORY</div><h2>The Adventure Board.</h2><p>Track every suggestion through voting, approval, booking and completion.</p>${api.demoLabel()}</div>
      <div class="card soft-card"><div class="row"><div><b>Group voting rules</b><div class="sub">${cfg().required} positive vote${cfg().required===1?'':'s'} needed before an activity is approved.</div></div><button class="btn secondary" onclick="openModal('boardrules')">Edit</button></div></div>
      <div class="board-summary"><div><b>${all.length}</b><span>Ideas</span></div><div><b>${approved}</b><span>Approved+</span></div><div><b>${all.filter(i=>item(i.id).status==='done').length}</b><span>Completed</span></div></div>
      ${buckets.filter(x=>x.ideas.length).map(({stage,ideas})=>`<div class="section-title"><h3>${names[stage]} <span class="sub">(${ideas.length})</span></h3></div>${ideas.map(stageUI).join('')}`).join('')||'<div class="empty">Add group ideas to start your Adventure Board.</div>'}
      <button class="btn blue full-width" onclick="openModal('idea')">+ Suggest something</button></main>`;
  }
  window.advanceAdventureBoard=id=>{
    const idea=(s.ideas[s.current]||[]).find(i=>i.id===id);if(!idea)return;
    const obj=item(id),index=stages.indexOf(obj.status),next=stages[index+1];
    if(!next)return;
    if(next==='approved'&&tally(idea).approve<Number(cfg().required||1)){toast('More positive votes are needed');return}
    obj.status=next;
    api.alert?.(idea.title+' moved to '+names[next]+'.');
    persist();
    toast('Moved to '+names[next]);
  };
  window.editAdventureBoard=id=>{if(!(s.ideas[s.current]||[]).find(i=>i.id===id))return;window.roavelyBoardId=id;modal='boarditem';render()};
  window.saveBoardRules=e=>{
    e.preventDefault();let x=Number(new FormData(e.target).get('required'))||1;
    cfg().required=Math.max(1,Math.min(people().length||1,x));modal=null;persist();
  };
  window.saveBoardItem=e=>{
    e.preventDefault();const id=window.roavelyBoardId;
    const obj=item(id),f=new FormData(e.target),status=String(f.get('status')),due=String(f.get('due')||'');
    if(!stages.includes(status))return;
    const idea=(s.ideas[s.current]||[]).find(i=>i.id===id);
    if(status==='approved'&&idea&&tally(idea).approve<(Number(cfg().required)||1)){toast('Approval threshold not met');return}
    obj.status=status;obj.due=due;obj.assignee=String(f.get('assignee')||'').slice(0,60);obj.notes=String(f.get('notes')||'').slice(0,600);
    modal=null;api.alert?.('Adventure Board updated: '+(idea?.title||'idea'));persist();
  };
  plan=function(){
    const html=oldPlan();
    return html.replace('</main>',`<div class="card board-promo"><div class="row"><div><b>🧭 Adventure Board</b><div class="sub">See what’s suggested, approved, booked and done.</div></div><button class="btn secondary" onclick="tab='board';render()">Open →</button></div></div></main>`);
  };
  home=function(){
    return oldHome().replace('</main>',`<div class="card board-promo"><div class="row"><div><b>🗳️ The Adventure Board</b><div class="sub">Take winning ideas from a vote to a booking.</div></div><button class="btn blue" onclick="tab='board';render()">View</button></div></div></main>`);
  };
  modalHTML=function(){
    if(modal==='boardrules')return sheet('Group approval rule',`<form onsubmit="saveBoardRules(event)"><div class="field"><label>Number of positive votes required</label><input name="required" type="number" min="1" max="${people().length||1}" value="${cfg().required}" required></div><p class="small-note">Votes from members are demo data until each person signs in. This rule affects progression on this device only.</p><div class="actions"><button class="btn secondary" type="button" onclick="closeModal()">Cancel</button><button class="btn blue">Save</button></div></form>`);
    if(modal==='boarditem'){
      const id=window.roavelyBoardId,idea=(s.ideas[s.current]||[]).find(i=>i.id===id);
      if(!idea)return '';
      const it=item(id);
      return sheet('Manage '+esc(idea.title),`<form onsubmit="saveBoardItem(event)"><div class="field"><label>Stage</label><select name="status">${stages.map(st=>`<option value="${st}" ${it.status===st?'selected':''}>${names[st]}</option>`).join('')}</select></div><div class="field"><label>Decision or booking deadline</label><input type="date" name="due" value="${esc(it.due||'')}"></div><div class="field"><label>Who's responsible?</label><select name="assignee"><option value="">Unassigned</option>${people().map(n=>`<option value="${esc(n)}" ${n===it.assignee?'selected':''}>${esc(n)}</option>`).join('')}</select></div><div class="field"><label>Notes</label><textarea name="notes" maxlength="600" rows="3">${esc(it.notes||'')}</textarea></div><div class="actions"><button class="btn secondary" type="button" onclick="closeModal()">Cancel</button><button class="btn blue">Save</button></div></form>`);
    }
    return oldModal();
  };
  render=function(){
    if(tab==='board'){api.renderPage(board());return}
    oldRender();
  };
  save();render();
})();

/* END phase4-board.js */


/* BEGIN phase4-finance.js */
(function addTripFinancesAndBookings(){
  const oldRender=render,oldModal=modalHTML,oldHome=home;
  const api=window.roavelyNext;
  const me=()=>s.profile?.name||'Andy';
  const members=()=>s.people[s.current]||[me()];
  const cash=x=>'$'+Number(x||0).toFixed(2);
  const num=x=>Math.round((Number(x)||0)*100)/100;
  const bucket=key=>{
    s.extras=s.extras||{};s.extras[key]=s.extras[key]||{};
    return s.extras[key][s.current]||(s.extras[key][s.current]=[]);
  };
  const validUrl=value=>{
    if(!value)return '';
    try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}
  };
  function allocations(exp){
    const p=members().filter(x=>exp.split&&Object.hasOwn(exp.split,x));
    return p.map(person=>({person,amount:num(exp.split[person]),settled:(exp.settled||[]).includes(person)||person===exp.payer}));
  }
  function expensePage(){
    const entries=bucket('ledger');
    const total=entries.reduce((n,x)=>n+Number(x.total||0),0);
    const debt={};
    for(const e of entries){
      for(const sh of allocations(e)){
        if(sh.person===e.payer||sh.settled||sh.amount<=0)continue;
        debt[sh.person]=(debt[sh.person]||0)-sh.amount;
        debt[e.payer]=(debt[e.payer]||0)+sh.amount;
      }
    }
    const creditors=Object.entries(debt).filter(x=>x[1]>.005).map(([name,amount])=>({name,amount}));
    const owing=Object.entries(debt).filter(x=>x[1]<-.005).map(([name,amount])=>({name,amount:-amount}));
    const settlements=[];
    for(const o of owing){for(const c of creditors){const n=Math.min(o.amount,c.amount);if(n>.005){settlements.push(`${o.name} → ${c.name}: ${cash(n)}`);o.amount=num(o.amount-n);c.amount=num(c.amount-n)}if(o.amount<.005)break}}
    return `<main class="content"><div class="page-heading"><div class="sub">SPLIT WITHOUT THE SPREADSHEETS</div><h2>Who owes what?</h2><p>Equal or custom splits, payments and a clear group settlement summary.</p>${api.demoLabel()}</div>
      <section class="budget-hero"><div class="sub">RECORDED GROUP SPENDING</div><div class="budget-number">${cash(total)}</div><div class="budget-caption">${entries.length} expenses in this ledger · historical wallet is separate</div></section>
      <div class="row itinerary-bar"><b>Settle up</b><button class="btn blue" onclick="openModal('addexpense')">+ Expense</button></div>
      <div class="card">${settlements.length?settlements.map(str=>`<div class="settlement-line">💸 ${esc(str)}</div>`).join(''):'<div class="empty">Nobody owes anything from unsettled expenses in this ledger.</div>'}</div>
      <div class="section-title"><h3>Expenses</h3></div>
      ${entries.map(e=>`<article class="card"><div class="row"><div><b>${esc(e.title)}</b><div class="sub">Paid by ${esc(e.payer)} · ${esc(e.category||'Other')} · ${esc(e.when||'')}</div></div><b>${cash(e.total)}</b></div>
        ${e.notes?`<p class="small-note">${esc(e.notes)}</p>`:''}
        ${allocations(e).map(sh=>`<div class="row share-line"><span>${esc(sh.person)} · ${cash(sh.amount)}</span>${sh.person===e.payer?'<span class="sub">Paid</span>':`<button class="btn ${sh.settled?'secondary':'blue'}" onclick="toggleExpenseSettlement('${e.id}', '${encodeURIComponent(sh.person)}')">${sh.settled?'✓ Settled':'Mark settled'}</button>`}</div>`).join('')}
        ${e.receipt&&validUrl(e.receipt)?`<a class="text-button" href="${esc(validUrl(e.receipt))}" rel="noopener noreferrer" target="_blank">Receipt link ↗</a>`:''}
        <div class="row"><button class="text-button" onclick="removeTripExpense('${e.id}')">Remove expense</button></div></article>`).join('')||'<div class="empty">No expenses yet. Add the hotel, dinner or tickets to start splitting.</div>'}
      <div class="card soft-card"><b>Keep this separate from booking estimates</b><div class="sub">This ledger records actual entered payments and splits. It isn't added to the itinerary cost forecast. Transactions and settlement confirmations aren't independently verified.</div></div></main>`;
  }
  window.toggleExpenseSettlement=(id,encoded)=>{
    const e=bucket('ledger').find(e=>e.id===id),name=decodeURIComponent(encoded);
    if(!e||!allocations(e).find(x=>x.person===name)||name===e.payer)return;
    const done=e.settled||(e.settled=[]),idx=done.indexOf(name);
    if(idx>=0)done.splice(idx,1);else done.push(name);
    api.alert?.('Expense settlement updated: '+e.title);persist();
  };
  window.removeTripExpense=id=>{
    if(!confirm('Remove this expense and its settlement history?'))return;
    const arr=bucket('ledger'),idx=arr.findIndex(e=>e.id===id);
    if(idx<0)return;arr.splice(idx,1);persist();
  };
  window.saveNewTripExpense=e=>{
    e.preventDefault();
    const f=new FormData(e.target),title=String(f.get('title')||'').trim().slice(0,120);
    const total=num(f.get('total')),payer=String(f.get('payer')||'');
    if(!title||total<=0||!members().includes(payer)){toast('Enter valid expense details');return}
    const people=members(),who=String(f.get('method'))==='custom',split={};
    if(who){
      let sum=0;
      people.forEach((name,i)=>{let val=num(f.get('part'+i));split[name]=val;sum+=Math.round(val*100)});
      if(Math.abs(sum-Math.round(total*100))>0){toast('Custom shares must add up to the total');return}
    }else{
      const cents=Math.round(total*100),base=Math.floor(cents/people.length),remainder=cents%people.length;
      people.forEach((name,i)=>split[name]=(base+(i<remainder?1:0))/100);
    }
    const url=String(f.get('receipt')||'').trim();
    if(url&&!validUrl(url)){toast('Receipt link must start with https:// or http://');return}
    bucket('ledger').unshift({id:'expense'+Date.now(),title,total,payer,split,settled:[],when:new Date().toISOString().slice(0,10),category:String(f.get('category')||'Other'),notes:String(f.get('notes')||'').slice(0,500),receipt:url});
    api.alert?.('New group expense: '+title);modal=null;persist();
  };
  function vault(){
    const entries=bucket('vault');
    const legacy=s.reservations[s.current]||[];
    return `<main class="content"><div class="page-heading"><div class="sub">ONE PLACE FOR THE DETAILS</div><h2>Reservation vault.</h2><p>Organize flights, hotel bookings, trains and attraction reservations.</p></div>
      <div class="card soft-card"><b>Local preview privacy</b><div class="sub">Entries are stored unencrypted on this browser. Do not save passport numbers, payment card numbers, passwords or sensitive documents. Private document storage comes with secure accounts.</div></div>
      <div class="row itinerary-bar"><b>Saved bookings</b><button class="btn blue" onclick="openModal('vault')">+ Booking</button></div>
      ${entries.map(b=>`<div class="card"><div class="row"><div><b>${esc(b.icon||'🎟️')} ${esc(b.title)}</b><div class="sub">${esc(b.type)} · ${esc(b.when||'Date TBD')} · ${esc(b.status)}</div></div><span class="pill">${esc(b.status)}</span></div>
      ${b.confirmation?`<div class="sub">Reference: ${esc(b.confirmation)}</div>`:''}
      ${b.notes?`<p class="small-note">${esc(b.notes)}</p>`:''}
      <div class="row"><button class="text-button" onclick="removeVaultBooking('${b.id}')">Remove</button>${b.link&&validUrl(b.link)?`<a class="text-button" href="${esc(validUrl(b.link))}" target="_blank" rel="noopener noreferrer">Open reservation ↗</a>`:''}</div></div>`).join('')}
      ${legacy.map(x=>`<div class="card"><b>${esc(x[0])} ${esc(x[1])}</b><div class="sub">${esc(x[2])}</div><span class="tag">Sample reservation</span></div>`).join('')}
      ${!entries.length&&!legacy.length?'<div class="empty">No bookings yet.</div>':''}</main>`;
  }
  window.saveVaultBooking=e=>{
    e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')||'').trim(),link=String(f.get('link')||'').trim();
    if(!title){toast('Booking title is required');return}
    if(link&&!validUrl(link)){toast('Use a secure http(s) link');return}
    const type=String(f.get('type')||'Other');
    const emojis={Flight:'✈️',Hotel:'🏨',Train:'🚆',Experience:'🎟️',Restaurant:'🍽️',Other:'📌'};
    bucket('vault').unshift({id:'booking'+Date.now(),type,title:title.slice(0,120),icon:emojis[type]||'📌',when:String(f.get('when')||''),status:String(f.get('status')||'Planning'),confirmation:String(f.get('confirmation')||'').slice(0,80),link,notes:String(f.get('notes')||'').slice(0,600)});
    api.alert?.('Reservation added: '+title);modal=null;persist();
  };
  window.removeVaultBooking=id=>{if(!confirm('Remove this saved reservation?'))return;const a=bucket('vault'),i=a.findIndex(x=>x.id===id);if(i>=0){a.splice(i,1);persist()}};
  function flightPage(){
    return `<main class="content"><div class="page-heading"><div class="sub">GET THERE ON TIME</div><h2>Transportation tracker.</h2><p>Keep flight and train details together, including departure times and terminals.</p></div>
    <div class="card soft-card"><b>Manual schedule, not live tracking</b><div class="sub">Flight delays, gates, terminal changes and real-time status require an airline or flight-status provider. Confirm details with the carrier before departure.</div></div>
    <div class="row itinerary-bar"><b>Transportation</b><button class="btn blue" onclick="openModal('transport')">+ Flight / train</button></div>
    ${bucket('transport').map(x=>`<div class="card"><div class="row"><div><b>${esc(x.mode==='Flight'?'✈️':'🚆')} ${esc(x.number||x.mode)}</b><div class="sub">${esc(x.from)} → ${esc(x.to)}</div></div><span class="pill">${esc(x.status)}</span></div>
      <div class="sub">${esc(x.date||'Date TBD')} · ${esc(x.time||'Time TBD')} · Terminal/platform: ${esc(x.terminal||'Unconfirmed')}</div>
      <button class="text-button" onclick="removeTransport('${x.id}')">Remove</button></div>`).join('')||'<div class="empty">No transportation details entered.</div>'}
    </main>`;
  }
  window.saveTransport=e=>{
    e.preventDefault();const f=new FormData(e.target);
    const from=String(f.get('from')||'').trim(),to=String(f.get('to')||'').trim();
    if(!from||!to)return;
    bucket('transport').push({id:'transport'+Date.now(),mode:String(f.get('mode')),from:from.slice(0,70),to:to.slice(0,70),number:String(f.get('number')||'').slice(0,30),date:String(f.get('date')||''),time:String(f.get('time')||''),terminal:String(f.get('terminal')||'').slice(0,50),status:'Unverified'});
    modal=null;persist();
  };
  window.removeTransport=id=>{const a=bucket('transport'),i=a.findIndex(x=>x.id===id);if(i>=0){a.splice(i,1);persist()}};
  function prices(){
    const a=bucket('priceWatch');
    return `<main class="content"><div class="page-heading"><div class="sub">KNOW YOUR TARGET</div><h2>Price watchlist.</h2><p>Record example flight and hotel prices, compare quotes, and spot changes.</p></div>
    <div class="card soft-card"><b>Not an automatic price monitor yet</b><div class="sub">Enter your own quotes and updates. Roavely won't claim a fare is available or send price-drop alerts until a live pricing service is connected.</div></div>
    <div class="row itinerary-bar"><b>Watched bookings</b><button class="btn blue" onclick="openModal('pricewatch')">+ Watch</button></div>
    ${a.map(x=>{
      const last=x.history[x.history.length-1],first=x.history[0],delta=last.amount-first.amount;
      return `<div class="card"><div class="row"><div><b>${esc(x.type==='Hotel'?'🏨':'✈️')} ${esc(x.title)}</b><div class="sub">Target ${asMoney(x.target)} · ${x.history.length} recorded prices</div></div><b>${asMoney(last.amount)}</b></div>
      <div class="sub">${delta===0?'No price change recorded':`${delta<0?'Down':'Up'} ${asMoney(Math.abs(delta))} from first quote`}${last.amount<=x.target?' · Target reached':''}</div>
      <form class="savings-controls" onsubmit="recordPrice(event,'${x.id}')"><label>New quote (USD)<input type="number" name="price" step="0.01" min="0.01" required></label><button class="btn secondary">Record</button></form>
      <button class="text-button" onclick="removePriceWatch('${x.id}')">Remove watch</button></div>`;
    }).join('')||'<div class="empty">No watched prices yet.</div>'}</main>`;
  }
  const asMoney=value=>'$'+Math.round(Number(value||0)).toLocaleString('en-US');
  window.addPriceWatch=e=>{
    e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')||'').trim(),price=num(f.get('price')),target=num(f.get('target'));
    if(!title||price<=0||target<=0)return;
    bucket('priceWatch').push({id:'watch'+Date.now(),title:title.slice(0,110),type:String(f.get('type')||'Flight'),target,history:[{amount:price,date:new Date().toISOString()}]});
    modal=null;persist();
  };
  window.recordPrice=(e,id)=>{
    e.preventDefault();const watch=bucket('priceWatch').find(x=>x.id===id),price=num(new FormData(e.target).get('price'));
    if(!watch||price<=0)return;
    watch.history.push({amount:price,date:new Date().toISOString()});
    if(price<=watch.target)api.alert?.('Manually entered price reached your target: '+watch.title);
    persist();
  };
  window.removePriceWatch=id=>{const a=bucket('priceWatch'),i=a.findIndex(x=>x.id===id);if(i>=0){a.splice(i,1);persist()}};
  const oldHtml=modalHTML;
  modalHTML=function(){
    if(modal==='addexpense'){
      const people=members();
      return sheet('Add and split an expense',`<form onsubmit="saveNewTripExpense(event)">
        <div class="field"><label>Expense</label><input name="title" required maxlength="120" placeholder="Hotel, dinner, tickets…"></div>
        <div class="two-fields"><div class="field"><label>Total USD</label><input name="total" type="number" min="0.01" step="0.01" required></div><div class="field"><label>Category</label><select name="category">${['Accommodation','Flights','Transportation','Meals','Activities','Other'].map(x=>`<option>${x}</option>`).join('')}</select></div></div>
        <div class="field"><label>Paid by</label><select name="payer">${people.map(x=>`<option value="${esc(x)}" ${x===me()?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
        <div class="field"><label>Split method</label><select name="method" onchange="document.getElementById('customshares').hidden=this.value!=='custom'"><option value="equal">Equally among all travelers</option><option value="custom">Custom amounts</option></select></div>
        <div id="customshares" hidden><p class="small-note">Custom amounts must add up to the expense total.</p>${people.map((x,i)=>`<div class="field"><label>${esc(x)} (USD)</label><input name="part${i}" type="number" step="0.01" min="0" value="0"></div>`).join('')}</div>
        <div class="field"><label>Receipt URL (optional)</label><input name="receipt" placeholder="https://…" type="url"></div><div class="field"><label>Notes</label><textarea name="notes" maxlength="500"></textarea></div>
        <div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Save split</button></div></form>`);
    }
    if(modal==='vault')return sheet('Save a booking',`<form onsubmit="saveVaultBooking(event)"><div class="field"><label>Booking type</label><select name="type">${['Flight','Hotel','Train','Experience','Restaurant','Other'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>Title</label><input name="title" maxlength="120" required placeholder="Tokyo hotel"></div><div class="field"><label>Date</label><input name="when" type="date"></div><div class="field"><label>Status</label><select name="status"><option>Planning</option><option>Reserved</option><option>Paid</option><option>Cancelled</option></select></div><div class="field"><label>Non-sensitive reference (optional)</label><input name="confirmation" maxlength="80"></div><div class="field"><label>Booking link</label><input name="link" type="url" placeholder="https://…"></div><div class="field"><label>Notes</label><textarea name="notes" maxlength="600"></textarea></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Save booking</button></div></form>`);
    if(modal==='transport')return sheet('Add flight or train',`<form onsubmit="saveTransport(event)"><div class="field"><label>Mode</label><select name="mode"><option>Flight</option><option>Train</option></select></div><div class="field"><label>Flight / train number</label><input name="number" maxlength="30" placeholder="DL 123"></div><div class="two-fields"><div class="field"><label>From</label><input name="from" required></div><div class="field"><label>To</label><input name="to" required></div></div><div class="two-fields"><div class="field"><label>Date</label><input name="date" type="date"></div><div class="field"><label>Departure</label><input name="time" type="time"></div></div><div class="field"><label>Terminal / platform (manual)</label><input name="terminal"></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Save</button></div></form>`);
    if(modal==='pricewatch')return sheet('Watch a price',`<form onsubmit="addPriceWatch(event)"><div class="field"><label>Type</label><select name="type"><option>Flight</option><option>Hotel</option></select></div><div class="field"><label>Route, hotel or booking</label><input name="title" required maxlength="110" placeholder="JFK → Tokyo round trip"></div><div class="two-fields"><div class="field"><label>Price seen (USD)</label><input name="price" type="number" min="0.01" step="0.01" required></div><div class="field"><label>Target price (USD)</label><input name="target" type="number" min="0.01" step="0.01" required></div></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn blue">Start watch</button></div></form>`);
    return oldHtml();
  };
  home=function(){
    return oldHome().replace('</main>',`<div class="feature-grid">
    <button class="feature-tile" onclick="tab='expenses';render()"><span>💸</span><b>Split expenses</b><small>Settle up as a group</small></button>
    <button class="feature-tile" onclick="tab='vault';render()"><span>🗂️</span><b>Booking vault</b><small>Keep trip details together</small></button>
    <button class="feature-tile" onclick="tab='prices';render()"><span>📉</span><b>Price watch</b><small>Track manually entered quotes</small></button>
    <button class="feature-tile" onclick="tab='transport';render()"><span>🛫</span><b>Flight & trains</b><small>Travel day details</small></button>
    </div></main>`);
  };
  render=function(){
    const pages={expenses:expensePage,vault,transport:flightPage,prices};
    if(pages[tab]){api.renderPage(pages[tab]());return}
    oldRender();
  };
  save();render();
})();

/* END phase4-finance.js */


/* BEGIN phase4-personal.js */
(function(){
const prev=render,prevHome=home,prevModal=modalHTML,api=window.roavelyNext;
const who=()=>s.profile?.name||'Andy';
const bag=k=>{s.extras=s.extras||{};s.extras[k]=s.extras[k]||{};return s.extras[k][who()]||(s.extras[k][who()]=[])};
window.wishAdd=e=>{e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')||'').trim().slice(0,150);if(title){bag('wishes').push({id:'w'+Date.now(),title,place:String(f.get('place')||'').slice(0,90),done:false});modal=null;persist()}};
window.wishToggle=id=>{const w=bag('wishes').find(x=>x.id===id);if(w){w.done=!w.done;persist()}};
window.wishPitch=id=>{const w=bag('wishes').find(x=>x.id===id);if(!w)return;(s.ideas[s.current]??=[]).unshift({id:'wishidea'+Date.now(),emoji:'🌎',title:w.title,city:w.place||'TBD',cost:0,v:{[who()]:'yes'},comments:[],suggestedBy:who()});tab='plan';persist()};
function wishlist(){const a=bag('wishes');return '<main class="content"><div class="page-heading"><h2>Your bucket list</h2><p>Dream trips and experiences you want to make real.</p></div><button class="btn blue" onclick="openModal(\'wish\')">+ Dream</button>'+a.map(x=>'<div class="card"><div class="row"><div><b>'+(x.done?'✅':'🌎')+' '+esc(x.title)+'</b><div class="sub">'+esc(x.place)+'</div></div><button class="btn secondary" onclick="wishToggle(\''+x.id+'\')">'+(x.done?'Undo':'Done')+'</button></div><button class="text-button" onclick="wishPitch(\''+x.id+'\')">Suggest to group →</button></div>').join('')+'</main>'}
window.stampAdd=e=>{e.preventDefault();const f=new FormData(e.target),country=String(f.get('country')||'').trim().slice(0,90);if(country){bag('stamps').unshift({id:'stamp'+Date.now(),country,city:String(f.get('city')||'').slice(0,90),date:String(f.get('date')||''),notes:String(f.get('notes')||'').slice(0,500)});modal=null;persist()}};
function passport(){const a=bag('stamps'),distinct=new Set(a.map(x=>x.country.toLowerCase())).size;return '<main class="content"><div class="page-heading"><h2>Travel passport</h2><p>A record of the places you actually visited.</p></div><div class="passport-hero"><div><b>'+distinct+'</b><span>places</span></div><div><b>'+a.length+'</b><span>stamps</span></div></div><button class="btn blue" onclick="openModal(\'stamp\')">+ Stamp</button>'+a.map(x=>'<div class="card"><b>🌏 '+esc(x.country)+'</b><div class="sub">'+esc(x.city)+' · '+esc(x.date)+'</div><p class="small-note">'+esc(x.notes)+'</p></div>').join('')+'<button class="btn secondary full-width" onclick="tab=\'memories\';render()">📷 Memory album</button></main>'}
modalHTML=function(){if(modal==='wish')return sheet('Add a dream','<form onsubmit="wishAdd(event)"><div class="field"><label>Place or adventure</label><input name="title" required maxlength="150"></div><div class="field"><label>Where?</label><input name="place" maxlength="90"></div><button class="btn blue">Save</button></form>');if(modal==='stamp')return sheet('Travel stamp','<form onsubmit="stampAdd(event)"><div class="field"><label>Country or place</label><input name="country" required maxlength="90"></div><div class="field"><label>City</label><input name="city" maxlength="90"></div><div class="field"><label>Date</label><input name="date" type="date"></div><div class="field"><label>Best memory</label><textarea name="notes" maxlength="500"></textarea></div><button class="btn blue">Save stamp</button></form>');return prevModal()};
home=function(){return prevHome().replace('</main>','<div class="feature-grid"><button class="feature-tile" onclick="tab=\'wishlist\';render()"><span>🌎</span><b>Bucket list</b><small>Dream bigger</small></button><button class="feature-tile" onclick="tab=\'passport\';render()"><span>🛂</span><b>Travel passport</b><small>Places visited</small></button></div></main>')};
render=function(){if(tab==='wishlist'||tab==='passport'){api.renderPage(tab==='wishlist'?wishlist():passport());return}prev()};save();render();
})();
/* END phase4-personal.js */


/* BEGIN phase4-packing.js */
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

/* END phase4-packing.js */


/* BEGIN phase4-location.js */
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

/* END phase4-location.js */


/* BEGIN phase4-memories.js */
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

/* END phase4-memories.js */


/* BEGIN cloud-core.js */
(function buildCloudCore(){
  const SUPABASE_URL='https://nnpydavlkfzbpwetyclf.supabase.co';
  const KEY='sb_publishable_KhQWXpXZkGpifkSYiFspaQ_Ja6V1Nec';
  const BASE=location.origin+location.pathname;
  const BACKUP='roavely-local-snapshot-v1';
  const isUuid=x=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x||'');
  const escapeHtml=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clientInfo={client:null,user:null,profile:null,online:false,loading:true,trips:[],activeId:null,drawer:false,signup:false,message:'',error:'',pendingInvite:null,channel:null,busy:false,booted:false,access:null,queue:[],signupEmail:'',recovering:false,recoveryStep:'request',recoveryEmail:''};
  window.roavelyCloud=clientInfo;
  const cloud=clientInfo;
  const active=()=>!!cloud.user&&cloud.access?.status==='approved'&&cloud.access?.accepted_terms_version==='2026-10'&&isUuid(s.current)&&cloud.trips.some(t=>t.id===s.current);
  cloud.isActive=active;
  cloud.current=()=>active()?s.current:null;
  cloud.alert=(msg,isErr=false)=>{
    cloud.message=isErr?'':msg;
    cloud.error=isErr?msg:'';
    const n=document.getElementById('cloud-feedback');if(n){n.textContent=msg;n.className=isErr?'cloud-error':'cloud-success'}
  };
  const oldTop=roavelyHeader;
  roavelyHeader=function(){
    const label=cloud.loading?'Connecting…':cloud.user?((cloud.access?.status!=='approved'||cloud.access?.accepted_terms_version!=='2026-10')?'⏳ Finish setup':active()?'☁ Live trip':'☁ Choose trip'):'☁ Sign in';
    return oldTop()+`<div class="cloud-toolbar"><span class="cloud-state">${escapeHtml(active()?'Shared online trip':cloud.user&&(cloud.access?.status!=='approved'||cloud.access?.accepted_terms_version!=='2026-10')?'Account setup incomplete':'Local preview · not synced')}</span><div class="cloud-controls"><button type="button" onclick="cloudOpen()">${escapeHtml(label)}</button>${active()?'<button type="button" onclick="cloudRefresh()">⟳</button>':''}</div></div>`;
  };
  window.cloudOpen=()=>{cloud.drawer=true;renderPanel()};
  window.cloudClose=()=>{cloud.drawer=false;document.getElementById('cloud-panel')?.remove()};
  function fieldLabel(label,input){return `<label class="cloud-field"><span>${label}</span>${input}</label>`}
  function pendingPanelHTML(){
  const state=cloud.access?.status||'pending',accepted=cloud.access?.accepted_terms_version==='2026-10';
  const heading=state==='rejected'?'Application declined':state==='suspended'?'Account suspended':state==='approved'&&!accepted?'Complete setup: accept the Terms':'Waiting for administrator approval';
  return `<div class="cloud-account"><b>${escapeHtml(cloud.profile?.display_name||cloud.user.email)}</b><small>${escapeHtml(cloud.user.email)}</small></div>
  <div class="cloud-pending"><b>${escapeHtml(heading)}</b><p>${state==='approved'&&!accepted?'Your email is verified and your role is ready. Review and accept the current Terms & Conditions below to activate access.':'Email verification is separate from administrator approval. Your account cannot join or create real trips until approved.'}</p>
  ${accepted?'<p class="cloud-success">✓ Terms & Conditions accepted</p>':`<form onsubmit="cloudAcceptTerms(event)"><label class="cloud-terms"><input type="checkbox" name="agrees" value="on" required> <span>I accept the <a href="./terms.html" target="_blank" rel="noopener noreferrer">Terms & Conditions</a> (2026-10).</span></label><button class="btn blue full-width">Accept the Terms</button></form>`}
  <button type="button" class="btn secondary full-width" onclick="cloudRefresh()">Check approval status</button></div>
  <button type="button" class="cloud-logout" onclick="cloudSignOut()">Sign out</button>`;
}
  function adminQueueHtml(){
 const queue=cloud.queue||[];
 return `<div class="cloud-card"><b>🛡️ Administrator — Membership applications</b><p class="cloud-muted">Only members who confirmed their email and accepted the current terms can be approved.</p>
 <button type="button" class="btn secondary full-width" onclick="cloudReloadApprovals()">Refresh applications</button>
 ${queue.map(r=>`<div class="cloud-review"><b>${escapeHtml(r.contact_email)}</b><small>${escapeHtml(r.status)} · ${r.email_verified?'Email verified':'Email unverified'} · ${r.accepted_terms_version==='2026-10'?'Terms accepted':'Terms not accepted'}</small>
 <div class="cloud-review-actions"><button class="btn blue" ${!r.email_verified||r.accepted_terms_version!=='2026-10'?'disabled':''} onclick="cloudReviewAccount('${r.user_id}','approved')">Approve</button><button class="btn secondary" onclick="cloudReviewAccount('${r.user_id}','rejected')">Decline</button>${r.status==='approved'?`<button class="btn secondary" onclick="cloudReviewAccount('${r.user_id}','suspended')">Suspend</button>`:''}</div></div>`).join('')||'<p class="cloud-muted">No applications found.</p>'}</div>`;
}
  function recoveryPanel(){
  if(cloud.recoveryStep==='new'&&cloud.user){
    return `<div class="cloud-account"><b>Choose a new password</b><small>${escapeHtml(cloud.user.email||'Roavely account')}</small></div>
      <p class="cloud-muted">Your password-reset link signed you in securely. Set a new password below; your trips and administrator role are preserved.</p>
      <form onsubmit="cloudUpdatePassword(event)">
        ${fieldLabel('New password','<input name="password" type="password" autocomplete="new-password" minlength="12" required>')}
        ${fieldLabel('Confirm new password','<input name="confirm_password" type="password" autocomplete="new-password" minlength="12" required>')}
        <button class="btn blue full-width" ${cloud.busy?'disabled':''}>Save new password</button>
      </form>`;
  }
  return `<div class="cloud-account"><b>Reset your password</b></div>
    <p class="cloud-muted">Use the email address you registered with. This resets the password on your existing account without affecting its access or administrator role.</p>
    <form onsubmit="cloudSendReset(event)">
      ${fieldLabel('Registered email',`<input type="email" name="email" autocomplete="email" required value="${escapeHtml(cloud.recoveryEmail||cloud.signupEmail||'')}">`)}
      <button class="btn blue full-width" ${cloud.busy?'disabled':''}>Send password-reset email</button>
    </form>
    <button class="btn secondary full-width" style="margin-top:12px" onclick="cloudCancelRecovery()">Back to sign in</button>
    <p class="cloud-muted">If the email sends you to localhost, the administrator must update Supabase's Site URL and Redirect URLs.</p>`;
}
  function panelBody(){
    if(cloud.loading)return `<div class="cloud-wait">Connecting to the Roavely database…</div>`;
    if(!cloud.client)return `<p class="cloud-error">${escapeHtml(cloud.error||'Cloud services failed to load. Check your connection and reload.')}</p>`;
    if(cloud.recovering)return recoveryPanel();
    if(!cloud.user)return `<p class="cloud-muted">Create a free Roavely account to save real trips, invite friends and sync plans between phones. The existing demo stays on this device.</p>
      <div class="cloud-segments"><button onclick="cloudSetSignUp(false)" class="${cloud.signup?'':'selected'}">Log in</button><button onclick="cloudSetSignUp(true)" class="${cloud.signup?'selected':''}">Create account</button></div>
      <form onsubmit="cloudLogin(event)">
       ${fieldLabel('Email','<input type="email" name="email" autocomplete="email" required>')}
       ${fieldLabel('Password','<input type="password" name="password" autocomplete="'+(cloud.signup?'new-password':'current-password')+'" minlength="8" required>')}
       ${cloud.signup?'<label class="cloud-terms"><input type="checkbox" name="accept_terms" value="on" required><span>I agree to the <a href="./terms.html" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a> (2026-10).</span></label>':''}
       <button class="btn blue full-width" ${cloud.busy?'disabled':''}>${cloud.signup?'Create account':'Log in'}</button>
      </form>${!cloud.signup?'<button type="button" class="cloud-forgot" onclick="cloudForgotPassword()">Forgot password?</button>':''}<p class="cloud-muted">Registration requires email verification and administrator approval. Check your Gmail Inbox, Updates and Spam for the confirmation email.</p><form onsubmit="cloudResendSignup(event)">${fieldLabel('Resend the verification email','<input type="email" name="resend_email" required value="'+escapeHtml(cloud.signupEmail)+'" placeholder="Registered email">')}<button class="btn secondary full-width">Resend confirmation email</button></form>`;
    if(cloud.access?.status!=='approved'||cloud.access?.accepted_terms_version!=='2026-10')return pendingPanelHTML();
    const list=cloud.trips;
    return `<div class="cloud-account"><b>${escapeHtml(cloud.profile?.display_name||cloud.user.email||'Traveler')}</b><small>${escapeHtml(cloud.user.email)}</small></div>
    ${fieldLabel('Display name',`<form class="cloud-inline" onsubmit="cloudRename(event)"><input name="name" maxlength="80" required value="${escapeHtml(cloud.profile?.display_name||'Traveler')}"><button class="btn secondary">Save</button></form>`)}
    <div class="cloud-heading"><b>My shared trips</b><span>${list.length}</span></div>
    ${list.map(t=>`<button class="cloud-trip ${cloud.activeId===t.id?'active':''}" onclick="cloudPickTrip('${t.id}')"><span>✈️ ${escapeHtml(t.title)} <small>${escapeHtml(t.destination||'Destination TBD')}</small></span><span>${cloud.activeId===t.id?'✓':''}</span></button>`).join('')||'<p class="cloud-muted">No shared trips yet. Create one or join a friend’s trip below.</p>'}
    <div class="cloud-card"><b>Start a shared trip</b><form onsubmit="cloudCreateTrip(event)">
      ${fieldLabel('Trip name','<input name="title" maxlength="180" placeholder="Japan 2027" required>')}
      ${fieldLabel('Destination','<input name="destination" maxlength="120" placeholder="Japan">')}
      <div class="cloud-pair">${fieldLabel('Start','<input type="date" name="starts_on">')}${fieldLabel('End','<input type="date" name="ends_on">')}</div>
      <button class="btn blue full-width">Create live trip</button></form></div>
    <div class="cloud-card"><b>Join friends</b><form onsubmit="cloudJoinTrip(event)">${fieldLabel('Invitation link or code',`<input name="token" required value="${escapeHtml(cloud.pendingInvite||'')}" placeholder="Paste a Roavely invitation">`)}<button class="btn secondary full-width">Join trip</button></form></div>
    ${active()?`<div class="cloud-card"><b>Invite your group</b><p class="cloud-muted">Owners can make a 7-day invite link with up to 20 uses.</p><button class="btn blue full-width" onclick="cloudGenerateInvite()">Create invitation link</button><div id="cloud-invite"></div></div>`:''}
    ${cloud.access?.role==='admin'?adminQueueHtml():''}
    <button class="cloud-logout" onclick="cloudSignOut()">Sign out</button>`;
  }
  function renderPanel(){
    const old=document.getElementById('cloud-panel');
    if(!cloud.drawer){old?.remove();return}
    const div=old||document.createElement('div');div.id='cloud-panel';div.className='cloud-panel';
    div.innerHTML=`<div class="cloud-overlay" onclick="cloudClose()"></div><section class="cloud-sheet" role="dialog" aria-modal="true" aria-label="Roavely account"><header><div><b>☁️ Roavely Cloud</b><small>Private accounts and shared trips</small></div><button onclick="cloudClose()" aria-label="Close account">✕</button></header><div class="cloud-content"><div id="cloud-feedback" class="${cloud.error?'cloud-error':'cloud-success'}">${escapeHtml(cloud.error||cloud.message)}</div>${panelBody()}</div></section>`;
    if(!old)document.body.appendChild(div);
  }
  cloud.renderPanel=renderPanel;
  window.cloudSetSignUp=x=>{cloud.signup=x;cloud.error='';cloud.message='';renderPanel()};
  function fail(error){const msg=error?.message||String(error);cloud.alert(msg,true);renderPanel();return false}
  async function signAction(e){
    e.preventDefault();if(!cloud.client)return fail(Error('The cloud connection is not ready'));
    const f=new FormData(e.target),email=String(f.get('email')||'').trim(),password=String(f.get('password')||'');
    if(password.length<8)return fail(Error('Use a password with at least 8 characters'));
    if(cloud.signup&&f.get('accept_terms')!=='on')return fail(Error('You must accept the Terms & Conditions'));
    if(cloud.signup)cloud.signupEmail=email;
    cloud.busy=true;renderPanel();
    try{
      const response=cloud.signup?await cloud.client.auth.signUp({email,password,options:{emailRedirectTo:BASE,data:{accepted_terms_version:'2026-10'}}}):await cloud.client.auth.signInWithPassword({email,password});
      if(response.error)throw response.error;
      if(!response.data.session){cloud.busy=false;cloud.message='Registration received. Confirm the email in your Inbox or Updates, then sign in; a separate administrator approval is required.';cloud.signup=false;renderPanel();return}
      await onSession(response.data.session);
      cloud.message='Signed in';renderPanel();
    }catch(error){if(!cloud.signup&&String(error?.message||'').toLowerCase().includes('invalid login credentials')){cloud.recoveryEmail=email;cloud.error='The password was not accepted. Use Forgot password? to reset it.';renderPanel()}else fail(error)}finally{cloud.busy=false;renderPanel()}
  }
  window.cloudLogin=signAction;
  window.cloudRefresh=async()=>{if(!cloud.user)return;await onSession({user:cloud.user});cloud.message='Status refreshed';renderPanel()};
  function demoBackup(){
    try{if(!localStorage.getItem(BACKUP)){localStorage.setItem(BACKUP,JSON.stringify(s))}}catch{}
  }
  function restoreDemo(){
    try{const x=localStorage.getItem(BACKUP);if(x){s=JSON.parse(x);save();return}}catch{}
    s=structuredClone(seed);s.profile={name:'Traveler',airport:'',interests:[],pace:'Balanced',style:'Mid-range'};save();
  }
  async function onSession(session){
    if(!session){if(cloud.user){cloud.user=null;cloud.profile=null;cloud.access=null;cloud.queue=[];cloud.trips=[];cloud.activeId=null;await unsubscribe();restoreDemo();render()}cloud.loading=false;renderPanel();render();return}
    cloud.user=session.user;
    demoBackup();
    try{
      const {data:existing,error:err}=await cloud.client.from('profiles').select('*').eq('id',cloud.user.id).maybeSingle();
      if(err)throw err;
      if(!existing){
        const display=String(cloud.user.email||'Traveler').split('@')[0].slice(0,60)||'Traveler';
        const {data:newProfile,error:pErr}=await cloud.client.from('profiles').insert({id:cloud.user.id,display_name:display}).select().single();
        if(pErr)throw pErr;cloud.profile=newProfile;
      }else cloud.profile=existing;
      const state=await cloud.client.from('account_access').select('*').eq('user_id',cloud.user.id).maybeSingle();
      if(state.error)throw state.error;
      cloud.access=state.data;
      if(cloud.access?.status==='approved'&&cloud.access?.accepted_terms_version==='2026-10'){await loadTrips();if(cloud.access.role==='admin')await loadAdminQueue();}
      else{cloud.trips=[];cloud.activeId=null;cloud.drawer=true;cloud.message=cloud.access?.status==='approved'?'Please accept the Terms & Conditions to activate your account.':'Your account is awaiting administrator approval.';}
      cloud.online=true;
      cloud.error='';
    }catch(error){cloud.error=error.message||String(error)}
    cloud.loading=false;renderPanel();render();
  }
  cloud.onSession=onSession;
  async function unsubscribe(){if(cloud.channel&&cloud.client){await cloud.client.removeChannel(cloud.channel);cloud.channel=null}}
  async function subscribe(){
    await unsubscribe();
    if(!active())return;
    const id=s.current;
    const ch=cloud.client.channel('roavely-'+id);
    for(const table of ['trip_chat','suggestions','suggestion_votes','suggestion_comments','date_options','date_votes','itinerary_days','itinerary_activities']){
      ch.on('postgres_changes',{event:'*',schema:'public',table,filter:'trip_id=eq.'+id},()=>{scheduleUpdate()});
    }
    cloud.channel=ch.subscribe();
  }
  let refreshTimer=null;
  function scheduleUpdate(){
    if(refreshTimer)clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>{void loadSelected()},450);
  }
  cloud.scheduleUpdate=scheduleUpdate;
  function mapTrip(t){
    return {id:t.id,name:t.title,destination:t.destination||'TBD',emoji:'✈️',start:t.starts_on||'',end:t.ends_on||'',budget:Number(t.budget_per_person)||0,route:[t.destination||'TBD'],invite:'Use Cloud to share'};
  }
  function seededCollections(id){
    for(const k of ['ideas','decisions','check','expenses','itinerary','reservations']){s[k]=s[k]||{};s[k][id]=s[k][id]||[]}
  }
  const check=(result,name)=>{if(result.error)throw new Error(name+': '+result.error.message);return result.data||[]};
  async function loadTrips(selected){
    if(!cloud.user||cloud.access?.status!=='approved'||!cloud.access?.accepted_terms_version==='2026-10')return;
    const list=check(await cloud.client.from('trips').select('id,owner_id,title,destination,starts_on,ends_on,budget_per_person').order('created_at',{ascending:false}),'Trips');
    cloud.trips=list;
    if(!list.length){cloud.activeId=null;return}
    const id=(selected&&list.some(t=>t.id===selected)?selected:cloud.activeId&&list.some(t=>t.id===cloud.activeId)?cloud.activeId:list[0].id);
    cloud.activeId=id;
    s.trips=list.map(mapTrip);
    s.current=id;
    for(const t of list)seededCollections(t.id);
    await loadSelected();
  }
  cloud.loadTrips=loadTrips;
  async function loadSelected(){
    if(!active())return;
    const id=s.current;
    try{
      const [membersRes,ideasRes,votesRes,commentsRes,chatRes,dateRes,dateVotesRes,daysRes,actsRes]=await Promise.all([
        cloud.client.from('trip_members').select('user_id,role').eq('trip_id',id),
        cloud.client.from('suggestions').select('*').eq('trip_id',id).order('created_at',{ascending:false}),
        cloud.client.from('suggestion_votes').select('*').eq('trip_id',id),
        cloud.client.from('suggestion_comments').select('*').eq('trip_id',id).order('created_at',{ascending:true}),
        cloud.client.from('trip_chat').select('*').eq('trip_id',id).order('created_at',{ascending:true}),
        cloud.client.from('date_options').select('*').eq('trip_id',id).order('created_at',{ascending:false}),
        cloud.client.from('date_votes').select('*').eq('trip_id',id),
        cloud.client.from('itinerary_days').select('*').eq('trip_id',id).order('order_index',{ascending:true}),
        cloud.client.from('itinerary_activities').select('*').eq('trip_id',id).order('order_index',{ascending:true})
      ]);
      if(id!==s.current)return;
      const members=check(membersRes,'Members'),rawIdeas=check(ideasRes,'Suggestions'),votes=check(votesRes,'Votes'),comments=check(commentsRes,'Comments'),chat=check(chatRes,'Chat'),dates=check(dateRes,'Dates'),dateVotes=check(dateVotesRes,'Availability'),days=check(daysRes,'Itinerary'),acts=check(actsRes,'Activities');
      const ids=members.map(x=>x.user_id);
      const profiles=ids.length?check(await cloud.client.from('profiles').select('id,display_name').in('id',ids),'Profiles'):[];
      const count={};
      const names={};
      for(const p of profiles){const label=p.display_name||'Traveler';count[label]=(count[label]||0)+1}
      for(const p of profiles){const label=p.display_name||'Traveler';names[p.id]=count[label]>1?label+' ('+p.id.slice(0,4)+')':label}
      // UI vote keys are display labels; authenticated identity is always the user ID in Supabase.
      const myDisplay=names[cloud.user.id]||cloud.profile?.display_name||'Traveler';
      s.profile=s.profile||{};
      s.profile.name=myDisplay;
      s.profile.airport=cloud.profile?.home_airport||'';
      s.profile.interests=cloud.profile?.interests||[];
      s.profile.pace=cloud.profile?.travel_pace||'Balanced';
      s.profile.style=cloud.profile?.travel_style||'Mid-range';
      s.people[id]=members.map(m=>names[m.user_id]||'Traveler ('+m.user_id.slice(0,4)+')');
      s.ideas[id]=rawIdeas.map(x=>({
        id:x.id,emoji:'📍',title:x.title,city:x.place||'TBD',cost:Number(x.estimated_cost)||0,
        detail:x.details||'',kind:x.category||'activity',suggestedBy:names[x.created_by]||'Traveler',
        v:Object.fromEntries(votes.filter(v=>v.suggestion_id===x.id).map(v=>[names[v.user_id]||v.user_id.slice(0,4),v.vote])),
        comments:comments.filter(c=>c.suggestion_id===x.id).map(c=>({id:c.id,author:names[c.author_id]||'Traveler',text:c.body,created:c.created_at}))
      }));
      s.extras=s.extras||{};s.extras.messages=s.extras.messages||{};
      s.extras.messages[id]=chat.map(c=>({id:c.id,by:names[c.author_id]||'Traveler',message:c.body,when:c.created_at}));
      s.extras.dates=s.extras.dates||{};
      s.extras.dates[id]=dates.map(d=>({id:d.id,from:d.starts_on,to:d.ends_on,by:names[d.created_by]||'Traveler',votes:Object.fromEntries(dateVotes.filter(v=>v.option_id===d.id).map(v=>[names[v.user_id]||v.user_id.slice(0,4),v.response]))}));
      s.itinerary[id]=days.map((d,di)=>({cloudId:d.id,day:d.title||'Day '+(di+1),date:d.day_on||'',
        items:acts.filter(a=>a.day_id===d.id).map(a=>[a.starts_at?a.starts_at.slice(0,5):'Anytime',a.title,'📍',Number(a.estimated_cost)||0,a.id])}));
      save();render();
    }catch(error){cloud.alert('Sync: '+(error.message||error),true);renderPanel()}
    if(cloud.activeId!==id){cloud.activeId=id}
    await subscribe();
  }
  cloud.loadSelected=loadSelected;
  const oldSwitch=switchTrip;
  switchTrip=function(id){if(cloud.user&&cloud.trips.some(t=>t.id===id)){cloud.activeId=id;s.current=id;void loadSelected();save();render()}else oldSwitch(id)};
  window.cloudPickTrip=id=>{switchTrip(id);renderPanel()};
  window.cloudCreateTrip=async e=>{
    e.preventDefault();if(!cloud.user)return;
    const f=new FormData(e.target),title=String(f.get('title')||'').trim(),destination=String(f.get('destination')||'').trim();
    const starts=String(f.get('starts_on')||''),ends=String(f.get('ends_on')||'');
    if(!title)return;
    if(starts&&ends&&ends<starts)return cloud.alert('End date cannot come before start',true);
    try{
      const row={owner_id:cloud.user.id,title:title.slice(0,180),destination:destination.slice(0,120),starts_on:starts||null,ends_on:ends||null};
      const {data,error}=await cloud.client.from('trips').insert(row).select('id').single();
      if(error)throw error;
      await loadTrips(data.id);
      cloud.alert('Shared trip created');renderPanel();render();
    }catch(error){fail(error)}
  };
  window.cloudJoinTrip=async e=>{
    e.preventDefault();if(!cloud.user)return;
    let token=String(new FormData(e.target).get('token')||'').trim();
    try{if(token.startsWith('http'))token=new URL(token).searchParams.get('invite')||''}catch{}
    if(!/^[a-f0-9]{64}$/.test(token)){cloud.alert('Use a valid Roavely invite link or code',true);renderPanel();return}
    try{
      const {data,error}=await cloud.client.rpc('redeem_trip_invite',{p_token:token});
      if(error)throw error;
      cloud.pendingInvite=null;
      sessionStorage.removeItem('roavely-invite-token');
      await loadTrips(data);cloud.alert('Joined shared trip!');renderPanel();render();
    }catch(error){fail(error)}
  };
  window.cloudGenerateInvite=async()=>{
    if(!active())return;
    const t=cloud.trips.find(t=>t.id===s.current);
    if(t?.owner_id!==cloud.user?.id){cloud.alert('Only the trip owner can invite members',true);renderPanel();return}
    try{
      const {data,error}=await cloud.client.rpc('create_trip_invite',{p_trip_id:s.current});
      if(error)throw error;
      const link=BASE+'?invite='+encodeURIComponent(data);
      const el=document.getElementById('cloud-invite');
      if(el)el.innerHTML=`<div class="cloud-invite"><input readonly id="cloud-invite-link" value="${escapeHtml(link)}" aria-label="Share invitation link"><button class="btn secondary" onclick="cloudCopyInvite()">Copy link</button></div>`;
      cloud.message='Private invite link generated; valid for 7 days (20 uses).';const note=document.getElementById('cloud-feedback');if(note)note.textContent=cloud.message;
    }catch(error){fail(error)}
  };
  window.cloudCopyInvite=async()=>{
    const t=document.getElementById('cloud-invite-link');
    if(!t)return;
    try{await navigator.clipboard.writeText(t.value);cloud.alert('Invite link copied')}catch{t.select();cloud.alert('Select and copy the link above')}
  };
  window.cloudRename=async e=>{
    e.preventDefault();if(!cloud.user)return;
    const f=new FormData(e.target),display=String(f.get('name')||'').trim().slice(0,80);
    if(!display)return;
    try{
      const {data,error}=await cloud.client.from('profiles').update({display_name:display,updated_at:new Date().toISOString()}).eq('id',cloud.user.id).select().single();
      if(error)throw error;cloud.profile=data;await loadSelected();renderPanel();cloud.alert('Profile updated');
    }catch(error){fail(error)}
  };
  window.cloudSignOut=async()=>{
    if(!cloud.client)return;
    const {error}=await cloud.client.auth.signOut();if(error){fail(error);return}
    await unsubscribe();cloud.user=null;cloud.profile=null;cloud.trips=[];cloud.activeId=null;cloud.message='Signed out';restoreDemo();render();renderPanel();
  };
  function readInvite(){
    let token=null;
    try{token=new URLSearchParams(location.search).get('invite');if(token&&/^[a-f0-9]{64}$/.test(token)){sessionStorage.setItem('roavely-invite-token',token);history.replaceState({},'',BASE)}}catch{}
    try{cloud.pendingInvite=token&&/^[a-f0-9]{64}$/.test(token)?token:sessionStorage.getItem('roavely-invite-token')}catch{}
  }
  async function loadAdminQueue(){
 if(cloud.access?.role!=='admin'||cloud.access?.status!=='approved'||!cloud.access?.accepted_terms_version==='2026-10')return;
 const {data,error}=await cloud.client.rpc('list_roavely_access');
 if(error)throw error;
 cloud.queue=(data||[]).filter(x=>x.status==='pending'||x.status==='approved');
}
  window.cloudReloadApprovals=async()=>{try{await loadAdminQueue();renderPanel()}catch(error){fail(error)}};
  window.cloudResendSignup=async function cloudResendSignup(e){
 e.preventDefault();const email=String(new FormData(e.target).get('resend_email')||'').trim();
 if(!email||!cloud.client)return;
 try{
   const {error}=await cloud.client.auth.resend({type:'signup',email,options:{emailRedirectTo:BASE}});
   if(error)throw error;
   cloud.signupEmail=email;
   cloud.alert('A confirmation email was requested. Check your Inbox, Updates and Spam. Delivery is subject to email service limits.');
   renderPanel();
 }catch(error){fail(error)}
};
  window.cloudAcceptTerms=async function cloudAcceptTerms(e){
 e.preventDefault();if(new FormData(e.target).get('agrees')!=='on')return;
 try{
   const {error}=await cloud.client.rpc('accept_roavely_terms',{p_version:'2026-10'});
   if(error)throw error;
   await onSession({user:cloud.user});
   cloud.alert('Terms accepted. An administrator must approve your account before trip access.');
   renderPanel();
 }catch(error){fail(error)}
};
  window.cloudReviewAccount=async function cloudReviewAccount(id,action){
 if(cloud.access?.role!=='admin'||!['approved','rejected','suspended'].includes(action))return;
 if(!confirm('Confirm '+action+' for this traveler?'))return;
 try{
   const {error}=await cloud.client.rpc('admin_review_account',{p_user:id,p_action:action});
   if(error)throw error;
   await loadAdminQueue();
   cloud.alert('Account updated: '+action);
   renderPanel();
 }catch(error){fail(error)}
};
  window.cloudForgotPassword=()=>{cloud.recovering=true;cloud.recoveryStep='request';cloud.error='';cloud.drawer=true;renderPanel()};
  window.cloudCancelRecovery=()=>{cloud.recovering=false;cloud.error='';cloud.message='';renderPanel()};
  window.cloudSendReset=async e=>{
    e.preventDefault();
    const email=String(new FormData(e.target).get('email')||'').trim();
    if(!cloud.client||!email)return;
    cloud.busy=true;cloud.recoveryEmail=email;renderPanel();
    try{
      const result=await cloud.client.auth.resetPasswordForEmail(email,{redirectTo:BASE});
      if(result.error)throw result.error;
      cloud.recovering=false;cloud.signup=false;cloud.error='';
      cloud.message='If this address has a Roavely account, a reset email was requested. Check your inbox and Updates folder.';
    }catch(error){cloud.error=String(error?.message||error)}
    finally{cloud.busy=false;renderPanel()}
  };
  window.cloudUpdatePassword=async e=>{
    e.preventDefault();
    if(!cloud.user)return fail(Error('Open the reset link in your email first'));
    const f=new FormData(e.target);
    const next=String(f.get('password')||'');
    if(next.length<12)return fail(Error('Use 12 or more characters'));
    if(next!==String(f.get('confirm_password')||''))return fail(Error('Passwords do not match'));
    cloud.busy=true;renderPanel();
    try{
      const result=await cloud.client.auth.updateUser({password:next});
      if(result.error)throw result.error;
      cloud.recovering=false;cloud.recoveryStep='request';
      await onSession({user:cloud.user});
      cloud.message='Password updated. Your account and administrator access are unchanged.';
      try{history.replaceState({},'',BASE)}catch{}
    }catch(error){cloud.error=String(error?.message||error)}
    finally{cloud.busy=false;renderPanel()}
  };
  async function boot(){
    readInvite();
    try{const hash=new URLSearchParams(location.hash.replace(/^#/,''));if(hash.get('type')==='recovery'){cloud.recovering=true;cloud.recoveryStep='new';cloud.drawer=true}}
    catch{}
    try{
      const sdk=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm');
      cloud.client=sdk.createClient(SUPABASE_URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      const {data,error}=await cloud.client.auth.getSession();
      if(error)throw error;
      await onSession(data.session);
      cloud.client.auth.onAuthStateChange((event,session)=>{
        if(event==='INITIAL_SESSION')return;
        if(event==='PASSWORD_RECOVERY'){cloud.recovering=true;cloud.recoveryStep='new';cloud.drawer=true}
        setTimeout(()=>{void onSession(session);renderPanel()},0);
      });
    }catch(error){cloud.loading=false;cloud.error='Cloud sign-in unavailable: '+(error.message||error);render();renderPanel()}
  }
  void boot();
})();

/* END cloud-core.js */


/* BEGIN cloud-actions.js */
(function buildCloudActions(){
  const cloud=window.roavelyCloud;
  const isLive=()=>cloud?.isActive?.()===true;
  const client=()=>cloud.client;
  const uid=()=>cloud.user?.id;
  const fail=error=>{const message=error?.message||String(error);cloud.alert(message,true);toast('Cloud error: '+message.slice(0,85));cloud.renderPanel()};
  const checked=async(req)=>{const res=await req;if(res.error)throw res.error;return res.data};
  async function refresh(){await cloud.loadSelected();cloud.renderPanel()}
  function form(e){e.preventDefault();return new FormData(e.target)}
  const oldAddIdea=addIdea;
  addIdea=function(e){
    if(!isLive())return oldAddIdea(e);
    const f=form(e);const title=String(f.get('title')||'').trim().slice(0,200);
    if(!title)return;
    void(async()=>{try{
      await checked(client().from('suggestions').insert({
        trip_id:s.current,created_by:uid(),title,place:String(f.get('city')||'').slice(0,150),
        estimated_cost:Math.max(0,Number(f.get('cost'))||0),category:'activity'
      }));
      modal=null;await refresh();toast('Suggestion shared');
    }catch(error){fail(error)}})();
  };
  const oldIdeaVote=ideaVote;
  ideaVote=function(id,v){
    if(!isLive())return oldIdeaVote(id,v);
    void(async()=>{try{
      const {data:existing,error}=await client().from('suggestion_votes').select('vote').eq('suggestion_id',id).eq('user_id',uid()).maybeSingle();
      if(error)throw error;
      if(existing?.vote===v){
        await checked(client().from('suggestion_votes').delete().eq('suggestion_id',id).eq('user_id',uid()));
      }else{
        await checked(client().from('suggestion_votes').upsert({trip_id:s.current,suggestion_id:id,user_id:uid(),vote:v},{onConflict:'suggestion_id,user_id'}));
      }
      await refresh();
    }catch(error){fail(error)}})();
  };
  const oldComment=window.postIdeaComment;
  window.postIdeaComment=function(e,id){
    if(!isLive())return oldComment(e,id);
    const f=form(e),body=String(f.get('comment')||'').trim().slice(0,500);
    if(!body)return;
    void(async()=>{try{
      await checked(client().from('suggestion_comments').insert({trip_id:s.current,suggestion_id:id,author_id:uid(),body}));
      await refresh();toast('Comment shared');
    }catch(error){fail(error)}})();
  };
  const oldChat=window.addCrewMessage;
  window.addCrewMessage=function(e){
    if(!isLive())return oldChat(e);
    const f=form(e),body=String(f.get('message')||'').trim().slice(0,1000);
    if(!body)return;
    void(async()=>{try{
      await checked(client().from('trip_chat').insert({trip_id:s.current,author_id:uid(),body}));
      await refresh();toast('Message sent');
    }catch(error){fail(error)}})();
  };
  const oldDates=window.addCrewDates;
  window.addCrewDates=function(e){
    if(!isLive())return oldDates(e);
    const f=form(e),starts_on=String(f.get('from')||''),ends_on=String(f.get('to')||'');
    if(!starts_on||!ends_on||ends_on<starts_on){toast('Invalid travel dates');return}
    void(async()=>{try{
      await checked(client().from('date_options').insert({trip_id:s.current,created_by:uid(),starts_on,ends_on}));
      modal=null;await refresh();toast('Dates proposed');
    }catch(error){fail(error)}})();
  };
  const oldDateVote=window.voteCrewDates;
  window.voteCrewDates=function(id,response){
    if(!isLive())return oldDateVote(id,response);
    void(async()=>{try{
      const {data:prior,error}=await client().from('date_votes').select('response').eq('option_id',id).eq('user_id',uid()).maybeSingle();
      if(error)throw error;
      if(prior?.response===response){
        await checked(client().from('date_votes').delete().eq('option_id',id).eq('user_id',uid()));
      }else{
        await checked(client().from('date_votes').upsert({trip_id:s.current,option_id:id,user_id:uid(),response},{onConflict:'option_id,user_id'}));
      }
      await refresh();
    }catch(error){fail(error)}})();
  };
  const oldPickDate=window.pickCrewDates;
  window.pickCrewDates=function(id){
    if(!isLive())return oldPickDate(id);
    const date=(s.extras?.dates?.[s.current]||[]).find(x=>x.id===id);
    if(!date||!confirm('Change the trip dates for everyone?'))return;
    void(async()=>{try{
      const {data,error}=await client().from('trips').update({starts_on:date.from,ends_on:date.to}).eq('id',s.current).select('id').maybeSingle();
      if(error)throw error;
      if(!data){toast('Only the trip owner can change dates');return}
      await cloud.loadTrips(s.current);cloud.renderPanel();render();
    }catch(error){fail(error)}})();
  };
  const oldCreateDay=window.createDay;
  window.createDay=function(e){
    if(!isLive())return oldCreateDay(e);
    const f=form(e),arr=s.itinerary[s.current]||[];
    const title=String(f.get('label')||'').trim().slice(0,200);
    if(!title)return;
    void(async()=>{try{
      await checked(client().from('itinerary_days').insert({trip_id:s.current,title,day_on:String(f.get('date')||'')||null,order_index:arr.length}));
      modal=null;tab='itinerary';await refresh();toast('Day added to shared itinerary');
    }catch(error){fail(error)}})();
  };
  const oldCreateActivity=window.createActivity;
  window.createActivity=function(e){
    if(!isLive())return oldCreateActivity(e);
    const f=form(e),arr=s.itinerary[s.current]||[],title=String(f.get('title')||'').trim().slice(0,200);
    if(!title)return;
    void(async()=>{try{
      let d=arr[Math.max(0,Math.min(arr.length-1,Number(f.get('day'))||0))];
      if(!d){
        const {data,error}=await client().from('itinerary_days').insert({trip_id:s.current,title:'Day 1 · '+trip().destination,order_index:0}).select('id').single();
        if(error)throw error;d={cloudId:data.id,items:[]};
      }
      const tm=String(f.get('time')||'');
      const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(tm)?tm:null;
      await checked(client().from('itinerary_activities').insert({
        trip_id:s.current,day_id:d.cloudId,title,starts_at:time,
        estimated_cost:Math.max(0,Number(f.get('cost'))||0),order_index:d.items.length
      }));
      modal=null;tab='itinerary';await refresh();toast('Activity added to shared trip');
    }catch(error){fail(error)}})();
  };
  const oldDeleteActivity=window.deleteActivity;
  window.deleteActivity=function(di,ii){
    if(!isLive())return oldDeleteActivity(di,ii);
    const d=(s.itinerary[s.current]||[])[di],activity=d?.items?.[ii],id=activity?.[4];
    if(!id)return;
    void(async()=>{try{
      await checked(client().from('itinerary_activities').delete().eq('id',id).eq('trip_id',s.current));
      await refresh();
    }catch(error){fail(error)}})();
  };
  const oldProfile=window.saveTravelProfile;
  window.saveTravelProfile=function(e){
    if(!isLive())return oldProfile(e);
    const f=form(e),name=String(f.get('name')||'').trim().slice(0,80);
    if(!name)return;
    void(async()=>{try{
      const fields={display_name:name,home_airport:String(f.get('airport')||'').trim().slice(0,30),
        travel_pace:String(f.get('pace')||'Balanced'),travel_style:String(f.get('style')||'Mid-range'),
        interests:s.profile.interests||[],updated_at:new Date().toISOString()};
      const {data,error}=await client().from('profiles').update(fields).eq('id',uid()).select('*').single();
      if(error)throw error;
      cloud.profile=data;modal=null;await refresh();toast('Cloud profile updated');
    }catch(error){fail(error)}})();
  };
  const oldEstimates=window.saveEstimates;
  window.saveEstimates=function(e){
    if(!isLive())return oldEstimates(e);
    const f=form(e),budget=Math.max(0,Number(f.get('target'))||0);
    void(async()=>{try{
      const {data,error}=await client().from('trips').update({budget_per_person:budget}).eq('id',s.current).select('id').maybeSingle();
      if(error)throw error;
      // Budget breakdown is stored locally; shared target is owner-controlled.
      oldEstimates(e);
      if(data)await cloud.loadTrips(s.current);
    }catch(error){fail(error)}})();
  };
  const oldDestination=window.roavelyDestinationVote;
  window.roavelyDestinationVote=function(id,answer){
    if(!isLive()||answer!=='yes')return oldDestination(id,answer);
    const d=cloudCandidate(id);
    if(!d)return oldDestination(id,answer);
    void(async()=>{try{
      const title=d.name+' — destination proposal';
      const {data:existing,error}=await client().from('suggestions').select('id').eq('trip_id',s.current).eq('title',title).maybeSingle();
      if(error)throw error;
      if(!existing)await checked(client().from('suggestions').insert({trip_id:s.current,created_by:uid(),title,place:d.regions,estimated_cost:0,category:'destination'}));
      await refresh();toast('Destination proposed to the group');
    }catch(error){fail(error)}})();
  };
  function cloudCandidate(id){return window.roavelyNext?.candidates?.find(d=>d.id===id)}
  const oldWildcard=window.roavelyPitch;
  window.roavelyPitch=function(){
    if(!isLive())return oldWildcard();
    oldWildcard();
    const x=(s.ideas[s.current]||[])[0];
    if(!x)return;
    void(async()=>{try{
      await checked(client().from('suggestions').insert({trip_id:s.current,created_by:uid(),title:x.title,place:x.city,estimated_cost:x.cost||0,category:'activity'}));
      await refresh();
    }catch(error){fail(error)}})();
  };
  const oldBucket=window.wishPitch;
  window.wishPitch=function(id){
    if(!isLive())return oldBucket(id);
    oldBucket(id);
    const x=(s.ideas[s.current]||[])[0];
    if(!x)return;
    void(async()=>{try{
      await checked(client().from('suggestions').insert({trip_id:s.current,created_by:uid(),title:x.title,place:x.city,estimated_cost:0,category:'activity'}));
      await refresh();
    }catch(error){fail(error)}})();
  };
  const oldAddTrip=addTrip;
  addTrip=function(e){
    if(!cloud.user||!isLive())return oldAddTrip(e);
    return window.cloudCreateTrip(e);
  };
  const originalReset=resetDemo;
  resetDemo=function(){
    if(isLive()){toast('Cloud trips cannot be reset here. Sign out to reset local demo.');return}
    originalReset();
  };
})();

/* END cloud-actions.js */


/* BEGIN trip-theme.js */
(function travelThemeEngine(){
  const priorRender=render;
  const themes=[
    [/japan|tokyo|kyoto|osaka|hiroshima|kumamoto|hakone/i,'japan','Sakura season'],
    [/australia|sydney|melbourne|wagga|brisbane|perth/i,'australia','Coastal Australia'],
    [/iceland|reykjavik/i,'iceland','Northern lights'],
    [/italy|rome|florence|venice|amalfi/i,'italy','Italian sunset'],
    [/norway|lofoten|bergen|oslo/i,'iceland','Nordic skies'],
    [/switzerland|alps|zermatt/i,'iceland','Alpine escape'],
    [/new zealand|queenstown/i,'australia','Southern adventure']
  ];
  let selected='default';
  function pick(){
    const info=trip()||{};
    const destination=[info.destination,info.name].filter(Boolean).join(' ');
    const chosen=themes.find(x=>x[0].test(destination));
    return chosen?{id:chosen[1],name:chosen[2]}:{id:'default',name:'Anywhere is possible'};
  }
  function paint(){
    const theme=pick();
    selected=theme.id;
    document.documentElement.setAttribute('data-roavely-theme',theme.id);
    const hero=document.querySelector('.hero');
    if(hero){
      const target=hero.querySelector('.trip-theme-label');
      if(!target){
        const el=document.createElement('div');
        el.className='trip-theme-label';
        el.setAttribute('aria-label','Trip theme');
        el.textContent='✦ '+theme.name;
        hero.appendChild(el);
      }else target.textContent='✦ '+theme.name;
    }
  }
  render=function(){priorRender();paint()};
  window.roavelyTheme={active:()=>selected,paint};
  paint();
})();
/* END trip-theme.js */
