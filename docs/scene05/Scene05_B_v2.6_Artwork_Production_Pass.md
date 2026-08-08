# Scene 05 B v2.6 — Artwork Production Pass

## 1. 목표 재정의

Scene 05는 한국 지형 자체의 아름다움을 전시하는 장면이 아니다.

최종 목표:

> 실제 한국이라는 공간 위에서 여러 출발이 살아나고, 참가자마다 다른 Route가 분기·우회·재합류하며 국토를 가로질러 서해 Finish와 밤의 축제로 수렴하는 약 40초 원테이크 시네마틱 시각화.

역할 분담:
- Terrain / coastline: 한국이라는 실제 공간의 신뢰성
- 2D surface texture: 화면의 주된 미감
- Shallow 3D relief: 카메라 이동 시 깊이 단서
- Ocean / atmosphere / cloud: 항공촬영 스케일과 공간 깊이
- Route / checkpoint: 서사와 선택
- Camera: 역동성과 스케일 변화
- Sunset / fireworks: 완주와 축제의 클라이맥스

## 2. v2.6 제작 원칙

### 2.1 Land
- `korean_peninsula_precise.svg`의 alpha를 전체 한반도 land coverage 단일 정본으로 사용한다.
- DEM mask는 육지를 삭제할 수 없다.
- 북한은 실제 행사 플레이 영역이 아니므로 저디테일 배경으로 남기되 바다로 치환하지 않는다.
- 국토 내부 transparent hole은 허용하지 않는다.

### 2.2 Surface
- 화면 미감은 2D texture가 주도한다.
- 남한은 실제 DEM elevation / slope / hillshade / source albedo를 사용한다.
- 3D terrain은 얕게 유지하며 texture 위에 입체감만 보조한다.
- 북부 비-DEM 영역의 pseudo relief는 atmospheric context일 뿐 지형 데이터로 주장하지 않는다.

### 2.3 Ocean
- 밝은 cyan map plane을 금지한다.
- deep blue를 기본으로 하고 연안 cyan은 제한적으로 사용한다.
- 규칙적인 sine band가 보이지 않도록 shimmer를 비주기적으로 혼합한다.
- Sunset에서만 warm reflection이 의미 있게 증가한다.

### 2.4 Route Freedom
- 5개 Main Route가 유일한 코스로 읽히면 실패다.
- Road Possibility는 실제 OSM major-road context를 중립색으로 얇게 보여준다.
- 별도 Rider Choice Trace가 분기·우회·재합류하는 모습을 보여준다.
- v2.6 기준 Rider Choice Trace는 15개.
- 각 Trace는 실제 도로 기반 Main Route corridor 여러 개를 긴 구간 단위로 조합하되, navigation output이나 추천 코스로 사용하지 않는다.
- Finish 수렴은 후반부에만 강해져야 한다.

### 2.5 Camera
- Scene 내부는 무컷 원테이크.
- 카메라는 정적 hero shot이 아니라 계속 새로운 구도를 발견한다.
- Route Chase에서는 fork가 실제로 보일 것.
- Crane Reveal / Network Flight에서는 더 높은 고도로 올라 여러 선택 경로가 동시에 읽힐 것.
- Finish에서는 속도를 낮춰 도착감을 만든다.
- Fireworks는 Finish와 수평선 맥락을 잃지 않는 safe frame 안에서 끝낸다.

## 3. v2.6 구현 변경

1. `peninsula_surface_v26.png`
   - 1536px width
   - canonical SVG alpha
   - 남한 실제 DEM / slope / hillshade / albedo 기반 자연 지표 재질
   - coastline inner rim 정리
   - 북부 low-detail contextual relief
2. DEM relief scale을 v2.5 대비 크게 축소
3. 시간대 전환을 peninsula texture color grading에 직접 적용
4. Ocean palette / shimmer 재설계
5. Main Route 굵기 축소
6. Road Possibility를 neutral gray-green으로 변경
7. Rider Choice Trace 15개 생성
8. Route visual smoothing 강화
9. Choice chapter 카메라 고도 및 FOV 확대
10. Cloud bank 크기와 프레이밍 강화
11. v2.5.2 fireworks safe-frame 유지

## 4. QA Frame

- 1.35s — full peninsula texture / land integrity
- 5.2s — east coast starts
- 9.2s — first visible fork during Route Chase
- 12.4s — choice encounter
- 18.5s — freedom network reveal
- 24.2s — national network flight
- 29.8s — Finish convergence
- 34.2s — sunset arrival
- 37.2s — firework launch
- 39.4s — festival finale

## 5. 합격 조건

- 북한과 국토 내부가 항상 육지로 유지된다.
- 지도 자체보다 texture / atmosphere / ocean이 먼저 풍경으로 읽힌다.
- Route Chase에서 단일 강제 코스 느낌이 사라진다.
- 전국 Reveal에서 여러 사람이 서로 다른 길을 선택했다는 구조가 설명 없이 읽힌다.
- Main Route / Choice Trace / Road Possibility의 시각 위계가 구분된다.
- Route가 전기 회로나 보드게임 네트워크처럼 보이지 않는다.
- Ocean에 규칙적인 band artifact가 보이지 않는다.
- Fireworks가 화면 밖으로 잘리지 않는다.
- 약 40초 동안 별도의 지형 감상 hold 없이 계속 사건이 진행된다.

## 6. 상태

v2.6은 Artwork QA Candidate이다. Final Art Accepted가 아니다.
