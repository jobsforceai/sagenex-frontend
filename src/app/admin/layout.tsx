
// src/app/admin/layout.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-6 dark:bg-gray-800">
        <nav className="space-y-4">
          <Link href="/admin" className="mb-6 block">
            <Image
              src="/logo.png"
              alt="Sagenex Logo"
              width={120}
              height={40}
              className="rounded-lg"
              priority
            />
          </Link>
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Link href="/admin/onboard-user" className="block py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              Onboard User
          </Link>
          <Link href="/admin/monthly-payouts" className="block py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              Monthly Payouts
          </Link>
          <Link href="/admin/users" className="block py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              All Users
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
