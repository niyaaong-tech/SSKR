(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('#siteHeader');
  const pageProgress = document.querySelector('#pageProgress');
  const heroJourney = document.querySelector('#heroJourney');
  const journeyStage = document.querySelector('#journeyStage');
  const journeyRoute = document.querySelector('#journeyRoute');

  const updateScrollState = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header?.classList.toggle('is-scrolled', y > 18);

    if (pageProgress) {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      pageProgress.style.transform = `scaleX(${Math.min(1, y / scrollable)})`;
    }

    if (!prefersReduced && heroJourney && y < window.innerHeight * 1.1) {
      heroJourney.style.transform = `translate3d(0, ${Math.min(34, y * 0.04)}px, 0)`;
    }

    if (journeyStage && journeyRoute) {
      const rect = journeyStage.getBoundingClientRect();
      const start = window.innerHeight * 0.78;
      const end = -rect.height * 0.22;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const length = journeyRoute.getTotalLength();
      journeyRoute.style.strokeDasharray = `${length}`;
      journeyRoute.style.strokeDashoffset = `${length * (1 - progress)}`;
    }
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });
  updateScrollState();

  const reveals = [...document.querySelectorAll('.reveal')];
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => observer.observe(el));
  }

  const spotData = {
    scenery: {
      name: '충주호 전망 스팟',
      meta: 'SCENERY · B CLASS · DETOUR +35MIN',
      description: '중간 지점을 통과하는 시간이 목적지로 바뀌는 곳. 잠시 멈춰 오늘의 경로를 다시 바라본다.',
      image: 'https://images.unsplash.com/photo-1768410318055-e37e9a919ddf?auto=format&fit=crop&w=1200&q=80'
    },
    culture: {
      name: '문경 옛길',
      meta: 'HISTORY / CULTURE · B CLASS · DETOUR +25MIN',
      description: '산을 넘는 오래된 길과 지금의 도로가 만나는 장소. 횡단의 시간감각을 가장 직접적으로 느끼는 스팟.',
      image: 'https://images.unsplash.com/photo-1641431722064-a797ebfdb22e?auto=format&fit=crop&w=1200&q=80'
    },
    food: {
      name: '지역 시장 스팟',
      meta: 'FOOD / LOCAL LIFE · C CLASS · DETOUR +15MIN',
      description: '잠깐의 정차가 지역의 냄새와 온도를 기억하게 만든다. 빠른 통과보다 한 번 더 멈추는 이유.',
      image: 'https://images.unsplash.com/photo-1770614956862-a143fb5e4921?auto=format&fit=crop&w=1200&q=80'
    },
    rider: {
      name: '라이더 허브',
      meta: 'RIDER HUB · C CLASS · DETOUR +10MIN',
      description: '혼자 출발했어도 누군가와 잠시 같은 방향을 공유하는 장소. 주유, 휴식, 정보 교환을 함께 해결한다.',
      image: 'https://images.unsplash.com/photo-1763190521026-376ea2521d7b?auto=format&fit=crop&w=1200&q=80'
    }
  };

  const filters = [...document.querySelectorAll('.spot-filter')];
  const featureImage = document.querySelector('#spotFeatureImage');
  const featureMeta = document.querySelector('#spotMeta');
  const featureName = document.querySelector('#spotName');
  const featureDescription = document.querySelector('#spotDescription');

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.spot;
      const data = spotData[key];
      if (!data) return;

      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });

      if (featureImage) featureImage.style.backgroundImage = `url('${data.image}')`;
      if (featureMeta) featureMeta.textContent = data.meta;
      if (featureName) featureName.textContent = data.name;
      if (featureDescription) featureDescription.textContent = data.description;
    });
  });

  const saveButton = document.querySelector('.save-spot');
  saveButton?.addEventListener('click', () => {
    const saved = saveButton.classList.toggle('is-saved');
    saveButton.innerHTML = saved
      ? '<span>✓</span> 관심 스팟에 저장됨'
      : '<span>＋</span> 관심 스팟 저장';
  });

  if (!prefersReduced && heroJourney) {
    const hero = document.querySelector('.hero');
    hero?.addEventListener('pointermove', (event) => {
      if (window.innerWidth < 900) return;
      const rect = hero.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      heroJourney.style.translate = `${nx * 9}px ${ny * 7}px`;
    });
    hero?.addEventListener('pointerleave', () => {
      heroJourney.style.translate = '0 0';
    });
  }
})();
