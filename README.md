# 💻 1. 프로젝트 기획서

## 📄 1-1. 프로젝트 개요

- **프로젝트명:** Momnect
- **진행 기간:**

  - 2025.07.18 ~ 2025.09.10

- **설명:**  
  👶 육아맘 전용 중고거래 플랫폼
“육아의 물물교환, 같은 엄마끼리 더 쉽고 따뜻하게”
‘육아맘 전용 중고거래 플랫폼’은
영유아 자녀를 둔 부모들이 아기용품, 육아템, 의류, 장난감 등을 월령별로 손쉽게 거래할 수 있도록 설계된 지역 기반의 맞춤형 중고거래 서비스입니다.

## 👨‍💼 1-2. 팀원 구성

| 이주희(팀장)                                                           | 이정아                                                           | 지정호                                                           | 박범석                                                           | 배기열                                                           |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| ![이주희](https://avatars.githubusercontent.com/u/106491547?v=4) | ![이정아](https://avatars.githubusercontent.com/u/106491548?v=4) | ![지정호](https://avatars.githubusercontent.com/u/106491549?v=4) | ![박범석](https://avatars.githubusercontent.com/u/123456789?v=4) | ![배기열](https://avatars.githubusercontent.com/u/106491551?v=4) |
|유저 서비스 | 상품 서비스 | 채팅 서비스 | 커뮤니티 서비스 | 리뷰 서비스

## 📅 1-3. 프로젝트 설명

본 프로젝트는 MSA 아키텍처 기반의 육아물품 중고거래 플랫폼 프로젝트이다.
육아용품은 사용 기간이 짧아 중고 수요가 꾸준히 발생하며, 실제로 카페·SNS·기존 중고 플랫폼에서 활발히 거래되고 있다.

• 그러나 기존 플랫폼(번개장터, 당근마켓 등)은 육아 특화 기능(연령별 검색, 추천 월령, 안전 필터 등)이 부족하다. <br>
• 육아맘들은 월령별 필터와 추천 기능, 육아 전용 UX/UI를 필요로 하다. <br>
• 같은 육아 환경을 공유하는 부모들 사이에서는 커뮤니티 기반의 신뢰 거래 가능성이 높다. <br>
• 육아 관련 지출은 증가하는 추세이며, 모바일 기반 육아 커머스·중고거래 시장은 성장 가능성이 크다. <br>

## 🔄 1-4. 목표 및 범위

• 육아맘 전용 맞춤형 중고거래 플랫폼을 구축 <br>
• 월령별 필터, 추천 상품 등 육아 특화 기능 제공 <br>
• 사용자 및 월령 인증,리뷰, 후기로 신뢰성 높은 거래 문화 조성 <br>
• 육아 정보 공유 커뮤니티 기능을 통해 공감과 소통의 장 형성 <br>
• 중고거래를 통해 육아 비용 절감 및 친환경 소비문화 확산 <br>

또한 CI/CD, 클라우드(AWS) 환경에서의 자동화된 배포 파이프라인 구축 등
개발부터 배포까지 전 과정을 경험하고, 실제 서비스와 유사한 환경을 구축하는 것을 목표로 한다.

## 🔢 1-5. 주요 기능 목록

- **회원가입 및 로그인**
  : 회원가입/로그인, JWT 인증 적용, 카카오 OAuth2 소셜 로그인
- **상품 판매 및 상품 검색**
  : FTP 파일 서버를 사용한 상품 등록 및 엘라스틱 서치를 활용한 상품 검색기능 최적화 적용
- **채팅 서비스**
  : websocket을 사용한 실시간 통신 및 mongoDB를 사용한 document 형식의 메시지 저장
- **리뷰 서비스**
  : open AI를 활용한 긍정/부정 리뷰 요약
- **커뮤니티 서비스**
  : 육아꿀팁 / 상품 경매 CRUD

## 📋 1-7. 담당 기능

| 담당자 | 서비스명 (`영문-service`)          | 주요 역할/설명                                                 |
| ------ | ---------------------------------- | -------------------------------------------------------------- |
| 이주희 | **사용자 관리**           | 회원가입/로그인, 카카오 OAuth2 소셜 로그인 프로필 관리,     자녀 정보 관리,      거래지역 관리,    회원탈퇴              |
| 이정아 | **상품 관리** | 상품 등록/수정 상품 검색, 카테고리 분류,   이미지 업로드,   상품 상태 관리   |
| 지정호 | **실시간 채팅**        | WebSocket 통신, 채팅방 관리 메시지, 히스토리, 읽음 상태                      |
| 배기열 | **리뷰 관리**            | open AI를 활용한 긍정/부정 리뷰 요약    |
| 박범석 | **커뮤니티 관리**               | 육아꿀팁 / 상품 경매 CRUD |

> 📎 유저 서비스 상세 구현 내용: [USER_SERVICE.md](./USER_SERVICE.md)

## 🌐 1-8. MSA 식 구조

| 모듈명                   | 기능 역할                                                          | 담당자 |
| ------------------------ | ------------------------------------------------------------------ | ------ |
| **`Product Service`**       | 상품 CRUD, 검색, 카테고리 관리                   | 이정아 |
| **`User Service`**       | 회원가입/로그인, JWT 인증, 마이페이지, 사용자 정보 관리               | 이주희 |
| **`Post Service`**    | 게시판, 댓글, 좋아요                                 | 박범석 |
| **`Review Service`** | OpenAI 기반 리뷰 요약, 리뷰 CRUD, 평점 관리                       | 배기열 |
| **`Chat Service`**    | 채팅 메시지 저장, 히스토리                            | 지정호 |
| **`WebSocket Service`**      | 실시간 메시징, STOMP                         | 지정호 |
| **`File Service`**           | 파일 업로드, 이미지 처리                                | 이정아 |
| **`gateway-service`**    | API Gateway, 라우팅, 인증, 로드밸런싱                              | 이정아 |
| **`discovery-service`**  | Eureka 서버, 서비스 등록/발견                                      | 이정아 |

---

# 📚 2. Momnect 요구사항 정의서
https://www.notion.so/coffit23/26aa02b1ffb180289633fb74ec212bd3

# 📌 3. 세부 기능 설명

- [**`MSA 아키텍쳐 설계`**](https://www.notion.so/coffit23/26aa02b1ffb1809bbb9bfc93c103c48a)
- [**`API 명세서`**](https://www.notion.so/coffit23/API-26aa02b1ffb1800d8020e745a83f9472)
- [**`UI 테스트 케이스`**](https://www.notion.so/coffit23/UI-26aa02b1ffb1800383dfddfd2780569d)
- [**`스토리보드`**](https://www.notion.so/coffit23/26aa02b1ffb18032830fff522baa83b6)
- [**`인터페이스 설계서`**](https://www.notion.so/coffit23/26aa02b1ffb180729e78f56dfbd28ed2)
- [**`프로젝트 테스트 결과서`**](https://www.notion.so/coffit23/26aa02b1ffb1807c81a4e7a6c5d28e2e)
- [**`CI/CD 설계서`**](https://www.notion.so/coffit23/CI-CD-26aa02b1ffb180b49038c0af569f6dc3)
- [**`테스트 결과서`**](https://www.notion.so/coffit23/26aa02b1ffb180f9958dde37ea419b16)
- [**`테스트 케이스`**](https://www.notion.so/coffit23/26aa02b1ffb180e49fe3ed08ce74cc48)
- [**`시연 영상`**](https://www.notion.so/coffit23/26aa02b1ffb18078bfeaeb8da4709529)

---

# 🛠 4. 기술 스택

## 🖥️ 4-1. 프론트엔드 기술 스택

| 항목                      | 사용 기술                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **프론트엔드 언어**       | ![JavaScript](https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)                                                                                                                             |
| **프론트엔드 프레임워크** | ![Next.js](https://img.shields.io/badge/NEXT.JS_15-000000?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/REACT_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)                               |
| **스타일링**              | ![Tailwind CSS](https://img.shields.io/badge/TAILWIND_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)                        |
| **UI 컴포넌트**           | ![Shadcn/ui](https://img.shields.io/badge/SHADCN/UI-000000?style=for-the-badge&logo=shadcn&logoColor=white) ![Lucide React](https://img.shields.io/badge/LUCIDE_ICON-FF6B6B?style=for-the-badge&logo=lucide&logoColor=white)                  |
| **상태 관리**             | ![Zustand](https://img.shields.io/badge/ZUSTAND-764ABC?style=for-the-badge&logo=zustand&logoColor=white)                                                                                                                                      |
| **배포**                  | ![GitHub Actions](https://img.shields.io/badge/GITHUB_ACTIONS-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)              |

## 🔧 4-2. 백엔드 기술 스택

| 항목                  | 사용 기술                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **백엔드 언어**       | ![Java](https://img.shields.io/badge/JAVA-007396?style=for-the-badge&logo=java&logoColor=white)                                                                                                                                                                                                                               |
| **백엔드 프레임워크** | ![Spring](https://img.shields.io/badge/SPRING-6DB33F?style=for-the-badge&logo=spring&logoColor=white) ![Spring Boot](https://img.shields.io/badge/SPRINGBOOT-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) |
| **데이터베이스**      | ![MySQL](https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![MongoDB](https://img.shields.io/badge/MONGODB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) |                                                                                                                                                                                                                                                                                                                              |
| **검색/분석**         | ![Elasticsearch](https://img.shields.io/badge/ELASTICSEARCH-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)                                                                                |
| **AI**             | ![OpenAI](https://img.shields.io/badge/OPENAI-412991?style=for-the-badge&logo=openai&logoColor=white)                                                                                                                      |
| **협업/버전관리**     | ![GitHub](https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=github&logoColor=white) ![Git](https://img.shields.io/badge/GIT-F05032?style=for-the-badge&logo=git&logoColor=white)                                                                                                                                                                                                                                   |
| **배포/운영**         | ![Docker](https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Kubernetes](https://img.shields.io/badge/KUBERNETES-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white) ![Jenkins](https://img.shields.io/badge/JENKINS-D24939?style=for-the-badge&logo=jenkins&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)  |

---

# 🏗️ 5. 프론트엔드 아키텍처 및 구조

## 📁 5-1. 프로젝트 구조

```
BE09-Final-2team-FE/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (user)/             # 사용자 관련 페이지 그룹
│   │   │   ├── login/          # 로그인
│   │   │   ├── signup/         # 회원가입
│   │   │   ├── mypage/         # 마이페이지
│   │   │   ├── profile-edit/   # 프로필 수정
│   │   │   ├── password-change/# 비밀번호 변경
│   │   │   ├── find-account/   # 아이디/비밀번호 찾기
│   │   │   ├── additional-info/ # 카카오 추가정보 입력
│   │   │   ├── location-management/ # 거래지역 관리
│   │   │   ├── child-management/    # 자녀 관리
│   │   │   ├── withdrawal/          # 회원탈퇴
│   │   │   └── user-profile/        # 사용자 프로필
│   │   ├── chat/               # 채팅 기능
│   │   │   ├── components/     # 채팅 컴포넌트
│   │   │   ├── api/           # 채팅 API
│   │   │   └── page.jsx       # 채팅 메인 페이지
│   │   ├── product/            # 상품 관련
│   │   │   ├── form/          # 상품 등록/수정
│   │   │   ├── [id]/          # 상품 상세
│   │   │   └── page.jsx       # 상품 목록
│   │   ├── post/               # 게시글 관련
│   │   ├── review/             # 리뷰 관련
│   │   ├── main/               # 메인 페이지
│   │   ├── example/            # 예제 페이지 (개발용)
│   │   ├── loading/            # 로딩 페이지
│   │   ├── not-found.jsx       # 404 페이지
│   │   ├── layout.jsx          # 루트 레이아웃
│   │   └── page.jsx            # 홈페이지
│   ├── components/
│   │   ├── common/             # 공통 컴포넌트
│   │   │   ├── Header.jsx      # 헤더
│   │   │   ├── Footer.jsx      # 푸터
│   │   │   ├── Sidebar.jsx     # 사이드바
│   │   │   ├── ProductCard.jsx # 상품 카드
│   │   │   ├── WishlistSidebar.jsx # 위시리스트
│   │   │   └── ConfirmModal.jsx # 확인 모달
│   │   └── ui/                 # UI 컴포넌트 (Radix UI 기반)
│   │       ├── button.jsx      # 버튼 컴포넌트
│   │       ├── dialog.jsx      # 다이얼로그
│   │       ├── dropdown-menu.jsx # 드롭다운 메뉴
│   │       ├── tabs.jsx        # 탭 컴포넌트
│   │       └── scroll-area.jsx # 스크롤 영역
│   ├── lib/                    # 라이브러리 설정
│   │   ├── api.js              # Axios 설정 및 인터셉터
│   │   ├── websocketManager.js # WebSocket 관리
│   │   └── utils.js            # 유틸리티 함수
│   ├── store/                  # 상태 관리 (Zustand)
│   │   ├── userStore.js        # 사용자 상태
│   │   ├── categoryStore.js    # 카테고리 상태
│   │   ├── sidebarStore.js     # 사이드바 상태
│   │   └── mypageStore.js      # 마이페이지 상태
│   ├── hooks/                  # 커스텀 훅
│   │   └── useSidebar.js       # 사이드바 훅
│   ├── utils/                  # 유틸리티 함수
│   │   ├── format.js           # 포맷팅 함수
│   │   ├── profileImageUtils.js # 프로필 이미지 처리
│   │   ├── flattenCategoryNames.js # 카테고리 데이터 처리
│   │   └── groupCategoryData.js # 카테고리 그룹화
│   └── enums/                  # 열거형 상수
│       ├── ageGroup.js         # 연령대
│       ├── productStatus.js    # 상품 상태
│       ├── sortOption.js       # 정렬 옵션
│       └── tradeStatus.js      # 거래 상태
├── public/                     # 정적 파일
│   ├── fonts/                  # 폰트 파일
│   │   └── PretendardVariable.ttf
│   └── images/                 # 이미지 파일
│       ├── common/             # 공통 이미지
│       ├── main/               # 메인 페이지 이미지
│       └── product/            # 상품 관련 이미지
├── common-css/                 # 공통 CSS
│   ├── ProductCard.css         # 상품 카드 스타일
│   └── WishlistSidebar.css    # 위시리스트 스타일
├── components.json             # shadcn/ui 설정
├── next.config.mjs             # Next.js 설정
├── tailwind.config.js          # Tailwind CSS 설정
├── postcss.config.mjs          # PostCSS 설정
├── eslint.config.mjs           # ESLint 설정
├── jsconfig.json               # JavaScript 설정
├── package.json                # 의존성 관리
├── Dockerfile                  # Docker 설정
├── Dockerrun.aws.json          # AWS 배포 설정
└── README.md                   # 프로젝트 문서
```

## 🎯 5-2. 프론트엔드 주요 기능

### 🔐 인증 및 사용자 관리

- **회원가입/로그인**: JWT 기반 인증 시스템
- **프로필 관리**: 사용자 정보 수정
- **자녀 정보 관리**: 자녀 연령대별 상품 추천
- **거래지역 관리**: 거래 가능 지역 설정
- **회원탈퇴**: 안전한 계정 삭제

### 📰 상품 관련 기능

- **상품 등록/수정**: CKEditor를 활용한 상세 설명
- **상품 검색**: Elasticsearch 기반 고성능 검색
- **카테고리 분류**: 체계적인 상품 분류 시스템
- **이미지 업로드**: 다중 이미지 업로드 및 관리
- **상품 상태 관리**: 판매중, 예약중, 판매완료 상태 관리

### 📧 채팅 관련 기능

- **WebSocket 통신**: STOMP 프로토콜 기반 실시간 메시징
- **채팅방 관리**: 상품별 채팅방 생성 및 관리
- **메시지 히스토리**: 채팅 기록 저장 및 조회
- **읽음 상태**: 메시지 읽음/안읽음 상태 표시

### 🤖 리뷰 관련 기능

- **리뷰 요약**: OpenAI 기반 뉴스 요약
- **리뷰 CRUD**: 구매한 상품에 대한 리뷰 작성/조회/수정/삭제

### 📃게시글 관련 기능
- **게시판**: 자유게시판, 공지사항 등
- **게시글 작성**: CKEditor 기반 리치 텍스트 에디터
- **댓글 시스템**: 게시글 댓글 작성 및 관리
- **좋아요/북마크**: 관심 게시글 저장

# 🏗️ 6. 백엔드 아키텍처 및 구조

## 📁 프로젝트 구조

```
BE09-Final-2team-BE/
├── discovery-service/           # 서비스 디스커버리 (Eureka Server)
│   ├── src/main/java/
│   │   └── com/momnect/discoveryservice/
│   │       └── DiscoveryServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── gateway-service/             # API 게이트웨이
│   ├── src/main/java/
│   │   └── com/momnect/gatewayservice/
│   │       ├── config/         # 게이트웨이 설정
│   │       ├── filter/         # 필터 (JWT, CORS 등)
│   │       └── GatewayServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── user-service/                # 사용자 관리 서비스
│   ├── src/main/java/
│   │   └── com/momnect/userservice/
│   │       ├── controller/    # REST 컨트롤러
│   │       ├── service/       # 비즈니스 로직
│   │       ├── repository/    # 데이터 접근 계층
│   │       ├── entity/        # JPA 엔티티
│   │       ├── dto/           # 데이터 전송 객체
│   │       ├── config/        # 설정 클래스
│   │       ├── security/      # 보안 설정
│   │       │   └── oauth2/    # OAuth2 콜백 처리
│   │       └── UserServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── product-service/             # 상품 관리 서비스
│   ├── src/main/java/
│   │   └── com/momnect/productservice/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── entity/
│   │       ├── dto/
│   │       ├── config/
│   │       ├── elasticsearch/  # Elasticsearch 설정
│   │       └── ProductServiceApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── data.sql           # 초기 데이터
│   ├── build.gradle
│   └── Dockerfile
│
├── post-service/                # 게시판 서비스
│   ├── src/main/java/
│   │   └── com/momnect/postservice/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── entity/
│   │       ├── dto/
│   │       └── PostServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── review-service/              # 리뷰 서비스
│   ├── src/main/java/
│   │   └── com/momnect/reviewservice/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── entity/
│   │       ├── dto/
│   │       └── ReviewServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── chat-service/                # 채팅 메시지 서비스
│   ├── src/main/java/
│   │   └── com/momnect/chatservice/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── entity/
│   │       ├── dto/
│   │       └── ChatServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── websocket-service/           # WebSocket 서비스
│   ├── src/main/java/
│   │   └── com/momnect/websocketservice/
│   │       ├── config/        # WebSocket 설정
│   │       ├── controller/    # STOMP 엔드포인트
│   │       ├── service/       # 메시지 처리
│   │       ├── listener/      # 이벤트 리스너
│   │       └── WebSocketServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── file-service/                # 파일 관리 서비스
│   ├── src/main/java/
│   │   └── com/momnect/fileservice/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── config/
│   │       └── FileServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── Dockerfile
│
├── open-ai-service/             # AI 서비스 (개발 중)
│   ├── src/main/java/
│   │   └── com/momnect/openaiservice/
│   └── src/main/resources/
│       └── application.yml
│
├── _k8s/                        # Kubernetes 배포 설정
│   ├── discovery-service.yaml
│   ├── gateway-service.yaml
│   ├── user-service.yaml
│   ├── product-service.yaml
│   ├── post-service.yaml
│   ├── review-service.yaml
│   ├── chat-service.yaml
│   ├── websocket-service.yaml
│   └── file-service.yaml
│
├── Jenkinsfile                  # CI/CD 파이프라인
├── docker-compose.yml           # 로컬 개발용 Docker Compose
└── README.md                    # 프로젝트 문서
```

## 6.1 마이크로서비스 아키텍처

### 서비스별 역할

| 서비스                | 포트 | 주요 기능                    | 데이터베이스         |
| --------------------- | ---- | ---------------------------- | -------------------- |
| **Discovery Service** | 8761 | 서비스 디스커버리, 헬스체크  | -                    |
| **Gateway Service**   | 8000 | API 라우팅, 인증, 로드밸런싱 | -                    |
| **User Service**      | 0\*  | 사용자 관리, 인증, 프로필    | MySQL                |
| **Product Service**   | 0\*  | 상품 CRUD, 검색, 카테고리    | MySQL, Elasticsearch |
| **Post Service**      | 0\*  | 게시판, 댓글, 좋아요         | MySQL                |
| **Review Service**    | 0\*  | 리뷰 작성, 평점 관리         | MySQL                |
| **Chat Service**      | 0\*  | 채팅 메시지 저장, 히스토리   | MySQL, mongoDB        |
| **WebSocket Service** | 0\*  | 실시간 메시징, STOMP         | -                    |
| **File Service**      | 0\*  | 파일 업로드, 이미지 처리     | -                    |

\*포트 0: Eureka를 통한 동적 포트 할당

### 서비스 간 통신

```mermaid
graph TB
    Client[Client] --> Gateway[Gateway Service]
    Gateway --> User[User Service]
    Gateway --> Product[Product Service]
    Gateway --> Post[Post Service]
    Gateway --> Review[Review Service]
    Gateway --> Chat[Chat Service]
    Gateway --> File[File Service]
    Gateway --> WebSocket[WebSocket Service]

    %% 서비스들은 Discovery에 등록
    User -->|register| Discovery[Discovery Service]
    Product -->|register| Discovery
    Post -->|register| Discovery
    Review -->|register| Discovery
    Chat -->|register| Discovery
    File -->|register| Discovery
    WebSocket -->|register| Discovery
    Gateway -->|lookup| Discovery
```
