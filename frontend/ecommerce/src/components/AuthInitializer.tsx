import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

export function AuthInitializer() {
  const { fetchMe } = useAuthStore();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    fetchMe().then(() => fetchCart());
  }, [fetchMe, fetchCart]);

  return null;
}
