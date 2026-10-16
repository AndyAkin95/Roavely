const KEY='roavely-demo-v3';
const seed={current:'japan27',trips:[{id:'japan27',emoji:'🇯🇵',name:'Japan 2027',destination:'Japan',start:'2027-04-03',end:'2027-04-17',budget:5200,route:['Tokyo','Hakone','Kyoto','Osaka','Hiroshima','Kumamoto'],invite:'JPN-27'},{id:'aus28',emoji:'🇦🇺',name:'Australia 2028',destination:'Australia',start:'2028-02-10',end:'2028-02-24',budget:4800,route:['Sydney','Wagga Wagga','Melbourne'],invite:'AUS-28'}],people:{japan27:['Andy','Mike','John','Matt'],aus28:['Andy']},ideas:{japan27:[{id:'i1',emoji:'🍜',title:'Ichiran Ramen — Shibuya',city:'Tokyo',cost:15,v:{Andy:'love',Mike:'yes',John:'yes'}},{id:'i2',emoji:'🦌',title:'Day trip to Nara',city:'Kyoto',cost:60,v:{Andy:'yes',Mike:'maybe',Matt:'yes'}},{id:'i3',emoji:'🌃',title:'Shibuya Sky at sunset',city:'Tokyo',cost:20,v:{Andy:'love',Mike:'love',John:'yes',Matt:'yes'}},{id:'i4',emoji:'⛩️',title:'Fushimi Inari early morning',city:'Kyoto',cost:0,v:{Andy:'love',John:'love'}}],aus28:[]},decisions:{japan27:[{id:'d1',title:'Pick our Tokyo hotel',options:['Shibuya base — $183/night','Shinjuku base — $169/night','Ginza base — $207/night'],votes:{Andy:0,Mike:0,John:1,Matt:0}},{id:'d2',title:'Free day: Fuji or more Tokyo?',options:['Mt. Fuji day trip','More Tokyo','Nikko'],votes:{Andy:0,Mike:0,John:1}}],aus28:[]},check:{japan27:[['Book international flights',true],['Choose Tokyo hotel',false],['Reserve Shinkansen seats',false],['Buy eSIMs',false],['Share emergency contacts',false]],aus28:[]},expenses:{japan27:[{title:'Tokyo hotel deposit',amount:1640,paid:'Mike',split:4,settled:['Mike']},{title:'TeamLab tickets',amount:128,paid:'Andy',split:4,settled:['Andy','John']}],aus28:[]},itinerary:{japan27:[{day:'Day 1 · Tokyo',items:[['3:10 PM','Land at Haneda','✈️'],['5:00 PM','Check in & reset','🏨'],['7:00 PM','Shibuya dinner','🍜']]},{day:'Day 2 · Tokyo',items:[['8:00 AM','Meiji Shrine','⛩️'],['10:30 AM','Harajuku & Omotesando','🛍️'],['5:00 PM','Shibuya Sky','🌃']]},{day:'Day 6 · Kyoto',items:[['7:15 AM','Leave hotel','🚶'],['8:03 AM','Train to Arashiyama','🚆'],['8:35 AM','Bamboo Grove','🎋'],['10:00 AM','Tenryu-ji','🏯']]}],aus28:[]},reservations:{japan27:[['✈️','Flight · JFK → HND','Apr 2 · confirmation pending'],['🏨','Tokyo hotel','Apr 3–7 · shortlist not final'],['🎟️','teamLab Borderless','Apr 5 · 4 tickets']],aus28:[]}};
let s=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch{return structuredClone(seed)}})();let tab='home',planMode='ideas',modal=null;
const $=q=>document.querySelector(q), save=()=>localStorage.setItem(KEY,JSON.stringify(s)), trip=()=>s.trips.find(x=>x.id===s.current)||s.trips[0], esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function days(){let d=new Date(trip().start+'T12:00:00');return Math.max(0,Math.ceil((d-Date.now())/86400000))}function toast(t){let e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),1800)}
function persist(){save();render()}function voteCounts(v={}){return Object.values(v).reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{})}
function top(){return `<div class="top"><div class="brand"><div><h1>Roavely</h1><small>Plan together. Go anywhere.</small></div><select class="trip-select" onchange="switchTrip(this.value)">${s.trips.map(t=>`<option value="${t.id}" ${t.id===s.current?'selected':''}>${t.emoji} ${esc(t.name)}</option>`).join('')}</select></div></div>`}
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
function render(){let body=tab==='home'?home():tab==='plan'?plan():tab==='map'?map():tab==='wallet'?wallet():tripMode();$('#app').innerHTML=`<div class="shell">${top()}${body}${nav()}${modalHTML()}</div>`}(function installRoavelyFeatures(){
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

  top=function(){
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
    $('#app').innerHTML=`<div class="shell">${top()}${body}${nav()}${modalHTML()}</div>`;
  };
})();
render();
