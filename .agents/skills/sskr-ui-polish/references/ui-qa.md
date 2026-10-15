# SSKR UI 검수 절차

## 실제 소스와 실행 위치

정본은 대상 저장소의 `.agents/skills/sskr-ui-polish/`입니다. 현재 로컬 소스는 `C:\Project\SSKR\source`이며 클라우드에서는 같은 저장소의 checkout 루트를 사용합니다. 세션에 스킬 링크가 있다면 물리 경로를 확인합니다. 읽을 수 있는 링크만으로 실행 중 세션의 스킬 목록이 갱신됐다고 단정하지 않습니다.

하네스는 실행한 checkout의 기존 Node/Playwright 테스트와 개발 서버를 사용합니다. 이미 열려 있는 사용자 브라우저나 운영 저장소에 연결하지 않습니다. 별도 브라우저 runner·이미지 비교 프레임워크·의존성을 추가하지 않습니다. 시작 시 실제 root·branch·HEAD·관련 미커밋 변경을 확인하고, 결과에 어떤 소스를 검사했는지 남깁니다. 스킬 checkout과 수정 checkout이 다르면 수정 소스 쪽 명령을 사용합니다.

## 자동 게이트와 동일 조건 캡처

PowerShell, **수정 대상 checkout**에서 실행합니다. 출력은 저장소 밖의 작업별 임시 폴더를 사용합니다.

```powershell
$env:SSKR_QA_OUTPUT = Join-Path $env:TEMP 'sskr-ui-qa'
npm run qa:ui -- geometry --engine=chromium
npm run qa:ui -- before --viewports=1440x900,390x844 --engine=chromium
# 허가된 UI 변경 후 같은 옵션·fixture로 실행합니다.
npm run qa:ui -- after --viewports=1440x900,390x844 --engine=chromium
npm run qa:ui -- check --pattern="waypoints use a direct delete|pin|schedule toolbar" --engine=chromium
```

`geometry`는 각 사례가 유지하는 고정 viewport matrix에서 지도 배지·탭·모바일 입력의 배치 계약을 검사합니다. `--viewports`는 `before`·`after` 캡처에만 적용하며 `geometry`·`check`에서는 거부합니다. 관련 사례만 좁혀 실행하려면 `check --pattern`을 사용합니다. 새 UI 역할을 바꾸면 해당 계약과 기존 기능 사례를 보강하며, 모든 화면을 임의의 고정 수치에 맞추지 않습니다.

`before`·`after`에도 geometry 게이트가 실행됩니다. 변경 전 geometry가 실패해도 진단용 캡처는 계속 만들고 전체 명령은 실패로 남깁니다. `before` 캡처가 모두 기록되었으면 결함을 수정하고 `after`를 실행할 수 있습니다. 변경 후 geometry 통과와 전체 캡처 완료가 모두 확인되어야 `review`를 기록할 수 있습니다.

모바일, native 입력, 폰트·중앙 정렬이 관련되면 Chromium과 WebKit을 모두 확인합니다. WebKit은 별도 출력 폴더에서 `--engine=webkit`으로 동일한 명령을 실행합니다. Windows의 Chromium 계열은 저장소의 기존 채널 설정에 따라 Edge를 사용할 수 있으므로 보고서의 실제 엔진·채널·버전을 확인합니다. 브라우저 설치 실패를 전부 스킵 후 성공으로 처리하지 않습니다.

테스트 패턴이 0개와 일치하거나 전부 스킵이면 실패입니다. 다른 checkout을 제공하는 서버·누락된 원본·달라진 fixture를 조용히 대체해 통과시키지 않습니다. 명령 종료 코드뿐 아니라 실제 실행 사례 수와 실패·스킵을 확인합니다. 검사 대상 root·HEAD·미커밋 파일 해시가 현재 수정 소스와 맞아야 합니다. 소스 식별 정보와 브라우저 context·측정값은 별도로 기록합니다.

before/after 캡처의 기본값은 1440×900과 390×844 두 화면입니다. 필요하면 `--viewports`로 캡처 범위를 정합니다. 모바일 변경은 360·390·430px, 짧은 화면·가로 화면 중 관련 상태와 PC를 선택합니다. 800px 분기를 건드리면 800/801px을 확인합니다. 이 캡처 옵션은 geometry 사례의 고정 matrix를 축소하지 않습니다.

`before`·`after`의 UI evidence waypoint rows fixture는 viewport, 엔진·채널·버전, DPR, touch/mobile 설정, locale, timezone, reduced motion, provider hash, fixture ID·이름, 탭, 스크롤, 지도 중심·줌을 엄격하게 대조합니다. 다르면 비교를 중단하고 새 쌍을 만듭니다. 별도 geometry 마커 PNG까지 자동으로 전후 쌍을 비교하는 것은 아닙니다. 그 캡처는 context JSON의 path·mapView·viewport·browser와 이미지를 수동 대조합니다. 코드 SHA는 수정 전후 달라질 수 있으므로 조건 일치와 소스 식별을 구분합니다. 이미 기록한 phase를 덮어쓰지 않습니다. 같은 코드의 두 캡처는 하네스 동작 확인일 뿐 개선 증거가 아닙니다.

## 여백·정렬·간격을 측정하는 방법

1. **안정된 렌더링:** 대상 요소가 표시된 뒤 `document.fonts.ready`와 프레임 간 레이아웃 안정화를 기다립니다. 공용 측정 함수는 DOM 교체로 요소가 분리되었거나 크기가 0이면 locator로 다시 찾고 안정화 후 측정하며, 최대 8회 안에 확보하지 못하면 실패합니다. 지도는 이동·확대 애니메이션과 크기 동기화가 끝난 상태를 사용합니다. 고정 sleep 하나나 0px·시작 프레임의 측정으로 대체하지 않습니다. 이미지 준비는 화면에 렌더링되는 이미지로 한정하고 최대 5초 안에 decode/ready를 확인합니다. 숨겨진 lazy 이미지의 `decode()`를 무기한 기다리지 않으며 준비 실패를 명시합니다. 캡처 전에 포인터를 정해진 중립 위치로 옮겨 뜻하지 않은 호버 상태를 없애고, 의도적으로 호버를 검토하는 경우에는 해당 상태를 기록합니다.
2. **박스와 글자 분리:** 박스·상위 조작 영역의 `getBoundingClientRect()`, 실제 텍스트 노드의 `Range.getBoundingClientRect()`를 함께 측정합니다. 중심의 X/Y 편차, 글자 폭, padding·border·line-height·font·letter-spacing을 기록합니다. 핀 아이콘·장식이 섞인 부모의 전체 Range로 숫자 중심을 판정하지 않습니다.
3. **내용에 맞는 크기:** `width`, `height`만 맞춰도 내부가 헐거울 수 있습니다. 글자 폭 대비 좌우 잉여 공간과 상하 여백을 확인합니다. 가변 길이의 묶음은 1·2·3자리에서 잘리지 않고 승인된 여백 범위에 들어야 합니다. 기대값은 현재 디자인 계약에서 가져오며 실패한 현재 측정값을 그대로 기대값으로 복사하지 않습니다.
4. **같은 역할 교차 검사:** 지도 번호와 사진 배지의 크기·글자·중심·여백을 같은 폭에서 비교합니다. 출발·도착·일반·경로 포함·핀·선택 상태는 의미를 유지하면서 번호의 읽기 기준이 흔들리지 않아야 합니다. 배지의 작은 시각 크기와 보존해야 하는 지도 조작 영역은 별도로 측정합니다.
5. **실제 간격:** 두 요소의 경계 차이로 간격을 측정하고 CSS `margin`·`gap` 값과 대조합니다. margin collapse, 기본 input padding, inline 기준선, flex/grid 정렬, 투명한 상위 박스 때문에 실제 간격이 달라지는지 확인합니다. 툴바의 라벨·입력 시작점, 시간 입력과 휴게시간 묶음의 높이·간격·이름 입력의 가용 폭을 확인합니다.
6. **작은 편차도 설명:** 소수점 차이를 정수 반올림으로 숨기거나 실패를 없애려고 허용 오차를 넓히지 않습니다. 폰트·DPR·엔진에 필요한 오차는 근거와 함께 정하고, 광학적 기준선은 실제 크기·확대 화면으로 검토합니다. Range 중심은 글리프의 잉크 중심과 완전히 같지 않으므로 수치 통과만으로 시각 검토를 끝내지 않습니다.

현재 geometry 자동 범위를 과장하지 않습니다. 번호·사진 배지의 실측은 PC 1440px, 모바일 390px·360px 짧은 화면과 mobile/touch 문맥을 포함합니다. 묶음은 APP 360·390·430·800·801·1440px과 공개 탐색 390·1440px을 검사합니다. 이로써 모든 번호 상태·공개 경로·폭을 자동 검증한 것은 아닙니다. 선택·핀·호버 등 상태 전체와 그 밖의 조합은 관련 기존 기능 사례와 수동 검토로 보완하고 남은 범위를 보고합니다.

## 상태와 기능 회귀

- placeholder, 짧은 이름·긴 한국어 이름 입력, 실제 타이핑·포커스, 값 변경 후 안내와 높이를 확인합니다. native time 입력은 mobile/touch 설정에서 padding·min-size·높이를 측정합니다. native 시간 값은 닫힌 내부 트리에 있어 일반 DOM Range로 측정할 수 없습니다. 입력 박스 높이를 값의 중앙 정렬 증거로 사용하지 않습니다. iOS의 시간 입력은 기본 flex 배치와 내부 값의 중앙 정렬을 유지하고 `display:block` 회귀를 검사합니다. 데스크톱 WebKit의 mobile/touch 설정은 iOS 전용 렌더러 검증을 대신하지 못하므로 실제 기기 확인 여부를 구분합니다. 원인 근거는 [WebKit 139848](https://bugs.webkit.org/show_bug.cgi?id=139848)과 [기본 입력 스타일](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/css/html.css)입니다.
- 일반·선택·핀·호버, 한 번 터치 선택, 키보드 선택과 포커스를 확인합니다. 호버는 사진만 표시하고 지도를 이동하거나 추가 버튼을 열지 않는 기존 계약을 유지합니다.
- breakpoint 전환·회전·짧은 화면·sticky 스크롤·세션 복원·새로고침 후 다시 측정합니다. 지도 배경과 마커는 같은 좌표의 투영 위치를 비교하여 캔버스 크기 불일치를 잡습니다. 단순히 지도 타일이 로딩됐다는 사실만으로 정합성을 통과시키지 않습니다. 배경·캔버스 정합성 변경에는 기존 `mobile editor keeps vector geography aligned` 사례를 `check --pattern`으로 추가합니다. 이 사례는 매번 geometry 게이트에서 자동 실행되는 항목이 아닙니다.
- 삭제·핀·순서 이동·실행 취소·일정·저장 및 오래된 비동기 결과 취소는 변경 관련 기존 회귀 사례로 검증합니다. 모양을 다듬기 위해 편집 동작을 바꾸지 않습니다.

## 판정과 검토 기록

`report.json`·`report.md`의 자동 결과와 캡처·텍스트 snapshot을 검토합니다. 보고서의 필드별 의미는 독립적입니다. 모바일의 보조 이미지는 sticky 영역의 자동 스크롤 왜곡을 피하려고 전체 페이지로 촬영하며, PC는 작업 영역을 촬영합니다. `panelCaptureKind`로 구분하고 촬영 후 스크롤·viewport가 원래 조건으로 복원되었는지 확인합니다.

- `functionalLayout`: 해당 phase의 종합 실행 결과입니다. `geometry`와 `capture`의 명령·종료 코드·실제 실행 사례·완료 여부를 구분해 확인합니다. 캡처 성공이 geometry 실패를 덮어쓰지 않으며 선택한 사례 범위 밖의 UX까지 보장하지 않습니다.
- `visualReview`, `copyReview`: 양쪽 캡처와 실제 문구를 검토하기 전에는 `pending`입니다. 자동검사가 통과해도 바뀌지 않습니다.
- `userApproval`: 하네스가 승인하지 않습니다. 에이전트의 검토와 사용자 승인을 구분합니다.

캡처 검토 후 저장소 밖에 다음과 같은 JSON을 작성합니다. 추상적인 “깔끔함” 대신 구체적인 정렬·잘림·여백 관찰을 기록합니다.

```json
{"reviewer":"agent identifier","visualReview":{"status":"reviewed","observations":["390px에서 묶음 텍스트와 번호 배지 중심을 확인했고 PC 배지와도 역할별 크기가 일치함"]},"copyReview":{"status":"pending","observations":[]}}
```

```powershell
npm run qa:ui -- review --input=C:\path\to\review.json
```

상태는 `reviewed`, `needs_changes`, `pending`으로 기록하며 점수·UX 승인으로 해석하지 않습니다. 테스트·캡처 생성만 성공한 상태를 완료라고 보고하지 않습니다. 실제 iPhone Safari·키보드·인증·결제를 실행하지 않았다면 미검증 범위를 명시합니다.

검토가 끝나면 필요한 최종 증거만 선택된 위치에 남기고 작업별 임시 캡처·로그는 정리합니다. 사용자 파일과 다른 작업의 출력은 건드리지 않습니다.
