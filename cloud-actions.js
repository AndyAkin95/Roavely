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
