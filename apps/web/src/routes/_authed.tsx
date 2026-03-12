import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { getCurrentUser } from '../lib/server/auth';
import { DashboardLayout } from '../components/layout/dashboard-layout';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    return { user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
