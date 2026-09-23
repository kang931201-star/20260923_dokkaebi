// 배경 별 생성
function renderStars() {
  const layer = document.getElementById('star-layer');
  const count = 24;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'hero-star';
    const size = 2 + (i % 4);
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.top = ((i * 37) % 90) + '%';
    s.style.left = ((i * 53) % 100) + '%';
    s.style.animationDuration = (2 + (i % 5) * 0.6) + 's';
    s.style.animationDelay = ((i % 6) * 0.4) + 's';
    layer.appendChild(s);
  }
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

document.addEventListener('DOMContentLoaded', () => {
  renderStars();
  initTabs();
});
