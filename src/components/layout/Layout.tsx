import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <main
        style={{
          flex: 1,
          marginLeft: 0,
          paddingBottom: 72, // MobileNav 높이 확보
        }}
        // md 이상에서 사이드바 너비(220px)만큼 밀기
        className="md:ml-[220px] md:pb-0"
      >
        <Outlet />
      </main>

      <MobileNav />
    </div>
  );
}
