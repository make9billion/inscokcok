# 보험콕콕 카페24 Ubuntu 배포 가이드

이 문서는 카페24 가상서버 Ubuntu 환경에 보험콕콕 Laravel 프로젝트를 배포하기 위한 실전 순서입니다.

- 서버 IP: `211.45.175.83`
- 운영 도메인: `www.inscokcok.com`
- 리다이렉트 도메인: `inscokcok.com`
- 웹서버: Nginx
- PHP: 8.3 이상 권장
- DB: PostgreSQL
- 프로젝트 경로: `/var/www/bohumcc`

## 1. 도메인 DNS 설정

도메인 관리 화면에서 A 레코드를 설정합니다.

```text
호스트: @
값: 211.45.175.83

호스트: www
값: 211.45.175.83
```

DNS 반영은 몇 분에서 수 시간 걸릴 수 있습니다.

## 2. 서버 접속

카페24에서 받은 root 계정으로 접속합니다.

```bash
ssh root@211.45.175.83
```

## 3. 서버 패키지 업데이트

```bash
sudo apt update
sudo apt upgrade -y
```

## 4. 필수 패키지 설치

```bash
sudo apt install -y software-properties-common curl unzip git nginx postgresql postgresql-contrib
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4 php8.4-fpm php8.4-cli php8.4-pgsql php8.4-mbstring php8.4-xml php8.4-curl php8.4-zip php8.4-bcmath php8.4-gd php8.4-intl
```

PHP 버전 확인:

```bash
php -v
```

## 5. Composer 설치

```bash
cd /tmp
curl -sS https://getcomposer.org/installer -o composer-setup.php
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
composer --version
```

## 6. Node.js 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 7. PostgreSQL DB 생성

아래 값은 예시입니다. 운영에서는 비밀번호를 강하게 바꿔주세요.

```bash
sudo -u postgres psql
```

PostgreSQL 콘솔 안에서 실행:

```sql
CREATE DATABASE bohumcc;
CREATE USER bohumcc_user WITH ENCRYPTED PASSWORD '강한_DB_비밀번호';
GRANT ALL PRIVILEGES ON DATABASE bohumcc TO bohumcc_user;
\q
```

Laravel 마이그레이션 권한을 위해 추가 설정:

```bash
sudo -u postgres psql -d bohumcc
```

```sql
GRANT ALL ON SCHEMA public TO bohumcc_user;
ALTER SCHEMA public OWNER TO bohumcc_user;
\q
```

## 8. 프로젝트 업로드

GitHub 저장소를 사용하는 방식이 가장 깔끔합니다.

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <GitHub 저장소 URL> bohumcc
cd /var/www/bohumcc
```

아직 GitHub 저장소가 없다면, 로컬 프로젝트를 먼저 GitHub에 올린 뒤 진행합니다.

## 9. Laravel 의존성 설치와 빌드

```bash
cd /var/www/bohumcc
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

## 10. 운영 `.env` 생성

```bash
cp .env.example .env
nano .env
```

필수 값 예시:

```env
APP_NAME=보험콕콕
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.inscokcok.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=bohumcc
DB_USERNAME=bohumcc_user
DB_PASSWORD=강한_DB_비밀번호

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

FILESYSTEM_DISK=public
```

토스페이먼츠 운영키, 메일 SMTP 정보는 실제 운영 전 별도로 입력합니다. 시크릿 키는 문서나 GitHub에 올리지 않습니다.

## 11. Laravel 초기화

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 12. 권한 설정

```bash
sudo chown -R www-data:www-data /var/www/bohumcc/storage /var/www/bohumcc/bootstrap/cache
sudo chmod -R 775 /var/www/bohumcc/storage /var/www/bohumcc/bootstrap/cache
```

## 13. Nginx 설정

새 설정 파일을 만듭니다.

```bash
sudo nano /etc/nginx/sites-available/bohumcc
```

아래 내용을 입력합니다.

```nginx
server {
    listen 80;
    server_name inscokcok.com www.inscokcok.com;

    root /var/www/bohumcc/public;
    index index.php index.html;

    client_max_body_size 20M;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

설정 활성화:

```bash
sudo ln -s /etc/nginx/sites-available/bohumcc /etc/nginx/sites-enabled/bohumcc
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart php8.4-fpm
```

## 14. SSL 인증서 발급

DNS가 서버 IP로 연결된 뒤 진행합니다.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d inscokcok.com -d www.inscokcok.com
```

Certbot 질문에서 HTTP를 HTTPS로 리다이렉트하는 옵션을 선택합니다.

자동 갱신 확인:

```bash
sudo certbot renew --dry-run
```

## 15. 배포 후 확인 주소

```text
https://www.inscokcok.com
https://www.inscokcok.com/admin
https://www.inscokcok.com/insurance-checkup
https://www.inscokcok.com/point-mall
```

## 16. 이후 수정 배포 명령

코드를 수정한 뒤 서버에서 업데이트할 때:

```bash
cd /var/www/bohumcc
git pull
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

## 17. 자주 보는 로그

Laravel 로그:

```bash
tail -f /var/www/bohumcc/storage/logs/laravel.log
```

Nginx 에러 로그:

```bash
sudo tail -f /var/log/nginx/error.log
```

PHP-FPM 상태:

```bash
sudo systemctl status php8.4-fpm
```

Nginx 상태:

```bash
sudo systemctl status nginx
```

