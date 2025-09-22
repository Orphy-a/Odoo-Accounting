# Odoo Accounting Backend

Odoo 17.0 기반 커스텀 회계 모듈입니다.

## 실행환경

- Docker
- Docker Compose

## 설치 및 실행

### 1. 프로젝트 디렉토리 이동
```bash
cd Odoo-Accounting
```

### 2. 백엔드 실행
```bash
docker-compose up -d
```

### 3. 웹 인터페이스 접속
```
http://localhost:8069
```

## 서비스 구성

- **PostgreSQL 15**: 데이터베이스 (포트 5432)
- **Odoo 17.0**: 애플리케이션 서버 (포트 8069)

## 초기 설정

1. 데이터베이스 생성 마법사 실행
2. 관리자 계정 생성
3. Apps 메뉴에서 "Odoo Accounting" 모듈 설치



# Odoo 회계 모듈 프론트엔드

Odoo를 활용한 커스텀 회계 모듈의 React 프론트엔드 애플리케이션입니다.

## 🚀 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm start
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

### 3. 프로덕션 빌드
```bash
npm run build
```

## 📋 주요 기능

- **대시보드**: 회계 현황 및 요약 정보
- **계정과목 관리**: 계정과목 CRUD 기능
- **거래처 관리**: 거래처 정보 관리
- **분개장**: 회계 분개 관리
- **고정자산**: 자산 관리 및 감가상각
- **세금 관리**: 세금 설정 및 계산
- **세금 신고서**: 세금 신고서 생성 및 관리

## 🛠 기술 스택

- **React 18** - 프론트엔드 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **Heroicons** - 아이콘

## 🔧 환경 설정

### 백엔드 연결
- 프록시 설정: `http://localhost:8069` (Odoo 서버)
- API 엔드포인트: `/api/accounting/*`

### 개발 환경
- Node.js 16+ 필요
- Odoo 백엔드 서버 실행 필요 (포트 8069)

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Dashboard.tsx
│   ├── Accounts.tsx
│   ├── JournalEntries.tsx
│   ├── Partners.tsx
│   ├── Assets.tsx
│   ├── Taxes.tsx
│   └── TaxReports.tsx
├── services/           # API 서비스
│   └── api.ts
├── types/             # TypeScript 타입 정의
│   └── index.ts
├── App.tsx           # 메인 앱 컴포넌트
└── index.tsx         # 앱 진입점
```

## 🔗 API 엔드포인트

- `GET /api/accounting/accounts` - 계정과목 조회
- `GET /api/accounting/partners` - 거래처 조회
- `GET /api/accounting/journal-entries` - 분개장 조회
- `GET /api/accounting/assets` - 고정자산 조회
- `GET /api/accounting/taxes` - 세금 조회
- `GET /api/accounting/tax-reports` - 세금 신고서 조회

