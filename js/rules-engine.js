// ============================================================
// Beauty Copy Checker — Client-side Rule Engine
// Loads JSON data files and runs deterministic checks
// ============================================================

// Data stores (loaded async)
let drugClaimPatterns = null;
let inciDatabase = null;
let rulesUSFDA = null;
let rulesKRMFDS = null;

// Load all data files
async function loadRuleData() {
  try {
    const [dcRes, inciRes, usRes, krRes] = await Promise.all([
      fetch('data/drug-claim-patterns.json'),
      fetch('data/inci-database.json'),
      fetch('data/rules-us-fda.json'),
      fetch('data/rules-kr-mfds.json'),
    ]);
    drugClaimPatterns = await dcRes.json();
    inciDatabase = await inciRes.json();
    rulesUSFDA = await usRes.json();
    rulesKRMFDS = await krRes.json();
    console.log('[RuleEngine] Data loaded:', {
      patterns: drugClaimPatterns.patterns.en.critical.length + drugClaimPatterns.patterns.ko.critical.length,
      ingredients: inciDatabase.ingredients.length,
      usRules: rulesUSFDA.rules.length,
      krRules: rulesKRMFDS.rules.length,
    });
    return true;
  } catch (e) {
    console.warn('[RuleEngine] Failed to load data:', e);
    return false;
  }
}

// ============================================================
// Check functions
// ============================================================

/**
 * Detect drug claim expressions in text
 * Returns array of issue objects
 */
function detectDrugClaims(text, countries) {
  if (!drugClaimPatterns) return [];
  const issues = [];
  const lowerText = text.toLowerCase();
  let issueId = 0;

  // English patterns
  if (countries.includes('us') || countries.includes('eu')) {
    for (const pattern of drugClaimPatterns.patterns.en.critical) {
      const lowerPattern = pattern.toLowerCase();
      const idx = lowerText.indexOf(lowerPattern);
      if (idx !== -1) {
        const contextStart = Math.max(0, idx - 20);
        const contextEnd = Math.min(text.length, idx + lowerPattern.length + 20);
        const context = text.substring(contextStart, contextEnd);
        issues.push({
          id: ++issueId,
          type: 'critical',
          title: `Drug Claim 표현 감지 — "${pattern}"`,
          country: countries.includes('us') ? ['🇺🇸'] : ['🇪🇺'],
          rule: 'US-LAB-004 · FD&C Act 201(g)(1)',
          location: '텍스트 내 감지',
          current: `"...${context}..."`,
          fix: `"${pattern}" 표현을 cosmetic claim으로 교체하세요`,
          assignee: '문안검토 에이전시',
          pinX: 50 + Math.random() * 30,
          pinY: 20 + Math.random() * 40,
        });
        break; // one critical per pattern group is enough
      }
    }

    for (const pattern of drugClaimPatterns.patterns.en.warning) {
      const lowerPattern = pattern.toLowerCase();
      if (lowerText.indexOf(lowerPattern) !== -1) {
        issues.push({
          id: ++issueId,
          type: 'warning',
          title: `효능 표현 검토 필요 — "${pattern}"`,
          country: ['🇺🇸'],
          rule: 'US-WEB-001 · FD&C Act',
          location: '텍스트 내 감지',
          current: `"${pattern}" 표현이 포함되어 있습니다`,
          fix: '맥락에 따라 cosmetic claim으로 허용될 수 있으나, drug claim과 결합 시 문제 소지',
          assignee: '문안검토 에이전시',
          pinX: 50 + Math.random() * 30,
          pinY: 20 + Math.random() * 40,
        });
      }
    }
  }

  // Korean patterns
  if (countries.includes('kr')) {
    for (const pattern of drugClaimPatterns.patterns.ko.critical) {
      if (text.includes(pattern)) {
        const idx = text.indexOf(pattern);
        const contextStart = Math.max(0, idx - 15);
        const contextEnd = Math.min(text.length, idx + pattern.length + 15);
        const context = text.substring(contextStart, contextEnd);
        issues.push({
          id: ++issueId,
          type: 'critical',
          title: `식약처 금지 표현 감지 — "${pattern}"`,
          country: ['🇰🇷'],
          rule: 'KR-AD-001 · 화장품법 제13조',
          location: '한국어 텍스트 내 감지',
          current: `"...${context}..."`,
          fix: `"${pattern}" 표현은 의약품 오인 표현으로 금지됩니다. cosmetic claim으로 교체하세요`,
          assignee: '문안검토 에이전시',
          pinX: 20 + Math.random() * 30,
          pinY: 20 + Math.random() * 40,
        });
      }
    }

    for (const pattern of drugClaimPatterns.patterns.ko.warning) {
      if (text.includes(pattern)) {
        issues.push({
          id: ++issueId,
          type: 'warning',
          title: `한국어 효능 표현 검토 — "${pattern}"`,
          country: ['🇰🇷'],
          rule: 'KR-AD-002 · 화장품법 제13조',
          location: '한국어 텍스트 내 감지',
          current: `"${pattern}" 표현이 포함되어 있습니다`,
          fix: '기능성 화장품 심사 필요 여부 또는 과대 광고 해당 여부를 확인하세요',
          assignee: '문안검토 에이전시',
          pinX: 20 + Math.random() * 30,
          pinY: 20 + Math.random() * 40,
        });
      }
    }
  }

  // Deduplicate by title similarity
  const seen = new Set();
  return issues.filter(issue => {
    const key = issue.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Validate INCI ingredient names
 * Checks for misspellings against the INCI database
 */
function validateINCI(text) {
  if (!inciDatabase) return [];
  const issues = [];

  // Extract ingredients section
  const inciMatch = text.match(/INGREDIENTS?\s*[:：]\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
  if (!inciMatch) return [];

  const ingredientText = inciMatch[1];
  const ingredientList = ingredientText.split(/[,،]/).map(s => s.trim()).filter(Boolean);

  for (const rawIngredient of ingredientList) {
    // Clean up: remove trailing period, parenthetical info
    const ingredient = rawIngredient.replace(/\.$/, '').trim();
    if (!ingredient || ingredient.length < 3) continue;

    // Check against INCI database
    for (const entry of inciDatabase.ingredients) {
      // Check if this ingredient is a known misspelling
      const misspellings = entry.common_misspellings.map(m => m.toLowerCase());
      if (misspellings.includes(ingredient.toLowerCase()) && ingredient.toLowerCase() !== entry.inci_name.toLowerCase()) {
        issues.push({
          id: 0,
          type: 'warning',
          title: `INCI 스펠링 오류 — "${ingredient}"`,
          country: ['🇺🇸', '🇰🇷'],
          rule: 'US-LAB-001 · 21 CFR 701.3',
          location: '성분표',
          current: `"${ingredient}"`,
          fix: `"${entry.inci_name}" — INCI DB 공식 명칭 (${entry.korean_name})`,
          assignee: '디자이너',
          pinX: 60 + Math.random() * 20,
          pinY: 40 + Math.random() * 15,
        });
      }

      // Simple Levenshtein-like check for close matches
      if (ingredient.length > 5 && entry.inci_name.length > 5) {
        const dist = levenshtein(ingredient.toLowerCase(), entry.inci_name.toLowerCase());
        if (dist > 0 && dist <= 2 && ingredient.toLowerCase() !== entry.inci_name.toLowerCase()) {
          // Avoid duplicates from misspelling check
          const alreadyFound = issues.some(i => i.current && i.current.includes(ingredient));
          if (!alreadyFound) {
            issues.push({
              id: 0,
              type: 'warning',
              title: `INCI 스펠링 의심 — "${ingredient}"`,
              country: ['🇺🇸', '🇰🇷'],
              rule: 'US-LAB-001 · 21 CFR 701.3',
              location: '성분표',
              current: `"${ingredient}"`,
              fix: `"${entry.inci_name}"이(가) 의도한 성분인지 확인하세요`,
              assignee: '디자이너',
              pinX: 60 + Math.random() * 20,
              pinY: 40 + Math.random() * 15,
            });
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Levenshtein distance for typo detection
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

/**
 * Check for required fields based on content type and country
 */
function checkRequiredFields(text, contentType, countries) {
  const issues = [];
  const lowerText = text.toLowerCase();

  if (contentType === 'label') {
    // US-LAB-001: INCI ingredient list presence
    if (countries.includes('us') || countries.includes('kr')) {
      const hasIngredients = /ingredients?\s*[:：]/i.test(text);
      if (hasIngredients) {
        issues.push({
          id: 0, type: 'safe',
          title: 'INCI 성분표 — 확인',
          country: countries.includes('us') ? ['🇺🇸'] : ['🇰🇷'],
          rule: 'US-LAB-001 · 21 CFR 701.3',
          location: '성분표 영역',
          current: 'INCI 성분 목록이 확인됨',
          fix: '기준 충족.',
          assignee: null,
          pinX: 65, pinY: 45,
        });
      } else {
        issues.push({
          id: 0, type: 'critical',
          title: 'INCI 성분표 누락',
          country: ['🇺🇸', '🇰🇷'],
          rule: 'US-LAB-001 · 21 CFR 701.3',
          location: '전체 라벨',
          current: '"INGREDIENTS:" 섹션이 감지되지 않았습니다',
          fix: '모든 성분을 INCI 명칭으로 함량 내림차순으로 나열하세요',
          assignee: '디자이너',
          pinX: 65, pinY: 45,
        });
      }
    }

    // US-LAB-002: Net Quantity with oz
    if (countries.includes('us')) {
      const hasMetric = /\b\d+\s*m[lL]\b/.test(text) || /\b\d+\s*g\b/.test(text);
      const hasOz = /\b(fl\s*oz|oz)\b/i.test(text);
      if (hasMetric && !hasOz) {
        issues.push({
          id: 0, type: 'critical',
          title: 'Net Quantity oz 단위 누락',
          country: ['🇺🇸'],
          rule: 'US-LAB-002 · 21 CFR 701.13',
          location: '순함량 표시 영역',
          current: 'ml/g 단위만 표기됨 (oz 누락)',
          fix: 'fl oz 또는 oz 단위를 병기하세요 (예: 150 ml / 5 fl oz)',
          assignee: '디자이너',
          pinX: 75, pinY: 34,
        });
      } else if (hasMetric && hasOz) {
        issues.push({
          id: 0, type: 'safe',
          title: 'Net Quantity 이중 단위 — 확인',
          country: ['🇺🇸'],
          rule: 'US-LAB-002 · 21 CFR 701.13',
          location: '순함량 표시',
          current: 'oz/fl oz + ml/g 이중 단위 확인됨',
          fix: '기준 충족.',
          assignee: null,
          pinX: 75, pinY: 34,
        });
      }
    }

    // US-LAB-003: US distributor/manufacturer address
    if (countries.includes('us')) {
      const hasUSAddress = /\b[A-Z]{2}\s+\d{5}\b/.test(text) || /\bUSA\b/.test(text);
      const hasDistributor = /distributed\s+by/i.test(text) || /manufactured\s+for/i.test(text);
      if (!hasUSAddress) {
        issues.push({
          id: 0, type: 'critical',
          title: '제조사/유통사 미국 주소 누락',
          country: ['🇺🇸'],
          rule: 'US-LAB-003 · 21 CFR 701.12',
          location: '제조사 정보 영역',
          current: '미국 주소 형식 (City, State ZIP, USA)이 감지되지 않았습니다',
          fix: '"Distributed by: [Company], [City], [State] [ZIP], USA" 추가 필요',
          assignee: '제조사',
          pinX: 25, pinY: 70,
        });
      } else {
        issues.push({
          id: 0, type: 'safe',
          title: '미국 주소 정보 — 확인',
          country: ['🇺🇸'],
          rule: 'US-LAB-003 · 21 CFR 701.12',
          location: '제조사/유통사 정보',
          current: '미국 주소 형식이 확인됨',
          fix: '기준 충족.',
          assignee: null,
          pinX: 25, pinY: 70,
        });
      }
    }

    // US-LAB-005: AHA warning check
    if (countries.includes('us')) {
      const ahaIngredients = ['glycolic acid', 'lactic acid', 'citric acid', 'malic acid', 'tartaric acid', 'alpha hydroxy', 'aha'];
      const hasAHA = ahaIngredients.some(ing => lowerText.includes(ing));
      if (hasAHA) {
        const hasSunburnAlert = lowerText.includes('sunburn alert');
        if (!hasSunburnAlert) {
          issues.push({
            id: 0, type: 'critical',
            title: 'AHA 제품 필수 경고문 누락',
            country: ['🇺🇸'],
            rule: 'US-LAB-005 · 21 CFR 740',
            location: '경고문 영역',
            current: 'AHA 성분이 포함되어 있으나 "Sunburn Alert" 경고문이 없습니다',
            fix: '"Sunburn Alert: This product contains an alpha hydroxy acid (AHA)..." 경고문 추가 필수',
            assignee: '제조사',
            pinX: 50, pinY: 80,
          });
        }
      }
    }

    // WARNINGS section presence
    const hasWarnings = /warnings?\s*[:：]/i.test(text);
    if (hasWarnings) {
      issues.push({
        id: 0, type: 'safe',
        title: '경고문 섹션 — 확인',
        country: countries.includes('us') ? ['🇺🇸'] : ['🇰🇷'],
        rule: 'US-LAB-005',
        location: '경고문 영역',
        current: '경고문 섹션이 확인됨',
        fix: '기준 충족.',
        assignee: null,
        pinX: 50, pinY: 82,
      });
    }
  }

  // KR-LAB-002: Functional cosmetics keywords
  if (countries.includes('kr')) {
    const funcKeywords = ['미백', '화이트닝', '주름개선', '주름 개선', '안티링클', '자외선차단', '자외선 차단', '선블록', 'UV 차단'];
    for (const kw of funcKeywords) {
      if (text.includes(kw)) {
        issues.push({
          id: 0, type: 'warning',
          title: `기능성 화장품 심사 필요 — "${kw}"`,
          country: ['🇰🇷'],
          rule: 'KR-LAB-002 · 화장품법 제4조',
          location: '텍스트 내 감지',
          current: `"${kw}" 표현이 포함되어 있습니다`,
          fix: '이 기능을 표방하려면 식약처 기능성 화장품 심사가 필요합니다',
          assignee: '제조사',
          pinX: 30, pinY: 25,
        });
      }
    }
  }

  return issues;
}

/**
 * Check PDP font size against 21 CFR 701.13 requirements
 */
function validatePDPFontSize(dimensions) {
  if (!dimensions || !dimensions.pdpAreaSqIn) return [];
  const issues = [];
  const area = dimensions.pdpAreaSqIn;

  let minHeightMm, minLabel;
  if (area <= 5) { minHeightMm = 1.6; minLabel = '1/16 in (1.6mm)'; }
  else if (area <= 25) { minHeightMm = 3.2; minLabel = '1/8 in (3.2mm)'; }
  else if (area <= 100) { minHeightMm = 4.8; minLabel = '3/16 in (4.8mm)'; }
  else if (area <= 400) { minHeightMm = 6.4; minLabel = '1/4 in (6.4mm)'; }
  else { minHeightMm = 12.7; minLabel = '1/2 in (12.7mm)'; }

  if (dimensions.fontSizeMm) {
    if (dimensions.fontSizeMm < minHeightMm) {
      issues.push({
        id: 0, type: 'critical',
        title: '순함량 폰트 크기 기준 미달',
        country: ['🇺🇸'],
        rule: 'US-LAB-006 · 21 CFR 701.13',
        location: '순함량 표시',
        current: `현재 ${dimensions.fontSizeMm}mm (PDP ${area.toFixed(1)} sq in)`,
        fix: `PDP 면적 기준 최소 ${minLabel} 이상 필요`,
        assignee: '디자이너',
        pinX: 25, pinY: 34,
      });
    } else {
      issues.push({
        id: 0, type: 'safe',
        title: '순함량 폰트 크기 — 적합',
        country: ['🇺🇸'],
        rule: 'US-LAB-006 · 21 CFR 701.13',
        location: '순함량 표시',
        current: `${dimensions.fontSizeMm}mm (최소 ${minLabel})`,
        fix: '기준 충족.',
        assignee: null,
        pinX: 25, pinY: 34,
      });
    }
  } else {
    issues.push({
      id: 0, type: 'warning',
      title: '순함량 폰트 크기 — 검증 불가',
      country: ['🇺🇸'],
      rule: 'US-LAB-006 · 21 CFR 701.13',
      location: '순함량 표시',
      current: `치수 미입력으로 자동 검증 불가 (PDP ${area.toFixed(1)} sq in)`,
      fix: `이 면적 기준 최소 ${minLabel} 이상 폰트 높이 필요`,
      assignee: '디자이너',
      pinX: 25, pinY: 34,
    });
  }

  return issues;
}

// ============================================================
// Main orchestrator
// ============================================================

/**
 * Run all checks and return unified issues array
 * @param {Object} formData - { text, contentType, countries, category, dimensions }
 * @returns {Array} issues array matching results.js ISSUES format
 */
function runAllChecks(formData) {
  const { text, contentType, countries, category, dimensions } = formData;
  let allIssues = [];

  // 1. Drug claim detection
  const drugIssues = detectDrugClaims(text, countries);
  allIssues = allIssues.concat(drugIssues);

  // 2. INCI validation
  const inciIssues = validateINCI(text);
  allIssues = allIssues.concat(inciIssues);

  // 3. Required fields check
  const fieldIssues = checkRequiredFields(text, contentType, countries);
  allIssues = allIssues.concat(fieldIssues);

  // 4. PDP font size validation
  if (countries.includes('us') && dimensions) {
    const fontIssues = validatePDPFontSize(dimensions);
    allIssues = allIssues.concat(fontIssues);
  }

  // Re-number IDs and sort by severity
  const severityOrder = { critical: 0, warning: 1, safe: 2 };
  allIssues.sort((a, b) => severityOrder[a.type] - severityOrder[b.type]);
  allIssues.forEach((issue, i) => { issue.id = i + 1; });

  // Store metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    formData: {
      contentType,
      countries,
      category,
      textLength: text.length,
      hasDimensions: !!dimensions,
    },
    summary: {
      total: allIssues.length,
      critical: allIssues.filter(i => i.type === 'critical').length,
      warning: allIssues.filter(i => i.type === 'warning').length,
      safe: allIssues.filter(i => i.type === 'safe').length,
    },
  };
  localStorage.setItem('bcc-metadata', JSON.stringify(metadata));

  console.log('[RuleEngine] Analysis complete:', metadata.summary);
  return allIssues;
}

// Auto-load data on script load
let ruleDataReady = false;
let ruleDataPromise = loadRuleData().then(ok => { ruleDataReady = ok; return ok; });
