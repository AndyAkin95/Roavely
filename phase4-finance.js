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
