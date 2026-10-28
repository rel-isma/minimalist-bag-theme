for(const gallery of document.querySelectorAll('[data-gallery]')){
 const hero=gallery.querySelector('[data-hero]'),source=gallery.querySelector('img[data-source]'),caption=gallery.querySelector('[data-caption]');
 const thumbs=[...gallery.querySelectorAll('[data-photo]')];
 function select(button){hero.src=button.dataset.photo;hero.alt=button.dataset.alt;source.src=button.dataset.source;source.alt='Original supplier photo: '+button.dataset.alt;caption.textContent=button.dataset.label;for(const b of thumbs)b.setAttribute('aria-pressed',String(b===button));for(const b of document.querySelectorAll('[data-color]'))b.setAttribute('aria-pressed',String((button.dataset.colors||'').split('|').includes(b.dataset.color)));}
 for(const b of thumbs)b.addEventListener('click',()=>select(b));
 for(const b of document.querySelectorAll('[data-color]'))b.addEventListener('click',()=>{const target=thumbs.find(t=>(t.dataset.colors||'').split('|').includes(b.dataset.color));if(target)select(target);});
 if(thumbs[0])select(thumbs[0]);
}
