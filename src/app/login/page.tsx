// src/app/login/page.tsx
import { LoginForm } from './client';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <LoginForm />
    </div>
  );
}
