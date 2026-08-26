# SSKR — SUNRISE SUNSET KOREAN RALLY

SSKR 웹과 여정 프레젠테이션의 실행 자산을 관리하는 저장소입니다.

## 현재 공개 구조

- `/` — `web/home/`: SSKR HOME
- `/journey` — `web/journey/`: 30초 여정 프레젠테이션 임시 서브페이지

HOME 헤더의 `THE JOURNEY`만 `/journey`로 연결됩니다. 프레젠테이션을 정식 웹 콘텐츠로 사용할지는 아직 결정되지 않았으므로 `/journey`에는 검색엔진 비노출 설정을 적용했습니다.

## 작업 기준

- HOME의 안정 소스는 `web/home/`입니다.
- 프레젠테이션의 현재 배포본은 `web/journey/`입니다.
- 편집 가능한 프레젠테이션 원본은 `final/scene05-b/`의 v3.8.6입니다.
- 지도 해안선 기준 자산은 `assets/vector/korean_peninsula_precise.svg`입니다.
- 과거 프레젠테이션 캡처와 구버전 배포 워크플로는 Git 이력에서만 보존합니다.

## 로컬 실행

저장소 루트에서 정적 파일 서버를 실행한 뒤 `/`와 `/journey`를 확인합니다. Vercel 경로 연결은 `vercel.json`에 정의되어 있습니다.

## 보존 기준

2026-08-26 정리 이전 `main`은 `backup/main-before-journey-merge-20260826` 브랜치에 보존합니다. 삭제한 과거 원격 브랜치의 마지막 커밋은 `docs/BRANCH_CLEANUP_2026-08-26.md`에 기록했습니다.
