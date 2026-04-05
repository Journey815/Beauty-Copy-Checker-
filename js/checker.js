// ============================================================
// Beauty Copy Checker — Checker Page JS
// ============================================================

// State
let selectedType = 'label';
let selectedCountries = ['us', 'kr'];
let selectedCategories = [];

// Type selection
function selectType(card) {
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedType = card.dataset.type;

  const typeNames = {
    label: '패키지 라벨', web: '온라인 상세페이지',
    ad: '광고/마케팅 카피', doc: '수출 인허가 서류'
  };
  document.getElementById('sb-type-val').textContent = typeNames[selectedType] || selectedType;
  document.getElementById('sum-type').textContent = typeNames[selectedType] || selectedType;
  checkReady();
}

// Country toggle
function toggleCountry(row) {
  const country = row.dataset.country;
  row.classList.toggle('selected');
  if (row.classList.contains('selected')) {
    if (!selectedCountries.includes(country)) selectedCountries.push(country);
  } else {
    selectedCountries = selectedCountries.filter(c => c !== country);
  }
  updateCountrySummary();
  checkReady();
}

function updateCountrySummary() {
  const flags = { us: '🇺🇸', kr: '🇰🇷', eu: '🇪🇺', cn: '🇨🇳', asean: '🌏' };
  const val = selectedCountries.length === 0 ? '선택 없음'
    : selectedCountries.map(c => flags[c]).join(' ') + ` (${selectedCountries.length}개국)`;
  document.getElementById('sb-country-val').textContent = val;
  const names = { us: '🇺🇸 미국', kr: '🇰🇷 한국', eu: '🇪🇺 EU', cn: '🇨🇳 중국', asean: '🌏 ASEAN' };
  document.getElementById('sum-countries').textContent = selectedCountries.map(c => names[c]).join(', ') || '없음';
}

// Category selection (multi-select)
function selectChip(chip) {
  const cat = chip.dataset.cat;
  chip.classList.toggle('selected');

  if (chip.classList.contains('selected')) {
    if (!selectedCategories.includes(cat)) selectedCategories.push(cat);
  } else {
    selectedCategories = selectedCategories.filter(c => c !== cat);
  }

  const selectedChips = document.querySelectorAll('.chip.selected');
  const names = Array.from(selectedChips).map(c => c.textContent);
  const display = names.length === 0 ? '미선택' : names.join(', ');
  document.getElementById('sb-cat-val').textContent = names.length ? `${names.length}개 선택` : '미선택';
  document.getElementById('sum-category').textContent = display;
  checkReady();
}

// Character counter
function updateCounter() {
  const input = document.getElementById('copyInput');
  const count = input.value.length;
  document.getElementById('charCounter').textContent = count.toLocaleString() + '자';
  document.getElementById('sb-input-val').textContent = count.toLocaleString() + '자 입력됨';
  document.getElementById('sum-chars').textContent = count.toLocaleString() + '자';
  checkReady();
}

// Check ready state
function checkReady() {
  const hasCountry = selectedCountries.length > 0;
  const hasCategory = selectedCategories.length > 0;
  const hasInput = document.getElementById('copyInput').value.trim().length > 10;
  const btn = document.getElementById('analyzeBtn');
  const msg = document.getElementById('actionBarMsg');
  const summaryPanel = document.getElementById('summaryPanel');

  if (hasCountry && hasCategory && hasInput) {
    btn.disabled = false;
    btn.style.opacity = '1';
    msg.textContent = '검토 준비 완료 — 분석을 시작해보세요';
    msg.style.color = 'var(--safe)';
    summaryPanel.classList.add('visible');
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    msg.style.color = 'var(--text-muted)';
    summaryPanel.classList.remove('visible');
    if (!hasCountry) msg.textContent = '대상국을 1개 이상 선택해주세요';
    else if (!hasCategory) msg.textContent = '제품 카테고리를 선택해주세요';
    else msg.textContent = '카피 텍스트를 10자 이상 입력해주세요';
  }
}

// Sample text
function loadSampleText() {
  const sample = `AQUA GLOW SERUM
KOREAN SKINCARE INNOVATION — HYDRATING & BRIGHTENING

INGREDIENTS: Aqua, Glycerin, Niacinamide, Butylene Glycol, Panthenol, Sodium Hyaluronate, Centella Asiatica Extract, Aloe Barbadensis Leaf Juice, Ceramide NP, Betaine, Allantoin, Carbomer, Tromethamine, PEG-60 Hydrogenated Castor Oil, 1,2-Hexanediol, Propanediol, Ethylhexylglycerin, Disodium EDTA, Adenosine, Citrus Aurantium Bergamia (Bergamot) Fruit Oil, Limonene, Linalool.

이 세럼은 피부 재생을 도와 주름을 치료합니다. 하이드레이션 기능과 미백 효과로 피부 트러블을 완치시켜 드립니다.

Net Weight: 150ml

MANUFACTURED FOR:
SEOUL BEAUTY LAB Co., Ltd.

WARNINGS: For external use only. Avoid contact with eyes.`;
  document.getElementById('copyInput').value = sample;
  updateCounter();
}

// ── Image Upload ──────────────────────────────────────────────
let uploadedImageData = null;

function handleImageUpload(files) {
  if (!files || files.length === 0) return;
  const file = files[0];

  if (!file.type.match(/^image\/(png|jpeg|svg\+xml|webp)$/)) {
    alert('PNG, JPG, SVG, WebP 형식만 지원합니다.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하여야 합니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Resize if wider than 1200px to keep localStorage under limit
      const MAX_W = 1200;
      let dataUrl = e.target.result;

      if (img.width > MAX_W && file.type !== 'image/svg+xml') {
        const canvas = document.createElement('canvas');
        const scale = MAX_W / img.width;
        canvas.width = MAX_W;
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }

      uploadedImageData = dataUrl;
      showImagePreview(file.name, file.size, dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function showImagePreview(name, size, dataUrl) {
  const zone = document.getElementById('uploadZone');
  const preview = document.getElementById('uploadPreview');
  const previewImg = document.getElementById('uploadPreviewImg');
  const fileName = document.getElementById('uploadFileName');
  const fileSize = document.getElementById('uploadFileSize');

  zone.style.display = 'none';
  preview.classList.add('visible');
  previewImg.src = dataUrl;
  fileName.textContent = name;

  const kb = (size / 1024).toFixed(0);
  fileSize.textContent = kb > 1024 ? (size / 1024 / 1024).toFixed(1) + ' MB' : kb + ' KB';

  document.getElementById('sb-image-val').textContent = name;
}

function removeImage() {
  uploadedImageData = null;
  const zone = document.getElementById('uploadZone');
  const preview = document.getElementById('uploadPreview');
  const fileInput = document.getElementById('imageFileInput');

  zone.style.display = '';
  preview.classList.remove('visible');
  fileInput.value = '';
  document.getElementById('sb-image-val').textContent = '미첨부';
}

// Drag & drop
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handleImageUpload(e.dataTransfer.files);
  });
});

// Dimensions toggle
function toggleDimensions() {
  const toggle = document.getElementById('dimToggle');
  const panel = document.getElementById('dimPanel');
  toggle.classList.toggle('open');
  panel.classList.toggle('open');
}

// Auto-calculate PDP area
document.addEventListener('DOMContentLoaded', () => {
  const pdpW = document.getElementById('pdpW');
  const pdpH = document.getElementById('pdpH');

  function calcArea() {
    const w = parseFloat(pdpW.value);
    const h = parseFloat(pdpH.value);
    if (w && h) {
      const areaMm2 = w * h;
      const areaCm2 = areaMm2 / 100;
      const areaSqIn = areaMm2 / 645.16;
      document.getElementById('pdpArea').value = `${areaCm2.toFixed(1)} cm²`;

      let minFont = '';
      if (areaSqIn <= 5) minFont = '1/16 in (1.6mm)';
      else if (areaSqIn <= 25) minFont = '1/8 in (3.2mm)';
      else if (areaSqIn <= 100) minFont = '3/16 in (4.8mm)';
      else if (areaSqIn <= 400) minFont = '1/4 in (6.4mm)';
      else minFont = '1/2 in (12.7mm)';

      // Barcode scale recommendation based on available space
      let barcodeRec = '', barcodeNote = '';
      if (areaSqIn <= 5) {
        barcodeRec = '80%';
        barcodeNote = '최소 허용 배율. Quiet zone 확보에 주의';
      } else if (areaSqIn <= 15) {
        barcodeRec = '80–90%';
        barcodeNote = '공간 제약 시 축소 가능, 인쇄 품질 확인 필요';
      } else if (areaSqIn <= 50) {
        barcodeRec = '90–100%';
        barcodeNote = '표준 크기 권장';
      } else if (areaSqIn <= 200) {
        barcodeRec = '100–120%';
        barcodeNote = '표준~확대. 스캔 안정성 우수';
      } else {
        barcodeRec = '100–150%';
        barcodeNote = '대형 패키지. 여유 있게 배치 권장';
      }

      const resultEl = document.getElementById('pdpResult');
      resultEl.style.display = 'block';
      document.getElementById('pdpResultText').innerHTML =
        `PDP 면적 <strong>${areaCm2.toFixed(1)} cm²</strong> (${areaSqIn.toFixed(1)} sq in) 기준<br>
         순함량 폰트 최소 높이: <strong>${minFont}</strong> (21 CFR 701.13)<br>
         바코드 권장 배율: <strong>${barcodeRec}</strong> — ${barcodeNote} (GS1 최소 80%)`;
    }
  }

  pdpW.addEventListener('input', calcArea);
  pdpH.addEventListener('input', calcArea);
});

// Scroll to section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Start analysis
async function startAnalysis() {
  // Collect form data for rule engine
  const formData = {
    text: document.getElementById('copyInput').value,
    contentType: selectedType,
    countries: [...selectedCountries],
    category: [...selectedCategories],
    dimensions: null
  };

  // Collect dimensions if entered
  const pdpW = document.getElementById('pdpW');
  const pdpH = document.getElementById('pdpH');
  const fontSizeEl = document.getElementById('fontSize');
  if (pdpW && pdpH && pdpW.value && pdpH.value) {
    const w = parseFloat(pdpW.value);
    const h = parseFloat(pdpH.value);
    formData.dimensions = {
      pdpWidthMm: w,
      pdpHeightMm: h,
      pdpAreaMm2: w * h,
      pdpAreaSqIn: (w * h) / 645.16,
      fontSizeMm: fontSizeEl ? parseFloat(fontSizeEl.value) || null : null
    };
  }

  // Store form data for results page
  localStorage.setItem('bcc-formData', JSON.stringify(formData));

  // Store uploaded label image (or clear if none)
  if (uploadedImageData) {
    try {
      localStorage.setItem('bcc-labelImage', uploadedImageData);
    } catch (e) {
      console.warn('Image too large for localStorage, skipping:', e);
    }
  } else {
    localStorage.removeItem('bcc-labelImage');
  }

  // Show loading animation immediately
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');

  const steps = [
    { delay: 300,  state: 'running' },
    { delay: 900,  state: 'running' },
    { delay: 1600, state: 'running' },
    { delay: 2400, state: 'running' },
    { delay: 3200, state: 'running' },
    { delay: 4000, state: 'running' },
  ];

  steps.forEach((s, i) => {
    setTimeout(() => {
      const el = document.getElementById(`ls-${i}`);
      el.classList.add('visible', 'running');
      if (i > 0) {
        const prev = document.getElementById(`ls-${i-1}`);
        prev.classList.remove('running');
        prev.classList.add('done');
      }
    }, s.delay);
  });

  // Wait for rule data to load, then run analysis
  if (typeof ruleDataPromise !== 'undefined') {
    await ruleDataPromise;
  }

  if (typeof runAllChecks === 'function') {
    const results = runAllChecks(formData);
    localStorage.setItem('bcc-results', JSON.stringify(results));
  }

  setTimeout(() => {
    document.getElementById('ls-5').classList.remove('running');
    document.getElementById('ls-5').classList.add('done');
  }, 4800);

  setTimeout(() => {
    window.location.href = 'results.html';
  }, 5400);
}

// Init
checkReady();
