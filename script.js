const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const scanOverlay = document.querySelector('[data-scan-overlay]');
const eligibilityModal = document.querySelector('[data-eligibility-modal]');
const ageCheck = document.querySelector('[data-age-check]');
const idCheck = document.querySelector('[data-id-check]');
const modalNext = document.querySelector('[data-modal-next]');

// Keep the complete heading in the layout so typing never shifts the section.
const typeHeading = document.querySelector('[data-type-heading]');
if (typeHeading && 'IntersectionObserver' in window) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motionPreference.matches) {
    const accessibleText = document.createElement('span');
    accessibleText.className = 'sr-only';
    accessibleText.textContent = 'Plans happen. Chill helps you meet them.';
    const visualText = document.createElement('span');
    visualText.className = 'type-visual';
    visualText.setAttribute('aria-hidden', 'true');
    while (typeHeading.firstChild) visualText.append(typeHeading.firstChild);
    typeHeading.append(accessibleText, visualText);
    const walker = document.createTreeWalker(visualText, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const characters = [];
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      textNode.textContent.split(/(\s+)/).forEach((word) => {
        if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); return; }
        const wordNode = document.createElement('span');
        wordNode.className = 'type-word';
        for (const character of word) {
          const letter = document.createElement('span');
          letter.className = 'type-char';
          letter.textContent = character;
          wordNode.append(letter);
          characters.push(letter);
        }
        fragment.append(wordNode);
      });
      textNode.replaceWith(fragment);
    });
    typeHeading.classList.add('type-ready');
    let typingFrame = 0;
    let startedAt = null;
    let shown = 0;
    function finishTyping() {
      cancelAnimationFrame(typingFrame);
      typeHeading.classList.remove('type-ready');
      typingObserver.disconnect();
    }
    function typeFrame(now) {
      startedAt ??= now;
      const count = Math.min(characters.length, Math.floor((now - startedAt) / 48) + 1);
      while (shown < count) characters[shown++].classList.add('is-typed');
      if (shown < characters.length) typingFrame = requestAnimationFrame(typeFrame);
      else finishTyping();
    }
    const typingObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      typingObserver.disconnect();
      typingFrame = requestAnimationFrame(typeFrame);
    }, { threshold: .35 });
    typingObserver.observe(typeHeading);
    motionPreference.addEventListener('change', (event) => {
      if (event.matches) finishTyping();
    });
  }
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const delay = Number(entry.target.dataset.delay || 0);
    window.setTimeout(() => entry.target.classList.add('revealed'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -45px' });

document.querySelectorAll('[data-reveal]').forEach((node) => revealObserver.observe(node));

document.querySelectorAll('[data-accordion] .faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('[data-accordion] .faq-item').forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

document.querySelector('[data-scan-demo]')?.addEventListener('click', () => {
  scanOverlay.showModal();
});

document.querySelector('[data-close-scan]')?.addEventListener('click', () => {
  scanOverlay.close();
});

function setModalStep(step) {
  eligibilityModal.querySelectorAll('[data-modal-step]').forEach((node) => {
    node.hidden = node.dataset.modalStep !== String(step);
  });
  const bars = eligibilityModal.querySelectorAll('.modal-progress i');
  bars[1].style.background = step === 2 ? 'var(--blue-deep)' : '';
}

document.querySelectorAll('[data-open-eligibility]').forEach((button) => {
  button.addEventListener('click', () => {
    setModalStep(1);
    eligibilityModal.showModal();
  });
});

document.querySelector('[data-close-eligibility]')?.addEventListener('click', () => eligibilityModal.close());

eligibilityModal?.addEventListener('click', (event) => {
  const rect = eligibilityModal.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) eligibilityModal.close();
});

function updateEligibilityButton() {
  modalNext.disabled = !(ageCheck.checked && idCheck.checked);
}

ageCheck?.addEventListener('change', updateEligibilityButton);
idCheck?.addEventListener('change', updateEligibilityButton);
modalNext?.addEventListener('click', () => setModalStep(2));
document.querySelector('[data-modal-back]')?.addEventListener('click', () => setModalStep(1));

// Scroll and pointer targets share one demand-driven animation frame loop.
// Each plane travels at a different speed; touch scrolling stays native.
const depthHero = document.querySelector('[data-depth-hero]');
if (depthHero) {
  const imagePlane = depthHero.querySelector('[data-depth-image]');
  const lightPlane = depthHero.querySelector('[data-depth-light]');
  const creditPlane = depthHero.querySelector('[data-depth-card]');
  const scanPlane = depthHero.querySelector('[data-depth-scan]');
  const copyPlane = depthHero.querySelector('[data-depth-copy]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobileLayout = window.matchMedia('(max-width: 780px)');
  const target = { x: 0, y: 0, scroll: 0 };
  const current = { x: 0, y: 0, scroll: 0 };
  let frame = 0;
  let visible = true;

  function paintDepth() {
    frame = 0;
    if (reducedMotion.matches || !visible || document.hidden) return;
    let moving = false;
    for (const key of Object.keys(current)) {
      const delta = target[key] - current[key];
      current[key] = Math.abs(delta) < .001 ? target[key] : current[key] + delta * .1;
      moving ||= Math.abs(delta) >= .001;
    }
    const { x, y, scroll: progress } = current;
    const travel = mobileLayout.matches ? 30 : 100;
    imagePlane.style.transform = `translate3d(${x * -9}px, ${progress * travel + y * -7}px, 0) rotateX(${y * .9 - progress * 2}deg) rotateY(${x * -1.2}deg) scale(${1.05 + progress * .045})`;
    lightPlane.style.transform = `translate3d(${x * 32}px, ${y * 24 - progress * 45}px, 0)`;
    creditPlane.style.transform = `translate3d(${x * 18}px, ${y * 14 - progress * 85}px, 0) rotate(${5 - progress * 7}deg) rotateY(${x * 5}deg)`;
    scanPlane.style.transform = `translate3d(${x * 26}px, ${y * 18 - progress * 125}px, 0) rotate(${-4 + progress * 6}deg) rotateY(${x * 6}deg)`;
    copyPlane.style.transform = `translate3d(0, ${progress * -24}px, 0)`;
    if (moving) frame = requestAnimationFrame(paintDepth);
  }

  function scheduleDepth() {
    if (!frame && visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(paintDepth);
  }
  function updateScroll() {
    const rect = depthHero.getBoundingClientRect();
    target.scroll = Math.max(0, Math.min(1, -rect.top / rect.height));
    scheduleDepth();
  }
  depthHero.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const rect = depthHero.getBoundingClientRect();
    target.x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    target.y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    scheduleDepth();
  }, { passive: true });
  depthHero.addEventListener('pointerleave', () => {
    target.x = 0;
    target.y = 0;
    scheduleDepth();
  });
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  const depthObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) updateScroll();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  depthObserver.observe(depthHero);
  reducedMotion.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) {
      [imagePlane, lightPlane, creditPlane, scanPlane, copyPlane].forEach((plane) => plane.style.removeProperty('transform'));
    } else updateScroll();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else updateScroll();
  });
  updateScroll();
}

// The completed Scan to Pay screen enters as a dimensional product object, then gently follows a nearby pointer.
(() => {
  const stage = document.querySelector('[data-scan-3d]');
  if (!stage || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const settle = () => {
    stage.style.setProperty('--scan-x', '0px');
    stage.style.setProperty('--scan-y', '0px');
    stage.style.setProperty('--scan-rx', '0deg');
    stage.style.setProperty('--scan-ry', '0deg');
  };
  if (reduced.matches) { stage.classList.add('scan-3d-ready'); return; }
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    stage.classList.add('scan-3d-ready');
    observer.unobserve(stage);
  }, { threshold: .28 });
  observer.observe(stage);
  stage.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reduced.matches) return;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    stage.style.setProperty('--scan-x', `${x * 9}px`);
    stage.style.setProperty('--scan-y', `${y * 6}px`);
    stage.style.setProperty('--scan-rx', `${-y * 5}deg`);
    stage.style.setProperty('--scan-ry', `${x * 8}deg`);
  }, { passive: true });
  stage.addEventListener('pointerleave', settle);
  reduced.addEventListener('change', (event) => {
    if (event.matches) { stage.classList.add('scan-3d-ready'); settle(); }
  });
})();

// The closing CTA keeps the celebration photograph and message on separate depth planes.
(() => {
  const section = document.querySelector('[data-cta-depth]');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let visible = false;
  let frame = 0;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  const paint = () => {
    frame = 0;
    currentX += (targetX - currentX) * .12;
    currentY += (targetY - currentY) * .12;
    section.style.setProperty('--cta-image-x', `${currentX * -16}px`);
    section.style.setProperty('--cta-image-y', `${currentY * -10}px`);
    section.style.setProperty('--cta-copy-x', `${currentX * 11}px`);
    section.style.setProperty('--cta-copy-y', `${currentY * 7}px`);
    section.style.setProperty('--cta-copy-rx', `${currentY * -2.8}deg`);
    section.style.setProperty('--cta-copy-ry', `${currentX * 3.6}deg`);
    if (visible && (Math.abs(targetX - currentX) > .002 || Math.abs(targetY - currentY) > .002)) frame = requestAnimationFrame(paint);
  };
  const schedule = () => { if (!frame && !reduced.matches) frame = requestAnimationFrame(paint); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); }, { threshold: .15 });
  observer.observe(section);
  section.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reduced.matches) return;
    const rect = section.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width - .5;
    targetY = (event.clientY - rect.top) / rect.height - .5;
    schedule();
  }, { passive: true });
  section.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; schedule(); });
  reduced.addEventListener('change', (event) => {
    if (event.matches) { cancelAnimationFrame(frame); frame = 0; section.removeAttribute('style'); }
  });
})();
