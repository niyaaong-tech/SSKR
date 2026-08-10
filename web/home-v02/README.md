# SSKR Service HOME v0.2

SSKR 서비스 웹의 디자인 문법을 실제 HTML/CSS/JS에서 먼저 검증하기 위한 데스크톱 우선 HOME 프로토타입입니다.

## 목적

Figma P0 Lo-fi의 문서형 박스 구조를 확장하지 않고, 실제 출시된 서비스처럼 보이는 HOME 한 장에서 시각 언어와 UX 위계를 먼저 확정합니다.

핵심 흐름:

```text
Cinematic Hero
→ Event TL;DR
→ Journey
→ Start Spots
→ Regional Spots
→ Memory
→ Stories
→ Final CTA
```

## 우선 원칙

1. **Desktop Art Direction First** — 1440~1600px에서의 완성도를 1순위로 본다.
2. SSTR에서는 기능의 맥과 Event 생애주기만 참고한다. 일본식 웹 IA/UX/시각 문법은 참고하지 않는다.
3. Norton식 cinematic art direction을 중심축으로, LiveWire식 정보 압축, Savic식 큰 수치와 technical visual, Malle식 rally culture를 역할별로 혼합한다.
4. 동일한 카드/박스 반복보다 섹션마다 다른 공간 구조를 사용한다.
5. 이미지, 지도, 경로, 대형 타이포그래피가 실제 정보 구조의 일부가 되어야 한다.
6. Event Day 실진행 기능은 본 프로토타입의 중심이 아니다. Pre/Post Event 경험을 우선한다.

## 현재 구현

- 100svh cinematic Hero
- 프로젝트 정밀 한반도 SVG를 CSS mask로 재사용
- Sunrise → Sunset route animation
- Event 핵심정보 strip
- scroll-progress Journey route
- Start Spot editorial cards
- Regional Spot theme switcher + save-state mock
- Post Event Journey/Record mock
- Event Story editorial layout
- Final application CTA
- responsive rearrangement
- reduced-motion 대응

## 에셋 정책

- 한반도 Shape: `assets/vector/korean_peninsula_precise.svg` 프로젝트 정본 사용
- 현재 모터사이클 사진: **레이아웃/아트디렉션 검증용 Unsplash editorial placeholder**
- 실제 서비스 단계에서는 한국 SSKR 촬영물 또는 사용권이 확보된 한국 라이딩 이미지로 교체한다.

현재 placeholder는 Unsplash License로 공개된 다음 작가/이미지를 사용한다.

- Long Chung — motorcyclists on a winding mountain road
- Isaac Mitchell — motorcycle on a mountain road
- Nitin Mishra — motorcycle journey landscape
- Nishal Pavithran — motorcycle road at sunset

## 실행

정적 파일이므로 저장소 루트를 HTTP 서버로 열면 됩니다.

```bash
python -m http.server 8080
# http://localhost:8080/web/home-v02/
```

`file://` 직접 실행보다 HTTP 서버 실행을 권장합니다. 외부 이미지와 SVG mask 동작을 같은 조건에서 확인하기 쉽습니다.

## 다음 검수

HOME 한 장을 브라우저에서 실제 1600px 기준으로 확인한 뒤 아래를 리뷰합니다.

- Hero가 SSKR를 첫 장면에서 설명하는가
- 전체 페이지가 카드형 SaaS UI가 아니라 premium motorcycle/event brand처럼 보이는가
- Journey / Start / Spot / Memory의 장면 구분이 충분한가
- 정보 밀도가 너무 높거나 너무 장식적으로 흐르지 않는가
- 한국 지형/SSKR 고유성이 외국 stock imagery보다 강하게 느껴지는가

이 검수가 끝나기 전에는 다른 서비스 화면을 같은 문법으로 대량 확장하지 않습니다.
