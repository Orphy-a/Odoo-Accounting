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

## 주요 명령어

```bash
# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs odoo

# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart
```

## 문제 해결

- **포트 충돌**: `docker-compose.yml`에서 포트 변경
- **권한 문제**: Docker Desktop을 관리자 권한으로 실행
- **완전 초기화**: `docker-compose down -v && docker-compose up -d` 