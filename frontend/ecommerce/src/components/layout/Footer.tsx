import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, Megaphone } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';

const LANGUAGE_KEY = 'nike-language';

function getStoredLanguage(): string {
  return localStorage.getItem(LANGUAGE_KEY) || 'EN';
}

function setStoredLanguage(lang: string) {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export function Footer() {
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [lang, setLang] = useState(getStoredLanguage());

  const toggleLanguage = useCallback(() => {
    const next = lang === 'EN' ? 'ES' : 'EN';
    setLang(next);
    setStoredLanguage(next);
    addToast(`Language changed to ${next}`, 'success');
  }, [lang, addToast]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // User cancelled or share failed silently
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        addToast('Link copied to clipboard', 'success');
      } catch {
        addToast('Failed to copy link', 'error');
      }
    } else {
      addToast('Sharing not supported on this browser', 'error');
    }
  }, [addToast]);

  const shippingToast = useCallback(() => {
    addToast(
      'Free standard shipping on orders over $50. Express delivery available in select regions.',
      'success'
    );
  }, [addToast]);

  const returnsToast = useCallback(() => {
    addToast(
      '60-day free returns. Items must be unworn with original tags. Members get free return shipping.',
      'success'
    );
  }, [addToast]);

  const paymentToast = useCallback(() => {
    addToast(
      'We accept Visa, Mastercard, Amex, PayPal, Apple Pay, and Nike gift cards.',
      'success'
    );
  }, [addToast]);

  const findStoreToast = useCallback(() => {
    addToast(
      'Nike NYC - 5th Ave, Nike LA - Melrose, Nike Chicago - Michigan Ave',
      'success'
    );
  }, [addToast]);

  const sizeGuideToast = useCallback(() => {
    addToast(
      'Men: US 7-15 | Women: US 5-12 | Kids: US 11C-7Y. Check product page for detailed fit info.',
      'success'
    );
  }, [addToast]);

  const productExpertsToast = useCallback(() => {
    addToast('Chat with our product experts', 'success');
  }, [addToast]);

  return (
    <footer className="bg-inverse-surface w-full py-12 px-8 mt-20 text-secondary-container text-xs tracking-wide uppercase">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* Get Help */}
        <div className="space-y-4">
          <p className="text-surface font-bold mb-6">Get Help</p>
          <Link
            to="/dashboard/orders"
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all"
          >
            Order Status
          </Link>
          <button
            onClick={shippingToast}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Shipping & Delivery
          </button>
          <button
            onClick={returnsToast}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Returns
          </button>
          <button
            onClick={paymentToast}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Payment Options
          </button>
        </div>

        {/* About Nike */}
        <div className="space-y-4">
          <p className="text-surface font-bold mb-6">About Nike</p>
          <button
            onClick={() => addToast('News feed coming soon', 'success')}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            News
          </button>
          <button
            onClick={() => addToast('Check nike.com/careers', 'success')}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Careers
          </button>
          <button
            onClick={() => addToast('See investor.nike.com', 'success')}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Investors
          </button>
          <button
            onClick={() => addToast('Nike Move to Zero initiative', 'success')}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Sustainability
          </button>
        </div>

        {/* Member Services */}
        <div className="space-y-4">
          <p className="text-surface font-bold mb-6">Member Services</p>
          <Link
            to={isAuthenticated ? '/dashboard/settings' : '/auth'}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all"
          >
            Membership
          </Link>
          <button
            onClick={findStoreToast}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Find a Store
          </button>
          <button
            onClick={sizeGuideToast}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Size Guide
          </button>
          <button
            onClick={productExpertsToast}
            className="block opacity-80 hover:opacity-100 hover:text-inverse-primary transition-all text-left bg-transparent border-none p-0 cursor-pointer"
          >
            Product Experts
          </button>
        </div>

        {/* Social / Copyright */}
        <div className="flex flex-col justify-between">
          <div className="flex gap-4">
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-full bg-on-surface-variant flex items-center justify-center hover:bg-inverse-primary hover:text-inverse-surface transition-colors cursor-pointer"
              aria-label={`Language: ${lang}`}
              title={`Language: ${lang}`}
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-on-surface-variant flex items-center justify-center hover:bg-inverse-primary hover:text-inverse-surface transition-colors cursor-pointer"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => addToast('Subscribe to Nike newsletter', 'success')}
              className="w-10 h-10 rounded-full bg-on-surface-variant flex items-center justify-center hover:bg-inverse-primary hover:text-inverse-surface transition-colors cursor-pointer"
              aria-label="Subscribe to newsletter"
            >
              <Megaphone className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-8">&copy; 2024 Nike, Inc. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
