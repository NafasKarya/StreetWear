// app/admins/edit/[uuid]/page.tsx
"use client"; // ⬅⬅⬅ TAMBAHKAN INI PALING ATAS

import AdminEditProductPage from '@/components/admin/upload/AdminEditProductPage';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const { uuid } = useParams();

  if (!uuid || typeof uuid !== 'string') return null;

  return <AdminEditProductPage uuid={uuid} />;
}
