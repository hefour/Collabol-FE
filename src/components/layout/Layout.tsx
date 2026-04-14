import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <main className="layout-main" style={{ flex: 1 }}>
        <Outlet />
      </main>

      <MobileNav />
    </div>
  );
}
