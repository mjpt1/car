# سیستم رزرو آنلاین خودرو (Car Booking System)

این پروژه یک سیستم جامع برای رزرو آنلاین خودرو است که شامل پنل‌های کاربری برای مسافر، راننده و مدیر می‌باشد. این پروژه با معماری ماژولار و با تمرکز بر امنیت، عملکرد و قابلیت توسعه طراحی شده است.

## ساختار پروژه

پروژه به دو بخش اصلی تقسیم می‌شود:

-   `backend/`: شامل API و منطق سمت سرور با استفاده از Node.js, Express, و PostgreSQL.
-   `frontend/`: شامل رابط کاربری با استفاده از Next.js و TailwindCSS.

## راه‌اندازی پروژه (روش پیشنهادی: Docker)

ساده‌ترین راه برای راه‌اندازی کامل پروژه (دیتابیس، بک‌اند و فرانت‌اند) استفاده از Docker و Docker Compose است.

### پیش‌نیازها

-   Docker
-   Docker Compose

### مراحل راه‌اندازی با Docker

1.  **کلون کردن مخزن:**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **ایجاد فایل متغیرهای محیطی:**
    *   یک فایل `.env` در ریشه پروژه ایجاد کنید. می‌توانید از مقادیر پیش‌فرض زیر استفاده کنید یا آنها را تغییر دهید. **تغییر `JWT_SECRET` و `DB_PASSWORD` برای محیط production الزامی است.**
        ```dotenv
        # PostgreSQL Credentials
        DB_USER=postgres
        DB_PASSWORD=your_strong_password_here # یک رمز عبور قوی انتخاب کنید
        DB_NAME=car_booking_db

        # Backend JWT Secret
        JWT_SECRET=your_super_secret_and_strong_jwt_key_at_least_32_chars_long
        ```

3.  **ساخت و اجرای کانتینرها:**
    *   دستور زیر را در ریشه پروژه اجرا کنید:
        ```bash
        docker-compose up --build -d
        ```
    *   پارامتر `--build` ایمیج‌ها را از روی `Dockerfile`ها می‌سازد.
    *   پارامتر `-d` (detached mode) باعث می‌شود کانتینرها در پس‌زمینه اجرا شوند.

4.  **اجرای اسکریپت‌های اولیه دیتابیس:**
    *   پس از اینکه کانتینر `db` به طور کامل اجرا شد (ممکن است چند ثانیه طول بکشد)، باید جداول اولیه را ایجاد کنید. برای این کار می‌توانید به دیتابیس متصل شوید و اسکریپت‌های SQL موجود در بخش "راه‌اندازی دستی" را اجرا کنید، یا از دستور زیر استفاده کنید:
        ```bash
        docker-compose exec -T db psql -U $DB_USER -d $DB_NAME < path/to/initial_db_script.sql
        ```
        *(توجه: برای سادگی، فعلاً باید به صورت دستی به دیتابیس متصل شده و اسکریپت‌های SQL ارائه شده در فازهای مختلف را اجرا کنید).*

5.  **دسترسی به برنامه:**
    *   **فرانت‌اند:** `http://localhost:3000`
    *   **بک‌اند API:** `http://localhost:3001`
    *   **مستندات API (Swagger):** `http://localhost:3001/api-docs`

6.  **متوقف کردن برنامه:**
    ```bash
    docker-compose down
    ```

---

## راه‌اندازی دستی (بدون Docker)

### راه‌اندازی بخش بک‌اند (Backend)

1.  به پوشه `backend` بروید: `cd backend`
2.  وابستگی‌ها را نصب کنید: `npm install`
3.  یک فایل `.env` مشابه نمونه بالا (با جزئیات اتصال به دیتابیس خود) ایجاد کنید.
4.  اسکریپت‌های SQL ارائه شده در هر فاز را در دیتابیس PostgreSQL خود اجرا کنید.
5.  سرور را اجرا کنید: `npm start`

### راه‌اندازی بخش فرانت‌اند (Frontend)

1.  به پوشه `frontend` بروید: `cd frontend`
2.  وابستگی‌ها را نصب کنید: `npm install`
3.  (اختیاری) یک فایل `.env.local` برای بازنویسی متغیرهای محیطی مانند `NEXT_PUBLIC_API_BASE_URL` ایجاد کنید.
4.  سرور توسعه را اجرا کنید: `npm run dev`

---

## معماری و تکنولوژی‌ها

-   **Backend:**
    -   **Framework:** Node.js, Express.js
    -   **Database:** PostgreSQL
    -   **Real-time:** Socket.IO
    -   **Authentication:** JSON Web Tokens (JWT)
    -   **Security:** Helmet, CORS, Express Rate Limit
    -   **API Documentation:** Swagger/OpenAPI
-   **Frontend:**
    -   **Framework:** Next.js (App Router)
    -   **Styling:** TailwindCSS
    -   **State Management:** React Context API
    -   **Form Handling:** React Hook Form with Zod resolver
    -   **UI Components:** Custom components, Recharts (for charts), React-Leaflet (for maps)
-   **Containerization:** Docker, Docker Compose

## ساختار ماژول‌ها

پروژه به صورت ماژولار طراحی شده تا توسعه و نگهداری آن آسان باشد.

-   **ماژول‌های بک‌اند (`backend/src/modules`):**
    -   `auth`: مدیریت ثبت‌نام، ورود و توکن‌ها.
    -   `users`: مدیریت پروفایل کاربران.
    -   `drivers`: مدیریت پروفایل رانندگان و مدارک.
    -   `trips`: مدیریت سفرها و جستجو.
    -   `bookings`: مدیریت فرآیند رزرو.
    -   `payments`: مدیریت پرداخت‌ها (شبیه‌سازی شده).
    -   `transactions`: مدیریت تراکنش‌ها.
    -   `ratings`: مدیریت امتیازدهی.
    -   `articles`, `categories`, `tags`: سیستم مدیریت محتوا.
    -   `admin`: APIهای پنل مدیریت.
    -   `reports`: APIهای گزارش‌گیری.
-   **ماژول‌های فرانت‌اند (`frontend/src/`):**
    -   `app`: مسیرهای برنامه (App Router).
    -   `components`: کامپوننت‌های قابل استفاده مجدد.
    -   `contexts`: برای مدیریت وضعیت‌های گلوبال (Auth, Socket).
    -   `lib/services`: برای کپسوله کردن فراخوانی‌های API.

## نحوه مشارکت (Contribution Guidelines)

1.  از شاخه اصلی (`main` یا `master`) یک شاخه جدید برای فیچر یا باگ خود ایجاد کنید (مثلاً `feature/new-cool-feature` یا `fix/login-bug`).
2.  تغییرات خود را اعمال کنید.
3.  مطمئن شوید که کد شما از استانداردهای موجود در پروژه پیروی می‌کند.
4.  پس از اتمام کار، یک Pull Request (PR) به شاخه اصلی ارسال کنید.
5.  در توضیحات PR، تغییرات خود را به وضوح شرح دهید.

*این مستندات به مرور و با پیشرفت پروژه تکمیل خواهد شد.*
