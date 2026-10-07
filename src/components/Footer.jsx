import { useLanguage } from '../i18n/LanguageContext.jsx';
import Name from './Name.jsx';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__project">{t.footerProject}</p>
        <p className="site-footer__data">
          {t.footerData}{' '}
          <a href="https://www.gbif.org/dataset/38b4c89f-584c-41bb-bd8f-cd1def33e92f">
            <Name lang="en">GBIF</Name>: <Name>Artportalen</Name>
          </a>
        </p>
      </div>
    </footer>
  );
}
