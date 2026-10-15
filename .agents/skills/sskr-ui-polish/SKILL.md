---
name: sskr-ui-polish
description: Refine SSKR UI details, Korean microcopy, action hierarchy, responsive alignment, and brand consistency while preserving editing behavior. Use for SSKR screen polish and UI review; not deployments, data curation, or unrelated products.
---

# SSKR UI polish

요청 범위의 화면을 다듬고, 여백·정렬이 실제 렌더링에서도 맞는지 검증합니다. 먼저 대상 저장소의 `AGENTS.md`, `docs/cloud-development.md`, 현재 코드를 읽습니다. 이전 결정을 해석할 때는 [결정 근거](references/decisions.md)를 읽으며 최신 사용자 지시를 우선합니다.

- HOME의 바다·수평선·햇빛·지도·스크롤 경험과 편집기의 간결한 정보·조작 구성을 구분합니다. 함께하는 랠리 안의 선택을 표현하며 새 문구에 “각자의 길”을 쓰지 않습니다.
- 기능·상태를 보존합니다. 초안, 핀, 선택, 일정, 저장된 루트의 정체성, 실행 취소, 입력 포커스가 유지되어야 합니다. 재구성은 고정하지 않은 장소를 바꾸고 최적화는 장소 집합을 유지합니다. 출발지 변경의 확인창 생략을 초기화·삭제까지 확대하지 않습니다.
- 크기와 간격은 해당 화면의 역할·가용 공간·승인된 디자인을 기준으로 정합니다. 오늘의 작은 지도 배지 값을 모든 입력창·버튼에 적용하지 않습니다. 시각적 박스와 조작 영역을 구분하고, 작은 배지를 만들면서 기존 터치·키보드 동작을 줄이지 않습니다.
- 박스 중심만 맞췄다고 중앙 정렬을 완료하지 않습니다. 실제 텍스트 Range의 중심·내용 폭·안쪽 여백을 측정하고 글꼴 기준선과 광학적 중심은 화면으로 확인합니다. 지도 번호·사진 배지처럼 같은 역할의 요소를 함께 비교합니다.
- 모바일 수정은 PC도, PC 수정은 모바일도 확인합니다. 실제 CSS 분기 직전·직후, 긴 한국어 이름, 한·두·세 자리 숫자, 기본·선택·핀·호버를 포함합니다. 제공된 SVG와 브랜드 자산의 비율을 유지합니다.

실행·판정은 [UI 검수 절차](references/ui-qa.md)를 따릅니다. 스킬 링크의 물리 경로와 실제 수정 checkout을 확인하고, **수정한 소스를 제공하는 checkout에서** `npm run qa:ui`를 실행합니다. 현재 로컬 정본은 `C:\Project\SSKR\source`이며 클라우드에서는 해당 저장소의 checkout을 사용합니다. 다른 worktree 검사 결과로 현재 변경을 통과 처리하지 않습니다.

관련 geometry 게이트, 동일 조건 before/after, 기존 기능 회귀 검사를 함께 사용합니다. 텍스트·간격을 건드리는 변경은 캡처 생성으로 끝내지 말고 이미지를 직접 검토합니다. 기능·배치 자동검사, 시각·문구 검토, 사용자 승인을 별도로 보고합니다. 테스트 0개·전부 스킵·다른 소스 검사·미검토 캡처는 통과 근거가 아닙니다. 에뮬레이션을 실제 iPhone Safari 검증으로 표현하지 않습니다.
