import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container-page py-8 sm:py-12">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
