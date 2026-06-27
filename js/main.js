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

/* ══════════════════════════════════════════════
   FORM VALIDATION + REGISTRATION FLOW
══════════════════════════════════════════════ */
function initForms() {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#F85149';
          valid = false;
          setTimeout(() => field.style.borderColor = '', 2000);
        }
      });
      if (!valid) { showToast('Please fill all required fields', 'error'); return; }

      const action = form.dataset.action;
      if      (action === 'login')    doLogin(form);
      else if (action === 'register') doRegister(form);
      else if (action === 'book')     doBooking(form);
      else showToast('Submitted successfully!', 'success');
    });
  });
}

/* ── Login ── */
function doLogin(form) {
  showToast('Logging you in…', 'info');
  setTimeout(() => {
    const role = form.querySelector('[name="role"]')?.value || 'client';
    window.location.href = role === 'fundi'
      ? 'dashboard-fundi.html'
      : role === 'admin'
        ? 'admin.html'
        : 'dashboard-client.html';
  }, 1000);
}

/* ── Register — NOW SAVES TO LOCALSTORAGE ── */
function doRegister(form) {
  showToast('Creating your account…', 'info');

  /* Collect every named field in the form */
  const get = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';

  const role     = get('role') || 'client';
  const fullName = get('name') || get('fullname') || get('full_name') || 'New User';
  const phone    = get('phone');
  const email    = get('email');
  const location = get('location') || get('county') || 'Kenya';
  const skill    = get('skill') || get('service') || get('skills') || '';
  const password = get('password');  // stored only as a marker (never in plaintext in production)

  /* Build the user record */
  const user = {
    id:       Date.now(),                          // unique ID
    name:     fullName,
    initials: FC.initials(fullName),
    email:    email,
    phone:    phone,
    role:     role,                                // 'client' | 'fundi'
    location: location,
    skill:    skill,                               // relevant for fundis
    status:   role === 'fundi' ? 'pending' : 'active', // fundis start as pending until admin approves
    joinDate: new Date().toISOString(),
    rating:   null,
    bookings: 0,
  };

  /* Persist to localStorage */
  FC.saveUser(user);

  /* Confirm and redirect */
  setTimeout(() => {
    showToast(`Account created! Welcome to FundiConnect 🎉`, 'success');
    setTimeout(() => {
      window.location.href = role === 'fundi'
        ? 'dashboard-fundi.html'
        : 'dashboard-client.html';
    }, 1200);
  }, 1000);
}

/* ── Booking ── */
function doBooking(form) {
  showToast('Booking request sent! ✅', 'success');
  setTimeout(() => window.location.href = 'dashboard-client.html', 1500);
}

/* ══════════════════════════════════════════════
   UPLOAD PREVIEW
══════════════════════════════════════════════ */
function initUploadPreviews() {
  document.querySelectorAll('input[type="file"][data-preview]').forEach(input => {
    input.addEventListener('change', () => {
      const preview = document.getElementById(input.dataset.preview);
      if (!preview) return;
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
      reader.readAsDataURL(file);
    });
  });
}

/* ══════════════════════════════════════════════
   SPARKLINES
══════════════════════════════════════════════ */
function initSparklines() {
  document.querySelectorAll('.sparkline').forEach(el => {
    const data = el.dataset.values?.split(',').map(Number) || [];
    if (!data.length) return;
    const max = Math.max(...data), min = Math.min(...data);
    const w = el.offsetWidth || 120, h = 40;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
      return `${x},${y}`;
    }).join(' ');
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:40px">
      <polyline points="${points}" fill="none" stroke="var(--blue-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  });
}

/* ══════════════════════════════════════════════
   BOOKING STATUS ACTIONS
══════════════════════════════════════════════ */
function initBookingActions() {
  document.querySelectorAll('[data-accept-job]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.job-card');
      if (card) {
        card.querySelector('.job-status')?.replaceWith(createBadge('Accepted', 'green'));
        btn.remove();
        showToast('Job accepted! Client has been notified.', 'success');
      }
    });
  });
  document.querySelectorAll('[data-reject-job]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.job-card')?.remove();
      showToast('Job declined.', 'info');
    });
  });
  document.querySelectorAll('[data-complete-job]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.job-card');
      if (card) {
        card.querySelector('.job-status')?.replaceWith(createBadge('Completed', 'green'));
        btn.remove();
        showToast('Job marked as complete! 🎉', 'success');
      }
    });
  });
}

function createBadge(text, type) {
  const span = document.createElement('span');
  span.className = `badge badge-${type}`;
  span.textContent = text;
  return span;
}

/* ══════════════════════════════════════════════
   EMERGENCY MODE
══════════════════════════════════════════════ */
function initEmergency() {
  const btn = document.querySelector('#emergency-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.textContent = '🔍 Finding nearest fundi…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '📞 Connecting to John Kamau (2.3km away)';
      showToast('Emergency request sent! Fundi is on the way 🚨', 'error');
      btn.style.background = 'var(--green)';
      btn.disabled = false;
    }, 2000);
  });
}

/* ══════════════════════════════════════════════
   PROGRESS BARS
══════════════════════════════════════════════ */
function initProgressBars() {
  document.querySelectorAll('.progress-fill[data-width]').forEach(el => {
    setTimeout(() => el.style.width = el.dataset.width, 300);
  });
}

/* ══════════════════════════════════════════════
   NOTIFICATIONS PANEL
══════════════════════════════════════════════ */
function initNotifications() {
  const btn   = document.querySelector('#notif-btn');
  const panel = document.querySelector('#notif-panel');
  if (!btn || !panel) return;
  btn.addEventListener('click', e => { e.stopPropagation(); panel.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
  });
}

/* ══════════════════════════════════════════════
   ADMIN — DYNAMIC USER TABLE
   Reads localStorage and injects registered users
   into the admin users table and fundi queues.
══════════════════════════════════════════════ */
function initAdminUserTable() {
  const tbody = document.getElementById('registered-users-tbody');
  if (!tbody) return;

  function renderUsers() {
    const registeredUsers = FC.getUsers();
    if (!registeredUsers.length) return;

    registeredUsers.forEach((u, idx) => {
      /* Skip if this user row already exists (avoid duplicates on re-render) */
      if (document.getElementById(`ru-${u.id}`)) return;

      const grad = FC.avatarGradient(idx);
      const dateStr = FC.formatDate(u.joinDate);
      const statusClass = u.status === 'active' ? 'status-active'
                        : u.status === 'pending'  ? 'status-pending'
                        : 'status-banned';
      const statusLabel = u.status === 'active'  ? 'Active'
                        : u.status === 'pending'  ? 'Pending'
                        : u.status === 'banned'   ? 'Banned'
                        : u.status;
      const roleClass = u.role === 'fundi' ? 'badge-green' : 'badge-blue';
      const roleLabel = u.role === 'fundi' ? 'Fundi' : 'Client';

      const tr = document.createElement('tr');
      tr.id = `ru-${u.id}`;
      tr.innerHTML = `
        <td>
          <div class="user-row">
            <div class="ua" style="background:${grad};color:#fff">${u.initials}</div>
            <div>
              <div style="font-size:.83rem;font-weight:600">${u.name}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${u.email || '—'}</div>
            </div>
          </div>
        </td>
        <td><span class="badge ${roleClass}">${roleLabel}</span></td>
        <td style="font-size:.8rem;font-family:'JetBrains Mono',monospace">${u.phone || '—'}</td>
        <td style="font-size:.8rem">${u.location || '—'}</td>
        <td style="font-size:.78rem;color:var(--text-muted)">${dateStr}</td>
        <td><span class="status ${statusClass}">${statusLabel}</span></td>
        <td>
          <div class="action-btns">
            <button class="act act-view" onclick="showToast('Viewing ${u.name}','info')">👁</button>
            ${u.status !== 'banned'
              ? `<button class="act act-ban" onclick="adminBanUser(${u.id}, this)">🚫</button>`
              : `<button class="act act-approve" onclick="adminUnbanUser(${u.id}, this)">✅ Unban</button>`
            }
          </div>
        </td>`;
      tbody.appendChild(tr);
    });

    /* Update the user count badge */
    const countEl = document.getElementById('total-user-count');
    if (countEl) {
      const base = parseInt(countEl.dataset.base || '2847');
      countEl.textContent = (base + registeredUsers.length).toLocaleString();
    }
  }

  renderUsers();
}

/* Admin: ban a user */
window.adminBanUser = function(id, btn) {
  FC.updateUserStatus(id, 'banned');
  const tr = document.getElementById(`ru-${id}`);
  if (tr) {
    tr.querySelector('.status').className = 'status status-banned';
    tr.querySelector('.status').textContent = 'Banned';
    btn.outerHTML = `<button class="act act-approve" onclick="adminUnbanUser(${id}, this)">✅ Unban</button>`;
  }
  showToast('User banned', 'error');
};

/* Admin: unban a user */
window.adminUnbanUser = function(id, btn) {
  FC.updateUserStatus(id, 'active');
  const tr = document.getElementById(`ru-${id}`);
  if (tr) {
    tr.querySelector('.status').className = 'status status-active';
    tr.querySelector('.status').textContent = 'Active';
    btn.outerHTML = `<button class="act act-ban" onclick="adminBanUser(${id}, this)">🚫</button>`;
  }
  showToast('User unbanned ✅', 'success');
};
