'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from 'ui';

export default function AdminLogin() {
  const router = useRouter();
  return (
    <> 
       <LoginPage
        redirectTo="/dashboard"
        showWelcomeMessage={true}
      />
    </>

  );
}
