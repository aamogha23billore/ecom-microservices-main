import { useAuth } from '../auth/AuthContext';
import Landing from './Landing';
import Shop from './Shop';

export default function Home() {
  const { authenticated } = useAuth();
  return authenticated ? <Shop /> : <Landing />;
}
