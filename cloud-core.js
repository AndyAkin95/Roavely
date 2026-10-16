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
    }catch(error){fail(error)}finally{cloud.busy=false;renderPanel()}
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
  async function boot(){
    readInvite();
    try{
      const sdk=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm');
      cloud.client=sdk.createClient(SUPABASE_URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      const {data,error}=await cloud.client.auth.getSession();
      if(error)throw error;
      await onSession(data.session);
      cloud.client.auth.onAuthStateChange((event,session)=>{
        if(event==='INITIAL_SESSION')return;
        setTimeout(()=>void onSession(session),0);
      });
    }catch(error){cloud.loading=false;cloud.error='Cloud sign-in unavailable: '+(error.message||error);render();renderPanel()}
  }
  void boot();
})();
