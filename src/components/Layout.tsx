import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="container-page py-8 sm:py-12">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
