import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { config } from '../config';
import { ArrowRightIcon, BoltIcon, PackageIcon, ShieldIcon } from '../components/Icons';

const features = [
  {
    icon: <ShieldIcon size={22} />,
    title: 'One secure sign-in',
    text: 'Sign in once with single sign-on. Your session is protected with OAuth 2.0 and PKCE.',
  },
  {
    icon: <PackageIcon size={22} />,
    title: 'Live availability',
    text: 'See what’s in stock before you add it, so there are no surprises at checkout.',
  },
  {
    icon: <BoltIcon size={22} />,
    title: 'Fast checkout',
    text: 'Fill your cart and place your order in a couple of clicks.',
  },
];

export default function Landing() {
  const { login } = useAuth();

  return (
    <>
      <section className="container hero">
        <div className="hero__copy">
          <span className="pill">Welcome to {config.storeName}</span>
          <h1>
            Everything you need, <span className="hero__accent">beautifully</span> simple.
          </h1>
          <p className="hero__lead">
            Browse the catalogue, fill your cart and place an order in a few clicks. Sign in once and you’re ready to
            shop.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => login()}>
              Sign in <ArrowRightIcon size={18} />
            </button>
            <Link to="/register" className="btn btn--secondary btn--lg">
              Create account
            </Link>
          </div>
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="art-card art-card--a">
            <div className="art-card__img" />
            <span className="art-card__line" />
            <span className="art-card__line art-card__line--short" />
            <span className="art-card__pill" />
          </div>
          <div className="art-card art-card--b">
            <div className="art-card__img" />
            <span className="art-card__line" />
            <span className="art-card__line art-card__line--short" />
            <span className="art-card__pill" />
          </div>
          <div className="art-card art-card--c">
            <div className="art-card__img" />
            <span className="art-card__line" />
            <span className="art-card__line art-card__line--short" />
            <span className="art-card__pill" />
          </div>
        </div>
      </section>

      <section className="container features" aria-label="Highlights">
        {features.map((f) => (
          <div className="feature" key={f.title}>
            <span className="feature__icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
