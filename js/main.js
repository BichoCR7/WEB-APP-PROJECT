/* ═══════════════════════════════════════════════
   FundiConnect — main.js
═══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   STORAGE LAYER — All user data lives here
══════════════════════════════════════════════ */
const FC = {
  KEYS: {
    users:  'fc_users',   // all registered users (clients + fundis)
    fundis: 'fc_fundis',  // fundi-specific records (approval queue)
  },

  /** Return all saved users */
  getUsers() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.users) || '[]'); }
    catch { return []; }
  },

  /** Return only clients */
  getClients() {
    return this.getUsers().filter(u => u.role === 'client');
  },

  /** Return only fundis */
  getFundis() {
    return this.getUsers().filter(u => u.role === 'fundi');
  },

  /** Return fundis pending approval */
  getPendingFundis() {
    return this.getFundis().filter(u => u.status === 'pending');
  },

  /** Save a new user record */
  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.KEYS.users, JSON.stringify(users));
  },

  /** Update a user's status by ID */
  updateUserStatus(id, status) {
    const users = this.getUsers().map(u => u.id === id ? { ...u, status } : u);
    localStorage.setItem(this.KEYS.users, JSON.stringify(users));
  },

  /** Remove a user by ID */
  deleteUser(id) {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(this.KEYS.users, JSON.stringify(users));
  },

  /** Build initials from a full name */
  initials(name) {
    return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },

  /** Gradient colours for avatars (cycled by index) */
  avatarGradient(index) {
    const grads = [
      'linear-gradient(135deg,#007ACC,#0EA5E9)',
      'linear-gradient(135deg,#4EC9B0,#007ACC)',
      'linear-gradient(135deg,#C586C0,#CE9178)',
      'linear-gradient(135deg,#E3B341,#CE9178)',
      'linear-gradient(135deg,#4EC9B0,#0EA5E9)',
      'linear-gradient(135deg,#8B5CF6,#EC4899)',
      'linear-gradient(135deg,#10B981,#06B6D4)',
    ];
    return grads[index % grads.length];
  },

  /** Format a date as "DD Mon YYYY" */
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' });
  }
};

/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════════════ */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = formatNum(Math.floor(current)) + suffix;
    }, step);
  });
}

function formatNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n/1000).toFixed(n>=10000?0:1) + 'k';
  return n.toString();
}

function initCounters() {
  const section = document.querySelector('.stats-section');
  if (!section) return;
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe(section);
}

/* ══════════════════════════════════════════════
   NAV TOGGLE
══════════════════════════════════════════════ */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
  });
  const links = document.querySelectorAll('.nav-links a, .mobile-menu a');
  links.forEach(a => {
    if (a.href === window.location.href) a.classList.add('active');
  });
}

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('[data-tabs]');
      if (!group) return;
      const target = btn.dataset.tab;
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      group.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = group.querySelector(`[data-tab-pane="${target}"]`);
      if (pane) pane.classList.add('active');
    });
  });
}

/* ══════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════ */
function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modalOpen;
      const overlay = document.getElementById(id);
      if (overlay) overlay.classList.add('open');
    });
  });
  document.querySelectorAll('[data-modal-close], .modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target === el) {
        const overlay = el.closest('.modal-overlay') || el;
        overlay.classList.remove('open');
      }
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(o => o.classList.remove('open'));
    }
  });
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function showToast(msg, type = 'success', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:1.1rem">${icons[type]||'💬'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
window.showToast = showToast;

/* ══════════════════════════════════════════════
   STAR RATING
══════════════════════════════════════════════ */
function initStarRating() {
  document.querySelectorAll('.rate-stars').forEach(group => {
    const stars = group.querySelectorAll('.rate-star');
    stars.forEach((star, i) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, j) => s.classList.toggle('filled', j <= i));
      });
      star.addEventListener('mouseleave', () => {
        const sel = group.dataset.rating || 0;
        stars.forEach((s, j) => s.classList.toggle('filled', j < sel));
      });
      star.addEventListener('click', () => {
        group.dataset.rating = i + 1;
        stars.forEach((s, j) => s.classList.toggle('filled', j <= i));
      });
    });
  });
}

/* ══════════════════════════════════════════════
   CHAT
══════════════════════════════════════════════ */
function initChat() {
  const input    = document.querySelector('.chat-input');
  const sendBtn  = document.querySelector('.chat-send-btn');
  const messages = document.querySelector('.chat-messages');
  if (!input || !messages) return;

  function addMsg(text, mine = true) {
    const div = document.createElement('div');
    div.className = `chat-msg ${mine ? 'mine' : ''}`;
    const now = new Date().toLocaleTimeString('en-KE', {hour:'2-digit', minute:'2-digit'});
    div.innerHTML = `
      ${!mine ? '<div class="avatar avatar-sm" style="background:linear-gradient(135deg,var(--blue),var(--green));color:#fff;font-size:.8rem">J</div>' : ''}
      <div>
        <div class="chat-bubble">${text}</div>
        <div class="chat-time">${now}</div>
      </div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  const replies = [
    'Sawa, nitafika saa tatu asubuhi.', 'Kazi itakuwa done leo.',
    'Bei yangu ni Ksh 1,500 kwa hiyo.', 'Niko available sasa hivi.',
    'Asante sana! Nitakupigia simu.', 'Sawa kabisa, tuonane.'
  ];

  function send() {
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, true);
    input.value = '';
    setTimeout(() => addMsg(replies[Math.floor(Math.random() * replies.length)], false), 1000 + Math.random() * 800);
  }

  sendBtn?.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
}

/* ══════════════════════════════════════════════
   SEARCH FILTER
══════════════════════════════════════════════ */
function initSearch() {
  const input = document.querySelector('#fundi-search');
  const cards = document.querySelectorAll('.fundi-card-wrap');
  if (!input || !cards.length) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    cards.forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  document.querySelectorAll('.cat-pill[data-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill[data-filter]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      cards.forEach(c => {
        c.style.display = (filter === 'all' || c.dataset.cat === filter) ? '' : 'none';
      });
    });
  });
}