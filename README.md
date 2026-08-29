# SSKR — SUNRISE SUNSET KOREAN RALLY

SSKR 웹의 현재 실행 결과를 관리하는 저장소입니다. 기획 문서의 정본은 Notion이며, 이 저장소에는 공개 페이지와 실행에 필요한 자산만 둡니다.

## 현재 공개 구조

- `/` — `web/home/`: SSKR HOME
- `/participate` — `web/participate/`: 참가 안내
- `/journey` — `web/journey-presentation/`: Journey Presentation 임시 서브페이지

HOME 헤더의 `THE JOURNEY`만 `/journey`로 연결됩니다. 프레젠테이션을 정식 웹 콘텐츠로 사용할지는 아직 결정되지 않았으므로 `/journey`에는 검색엔진 비노출 설정을 적용했습니다.

## 작업 기준

- 각 공개 페이지의 코드와 런타임 자산은 해당 `web/` 하위 폴더 안에서 함께 관리합니다.
- Journey Presentation의 코드와 자산은 `web/journey-presentation/` 한 곳에서 관리합니다.
- 구버전 제작 소스, 증분 패치 도구, 프로토타입, 청크 백업과 과거 배포 워크플로는 현재 트리에 남기지 않습니다.
- 파일명은 역할을 나타내는 안정된 이름을 사용하고 변경 이력은 Git으로 관리합니다.

## 로컬 실행

저장소 루트에서 정적 파일 서버를 실행해 각 `web/` 하위 페이지를 확인합니다. 공개 URL 연결은 `vercel.json`에 정의되어 있습니다.

## 보존 기준

현재 결과물만 작업 트리에 유지합니다. 과거 상태가 필요하면 복제 폴더나 버전 파일을 만들지 않고 Git 이력에서 복구합니다.
