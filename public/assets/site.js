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
  const image=box.querySelector('.lightbox-image');
  let items=[],index=0,returnFocus=null;
  function display(){const i=items[index];image.src=i.src;image.alt=i.alt;box.querySelector('.lightbox-caption').textContent=i.alt;box.querySelector('.lightbox-counter').textContent=(index+1)+' / '+items.length;}
  function close(){box.close();document.body.classList.remove('modal-open');returnFocus?.focus();}
  document.querySelectorAll('[data-gallery]').forEach(g=>g.querySelectorAll('a[data-index]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();items=JSON.parse(g.dataset.gallery);index=Number(a.dataset.index);returnFocus=a;box.querySelector('.lightbox-title').textContent=g.dataset.title;display();box.showModal();document.body.classList.add('modal-open');
  })));
  box.querySelector('.lightbox-close').addEventListener('click',close);
  box.querySelector('.lightbox-prev').addEventListener('click',()=>{index=(index-1+items.length)%items.length;display();});
  box.querySelector('.lightbox-next').addEventListener('click',()=>{index=(index+1)%items.length;display();});
  box.addEventListener('cancel',e=>{e.preventDefault();close();});
  box.addEventListener('click',e=>{if(e.target===box)close();});
  box.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){index=(index+1)%items.length;display();}if(e.key==='ArrowLeft'){index=(index-1+items.length)%items.length;display();}});
  let touchStart=null;
  image.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX;},{passive:true});
  image.addEventListener('touchend',e=>{if(touchStart===null)return;const diff=e.changedTouches[0].clientX-touchStart;if(Math.abs(diff)>45){index=(index+(diff<0?1:-1)+items.length)%items.length;display();}touchStart=null;},{passive:true});
})();
