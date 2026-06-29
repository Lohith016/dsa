/* ===== STRUCTURED DSA GUIDE: SHARED CLIENT SCRIPT ===== */

(function() {
  const stored = localStorage.getItem('dsa-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', () => {
  // Sync Theme Icons
  const theme = document.documentElement.getAttribute('data-theme');
  updateThemeIcons(theme);

  // Bind Theme Toggle Buttons
  const btn = document.getElementById('themeToggle');
  const btnMobile = document.getElementById('themeToggleMobile');
  if (btn) btn.addEventListener('click', toggleTheme);
  if (btnMobile) btnMobile.addEventListener('click', toggleTheme);

  // Mobile Sidebar Toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Close button inside sidebar
  const sidebarClose = document.getElementById('sidebarClose');
  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  // Close sidebar when clicking a nav link (mobile) - uses event delegation
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  }

  // Keyboard shortcut: ⌘K for search focus
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });

  // Search Filter logic
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      document.querySelectorAll('.nav-topic').forEach(topic => {
        const topicText = topic.querySelector('.nav-topic-btn').textContent.toLowerCase();
        const children = topic.querySelectorAll('.nav-topic-children .nav-item');
        let anyChildMatch = false;

        children.forEach(child => {
          const childText = child.textContent.toLowerCase();
          if (query && childText.includes(query)) {
            child.style.display = '';
            anyChildMatch = true;
          } else if (query) {
            child.style.display = 'none';
          } else {
            child.style.display = '';
          }
        });

        if (!query || topicText.includes(query) || anyChildMatch) {
          topic.style.display = '';
          if (topicText.includes(query) && query) {
            children.forEach(c => c.style.display = '');
          }
        } else {
          topic.style.display = 'none';
        }
      });

      if (query) {
        document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('collapsed'));
        document.querySelectorAll('.nav-topic').forEach(t => t.classList.remove('collapsed'));
      }
    });
  }

  // Highlight Sidebar and Setup Current Page
  highlightActiveSidebarLink();
  setupPageScrollSpyAndTOC();
  setupComingSoonPage();

  // Initialize Visualizer if present on page
  if (document.getElementById('vizNumsCells')) {
    initializeVisualizer();
  }
});

/* ===== THEME HELPER FUNCTIONS ===== */
function updateThemeIcons(theme) {
  const sunIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  
  const moonIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  
  const icon = theme === 'dark' ? sunIcon : moonIcon;
  const btn = document.getElementById('themeToggle');
  const btnMobile = document.getElementById('themeToggleMobile');
  if (btn) btn.innerHTML = icon;
  if (btnMobile) btnMobile.innerHTML = icon;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('dsa-theme', next);
  updateThemeIcons(next);
}

/* ===== TOGGLE SIDEBAR TOPIC GROUPS ===== */
function toggleGroup(btn) {
  const group = btn.closest('.nav-group');
  if (group) group.classList.toggle('collapsed');
}

function toggleTopic(btn) {
  const topic = btn.closest('.nav-topic');
  if (topic) topic.classList.toggle('collapsed');
}

/* ===== DYNAMIC SIDEBAR HIGHLIGHTING ===== */
const topicOrder = [
  'prefix-sum', 'two-pointers', 'sliding-window', 'fast-slow-pointers',
  'll-reversal', 'monotonic-stack', 'top-k', 'overlapping-intervals',
  'binary-search', 'tree-traversal', 'dfs', 'bfs', 'matrix', 'backtracking', 'dp'
];

const topicNames = {
  'prefix-sum': 'Prefix Sum Pattern',
  'two-pointers': 'Two Pointers Pattern',
  'sliding-window': 'Sliding Window Pattern',
  'fast-slow-pointers': 'Fast & Slow Pointers',
  'll-reversal': 'Linked List In-Place Reversal',
  'monotonic-stack': 'Monotonic Stack Pattern',
  'top-k': 'Top K Elements Pattern',
  'overlapping-intervals': 'Overlapping Intervals Pattern',
  'binary-search': 'Modified Binary Search Pattern',
  'tree-traversal': 'Binary Tree Traversal',
  'dfs': 'Depth First Search (DFS)',
  'bfs': 'Breadth First Search (BFS)',
  'matrix': 'Matrix Traversal Pattern',
  'backtracking': 'Backtracking',
  'dp': 'Dynamic Programming (DP)'
};

function highlightActiveSidebarLink() {
  const path = window.location.pathname;
  let filename = path.substring(path.lastIndexOf('/') + 1) || 'basic-prefix-sum.html';

  // Collapse all topics first
  document.querySelectorAll('.nav-topic').forEach(t => t.classList.add('collapsed'));
  document.querySelectorAll('.nav-topic-btn').forEach(btn => btn.classList.remove('active-parent'));
  document.querySelectorAll('.nav-topic-children .nav-item a').forEach(a => a.classList.remove('active'));

  if (filename.startsWith('coming-soon.html')) {
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('topic') || 'two-pointers';
    const topicGroup = document.querySelector(`[data-topic-group="${topicId}"]`);
    if (topicGroup) {
      topicGroup.classList.remove('collapsed');
      const btn = topicGroup.querySelector('.nav-topic-btn');
      if (btn) btn.classList.add('active-parent');
      // Highlight the first subtopic
      const firstLink = topicGroup.querySelector('.nav-topic-children .nav-item a');
      if (firstLink) firstLink.classList.add('active');
    }
  } else {
    // Find matching link based on filename
    const activeLink = document.querySelector(`.sidebar-nav a[href="${filename}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      const topicGroup = activeLink.closest('.nav-topic');
      if (topicGroup) {
        topicGroup.classList.remove('collapsed');
        const btn = topicGroup.querySelector('.nav-topic-btn');
        if (btn) btn.classList.add('active-parent');
      }
    }
  }
}

/* ===== COMING SOON DYNAMIC ROUTING ===== */
function setupComingSoonPage() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  if (!filename.startsWith('coming-soon.html')) return;

  const params = new URLSearchParams(window.location.search);
  const topicId = params.get('topic') || 'two-pointers';
  const topicName = topicNames[topicId] || 'DSA Pattern';

  const titleEl = document.getElementById('comingSoonTitle');
  const descEl = document.getElementById('comingSoonDesc');

  if (titleEl) titleEl.textContent = topicName;
  if (descEl) {
    descEl.innerHTML = `Work-in-progress: I am actively learning and documenting the ${topicName}. The guide will be published once complete.`;
  }

  document.title = `${topicName} | Structured DSA Guide`;

  // Save last visited topic
  localStorage.setItem('dsa-last-visited-topic', topicId);
  localStorage.setItem('dsa-last-visited-page', `coming-soon.html?topic=${topicId}`);
  localStorage.setItem('dsa-last-visited-subtopic', ''); // clear subtopic

  // Navigation Prev/Next
  const idx = topicOrder.indexOf(topicId);
  const prevLink = document.getElementById('comingPrevLink');
  const nextLink = document.getElementById('comingNextLink');

  if (prevLink) {
    if (idx === 1) {
      prevLink.setAttribute('href', 'difference-array.html');
      prevLink.querySelector('.nav-title').textContent = 'Difference Array';
      prevLink.style.visibility = 'visible';
    } else if (idx > 1) {
      const prevTopic = topicOrder[idx - 1];
      prevLink.setAttribute('href', `coming-soon.html?topic=${prevTopic}`);
      prevLink.querySelector('.nav-title').textContent = topicNames[prevTopic];
      prevLink.style.visibility = 'visible';
    } else {
      prevLink.style.visibility = 'hidden';
    }
  }

  if (nextLink) {
    if (idx < topicOrder.length - 1) {
      const nextTopic = topicOrder[idx + 1];
      nextLink.setAttribute('href', `coming-soon.html?topic=${nextTopic}`);
      nextLink.querySelector('.nav-title').textContent = topicNames[nextTopic];
      nextLink.style.visibility = 'visible';
    } else {
      nextLink.style.visibility = 'hidden';
    }
  }
}

/* ===== TABLE OF CONTENTS & SCROLL SPY ===== */
const spyHeadings = [];

function setupPageScrollSpyAndTOC() {
  const tocList = document.getElementById('tocList');
  const tocPanel = document.getElementById('tocPanel');
  if (!tocList || !tocPanel) return;

  const path = window.location.pathname;
  let filename = path.substring(path.lastIndexOf('/') + 1) || 'basic-prefix-sum.html';

  const tocItemsMap = {
    'basic-prefix-sum.html': [
      { id: 'what-is-prefix-sum', text: 'What is a Prefix Sum?' },
      { id: 'building-the-prefix-array', text: 'Building the Prefix Array' },
      { id: 'range-queries', text: 'Range Sum Queries in O(1)' },
      { id: 'basic-prefix-sum-problems', text: 'Practice Problems' }
    ],
    'prefix-sum-with-hashmap.html': [
      { id: 'page-prefix-sum-with-hashmap', text: 'Prefix Sum + Hash Map' }
    ],
    '2d-prefix-sum.html': [
      { id: 'page-2d-prefix-sum', text: '2D Prefix Sum' }
    ],
    'difference-array.html': [
      { id: 'page-difference-array', text: 'Difference Array' },
      { id: 'difference-array-problems', text: 'Practice Problems' }
    ]
  };

  let pageKey = null;
  for (const key in tocItemsMap) {
    if (filename.startsWith(key)) {
      pageKey = key;
      break;
    }
  }

  let tocHTML = '';
  if (pageKey) {
    tocPanel.style.display = ''; // Clear inline style to allow CSS media queries
    const items = tocItemsMap[pageKey];
    
    tocHTML = items.map((item, idx) => `
      <li><a href="#${item.id}" class="${idx === 0 ? 'active' : ''}">${item.text}</a></li>
    `).join('');

    const sidebarTocHTML = items.map((item, idx) => `
      <li class="sidebar-toc-item"><a href="#${item.id}" class="${idx === 0 ? 'active' : ''}">${item.text}</a></li>
    `).join('');

    tocList.innerHTML = tocHTML;

    // Mobile sidebar toc population
    const sidebarNav = document.getElementById('sidebarNav');
    if (sidebarNav) {
      const existingSidebarToc = document.getElementById('sidebarTocGroup');
      if (existingSidebarToc) {
        existingSidebarToc.remove();
      }

      const tocGroup = document.createElement('div');
      tocGroup.className = 'nav-group mobile-only-toc';
      tocGroup.id = 'sidebarTocGroup';
      
      tocGroup.innerHTML = `
        <button class="nav-group-title" onclick="toggleGroup(this)">
          On This Page
          <span class="chevron">▾</span>
        </button>
        <ul class="nav-items">
          ${sidebarTocHTML}
        </ul>
      `;
      sidebarNav.insertBefore(tocGroup, sidebarNav.firstChild);
    }
  } else {
    tocPanel.style.display = 'none';
    const existingSidebarToc = document.getElementById('sidebarTocGroup');
    if (existingSidebarToc) {
      existingSidebarToc.remove();
    }
  }

  // Build headings map for scrollspy
  spyHeadings.length = 0;
  const links = document.querySelectorAll('#tocList a, #sidebarTocGroup a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) spyHeadings.push({ el, link });
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        window.scrollTo({
          top: targetEl.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });

  if (spyHeadings.length > 0) {
    window.removeEventListener('scroll', updateScrollSpy);
    window.addEventListener('scroll', updateScrollSpy, { passive: true });
    updateScrollSpy();
  }
}

function updateScrollSpy() {
  if (spyHeadings.length === 0) return;
  const scrollPos = window.scrollY + 120;
  let current = null;

  for (let i = spyHeadings.length - 1; i >= 0; i--) {
    if (spyHeadings[i].el.offsetTop <= scrollPos) {
      current = spyHeadings[i];
      break;
    }
  }

  // Clear active class from all desktop and mobile TOC links
  document.querySelectorAll('#tocList a, #sidebarTocGroup a').forEach(l => l.classList.remove('active'));
  
  if (current) {
    const activeHref = current.link.getAttribute('href');
    document.querySelectorAll(`#tocList a[href="${activeHref}"], #sidebarTocGroup a[href="${activeHref}"]`).forEach(l => {
      l.classList.add('active');
    });
  }
}

/* ===== COPY CODE BUTTON ===== */
function copyCode(button) {
  const codeBlock = button.closest('.code-block');
  if (!codeBlock) return;
  const code = codeBlock.querySelector('pre code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="copy-icon">✓</span> Copied';
    button.classList.add('copied');
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('copied');
    }, 2000);
  });
}

/* ===== PREFIX SUM VISUALIZER LOGIC ===== */
let vizMode = 'build';
let vizNums = [2, 4, 1, 3, 5];
let vizPrefix = [];
let vizStep = 0;

function initializeVisualizer() {
  const inputEl = document.getElementById('vizArrayInput');
  if (inputEl) {
    const val = inputEl.value.trim();
    const parsed = val.split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
    
    if (parsed.length > 0) {
      vizNums = parsed.slice(0, 8);
      inputEl.value = vizNums.join(', ');
    }
  }

  vizPrefix = [0];
  for (let i = 0; i < vizNums.length; i++) {
    vizPrefix.push(vizPrefix[vizPrefix.length - 1] + vizNums[i]);
  }

  if (vizStep > vizNums.length + 1) {
    vizStep = vizNums.length + 1;
  }
  if (vizStep < 0) {
    vizStep = 0;
  }

  renderVizWorkspace();
}

function renderVizWorkspace() {
  const numsContainer = document.getElementById('vizNumsCells');
  const prefixContainer = document.getElementById('vizPrefixCells');
  if (!numsContainer || !prefixContainer) return;

  numsContainer.innerHTML = '';
  vizNums.forEach((num, idx) => {
    const cell = document.createElement('div');
    cell.className = 'array-cell';
    cell.textContent = num;
    
    const label = document.createElement('span');
    label.className = 'cell-index';
    label.textContent = idx;
    cell.appendChild(label);
    
    numsContainer.appendChild(cell);
  });

  prefixContainer.innerHTML = '';
  for (let idx = 0; idx <= vizNums.length; idx++) {
    const cell = document.createElement('div');
    cell.className = 'array-cell';
    
    const label = document.createElement('span');
    label.className = 'cell-index';
    label.textContent = idx;
    cell.appendChild(label);

    if (vizMode === 'build') {
      if (idx < vizStep) {
        cell.textContent = vizPrefix[idx];
      } else {
        cell.textContent = '';
      }
    } else {
      cell.textContent = vizPrefix[idx];
    }

    prefixContainer.appendChild(cell);
  }

  const numsCells = numsContainer.querySelectorAll('.array-cell');
  const prefixCells = prefixContainer.querySelectorAll('.array-cell');

  if (vizMode === 'build') {
    const btnPrev = document.getElementById('btnVizPrev');
    const btnNext = document.getElementById('btnVizNext');
    if (btnPrev) btnPrev.disabled = (vizStep === 0);
    if (btnNext) btnNext.disabled = (vizStep > vizNums.length);

    if (vizStep === 0) {
      if (prefixCells[0]) prefixCells[0].classList.add('active-curr-prefix');
      document.getElementById('vizExplanation').innerHTML = `
        <strong>Initialization</strong>: <code>prefix[0]</code> is always initialized to <code>0</code>.
      `;
    } else if (vizStep <= vizNums.length) {
      if (numsCells[vizStep - 1]) numsCells[vizStep - 1].classList.add('active-nums');
      if (prefixCells[vizStep - 1]) prefixCells[vizStep - 1].classList.add('active-prev-prefix');
      if (prefixCells[vizStep]) prefixCells[vizStep].classList.add('active-curr-prefix');

      const prevVal = vizPrefix[vizStep - 1];
      const currNum = vizNums[vizStep - 1];
      const newVal = vizPrefix[vizStep];

      document.getElementById('vizExplanation').innerHTML = `
        <code>prefix[${vizStep}] = prefix[${vizStep - 1}] + nums[${vizStep - 1}]</code><br>
        <code>= ${prevVal} + ${currNum} = <strong>${newVal}</strong></code>
      `;
    } else {
      document.getElementById('vizExplanation').innerHTML = `
        <strong>Finished!</strong> The prefix sum array is fully constructed.<br>
        Try switching to the <strong>Query Range Sum</strong> tab to test fast range queries.
      `;
    }
  }
}

function stepVisualizer(dir) {
  if (vizMode !== 'build') return;
  vizStep += dir;
  if (vizStep < 0) vizStep = 0;
  if (vizStep > vizNums.length + 1) vizStep = vizNums.length + 1;
  renderVizWorkspace();
}

function setVisualizerMode(mode) {
  vizMode = mode;
  const tabBuild = document.getElementById('tabBuild');
  const tabQuery = document.getElementById('tabQuery');
  if (tabBuild) tabBuild.classList.toggle('active', mode === 'build');
  if (tabQuery) tabQuery.classList.toggle('active', mode === 'query');

  const inputSetup = document.getElementById('vizInputSetup');
  const querySelector = document.getElementById('vizQuerySelector');
  const playControls = document.getElementById('vizPlayControls');

  if (mode === 'build') {
    if (inputSetup) inputSetup.style.display = 'flex';
    if (querySelector) querySelector.style.display = 'none';
    if (playControls) playControls.style.display = 'flex';
    vizStep = 0;
    initializeVisualizer();
  } else {
    if (inputSetup) inputSetup.style.display = 'none';
    if (querySelector) querySelector.style.display = 'flex';
    if (playControls) playControls.style.display = 'none';

    const selectI = document.getElementById('selectI');
    const selectJ = document.getElementById('selectJ');
    if (selectI && selectJ) {
      selectI.innerHTML = '';
      selectJ.innerHTML = '';
      for (let idx = 0; idx < vizNums.length; idx++) {
        selectI.innerHTML += `<option value="${idx}">${idx}</option>`;
        selectJ.innerHTML += `<option value="${idx}">${idx}</option>`;
      }
      selectI.value = '1';
      selectJ.value = Math.min(3, vizNums.length - 1).toString();
    }
    runRangeQuery();
  }
}

function runRangeQuery() {
  if (vizMode !== 'query') return;
  const selectI = document.getElementById('selectI');
  const selectJ = document.getElementById('selectJ');
  if (!selectI || !selectJ) return;

  const i = parseInt(selectI.value);
  const j = parseInt(selectJ.value);

  initializeVisualizer();

  const numsContainer = document.getElementById('vizNumsCells');
  const prefixContainer = document.getElementById('vizPrefixCells');
  if (!numsContainer || !prefixContainer) return;

  const numsCells = numsContainer.querySelectorAll('.array-cell');
  const prefixCells = prefixContainer.querySelectorAll('.array-cell');

  if (i > j) {
    document.getElementById('vizExplanation').innerHTML = `
      <span style="color: var(--callout-important); font-weight: 500;">
        Invalid Range: Start index i (${i}) must be ≤ End index j (${j}).
      </span>
    `;
    return;
  }

  for (let idx = i; idx <= j; idx++) {
    if (numsCells[idx]) numsCells[idx].classList.add('active-query-range');
  }

  if (prefixCells[j + 1]) {
    prefixCells[j + 1].classList.add('query-pos');
    const badge = document.createElement('span');
    badge.textContent = '+';
    badge.style.position = 'absolute';
    badge.style.top = '-10px';
    badge.style.right = '-5px';
    badge.style.background = 'var(--callout-tip)';
    badge.style.color = '#fff';
    badge.style.fontSize = '9px';
    badge.style.width = '14px';
    badge.style.height = '14px';
    badge.style.borderRadius = '50%';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.fontWeight = 'bold';
    prefixCells[j + 1].appendChild(badge);
  }

  if (prefixCells[i]) {
    prefixCells[i].classList.add('query-neg');
    const badge = document.createElement('span');
    badge.textContent = '-';
    badge.style.position = 'absolute';
    badge.style.top = '-10px';
    badge.style.right = '-5px';
    badge.style.background = 'var(--callout-important)';
    badge.style.color = '#fff';
    badge.style.fontSize = '9px';
    badge.style.width = '14px';
    badge.style.height = '14px';
    badge.style.borderRadius = '50%';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.fontWeight = 'bold';
    prefixCells[i].appendChild(badge);
  }

  const sum = vizPrefix[j + 1] - vizPrefix[i];
  document.getElementById('vizExplanation').innerHTML = `
    Sum of nums[${i}..${j}] = prefix[${j + 1}] - prefix[${i}] <br>
    = <span style="color: var(--callout-tip); font-weight: bold;">${vizPrefix[j + 1]}</span> - <span style="color: var(--callout-important); font-weight: bold;">${vizPrefix[i]}</span>
    = <strong style="color: var(--accent); font-size: 14px;">${sum}</strong>
  `;
}

/* ===== TOAST LOGIC ===== */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  let toastMsg = document.getElementById('toastMessage');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    toast.innerHTML = '<span id="toastMessage"></span><button onclick="hideToast()" aria-label="Close notification">×</button>';
    document.body.appendChild(toast);
    toastMsg = document.getElementById('toastMessage');
  }

  if (toastMsg) toastMsg.textContent = message;
  toast.classList.add('show');
  
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(hideToast, 3500);
}

function hideToast() {
  const toast = document.getElementById('toastNotification');
  if (toast) toast.classList.remove('show');
}
