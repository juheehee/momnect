# 👤 User Service 상세 문서

`user-service`는 Momnect MSA 아키텍처에서 회원/인증/프로필/자녀 정보를 담당하는 서비스입니다.
Gateway를 통해 `/api/v1/user-service/**` 경로로 진입하며, `/auth`, `/users`, `/users/children` 기준으로 API를 제공합니다.

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | `user-service` |
| 실행 포트 | `0` (Eureka 등록 시 동적 할당) |
| 데이터베이스 | MySQL |
| 주요 역할 | 회원가입/로그인/로그아웃/JWT 재발급, 카카오 OAuth2 로그인, 프로필/거래지역/자녀 관리, 아이디·비밀번호 찾기 |

---

## 2. 담당 기능 상세

| 기능 | 설명 |
|------|------|
| 회원가입/로그인 | JWT 기반 인증, 이메일/아이디 중복 확인 |
| 카카오 OAuth2 소셜 로그인 | 신규/기존 유저 분기 처리, 추가정보 입력 흐름 |
| 아이디/비밀번호 찾기 | 이메일 인증 기반 계정 찾기 및 비밀번호 재설정 |
| 마이페이지 | 프로필 조회, 거래 현황, 구매/판매 상품 목록 |
| 프로필 수정 | 닉네임/이메일/휴대전화번호 변경, 중복 확인 |
| 비밀번호 변경 | 현재 비밀번호 확인 후 변경 |
| 자녀 관리 | 자녀 정보 등록/수정/삭제 |
| 거래지역 관리 | 거래 가능 지역 등록/수정 |
| 회원탈퇴 | 비밀번호 확인 후 계정 삭제 |

---

## 3. 주요 API 흐름

### Auth API (`/auth`)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/signup` | 회원가입 |
| POST | `/login` | 로그인 |
| POST | `/logout` | 로그아웃 |
| POST | `/verify-account` | 아이디 찾기 / 비밀번호 재설정 계정 확인 |
| PUT | `/reset-password` | 비밀번호 재설정 |
| POST | `/refresh` | AccessToken 재발급 |
| POST | `/validate` | JWT 검증 (Body) |
| POST | `/validate-cookie` | JWT 검증 (Cookie) |

### User API (`/users`)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/{userId}/basic` | 사용자 기본 정보 조회 |
| GET | `/me/dashboard` | 마이페이지 대시보드 |
| GET | `/me/profile` | 내 프로필 조회 |
| PUT | `/profile` | 프로필 수정 |
| PUT | `/password` | 비밀번호 변경 |
| DELETE | `/account` | 회원탈퇴 |
| PUT | `/me/trade-locations` | 거래지역 수정 |
| GET | `/me/products/purchased` | 구매 상품 목록 |
| GET | `/me/products/sold` | 판매 상품 목록 |

### Child API (`/users/children`)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/` | 자녀 등록 |
| PUT | `/{childId}` | 자녀 수정 |
| DELETE | `/{childId}` | 자녀 삭제 |

---

## 4. 기술적 도전 & 트러블슈팅

### 🔐 카카오 OAuth2 - MSA 환경에서의 구현

**배경**
Spring Security OAuth2 Client를 MSA 구조에서 구현할 때, 게이트웨이와 유저 서비스 사이의 인증 흐름 설계가 필요했다.

**문제 1: Redirect URI 불일치 (KOE205)**
- 카카오 디벨로퍼스에 등록된 Redirect URI와 실제 요청 URI가 달라 인증 실패
- 해결: 카카오 앱 설정의 Redirect URI를 `http://localhost:8000/login/oauth2/code/kakao`로 통일

**문제 2: MSA 환경에서 OAuth2 콜백 라우팅**
- OAuth2 인가 코드는 게이트웨이로 들어오는데, Spring Security OAuth2 처리는 user-service에서 해야 함
- 해결: 게이트웨이에서 `/login/oauth2/**`, `/oauth2/**` 경로를 user-service로 라우팅

**문제 3: 세션 기반 OAuth2 State 검증 실패**
- MSA 환경에서 인증 시작(게이트웨이)과 콜백 처리(user-service) 서버가 달라 세션이 공유되지 않아 State 불일치 오류 발생
- 해결: OAuth2 State/Nonce 저장소를 쿠키 기반으로 변경

---

### 🍪 하이브리드 인증 구조 (JWT 헤더 + 쿠키)

**문제**
카카오 로그인은 OAuth2 리다이렉트 방식이라 Response Body로 토큰 전달 불가 → URL 파라미터 노출 시 보안 위험

**해결: httpOnly 쿠키로 refreshToken 전달**
OAuth2SuccessHandler
→ accessToken: URL 파라미터 (단기, 콜백 페이지에서 즉시 소비)
→ refreshToken: httpOnly 쿠키 (장기, JS 접근 불가)

**프론트 콜백 흐름**
/oauth2/callback 페이지 접근
→ refresh() 호출로 accessToken 재발급
→ Zustand에 accessToken 저장
→ 유저 정보 조회 후 메인 페이지 이동

---

### 👤 신규/기존 유저 분기 처리

**문제**
카카오 로그인 시 신규 유저와 기존 유저를 구분해서 다른 흐름으로 처리해야 함

**해결**
```java
// CustomOAuth2UserService
User existingUser = userRepository.findByOauthId(oauthId);

if (existingUser == null) {
    // 신규 유저 → /additional-info로 리다이렉트 (추가정보 입력)
} else {
    // 기존 유저 → JWT 발급 + 쿠키 세팅 + /oauth2/callback으로 리다이렉트
}
```

---

### 🔄 토큰 만료 시 자동 로그아웃 처리

**문제**
refreshToken 만료 시 로그아웃이 되지 않고 만료된 토큰으로 인한 오류가 연쇄 발생.
임시방편으로 `localStorage.clear()`로 수동 해결하던 상황.

**원인**
토큰 만료 시 인증 상태를 자동으로 초기화하는 로직 부재

**해결**
`api.js` 인터셉터에서 401 응답 시 자동 로그아웃 처리 로직 구현
- refresh 재시도 후에도 실패 시 토큰/상태 초기화 → 로그인 페이지 리다이렉트
- 실제 서비스 운영에서 반드시 필요한 UX 요소임을 인식하고 적용

---

### 🔒 비밀번호 변경 후 폼 데이터 잔류 문제

**문제**
비밀번호 변경 완료 후 새로고침하지 않으면 이전에 입력한 비밀번호가 폼에 그대로 노출

**해결**
변경 완료 후 폼 상태를 초기값으로 reset하도록 수정하여 정보 노출 방지

---

## 5. 카카오 로그인 전체 흐름

```mermaid
graph TB
    A[프론트: 카카오 로그인 버튼] --> B[GET /oauth2/authorization/kakao]
    B --> C[카카오 인가 서버]
    C --> D[사용자 동의]
    D --> E[GET /login/oauth2/code/kakao]
    E --> F[CustomOAuth2UserService]
    F --> G{신규 유저?}
    G -->|Yes| H[/additional-info 추가정보 입력]
    H --> I[회원가입 완료 → 로그인]
    G -->|No| J[JWT 발급 + 쿠키 세팅]
    J --> K[/oauth2/callback]
    K --> L[프론트: refresh 호출]
    L --> M[accessToken 재발급]
    M --> N[메인 페이지 이동]
```

---

## 6. 설정 정보

### 데이터베이스
| 환경변수 | 설명 | 기본값 |
|----------|------|--------|
| `USER_DB_URL` | DB 접속 URL | `jdbc:mysql://localhost:3306/momnect` |
| `USER_DB_USERNAME` | DB 유저명 | - |
| `USER_DB_PASSWORD` | DB 비밀번호 | - |

### JWT
| 환경변수 | 설명 |
|----------|------|
| `JWT_SECRET` | JWT 서명 키 |
| AccessToken 만료 | 30분 (`1800000ms`) |
| RefreshToken 만료 | 7일 (`604800000ms`) |

### OAuth2 (Kakao)
| 환경변수 | 설명 |
|----------|------|
| `KAKAO_CLIENT_ID` | 카카오 앱 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 시크릿 |
| `KAKAO_REDIRECT_URI` | 인가 코드 수신 URI |

---

## 7. 보안 정책

### 공개 엔드포인트 (인증 불필요)
- `/auth/signup`, `/auth/login`, `/auth/verify-account`, `/auth/refresh`
- `/auth/reset-password`, `/auth/validate`, `/auth/validate-cookie`
- `/login/oauth2/**`, `/oauth2/**`
- Swagger UI, 일부 사용자 조회 API

### 인증 필요 엔드포인트
- `/auth/logout`
- `/users/me/**` 전체
- 그 외 모든 요청