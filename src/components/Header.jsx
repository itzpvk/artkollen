import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import SegmentedToggle from './SegmentedToggle.jsx';
import Name from './Name.jsx';

function GridMark() {
  return (
    <svg className="wordmark__mark" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="10" height="10" fill="var(--color-data-2)" />
      <rect x="12" y="0" width="10" height="10" fill="var(--color-data-5)" />
      <rect x="0" y="12" width="10" height="10" fill="var(--color-data-4)" />
      <rect x="12" y="12" width="10" height="10" fill="var(--color-data-1)" />
    </svg>
  );
}

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const { pathname } = useLocation();
  // Each page has a Swedish and an English address; keep whichever the visitor
  // is on, otherwise link to the one for the current language.
  const pathFor = ([sv, en]) => (pathname === sv || pathname === en ? pathname : lang === 'sv' ? sv : en);
  const aboutPath = pathFor(['/om', '/about']);
  const designPath = pathFor(['/designsystem', '/design-system']);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="wordmark">
          <GridMark />
          <Name>{t.siteName}</Name>
        </NavLink>
        <nav aria-label={t.navLabel} className="site-nav">
          <NavLink to="/" end>
            {t.navExplore}
          </NavLink>
          <NavLink to={aboutPath}>{t.navAbout}</NavLink>
          <NavLink to={designPath}>{t.navDesign}</NavLink>
        </nav>
        <SegmentedToggle
          label={t.languageLabel}
          value={lang}
          onChange={setLang}
          options={[
            { value: 'sv', label: 'Svenska', lang: 'sv' },
            { value: 'en', label: 'English', lang: 'en' },
          ]}
        />
      </div>
    </header>
  );
}
