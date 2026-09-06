import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar/Navbar';
import { Footer } from '@/components/Footer/Footer';

export function MainLayout() {
  return (
    <div className="cs-landing flex min-h-screen flex-col">
      <a className="app-skip" href="#app-content">
        Skip to content
      </a>
      <Navbar />
      <main id="app-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
