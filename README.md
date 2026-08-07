# SSKR — SUNRISE SUNSET KOREAN RALLY

SSKR 기획·비주얼·HTML 프레젠테이션 개발 자료 저장소입니다.

2026-08-08 기준으로 기존 실험용 GitHub Pages 프로젝트를 정리하고, 현재 확정·검토 중인 문서와 제작 자산을 기준으로 저장소를 재구성했습니다.

## 현재 작업 초점

SSKR는 여러 동해·남동해안 스타팅 스팟에서 동틀녘에 출발해, 참가자가 자유롭게 지역과 경로를 선택하고, 서해의 하나의 피니시에 해질녘까지 도착하는 비경쟁형 스마트 모터사이클 랠리입니다.

현재 우선 제작 대상은 HTML 프레젠테이션의 **Scene 05 — Journey Map / 하루의 횡단**입니다.

Scene 05는 다음을 한 장면 안에서 연결합니다.

`한반도 Overview → 남한 Zoom → Dawn Start → Daylight Route Network → Sunset Finish → Personal Route`

## 저장소 구조

```text
docs/
  planning/        서비스·사업·비주얼·HTML PT 계획
  research/        HTML/CSS PT 기술 리서치
  benchmark/       SSTR/SSTE 역기획
  scene05/         Scene 05 지형/라이팅 세부 전략

assets/
  vector/          정밀 한반도 SVG 정본
  source/          SVG 제작 원본의 Git용 reference
  concept/         기존 생성 이미지의 WebP 개발 레퍼런스

tools/
  scene05-terrain-kit/
                    실제 DEM → Three.js terrain asset 제작 파이프라인
```

## 한반도 지형 정본 원칙

- **해안선/국토 외곽:** `assets/vector/korean_peninsula_precise.svg`
- **산악 고도:** 실제 DEM/DSM
- **스타트/체크포인트/피니시/Route:** WGS84 좌표 기반
- **생성 이미지:** camera / lighting / atmosphere / route-language 레퍼런스로만 사용

실제 DEM 원본 GeoTIFF는 용량과 재생성 가능성을 이유로 Git에 커밋하지 않습니다. `tools/scene05-terrain-kit/`의 manifest와 downloader로 재구축합니다.

## Scene 05 Terrain Kit

개발 PC에서:

```bash
bash tools/scene05-terrain-kit/scripts/fetch_and_build_scene05.sh
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File tools/scene05-terrain-kit/scripts/fetch_and_build_scene05.ps1
```

자세한 전략은 `docs/scene05/Scene05_한반도_리얼지형_시간라이팅_제작전략_v0.1.md`를 참고합니다.

## Concept Art 주의

`assets/concept/`의 이미지는 개발 참고용입니다. 해안선, 산맥, 도로, 스타팅 스팟의 지리적 정확성을 보증하지 않습니다. 최종 Scene 05는 정밀 SVG + 실제 DEM + 좌표 기반 Route로 다시 구축합니다.
