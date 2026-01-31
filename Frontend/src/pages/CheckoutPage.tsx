import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items } = useCartStore();

  useEffect(() => {
    // Redirect to the first step of checkout
    if (items.length === 0) {
      navigate('/cart');
    } else {
      navigate('/checkout/contact');
    }
  }, [items.length, navigate]);

  return null;
}
