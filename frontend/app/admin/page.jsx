import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Automatically redirect /admin to /admin/dashboard
  redirect('/admin/dashboard');
}
