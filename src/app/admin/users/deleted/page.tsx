// src/app/admin/users/deleted/page.tsx
import { DeletedUsersClient } from './client';

export default function DeletedUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Deleted Users</h1>
      <DeletedUsersClient />
    </div>
  );
}
