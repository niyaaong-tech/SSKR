(() => {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(clamp(t) - 1, 3) + c1 * Math.pow(clamp(t) - 1, 2);
  };
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const fadeWindow = (value, start, peak, end) => {
    if (value <= peak) return range(value, start, peak);
    return 1 - range(value, peak, end);
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageProgress = document.querySelector('#pageProgress');
  const frameNumber = document.querySelector('#frameNumber');
  const framePhase = document.querySelector('#framePhase');
  const header = document.querySelector('#siteHeader');
  const intro = document.querySelector('#intro');
  const introSky = document.querySelector('.intro-sky');
  const introGrain = document.querySelector('.intro-grain');
  const introMeta = document.querySelector('.intro-meta');
  const introCopy = document.querySelector('#introCopy');
  const introHandoffCopy = document.querySelector('#introHandoffCopy');
  const introHandoffTrack = document.querySelector('.intro-handoff-line');
  const introHandoffLine = document.querySelector('#introHandoffLine');
  const introHandoffSunMask = document.querySelector('.intro-handoff-sun-mask');
  const introHandoffSun = document.querySelector('#introHandoffSun');
  const gateway = document.querySelector('#gateway');
  const introCue = document.querySelector('.intro-scroll-cue');
  const brochure = document.querySelector('#journey');
  const brochureStage = document.querySelector('#brochureStage');
  const journeySvg = document.querySelector('#journeySvg');
  const line = document.querySelector('#journeyLine');
  const lineShadow = document.querySelector('#journeyLineShadow');
  const traceBaseline = document.querySelector('#traceBaseline');
  const handoffAnchor = document.querySelector('#handoffAnchor');
  const mapArt = document.querySelector('#mapArt');
  const mapGrid = document.querySelector('.map-grid');
  const seaLabels = [...document.querySelectorAll('.sea-label')];
  const routeNodes = document.querySelector('#routeNodes');
  const placesLayer = document.querySelector('#placesLayer');
  const memoryLayer = document.querySelector('#memoryLayer');
  const memoryCards = [...document.querySelectorAll('.memory-card')];
  const cardConnectors = document.querySelector('#cardConnectors');
  const connectorLines = [...document.querySelectorAll('[data-connector]')];
  const sceneCopies = [...document.querySelectorAll('.scene-copy')];
  const firstLightStamp = document.querySelector('#firstLightStamp');
  const sceneCurrent = document.querySelector('#sceneCurrent');
  const sceneProgress = document.querySelector('#sceneProgress');
  const sunsetHold = document.querySelector('#sunsetHold');
  const dawn = document.querySelector('.sky-dawn');
  const day = document.querySelector('.sky-day');
  const sunset = document.querySelector('.sky-sunset');
  const sunOrb = document.querySelector('.sun-orb');
  const storyIndex = document.querySelector('#storyIndex');
  const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
  const footer = document.querySelector('#footer');
  const photoHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let expandedCard = null;

  const collapseExpandedPhoto = () => {
    if (!expandedCard) return;
    const card = expandedCard;
    expandedCard = null;
    card.classList.remove('is-photo-expanded');
    card.classList.add('is-photo-returning');
  };

  memoryCards.forEach((card) => {
    const photo = card.querySelector('div');
    card.addEventListener('pointerenter', () => {
      if (!photoHover.matches || Number.parseFloat(getComputedStyle(card).opacity) < .75) return;
      collapseExpandedPhoto();
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      card.style.setProperty('--photo-origin-x', centerX < innerWidth * .34 ? '0%' : centerX > innerWidth * .66 ? '100%' : '50%');
      card.style.setProperty('--photo-origin-y', centerY < innerHeight * .5 ? '0%' : '100%');
      card.classList.remove('is-photo-returning');
      card.classList.add('is-photo-expanded');
      expandedCard = card;
    });
    card.addEventListener('pointerleave', collapseExpandedPhoto);
    photo?.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform' && !card.classList.contains('is-photo-expanded')) {
        card.classList.remove('is-photo-returning');
      }
    });
  });

  const horizon = [830,370,700,370,570,370,440,370,310,370,180,370,90,370,40,370];
  const horizonStops = [1,.84,.7,.56,.42,.28,.14,0];
  // CSV canonical coordinates projected through the page's final south-Korea map zoom.
  const routeSpots = [[899.442,182.284],[804.099,253.671],[730.334,257.588],[731.33,325.075],[709.74,358.421],[663.859,390.734],[583.752,522.783],[550.248,518.552]];
  const traceSpots = [[870,330],[760,330],[650,330],[540,330],[430,330],[320,330],[210,330],[100,330]];
  const route = routeSpots.flat();
  const trace = traceSpots.flat();
  // Pixel anchors measured from hero-sunrise-drawing-v01.png. Desktop
  // overlays must be projected through the same cover transform as the image.
  const heroImage = { width: 1672, height: 941, horizonY: 761, sunX: 1297, sunY: 718 };
  const sunsetImage = { width: 1672, height: 941, horizonY: 666 };
  const pathFrom = (values) => values.reduce((path, value, index) => {
    if (index % 2) return path;
    return `${path}${index === 0 ? 'M' : ' L'}${value} ${values[index + 1]}`;
  }, '');
  const interpolatePath = (from, to, amount) => pathFrom(from.map((value, index) => mix(value, to[index], ease(amount))));
  const getViewportHorizon = () => {
    if (!journeySvg) return horizon;
    const svgRect = journeySvg.getBoundingClientRect();
    const viewBox = journeySvg.viewBox.baseVal;
    const svgScale = Math.min(svgRect.width / viewBox.width, svgRect.height / viewBox.height);
    if (!svgScale) return horizon;
    const contentLeft = svgRect.left + (svgRect.width - viewBox.width * svgScale) / 2;
    const viewLeft = -contentLeft / svgScale;
    const viewRight = (window.innerWidth - contentLeft) / svgScale;
    return horizonStops.flatMap((stop) => [mix(viewLeft, viewRight, stop), 370]);
  };
  const setOpacity = (element, value) => { if (element) element.style.opacity = clamp(value).toFixed(3); };
  const setNodeReveal = (group, amount) => {
    if (!group) return;
    const nodes = [...group.children];
    nodes.forEach((node, index) => {
      const nodeProgress = range(amount, index / nodes.length, Math.min(1, (index + 1.15) / nodes.length));
      node.style.opacity = nodeProgress.toFixed(3);
    });
  };

  // Keep the editorial frame numbers stable while giving the finale more
  // physical scroll distance. The last 4% of the motion timeline occupies
  // 12.3% of the brochure scroll, roughly tripling the sunset hold.
  const timelineFinalStart = .96;
  const physicalFinalStart = .877;
  const timelineFromPhysical = (physicalProgress) => {
    const progress = clamp(physicalProgress);
    return progress <= physicalFinalStart
      ? progress * (timelineFinalStart / physicalFinalStart)
      : timelineFinalStart + (progress - physicalFinalStart) * ((1 - timelineFinalStart) / (1 - physicalFinalStart));
  };
  const physicalFromTimeline = (timelineProgress) => {
    const progress = clamp(timelineProgress);
    return progress <= timelineFinalStart
      ? progress * (physicalFinalStart / timelineFinalStart)
      : physicalFinalStart + (progress - timelineFinalStart) * ((1 - physicalFinalStart) / (1 - timelineFinalStart));
  };
  const getFrameLayout = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const brochureStart = brochure?.offsetTop ?? 0;
    const brochureMax = brochure ? Math.max(1, brochure.offsetHeight - window.innerHeight) : 1;
    const brochureEnd = brochureStart + brochureMax;
    return { scrollable, brochureStart, brochureMax, brochureEnd };
  };
  const frameFromScroll = (scrollY) => {
    const { scrollable, brochureStart, brochureMax, brochureEnd } = getFrameLayout();
    if (scrollY <= brochureStart) return mix(0, 150, clamp(scrollY / Math.max(1, brochureStart)));
    if (scrollY <= brochureEnd) return mix(150, 850, clamp((scrollY - brochureStart) / brochureMax));
    return mix(850, 900, clamp((scrollY - brochureEnd) / Math.max(1, scrollable - brochureEnd)));
  };
  const scrollFromFrame = (frame) => {
    const { scrollable, brochureStart, brochureMax, brochureEnd } = getFrameLayout();
    const targetFrame = clamp(frame, 0, 900);
    if (targetFrame <= 150) return brochureStart * (targetFrame / 150);
    if (targetFrame <= 850) return brochureStart + brochureMax * ((targetFrame - 150) / 700);
    return brochureEnd + (scrollable - brochureEnd) * ((targetFrame - 850) / 50);
  };

  const chapterDefinitions = [
    { key: 'home', frame: 0 },
    { key: 'sunrise', frame: 140 },
    { key: 'crossing', progress: .16 },
    { key: 'route', frame: 410 },
    { key: 'checkin', progress: .625 },
    { key: 'complete', frame: 840 }
  ];
  const getChapterTargets = () => {
    const { brochureStart, brochureMax } = getFrameLayout();
    return chapterDefinitions.map((chapter) => ({
      ...chapter,
      target: chapter.frame !== undefined
        ? scrollFromFrame(chapter.frame)
        : brochureStart + brochureMax * physicalFromTimeline(chapter.progress)
    }));
  };
  const syncStoryIndex = (scrollY) => {
    if (!storyIndex) return;
    const targets = getChapterTargets();
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let activeIndex = 0;
    targets.forEach((chapter, index) => {
      if (scrollY >= chapter.target - 2) activeIndex = index;
    });
    chapterButtons.forEach((button, index) => {
      const active = index === activeIndex;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    storyIndex.classList.toggle('is-outside', footer ? scrollY >= footer.offsetTop - window.innerHeight * .2 : false);
  };

  let indexTravelling = false;
  let indexAnimation = 0;
  const travelTo = (target) => {
    if (indexTravelling) return;
    const start = window.scrollY || document.documentElement.scrollTop;
    const distance = target - start;
    const duration = reduced ? 0 : clamp(Math.abs(distance) * .24, 760, 1500) * 3;
    const startedAt = performance.now();
    indexTravelling = true;
    storyIndex?.classList.add('is-travelling');
    storyIndex?.setAttribute('aria-busy', 'true');
    document.documentElement.classList.add('is-story-travelling');
    chapterButtons.forEach((button) => { button.disabled = true; });
    const finish = () => {
      indexTravelling = false;
      storyIndex?.classList.remove('is-travelling');
      storyIndex?.removeAttribute('aria-busy');
      document.documentElement.classList.remove('is-story-travelling');
      chapterButtons.forEach((button) => { button.disabled = false; });
      syncStoryIndex(window.scrollY || document.documentElement.scrollTop);
    };
    if (!duration) {
      window.scrollTo(0, target);
      finish();
      return;
    }
    cancelAnimationFrame(indexAnimation);
    const animate = (now) => {
      const t = clamp((now - startedAt) / duration);
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, start + distance * eased);
      if (t < 1) indexAnimation = requestAnimationFrame(animate);
      else finish();
    };
    indexAnimation = requestAnimationFrame(animate);
  };
  chapterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (indexTravelling) return;
      const chapter = getChapterTargets().find((item) => item.key === button.dataset.chapter);
      if (chapter) travelTo(chapter.target);
    });
  });

  let ticking = false;
  let lastScene = -1;
  const update = () => {
    ticking = false;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const currentFrame = frameFromScroll(scrollY);
    if (pageProgress) pageProgress.style.transform = `scaleX(${scrollY / scrollable})`;
    if (frameNumber) frameNumber.textContent = String(Math.round(currentFrame)).padStart(3, '0');
    header?.classList.toggle('is-scrolled', scrollY > 20);
    syncStoryIndex(scrollY);

    if (intro && !reduced) {
      const introMax = Math.max(1, intro.offsetHeight - window.innerHeight);
      const introP = clamp((scrollY - intro.offsetTop) / introMax);
      const headlineOut = range(introP, .18, .43);
      const horizonLift = ease(range(introP, .3, .48));
      const lineReveal = ease(range(introP, .48, .68));
      const handoffCopyIn = ease(range(introP, .7, .84));
      const imageFade = ease(range(introP, .68, .94));
      const skyWidth = introSky?.offsetWidth || window.innerWidth;
      const skyHeight = introSky?.offsetHeight || window.innerHeight;
      const skyTop = introSky?.getBoundingClientRect().top || 0;
      const coverScale = Math.max(skyWidth / heroImage.width, skyHeight / heroImage.height);
      const imageWidth = heroImage.width * coverScale;
      const imageHeight = heroImage.height * coverScale;
      const imageLeft = (skyWidth - imageWidth) / 2;
      const centeredImageTop = (skyHeight - imageHeight) / 2;
      const targetHorizon = introHandoffTrack?.getBoundingClientRect().top ?? skyTop + skyHeight * .5416;
      const targetHorizonLocal = targetHorizon - skyTop;
      const alignedImageTop = targetHorizonLocal - heroImage.horizonY * coverScale;
      const imageTop = mix(centeredImageTop, alignedImageTop, horizonLift);
      const visibleHorizon = imageTop + heroImage.horizonY * coverScale;
      const projectedSunX = imageLeft + heroImage.sunX * coverScale;
      const projectedSunY = imageTop + heroImage.sunY * coverScale;
      const visibleSeaHeight = Math.max(1, skyHeight - visibleHorizon);
      // Keep the original sea continuous below the animated horizon. The
      // vertical remap expands only the photograph's sea slice; it must never
      // be substituted with an unrelated color or gradient layer.
      const seaImageHeight = visibleSeaHeight * heroImage.height / (heroImage.height - heroImage.horizonY);
      if (framePhase) framePhase.textContent = introP < .45 ? 'INTRO' : introP < .7 ? 'HORIZON DRAW' : 'HANDOFF';
      if (introCopy) {
        introCopy.style.opacity = (1 - headlineOut).toFixed(3);
        introCopy.style.transform = `translate3d(0,${mix(0, -28, ease(headlineOut))}px,0)`;
      }
      if (introSky) {
        introSky.style.opacity = (1 - imageFade).toFixed(3);
        introSky.style.backgroundPosition = `center center, center center, center ${imageTop.toFixed(2)}px`;
        introSky.style.setProperty('--intro-horizon-y', `${visibleHorizon.toFixed(2)}px`);
        introSky.style.setProperty('--intro-image-width', `${imageWidth.toFixed(2)}px`);
        introSky.style.setProperty('--intro-image-height', `${imageHeight.toFixed(2)}px`);
        introSky.style.setProperty('--intro-sea-image-height', `${seaImageHeight.toFixed(2)}px`);
      }
      setOpacity(introGrain, mix(.15, .08, imageFade));
      setOpacity(introMeta, 1 - range(introP, .28, .55));
      if (introHandoffLine) {
        introHandoffLine.style.opacity = lineReveal.toFixed(3);
        introHandoffLine.style.transform = `scaleX(${lineReveal})`;
      }
      if (introHandoffSun) {
        const sunRise = ease(range(currentFrame, 110, 132));
        const sunFade = range(currentFrame, 140, 160);
        introHandoffSun.style.opacity = (sunRise * (1 - sunFade)).toFixed(3);
        if (introHandoffSunMask && window.innerWidth > 900) {
          // Keep the synthetic sunrise centered on the photograph's sun at
          // every desktop aspect ratio instead of using a viewport percentage.
          const maskHeight = introHandoffSunMask.offsetHeight;
          const sunSize = introHandoffSun.offsetWidth;
          const finalTranslateY = projectedSunY - visibleHorizon + sunSize / 2;
          introHandoffSunMask.style.left = `${projectedSunX.toFixed(2)}px`;
          introHandoffSunMask.style.top = `${(visibleHorizon - maskHeight).toFixed(2)}px`;
          introHandoffSun.style.transform = `translate3d(0,${mix(sunSize, finalTranslateY, sunRise).toFixed(2)}px,0)`;
        } else {
          introHandoffSun.style.transform = `translate3d(0,${mix(100, 30, sunRise).toFixed(2)}%,0)`;
        }
      }
      if (introHandoffCopy) {
        introHandoffCopy.style.opacity = handoffCopyIn.toFixed(3);
        introHandoffCopy.style.transform = `translate3d(0,${mix(38, 0, handoffCopyIn)}px,0)`;
      }
      if (gateway) {
        const gatewayOut = range(introP, .24, .5);
        gateway.style.opacity = (1 - gatewayOut).toFixed(3);
        gateway.style.transform = `translate3d(0,${mix(0, 28, gatewayOut)}px,0)`;
      }
      setOpacity(introCue, 1 - range(introP, .03, .24));
    }

    if (!brochure || reduced) return;
    const brochureStart = brochure.offsetTop;
    const brochureMax = Math.max(1, brochure.offsetHeight - window.innerHeight);
    const physicalP = clamp((scrollY - brochureStart) / brochureMax);
    const p = timelineFromPhysical(physicalP);
    if (brochureStage) brochureStage.style.opacity = scrollY >= brochureStart ? '1' : '0';

    const mobileCompositionShift = window.innerWidth <= 900
      ? -window.innerWidth * .18
        * ease(range(p, .32, .36))
        * (1 - ease(range(p, .5, .58)))
      : 0;
    if (journeySvg) journeySvg.style.transform = `translate3d(${mobileCompositionShift.toFixed(2)}px,0,0)`;

    const horizonToRoute = range(p, 0, .14);
    const routeToTrace = range(p, .52, .64);
    const traceBaselineIn = range(currentFrame, 545, 559);
    const viewportHorizon = getViewportHorizon();
    let currentPath = interpolatePath(viewportHorizon, route, horizonToRoute);
    if (routeToTrace > 0) currentPath = interpolatePath(route, trace, routeToTrace);
    line?.setAttribute('d', currentPath);
    lineShadow?.setAttribute('d', currentPath);

    if (introHandoffTrack && journeySvg && line) {
      const svgRect = journeySvg.getBoundingClientRect();
      const viewBox = journeySvg.viewBox.baseVal;
      const pathBox = line.getBBox();
      const svgScale = Math.min(svgRect.width / viewBox.width, svgRect.height / viewBox.height);
      const contentLeft = svgRect.left + (svgRect.width - viewBox.width * svgScale) / 2;
      introHandoffTrack.style.left = `${contentLeft + pathBox.x * svgScale}px`;
      introHandoffTrack.style.right = 'auto';
      introHandoffTrack.style.width = `${pathBox.width * svgScale}px`;
    }

    const draw = 1;
    [line, lineShadow].forEach((path) => {
      if (!path) return;
      path.style.strokeDasharray = '1';
      path.style.strokeDashoffset = String(1 - draw);
    });

    if (handoffAnchor) {
      const anchorT = ease(horizonToRoute);
      handoffAnchor.setAttribute('cx', mix(viewportHorizon[0], route[0], anchorT));
      handoffAnchor.setAttribute('cy', mix(viewportHorizon[1], route[1], anchorT));
      handoffAnchor.style.opacity = fadeWindow(p, .03, .1, .22).toFixed(3);
      handoffAnchor.setAttribute('r', mix(5, 8, range(p, .06, .18)).toFixed(2));
    }

    const mapIn = range(p, .015, .085);
    const southZoom = range(p, .045, .18);
    const mapOut = range(p, .5, .64);
    const mapOpacity = mapIn * (1 - mapOut) * mix(1, .62, ease(southZoom));
    setOpacity(mapArt, mapOpacity);
    setOpacity(mapGrid, mapOpacity * .8);
    const seaLabelFade = range(p, .36, .4);
    seaLabels.forEach((label) => setOpacity(label, 1 - seaLabelFade));
    if (mapArt) mapArt.style.transform = `translate3d(${mix(42, -70, ease(southZoom))}px,0,0) scale(${mix(.92, 3.15, ease(southZoom))})`;

    const routeReveal = range(p, .2, .34);
    const nodeOut = range(currentFrame, 770, 805);
    setOpacity(traceBaseline, traceBaselineIn * (1 - nodeOut));
    setOpacity(routeNodes, routeReveal * (1 - nodeOut));
    const placesIn = range(p, .36, .43);
    const placesOut = range(p, .51, .58);
    setOpacity(placesLayer, placesIn * (1 - placesOut));
    document.querySelectorAll('.place').forEach((place, index) => {
      const reveal = range(p, .37 + index * .014, .43 + index * .014);
      place.style.clipPath = `circle(${(ease(reveal) * 50).toFixed(2)}% at 50% 50%)`;
      place.style.transform = `translate3d(0,${mix(24, 0, ease(reveal))}px,0)`;
    });
    const routeNodeElements = routeNodes ? [...routeNodes.children] : [];
    routeNodeElements.forEach((node, index) => {
      const nodeReveal = range(p, .2 + index * .012, .27 + index * .012);
      const eventReveal = range(p, .61 + index * .012, .655 + index * .012);
      const memoryRecall = range(p, .8 + index * .012, .84 + index * .012);
      const elastic = easeOutBack(eventReveal);
      const x = mix(routeSpots[index][0], traceSpots[index][0], ease(routeToTrace));
      const y = mix(routeSpots[index][1], traceSpots[index][1], ease(routeToTrace)) - mix(0, 72, ease(nodeOut));
      node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      node.style.opacity = (nodeReveal * (1 - nodeOut)).toFixed(3);
      node.querySelectorAll('circle').forEach((circle) => {
        const eventScale = mix(1, 2, elastic);
        circle.style.transform = `scale(${mix(eventScale, 1.25, ease(memoryRecall)).toFixed(3)})`;
      });
      const routePlace = node.querySelector('.route-place');
      const tracePlace = node.querySelector('.trace-place');
      const arrival = node.querySelector('.arrival');
      const memoryLabel = node.querySelector('.memory-label');
      if (routePlace) {
        const labelMove = ease(routeToTrace);
        routePlace.setAttribute('x', mix(-24, 0, labelMove).toFixed(2));
        routePlace.setAttribute('y', mix(-14, 28, labelMove).toFixed(2));
        routePlace.setAttribute('text-anchor', 'middle');
        routePlace.style.opacity = ((1 - memoryRecall) * (1 - nodeOut)).toFixed(3);
      }
      if (tracePlace) {
        tracePlace.style.opacity = '1';
        const duplicatePlace = tracePlace.querySelector('tspan:not(.arrival)');
        if (duplicatePlace) duplicatePlace.style.opacity = '0';
      }
      if (arrival) arrival.style.opacity = (eventReveal * (1 - memoryRecall)).toFixed(3);
      if (memoryLabel) memoryLabel.style.opacity = (memoryRecall * (1 - nodeOut)).toFixed(3);
    });

    const cardRevealStart = .625;
    const cardRevealStep = .012;
    const cardRevealDuration = .045;
    const memoryIn = range(p, .61, .66);
    setOpacity(memoryLayer, memoryIn);
    setOpacity(cardConnectors, memoryIn);
    const svgMatrix = journeySvg?.getScreenCTM();
    memoryCards.forEach((card, index) => {
      const revealStart = cardRevealStart + index * cardRevealStep;
      const reveal = range(p, revealStart, revealStart + cardRevealDuration);
      const memoryRecall = range(p, .8 + index * .012, .84 + index * .012);
      let recallX = 0;
      let recallY = 0;
      if (journeySvg && svgMatrix) {
        const point = journeySvg.createSVGPoint();
        point.x = traceSpots[index][0];
        point.y = traceSpots[index][1];
        const nodePoint = point.matrixTransform(svgMatrix);
        recallX = nodePoint.x - (card.offsetLeft + card.offsetWidth / 2);
        recallY = nodePoint.y - (card.offsetTop + card.offsetHeight / 2);
      }
      const recallEase = ease(memoryRecall);
      const revealX = mix(24, 0, ease(reveal));
      const revealY = mix(18, 0, ease(reveal));
      card.style.opacity = (reveal * (1 - recallEase)).toFixed(3);
      card.style.transform = `translate3d(${(revealX + recallX * recallEase).toFixed(2)}px,${(revealY + recallY * recallEase).toFixed(2)}px,0) rotate(var(--r)) scale(${mix(mix(.88, 1, easeOutBack(reveal)), .16, recallEase).toFixed(3)})`;
    });

    if (journeySvg && connectorLines.length) {
      const svgPoint = journeySvg.createSVGPoint();
      connectorLines.forEach((connector, index) => {
        const card = memoryCards[index];
        if (!card || !svgMatrix) return;
        const x = mix(routeSpots[index][0], traceSpots[index][0], ease(routeToTrace));
        const y = mix(routeSpots[index][1], traceSpots[index][1], ease(routeToTrace));
        svgPoint.x = x;
        svgPoint.y = y;
        const nodePoint = svgPoint.matrixTransform(svgMatrix);
        const cardRect = card.getBoundingClientRect();
        const cardAbove = cardRect.bottom < nodePoint.y;
        connector.setAttribute('x1', ((nodePoint.x / window.innerWidth) * 1000).toFixed(2));
        connector.setAttribute('y1', ((nodePoint.y / window.innerHeight) * 700).toFixed(2));
        connector.setAttribute('x2', (((cardRect.left + cardRect.width / 2) / window.innerWidth) * 1000).toFixed(2));
        connector.setAttribute('y2', ((((cardAbove ? cardRect.bottom : cardRect.top)) / window.innerHeight) * 700).toFixed(2));
        const revealStart = cardRevealStart + index * cardRevealStep;
        const reveal = range(p, revealStart, revealStart + cardRevealDuration);
        const memoryRecall = range(p, .8 + index * .012, .84 + index * .012);
        connector.style.opacity = (reveal * (1 - ease(memoryRecall))).toFixed(3);
        connector.style.strokeDashoffset = (1 - ease(reveal)).toFixed(3);
      });
    }

    const sceneWeights = [
      1 - range(p, .06, .14),
      fadeWindow(p, .08, .16, .36),
      fadeWindow(p, .36, .405, .56),
      fadeWindow(p, .54, .61, .73)
    ];
    sceneCopies.forEach((copy, index) => {
      const opacity = sceneWeights[index];
      copy.style.opacity = opacity.toFixed(3);
      copy.style.transform = `translate3d(0,${mix(28, 0, ease(opacity))}px,0)`;
    });
    if (firstLightStamp) firstLightStamp.style.opacity = sceneWeights[0].toFixed(3);

    const scene = p < .12 ? 0 : p < .36 ? 1 : p < .54 ? 2 : currentFrame < 805 ? 3 : 4;
    if (scene !== lastScene) {
      lastScene = scene;
      if (sceneCurrent) sceneCurrent.textContent = String(scene + 1).padStart(2, '0');
    }
    if (sceneProgress) sceneProgress.style.transform = `scaleY(${p})`;
    if (framePhase) {
      framePhase.textContent = currentFrame >= 805 ? 'SUNSET HOLD' : currentFrame >= 770 ? 'MEMORY EXIT' : p < .01 ? 'HORIZON' : p < .18 ? 'MAP + ROUTE' : p < .52 ? 'MY ROUTE' : p < .6 ? 'STRAIGHTEN' : p < .8 ? 'SPOT CHECK-IN' : 'MEMORY RECALL';
    }

    setOpacity(day, range(p, .08, .2) * (1 - range(p, .54, .68)));
    setOpacity(dawn, 1 - range(p, .06, .2));
    const sunsetIn = range(p, .56, .72);
    setOpacity(sunset, sunsetIn);
    const sunIn = range(p, .69, .75);
    const sunDrop = range(p, .72, .995);
    setOpacity(sunOrb, sunIn * (1 - range(p, .995, 1)));
    if (sunOrb) {
      sunOrb.style.transform = `translate3d(0,${mix(-55, 310, ease(sunDrop))}px,0)`;
      const sunRect = sunOrb.getBoundingClientRect();
      const sunsetRect = sunset?.getBoundingClientRect();
      const sunsetWidth = sunsetRect?.width || window.innerWidth;
      const sunsetHeight = sunsetRect?.height || window.innerHeight;
      const sunsetScale = Math.max(sunsetWidth / sunsetImage.width, sunsetHeight / sunsetImage.height);
      const sunsetTop = sunsetRect?.top || 0;
      const horizonY = sunsetTop
        + (sunsetHeight - sunsetImage.height * sunsetScale) / 2
        + sunsetImage.horizonY * sunsetScale;
      const visibleHeight = clamp((horizonY - sunRect.top) / Math.max(1, sunRect.height));
      sunOrb.style.clipPath = `inset(0 0 ${(1 - visibleHeight) * 100}% 0)`;
    }

    const hold = range(currentFrame, 805, 845);
    setOpacity(sunsetHold, hold);
    if (sunsetHold) {
      sunsetHold.style.pointerEvents = hold > .9 ? 'auto' : 'none';
      sunsetHold.style.transform = `translate3d(0,${mix(22, 0, ease(hold))}px,0)`;
    }
    setOpacity(line, 1 - ease(traceBaselineIn));
    setOpacity(lineShadow, 0);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', () => {
    collapseExpandedPhoto();
    requestUpdate();
  }, { passive: true });
  window.addEventListener('wheel', collapseExpandedPhoto, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { once: true });
  update();
})();
