# SSKR — SUNRISE SUNSET KOREAN RALLY

SSKR 웹의 현재 실행 결과를 관리하는 저장소입니다. 기획 문서의 정본은 Notion이며, 이 저장소에는 공개 페이지와 실행에 필요한 자산만 둡니다.

로컬·클라우드 개발을 시작할 때는 [개발 컨텍스트](docs/cloud-development.md)를 먼저 읽습니다. 실행 환경, 소스 구조, 지도·루트 구현 계약, 검증 및 통합 기준을 정리한 기술 문서입니다.

## 현재 공개 구조

- `/about/` — `web/about/`: SSKR 소개, 스크롤 연동 8개 장면과 읽기 모드
- `/explore/` — `web/explore/`: 출발 11곳·경유 150곳·대천 도착지 공통 지도 탐색
- `/app/*` — `web/app/`: 매니저·스팟 탐색과 루트 만들기·공개 메모리얼·내 기록
- `/tests/home-explore/` — `web/tests/home-explore/`: HOME 장소 탐색 인터랙션 검토 시안 (검색엔진 비노출)
- `/` — `web/home/`: SSKR HOME
- `/participate` — `web/participate/`: 참가 안내
- `/journey` — `web/journey-presentation/`: Journey Presentation 임시 서브페이지

HOME 헤더에서 Journey Presentation 링크를 제거했습니다. 기존 `/journey` 주소와 소스는 아직 유지되며 검색엔진 비노출 설정이 적용되어 있습니다.

## 작업 기준

- About 삽화는 `web/about/assets/SSKR_info01.png`부터 `SSKR_info10.png`까지 사용자 제공 원본을 유지합니다. 같은 이름의 WebP는 동일 해상도·크롭 없는 웹용 압축본(quality 88)입니다. 페이지는 WebP만 로드합니다. 데스크톱은 네이티브 스크롤 기반 고정 장면, 좁거나 낮은 화면·모션 감소 설정은 전체 내용을 읽는 레이아웃으로 전환합니다. 기존 About 전용 사진 4장은 교체 후 제거했습니다.
- 각 공개 페이지의 코드와 런타임 자산은 해당 `web/` 하위 폴더 안에서 함께 관리합니다.
- Journey Presentation의 코드와 자산은 `web/journey-presentation/` 한 곳에서 관리합니다.
- 구버전 제작 소스, 증분 패치 도구, 프로토타입, 청크 백업과 과거 배포 워크플로는 현재 트리에 남기지 않습니다.
- 파일명은 역할을 나타내는 안정된 이름을 사용하고 변경 이력은 Git으로 관리합니다.

## 로컬 실행

`npm ci` 후 `npm run dev`를 실행하고 `http://127.0.0.1:8080/app/spots?scenario=guest`에서 탐색·루트 만들기를 확인합니다. `/explore/`도 같은 카탈로그와 지도를 사용합니다. 전체 장소는 `web/explore/places.js`의 기반 데이터에 `web/app/spot-catalog.js`와 `spot-curation.js`를 적용해 구성합니다. 현재 150개 경유지·11개 출발지·1개 고정 도착지가 있으며 지도 안내 좌표는 주차 지점입니다. 공통 지도는 Leaflet·MapLibre와 `/api/map-tile`을 사용합니다. 외부 라이브러리·지도 글꼴·확대 타일에는 인터넷 연결이 필요합니다. 실제 도로 데이터는 저장소에 포함돼 있습니다. 로그인·계정별 저장은 mock 및 브라우저 저장 어댑터이며 운영 인증·DB 연동과 구분합니다.

저장소 루트에서 `server/dev-server.js`를 실행해 공개 URL로 확인합니다. 단순 정적 파일 서버는 지도·참가 API를 제공하지 않습니다. 운영 URL 연결은 `vercel.json`에 정의되어 있습니다.

## 보존 기준

현재 결과물만 작업 트리에 유지합니다. 과거 상태가 필요하면 복제 폴더나 버전 파일을 만들지 않고 Git 이력에서 복구합니다.


## 메모리얼 테스트 행사 데이터

2026년 5월 23일의 가상 행사(`sskr-2026-may`)를 기준으로 200명의 신청·결제·참가 관계와 공개 여정 30개를 제공합니다. EARLY는 50,000원 50명, STANDARD는 100,000원 120명, PLATINUM의 이 행사 표시명은 VIP이며 200,000원 30명입니다. 2027 행사 정책에는 영향을 주지 않습니다.

- `/app/memorials`: 다른 참가자의 공개 기록 6개 무작위 노출, 내 기록 미리보기.
- `/app/memorials/all`: 전체 공개 기록, 라이더·스팟 검색과 출발지 필터.
- `/app/memorials/:id`: 실제 도로 경로, 방문 시각, 정차, 구간 거리·도로명, 합성 GPX 내보내기.
- `/app/memorials/mine`: 로그인한 소유자의 전체 기록과 관리.

`data/fixtures/memorial-event.json`은 이관용 관계 데이터입니다. `users → applications → payments → participations → runSessions → visits / memorials`를 ID로 연결합니다. 경로는 각 `trackUrl`의 `web/app/data/routes/*.json`을 함께 가져와야 합니다. 구간의 `shape`는 경도·위도로 복원 가능한 polyline6이며, `startedAt + elapsedSeconds[i]`가 각 좌표의 모의 시각입니다. 스팟 정차는 `arrivedAt`과 `departedAt`으로 구분합니다. 다른 170명의 주행 결과는 생성 범위 밖이므로 null로 보존하며 완주·불참으로 추정하지 않습니다.

`node tools/seed-memorials.cjs`는 활성 카탈로그와 공용 이륜차 도로 데이터로 관계 데이터와 공개 요약을 생성합니다. 최소 경유 수는 `--minimum-spots=12`처럼 설정할 수 있으며 기본값은 10입니다. 최소 체크인 수·경로 연속성·거리·시간을 확인한 뒤 데이터를 저장합니다. `--refresh-routes`를 명시하면 Valhalla 공개 API로 순차 재조회합니다. 기존 `web/app/spot-catalog.js`의 출발지·스팟·도착지 ID와 좌표를 사용하며 고속도로·유료도로·페리를 제외하는 motorcycle 설정을 보존합니다. `npm test`로 참조·금액·공개 범위·경로 연속성과 시각을 검사합니다.

이 데이터는 **합성 테스트 데이터**입니다. 실제 GPS 관측이나 2026년 5월 당시 도로망이 아니며, 현재 OpenStreetMap 도로 형상에 모의 시각을 연결했습니다. 경로별 `provenance`에 요청·도로 버전·스냅샷 시각·출처를 보존합니다. 장소 근사 좌표와 차량 접근점 차이는 `snapDistanceMeters`로 남기고 도보 여유를 정차 시간에 반영합니다. 장소 사진은 기존 카탈로그의 출처 있는 참고 사진이며 실제 참가자의 촬영물이 아닙니다. 운영 DB에서는 이 스키마와 가져오기 경계를 재사용하되 `synthetic` 표시를 제거해 실측 기록으로 승격하지 않습니다. 도로 형상 출처: © OpenStreetMap contributors, ODbL-1.0 / Valhalla.


### 완주 체크인 규칙

완주는 유효한 출발 체크인, **서로 다른 경유 스팟 N곳 이상 체크인**, 고정 도착지 체크인을 모두 요구합니다. 출발·도착은 N에 포함하지 않습니다. 기본 N=10이므로 총 12곳 이상입니다. 행사 데이터의 `minimumSpotCheckins`는 1 이상의 정수이며 누락된 기존 데이터에는 10을 적용합니다. 지난 기록은 해당 Event의 설정을 기준으로 판단합니다. 동일 장소의 재체크인, 미검증·거절 체크인, 도착 후 방문은 경유 수에 더하지 않습니다.

`web/shared/checkin-rules.js`는 체크인 개수 조건만 검사하며 일출·일몰, GPS와 참가 자격을 포함한 운영 판정은 별도로 연결해야 합니다. 루트 편집의 선택 수·자동 완성·추천 간격도 현재 Event의 최소값을 읽지만, 계획만으로 실제 완주가 인정되지는 않습니다. 공개 합성 메모리얼 30개는 해당 Event의 최소 경유 10곳과 양 끝 체크인을 충족합니다.

### 방문·사진 모델

스키마 2에서는 출발·경유·도착을 모두 `visits`로 취급합니다. 30개의 공개 여정은 경유 10·11·12곳을 각각 10개씩 구성하고, 사용자 200명은 고유 닉네임을 사용합니다. `locations`는 장소 원본, `eventLocations`는 행사별 역할이며 방문의 `eventLocationId`가 해당 행사와 장소를 연결합니다. 구간 `fromVisitId`와 `toVisitId`는 재방문도 구분합니다.

| 데이터 | 주요 속성 |
|---|---|
| 장소 / 행사별 장소 | ID, 행사 ID, 장소 ID, START·SPOT·FINISH 역할, 명칭·분류·좌표·정확도·출처, 대표 사진, 운영 검증 상태 |
| 방문 | 세션·행사별 장소·장소 ID, 역할, 순서, 도착·출발·체류 시간, 누적 거리, 접근 좌표·차이, 체크인 방법·검증 상태, 메모, 공개 범위·사진 동의, 합성 여부 |
| 사진 자산 | ID, 장소·소유자, URL, 업로드·대표 사진 구분, 처리·검토·공개 상태, 촬영·업로드 시각, 캡션·대체 텍스트, 출처·크레딧·합성 여부 |
| 방문별 사진 | 방문 ID, 사진 ID, 표시 순서, 추천 여부 |
| 메모리얼 | 소유자·행사·참가·세션 ID, 발행·공개 상태, 제목·소개, 대표 방문·사진 ID, 거리·시간·방문 수 |

사진은 `mediaAssets`와 `visitMedia` 관계로 관리합니다. 공개 동의가 있는 READY·APPROVED·PUBLIC 체크인 사진을 우선하고, 없으면 같은 장소의 대표 사진을 사용합니다. 둘 다 없으면 사진 없음으로 표시합니다. 목록용 `memorials.visits`와 경로 파일의 `visits`는 이 관계에서 만드는 공개 조회용 데이터이며 저장 원본이 아닙니다. 썸네일은 출발지부터 최대 3개 스팟과 도착지를 표시하고, 하단 명칭은 선택한 사진의 장소를 표시합니다.

체크인 사진 예시는 기존 카탈로그 사진으로 업로드 상황을 모의합니다. `sourceKind: USER_UPLOAD`, `synthetic: true`, `originalSourceKind: PLACE_REFERENCE`로 구분하며 실제 참가자 사진이라고 주장하지 않습니다. 사진이 있는 방문과 없는 방문, 대표 사진만 있는 여정을 함께 제공합니다.

운영 전에는 방문 순서의 세션 내 고유성, 세션·행사별 장소의 동일 행사 제약, 업로드 소유자·참가자 일치, 대표 방문·사진 참조를 DB에서 보장해야 합니다. 촬영물 권리·동의 버전·삭제 상태·스토리지 변형·오프라인 업로드와 원본 GPS 품질 속성도 확장 대상입니다. 공개 조회·지도 파일은 서버에서 접근 권한을 검사해야 하며 현재 정적 mock은 운영 인증·DB·업로드 구현을 대신하지 않습니다.

### 공통 지도 검증과 캐시

스팟·메모리얼·공개 탐색은 `web/shared/map/`을 공유합니다. `npm test`는 국내 장소 보존·해외 좌표 제외·공통 스타일 범위·캐시 무결성을 검사합니다. `npm run test:maps`는 개발 서버를 임시 포트에서 실행해 세 화면과 모바일 배열·휠·해안 지도를 브라우저로 검증합니다. Windows에서는 Edge를 사용하며, 다른 환경에서는 먼저 `npx playwright install chromium`을 실행합니다. `BROWSER_CHANNEL`로 브라우저를 지정할 수 있습니다.

대한민국 표시 범위는 OpenStreetMap 행정 경계(`web/shared/map/korea.geojson`)를 사용하고, 실제 해안선은 원본 지도 타일의 water 레이어로 표시합니다. 6·7·8배율 타일은 `npm run map:cache`로 `server/map/cache/`에 생성합니다. 캐시는 경계 해시와 파일 해시로 검증하며, 확대 타일만 요청 시 변환합니다. 경계가 변경되면 배포 전에 캐시를 다시 생성해야 합니다. 지도 데이터는 © OpenStreetMap contributors, ODbL-1.0입니다.

### 스팟 주행 루트 편집

`/app/spots`의 **루트 만들기**에서 출발지와 경유지를 선택합니다. 도착지는 카탈로그의 고정 피니시이며, Event의 최소 경유 수(기본 10곳)부터 완성 루트로 분류합니다. 그보다 적어도 초안으로 저장할 수 있습니다. 비로그인 이용자는 편집·도로 조회·추천을 사용할 수 있고, 저장은 참가 여부와 관계없이 로그인한 계정에 귀속됩니다.

- `web/app/route-plan.js`: 루트 모델, 방향별 도로 거리 기반 추천·순서 정리, 계정별 저장 어댑터.
- `web/app/route-provider.js`: 거리 행렬과 필요한 출발 지점의 압축 도로 형상 조회. 끊긴 구간은 거리·연결선을 추정하지 않습니다.
- `web/app/route-planner.js`, `route-planner.css`: 공통 지도를 사용하는 편집 화면. 모바일은 전체 페이지 스크롤과 지도·탭 sticky, 넓은 PC는 3열을 사용합니다.
- `web/shared/routes/`: 현재 장소 카탈로그의 실제 도로 데이터. `manifest.json`에 출처·스냅샷·정책 버전·접근 좌표, `validation.json`에 연결 불가 구간을 기록합니다.

자동 삽입은 `bestInsertion`으로 모든 인접 구간의 방향별 거리 증가량을 비교하며, 동률에는 시간·앞쪽 순서를 적용합니다. `insertionRecommendations`는 같은 위치 계산으로 추천합니다. 편집 화면은 자동 삽입만 제공하며 기존 저장 형식과 도메인 API는 유지합니다. 새 두 구간의 도로 형상을 확인한 뒤 추가하고, 조회 실패·경로 변경·중복 클릭에는 기존 경로를 유지합니다.

장소 찾기는 추천·검색을 한 영역에 모으고, 저장한 루트는 제목 옆 폴더의 루트 관리 창에서 불러옵니다. 자동 완성·루트 최적화는 도로·일정 조건을 검증한 뒤 바로 적용하며 실패하면 원본을 유지합니다. 새 루트와 불러오기를 포함해 최근 30번의 편집을 실행 취소할 수 있습니다.

현재 계정 인증은 기존 mock을 사용하며 루트는 브라우저의 계정별 localStorage에 저장합니다. 운영 전환 시 저장 어댑터와 로그인 콜백을 서버 인증·DB로 연결해야 합니다. 저장 형상은 복제하지 않고 장소 ID·순서·도로 데이터 버전을 보존합니다. 도로 조회 어댑터를 통해 서버 경로 엔진으로 전환할 수 있습니다.

도로 데이터는 대한민국 OSM 추출본을 로컬 Valhalla로 계산합니다. 실제 원본 주소와 스냅샷·해시는 manifest.json에 기록하며, 현재 입력은 [OSM 한국 미러](https://tiles.osm.kr/download/)의 비군사 추출본입니다. 원본에 복제 시각이 없으면 포함된 객체의 마지막 수정 시각과 그 기준을 기록합니다. 고속도로·자동차전용도로·명시적 이륜차 통행 금지·사유지·페리·비포장·보행 전용 도로를 제외하고, 일방통행과 회전 제한을 유지합니다. 조건부 통행 제한은 출발 시각을 확정하지 않으므로 보수적으로 제외합니다. 경로는 거리 최단 기준이며 정차·실시간 교통·현장 통제는 반영하지 않습니다. 모든 공개 구간의 원본 도로 ID를 통행 정책에 다시 대조합니다. 장소 표시 좌표와 도로 접근점은 별도로 관리합니다.

재생성은 격리한 Python 환경에 `tools/route-requirements.txt`를 설치한 뒤 다음 순서로 실행합니다. `WORK`와 원본 PBF는 저장소 밖의 작업 경로를 지정합니다.

```text
python tools/build-route-data.py --work WORK --input south-korea.osm.pbf --source-url https://tiles.osm.kr/download/south-korea-latest-non-military.osm.pbf --stage prepare
python tools/build-route-data.py --work WORK --stage graph
python tools/build-route-data.py --work WORK --stage routes --workers 3
python -m unittest discover -s tests/routes -p "test_*.py"
npm test
```

`--stage routes --only gangneung`은 해당 출발지의 경로만 작업 폴더에 검증하며 서비스 데이터를 게시하지 않습니다. 전체 실행은 완료된 행을 재사용합니다. 원본 도로·정책·장소 좌표가 바뀌면 다시 생성해야 합니다. Windows native 빌드는 1개 스레드로 그래프를 생성하고 경로 계산만 여러 프로세스로 처리합니다. 프로세스당 약 1GB의 메모리를 사용하므로 8GB PC에서는 기본 3개 이하를 권장합니다. 원본 PBF·그래프·중간 파일은 Git에 넣지 않습니다. 배포에는 검증된 압축 데이터만 포함합니다. `npm run test:routes`로 실제 도로 데이터와 비로그인·저장·모바일 편집 흐름을 검사합니다. 도로 형상과 파생 데이터: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL-1.0.
