import LoginForm from '../../../components/auth/LoginForm';

export const metadata = {
  title: 'ورود به حساب کاربری',
  description: 'وارد حساب کاربری خود در سامانه رزرو خودرو شوید.',
};

export default function LoginPage() {
  return (
    // AuthLayout handles the overall centering and background
    <LoginForm />
  );
}
