# SSKR — SUNRISE SUNSET KOREAN RALLY

SSKR 기획·비주얼·HTML 프레젠테이션 개발 자료 저장소입니다.

2026-08-08 기준으로 **기존 GitHub Pages 실험 프로젝트는 제거**하고, 현재 확보된 SSKR 작업 자료를 로컬에서 다시 이어갈 수 있도록 저장소를 작업 스냅샷 중심으로 재구성했습니다.

## 현재 작업 초점

현재 우선 제작 대상은 HTML 프레젠테이션의 **Scene 05 — Journey Map / 하루의 횡단**입니다.

```text
한반도 Overview
→ 남한 Zoom
→ 동해·남동해안 Dawn Start
→ Daylight Route Network
→ 서해 Sunset Finish
→ Personal Route
```

Scene 05의 지도는 생성형 이미지로 지형을 결정하지 않습니다.

- 해안선/국토 Shape: 프로젝트 정밀 한반도 SVG
- 산악 relief: 실제 DEM/DSM
- Start / Checkpoint / Finish / Route: WGS84 좌표 기반
- 생성 이미지: camera / lighting / atmosphere / route-language 컨셉 레퍼런스

## 저장 방식

GitHub 커넥터 환경에서 바이너리·대용량 작업물을 안전하게 보존하기 위해 현재 작업공간을 **clone-safe snapshot archive**로 저장했습니다.

```text
snapshot/
├─ SNAPSHOT_INFO.md
├─ unpack_snapshot.py
└─ parts/
   ├─ part_00.b64
   ├─ ...
   └─ part_06.b64
```

스냅샷에는 다음 범주가 포함됩니다.

- SSKR 서비스/사업/비주얼/PT 기획 자료
- 정밀 한반도 벡터 및 지도 제작 소스
- 현재 확보된 컨셉 비주얼의 압축 개발 레퍼런스
- Scene 05 Real Terrain Asset Kit
- Copernicus DEM / Mapzen Skadi 재확보 manifest 및 downloader
- Dawn → Daylight → Sunset 라이팅 preset과 Three.js용 helper

Raw Copernicus DEM GeoTIFF 자체는 용량과 재생성 가능성을 이유로 포함하지 않았습니다. 스냅샷 안의 downloader와 manifest로 로컬에서 다시 확보합니다.

## 로컬 작업 재개

```bash
git clone https://github.com/niyaaong-tech/SSKR.git
cd SSKR
python snapshot/unpack_snapshot.py
```

정상 복원되면 저장소 루트의 `workspace/` 아래에 현재 작업공간이 생성됩니다.

스냅샷은 SHA256을 검증한 뒤에만 풀리도록 되어 있습니다. 기준 해시는 `snapshot/SNAPSHOT_INFO.md`와 `snapshot/unpack_snapshot.py`에 기록되어 있습니다.

## 현재 직접 확인 가능한 문서

- `docs/scene05/Scene05_한반도_리얼지형_시간라이팅_제작전략_v0.1.md`
- `snapshot/SNAPSHOT_INFO.md`

## Notion 정본

최신 서비스·PT 기획 의사결정은 Notion SSKR 작업공간을 우선합니다.

- SSKR HTML 웹 프레젠테이션 개발 계획 v0.1  
  https://app.notion.com/p/3b54b875815381ff9de6d15112818607
- Scene 05 — 한반도 리얼 지형·시간 라이팅 제작 전략 v0.1  
  https://app.notion.com/p/3b54b8758153817bb555f572653528e8

Git 저장소는 **실행 가능한 작업 자료와 보존용 스냅샷**, Notion은 **최신 기획 정본과 의사결정 기록**으로 역할을 분리합니다.
