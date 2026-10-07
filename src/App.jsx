import { useEffect, useRef } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import DesignSystem from './pages/DesignSystem.jsx';
import { useDocumentTitle, useLanguage } from './i18n/LanguageContext.jsx';

function NotFound() {
  const { t } = useLanguage();
  useDocumentTitle(`${t.notFoundTitle} – Artkollen`);
  return (
    <div className="page-narrow">
      <h1>{t.notFoundTitle}</h1>
      <p>{t.notFoundText}</p>
      <p>
        <Link to="/">{t.notFoundLink}</Link>
      </p>
    </div>
  );
}

export default function App() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // On route change, move focus to the main region so screen reader and
  // keyboard users start at the new page content instead of the old link.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    // preventScroll: focusing <main> would otherwise scroll it to the top of
    // the window and push the header out of view.
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <div className="skip-links">
        {/* On the Explore page the first Tab stop jumps straight past the filters. */}
        {pathname === '/' && (
          <a className="skip-link" href="#results">
            {t.skipToResults}
          </a>
        )}
        <a className="skip-link" href="#main">
          {t.skipLink}
        </a>
      </div>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/om" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route path="/designsystem" element={<DesignSystem />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
