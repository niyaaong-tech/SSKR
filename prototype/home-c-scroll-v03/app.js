(() => {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const fadeWindow = (value, start, peak, end) => {
    if (value <= peak) return range(value, start, peak);
    return 1 - range(value, peak, end);
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageProgress = document.querySelector('#pageProgress');
  const header = document.querySelector('#siteHeader');
  const intro = document.querySelector('#intro');
  const introSky = document.querySelector('.intro-sky');
  const introCopy = document.querySelector('#introCopy');
  const gateway = document.querySelector('#gateway');
  const brochure = document.querySelector('#journey');
  const line = document.querySelector('#journeyLine');
  const lineShadow = document.querySelector('#journeyLineShadow');
  const handoffAnchor = document.querySelector('#handoffAnchor');
  const mapArt = document.querySelector('#mapArt');
  const mapGrid = document.querySelector('.map-grid');
  const routeNodes = document.querySelector('#routeNodes');
  const timeNodes = document.querySelector('#timeNodes');
  const placesLayer = document.querySelector('#placesLayer');
  const memoryLayer = document.querySelector('#memoryLayer');
  const sceneCopies = [...document.querySelectorAll('.scene-copy')];
  const sceneCurrent = document.querySelector('#sceneCurrent');
  const sceneProgress = document.querySelector('#sceneProgress');
  const caption = document.querySelector('#brochureCaption');
  const sunsetHold = document.querySelector('#sunsetHold');
  const dawn = document.querySelector('.sky-dawn');
  const day = document.querySelector('.sky-day');
  const sunset = document.querySelector('.sky-sunset');
  const sunOrb = document.querySelector('.sun-orb');

  const horizon = [830,370,700,370,600,370,510,370,400,370,280,370,190,370,130,370,80,370,40,370];
  const route = [830,125,780,190,810,260,725,315,650,365,650,445,540,485,435,525,410,590,280,610];
  const trace = [80,560,260,510,345,470,450,430,570,385,660,340,760,280,850,225,900,180,950,135];
  const pathFrom = (values) => `M${values[0]} ${values[1]} C${values[2]} ${values[3]} ${values[4]} ${values[5]} ${values[6]} ${values[7]} C${values[8]} ${values[9]} ${values[10]} ${values[11]} ${values[12]} ${values[13]} C${values[14]} ${values[15]} ${values[16]} ${values[17]} ${values[18]} ${values[19]}`;
  const interpolatePath = (from, to, amount) => pathFrom(from.map((value, index) => mix(value, to[index], ease(amount))));
  const setOpacity = (element, value) => { if (element) element.style.opacity = clamp(value).toFixed(3); };
  const setNodeReveal = (group, amount) => {
    if (!group) return;
    const nodes = [...group.children];
    nodes.forEach((node, index) => {
      const nodeProgress = range(amount, index / nodes.length, (index + 1.15) / nodes.length);
      node.style.opacity = nodeProgress.toFixed(3);
      node.style.transformBox = 'fill-box';
      node.style.transformOrigin = 'center';
      node.style.scale = mix(.65, 1, ease(nodeProgress)).toFixed(3);
    });
  };

  let ticking = false;
  let lastScene = -1;
  const sceneNames = [
    ['HORIZON LINE', 'SCROLL ↓'],
    ['KOREA ROUTE', 'EAST → WEST'],
    ['PLACES & PEOPLE', 'CHOOSE YOUR ROAD'],
    ['TIME TRACE', '05:31 → 18:47']
  ];

  const update = () => {
    ticking = false;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (pageProgress) pageProgress.style.transform = `scaleX(${scrollY / scrollable})`;
    header?.classList.toggle('is-scrolled', scrollY > 20);

    if (intro && !reduced) {
      const introMax = Math.max(1, intro.offsetHeight - window.innerHeight);
      const introP = clamp((scrollY - intro.offsetTop) / introMax);
      if (introCopy) {
        introCopy.style.opacity = (1 - range(introP, .42, .9)).toFixed(3);
        introCopy.style.transform = `translate3d(0,${-introP * 70}px,0)`;
      }
      if (introSky) introSky.style.transform = `translate3d(0,${introP * -9}px,0) scale(${1.02 + introP * .018})`;
      if (gateway) {
        gateway.style.opacity = (1 - range(introP, .72, 1)).toFixed(3);
        gateway.style.transform = `translate3d(0,${introP * 35}px,0)`;
      }
    }

    if (!brochure || reduced) return;
    const brochureStart = brochure.offsetTop;
    const brochureMax = Math.max(1, brochure.offsetHeight - window.innerHeight);
    const p = clamp((scrollY - brochureStart) / brochureMax);

    const horizonToRoute = range(p, .12, .32);
    const routeToTrace = range(p, .62, .78);
    let currentPath = interpolatePath(horizon, route, horizonToRoute);
    if (routeToTrace > 0) currentPath = interpolatePath(route, trace, routeToTrace);
    line?.setAttribute('d', currentPath);
    lineShadow?.setAttribute('d', currentPath);

    let draw = 1;
    if (p >= .62) draw = range(p, .66, .82);
    [line, lineShadow].forEach((path) => {
      if (!path) return;
      path.style.strokeDasharray = '1';
      path.style.strokeDashoffset = String(1 - draw);
    });

    if (handoffAnchor) {
      const anchorT = ease(horizonToRoute);
      handoffAnchor.setAttribute('cx', mix(horizon[0], route[0], anchorT));
      handoffAnchor.setAttribute('cy', mix(horizon[1], route[1], anchorT));
      handoffAnchor.style.opacity = fadeWindow(p, .06, .14, .37).toFixed(3);
      handoffAnchor.setAttribute('r', mix(5, 8, range(p, .1, .28)).toFixed(2));
    }

    const mapIn = range(p, .13, .26);
    const mapOut = range(p, .47, .62);
    const mapOpacity = mapIn * (1 - mapOut);
    setOpacity(mapArt, mapOpacity);
    setOpacity(mapGrid, mapOpacity * .8);
    if (mapArt) mapArt.style.transform = `translate3d(${mix(42, 0, ease(mapIn))}px,0,0) scale(${mix(.92, 1.08, ease(mapOut))})`;

    const routeReveal = range(p, .22, .42) * (1 - range(p, .52, .63));
    setOpacity(routeNodes, routeReveal);
    setNodeReveal(routeNodes, range(p, .23, .42));

    const placesIn = range(p, .43, .54);
    const placesOut = range(p, .6, .68);
    setOpacity(placesLayer, placesIn * (1 - placesOut));
    document.querySelectorAll('.place').forEach((place, index) => {
      const reveal = range(p, .44 + index * .025, .535 + index * .035);
      place.style.clipPath = `circle(${reveal * 74}% at ${index === 1 ? 35 : 58}% ${index === 2 ? 64 : 48}%)`;
      place.style.transform = `translate3d(0,${mix(35, 0, ease(reveal))}px,0)`;
    });

    const traceIn = range(p, .66, .79);
    const traceOut = range(p, .89, .95);
    setOpacity(timeNodes, traceIn * (1 - traceOut));
    setNodeReveal(timeNodes, range(p, .7, .84));

    const memoryIn = range(p, .7, .82);
    const memoryOut = range(p, .89, .95);
    setOpacity(memoryLayer, memoryIn * (1 - memoryOut));
    document.querySelectorAll('.memory-card').forEach((card, index) => {
      const reveal = range(p, .72 + index * .035, .79 + index * .04);
      card.style.opacity = (reveal * (1 - memoryOut)).toFixed(3);
      card.style.transform = `translate3d(0,${mix(35, 0, ease(reveal))}px,0) rotate(var(--r))`;
    });

    const sceneWeights = [
      fadeWindow(p, 0, .035, .19),
      fadeWindow(p, .13, .265, .44),
      fadeWindow(p, .39, .51, .67),
      fadeWindow(p, .61, .74, .9)
    ];
    sceneCopies.forEach((copy, index) => {
      const opacity = sceneWeights[index];
      copy.style.opacity = opacity.toFixed(3);
      copy.style.transform = `translate3d(0,${mix(28, 0, ease(opacity))}px,0)`;
    });

    const scene = p < .19 ? 0 : p < .43 ? 1 : p < .66 ? 2 : 3;
    if (scene !== lastScene) {
      lastScene = scene;
      if (sceneCurrent) sceneCurrent.textContent = String(scene + 1).padStart(2, '0');
      if (caption) caption.innerHTML = `<span>${sceneNames[scene][0]}</span><b>${sceneNames[scene][1]}</b>`;
    }
    if (sceneProgress) sceneProgress.style.transform = `scaleY(${p})`;

    setOpacity(day, range(p, .15, .31) * (1 - range(p, .62, .75)));
    setOpacity(dawn, 1 - range(p, .1, .3));
    const sunsetIn = range(p, .67, .87);
    setOpacity(sunset, sunsetIn);
    setOpacity(sunOrb, range(p, .77, .91));
    if (sunOrb) sunOrb.style.transform = `translate3d(0,${mix(-90, 5, range(p, .77, 1))}px,0)`;

    const hold = range(p, .91, .975);
    setOpacity(sunsetHold, hold);
    if (sunsetHold) {
      sunsetHold.style.pointerEvents = hold > .9 ? 'auto' : 'none';
      sunsetHold.style.transform = `translate3d(0,${mix(22, 0, ease(hold))}px,0)`;
    }
    setOpacity(line, 1 - range(p, .88, .95));
    setOpacity(lineShadow, 1 - range(p, .86, .94));
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { once: true });
  update();
})();
