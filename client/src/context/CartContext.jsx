import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1, size = '', color = '') => {
    const { data } = await api.post('/cart', { productId, quantity, size, color });
    setItems(data);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.patch(`/cart/${productId}`, { quantity });
    setItems(data);
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setItems(data);
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setItems([]);
  };

  const subtotal = items.reduce((sum, i) => sum + (i.product?.salePrice ?? 0) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart, refreshCart, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
