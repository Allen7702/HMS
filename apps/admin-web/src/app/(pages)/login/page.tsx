'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from 'ui';

export default function AdminLogin() {
  const router = useRouter();

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <LoginPage
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
      redirectTo="/dashboard"
      // showWelcomeMessage={true}
    />
  );
}
