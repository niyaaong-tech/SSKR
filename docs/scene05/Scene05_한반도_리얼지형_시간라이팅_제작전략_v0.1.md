# Scene 05 — 한반도 리얼 지형·시간 라이팅 제작 전략 v0.1

> Scene 05의 한반도/남한 비주얼을 **정확한 지리 형상 + 실존 산악 지형 + 실제 좌표 기반 Route + 동틀녘→한낮→해질녘의 시간 변화**로 구현하기 위한 세부 제작 전략이다. 생성형 컨셉아트는 분위기와 아트디렉션 참고에만 사용하고, 최종 지도 형상과 고도는 지리 데이터 기반으로 제작한다.

## 1. 목표

Scene 05의 지형은 단순히 `한국처럼 보이는 3D 지도`가 아니라, 확대해도 한반도와 남한의 형상이 납득되고 주요 산악축이 실제 위치에서 읽혀야 한다.

최종 화면은 네 가지 정확성을 동시에 만족해야 한다.

1. **해안선 정확도** — `korean_peninsula_precise.svg`를 외곽 정본으로 사용
2. **고도 정확도** — 실제 DEM/DSM을 이용해 산맥·계곡·평야의 높낮이를 생성
3. **좌표 정확도** — Start / Checkpoint / Finish / Route를 WGS84 기반으로 배치
4. **시간 정확성** — Dawn / Daylight / Sunset에서 태양 방향과 지형 그림자가 자연스럽게 변화

> **지형의 형태는 데이터로 만들고, 영화적 인상은 라이팅과 재질로 만든다.**

## 2. 현재 확보된 개발 자산

현재 Git 저장소의 `tools/scene05-terrain-kit/`에 Scene 05 Real Terrain Asset Kit v0.1을 포함한다.

구성:

- 정밀 한반도 SVG와 full-canvas SVG
- 2K/4K land mask, coastline outline, 2K SDF
- Copernicus GLO-30 / GLO-90 한국 영역 타일 URL manifest
- Mapzen Skadi 대체 소스 manifest
- DEM downloader
- DEM mosaic / crop / reproject / heightfield 변환 스크립트
- Normal / Slope / Hillshade / Albedo 파생맵 생성 로직
- glTF terrain LOD 출력 파이프라인
- SVG↔WGS84 georeferencing fitter
- Route terrain-height sampler
- Dawn / Day / Sunset lighting preset과 Three.js runtime helper
- Windows PowerShell / macOS·Linux 자동 빌드 스크립트

원본 DEM GeoTIFF 자체는 저장소에 커밋하지 않는다. 공개 원본에서 재생성 가능하게 **manifest + downloader + checksum + attribution**으로 관리한다.

## 3. 정본 소스 계층

### 3.1 해안선 정본

`assets/vector/korean_peninsula_precise.svg`를 최종 국토 Shape의 기준으로 사용한다.

역할:

- 한반도 외곽
- 남한 해안선
- 주요 도서 실루엣
- DEM 지형 최종 Clip mask

DEM 자체 coastline과 SVG가 미세하게 다를 경우 최종 presentation silhouette는 SVG를 우선한다.

### 3.2 고도 정본

최종 지형은 실제 DEM/DSM을 사용한다.

우선순위:

1. 국내 고해상도 DEM 확보 가능 시 라이선스·배포 조건 확인 후 South Korea Hero에 적용 검토
2. Copernicus DEM GLO-30 — 현재 자동화 파이프라인의 기본 원본
3. Copernicus GLO-90 — 한반도 Overview용 경량 원본 후보
4. ALOS AW3D30 — 교차 검증 후보
5. Mapzen Skadi — fallback / 개발 검증용

### 3.3 생성형 컨셉아트

생성형 이미지는 다음만 참고한다.

- 카메라 높이와 tilt
- Dawn / Day / Sunset 컬러 스크립트
- 바다와 대기 haze
- Route Gold와 bloom
- cinematic grading

해안선, 산맥 위치, 섬 위치, Route 위치, Start 위치의 정본으로 사용하지 않는다.

## 4. SVG Georeferencing

정밀 SVG는 이미지 트레이싱 기반이므로 픽셀 좌표를 실제 위도·경도에 연결하는 보정 단계가 필요하다.

### 기준점

8~15개의 식별 가능한 기준점을 설정한다.

- 한반도 북동/북서단
- 동해안 주요 돌출부
- 부산권 해안
- 남해안 대표 곶
- 서남해안 대표 돌출부
- 제주 동·서·남·북단
- 울릉도 중심

각 기준점은 다음 쌍으로 관리한다.

```text
SVG_X, SVG_Y
↕
Longitude, Latitude
```

투영 왜곡이 작으면 Affine/Homography, 부분별 오차가 남으면 Thin Plate Spline 계열 비선형 보정을 검토한다.

최종적으로 모든 시스템이 다음 공통 변환을 사용한다.

```text
WGS84 lon/lat
→ Scene X/Z
→ DEM height sample
→ Scene Y
```

## 5. 실제 Terrain Mesh 제작

```text
DEM/DSM tile 확보
→ Mosaic
→ 공통 좌표계 Reproject
→ SVG와 정렬
→ SVG 경계로 Clip
→ Heightfield 생성
→ Terrain Mesh
→ Normal / Slope / Curvature / AO / Hillshade
→ LOD
→ glTF/Web asset export
```

산의 위치와 능선 방향은 DEM 값을 유지한다. 태백산맥·소백산맥을 사람이 별도로 모델링하지 않는다.

### Vertical Exaggeration

고공 카메라에서 실제 산악 relief가 평평해 보이는 문제만 일정 배율로 보정한다.

```text
1.0× 실제 비율
1.3× 약한 보강
1.5× Scene 05 1차 테스트 기준
1.8× 상한 비교
```

XY 위치와 산악 형태는 바꾸지 않는다.

## 6. 지형 판독 목표

라벨 없이도 다음 인상이 보여야 한다.

- 동쪽이 높고 서쪽으로 완만해지는 남한의 큰 relief
- 강원/동부 산악권의 높은 지형
- 남북 방향의 동부 산악축
- 내륙으로 분기되는 산지와 계곡
- 낮은 서해안 및 주요 평야
- 복잡한 남해/서해 해안과 다도해

이것은 색으로 산맥을 그리는 방식이 아니라 DEM geometry와 실제 음영으로 만든다.

## 7. Surface Material

위성 사진을 그대로 사용하면 Route가 묻힐 수 있으므로 `정확한 geometry + 정돈된 리얼 재질`을 사용한다.

- 산악: 저채도 Forest / Earth
- 평야·도시권: 조금 밝은 중성톤
- 고경사: slope 기반 stone tint
- Derived Maps: Normal / Slope / Curvature / AO / Hillshade
- 바다는 terrain보다 한 단계 단순한 shader
- terrain saturation/contrast는 Route Gold보다 낮게 유지

## 8. LOD

### LOD 0 — Korea Overview

- 한반도 전체 카메라
- 큰 산악축만 유지
- 충분히 decimate한 mesh
- 작은 섬은 silhouette 유지에 필요한 수준으로 정리

### LOD 1 — South Korea Hero

- 남한 확대 후 사용
- 주요 해안/섬 유지
- 실제 산악 relief 판독 가능
- Route의 terrain 밀착이 보일 수준의 sampling density 확보

Camera Dolly/Zoom 중 geometry cross-fade 또는 seamless replacement를 사용한다.

## 9. 실제 좌표 기반 Node / Route

### Start

- 남한 동해·남동해안 실제 육지에만 배치
- 북한 제외
- 바다 위 배치 금지
- 최종 후보 확정 후 GPS를 그대로 사용

### Terrain Height Sampling

```text
nodeY  = terrainHeight(x,z) + nodeOffset
routeY = terrainHeight(x,z) + routeOffset
```

모든 Route sample을 terrain에 투영해 산을 관통하거나 공중에 뜨는 표현을 막는다.

### Route

- 아름다운 단순 Arc가 아니라 실제 주행 가능한 road-like polyline
- 지그재그 / 산악 우회 / 계곡·내륙 이동축
- 일부 경로 병합
- 공유 segment
- 재분기
- 다른 경로와 재합류

실제 도로망을 참고하되 발표용으로 node 수와 shape를 정리한다.

## 10. 시간 라이팅

### Dawn

동쪽 낮은 태양. 차가운 전체 톤 위에 동해에서 옅은 Warm light가 시작된다. 능선 그림자가 길고 Start node가 먼저 켜진다.

### Daylight

태양 고도가 올라가며 전국 지형이 가장 명확해진다. Route network의 구조 설명이 우선이며 bloom은 절제한다.

### Sunset

서쪽 낮은 태양. 서해 반사광과 warm rim이 강해지고 긴 지형 그림자가 형성된다. Finish와 수렴 Route가 가장 강한 금빛을 갖는다.

시간 전환은 단순 overlay가 아니라 sun direction, shadow, sky, fog, sea reflection, emission을 동시에 보간한다.

## 11. 구현 구조

```text
Three.js Scene
├─ Atmosphere / Sky
├─ Sea
├─ Terrain LOD 0
├─ Terrain LOD 1
├─ Road Hint
├─ Main Route / Merged Segment
├─ Start / Checkpoint / Finish
└─ Post FX / Bloom
```

Runtime 자산:

- `runtime/scene05Terrain.js`
- `runtime/scene05Lighting.js`
- `runtime/terrariumElevation.js`

제작 스크립트:

- `scripts/fetch_copernicus_dem.py`
- `scripts/fetch_mapzen_skadi.py`
- `scripts/build_scene05_terrain_assets.py`
- `scripts/fit_svg_georef.py`
- `scripts/sample_route_heights.py`

## 12. 개발 PC에서 재생성

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File tools/scene05-terrain-kit/scripts/fetch_and_build_scene05.ps1
```

macOS/Linux:

```bash
bash tools/scene05-terrain-kit/scripts/fetch_and_build_scene05.sh
```

원본 DEM은 대용량 외부 원본이므로 Git에 저장하지 않고 downloader로 가져온다.

## 13. QA 게이트

### Geography
- SVG 해안선과 DEM silhouette의 오차 확인
- 남한 확대에서 해안·주요 섬 왜곡 확인
- Start가 모두 남한 육지 위인지 확인

### Terrain
- 주요 동부 산악축이 실제 위치에서 읽히는지 확인
- Vertical Exaggeration으로 지형 topology가 왜곡되지 않았는지 확인
- DEM nodata / coastline spike 제거

### Route
- Main Route가 Road Hint에 묻히지 않는지 확인
- 합류가 실제 공유 segment로 보이는지 확인
- Route가 terrain을 관통하지 않는지 확인

### Lighting
- Dawn / Day / Sunset 각각의 시간대가 텍스트 없이도 구분되는지 확인
- 시간 전환 중 terrain shadow가 부자연스럽게 점프하지 않는지 확인
- Sunset에서 Finish가 강하지만 지형 전체가 주황색 overlay처럼 보이지 않는지 확인

## 14. 현재 상태

**Asset Kit v0.1은 제작 파이프라인 단계까지 확보된 상태**다.

완료:

- coastline/vector source
- masks / SDF
- public DEM URL manifest
- download/build scripts
- Three.js runtime helpers
- lighting presets
- route schema
- georef control-point template
- attribution / checksum / build status

미완료/실제 개발 PC 단계:

- Copernicus 원본 GeoTIFF 다운로드
- DEM mosaic 실빌드
- SVG↔WGS84 control point 확정
- South Korea Hero 최종 GLB 생성
- 실제 Start 후보 좌표 입력
- 실제 도로망 기반 대표 Route 설계
- Three.js Scene 05 통합 및 프레임 성능 검증
