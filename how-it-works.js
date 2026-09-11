// Animate the approved raster composition without regenerating its artwork.
// The canvas is purely presentational; the section's semantic HTML stays intact.
(() => {
  const section = document.querySelector('#how-it-works');
  if (!section || !('IntersectionObserver' in window)) return;
  const source = section.querySelector('.how-template-desktop');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1051px)');
  const cards = [...section.querySelectorAll('.how-template-card')];
  const heading = section.querySelector('.how-template-heading');
  const title = heading.querySelector('h2');
  const activeAnimations = new Set();
  let dispose = () => {};
  let generation = 0;

  const clamp = (n) => Math.max(0, Math.min(1, n));
  const easeOut = (n) => 1 - (1 - clamp(n)) ** 3;
  // A restrained single overshoot, followed by a soft second settling bounce.
  const bounce = (p) => {
    const stops = [[0, 48], [.52, -17], [.72, 6], [.88, -3], [1, 0]];
    for (let i = 1; i < stops.length; i++) {
      if (p <= stops[i][0]) {
        const [a, av] = stops[i - 1], [b, bv] = stops[i];
        return av + (bv - av) * easeOut((p - a) / (b - a));
      }
    }
    return 0;
  };

  function animate(el, keyframes, options) {
    const motion = el.animate(keyframes, options);
    activeAnimations.add(motion);
    motion.finished.then(() => {
      motion.cancel();
      activeAnimations.delete(motion);
    }).catch(() => activeAnimations.delete(motion));
    return motion;
  }

  function setupMobile() {
    const original = title.innerHTML;
    const label = title.textContent.replace(/\s+/g, ' ').replace('tocheckout', 'to checkout');
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    while (title.firstChild) visual.append(title.firstChild);
    const accessible = document.createElement('span');
    accessible.className = 'sr-only';
    accessible.textContent = label;
    title.append(accessible, visual);
    const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
    const nodes = [], letters = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((word) => {
        if (/^\s+$/.test(word)) { fragment.append(word); return; }
        const span = document.createElement('span'); span.className = 'how-type-word';
        for (const letter of word) {
          const character = document.createElement('span');
          character.className = 'how-type-letter'; character.textContent = letter;
          span.append(character); letters.push(character);
        }
        fragment.append(span);
      });
      node.replaceWith(fragment);
    });
    heading.classList.add('how-type-pending');
    let typeFrame = 0, typingStart = 0;
    const type = (now) => {
      typingStart ||= now;
      const count = Math.floor((now - typingStart) / 48) + 1;
      letters.slice(0, count).forEach((letter) => letter.classList.add('is-typed'));
      if (count < letters.length) typeFrame = requestAnimationFrame(type);
      else heading.classList.remove('how-type-pending');
    };
    const titleObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      titleObserver.disconnect(); typeFrame = requestAnimationFrame(type);
    }, { threshold: .45 });
    titleObserver.observe(heading);
    let lastStart = 0;
    const cardObserver = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach(({ target }) => {
        cardObserver.unobserve(target);
        const index = cards.indexOf(target);
        const now = performance.now();
        const delay = Math.max(0, lastStart + 420 - now); lastStart = now + delay;
        animate(target, [
          { transform: 'translateY(44px) scale(.975)', opacity: .15, offset: 0 },
          { transform: 'translateY(-12px) scale(1.008)', opacity: 1, offset: .55 },
          { transform: 'translateY(5px) scale(1)', opacity: 1, offset: .75 },
          { transform: 'translateY(0) scale(1)', opacity: 1, offset: 1 },
        ], { duration: 1050, delay, easing: 'ease-out', fill: 'both' });
        const art = target.querySelector('.how-template-art');
        animate(art.querySelector('img'), [
          { filter: 'brightness(.93)' }, { filter: 'brightness(1.1)', offset: .45 }, { filter: 'brightness(1)' },
        ], { duration: 1250, delay: delay + 250, fill: 'both' });
        const effect = document.createElement('span');
        effect.className = 'how-illustration-effect'; effect.setAttribute('aria-hidden', 'true'); art.append(effect);
        animate(effect, index === 1 ? [
          { opacity: 0, transform: 'scale(.65)' }, { opacity: 1, transform: 'scale(1)', offset: .45 }, { opacity: 0, transform: 'scale(1.16)' },
        ] : [
          { top: '22%', opacity: 0 }, { top: '30%', opacity: 1, offset: .2 }, { top: '78%', opacity: 1, offset: .8 }, { top: '85%', opacity: 0 },
        ], { duration: 1350, delay: delay + 550, fill: 'both' });
      });
    }, { threshold: .25 });
    cards.forEach((card) => cardObserver.observe(card));
    dispose = () => {
      cancelAnimationFrame(typeFrame); titleObserver.disconnect(); cardObserver.disconnect();
      title.innerHTML = original; heading.classList.remove('how-type-pending');
      cards.forEach((card) => card.querySelector('.how-illustration-effect')?.remove());
    };
  }

  function setupDesktop(cleanBackground) {
    const W = 1672, H = 941;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H; canvas.className = 'how-motion-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const plate = document.createElement('canvas'); plate.width = W; plate.height = H;
    const bg = plate.getContext('2d'); if (!bg) return;
    const positions = [{x:86,w:490}, {x:595,w:483}, {x:1095,w:493}];
    const y = 238, h = 577;
    bg.drawImage(source, 0, 0, W, H);
    // Feather a clean marble plate into only the areas exposed by motion.
    const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
    const masked = mask.getContext('2d');
    masked.filter = 'blur(10px)';
    masked.fillRect(102, 58, 610, 157);
    positions.forEach(({x,w}) => masked.fillRect(x - 8, y - 8, w + 16, h + 16));
    masked.filter = 'none';
    masked.globalCompositeOperation = 'source-in';
    masked.drawImage(cleanBackground, 0, 0, W, H);
    bg.drawImage(mask, 0, 0);
    // Discover the original glyph columns instead of substituting a typeface.
    const probe = document.createElement('canvas'); probe.width=W; probe.height=H;
    const px = probe.getContext('2d', {willReadFrequently:true}); px.drawImage(source,0,0);
    const pixels = px.getImageData(0,0,W,H).data;
    const glyphs=[];
    for (const row of [{x:119,y:76,w:519,h:62},{x:119,y:142,w:578,h:60}]) {
      let start = -1;
      for (let x=row.x; x<=row.x+row.w; x++) {
        let ink=false;
        if(x<row.x+row.w) for(let yy=row.y; yy<row.y+row.h; yy++) {
          const i=(yy*W+x)*4, r=pixels[i], g=pixels[i+1], b=pixels[i+2];
          if((r<90 && g<90 && b<90) || (r>200 && g<160 && b<135)) {ink=true; break;}
        }
        if(ink && start<0) start=x;
        if(!ink && start>=0) {glyphs.push({x:start-1,y:row.y,w:x-start+2,h:row.h}); start=-1;}
      }
    }
    let headingStart=null, cardStart=null, frame=0, visible=false, finished=false;
    const headingDuration = glyphs.length * 48;
    const drawCard = (index,elapsed) => {
      const {x,w}=positions[index];
      if(elapsed<0) return;
      const p=clamp(elapsed/1050), displacement=bounce(p);
      const scale=1-.02*(1-p);
      ctx.save(); ctx.translate(x+w/2,y+h/2+displacement); ctx.scale(scale,scale); ctx.translate(-w/2,-h/2);
      ctx.globalAlpha=easeOut(p*4);
      ctx.beginPath();ctx.roundRect(0,0,w,h,36);ctx.clip();
      ctx.drawImage(source,x,y,w,h,0,0,w,h);
      // A minute perspective push on the illustration, while its caption stays still.
      const artP=clamp((elapsed-350)/1400), zoom=1+.016*Math.sin(artP*Math.PI);
      ctx.save();ctx.beginPath();ctx.rect(0,0,w,405);ctx.clip();
      ctx.translate(w/2,205);ctx.scale(zoom,zoom);ctx.translate(-w/2,-205);
      ctx.drawImage(source,x,y,w,405,0,0,w,405);ctx.restore();
      const effect=clamp((elapsed-600)/1400), alpha=Math.sin(effect*Math.PI);
      if(alpha>0) {
        ctx.save();ctx.globalAlpha*=alpha;
        if(index===1) {
          const glow=ctx.createRadialGradient(w*.48,265,8,w*.48,265,180);
          glow.addColorStop(0,'rgba(255,236,165,.35)');glow.addColorStop(.5,'rgba(91,252,255,.14)');glow.addColorStop(1,'rgba(91,252,255,0)');
          ctx.fillStyle=glow;ctx.fillRect(0,100,w,300);
        } else {
          const lineY=110+effect*235, left=index===0?72:45, right=index===0?w-75:w-175;
          const shine=ctx.createLinearGradient(left,0,right,0);
          shine.addColorStop(0,'rgba(255,207,108,0)');shine.addColorStop(.5,'#fffce9');shine.addColorStop(1,'rgba(255,207,108,0)');
          ctx.shadowColor='#ffbf55';ctx.shadowBlur=16;ctx.fillStyle=shine;ctx.fillRect(left,lineY,right-left,3);
        }
        ctx.restore();
      }
      // Pulse the existing checkmark/badge in its original location.
      const confirm=clamp((elapsed-1750)/700), pulse=Math.sin(confirm*Math.PI);
      if(pulse>0) {
        ctx.save();ctx.globalAlpha*=pulse*.55;
        const cx=index===0?353:index===1?240:440, cy=index===0?358:index===1?340:308;
        const glow=ctx.createRadialGradient(cx,cy,4,cx,cy,50);
        glow.addColorStop(0,index===1?'#8dffff':'#ffdb8b');glow.addColorStop(1,'transparent');
        ctx.globalCompositeOperation='screen';ctx.fillStyle=glow;ctx.fillRect(cx-50,cy-50,100,100);ctx.restore();
      }
      ctx.restore();
    };
    const paint=(now) => {
      frame=0; if(!visible || finished || document.hidden) return;
      ctx.clearRect(0,0,W,H);ctx.drawImage(plate,0,0);
      const elapsed=headingStart===null?-1:now-headingStart;
      if(elapsed>=headingDuration) ctx.drawImage(source,112,68,590,137,112,68,590,137);
      else glyphs.slice(0,Math.max(0,Math.floor(elapsed/48))).forEach(({x,y,w,h})=>ctx.drawImage(source,x,y,w,h,x,y,w,h));
      positions.forEach((_,i)=>drawCard(i,cardStart===null?-1:now-cardStart-i*580));
      if(cardStart!==null && now-cardStart>3610 && elapsed>=headingDuration) {
        finished=true; section.classList.remove('how-motion-ready'); canvas.remove();
        section.dataset.howMotion='complete'; return;
      }
      if((headingStart!==null && elapsed<headingDuration) || cardStart!==null) frame=requestAnimationFrame(paint);
    };
    const schedule=()=>{
      if(finished || !visible || document.hidden) return;
      const r=section.getBoundingClientRect(), now=performance.now();
      if(headingStart===null && r.top<innerHeight*.75) {headingStart=now; section.dataset.howMotion='heading';}
      if(cardStart===null && r.top + r.width*y/W<innerHeight*.85) {cardStart=now+Math.max(400,headingDuration*.45);section.dataset.howMotion='cards';}
      if(!frame) frame=requestAnimationFrame(paint);
    };
    ctx.drawImage(plate,0,0);section.append(canvas);section.classList.add('how-motion-ready');
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible)schedule(); else {cancelAnimationFrame(frame);frame=0;}
    });observer.observe(section);
    window.addEventListener('scroll',schedule,{passive:true});
    document.addEventListener('visibilitychange',schedule);
    dispose=()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);document.removeEventListener('visibilitychange',schedule);canvas.remove();section.classList.remove('how-motion-ready');delete section.dataset.howMotion;};
  }

  async function setup() {
    const current=++generation;dispose();activeAnimations.forEach((a)=>a.cancel());activeAnimations.clear();
    if(reduced.matches) return;
    try {
      if(desktop.matches) {
        const cleanBackground = new Image();
        cleanBackground.crossOrigin = 'anonymous';
        cleanBackground.src = 'https://chill-app-sa.lusandaphiwe1.chatgpt.site/assets/chill-motion-background.png';
        await Promise.all([source.decode(), cleanBackground.decode()]);
        if(current!==generation) return;
        setupDesktop(cleanBackground);
      } else setupMobile();
    } catch { section.classList.remove('how-motion-ready'); }
  }
  desktop.addEventListener('change',setup);reduced.addEventListener('change',setup);
  setup();
})();
