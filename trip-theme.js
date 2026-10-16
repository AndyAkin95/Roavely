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