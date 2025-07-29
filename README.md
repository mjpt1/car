# سیستم رزرو آنلاین خودرو

یک سیستم رزرو آنلاین خودرو با پنل کاربری غنی برای مسافر، راننده و مدیر؛ امکانات کامل ثبت‌نام و ورود، جست‌وجو و رزرو تعاملی، مدیریت پرداخت، پنل مدیریت، سئو پیشرفته و داشبورد داده.

## ویژگی‌های اصلی

- ثبت‌نام و ورود با شماره موبایل و OTP
- احراز هویت راننده با بارگذاری مدارک
- جست‌وجو و رزرو هوشمند صندلی
- مشاهده موقعیت راننده در نقشه
- داشبورد جامع کاربر (راننده و مسافر)
- پنل مدیریت ویژه
- مدیریت مالی و پرداخت
- گزارش‌گیری پیشرفته
- مدیریت مقاله و سئو

## تکنولوژی‌ها

- **فرانت‌اند**: Next.js + TailwindCSS
- **بک‌اند**: Node.js + Express
- **دیتابیس**: PostgreSQL

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- npm یا yarn
- PostgreSQL

### مراحل نصب

1. کلون کردن مخزن:
```bash
git clone https://github.com/mjpt1/car-booking-system.git
cd car-booking-system
```

2. نصب وابستگی‌های فرانت‌اند:
```bash
cd frontend
npm install
```

3. نصب وابستگی‌های بک‌اند:
```bash
cd ../backend
npm install
```

4. تنظیم متغیرهای محیطی:
   - یک فایل `.env` در پوشه `backend` ایجاد کنید
   - یک فایل `.env.local` در پوشه `frontend` ایجاد کنید

5. راه‌اندازی دیتابیس:
```bash
cd ../backend
npm run db:setup
```

6. اجرای برنامه در محیط توسعه:
```bash
# در پوشه backend
npm run dev

# در پوشه frontend (در ترمینال جداگانه)
cd ../frontend
npm run dev
```

## ساختار پروژه

```
car-booking-system/
├── frontend/                # پروژه Next.js
│   ├── components/          # کامپوننت‌های قابل استفاده مجدد
│   ├── pages/               # صفحات اصلی
│   ├── public/              # فایل‌های استاتیک
│   └── styles/              # استایل‌های سفارشی
├── backend/                 # پروژه Node.js
│   ├── controllers/         # کنترلرهای API
│   ├── models/              # مدل‌های دیتابیس
│   ├── routes/              # مسیرهای API
│   └── middlewares/         # میان‌افزارها
├── docker/                  # فایل‌های داکر
└── docs/                    # مستندات
```

## مستندات API

مستندات API با استفاده از Swagger در آدرس زیر قابل دسترسی است:

```
http://localhost:5000/api-docs
```

## مشارکت

برای مشارکت در پروژه، لطفاً مراحل زیر را دنبال کنید:

1. Fork کردن مخزن
2. ایجاد یک شاخه جدید (`git checkout -b feature/amazing-feature`)
3. Commit کردن تغییرات (`git commit -m 'Add some amazing feature'`)
4. Push کردن به شاخه (`git push origin feature/amazing-feature`)
5. ایجاد یک Pull Request

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.