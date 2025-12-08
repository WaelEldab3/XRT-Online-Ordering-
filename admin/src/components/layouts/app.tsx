import { SUPER_ADMIN } from '@/utils/constants';
import dynamic from 'next/dynamic';

const AdminLayout = dynamic(() => import('@/components/layouts/admin'));
const OwnerLayout = dynamic(() => import('@/components/layouts/owner'));

export default function AppLayout({
  userPermissions,
  userRole,
  ...props
}: {
  userPermissions: string[];
  userRole: string;
}) {
  if (userRole === SUPER_ADMIN) {
    return <AdminLayout {...props} />;
  }
  return <OwnerLayout {...props} />;
}
