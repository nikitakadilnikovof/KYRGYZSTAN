(() => {
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#mobile-nav');
  const closeMenu=()=>{if(nav&&toggle){nav.hidden=true;toggle.setAttribute('aria-expanded','false');}};
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));nav.hidden=open;});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  document.querySelectorAll('.languages a').forEach(a=>a.addEventListener('click',()=>{if(location.hash)a.hash=location.hash;}));
  document.querySelector('[data-copy]')?.addEventListener('click',async e=>{
    const b=e.currentTarget,s=document.querySelector('.copy-status');
    try {await navigator.clipboard.writeText(b.dataset.copy);s.textContent=b.dataset.success;}
    catch{s.textContent=b.dataset.failure;}
  });
  const box=document.querySelector('.lightbox');
  if(!box||typeof box.showModal!=='function')return;
  let image=box.querySelector('.lightbox-image');
  const stage=box.querySelector('.lightbox-stage');
  const message=box.querySelector('.lightbox-message');
  const retry=box.querySelector('.lightbox-retry');
  let items=[],index=0,returnFocus=null,gallery=null,requestId=0,touchStart=null;
  const loadPhoto=async src=>{
    const photo=new Image();photo.decoding='async';photo.src=src;
    await photo.decode();return photo;
  };
  function display(){
    const ticket=++requestId,item=items[index],selected=index,currentItems=items;
    let fullShown=false;
    const current=()=>ticket===requestId&&box.open;
    image.hidden=true;
    box.dataset.state='loading';box.setAttribute('aria-busy','true');
    message.querySelector('p').textContent=box.dataset.loading;
    message.hidden=false;retry.hidden=true;touchStart=null;
    box.querySelector('.lightbox-caption').textContent=item.alt;
    box.querySelector('.lightbox-counter').textContent=(index+1)+' / '+items.length;
    const show=(photo,full)=>{
      if(!current()||(!full&&fullShown))return;
      fullShown=fullShown||full;
      photo.className='lightbox-image';photo.alt=item.alt;
      // Attach a decoded image, never reuse a node still painting the last photo.
      image.replaceWith(photo);image=photo;message.hidden=true;
      box.dataset.state=full?'ready':'preview';
      if(full)box.setAttribute('aria-busy','false');
    };
    const thumbnail=gallery?.querySelector(`[data-index="${index}"] img`);
    const previewSrc=thumbnail?.complete&&thumbnail.naturalWidth?thumbnail.currentSrc:item.preview;
    const preview=previewSrc&&previewSrc!==item.src?loadPhoto(previewSrc).then(photo=>{show(photo,false);return true;},()=>false):Promise.resolve(false);
    const full=loadPhoto(item.src).then(photo=>{
      show(photo,true);
      if(current())for(const offset of [-1,1]){
        const next=currentItems[(selected+offset+currentItems.length)%currentItems.length];
        if(next.src!==item.src){const preload=new Image();preload.src=next.src;}
      }
      return true;
    },()=>false);
    Promise.all([full,preview]).then(([fullReady,previewReady])=>{
      if(!current()||fullReady)return;
      box.setAttribute('aria-busy','false');
      if(previewReady){box.dataset.state='ready';return;}
      box.dataset.state='error';message.querySelector('p').textContent=box.dataset.error;
      message.hidden=false;retry.hidden=false;
    });
  }
  function close(){
    ++requestId;touchStart=null;image.hidden=true;image.removeAttribute('src');image.alt='';
    message.hidden=true;retry.hidden=true;box.setAttribute('aria-busy','false');box.dataset.state='closed';
    box.close();document.body.classList.remove('modal-open');returnFocus?.focus({preventScroll:true});
  }
  function move(offset){if(!box.open||!items.length)return;index=(index+offset+items.length)%items.length;display();}
  document.querySelectorAll('[data-gallery]').forEach(g=>g.querySelectorAll('a[data-index]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();items=JSON.parse(g.dataset.gallery);index=Number(a.dataset.index);gallery=g;returnFocus=a;
    box.querySelector('.lightbox-title').textContent=g.dataset.title;
    box.showModal();document.body.classList.add('modal-open');display();
  })));
  box.querySelector('.lightbox-close').addEventListener('click',close);
  box.querySelector('.lightbox-prev').addEventListener('click',()=>move(-1));
  box.querySelector('.lightbox-next').addEventListener('click',()=>move(1));
  retry.addEventListener('click',display);
  box.addEventListener('cancel',e=>{e.preventDefault();close();});
  box.addEventListener('click',e=>{if(e.target===box)close();});
  box.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  stage.addEventListener('touchstart',e=>{if(e.target===image)touchStart={x:e.changedTouches[0].clientX,ticket:requestId};},{passive:true});
  stage.addEventListener('touchend',e=>{
    const start=touchStart;touchStart=null;if(!start||start.ticket!==requestId)return;
    const diff=e.changedTouches[0].clientX-start.x;if(Math.abs(diff)>45)move(diff<0?1:-1);
  },{passive:true});
})();
