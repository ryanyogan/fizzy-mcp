import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/admin')({
  beforeLoad: async ({ context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
