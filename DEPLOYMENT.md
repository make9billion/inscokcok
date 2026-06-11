# 보험콕콕 배포 준비 체크리스트

이 문서는 보험콕콕 Laravel 프로젝트를 운영 서버에 배포하기 위한 준비 항목입니다.

## 1. 추천 배포 구성

초기 운영은 아래 구성을 추천합니다.

- 웹 서버: VPS 1대
- 웹 서버 소프트웨어: Nginx
- 백엔드: PHP 8.4 이상, PHP-FPM
- 프론트 빌드: Node.js, npm
- DB: PostgreSQL
- SSL: Let’s Encrypt
- 파일 저장: Laravel `storage` 디렉터리

초기에는 웹 서버와 DB를 같은 VPS에 두고 시작해도 됩니다. 트래픽이 늘어나면 DB 서버를 분리합니다.

## 2. 서버 업체 후보

국내 접근성과 관리 편의성을 우선하면 아래 순서를 추천합니다.

1. 카페24 VPS
2. 가비아 클라우드
3. AWS Lightsail
4. Vultr
5. DigitalOcean

초기 추천 사양:

- CPU: 2 vCPU 이상
- Memory: 4GB 이상
- Disk: 60GB 이상
- OS: Ubuntu 24.04 LTS

## 3. 도메인 및 SSL 준비

- 도메인 구입 또는 확정
- DNS A 레코드를 서버 IP로 연결
- 운영 주소 확정
  - 예: `https://bohumcc.com`
  - 예: `https://www.bohumcc.com`
- Let’s Encrypt SSL 인증서 발급
- HTTP 접속 시 HTTPS로 리다이렉트 설정

## 4. 운영 환경 변수 준비

운영 서버의 `.env`는 로컬 `.env`를 그대로 복사하지 말고 운영값으로 새로 작성합니다.

필수 확인값:

```env
APP_NAME=보험콕콕
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://도메인

APP_LOCALE=ko
APP_FALLBACK_LOCALE=ko
APP_FAKER_LOCALE=ko_KR

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"

TOSS_PAYMENTS_CLIENT_KEY=
TOSS_PAYMENTS_SECRET_KEY=
```

주의:

- `.env`는 Git에 올리지 않습니다.
- `APP_KEY`는 운영 서버에서 `php artisan key:generate`로 생성합니다.
- 토스페이먼츠 테스트키는 운영 배포 전 실운영키로 교체합니다.

## 5. 서버 설치 항목

운영 서버에 필요한 항목:

- Git
- Nginx
- PHP 8.4 이상
- PHP 확장
  - `php-fpm`
  - `php-cli`
  - `php-pgsql`
  - `php-mbstring`
  - `php-xml`
  - `php-curl`
  - `php-zip`
  - `php-bcmath`
  - `php-gd`
- Composer
- Node.js LTS
- PostgreSQL
- Certbot

## 6. 배포 기본 순서

서버에서 프로젝트를 배포할 때의 기본 순서입니다.

```bash
git clone <repository-url> /var/www/bohumcc
cd /var/www/bohumcc

composer install --no-dev --optimize-autoloader
npm install
npm run build

cp .env.example .env
php artisan key:generate
```

운영 `.env` 값을 수정한 뒤:

```bash
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 7. 권한 설정

Laravel이 쓰기 가능한 디렉터리:

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

업로드 이미지가 정상 노출되는지 확인합니다.

- 포인트몰 상품 이미지
- 관리자 업로드 이미지
- 보험상품 상세 이미지

## 8. Nginx 설정 핵심

Nginx의 document root는 Laravel 프로젝트 루트가 아니라 `public` 디렉터리여야 합니다.

예:

```nginx
root /var/www/bohumcc/public;
index index.php index.html;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

확인할 것:

- `/` 접속 가능
- `/admin/login` 접속 가능
- `/customer/notices` 접속 가능
- `/point-mall` 접속 가능
- `/storage/...` 이미지 접근 가능

## 9. DB 준비

운영 DB 생성 후 `.env`에 연결 정보를 입력합니다.

필수 실행:

```bash
php artisan migrate --force
```

운영 전 확인:

- 회원가입 가능 여부
- 관리자 가입 신청 가능 여부
- 관리자 승인 가능 여부
- 상담 신청 저장 여부
- 포인트몰 주문 저장 여부
- 토스 결제 성공/실패 처리 여부

## 10. 관리자 계정 준비

현재 구조는 관리자 가입 신청 후 승인 방식입니다.

운영 초기 절차:

1. `/admin/register`에서 관리자 가입 신청
2. DB 또는 기존 승인된 관리자 계정으로 최초 관리자 승인
3. `/admin/login`에서 로그인
4. 관리자 관리에서 권한 확인

최초 관리자 승인 방식은 배포 전 별도로 정해야 합니다.

선택지:

- 운영 DB에 최초 관리자 1명을 직접 승인 처리
- 별도 시더로 최초 관리자 생성
- 임시 승인용 artisan command 추가

## 11. 토스페이먼츠 운영 전환

현재 테스트키로 결제 테스트가 완료된 상태입니다.

운영 전 해야 할 일:

- 토스페이먼츠 실운영 심사 완료
- 실운영 클라이언트 키 발급
- 실운영 시크릿 키 발급
- `.env`에 실운영 키 반영
- 테스트 결제키 제거
- 실결제 승인/취소 테스트

확인 화면:

- 포인트몰 주문
- 결제 성공 페이지
- 결제 실패 처리
- 관리자 주문관리
- 회원 주문내역
- 결제 취소 처리

## 12. 메일 발송 준비

필요할 수 있는 메일:

- 회원가입 인증
- 비밀번호 재설정
- 문의 접수 알림
- 주문/결제 알림

SMTP 후보:

- Gmail SMTP
- 네이버웍스
- AWS SES
- Mailgun

운영 전 최소 확인:

```bash
php artisan tinker
```

메일 발송 테스트를 진행합니다.

## 13. 운영 전 기능 점검

프론트:

- 메인페이지 상담신청
- 보험상품 상세 상담신청 모달
- 보험점검 접수
- 고객센터 공지사항
- FAQ
- 문의하기
- 회사소개
- 회원가입
- 로그인
- 마이페이지
- 포인트몰 상품 목록/상세
- 장바구니
- 주문/결제

관리자:

- 관리자 로그인
- 관리자 가입 신청
- 관리자 승인/반려
- 상담관리 목록/상세/상태변경
- 회원관리/포인트 수동 지급
- 문의하기
- 제휴문의
- FAQ
- 공지사항
- 지식인관리
- 포인트몰 상품관리
- 포인트몰 주문관리
- CSV 다운로드

## 14. 보안 점검

- `APP_DEBUG=false`
- `.env` 외부 노출 금지
- HTTPS 강제
- 관리자 비밀번호 강도 확인
- 서버 SSH 포트 및 접근 권한 관리
- DB 외부 접속 제한
- 업로드 파일 크기 제한 확인
- 토스 시크릿 키 노출 금지
- GitHub에 실운영 키 커밋 금지

## 15. 백업 정책

운영 전 반드시 정합니다.

추천:

- DB 자동 백업: 매일 1회
- 업로드 파일 백업: 매일 1회
- 보관 기간: 최소 14일
- 배포 전 수동 백업
- 대규모 수정 전 수동 백업

## 16. 배포 후 캐시 명령

배포 후 변경사항이 반영되지 않으면 아래 명령을 실행합니다.

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

프론트 이미지나 CSS가 반영되지 않으면:

```bash
npm run build
```

브라우저에서는 강력 새로고침을 합니다.

## 17. 오픈 직전 최종 체크

- 도메인 접속 정상
- HTTPS 정상
- 모바일 화면 확인
- 상담 신청 저장 확인
- 관리자 상담관리 노출 확인
- 회원가입 가능
- 로그인 가능
- 포인트몰 주문 가능
- 결제 테스트 완료
- 관리자 주문 상태변경 가능
- 개인정보처리방침/이용약관/포인트몰 이용안내/약관 동의 문구 최종 확인
- 회사정보 및 푸터 최종 확인
- 실운영 토스 키 반영 확인
- DB 백업 설정 확인

## 18. 남은 결정사항

배포 전 아래 항목은 확정이 필요합니다.

- 도메인
- 서버 업체
- 운영 DB 이름/계정
- 최초 관리자 승인 방식
- 메일 SMTP 업체
- 토스페이먼츠 실운영 키 발급 일정
- 운영 백업 방식
- 개인정보/약관 최종 법무 검토 여부
