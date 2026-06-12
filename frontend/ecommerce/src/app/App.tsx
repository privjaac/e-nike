import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { AuthInitializer } from '@/shared/components/AuthInitializer';
import { HomePage } from '@/features/catalog/pages/HomePage';
import { ProductPage } from '@/features/catalog/pages/ProductPage';
import { ListingPage } from '@/features/catalog/pages/ListingPage';
import { AuthPage } from '@/features/auth/pages/AuthPage';
import { CartPage } from '@/features/cart/pages/CartPage';
import { FavoritesPage } from '@/features/favorites/pages/FavoritesPage';
import { CheckoutPage } from '@/features/cart/pages/CheckoutPage';
import { DashboardLayout } from '@/shared/components/dashboard/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ProductsPage } from '@/features/dashboard/pages/ProductsPage';
import { ProductEditPage } from '@/features/dashboard/pages/ProductEditPage';
import { InventoryPage } from '@/features/dashboard/pages/InventoryPage';
import { OrdersPage } from '@/features/dashboard/pages/OrdersPage';
import { AnalyticsPage } from '@/features/dashboard/pages/AnalyticsPage';
import { SettingsPage } from '@/features/dashboard/pages/SettingsPage';

function App() {
  return (
    <>
      <AuthInitializer />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductEditPage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
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
