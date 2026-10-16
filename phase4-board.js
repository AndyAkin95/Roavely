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
