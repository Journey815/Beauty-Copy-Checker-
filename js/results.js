// ============================================================
// Beauty Copy Checker — Results Page JS
// ============================================================

// Demo fallback data (used when no localStorage results exist)
const DEMO_ISSUES = [
  {
    id: 1, type: 'critical',
    title: 'Drug Claim 표현 감지',
    country: ['🇺🇸', '🇰🇷'],
    rule: 'US-LAB-004 · FD&C Act 201(g)(1)',
    location: '제품 설명문 (표제 아래 3-4번째 줄)',
    current: '"피부 재생을 도와 주름을 치료합니다"',
    fix: '"피부 컨디션을 부드럽게 가꿔줍니다. 보습 케어로 피부를 촉촉하게."',
    assignee: '문안검토 에이전시',
    pinX: 72, pinY: 26,
  },
  {
    id: 2, type: 'critical',
    title: '제조사 미국 주소 누락',
    country: ['🇺🇸'],
    rule: 'US-LAB-003 · 21 CFR 701.12',
    location: '제조사 정보 영역 (하단)',
    current: '"SEOUL BEAUTY LAB Co., Ltd. 123 Gangnam-daero, Seoul, Korea"',
    fix: 'Distributed by: [US Distributor Name], [City], [State] [ZIP], USA 추가 필요',
    assignee: '제조사',
    pinX: 22, pinY: 71,
  },
  {
    id: 3, type: 'critical',
    title: 'Net Quantity oz 단위 누락',
    country: ['🇺🇸'],
    rule: 'US-LAB-002 · 21 CFR 701.13',
    location: '순함량 표시 영역 (중단)',
    current: '"Net Weight: 150ml" (oz 누락)',
    fix: '"Net Wt. 150 ml / 5 fl oz" — fl oz 단위 병기 필수',
    assignee: '디자이너',
    pinX: 78, pinY: 34,
  },
  {
    id: 4, type: 'warning',
    title: 'INCI 스펠링 — "Glycerln" 오류 의심',
    country: ['🇺🇸', '🇰🇷'],
    rule: 'US-LAB-001 · 21 CFR 701.3',
    location: '성분표 2번째 성분',
    current: '"Glycerln"',
    fix: '"Glycerin" — INCI DB 공식 명칭',
    assignee: '디자이너',
    pinX: 72, pinY: 44,
  },
  {
    id: 5, type: 'warning',
    title: '순함량 폰트 크기 기준 미달 가능',
    country: ['🇺🇸'],
    rule: 'US-LAB-006 · 21 CFR 701.13',
    location: '순함량 표시 (중단)',
    current: '치수 미입력으로 자동 검증 불가 (입력 시 정확한 검증 가능)',
    fix: 'PDP 5~25 sq in 기준: 최소 1/8 in (3.2mm) 이상 폰트 높이 필요',
    assignee: '디자이너',
    pinX: 22, pinY: 34,
  },
  {
    id: 6, type: 'warning',
    title: '"Hydrating & Brightening" 효능 표현 검토',
    country: ['🇺🇸'],
    rule: 'US-WEB-001 · FD&C Act',
    location: '헤더 태그라인',
    current: '"HYDRATING & BRIGHTENING"',
    fix: '일반적으로 허용되는 cosmetic claim이나, 전체 맥락에서 drug claim과 결합 시 문제 소지',
    assignee: '문안검토 에이전시',
    pinX: 50, pinY: 20,
  },
  {
    id: 7, type: 'warning',
    title: '한국어 효능 과대표현 — "완치"',
    country: ['🇰🇷'],
    rule: 'KR-AD-002 · 화장품법 13조',
    location: '한국어 제품 설명 (표제 아래)',
    current: '"트러블을 완치시켜 드립니다"',
    fix: '"트러블이 있는 피부를 케어해 드립니다"로 교체',
    assignee: '문안검토 에이전시',
    pinX: 28, pinY: 29,
  },
  {
    id: 8, type: 'warning',
    title: '성분 함량순 — 향료 성분 배열 확인 요망',
    country: ['🇺🇸'],
    rule: 'US-LAB-001 · 21 CFR 701.3',
    location: '성분표 하단 (Limonene, Linalool)',
    current: '"...Limonene, Linalool" (향료 성분, 1% 이하 추정)',
    fix: '1% 이하 성분은 순서 무관이나 라벨에 "Fragrance" 또는 개별 성분 표기 방식 확인 필요',
    assignee: '제조사',
    pinX: 25, pinY: 53,
  },
  {
    id: 9, type: 'safe',
    title: '바코드 배율 — 적합 ✓',
    country: ['🇺🇸'],
    rule: 'US-LAB-007 · GS1 General Spec.',
    location: '바코드 영역 (우측 하단)',
    current: 'GS1 EAN-13 바코드 — 100% 배율',
    fix: '기준 충족. 별도 액션 불필요.',
    assignee: null,
    pinX: 77, pinY: 86,
  },
  {
    id: 10, type: 'safe',
    title: 'PAO (개봉 후 사용기한) 표시 ✓',
    country: ['🇰🇷'],
    rule: 'KR-LAB-001',
    location: '심볼 영역 (좌측 하단)',
    current: '12M PAO 심볼 확인됨',
    fix: '기준 충족.',
    assignee: null,
    pinX: 15, pinY: 84,
  },
  {
    id: 11, type: 'safe',
    title: 'INCI 표기 형식 — 전체 적합 ✓',
    country: ['🇺🇸', '🇰🇷'],
    rule: 'US-LAB-001 · 21 CFR 701.3',
    location: '성분표 전체',
    current: 'INCI 국제 명칭 형식 사용 확인',
    fix: '기준 충족.',
    assignee: null,
    pinX: 72, pinY: 48,
  },
  {
    id: 12, type: 'safe',
    title: '재활용 표시(♻) — 확인 ✓',
    country: ['🇰🇷'],
    rule: 'KR-LAB-001',
    location: '심볼 영역 (좌측 하단)',
    current: '재활용 표시 확인됨',
    fix: '기준 충족.',
    assignee: null,
    pinX: 25, pinY: 84,
  },
];

// Load issues: from localStorage (rule engine results) or demo fallback
function loadIssues() {
  try {
    const stored = localStorage.getItem('bcc-results');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load results from localStorage:', e);
  }
  return DEMO_ISSUES;
}

const ISSUES = loadIssues();

let currentFilter = 'all';
let currentCountry = 'all';
let currentAssignee = 'all';
let activeIssueId = null;

// ─── Stat counts ──────────────────────────────────────────────
function updateStatCounts() {
  const critical = ISSUES.filter(i => i.type === 'critical').length;
  const warning  = ISSUES.filter(i => i.type === 'warning').length;
  const safe     = ISSUES.filter(i => i.type === 'safe').length;
  const total    = ISSUES.length;

  const criticalEl = document.querySelector('.stat-pill.critical');
  const warningEl  = document.querySelector('.stat-pill.warning');
  const safeEl     = document.querySelector('.stat-pill.safe');
  const allEl      = document.querySelector('.stat-pill.all');

  if (criticalEl) criticalEl.innerHTML = `<span class="stat-dot critical"></span>${critical} 수정 필수`;
  if (warningEl)  warningEl.innerHTML  = `<span class="stat-dot warning"></span>${warning} 확인 필요`;
  if (safeEl)     safeEl.innerHTML     = `<span class="stat-dot safe"></span>${safe} 안전`;
  if (allEl)      allEl.textContent    = `전체 ${total}건`;

  // Also update filter-tab badges
  const filterCritical = document.querySelector('.filter-tab [data-type=critical]');
  const filterWarning  = document.querySelector('.filter-tab [data-type=warning]');
  const filterSafe     = document.querySelector('.filter-tab [data-type=safe]');
  // Simple approach: update the span text inside filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    const onclick = tab.getAttribute('onclick') || '';
    if (onclick.includes("'critical'")) {
      const span = tab.querySelector('span');
      if (span) span.textContent = critical;
    } else if (onclick.includes("'warning'")) {
      const span = tab.querySelector('span');
      if (span) span.textContent = warning;
    } else if (onclick.includes("'safe'")) {
      const span = tab.querySelector('span');
      if (span) span.textContent = safe;
    }
  });
}

// ─── Issue card builder (shared) ──────────────────────────────
function buildIssueCard(issue) {
  const isActive = activeIssueId === issue.id;
  return `
    <div class="issue-item ${issue.type} ${isActive ? 'active' : ''}"
         id="issue-${issue.id}" onclick="selectIssue(${issue.id})">
      <div class="issue-item-inner">
        <div class="issue-header">
          <div class="issue-pin-id ${issue.type}">${issue.id}</div>
          <div class="issue-title">${issue.title}</div>
          <div class="issue-flags">
            ${issue.country.map(f => `<span style="font-size:14px;">${f}</span>`).join('')}
          </div>
        </div>
        <div class="issue-body">
          <div class="issue-row">
            <span class="issue-label">위치</span>
            <span class="issue-value">${issue.location}</span>
          </div>
          ${issue.current ? `<div class="issue-row">
            <span class="issue-label">현재</span>
            <span class="issue-value"><code>${issue.current}</code></span>
          </div>` : ''}
          <div class="issue-fix ${issue.type}">
            <div class="issue-fix-label">${issue.type === 'safe' ? '확인' : '수정안'}</div>
            <div class="issue-fix-text">${issue.fix}</div>
          </div>
          ${issue.rule ? `<div style="margin-top:6px;"><code style="background:var(--bg-subtle);border:1px solid var(--border);padding:2px 7px;border-radius:3px;font-size:11px;font-family:monospace;color:var(--text-muted);">📋 ${issue.rule}</code></div>` : ''}
          ${issue.assignee ? `<span class="issue-assignee">👤 ${issue.assignee}</span>` : ''}
        </div>
      </div>
    </div>`;
}

// ─── Render issues ─────────────────────────────────────────────
function getFilteredIssues() {
  return ISSUES.filter(issue => {
    const typeMatch     = currentFilter   === 'all' || issue.type === currentFilter;
    const countryMatch  = currentCountry  === 'all' || issue.country.some(c => c.includes(currentCountry));
    const assigneeMatch = currentAssignee === 'all' || (issue.assignee && issue.assignee.includes(currentAssignee));
    return typeMatch && countryMatch && assigneeMatch;
  });
}

function renderIssues() {
  const list     = document.getElementById('issueList');
  const filtered = getFilteredIssues();

  if (filtered.length === 0) {
    list.innerHTML = '<div class="no-results" style="padding:40px 20px;text-align:center;color:var(--text-muted);font-size:14px;">해당 조건의 항목이 없습니다.</div>';
    return;
  }
  list.innerHTML = filtered.map(buildIssueCard).join('');
}

// ─── Pin positioning ───────────────────────────────────────────
let pinsReady = false;

function positionPins() {
  const wrap = document.getElementById('imageWrap');
  const img  = document.getElementById('labelImg');
  if (!wrap || !img) return;

  const W = img.offsetWidth;
  const H = img.offsetHeight;
  if (W === 0 || H === 0) {
    // Image not sized yet — retry after short delay
    setTimeout(positionPins, 100);
    return;
  }

  wrap.querySelectorAll('.pin').forEach(p => p.remove());

  ISSUES.forEach(issue => {
    const pin = document.createElement('div');
    pin.className = `pin ${issue.type}`;
    pin.id        = `pin-${issue.id}`;
    pin.textContent = issue.id;
    pin.style.left  = (issue.pinX / 100 * W) + 'px';
    pin.style.top   = (issue.pinY / 100 * H) + 'px';
    pin.title       = issue.title;
    pin.setAttribute('aria-label', issue.title);
    pin.onclick = () => selectIssue(issue.id);
    wrap.appendChild(pin);
  });

  // Subtle entry animation for pins
  if (!pinsReady) {
    pinsReady = true;
    wrap.querySelectorAll('.pin').forEach((pin, i) => {
      pin.style.opacity = '0';
      pin.style.transform = 'translate(-50%, -50%) scale(0.5)';
      pin.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => {
        pin.style.opacity = '1';
        pin.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 200 + i * 50);
    });
  }
}

// ─── Select an issue ──────────────────────────────────────────
function selectIssue(id) {
  activeIssueId = id;

  // Highlight pin
  document.querySelectorAll('.pin').forEach(p => p.classList.remove('active'));
  const pin = document.getElementById(`pin-${id}`);
  if (pin) pin.classList.add('active');

  // Make sure the issue is visible in the current filter view
  const issue = ISSUES.find(i => i.id === id);
  if (issue && currentFilter !== 'all' && currentFilter !== issue.type) {
    filterIssues(issue.type, null);
  }

  // Highlight issue card
  document.querySelectorAll('.issue-item').forEach(el => el.classList.remove('active'));
  const issueEl = document.getElementById(`issue-${id}`);
  if (issueEl) {
    issueEl.classList.add('active');
    issueEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ─── Filter by severity ────────────────────────────────────────
function filterIssues(type, tabEl) {
  currentFilter = type;
  renderIssues();

  if (tabEl) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
  } else {
    // Find and activate the right tab
    document.querySelectorAll('.filter-tab').forEach(t => {
      const onclick = t.getAttribute('onclick') || '';
      if (onclick.includes(`'${type}'`)) t.classList.add('active');
      else t.classList.remove('active');
    });
  }
}

// ─── Filter by assignee ────────────────────────────────────────
function filterAssignee(val) {
  currentAssignee = val;
  renderIssues();
}

// ─── Filter by country ─────────────────────────────────────────
function filterCountry(val) {
  currentCountry = val;
  renderIssues();

  document.querySelectorAll('.country-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.country === val);
  });
}

// ─── Chatbot ──────────────────────────────────────────────────
function toggleChatbot() {
  const body = document.getElementById('chatbotBody');
  const icon = document.getElementById('chatbotToggleIcon');
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  icon.textContent = isHidden ? '▲' : '▼';
}

const CHAT_RESPONSES = {
  default: {
    text: '죄송합니다, 해당 질문에 대한 정확한 규제 정보를 찾지 못했습니다. 보다 구체적인 성분명, 표현, 또는 규제명을 포함해 질문해 주세요.<br><br>예: "AHA 경고문", "drug claim 대안", "net quantity 표기법"',
    ref: ''
  },
  'drug': {
    text: '<strong>Drug Claim</strong>이란 화장품 라벨이나 광고에서 의약품적 효능을 주장하는 표현입니다.<br><br>❌ 금지 표현:<br>• "치료(treat)", "예방(prevent)", "치유(cure)"<br>• "피부 재생", "주름 제거", "세포 복구"<br><br>✅ 허용 표현 (cosmetic claim):<br>• "보습", "피부 결 개선", "유연" <br>• "fine line의 외관 개선", "피부를 촉촉하게"<br><br><strong style="color:var(--safe)">원칙: 구조적 변화 → drug / 외관 변화 → cosmetic</strong>',
    ref: '근거: FD&C Act 201(g)(1) | Rule: US-LAB-004'
  },
  'aha': {
    text: '<strong>AHA(알파하이드록시산)</strong> 함유 제품의 FDA 필수 경고문:<br><br><code style="background:var(--bg-subtle);border:1px solid var(--border);padding:8px 10px;display:block;border-radius:4px;font-size:11.5px;line-height:1.6;margin:8px 0;">Sunburn Alert: This product contains an alpha hydroxy acid (AHA) that may increase your skin\'s sensitivity to the sun and particularly the possibility of sunburn. Use a sunscreen, wear protective clothing, and limit sun exposure while using this product and for a week afterwards.</code><br>이 경고문 누락 시 <strong style="color:var(--critical)">Critical 위반</strong>(US-LAB-005)입니다.',
    ref: '근거: 21 CFR 740.19'
  },
  'whitening': {
    text: '<strong>"Whitening / 미백"</strong> 표현의 국가별 규제:<br><br>🇺🇸 미국: "whitening"은 cosmetic claim으로 허용. 단 "skin lightening"은 OTC drug으로 분류 가능<br>🇰🇷 한국: 미백 기능성 화장품 심사 필요 (KR-LAB-002)<br>🇨🇳 중국: 특수화장품(미백) 등록 필수<br>🇪🇺 EU: 규제된 성분(예: hydroquinone) 포함 시 금지<br><br>→ <strong>"brightening"</strong>이 더 안전한 대안입니다.',
    ref: '근거: 21 CFR 310.545(a)(13), 한국 화장품법 4조'
  },
  'antiaging': {
    text: 'FDA 기준 <strong>"anti-aging"</strong> 표현:<br><br>✅ 허용: "reduces the appearance of fine lines", "helps skin look younger"<br>❌ 금지: "reverses aging", "eliminates wrinkles", "repairs skin cells"<br><br>핵심은 "외관(appearance)" 개선 vs "실제 구조 변화" 구분입니다.',
    ref: '근거: FD&C Act 201(g)(1) | Rule: US-LAB-004'
  },
  'oz': {
    text: '<strong>Net Quantity(순함량) 표시 규정 (21 CFR 701.13)</strong>:<br><br>미국 수출 화장품에는 <strong>유체 oz (fl oz)</strong> 단위가 필수입니다.<br><br>올바른 형식: <code style="background:var(--bg-subtle);border:1px solid var(--border);padding:2px 6px;border-radius:3px;">Net Wt. 150 ml / 5 fl oz</code><br><br>정확한 변환: 150ml ÷ 29.5735 ≈ <strong>5.07 fl oz → 표기: 5 fl oz</strong><br><br>추가로 패키지 PDP 면적에 따라 폰트 최소 높이 규정도 있습니다.',
    ref: '근거: 21 CFR 701.13 | Rule: US-LAB-002, US-LAB-006'
  },
  'inci': {
    text: '<strong>INCI 성분 표기 규정 (21 CFR 701.3)</strong>:<br><br>• 모든 성분을 INCI 국제 명칭으로 표기<br>• 함량 내림차순 정렬 (1% 이하 성분은 순서 무관)<br>• 향료는 "Fragrance" 또는 개별 성분명<br><br>흔한 실수:<br>❌ "Glycerln" → ✅ "Glycerin"<br>❌ "Water" → ✅ "Aqua"<br>❌ "Vitamin C" → ✅ "Ascorbic Acid"',
    ref: '근거: 21 CFR 701.3 | Rule: US-LAB-001'
  },
  'address': {
    text: '<strong>제조사/유통사 정보 표기 규정 (21 CFR 701.12)</strong>:<br><br>미국 수출 화장품에는 아래 중 하나가 필수:<br>• 제조사 미국 주소 (City, State, ZIP)<br>• 미국 내 유통업자(Distributor) 주소<br><br>✅ 올바른 형식:<br><code style="background:var(--bg-subtle);border:1px solid var(--border);padding:4px 8px;display:block;border-radius:3px;margin:6px 0;font-size:12px;">Distributed by: ABC Beauty USA Inc.<br>Los Angeles, CA 90001 USA</code>',
    ref: '근거: 21 CFR 701.12 | Rule: US-LAB-003'
  },
};

function matchChatResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('drug') || lower.includes('claim') || lower.includes('치료') || lower.includes('재생') || lower.includes('prevent') || lower.includes('cure'))
    return CHAT_RESPONSES['drug'];
  if (lower.includes('aha') || lower.includes('경고문') || lower.includes('alpha hydroxy') || lower.includes('선번'))
    return CHAT_RESPONSES['aha'];
  if (lower.includes('whitening') || lower.includes('미백') || lower.includes('brightening'))
    return CHAT_RESPONSES['whitening'];
  if (lower.includes('anti-aging') || lower.includes('antiaging') || lower.includes('anti aging') || lower.includes('주름'))
    return CHAT_RESPONSES['antiaging'];
  if (lower.includes('oz') || lower.includes('순함량') || lower.includes('net') || lower.includes('quantity') || lower.includes('fl oz'))
    return CHAT_RESPONSES['oz'];
  if (lower.includes('inci') || lower.includes('성분') || lower.includes('ingredient') || lower.includes('glycerin'))
    return CHAT_RESPONSES['inci'];
  if (lower.includes('주소') || lower.includes('address') || lower.includes('distributor') || lower.includes('유통사') || lower.includes('제조사'))
    return CHAT_RESPONSES['address'];
  return CHAT_RESPONSES.default;
}

function sendChat() {
  const input    = document.getElementById('chatInput');
  const msg      = input.value.trim();
  if (!msg) return;

  const messages = document.getElementById('chatMessages');
  messages.innerHTML += `
    <div class="chat-msg user">
      <div class="chat-avatar user">👤</div>
      <div class="chat-bubble">${msg}</div>
    </div>`;
  input.value = '';

  // Scroll to bottom
  const body = document.getElementById('chatbotBody');
  body.scrollTop = body.scrollHeight;

  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  messages.innerHTML += `
    <div class="chat-msg bot" id="${typingId}">
      <div class="chat-avatar bot">AI</div>
      <div class="chat-bubble" style="color:var(--text-muted);font-style:italic;">분석 중...</div>
    </div>`;
  body.scrollTop = body.scrollHeight;

  const resp = matchChatResponse(msg);
  setTimeout(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    messages.innerHTML += `
      <div class="chat-msg bot">
        <div class="chat-avatar bot">AI</div>
        <div class="chat-bubble">
          ${resp.text}
          ${resp.ref ? `<div class="chat-bubble-ref">${resp.ref}</div>` : ''}
        </div>
      </div>`;
    body.scrollTop = body.scrollHeight;
  }, 700);
}

// ─── Metadata display ─────────────────────────────────────────
function updateMetadata() {
  try {
    const metaStr = localStorage.getItem('bcc-metadata');
    const formStr = localStorage.getItem('bcc-formData');
    if (!metaStr && !formStr) return;

    const meta = metaStr ? JSON.parse(metaStr) : {};
    const form = formStr ? JSON.parse(formStr) : {};

    const typeNames = { label: '패키지 라벨', web: '온라인 상세페이지', ad: '광고/마케팅 카피', doc: '수출 인허가 서류' };
    const countryNames = { us: '미국 FDA/MoCRA', kr: '한국 화장품법', eu: 'EU 1223/2009', cn: '중국 NMPA', asean: 'ASEAN ACD' };
    const flags = { us: '🇺🇸', kr: '🇰🇷', eu: '🇪🇺', cn: '🇨🇳', asean: '🌏' };

    // Extract product name from first line of text
    const firstLine = (form.text || '').split('\n')[0].trim();
    const productName = firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;

    // Header meta
    const headerEl = document.getElementById('headerMeta');
    if (headerEl && form.countries) {
      const flagStr = form.countries.map(c => flags[c] || c).join(' ');
      headerEl.textContent = `${productName} · ${typeNames[form.contentType] || ''} · ${flagStr}`;
    }

    // Detail meta
    const titleEl = document.getElementById('metaTitle');
    if (titleEl && productName) titleEl.textContent = productName;

    const detailEl = document.getElementById('metaDetail');
    if (detailEl && form.countries) {
      const regs = form.countries.map(c => countryNames[c] || c).join(' · ');
      detailEl.textContent = `${typeNames[form.contentType] || ''} | ${form.category || ''} | ${regs}`;
    }

    const timeEl = document.getElementById('metaTime');
    if (timeEl && meta.timestamp) {
      const d = new Date(meta.timestamp);
      timeEl.textContent = d.toLocaleDateString('ko-KR') + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (timeEl) {
      timeEl.textContent = new Date().toLocaleDateString('ko-KR') + ' ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    console.warn('[Results] Failed to update metadata:', e);
  }
}

// ─── Load uploaded label image ────────────────────────────────
function loadUploadedImage() {
  try {
    const imageData = localStorage.getItem('bcc-labelImage');
    if (imageData) {
      const img = document.getElementById('labelImg');
      if (img) {
        img.src = imageData;
        img.alt = '업로드된 제품 라벨 시안';
      }
    }
  } catch (e) {
    console.warn('Failed to load uploaded image:', e);
  }
}

// ─── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUploadedImage();
  updateMetadata();
  updateStatCounts();
  renderIssues();

  // Position pins: try now, retry when image loads (handles both cached and fresh SVG)
  const img = document.getElementById('labelImg');
  if (img) {
    if (img.complete && img.naturalHeight !== 0) {
      positionPins();
    }
    img.addEventListener('load', positionPins);
  }

  window.addEventListener('resize', () => {
    pinsReady = false;
    positionPins();
  });
});
