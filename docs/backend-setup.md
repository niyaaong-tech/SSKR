# SSKR 백엔드 실행·검증·개통

## 구현 범위

기존 Node/Vercel API에서 Google 로그인, 계정별 루트 저장, 행사 초안·공개 버전, 참가 신청·결제 상태·준비 정보, 체크인·사진·메모리얼을 제공한다. `api/backend.js`가 실제 API 경계이며 `/api/participate/context`는 같은 검증 계정·공개 행사·참가 상태를 반환한다.

공개 사이트를 실제 DB 기반 테스트 웹으로 전환한다. Google 로그인·계정별 루트·참가 신청·준비·체크인·사진·메모리얼과 운영 설정을 연결했다. 테스트 신청은 결제 없이 확정하며 PG·환불은 사업 개시 직전 단계로 보류한다. 아래 PG 관련 구현은 비활성 어댑터이며 테스트 웹 개통 조건에 포함하지 않는다. 실제 현장 GPS·iOS/Android 검수는 별도로 진행한다.

개발 환경: `SSKR-Dev` / `rdskiwnrzmrppsuwbavg`, SnapShare와 같은 `nia_tech’s Org`의 Free 요금제, 서울 `ap-northeast-2`. 유료 옵션은 사용하지 않았다. 현재 Free 조직의 활성 프로젝트 두 자리를 SnapShare와 SSKR-Dev가 사용하므로 운영 프로젝트 생성은 별도로 검토한다. 로컬 실제 모드는 `http://127.0.0.1:8112/app/spots?mode=plan`이며, 기존 목업 검수는 8111 포트로 분리한다.

Google Cloud의 SSKR 전용 프로젝트 `sskr-511717`에 동의 화면과 웹 클라이언트 `SSKR Development`를 생성했다. 외부 사용자 유형의 테스트 모드이며 관리자 계정 한 명을 테스트 사용자로 등록했다. 데이터 액세스는 이메일·기본 프로필·OpenID 세 범위다. SnapShare의 동의 화면·클라이언트·사용자 DB는 변경하지 않았다. 배포 주소의 콜백을 Supabase 허용 목록에 추가했다. Google 앱은 기본 인증 세 범위만 요청하는 테스트 모드이며 확대된 Google API 권한은 사용하지 않는다.

## 환경 설정

SSKR 전용 프로젝트를 SnapShare와 같은 관리 조직에 별도로 만든다. 개발과 운영은 분리하고 서울 리전을 사용한다. 다른 서비스의 테이블·인증 사용자·키를 공유하지 않는다.

`.env.example`을 참고해 추적되지 않는 `.env`에 다음 값을 설정한다.

| 변수 | 용도 |
| --- | --- |
| `SSKR_BACKEND_MODE` | `mock` 또는 `supabase`. 기본값은 기존 미리보기 호환을 위한 `mock`이다. 실제 배포 환경에는 명시적으로 `supabase`를 설정한다. |
| `SSKR_APP_ORIGIN` | 허용한 웹 origin. 로컬 개발: `http://127.0.0.1:8112`. 운영에서는 HTTPS 필수. |
| `SUPABASE_URL` | SSKR 전용 프로젝트 URL |
| `SUPABASE_PUBLISHABLE_KEY` | 해당 프로젝트의 publishable key. Service Role 키를 사용하지 않는다. |
| `SUPABASE_SECRET_KEY` | 서버 전용 서비스 키. 참가 트랜잭션과 비공개 Storage에 사용한다. 브라우저·로그에 노출하지 않는다. |
| `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` | V2 결제위젯용 같은 환경의 `test_gck_`/`test_gsk_` 또는 `live_gck_`/`live_gsk_` 키. Secret은 서버 전용이다. 미설정 시 접수를 열 수 없다. |
| `SSKR_SESSION_SECRET` | 환경마다 다른 암호학적 난수 32바이트의 Base64 값. 쿠키 암호화 키이며 로그·Git·브라우저 JS에 노출하지 않는다. |

```sh
npm ci
node --env-file=.env server/dev-server.js
```

기본 포트는 8080이다. 다른 포트를 쓰면 `SSKR_DEV_PORT`와 `SSKR_APP_ORIGIN`의 포트를 맞춘다. `supabase` 모드에서 필수 설정이 없거나 인증·DB가 실패하면 오류를 반환한다. Mock으로 자동 전환하지 않는다.

Google 이외 로그인 공급자, 이메일 로그인, 익명 로그인은 비활성화한다. 2026-10-16 개발 프로젝트의 공개 Auth 설정에서 활성 공급자가 Google 하나인 것을 확인했다. Google OAuth 클라이언트의 승인된 리디렉션 URI는 `https://rdskiwnrzmrppsuwbavg.supabase.co/auth/v1/callback`이다. Supabase의 허용 Redirect URL은 `supabase/config.toml`에 선언한 로컬 callback 경로로 제한했다. 실제 Google 인증에서 `redirect_to`와 nonce 쿼리 매칭, PKCE 코드 교환, 로그인 전 편집 페이지 복귀를 확인했다. Google 공급자가 준비되지 않았거나 인증 서버가 응답하지 않으면 페이지를 떠나지 않고 안내를 표시해 편집본을 유지한다.

OAuth 클라이언트는 SSKR 프로젝트의 웹 애플리케이션으로 생성한다. 개발 origin은 `http://127.0.0.1:8112`, Google callback은 위 Supabase URL이다. 요청 범위는 `openid`, 이메일, 기본 프로필로 제한한다. 클라이언트 ID와 비밀 키는 무시된 `.env`의 `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`와 `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET`에만 보관한다. Supabase CLI 설정은 `env(...)` 참조를 사용하고, push 전에 diff에서 Google 공급자 및 의도한 redirect 항목만 변경되는지 확인한다. 다운로드한 자격 증명 JSON과 diff의 비밀 키를 Git·로그·문서에 남기지 않는다. 설정 방식은 [Supabase Google 로그인 문서](https://supabase.com/docs/guides/auth/social-login/auth-google)를 따른다.

## DB 적용

공식 CLI로 생성한 `supabase/migrations/`를 순서대로 적용한다. 인증·루트 저장, 행사 설정, 행사별 출발지 검증을 분리했다. 현재 212개 카탈로그 ID와 버전을 검사하며, 일출·일몰 검증에 필요한 출발·도착 12곳의 좌표만 추가로 저장한다. 상세 설명·사진·전체 카탈로그 좌표는 공용 자산을 사용한다. 이후 변경은 새 마이그레이션으로 반영하며 이미 적용한 파일을 덮어쓰지 않는다.

연결된 SSKR 개발 프로젝트가 맞는지 먼저 확인한 뒤 실행한다.

```sh
npm exec supabase -- db push --linked --dry-run
npm exec supabase -- db push --linked
npm exec supabase -- db advisors --linked --type security --fail-on error
```

연결 및 자격 증명은 CLI의 현행 `--help`에 따라 설정한다. 데이터 API의 노출 스키마에 `sskr_private`를 추가하지 않는다. `public.sskr_actor`·`public.sskr_routes`는 SECURITY INVOKER 래퍼다. 비공개 함수는 세션·Google 신원·계정 차단·소유자를 직접 확인한 뒤 한 트랜잭션 안에서 처리한다. 테이블 직접 접근 권한은 없으며, 소유권 RLS도 별도로 적용한다.

## API·편집 계약

- OAuth PKCE 검증자는 10분, 세션 쿠키는 최대 30일이다. HttpOnly·SameSite=Lax·운영 Secure/Host 접두사를 사용한다. Access/Refresh 토큰은 브라우저 JS와 localStorage에 전달하지 않는다. Refresh 토큰의 실제 유효기간과 재사용 정책은 Supabase가 최종 판단한다.
- 변경 요청은 JSON·동일 Origin·`X-SSKR-Request: 1`이 필요하다. Context의 account/snapshot/scenario/mock.now 입력은 실제 모드에서 사용하지 않는다.
- `GET /api/backend?resource=routes`: 계정별 목록, 일정 메타데이터, revision, 저장 상한.
- `POST ...resource=routes`: 생성. `Idempotency-Key` 필수. 루트와 일정을 함께 저장한다.
- `PUT ...resource=routes&id=<uuid>`: 수정. `If-Match: "<revision>"` 필수.
- `PATCH ...resource=routes&id=<uuid>`: 일정만 수정. 같은 revision 검사를 사용한다.
- `DELETE ...resource=routes&id=<uuid>`: 본인 루트 삭제. 동일한 revision 검사.
- 공개 plan 버전 1 필드는 유지한다. 일정·revision은 응답의 별도 필드이며 서버 수정 시 ETag도 반환한다. 핀 배열 기본값은 빈 배열이다.
- 서버가 소유자·시간·고정 도착지·카탈로그/도로 버전을 확정한다. 계정별 잠금 안에서 생성 한도와 빈 자동 번호를 결정한다. `루트 1`과 `루트 01`을 같은 번호로 본다. 10개 상한에서도 기존 루트 수정은 가능하다.
- 412 충돌·401·통신 실패 시 편집본을 유지한다. 인증 서버가 거절하거나 폐기한 세션은 쿠키를 지우고 재로그인할 수 있도록 복구한다. 같은 계정으로 재로그인하면 기존 저장 ID·revision·현재 편집을 이어가며, 명시적 로그아웃과 다른 계정 전환은 계정 격리를 유지한다. 실패한 생성의 식별자를 현재 탭에 보존해 재시도로 중복을 만들지 않는다. 결과를 알 수 없는 생성 요청의 내용을 바꿨다면 저장 목록에서 결과 확인 후 계속한다.
- OAuth 취소·만료 후에는 매니저와 참가 안내 모두 안내를 표시하고 `authError` 쿼리와 이전 자동저장 의도를 소비한다. 다음 로그인 요청에 실패 상태를 되싣지 않는다. 콜백 오류도 로그인 전 페이지로 돌아간다. 참가 안내에서 세션이 만료되어도 비로그인 상태로 한 번 재조회하며, 같은 탭에 남은 루트 편집본을 보존한다.
- 일정 저장은 500ms 지연 후 실행하며 동일 편집기의 저장 요청을 순차 처리한다. 루트 전환 후 늦게 도착한 응답은 현재 루트를 덮어쓰지 않는다. 포커스 복귀와 저장 목록 열기에서 목록을 갱신하되 편집 중인 revision을 자동 승격하지 않는다.
- 실제 모드로 전환할 때 현재 편집 중인 mock 초안만 ID·소유자를 제거한 새 초안으로 복원한다. 사용자가 저장을 요청해야 DB에 생성한다. Mock 저장 목록·참가·결제는 이관하지 않고 로컬 원본도 삭제하지 않는다.
- 운영 행사가 공개되기 전에는 일정·참가·일출 값을 만들어 넣지 않는다. 개인 루트는 작성·저장할 수 있고, 출발 시각 미입력을 허용한다.

## 행사 설정과 공개

- 로컬 운영 설정: `http://127.0.0.1:8112/app/admin`. 실제 관리자 Google 계정 한 명을 개발 DB의 `event_operators`에 등록했다. 브라우저가 보낸 역할이나 사용자 메타데이터로 운영 권한을 판단하지 않는다.
- `GET /api/backend?resource=event`는 로그인 없이 현재 공개 버전만 반환한다. 초안·운영자·감사 이력은 포함하지 않는다. HOME·소개·참가 안내·매니저·루트 편집기가 같은 행사 정보를 읽는다. 현재 실데이터는 공개하지 않았다.
- 운영자 `GET ...resource=events`는 목록, `POST`는 초안 생성, `PUT ...&id=<uuid>`는 수정, `POST ...&id=<uuid>&action=publish`는 공개다. 수정과 공개에는 `If-Match`가 필요하다. 날짜가 미정인 초안도 저장할 수 있다.
- 공개에는 행사 제목·같은 한국 날짜의 유효한 시작/마감·허용 출발지·고정 도착지와 검토된 일출·일몰이 필요하다. 검토 자료의 날짜·좌표·시간대·버전이 행사와 일치해야 한다. 날짜나 장소가 바뀐 뒤 이전 검토를 복사하면 공개가 차단된다.
- 초안, 수정할 수 없는 공개 스냅샷, 현재 공개 버전, 변경 이력을 분리한다. 공개와 루트 저장은 같은 행사 잠금으로 보호한다. 원격 DB 테이블에 직접 접근할 권한은 주지 않는다.
- 루트 저장 시 서버가 행사 ID·설정 버전·시간대를 확정한다. 기존 저장본은 조회만으로 재작성하지 않는다. 행사 변경 시 자동 출발 시각만 새 일출로 갱신하며 직접 입력한 시각·휴게시간·루트·핀은 보존한다. 일정 자동 저장은 보류하고 사용자의 명시적 저장으로 새 버전을 반영한다.
- 편집 중 행사 버전이 바뀌면 `EVENT_CHANGED`(409), 허용 출발지에서 제외되면 `EVENT_START_UNAVAILABLE`(422)를 반환한다. 기존 루트와 입력은 유지한다. 조회·삭제와 이미 성공한 생성 요청의 재전송은 허용한다.
- 행사 공개 후 운영 설정에서 가격·정원·약관·환불 규정·준비 안내·마감과 PG 연결을 확인하고 접수를 열어야 한다. 공개 행사 버전이 바뀌면 접수 설정을 다시 검토·저장하기 전까지 신규 결제를 막는다. 이미 열린 주문은 결제 당시 금액·정책을 유지한다.

## 검증

```sh
npm test
npm run test:backend
npm run test:backend:ui
npm run test:events:ui
```

`test:backend`는 PostgreSQL WASM 엔진(PGlite)에서 실제 마이그레이션·권한·저장 함수를 실행한다. `test:backend:ui`는 실제 BFF 핸들러·PostgreSQL 함수·프런트 어댑터를 함께 사용하며 인증 신원만 주입한다. Chromium과 `BROWSER_ENGINE=webkit`에서 실행할 수 있다. 이 결과로 Google 로그인 또는 Supabase 연결 완료를 주장하지 않는다.

인증 복구 보강 검증: 인증 단위 테스트 7개, Chromium 백엔드 브라우저 테스트 7개, WebKit의 루트 편집본 복구 테스트 2개가 통과했다. 취소·만료 후 재로그인, 폐기된 세션 쿠키 정리, 같은 계정의 저장 ID·revision 유지, 참가 안내 복구를 포함한다. 실제 Google 인증 화면과 토큰 교환은 아래 별도 검증에서 확인했다.

2026-10-16 원격 개발 프로젝트에서 확인한 항목:

- 마이그레이션 `20261015171214` 적용, 카탈로그 ID 212개, 계정별 저장 상한 10개.
- 비로그인 BFF 저장 API와 Supabase RPC 모두 401 차단.
- 독립 DB 요청의 9→10 동시 생성에서 하나만 성공. 자동 번호·동일 요청 재전송·수정 충돌·일정 저장·다른 계정 접근 차단·삭제 후 번호 재사용 검증 통과.
- 원격 검증은 Google 신원과 세션을 SQL 테스트 데이터로 생성하여 실행한다. 실제 OAuth 검증과 구분한다. 무작위 테스트 ID와 전용 표시로 대상을 제한하고 종료 시 정리했다. 잔존 테스트 사용자·루트·요청 레코드 0개 확인.
- 공식 security/performance advisor 오류·경고 0개. 접근 차단용 `settings`·`places`의 RLS 정책 없음과 새 인덱스 미사용은 INFO다. 해당 내부 테이블에는 클라이언트 직접 접근 권한을 주지 않는다.

같은 날 Chrome에서 실제 Google 계정으로 추가 검증했다. 로그인 전 만든 루트가 인증 후 자동 저장되었고, 원격 DB의 Google identity 1개와 revision 1을 확인했다. 이름 수정과 휴게시간 120→90분 변경 후 같은 루트 ID의 revision은 3이 되었다. 새로고침 후 값이 유지됐으며 검수용 루트를 UI에서 삭제한 뒤 해당 DB 레코드가 0개인 것을 확인했다. 실제 계정은 유지한다. 사용자의 지시에 따라 로그아웃 검수는 생략했으며 미확인으로 남긴다.

행사 설정은 PGlite의 실제 SQL 함수, BFF 계약, Chromium·WebKit UI에서 초안/공개·권한·충돌·행사 변경 시 편집본 보존을 검증한다. UI 응답 주입 검사 외에 `event-admin-integration.test.js`에서 실제 BFF·PGlite를 연결해 빈 초안 → 검토 완료 → 공개 → 다른 브라우저의 수정 충돌과 공개값 보존을 검증했다. 인증 신원은 테스트에서 주입하며 실제 Google 로그인 검수와 구분한다. 이 통합 검사에서 발견한 `sunlight: null` 초안 수정 오류는 별도 마이그레이션과 회귀 테스트로 수정했다. 원격 개발 DB 검사도 같은 빈 초안 흐름을 포함하며 테스트 신원·행사·루트를 한 트랜잭션에서 검증한 뒤 rollback하고 잔존 테스트 데이터 0개를 확인한다.

행사 마이그레이션 후 advisor 재실행에서 `auth_leaked_password_protection` 경고 1개를 확인했다. 현재 Google만 활성화되어 있고 이메일/비밀번호 로그인은 꺼져 있다. DB 스키마·RPC의 ERROR/WARN은 없으며 유료 옵션이나 Auth 보안 설정은 변경하지 않았다.

2026-10-16 최종 통합 결과: 기존 정책 테스트 205개, 원격 개발 DB 검사를 포함한 백엔드 테스트 25개, Chromium 행사 UI 테스트 11개, 기존 인증·루트 브라우저 테스트 7개가 통과했다. WebKit에서도 운영 설정 5개·행사 연동 5개·BFF/SQL 통합 1개를 확인했다. 모바일은 360·390px, PC는 1440px에서 배치와 조작 영역을 검사했으며 실제 iPhone 검수와 구분한다.

원격 DB 검증을 다시 실행할 때는 개발 프로젝트를 명시해야 한다. 기본 `test:backend`에서는 원격 테스트를 건너뛴다.

```powershell
$env:SSKR_REMOTE_TEST='rdskiwnrzmrppsuwbavg'
node --test tests/backend/remote.test.js
node --test tests/backend/events-remote.test.js
```

개통 전 남은 검증:

1. 실제 Google 취소·로그아웃·세션 만료·계정 차단, 다른 Google 계정의 접근 격리. 로그인과 본인 루트 DB 접근은 완료했으며, SQL 테스트 신원과 브라우저 주입 검증은 이 별도 계정 검증을 대신하지 않는다.
2. 실제 로그아웃 후 세션 폐기와 저장 API의 401 응답은 이번 검수에서 생략했다.
3. 두 브라우저/기기의 조회·수정·충돌·삭제, 새로고침과 네트워크 끊김 후 복구. 실제 iPhone은 별도 확인.
4. 후속 DB 변경마다 Supabase security/performance advisors 재실행.
5. 실제 모드의 Mock 엔드포인트 차단, 운영 환경 변수·OAuth redirect 허용 범위·쿠키 크기·로그 민감정보 검토.

위 인증·행사 검증에 이어 아래 서비스 흐름을 구현했다. 운영 출시 여부는 마지막 개통 조건으로 판단한다.

## 신청·결제·참가 준비

- 실제 모드의 신청서와 동의 문서 버전을 계정·행사별로 저장한다. 단계 이동·새로고침 후 진행 상태를 복원한다. 브라우저의 계정·가격·권한을 신뢰하지 않는다.
- 결제 준비 시 15분 Hold와 서버 금액을 생성한다. 정원 경쟁·행사 버전·주문 상태·참가 번호는 행사 단위 잠금과 CAS로 확정한다. 확인 중 주문은 만료만으로 정원을 풀지 않는다.
- `/participate/payment.html`에서 Toss V2 위젯을 연다. 서버 승인과 PG 조회 결과가 일치할 때 참가권을 확정한다. 승인 응답 유실은 재조회로 복구하며 중복 클릭·웹훅 재전송이 중복 참가권을 만들지 않는다.
- 웹훅 주소: `/api/backend?resource=payment-webhook`. 웹훅 본문은 조회 계기로만 사용하고 PG 인증 조회로 주문·금액·통화·상태를 확인한다. 통신 실패는 503으로 재시도를 요청한다. 배포 후 PG 대시보드에 주소를 등록하고 실제 재전송 검증을 해야 한다.
- 취소는 사용자 요청 → 운영 검토 → 전액 환불 흐름이다. 검토창은 결제 당시 환불 규정·금액·발송 상태를 표시한다. 기간별 공제·부분 환불 자동 계산은 아직 구현하지 않았다. 합의된 환불 정책이 이를 요구하면 개통 전에 추가한다.
- 바이크·공식 출발지·배송지·안내 확인을 저장한다. 개인 루트 출발지와 공식 출발지는 독립이며 실제 출발 체크인 이후 공식 출발지 변경을 차단한다. 현장 수령 행사에는 배송지 입력·발송 처리를 제공하지 않는다.

## 당일 기록·사진·메모리얼

- `/app/ride`는 체크인할 때만 GPS를 요청한다. 선택된 출발지 → 서로 다른 일반 스팟 N개 → 고정 도착지 순서를 검증한다. N 기본값은 10이며 출발·도착은 제외한다. 출발 시 행사 규칙·좌표·일출/일몰 버전을 고정한다.
- 요청 UUID와 원본 증거를 보존한다. 중복 재전송은 한 번만 반영하고 시각·정확도·반경·순서가 불확실하면 집계에서 제외한 뒤 운영 검토로 보낸다. 원본 좌표·판정은 수정하지 않으며 검토 근거와 운영자 이력을 별도로 남긴다.
- 오프라인 대기는 현재 기기의 계정별 저장소에 최대 30건 보관한다. 온라인 복귀·전송 상태 확인으로 재전송한다. 5분을 넘긴 기록은 자동 승인하지 않는다. 캐시를 지운 기기의 미전송 기록 복구나 브라우저를 닫은 상태의 백그라운드 전송은 지원하지 않는다.
- 사진은 비공개 `sskr-visit-photos`에 저장한다. 방문당 최대 5장, 파일당 8MB, JPG·PNG·WebP만 허용한다. 서버에서 디코딩·픽셀 제한·방향 보정·1600px WebP 파생본 생성·EXIF 제거 후 준비 완료로 표시한다. 원본 다운로드 URL은 공개하지 않는다.
- 사진 공개에는 메모리얼 발행·공개 범위·방문별 동의·운영 승인이 모두 필요하다. 이미지 프록시가 매 요청 권한을 확인하므로 비공개 전환 후 기존 이미지 주소도 차단한다. 업로드 후 편집창을 닫아도 사진을 다시 불러올 수 있다.
- 완주 시 비공개 초안을 생성한다. 제목·소개·방문 메모·사진·공개 범위는 revision으로 충돌을 검사한다. 실제 모드에는 합성 라이더·합성 GPX·추정 주행거리·주행 궤적을 만들어 넣지 않는다. 현재 실제 기록은 체크인 지점과 시각을 제공한다.

## 저장 경계와 복구

논리적 신청·참가·주행·메모리얼은 `sskr_private.workflows`의 계정·행사별 JSON aggregate에 저장한다. 순수 정책 모듈은 기존 `server/participate`와 공유하되 mock 저장소·fixture는 읽지 않는다. 주문 인덱스·변경 감사·GPS 원본 증거는 별도 테이블이다. 브라우저 역할에는 테이블과 워크플로 RPC 권한을 주지 않으며 인증된 BFF만 서비스 키로 호출한다.

유지보수 도구는 한 번에 결제 50건·사진 50건을 처리한다. 기본 실행은 대상 수만 조회한다. `--apply`로 PG 상태를 재조회하고 3시간 이상 된 미완료·삭제 사진의 파일을 정리한다. 확정 사진은 재검사 후 보존한다. PG에 상태가 없는 주문은 결제로 확정하거나 임의 취소하지 않는다. 결과의 `checked`는 조회한 수이며 결제 확정 수가 아니다.

```powershell
node --env-file=.env tools/maintain-service.cjs
node --env-file=.env tools/maintain-service.cjs --apply
```

정기 실행 스케줄은 아직 연결하지 않았다. 운영 인프라 확정 후 실패 알림과 함께 등록한다. API·로그·유지보수 출력에는 개인 주소·위치·키를 출력하지 않는다.

## 서비스 통합 검수와 남은 개통 조건

2026-10-16 개발 DB에 `service_workflows`, `service_maintenance`, `account_profile`, `profile_rpc_boundary`를 반영했다. 원격 트랜잭션 검사에서 RPC 접근 제한·정원 초과 롤백·버전 충돌·프로필 저장·비공개 버킷을 확인했고 검수 신원과 행사는 모두 롤백했다. 실제 Storage의 서명 업로드·WebP 저장·비로그인 접근 차단을 검사한 뒤 무작위 검수 경로의 파일을 삭제했다. 운영자·실계정·현재 행사 상태는 보존했다.

Chromium·WebKit에서 신청 복원·약관·결제위젯 진입·참가 준비·체크인 12건·메모리얼 수정/공개/철회를 검증한다. 사용한 PG·위치·신원은 테스트 경계이며 실제 결제나 실기기 검증이 아니다. 360·390·430·1440px에서 입력·목록·가로 넘침을 검사한다. 메모리가 적은 PC에서는 PGlite 테스트를 동시에 여러 개 띄우지 않도록 `--test-concurrency=1`을 사용한다.

```powershell
npm test
npm run test:backend
npm run test:workflow:ui
$env:BROWSER_ENGINE='webkit'
npm run test:workflow:ui
$env:SSKR_REMOTE_TEST='rdskiwnrzmrppsuwbavg'
node --test tests/backend/workflows-remote.test.js
node --env-file=.env --test tests/backend/storage-remote.test.js
```

개통 전에는 다음을 완료해야 한다.

1. 실제 행사 날짜·일출/일몰·가격·정원·약관·환불 규정·준비 마감을 등록하고 공개한다. 검수 fixture를 공식 행사로 승격하지 않는다.
2. Toss 테스트 키를 연결하여 실제 테스트 승인·취소·승인 응답 유실·웹훅 재전송을 검증한다. 운영 계약·live 키 전환과 부분 환불 정책은 별도 확인한다.
3. 실제 모바일에서 위치 권한·오프라인 복귀·사진 업로드·타 기기 조회를 검증한다. 사용자 요청으로 생략한 로그아웃 검수는 미확인으로 유지한다.
4. 운영 DB·Vercel 환경·OAuth 공개 범위·웹훅·유지보수 스케줄·백업/복원·알림을 설정하고 검증한 뒤 실제 모드를 개통한다. 현재 운영 사이트는 mock이다.
5. 부분 환불 자동화와 장기 데이터 보존/삭제 정책 집행은 잔여 구현 범위다. 실제 모드에서 목업 성공을 반환하지 않는다.

## 계정 연락처와 운영 공지

`/app/profile`의 이름·연락 이메일·휴대전화는 인증된 소유자의 프로필 테이블에 저장한다. 수정에는 revision을 요구하며 충돌 시 입력을 보존한다. Google 로그인 이메일·신원·제출된 참가 신청·배송지와 독립이다. 연락 이메일 수정으로 인증 계정을 병합하거나 바꾸지 않는다.

운영 설정에서 제목·본문·공개 시각으로 공지를 작성한다. 공개 시각이 없으면 초안이며 미래 시각이면 예약 상태로 유지한다. 공개 시점부터 매니저와 `/app/notices`에 표시한다. 공개 공지에는 개인정보나 참가자 전용 안내를 넣지 않는다. 참가자 전용 준비 안내는 별도 필드를 사용한다.

2026-10-16 추가 검증 결과: 기존 정책 205개, 로컬 백엔드 31개 통과. 원격 검증 4개는 기본 실행에서 제외하고 개발 프로젝트를 명시해 별도 실행했다. 실제 Storage 검수 파일과 DB 검수 신원·행사는 정리했다. 서비스 브라우저 테스트는 Chromium 5개·WebKit 5개, 인증·루트 회귀 7개와 행사 BFF/SQL UI 통합 1개가 통과했다. 운영 설정 저장 성공을 오류로 표시하던 응답 계약, 업로드 실패의 사진 할당 누수, 저장 전 업로드 사진 복원, 현장 수령 행사의 발송 버튼을 이 과정에서 수정했다.

최종 security advisor의 DB ERROR/WARN은 0건이다. 직접 접근을 막은 private 테이블의 RLS 정책 없음은 INFO이며 performance advisor는 인덱스 관련 INFO만 반환했다. 기존 Google 전용 구성의 [비밀번호 유출 방지 경고](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) 1건은 남아 있다. 비밀번호 로그인과 유료 옵션은 활성화하지 않았다.


## 테스트 웹 배포 기준 (2026-10-16 변경)

현재 공개 사이트는 사업 운영 전 테스트 웹으로 전환한다. SSKR-Dev와 Google OAuth를 연결하고 모든 사용자 데이터는 실제 DB·Storage에 저장한다. 공개 서비스에서 시나리오 계정·가상 참가 이력·샘플 메모리얼을 사용하지 않는다.

- 서버 환경변수 SSKR_BACKEND_MODE=supabase, SSKR_PARTICIPATION_MODE=test를 지정한다. 키·세션 비밀값은 Vercel production 환경에만 보관한다.
- 신청 최종 단계는 테스트 참가 확정이다. 정원·신청 내용·동의 버전·중복을 서버에서 검사하고 참가번호를 배정한다. paymentAttempts와 payment_orders를 생성하지 않으며 participation.confirmationSource=TEST_NO_CHARGE로 출처를 남긴다.
- 결제·환불 API와 운영 버튼은 차단한다. PG 키·환불 규정은 테스트 접수 조건이 아니다. 실제 결제·환불 개발과 검수는 사업 시작 직전의 최종 단계다. 기존 어댑터의 단위 검사는 미래 회귀 방지용이며 개통 증거가 아니다.
- 공개 테스트 일정은 2026-11-15, 정원 1,000명, 공식 출발지 11개, 도착지 대천해수욕장, 스팟 최소 10개다. 정식 개최일·유료 참가권·키트 제공으로 안내하지 않는다. NOAA 근사 계산을 검토한 테스트용 일출·일몰을 사용하며 행사 운영 도구에서 일정을 변경할 수 있다. 변경 후 접수 설정도 새 버전으로 다시 저장해야 한다.
- 체크인은 실제 위치와 지정된 테스트 일정으로 검증한다. 테스트 참가라는 이유로 거리·순서·N개 조건을 우회하지 않는다. 현장 검수일은 운영 도구에서 조정한다.
- production origin은 https://sskr.vercel.app, 로컬은 http://127.0.0.1:8112다. Supabase redirect 목록에는 두 서버의 callback만 등록하며 세션 비밀값을 분리한다.

위 기준은 앞 절의 PG 및 운영 DB 개통 조건보다 우선한다. 실사업 개시 전에는 결제·환불·사업용 환경과 법적 정책을 별도로 완성해야 한다.
