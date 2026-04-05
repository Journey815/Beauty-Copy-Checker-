# Beauty Copy Checker — CLAUDE.md

## 프로젝트 개요

뷰티 브랜드의 해외 수출용 제품 카피(패키지 라벨, 상세페이지, 광고 문구)를 업로드하면, **국가별 규제 준수 여부 + 텍스트 품질**을 자동 검토하여 수정 가이드를 제공하는 웹 서비스.

**핵심 원칙**: 번역기가 아니라, "이미 번역된 카피가 규제에 맞는지 검증"하는 도구.

## 현재 상태

**MVP 프로토타입 (정적 HTML)** — 백엔드 없는 프론트엔드 데모 단계.

```
checker.html        — 카피 검토 입력 화면
index.html          — 랜딩/메인 페이지
results.html        — 검토 결과 화면
style.css           — 공통 스타일시트
product_label.svg   — 제품 라벨 예시
text_document.html  — 텍스트 문서 뷰
DESIGN.md           — 디자인 시스템 (Alexandria)
prd.md              — 제품 요구사항 전문
```

## 디자인 시스템: Alexandria

"The Digital Curator" — 학술적이고 프리미엄한 에디토리얼 경험.

### 색상
- **Primary**: `#094cb2` — 링크, 주요 액션, 포커스 상태에만 사용
- **Surface 계층**: 배경색 단계(lowest → dim)로 위계 표현. 명시적 보더 금지
- **Tertiary**: `#6d5e00` — 아카이벌 골드, 하이라이트/뱃지용
- **No-Line Rule**: 1px 보더 사용 금지. 배경색 변화로 경계 정의
- 플로팅 메뉴: glassmorphism (80% opacity + 20px backdrop-blur)
- CTA: primary → primary_container 그라디언트

### 타이포그래피
| 용도 | 폰트 | 성격 |
|------|-------|------|
| Headlines | **Noto Serif** | 권위, 넉넉한 행간 |
| Body | **Inter** | 밀도 높은 텍스트의 현대적 가독성 |
| Labels | **Public Sans** | 아카이벌 메타데이터 느낌 |

### 엘리베이션
- 깊이는 톤 레이어링으로 표현 (그림자 아님)
- 모달: 극도로 확산된 그림자 (24-40px blur, 4-6% opacity)
- 보더 필요 시: "Ghost Border" — `outline_variant` 15% opacity

### 컴포넌트
- **버튼**: Primary=그라디언트, Secondary=surface-high bg, Tertiary=텍스트+hover 밑줄
- **카드**: 구분선 없음. 간격 또는 교대 surface 색상 사용
- **인풋**: 흰 배경, ghost border, 포커스 시 primary border
- 모서리: 항상 최소 `sm` 라운드

## MVP 스코프 (미국 FDA + 한국 화장품법)

### 검토 대상
1. **제품 패키지 라벨** — INCI, 사용법, 경고문, 용량, 제조사 정보
2. **온라인 상세페이지** — 제품명, 효능 표현, 성분, 주의사항

### 핵심 검증 항목
| ID | 항목 | 심각도 |
|----|------|--------|
| US-LAB-001 | INCI 성분 함량순 표기 | Critical |
| US-LAB-002 | Net Quantity (oz/fl oz) 필수 | Critical |
| US-LAB-003 | 제조사/유통사 정보 필수 | Critical |
| US-LAB-004 | Drug Claim 금지 표현 감지 | Critical |
| US-LAB-005 | 필수 경고문 (AHA, 자외선차단 등) | Major |
| US-LAB-006 | 순함량 폰트 최소 크기 (PDP 면적 기준) | Critical |
| KR-AD-001 | 식약처 금지 표현 목록 대조 | Critical |

### 결과 표시 체계
| 색상 | 상태 | 의미 |
|------|------|------|
| 빨강 (●) | 수정 필수 | 규제 위반, 수출 불가 |
| 노랑 (▲) | 확인 필요 | 오탈자 의심, 경계선 표현 |
| 초록 (✓) | 안전 | 준수 확인됨 |

### 사용자 플로우
```
텍스트 입력 → 패키지 치수(선택) → 대상국 선택 → 콘텐츠 유형 → 카테고리 → AI 분석 → 결과 리포트
```

## 기술 스택 (목표)

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | Next.js + TypeScript + Tailwind + shadcn/ui |
| AI/LLM | Claude API (맥락 판단 + 수정 제안) |
| 규제 검증 | Rule-based 엔진 우선, LLM은 보조 |
| 맞춤법 | 한국어: 부산대 API / 영어: LanguageTool |
| DB | PostgreSQL + pgvector |

**설계 원칙**: 규제 준수 여부는 반드시 Rule Engine이 담당. LLM은 맥락 판단과 수정 제안 생성에만 활용 (hallucination 방지).

## 작업 규칙

- 현재는 정적 HTML 프로토타입 — 수정 시 기존 파일 편집 우선
- Alexandria 디자인 시스템 준수 (No-Line Rule, surface 계층, 라운드 코너)
- 규제 관련 텍스트는 PRD의 룰 ID와 법적 근거를 정확히 참조
- "이 서비스는 법률 자문이 아닙니다" 면책 고지 항상 포함
