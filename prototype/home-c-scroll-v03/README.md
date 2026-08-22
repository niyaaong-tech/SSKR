# SSKR HOME v0.3 — C Scroll Prototype

Production HOME을 바꾸지 않고 C안의 스크롤 서사를 검증하는 독립 프로토타입입니다.

## Flow

```text
HOME Intro / Gateway
→ Horizon
→ Geography / Korea Route
→ Places & People
→ Trace / Memory
→ Sunset Hold
→ Footer
```

## 구현 원칙

- Desktop art direction 우선
- HTML / CSS / inline SVG / vanilla JavaScript
- 공통 SVG path가 `Horizon → Korea Route → Time Trace`로 전환
- Geography 후반에 남한 중심 3.4배 확대, 이후 동일 route path를 오른쪽에서 왼쪽으로 수평 전개
- `05:31 → 18:47`의 5개 이벤트 노드와 폴라로이드 카드가 우측부터 순차 누적
- sticky stage, path draw, node reveal, map-to-place circle clip, memory reveal, sunset hold
- 프로젝트 정본 `assets/vector/korean_peninsula_precise.svg` 직접 재사용
- 생성형 지형 에셋을 사용하지 않음
- `prefers-reduced-motion`에서는 긴 sticky 모션 대신 읽을 수 있는 정적 흐름 제공

사진은 레이아웃 및 전환 검증을 위한 Unsplash editorial placeholder이며 실제 SSKR 촬영물로 교체해야 합니다.

HOME hero의 `assets/hero-sunrise-drawing-v01.png`는 바다·일출·하늘·구름을 주제로 제작한 painterly key visual입니다. UI와 타이포그래피는 이미지에 포함하지 않고 HTML 레이어로 유지합니다.

Trace / Memory의 `assets/west-sea-sunset-horizon-v01.png`는 지형 없이 서해의 바다·수평선·낙조만으로 제작했습니다. 태양은 별도 CSS 레이어로 두어 마지막 기억이 등장할 때 화면 왼쪽 수평선으로 내려갑니다.

## 실행

저장소 루트에서 정적 서버를 연 뒤 다음 주소로 접속합니다.

```text
http://localhost:8080/prototype/home-c-scroll-v03/
```

기존 `vercel.json`과 `web/home-v02/`는 변경하지 않았습니다.

## QA

`qa/`에는 1600×1000 브라우저에서 캡처한 Intro, Geography, Places, Memory, Sunset Hold, Footer 키프레임이 있습니다.
