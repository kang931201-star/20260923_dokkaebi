// 고정 시드 난수 (새로고침해도 별 배치가 같게)
function seededRandom(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// 4갈래 반짝임 별 SVG
const SPARKLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.8 8.4 15.6 11.2 24 12C15.6 12.8 12.8 15.6 12 24C11.2 15.6 8.4 12.8 0 12C8.4 11.2 11.2 8.4 12 0Z"/></svg>';

// KV 밤하늘 별: 하늘 영역(상단)에만 작은 점 별 + 가끔 십자 반짝임 별
function renderStars() {
  const layer = document.getElementById('star-layer');
  if (!layer) return;
  const rand = seededRandom(7);
  const mobile = window.matchMedia('(max-width: 720px)').matches;
  const count = mobile ? 26 : 48;
  const skyBottom = mobile ? 34 : 44; // 하늘이 끝나는 대략적인 높이(%)
  const colors = ['#ffffff', '#e6dcff', '#fff3c4', '#cfe6ff'];
  for (let i = 0; i < count; i++) {
    const sparkle = i % 6 === 0;
    const s = document.createElement('span');
    s.className = sparkle ? 'hero-star hero-star--sparkle' : 'hero-star';
    const size = sparkle ? 10 + rand() * 8 : 1.5 + rand() * 2.5;
    s.style.width = s.style.height = size.toFixed(1) + 'px';
    s.style.top = (2 + rand() * skyBottom).toFixed(2) + '%';
    s.style.left = (2 + rand() * 96).toFixed(2) + '%';
    s.style.color = colors[Math.floor(rand() * colors.length)];
    s.style.animationDuration = (2.4 + rand() * 3).toFixed(2) + 's';
    s.style.animationDelay = (rand() * 4).toFixed(2) + 's';
    if (sparkle) s.innerHTML = SPARKLE_SVG;
    layer.appendChild(s);
  }
}

// 타이틀 이미지 위 반짝임: 빛 번짐(코어) + 가는 빛줄기 + 사방으로 튀는 불티 (위치·크기는 타이틀 이미지 기준 %)
function renderTitleGlints() {
  const title = document.querySelector('.hero-title-img');
  if (!title) return;
  const spots = [
    { x: 29, y: 25, size: 14, delay: 0 },
    { x: 77, y: 29, size: 11, delay: 1.2 },
    { x: 91, y: 45, size: 16, delay: 2.1 },
    { x: 13, y: 52, size: 12, delay: 3.0 },
    { x: 60, y: 13, size: 10, delay: 3.8 },
  ];
  const sparkColors = ['#fff4cf', '#ffd0ec', '#d4ecff', '#ffffff', '#e6d6ff', '#fff4cf'];
  const wrap = document.createElement('span');
  wrap.className = 'title-glints';
  wrap.setAttribute('aria-hidden', 'true');
  spots.forEach(({ x, y, size, delay }, i) => {
    const g = document.createElement('span');
    g.className = 'title-glint';
    g.style.left = x + '%';
    g.style.top = y + '%';
    g.style.width = size + '%';
    g.style.setProperty('--delay', (2.6 + delay) + 's');
    let html = '<i class="glint-core"></i><i class="glint-streak"></i><i class="glint-streak glint-streak--v"></i>';
    // 불티 6개: 매 반짝임마다 각도를 조금씩 비틀어 기계적으로 보이지 않게
    sparkColors.forEach((c, k) => {
      const angle = k * 60 + i * 17 + (k % 2 ? 12 : -8);
      const reach = k % 2 ? 78 : 92;
      html += '<i class="glint-ray" style="--a:' + angle + 'deg;--reach:' + reach + '%;--c:' + c + '"></i>';
    });
    g.innerHTML = html;
    wrap.appendChild(g);
  });
  title.appendChild(wrap);
}

// 히어로 인트로: KV 이미지가 준비되면 순서대로 등장 (최대 3초 대기)
function playHeroIntro() {
  const root = document.documentElement;
  if (!root.classList.contains('intro')) return;
  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    root.classList.add('intro-play');
    // 인트로가 끝나면 클래스를 걷어내 평소 상태로 (호버 후 CTA 인트로가 다시 재생되는 것 방지)
    setTimeout(() => root.classList.remove('intro', 'intro-play'), 3800);
  };
  const kv = document.querySelector('.hero-layer img');
  if (!kv || kv.complete) requestAnimationFrame(play);
  else {
    kv.addEventListener('load', play, { once: true });
    kv.addEventListener('error', play, { once: true });
  }
  setTimeout(play, 3000);
}

// 참여 방법 탭 전환
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      panels.forEach((p) => p.classList.toggle('active', p.dataset.tab === target));
    });
  });
}

// 누적플레이 두루마리: 화면에 들어오면 펼침
// 아래 섹션 지연 로딩: 히어로를 다 불러온 뒤(window load)부터, 섹션이 화면 600px 앞까지 오면
// 그 섹션의 배경(CSS)과 이미지(data-src / data-srcset)를 불러옴 → 첫 화면에서는 히어로만 받음
function initLazySections() {
  const root = document.documentElement;
  const sections = document.querySelectorAll('.section');
  const load = (section) => {
    section.classList.add('is-near');
    section.querySelectorAll('[data-srcset]').forEach((el) => {
      el.srcset = el.dataset.srcset;
      el.removeAttribute('data-srcset');
    });
    section.querySelectorAll('[data-src]').forEach((el) => {
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    });
  };
  if (!('IntersectionObserver' in window)) {
    sections.forEach(load);
    root.classList.remove('lazy-sections');
    return;
  }
  const start = () => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '600px 0px 600px 0px' });
    sections.forEach((el) => io.observe(el));
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

// 스크롤 등장: 각 섹션의 콘텐츠(.section-inner)가 화면에 들어오면 한 덩어리로 아래에서 천천히 떠오름
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.section > .section-inner');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      el.classList.add('is-revealed');
      // 등장이 끝나면 클래스를 걷어내 평소 상태로
      setTimeout(() => el.classList.remove('reveal', 'is-revealed'), 1200);
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  targets.forEach((el) => {
    el.classList.add('reveal');
    io.observe(el);
  });
}

function initScrollUnroll() {
  const card = document.querySelector('.reward-card');
  if (!card || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  card.classList.add('js-unroll');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      card.classList.add('is-unrolled');
      io.disconnect();
    });
  }, { threshold: 0.35 });
  io.observe(card);
}

// 헤더 실제 높이를 CSS 변수로 전달 (헤더+히어로 = 화면 높이)
function syncHeaderHeight() {
  const header = document.querySelector('.cb-header');
  if (!header) return;
  const update = () => {
    document.documentElement.style.setProperty('--header-actual', header.offsetHeight + 'px');
  };
  update();
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(header);
  else window.addEventListener('resize', update);
}

// 타이틀 블록을 KV의 대문 지붕 기준으로 배치
// KV(kv_new_01.png, 1920x1080)는 cover + 세로 88% 기준으로 깔리므로, 창 높이에 따라 대문 지붕의 화면상 위치가 바뀜.
// 지붕 위치를 계산해서 '프레임 상단 ~ 지붕' 사이 하늘의 가운데에 타이틀+버튼을 놓고, 공간이 모자랄 때만 축소함.
const KV_W = 1920, KV_H = 1080, KV_POS_Y = 0.88;
const KV_ROOF_Y = 600;   // 원본 이미지에서 대문 지붕 꼭대기 y(px)
const SKY_TOP = 24;      // 프레임 안쪽 최소 여백
const ROOF_GAP = 6;      // 버튼과 지붕 사이 최소 간격 (펄스로 커질 때 지붕 장식에 살짝 닿는 정도는 허용)
function fitHeroToKv() {
  const hero = document.querySelector('.hero');
  const content = hero && hero.querySelector('.hero-content');
  if (!content) return;
  const update = () => {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;
    // 모바일은 다른 KV(kv_new.png)와 고정 여백을 사용
    if (w <= 720) {
      ['--hero-ratio', '--hero-fit', '--hero-pad-top'].forEach((v) => hero.style.removeProperty(v));
      return;
    }
    const scale = Math.max(w / KV_W, h / KV_H);
    const offsetY = (h - KV_H * scale) * KV_POS_Y;
    const roofY = offsetY + KV_ROOF_Y * scale;
    const band = roofY - ROOF_GAP - SKY_TOP;
    const blockH = content.offsetHeight; // transform 영향을 받지 않는 원래 높이
    const fit = Math.min(1, Math.max(0.9, band / blockH)); // 타이틀이 너무 작아지지 않게 최대 90%까지만 축소
    const padTop = SKY_TOP + Math.max(0, (band - blockH * fit) / 2);
    hero.style.setProperty('--hero-ratio', Math.min(1, h / (w * KV_H / KV_W)).toFixed(3));
    hero.style.setProperty('--hero-fit', fit.toFixed(3));
    hero.style.setProperty('--hero-pad-top', padTop.toFixed(1) + 'px');
  };
  update();
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(update);
    ro.observe(hero);
    ro.observe(content);
  } else window.addEventListener('resize', update);
  // 타이틀 이미지가 늦게 로드되면 높이가 바뀌므로 다시 계산
  content.querySelectorAll('img').forEach((img) => img.complete || img.addEventListener('load', update, { once: true }));
}

document.addEventListener('DOMContentLoaded', () => {
  window.__pageJsReady = true;
  syncHeaderHeight();
  initLazySections();
  fitHeroToKv();
  renderStars();
  renderTitleGlints();
  playHeroIntro();
  initTabs();
  initScrollUnroll();
  initScrollReveal();
});
