import Header from './Header';
import { config } from '../config';

export default function Layout({ children }) {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="app__main">
        {children}
      </main>
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>
            © {new Date().getFullYear()} {config.storeName}
          </span>
          <span className="site-footer__note">Secure sign-in powered by Keycloak</span>
        </div>
      </footer>
    </div>
  );
}
