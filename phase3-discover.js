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
