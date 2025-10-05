
// src/app/admin/onboard-user/page.tsx
import { OnboardUserForm } from './client';

export default function OnboardUserPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Onboard New User</h1>
      <OnboardUserForm />
    </div>
  );
}
