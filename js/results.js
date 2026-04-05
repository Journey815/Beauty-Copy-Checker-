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
    location: '한국어 제품 설명 2번째 줄',
    current: '"트러블이 있는 피부를 완치시켜 드립니다"',
    fix: '"트러블이 있는 피부를 케어해 드립니다"로 교체',
    assignee: '문안검토 에이전시',
    pinX: 72, pinY: 29,
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

// ─── Chatbot Knowledge Base ──────────────────────────────────
const CHAT_RESPONSES = {
  default: {
    text: '해당 질문에 대한 정확한 규제 정보를 찾지 못했습니다. 아래 주제로 질문해 보세요.<br><br>• <strong>규제 주제:</strong> drug claim, AHA 경고문, 미백, 주름, 순함량(oz), INCI 성분, 주소, 폰트 크기, 바코드, MoCRA, 기능성 화장품<br>• <strong>분석 결과:</strong> "1번 항목", "2번 이슈" 등 번호로 질문<br>• <strong>대안 표현:</strong> "치료 대안", "완치 대안" 등',
    ref: ''
  },
  drug: {
    text: '<strong>Drug Claim vs Cosmetic Claim (FD&C Act 201(g)(1))</strong><br><br>FDA는 "신체 구조·기능에 영향을 미친다"는 표현을 drug claim으로 분류합니다.<br><br>❌ <strong>금지 (drug claim)</strong>:<br>• treat, cure, prevent, heal, repair<br>• 치료, 완치, 예방, 피부 재생, 세포 복구, 주름 제거<br><br>✅ <strong>허용 (cosmetic claim)</strong>:<br>• 보습, 피부 결 개선, 피부를 촉촉하게<br>• "reduces the appearance of fine lines"<br>• "helps skin look smoother"<br><br><strong style="color:var(--safe)">판단 기준: 구조적 변화 → drug / 외관 변화 → cosmetic</strong><br><br>한국 화장품법 제13조에서도 의약품 오인 표현을 동일하게 금지합니다.',
    ref: '근거: FD&C Act 201(g)(1), 21 CFR 700-740, 화장품법 제13조 | Rule: US-LAB-004, KR-AD-001'
  },
  aha: {
    text: '<strong>AHA 함유 제품 필수 경고문 (21 CFR 740.19)</strong><br><br>Glycolic Acid, Lactic Acid, Citric Acid, Malic Acid, Tartaric Acid 등 AHA 성분이 포함된 제품은 아래 경고문이 <strong style="color:var(--critical)">필수</strong>입니다:<br><br><code style="background:var(--bg-subtle);border:1px solid var(--border);padding:8px 10px;display:block;border-radius:4px;font-size:11.5px;line-height:1.6;margin:8px 0;">Sunburn Alert: This product contains an alpha hydroxy acid (AHA) that may increase your skin\'s sensitivity to the sun and particularly the possibility of sunburn. Use a sunscreen, wear protective clothing, and limit sun exposure while using this product and for a week afterwards.</code><br>이 경고문이 누락되면 <strong style="color:var(--critical)">Critical 위반</strong>입니다. 경고문 폰트도 21 CFR 740 기준을 충족해야 합니다.',
    ref: '근거: 21 CFR 740.19 | Rule: US-LAB-005, US-LAB-008'
  },
  whitening: {
    text: '<strong>"Whitening / 미백" 국가별 규제</strong><br><br>🇺🇸 <strong>미국</strong>: "whitening"은 cosmetic claim으로 허용. 단, "skin lightening"은 OTC drug으로 분류될 수 있음 (21 CFR 310.545(a)(13))<br><br>🇰🇷 <strong>한국</strong>: "미백" 기능을 표방하면 기능성 화장품 심사 필수 (화장품법 제4조, KR-LAB-002). 심사 없이 "미백" 사용 시 위반<br><br>🇨🇳 <strong>중국</strong>: 특수화장품(미백) 등록 필수<br>🇪🇺 <strong>EU</strong>: Hydroquinone 등 규제 성분 포함 시 금지<br><br>→ <strong>"brightening", "luminous", "radiance"</strong>가 글로벌 안전 대안입니다.',
    ref: '근거: 21 CFR 310.545(a)(13), 화장품법 제4조 | Rule: US-LAB-004, KR-LAB-002'
  },
  antiaging: {
    text: '<strong>"Anti-aging" 표현 규제 (FDA / 식약처)</strong><br><br>🇺🇸 FDA 기준:<br>✅ 허용: "reduces the appearance of fine lines", "helps skin look younger", "visibly firms"<br>❌ 금지: "reverses aging", "eliminates wrinkles", "repairs skin cells", "rejuvenates at cellular level"<br><br>🇰🇷 식약처 기준:<br>✅ 허용: "피부 결 개선", "탄력 케어"<br>❌ 금지: "주름 제거", "노화 방지", "세포 재생"<br>⚠️ "주름개선" 표방 시 기능성 화장품 심사 필요 (KR-LAB-002)<br><br><strong style="color:var(--safe)">핵심: "외관(appearance)" 개선은 OK / "실제 구조 변화"는 drug claim</strong>',
    ref: '근거: FD&C Act 201(g)(1), 화장품법 제4조, 제13조 | Rule: US-LAB-004, KR-LAB-002'
  },
  oz: {
    text: '<strong>Net Quantity 순함량 표시 (21 CFR 701.13)</strong><br><br>미국 수출 화장품에는 반드시 <strong>oz 또는 fl oz</strong> 단위를 병기해야 합니다.<br><br>✅ 올바른 형식:<br><code style="background:var(--bg-subtle);border:1px solid var(--border);padding:2px 6px;border-radius:3px;">Net Wt. 150 ml / 5 fl oz</code><br><br><strong>변환 공식:</strong><br>• 액체: ml ÷ 29.5735 = fl oz (150ml → 5.07 → "5 fl oz")<br>• 고체: g ÷ 28.3495 = oz (50g → 1.76 → "1.76 oz")<br><br><strong>PDP 면적별 폰트 최소 높이:</strong><br>• ≤5 sq in → 1.6mm (1/16 in)<br>• ≤25 sq in → 3.2mm (1/8 in)<br>• ≤100 sq in → 4.8mm (3/16 in)<br>• ≤400 sq in → 6.4mm (1/4 in)<br>• >400 sq in → 12.7mm (1/2 in)',
    ref: '근거: 21 CFR 701.13 | Rule: US-LAB-002, US-LAB-006'
  },
  inci: {
    text: '<strong>INCI 성분 표기 규정</strong><br><br>🇺🇸 <strong>FDA (21 CFR 701.3)</strong>:<br>• 모든 성분을 INCI 국제 명칭으로 표기<br>• 함량 내림차순 정렬 (1% 이하 성분은 순서 무관)<br>• 향료: "Fragrance" 통합 표기 또는 개별 성분명<br>• 색소: CI 번호 또는 FDA 승인 색소명<br><br>🇰🇷 <strong>식약처 (시행규칙 제19조)</strong>:<br>• INCI 명칭 또는 대한화장품협회 지정 한글명 사용<br><br><strong>흔한 실수:</strong><br>❌ "Glycerln" → ✅ "Glycerin"<br>❌ "Water" → ✅ "Aqua"<br>❌ "Vitamin C" → ✅ "Ascorbic Acid"<br>❌ "Vitamin E" → ✅ "Tocopherol"',
    ref: '근거: 21 CFR 701.3, 화장품법 시행규칙 제19조 | Rule: US-LAB-001, KR-LAB-001'
  },
  address: {
    text: '<strong>제조사/유통사 정보 (21 CFR 701.12)</strong><br><br>미국 수출 화장품에는 아래 중 하나가 필수:<br>• 제조사의 미국 주소<br>• 미국 내 유통업자(Distributor) 주소<br><br>✅ 올바른 형식:<br><code style="background:var(--bg-subtle);border:1px solid var(--border);padding:4px 8px;display:block;border-radius:3px;margin:6px 0;font-size:12px;">Distributed by: ABC Beauty USA Inc.<br>Los Angeles, CA 90001, USA</code><br><br>⚠️ 반드시 <strong>City, State(2글자 약자), ZIP(5자리)</strong> 형식이어야 합니다.<br>한국 주소만 있으면 <strong style="color:var(--critical)">Critical 위반</strong>입니다.',
    ref: '근거: 21 CFR 701.12 | Rule: US-LAB-003'
  },
  mocra: {
    text: '<strong>MoCRA (Modernization of Cosmetics Regulation Act, 2022)</strong><br><br>2022년 시행된 미국 화장품 규제 현대화법의 주요 요구사항:<br><br>• <strong>시설 등록</strong>: 화장품 제조·가공 시설 FDA 등록 의무<br>• <strong>제품 등록</strong>: 시판 화장품의 성분·라벨 정보 제출<br>• <strong>이상반응 보고</strong>: 심각한 부작용 15영업일 내 FDA 보고<br>• <strong>GMP</strong>: 우수 제조관리 기준 준수<br>• <strong>안전성 입증</strong>: 제품 안전성에 대한 적절한 근거 보유<br>• <strong>향료 공개</strong>: "Fragrance" 내 알레르기 유발 성분 공개 (단계적 시행)<br><br>⚠️ 한국에서 미국으로 수출하는 화장품도 MoCRA 적용 대상입니다.',
    ref: '근거: FD&C Act as amended by MoCRA (Public Law 117-328)'
  },
  functional: {
    text: '<strong>기능성 화장품 (화장품법 제4조)</strong><br><br>한국에서 아래 기능을 표방하려면 식약처 기능성 화장품 <strong>심사·보고</strong>가 필수입니다:<br><br>• <strong>미백</strong>: 피부의 멜라닌 생성을 억제하여 피부를 밝게<br>• <strong>주름개선</strong>: 피부 주름을 완화하거나 개선<br>• <strong>자외선차단</strong>: SPF/PA 등급 표기<br>• <strong>탈모방지</strong>: 2020년부터 추가<br>• <strong>여드름 피부 완화</strong>: 2020년부터 추가<br><br>⚠️ 심사 없이 위 표현 사용 시 <strong style="color:var(--critical)">화장품법 위반</strong>으로 행정처분 대상.<br>"미백" 대신 "브라이트닝/톤업", "주름개선" 대신 "탄력 케어" 등으로 우회 가능하나, 맥락에 따라 규제 대상이 될 수 있습니다.',
    ref: '근거: 화장품법 제4조, 시행규칙 제9조 | Rule: KR-LAB-002'
  },
  fontsize: {
    text: '<strong>순함량 폰트 최소 크기 (21 CFR 701.13)</strong><br><br>PDP(Principal Display Panel) 면적에 따라 Net Quantity 폰트의 <strong>최소 높이</strong>가 정해져 있습니다:<br><br><table style="font-size:12px;width:100%;border-collapse:collapse;"><tr style="border-bottom:1px solid var(--border);"><td style="padding:4px 0;"><strong>PDP 면적</strong></td><td><strong>최소 폰트 높이</strong></td></tr><tr style="border-bottom:1px solid var(--border);"><td style="padding:4px 0;">≤5 sq in</td><td>1/16 in (1.6mm)</td></tr><tr style="border-bottom:1px solid var(--border);"><td style="padding:4px 0;">≤25 sq in</td><td>1/8 in (3.2mm)</td></tr><tr style="border-bottom:1px solid var(--border);"><td style="padding:4px 0;">≤100 sq in</td><td>3/16 in (4.8mm)</td></tr><tr style="border-bottom:1px solid var(--border);"><td style="padding:4px 0;">≤400 sq in</td><td>1/4 in (6.4mm)</td></tr><tr><td style="padding:4px 0;">>400 sq in</td><td>1/2 in (12.7mm)</td></tr></table><br>이 폰트 높이는 소문자 "o"의 높이 기준입니다.',
    ref: '근거: 21 CFR 701.13(i) | Rule: US-LAB-006'
  },
  barcode: {
    text: '<strong>바코드 규격 (GS1 General Specifications)</strong><br><br>화장품 패키지의 바코드는 GS1 표준을 따라야 합니다:<br><br>• <strong>최소 배율</strong>: GS1 표준 크기의 80% 이상<br>• <strong>최대 배율</strong>: 200%<br>• <strong>Quiet Zone</strong>: 바코드 좌우에 최소 여백 확보<br>• <strong>명암비</strong>: 충분한 대비 필요 (검정 바, 흰색 배경 권장)<br>• <strong>인쇄 품질</strong>: ISO/IEC 15416 기준 Grade C 이상<br><br>⚠️ 배율이 80% 미만이면 스캐너 인식 실패 위험이 있습니다.',
    ref: '근거: GS1 General Specifications Section 5 | Rule: US-LAB-007'
  },
  warning: {
    text: '<strong>경고문/주의사항 규정</strong><br><br>🇺🇸 <strong>FDA (21 CFR 740)</strong>:<br>• "For external use only" — 외용 전용 제품 필수<br>• "Avoid contact with eyes" — 눈 접촉 주의<br>• AHA 제품: Sunburn Alert 필수 (US-LAB-005)<br>• 경고문 폰트도 최소 크기 규정 적용 (US-LAB-008)<br><br>🇰🇷 <strong>식약처</strong>:<br>• 사용 시 주의사항 필수 표기<br>• 알레르기 유발 성분 별도 경고<br>• 어린이 사용 제한 제품 경고문<br><br>경고문은 소비자가 쉽게 읽을 수 있는 크기와 위치에 배치해야 합니다.',
    ref: '근거: 21 CFR 740, 화장품법 시행규칙 제19조 | Rule: US-LAB-005, US-LAB-008'
  },
};

// Topic keyword mapping — order matters (first match wins)
const CHAT_TOPICS = [
  { key: 'drug',       keywords: ['drug', 'claim', '치료', '재생', 'prevent', 'cure', 'treat', 'heal', '의약품', '금지 표현', '허용 표현', 'cosmetic claim'] },
  { key: 'aha',        keywords: ['aha', 'alpha hydroxy', 'glycolic', 'lactic acid', 'sunburn alert'] },
  { key: 'whitening',  keywords: ['whitening', '미백', 'brightening', 'lightening', '화이트닝'] },
  { key: 'antiaging',  keywords: ['anti-aging', 'antiaging', 'anti aging', '주름', '안티에이징', 'wrinkle', 'aging', '노화'] },
  { key: 'functional', keywords: ['기능성', '기능성 화장품', '심사', '보고', '탈모', '여드름'] },
  { key: 'mocra',      keywords: ['mocra', '시설 등록', '이상반응', 'gmp'] },
  { key: 'oz',         keywords: ['oz', 'fl oz', '순함량', 'net wt', 'net quantity', '단위', '변환'] },
  { key: 'fontsize',   keywords: ['폰트', 'font', 'pdp', '면적', '최소 크기', '높이'] },
  { key: 'barcode',    keywords: ['바코드', 'barcode', 'gs1', '배율', 'quiet zone'] },
  { key: 'inci',       keywords: ['inci', '성분', 'ingredient', 'glycerin', '함량순', '성분표'] },
  { key: 'address',    keywords: ['주소', 'address', 'distributor', '유통사', '제조사', 'zip'] },
  { key: 'warning',    keywords: ['경고문', 'warning', '주의사항', 'external use', '경고'] },
];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Match issue by number reference (e.g., "1번", "2번 항목", "#3")
function matchIssueReference(msg) {
  const numMatch = msg.match(/(\d+)\s*번|#(\d+)/);
  if (!numMatch) return null;
  const num = parseInt(numMatch[1] || numMatch[2]);
  const issue = ISSUES.find(i => i.id === num);
  if (!issue) return null;

  const typeLabel = { critical: '🔴 수정 필수', warning: '🟡 확인 필요', safe: '🟢 안전' };
  const statusLabel = typeLabel[issue.type] || issue.type;

  let text = `<strong>${issue.id}번: ${issue.title}</strong><br>상태: ${statusLabel}<br><br>`;
  if (issue.location) text += `<strong>위치:</strong> ${issue.location}<br>`;
  if (issue.current) text += `<strong>현재:</strong> <code style="background:var(--bg-subtle);border:1px solid var(--border);padding:1px 6px;border-radius:3px;font-size:11.5px;">${issue.current}</code><br>`;
  if (issue.fix) text += `<br><strong>수정안:</strong> ${issue.fix}<br>`;
  if (issue.assignee) text += `<br>👤 담당: ${issue.assignee}`;

  return {
    text: text,
    ref: issue.rule ? `규칙: ${issue.rule}` : ''
  };
}

function matchChatResponse(msg) {
  const lower = msg.toLowerCase();

  // 1. Check for issue number reference
  const issueRef = matchIssueReference(msg);
  if (issueRef) return issueRef;

  // 2. Topic keyword matching
  for (const topic of CHAT_TOPICS) {
    if (topic.keywords.some(kw => lower.includes(kw))) {
      return CHAT_RESPONSES[topic.key];
    }
  }

  return CHAT_RESPONSES.default;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const rawMsg = input.value.trim();
  if (!rawMsg) return;

  const safeMsg = escapeHtml(rawMsg);
  const messages = document.getElementById('chatMessages');
  messages.innerHTML += `
    <div class="chat-msg user">
      <div class="chat-avatar user">👤</div>
      <div class="chat-bubble">${safeMsg}</div>
    </div>`;
  input.value = '';

  const body = document.getElementById('chatbotBody');
  body.scrollTop = body.scrollHeight;

  const typingId = 'typing-' + Date.now();
  messages.innerHTML += `
    <div class="chat-msg bot" id="${typingId}">
      <div class="chat-avatar bot">AI</div>
      <div class="chat-bubble" style="color:var(--text-muted);font-style:italic;">분석 중...</div>
    </div>`;
  body.scrollTop = body.scrollHeight;

  const resp = matchChatResponse(rawMsg);
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
      const catDisplay = Array.isArray(form.category) ? form.category.join(', ') : (form.category || '');
      detailEl.textContent = `${typeNames[form.contentType] || ''} | ${catDisplay} | ${regs}`;
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

// ─── Action Items Table (dynamic) ─────────────────────────────
function renderActionTable() {
  const tbody = document.getElementById('actionTableBody');
  const summaryEl = document.getElementById('actionSummaryText');
  if (!tbody) return;

  // Only show actionable issues (critical + warning)
  const actionable = ISSUES.filter(i => i.type === 'critical' || i.type === 'warning');

  if (actionable.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">수정이 필요한 항목이 없습니다.</td></tr>';
    if (summaryEl) summaryEl.textContent = '이슈 없음';
    return;
  }

  // Group by assignee
  const groups = {};
  for (const issue of actionable) {
    const assignee = issue.assignee || '미지정';
    if (!groups[assignee]) groups[assignee] = [];
    groups[assignee].push(issue);
  }

  const typeIcon = { critical: '●', warning: '▲' };
  const typeColor = { critical: 'var(--critical)', warning: 'var(--warning)' };
  const typeBadge = { critical: '<span class="badge badge-critical">수정 필수</span>', warning: '<span class="badge badge-warning">확인 필요</span>' };

  let html = '';
  for (const [assignee, issues] of Object.entries(groups)) {
    issues.forEach((issue, idx) => {
      html += '<tr>';
      if (idx === 0) {
        html += `<td rowspan="${issues.length}"><span class="assignee-badge">${assignee}</span></td>`;
      }
      const icon = typeIcon[issue.type] || '';
      const color = typeColor[issue.type] || 'var(--text)';
      const shortTitle = issue.title.length > 50 ? issue.title.substring(0, 50) + '...' : issue.title;
      html += `<td><span style="color:${color};font-weight:600;">${icon}${issue.id}</span> ${shortTitle}</td>`;
      html += `<td>${typeBadge[issue.type] || ''}</td>`;
      const shortFix = issue.fix.length > 60 ? issue.fix.substring(0, 60) + '...' : issue.fix;
      html += `<td style="font-size:12.5px;color:var(--text-muted);">${shortFix}</td>`;
      html += '</tr>';
    });
  }

  tbody.innerHTML = html;

  const assigneeCount = Object.keys(groups).length;
  if (summaryEl) summaryEl.textContent = `총 ${actionable.length}건 · 담당 ${assigneeCount}그룹`;
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
  renderActionTable();

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
