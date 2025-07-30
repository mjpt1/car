# راهنمای استقرار پروژه (Deployment Guide)

این راهنما مراحل لازم برای استقرار پروژه سیستم رزرو آنلاین خودرو را در یک سرور لینوکسی (مانند اوبونتو) با استفاده از Docker و Nginx به عنوان Reverse Proxy توضیح می‌دهد.

## پیش‌نیازها

1.  یک سرور مجازی (VPS) یا فیزیکی با سیستم‌عامل لینوکس (مانند Ubuntu 22.04).
2.  دسترسی SSH به سرور با کاربر `sudo`.
3.  یک نام دامنه (Domain) که به آدرس IP سرور شما اشاره می‌کند (مثلاً `example.com`).
4.  نصب بودن **Docker** و **Docker Compose** روی سرور. (برای نصب می‌توانید از [راهنمای رسمی داکر](https://docs.docker.com/engine/install/ubuntu/) استفاده کنید).
5.  نصب بودن **Nginx** روی سرور: `sudo apt update && sudo apt install nginx`.
6.  نصب بودن **Certbot** برای فعال‌سازی SSL/TLS (HTTPS): `sudo apt install certbot python3-certbot-nginx`.

## مراحل استقرار

### ۱. آماده‌سازی پروژه در سرور

1.  پروژه را از مخزن Git کلون کنید:
    ```bash
    git clone <your-repository-url>
    cd <project-folder>
    ```

2.  فایل متغیرهای محیطی را برای محیط production ایجاد کنید. یک فایل `.env` در ریشه پروژه ایجاد کرده و مقادیر زیر را با مقادیر واقعی و امن جایگزین کنید:
    ```dotenv
    # PostgreSQL Credentials
    DB_USER=postgres
    DB_PASSWORD=YOUR_VERY_STRONG_DATABASE_PASSWORD # حتماً یک رمز عبور قوی و جدید انتخاب کنید
    DB_NAME=car_booking_db

    # Backend JWT Secret
    JWT_SECRET=YOUR_SUPER_SECRET_AND_STRONG_JWT_KEY_FOR_PRODUCTION # حتماً یک کلید مخفی جدید و طولانی ایجاد کنید

    # Frontend URL (for CORS and other links)
    FRONTEND_URL=https://your_domain.com
    ```
    *توجه: متغیرهای محیطی فرانت‌اند (`NEXT_PUBLIC_*`) مستقیماً در `docker-compose.yml` یا `Dockerfile` تنظیم می‌شوند.*

### ۲. ساخت و اجرای کانتینرها

1.  با استفاده از Docker Compose، ایمیج‌ها را ساخته و کانتینرها را در پس‌زمینه اجرا کنید:
    ```bash
    sudo docker-compose up --build -d
    ```
    این دستور سرویس‌های `db`, `backend`, و `frontend` را بر اساس `docker-compose.yml` اجرا می‌کند.

2.  بررسی کنید که آیا تمام کانتینرها به درستی در حال اجرا هستند:
    ```bash
    sudo docker ps
    ```
    شما باید سه کانتینر در حال اجرا را مشاهده کنید.

### ۳. پیکربندی Nginx به عنوان Reverse Proxy

ما از Nginx استفاده می‌کنیم تا درخواست‌های ورودی به دامنه شما را به کانتینرهای مربوطه (فرانت‌اند و بک‌اند) هدایت کند.

1.  یک فایل پیکربندی جدید برای سایت خود در Nginx ایجاد کنید:
    ```bash
    sudo nano /etc/nginx/sites-available/your_domain.com
    ```

2.  محتوای زیر را در این فایل کپی کرده و `your_domain.com` را با دامنه واقعی خود جایگزین کنید:
    ```nginx
    server {
        listen 80;
        server_name your_domain.com www.your_domain.com;

        # Redirect all HTTP traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name your_domain.com www.your_domain.com;

        # SSL configuration will be added by Certbot here
        # ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
        # ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;
        # include /etc/letsencrypt/options-ssl-nginx.conf;
        # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        location / {
            proxy_pass http://localhost:3000; # Forward to Frontend container
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            proxy_pass http://localhost:3001/api/; # Forward to Backend API container
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # This is needed for Socket.IO to work correctly with Nginx
        location /socket.io/ {
            proxy_pass http://localhost:3001/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

3.  یک لینک سیمبولیک برای فعال کردن این سایت ایجاد کنید:
    ```bash
    sudo ln -s /etc/nginx/sites-available/your_domain.com /etc/nginx/sites-enabled/
    ```

4.  پیکربندی Nginx را تست کنید:
    ```bash
    sudo nginx -t
    ```
    اگر همه چیز درست باشد، باید پیام `syntax is ok` و `test is successful` را ببینید.

### ۴. فعال‌سازی HTTPS با Certbot

1.  با استفاده از Certbot، گواهی SSL را برای دامنه خود دریافت و Nginx را به صورت خودکار پیکربندی کنید:
    ```bash
    sudo certbot --nginx -d your_domain.com -d www.your_domain.com
    ```
    Certbot از شما چند سوال (مانند آدرس ایمیل) خواهد پرسید و سپس فایل پیکربندی Nginx را برای فعال‌سازی HTTPS به‌روزرسانی می‌کند.

2.  سرویس Nginx را مجدداً بارگذاری کنید تا تغییرات اعمال شوند:
    ```bash
    sudo systemctl reload nginx
    ```

### ۵. مراحل نهایی

1.  **اجرای اسکریپت‌های دیتابیس:** فراموش نکنید که جداول اولیه را در دیتابیس Docker خود ایجاد کنید.
2.  **ایجاد کاربر ادمین:** یک کاربر ثبت‌نام کرده و سپس به صورت دستی `role` او را در دیتابیس به `admin` تغییر دهید.

اکنون پروژه شما باید بر روی دامنه شما با اتصال امن HTTPS در دسترس باشد.
