import RegisterForm from '../../../components/auth/RegisterForm';

export const metadata = {
  title: 'ایجاد حساب کاربری',
  description: 'برای استفاده از خدمات سامانه رزرو خودرو، حساب کاربری جدید ایجاد کنید.',
};

export default function RegisterPage() {
  return (
    // AuthLayout handles the overall centering and background
    <RegisterForm />
  );
}
