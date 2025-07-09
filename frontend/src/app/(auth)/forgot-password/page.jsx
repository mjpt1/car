import ForgotPasswordForm from '../../../components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'بازیابی رمز عبور',
  description: 'رمز عبور خود را در سامانه رزرو خودرو بازیابی کنید.',
};

export default function ForgotPasswordPage() {
  return (
    // AuthLayout handles the overall centering and background
    <ForgotPasswordForm />
  );
}
