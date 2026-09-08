# SSKR — SUNRISE SUNSET KOREAN RALLY

SSKR 웹의 현재 실행 결과를 관리하는 저장소입니다. 기획 문서의 정본은 Notion이며, 이 저장소에는 공개 페이지와 실행에 필요한 자산만 둡니다.

## 현재 공개 구조

- `/about/` — `web/about/`: SSKR 소개, 스크롤 연동 8개 장면과 읽기 모드
- `/explore/` — `web/explore/`: 출발 후보 5곳·경유 후보 30곳·대천 도착지 지도 탐색
- `/tests/home-explore/` — `web/tests/home-explore/`: HOME 장소 탐색 인터랙션 검토 시안 (검색엔진 비노출)
- `/` — `web/home/`: SSKR HOME
- `/participate` — `web/participate/`: 참가 안내
- `/journey` — `web/journey-presentation/`: Journey Presentation 임시 서브페이지

HOME 헤더의 `THE JOURNEY`만 `/journey`로 연결됩니다. 프레젠테이션을 정식 웹 콘텐츠로 사용할지는 아직 결정되지 않았으므로 `/journey`에는 검색엔진 비노출 설정을 적용했습니다.

## 작업 기준

- About 삽화는 `web/about/assets/SSKR_info01.png`부터 `SSKR_info10.png`까지 사용자 제공 원본을 유지합니다. 같은 이름의 WebP는 동일 해상도·크롭 없는 웹용 압축본(quality 88)입니다. 페이지는 WebP만 로드합니다. 데스크톱은 네이티브 스크롤 기반 고정 장면, 좁거나 낮은 화면·모션 감소 설정은 전체 내용을 읽는 레이아웃으로 전환합니다. 기존 About 전용 사진 4장은 교체 후 제거했습니다.
- 각 공개 페이지의 코드와 런타임 자산은 해당 `web/` 하위 폴더 안에서 함께 관리합니다.
- Journey Presentation의 코드와 자산은 `web/journey-presentation/` 한 곳에서 관리합니다.
- 구버전 제작 소스, 증분 패치 도구, 프로토타입, 청크 백업과 과거 배포 워크플로는 현재 트리에 남기지 않습니다.
- 파일명은 역할을 나타내는 안정된 이름을 사용하고 변경 이력은 Git으로 관리합니다.

## 로컬 실행

`npm run dev` 실행 후 `http://127.0.0.1:8080/explore/`에서 지도 탐색을 확인합니다. 장소 데이터는 `web/explore/places.js`에서 관리합니다. Leaflet 1.9.4와 OpenStreetMap 타일을 사용하므로 인터넷 연결이 필요합니다. 장소 목록은 지도 CDN 실패 시에도 이용할 수 있습니다. 좌표는 탐색용 근사 위치이며 실제 집결 허가·이륜차 경로는 확정되지 않았습니다. 외부 사진은 출처를 표시한 로컬 검토 자료로, 운영 배포 전 이용 조건과 자산 제공 방식을 확인해야 합니다.

저장소 루트에서 정적 파일 서버를 실행해 각 `web/` 하위 페이지를 확인합니다. 공개 URL 연결은 `vercel.json`에 정의되어 있습니다.

## 보존 기준

현재 결과물만 작업 트리에 유지합니다. 과거 상태가 필요하면 복제 폴더나 버전 파일을 만들지 않고 Git 이력에서 복구합니다.
