import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthInitializer } from './components/AuthInitializer';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { ListingPage } from './pages/ListingPage';
import { AuthPage } from './pages/AuthPage';
import { CartPage } from './pages/CartPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/dashboard/InventoryPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

function App() {
  return (
    <>
      <AuthInitializer />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ListingPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
