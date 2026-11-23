import { Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Layout from './components/Layout';
import Protected from './components/Protected';
import { AuthErrorScreen, SplashScreen } from './components/Screens';
import Home from './pages/Home';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminProducts from './pages/AdminProducts';
import NotFound from './pages/NotFound';

export default function App() {
  const { status, error } = useAuth();

  if (status === 'initializing') return <SplashScreen />;
  if (status === 'error') return <AuthErrorScreen error={error} />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/products/:id"
          element={
            <Protected>
              <ProductDetail />
            </Protected>
          }
        />
        <Route
          path="/cart"
          element={
            <Protected needsProfile>
              <Cart />
            </Protected>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <Protected needsProfile>
              <OrderConfirmation />
            </Protected>
          }
        />
        <Route
          path="/orders"
          element={
            <Protected needsProfile>
              <Orders />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected needsProfile>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/admin/products"
          element={
            <Protected admin>
              <AdminProducts />
            </Protected>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
