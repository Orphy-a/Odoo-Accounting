# Odoo Accounting Backend PRD (Product Requirements Document)

## 1. 개요

### 1.1 프로젝트 목적
Odoo 17.0 기반의 커스텀 회계 모듈을 개발하여 한국 기업의 회계 업무를 효율적으로 처리할 수 있는 백엔드 시스템을 구축합니다.

### 1.2 기술 스택
- **Backend Framework**: Odoo 17.0 (Python)
- **Database**: PostgreSQL 15
- **Container**: Docker & Docker Compose
- **API**: RESTful API (JSON/HTTP)

## 2. 시스템 아키텍처

### 2.1 전체 구조
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Odoo Backend  │    │   PostgreSQL    │
│   (React/TSX)   │◄──►│   (Python)      │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 모듈 구성
- **Core Models**: 회계 기본 모델
- **API Controllers**: REST API 엔드포인트
- **Views**: 사용자 인터페이스
- **Security**: 접근 권한 관리

## 3. 핵심 기능 요구사항

### 3.1 계정과목 관리 (Chart of Accounts)
- **기능**: 계정과목 생성, 수정, 삭제, 조회
- **API 엔드포인트**:
  - `GET /api/accounting/accounts` - 계정과목 목록 조회
  - `POST /api/accounting/accounts` - 계정과목 생성
  - `GET /api/accounting/accounts/{id}` - 특정 계정과목 조회
  - `PUT /api/accounting/accounts/{id}` - 계정과목 수정
  - `DELETE /api/accounting/accounts/{id}` - 계정과목 삭제

### 3.2 분개장 관리 (Journal Entries)
- **기능**: 회계 분개 생성, 수정, 삭제, 조회
- **API 엔드포인트**:
  - `GET /api/accounting/journal-entries` - 분개장 목록 조회
  - `POST /api/accounting/journal-entries` - 분개장 생성
  - `DELETE /api/accounting/journal-entries/{id}` - 분개장 삭제

### 3.3 거래처 관리 (Partners)
- **기능**: 거래처 정보 관리 (CRUD)
- **API 엔드포인트**:
  - `GET /api/accounting/partners` - 거래처 목록 조회
  - `POST /api/accounting/partners` - 거래처 생성
  - `GET /api/accounting/partners/{id}` - 특정 거래처 조회
  - `PUT /api/accounting/partners/{id}` - 거래처 수정
  - `DELETE /api/accounting/partners/{id}` - 거래처 삭제

### 3.4 세금 관리 (Tax Management)
- **기능**: 세금 설정, 계산, 신고서 관리
- **API 엔드포인트**:
  - `GET /api/accounting/taxes` - 세금 목록 조회
  - `POST /api/accounting/taxes` - 세금 생성
  - `POST /api/accounting/taxes/compute` - 세금 계산
  - `GET /api/accounting/tax-reports` - 세금 신고서 목록
  - `POST /api/accounting/tax-reports` - 세금 신고서 생성

### 3.5 자산 관리 (Asset Management)
- **기능**: 고정자산 등록, 감가상각 계산
- **API 엔드포인트**:
  - `GET /api/accounting/assets` - 자산 목록 조회
  - `POST /api/accounting/assets` - 자산 생성
  - `PUT /api/accounting/assets/{id}` - 자산 수정
  - `DELETE /api/accounting/assets/{id}` - 자산 삭제
  - `POST /api/accounting/assets/depreciate` - 감가상각 계산

### 3.6 예산 관리 (Budget Management)
- **기능**: 예산 설정 및 관리
- **API 엔드포인트**:
  - `GET /api/accounting/budgets` - 예산 목록 조회

### 3.7 통화 관리 (Currency Management)
- **기능**: 다중 통화 지원
- **API 엔드포인트**:
  - `GET /api/accounting/currencies` - 통화 목록 조회

## 4. 데이터 모델

### 4.1 계정과목 (CustomAccountAccount)
```python
- name: 계정과목명
- code: 계정코드
- type: 계정유형 (asset/liability/equity/income/expense)
- parent_id: 상위계정
- child_ids: 하위계정들
```

### 4.2 분개장 (CustomAccountMove)
```python
- name: 분개명
- date: 분개일자
- ref: 참조번호
- journal_id: 분개장
- line_ids: 분개내역
- state: 상태 (draft/posted/cancelled)
- total_debit/credit: 차변/대변 합계
```

### 4.3 세금 (CustomAccountTax)
```python
- name: 세금명
- code: 세금코드
- amount: 세율
- type_tax_use: 세금유형 (sale/purchase/both)
- tax_category: 세금카테고리 (vat/withholding/stamp/customs)
- calculation_method: 계산방식 (exclusive/inclusive)
```

### 4.4 세금 신고서 (CustomAccountTaxReport)
```python
- name: 신고서명
- date: 신고일자
- period_start/end: 신고기간
- report_type: 신고유형 (monthly/quarterly/half_yearly/yearly)
- sale_vat_amount: 매출 부가세
- purchase_vat_amount: 매입 부가세
- vat_payable: 납부할 부가세
- state: 상태 (draft/confirmed/submitted)
```

## 5. API 설계

### 5.1 인증 및 보안
- **인증 방식**: Odoo 사용자 인증
- **권한 관리**: 사용자별 접근 권한 설정
- **CSRF 보호**: API 엔드포인트별 CSRF 설정

### 5.2 응답 형식
```json
{
  "success": true,
  "data": {...},
  "message": "처리 완료",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 5.3 에러 처리
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "유효하지 않은 데이터입니다",
    "details": {...}
  }
}
```

## 6. 성능 요구사항

### 6.1 응답 시간
- **API 응답**: 3초 이내
- **데이터베이스 쿼리**: 1초 이내
- **대용량 데이터 처리**: 페이지네이션 지원

### 6.2 동시 사용자
- **동시 접속**: 100명 이상 지원
- **데이터베이스 연결**: Connection Pool 관리

## 7. 보안 요구사항

### 7.1 데이터 보안
- **데이터 암호화**: 민감한 데이터 암호화 저장
- **접근 로그**: 모든 API 접근 로그 기록
- **백업**: 정기적인 데이터베이스 백업

### 7.2 API 보안
- **인증**: 모든 API 엔드포인트 인증 필수
- **권한 검증**: 사용자별 권한 검증
- **입력 검증**: 모든 입력 데이터 검증

## 8. 테스트 요구사항

### 8.1 단위 테스트
- **모델 테스트**: 모든 모델 메서드 테스트
- **API 테스트**: 모든 API 엔드포인트 테스트
- **비즈니스 로직 테스트**: 회계 규칙 검증

### 8.2 통합 테스트
- **API 통합 테스트**: 전체 워크플로우 테스트
- **데이터베이스 테스트**: 데이터 무결성 테스트

## 9. 배포 및 운영

### 9.1 배포 환경
- **개발 환경**: Docker Compose
- **데이터베이스**: PostgreSQL 15


## 10. 개발 일정

### 10.1 Phase 1 (기본 기능)
- 계정과목 관리
- 분개장 관리
- 거래처 관리
- 기본 API 구현

### 10.2 Phase 2 (고급 기능)
- 세금 관리
- 자산 관리
- 예산 관리
- 통화 관리

### 10.3 Phase 3 (최적화)
- 성능 최적화
- 보안 강화
- 테스트 완료
- 문서화

