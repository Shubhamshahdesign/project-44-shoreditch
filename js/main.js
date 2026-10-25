// Project 44 — mode switch, live open status, hours timeline, tabs, mobile nav.

// Opening hours, 24h clock. Edit here and everything on the page updates.
const HOURS = [
  { day: 'Monday',    open: 7, close: 18 },
  { day: 'Tuesday',   open: 7, close: 18 },
  { day: 'Wednesday', open: 7, close: 23 },
  { day: 'Thursday',  open: 7, close: 23 },
  { day: 'Friday',    open: 7, close: 18 },
  { day: 'Saturday',  open: 8, close: 18 },
  { day: 'Sunday',    open: 8, close: 18 },
];
const NIGHT_FROM = 18;   // after 6pm on a late day, the site opens in night mode

const fmt = (h) => {
  const hr = h % 12 || 12;
  return `${hr}${h < 12 || h === 24 ? 'am' : 'pm'}`;
};

(function () {
  const root = document.documentElement;
  const now = new Date();
  const jsDay = now.getDay();                       // 0 = Sunday
  const todayIdx = (jsDay + 6) % 7;                 // 0 = Monday
  const today = HOURS[todayIdx];
  const hourNow = now.getHours() + now.getMinutes() / 60;

  // Mode: day / night
  const buttons = document.querySelectorAll('.switch-btn');
  const setMode = (mode) => {
    root.dataset.mode = mode;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.set === mode)));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = mode === 'night' ? '#2B0A0F' : '#EFE6D6';
  };
  buttons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.set)));
  if (today.close > NIGHT_FROM && hourNow >= NIGHT_FROM && hourNow < today.close) setMode('night');

  // Live status in the header
  const status = document.getElementById('status');
  if (status) {
    if (hourNow >= today.open && hourNow < today.close) {
      status.textContent = `Open now until ${fmt(today.close)}`;
      status.classList.add('is-open');
    } else if (hourNow < today.open) {
      status.textContent = `Opens today at ${fmt(today.open)}`;
    } else {
      const next = HOURS[(todayIdx + 1) % 7];
      status.textContent = `Closed. Opens ${next.day} at ${fmt(next.open)}`;
    }
  }

  // Opening times under the map
  const list = document.getElementById('opening-list');
  if (list) {
    HOURS.forEach((h, i) => {
      const row = document.createElement('div');
      if (i === todayIdx) row.className = 'today';
      row.innerHTML = `<dt>${h.day}</dt><dd>${fmt(h.open)} to ${fmt(h.close)}</dd>`;
      list.appendChild(row);
    });
  }

  // Marquee: copy the photos once so the loop is seamless
  const track = document.querySelector('.marquee-track');
  if (track) {
    [...track.children].forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      track.appendChild(copy);
    });
  }

  // Menu tabs
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menu'; };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  const y = document.getElementById('year');
  if (y) y.textContent = now.getFullYear();
})();
