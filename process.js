// Each illustration is scrubbed by scroll position: no autoplay timers or loops.
(() => {
  const section = document.querySelector('#how-it-works');
  if (!section) return;
  const track = section.querySelector('[data-process-track]');
  const row = section.querySelector('[data-process-row]');
  const cards = [...section.querySelectorAll('[data-process-card]')];
  const path = section.querySelector('[data-route-path]');
  const dot = section.querySelector('[data-route-dot]');
  const milestones = [...section.querySelectorAll('[data-milestone]')];
  const fill = section.querySelector('[data-milestone-fill]');
  const timelineDot = section.querySelector('[data-milestone-dot]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = matchMedia('(max-width: 1040px)');
  const pinned = matchMedia('(min-width: 1041px) and (min-height: 760px)');
  const select = (name) => section.querySelector(`[data-${name}]`);
  const identity = select('identity-card');
  const identityBeam = select('identity-beam');
  const identityCheck = select('identity-check');
  const count = select('credit-count');
  const approved = select('credit-approved');
  const pulse = select('credit-pulse');
  const meter = select('credit-meter');
  const qr = select('process-qr');
  const paymentBeam = select('payment-beam');
  const ready = select('payment-ready');
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const phase = (value, from, to) => clamp((value - from) / (to - from));
  const ease = (value) => 1 - (1 - value) ** 3;
  let frame = 0;
  let visible = true;
  let pathLength = path.getTotalLength();
  let lastAmount = -1;

  function badge(node, value) {
    node.style.opacity = value;
    node.style.transform = `translateY(${(1 - value) * 7}px)`;
  }

  function paint() {
    frame = 0;
    const noMotion = reduced.matches;
    const height = window.innerHeight;
    const top = track.getBoundingClientRect().top;
    const runway = pinned.matches ? Math.max(1, height * 1.12 - 105) : height * .6;
    const progress = clamp((height * .82 - top) / runway);
    let stages = [0, 1, 2].map((index) => clamp(progress * 3 - index));
    if (stacked.matches) {
      stages = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return clamp((height * .85 - rect.top) / (Math.min(height, rect.height) * .74));
      });
    }
    if (noMotion) stages = [1, 1, 1];
    const journey = (stages[0] + stages[1] + stages[2]) / 3;
    row.style.transform = noMotion ? 'none' : `translate3d(0,${-28 * journey}px,0)`;

    const enter = ease(phase(stages[0], 0, .43));
    const idScan = phase(stages[0], .38, .82);
    identity.style.transform = `translateY(${(1 - enter) * 225}px) rotate(${-17 + enter * 10}deg)`;
    identityBeam.style.top = `${5 + idScan * 90}%`;
    identityBeam.style.opacity = Math.sin(idScan * Math.PI) * .85;
    badge(identityCheck, phase(stages[0], .82, 1));

    const credit = ease(phase(stages[1], .06, .85));
    const amount = Math.round(credit * 1000);
    if (amount !== lastAmount) {
      count.textContent = amount === 1000 ? 'R1 000' : `R${amount}`;
      lastAmount = amount;
    }
    meter.style.transform = `scaleX(${credit})`;
    pulse.style.transform = `scale(${.5 + stages[1] * .85})`;
    pulse.style.opacity = Math.sin(stages[1] * Math.PI) * .8;
    badge(approved, phase(stages[1], .82, 1));

    const scan = phase(stages[2], .08, .75);
    paymentBeam.style.top = `${10 + scan * 82}%`;
    paymentBeam.style.opacity = Math.sin(scan * Math.PI);
    const flash = Math.sin(phase(stages[2], .65, .95) * Math.PI);
    qr.style.filter = `brightness(${1 + flash * .18})`;
    qr.style.boxShadow = `0 20px 25px #514b4220, 5px 5px 0 #e1d8cb, 0 0 ${flash * 30}px rgba(255,117,91,${flash * .24})`;
    badge(ready, phase(stages[2], .8, 1));

    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = 1 - journey;
    const point = path.getPointAtLength(pathLength * journey);
    dot.setAttribute('cx', point.x);
    dot.setAttribute('cy', point.y);
    fill.style.transform = `scaleX(${journey})`;
    timelineDot.style.left = `${journey * 100}%`;
    milestones.forEach((node, index) => node.classList.toggle('is-reached', stages[index] === 1));
  }

  function schedule() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(paint);
  }
  function preferenceChanged() {
    section.classList.toggle('process-enhanced', !reduced.matches);
    paint();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', preferenceChanged);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, { rootMargin: '150px' }).observe(section);
  }
  preferenceChanged();
})();
