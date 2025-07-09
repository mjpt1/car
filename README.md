# سیستم رزرو آنلاین خودرو (Car Booking System)

این پروژه یک سیستم جامع برای رزرو آنلاین خودرو است که شامل پنل‌های کاربری برای مسافر، راننده و مدیر می‌باشد.

## ساختار پروژه

پروژه به دو بخش اصلی تقسیم می‌شود:

-   `backend/`: شامل API و منطق سمت سرور با استفاده از Node.js و Express.
-   `frontend/`: شامل رابط کاربری با استفاده از Next.js و TailwindCSS.

## راه‌اندازی بخش بک‌اند (Backend Setup)

### پیش‌نیازها

-   Node.js (نسخه ۱۸ یا بالاتر پیشنهاد می‌شود)
-   npm یا yarn
-   PostgreSQL (یک دیتابیس فعال و در دسترس)

### مراحل راه‌اندازی

1.  **کلون کردن مخزن (در صورت نیاز):**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **رفتن به پوشه بک‌اند:**
    ```bash
    cd backend
    ```

3.  **نصب وابستگی‌ها:**
    ```bash
    npm install
    # یا اگر از yarn استفاده می‌کنید:
    # yarn install
    ```

4.  **تنظیم متغیرهای محیطی:**
    *   یک فایل `.env` در پوشه `backend` از روی فایل `backend/.env.example` (اگر وجود دارد) یا بر اساس نمونه زیر ایجاد کنید.
        ```dotenv
        NODE_ENV=development
        PORT=3001

        # Database Configuration
        DB_USER=your_postgres_user
        DB_HOST=localhost
        DB_NAME=car_rental_db # نام دیتابیس شما
        DB_PASSWORD=your_postgres_password
        DB_PORT=5432

        # JWT Configuration
        JWT_SECRET=your-super-secret-and-strong-jwt-key-at-least-32-chars-long
        JWT_EXPIRES_IN=1h

        # OTP Configuration
        OTP_EXPIRATION_MINUTES=5

        # Optional: Nodemailer configuration (if used for sending emails/OTP)
        # MAIL_HOST=smtp.example.com
        # MAIL_PORT=587
        # MAIL_USER=your_email@example.com
        # MAIL_PASS=your_email_password
        # MAIL_FROM="Your App Name" <no-reply@example.com>
        ```
    *   **مهم:** مقادیر `DB_USER`, `DB_PASSWORD`, `DB_NAME` و `JWT_SECRET` را با مقادیر صحیح و امن جایگزین کنید.

5.  **راه‌اندازی پایگاه داده PostgreSQL:**
    *   اطمینان حاصل کنید که سرور PostgreSQL شما در حال اجرا است.
    *   دیتابیس مشخص شده در `DB_NAME` (مثلاً `car_rental_db`) را ایجاد کنید.
    *   اسکریپت‌های SQL زیر را برای ایجاد جداول اولیه در دیتابیس خود اجرا کنید:

        ```sql
        -- Table: users
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            phone_number VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            otp VARCHAR(10),
            otp_expires_at TIMESTAMP,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(255) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Function and Trigger to update 'updated_at' timestamp
        CREATE OR REPLACE FUNCTION trigger_set_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER set_timestamp_users
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();

        -- Table: drivers
        CREATE TABLE IF NOT EXISTS drivers (
            id SERIAL PRIMARY KEY,
            user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(50) DEFAULT 'pending_approval', -- e.g., pending_approval, approved, rejected, suspended
            vehicle_details JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TRIGGER set_timestamp_drivers
        BEFORE UPDATE ON drivers
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();

        -- Table: driver_documents
        CREATE TABLE IF NOT EXISTS driver_documents (
            id SERIAL PRIMARY KEY,
            driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
            document_type VARCHAR(100) NOT NULL, -- e.g., license, vehicle_registration, insurance
            file_path VARCHAR(255) NOT NULL,
            file_name VARCHAR(255),
            mime_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'pending_review', -- e.g., pending_review, approved, rejected
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP,
            review_notes TEXT,
            CONSTRAINT unique_driver_document_type UNIQUE (driver_id, document_type)
        );
        ```

6.  **اجرای سرور بک‌اند:**
    ```bash
    npm start
    # یا برای حالت توسعه با nodemon (اگر پیکربندی شده باشد):
    # npm run dev
    ```
    سرور به طور پیش‌فرض روی پورت `3001` (یا پورت مشخص شده در `.env`) اجرا خواهد شد.

### مستندات API

پس از اجرای سرور بک‌اند، مستندات تعاملی API (Swagger UI) در آدرس زیر در دسترس خواهد بود:
[http://localhost:3001/api-docs](http://localhost:3001/api-docs)

## راه‌اندازی بخش فرانت‌اند (Frontend Setup)

(دستورالعمل‌های راه‌اندازی فرانت‌اند در مراحل بعدی اضافه خواهد شد.)

---

*این مستندات به مرور و با پیشرفت پروژه تکمیل خواهد شد.*
