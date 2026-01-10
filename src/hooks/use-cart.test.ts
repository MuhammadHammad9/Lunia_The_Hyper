import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCart, CartItem } from "./use-cart";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
      }),
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockProduct = {
  id: "product-1",
  name: "Test Product",
  tagline: "Test tagline",
  price: 29.99,
  image: "/test-image.jpg",
  badge: "New",
};

describe("useCart hook", () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  describe("addItem", () => {
    it("should add a new item to the cart", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe("Test Product");
      expect(result.current.items[0].quantity).toBe(1);
    });

    it("should increment quantity for existing item", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
        await result.current.addItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it("should handle numeric product IDs", async () => {
      const { result } = renderHook(() => useCart());
      const numericIdProduct = { ...mockProduct, id: 123 };

      await act(async () => {
        await result.current.addItem(numericIdProduct);
      });

      expect(result.current.items[0].id).toBe("123");
    });
  });

  describe("removeItem", () => {
    it("should remove an item from the cart", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeItem("product-1");
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("should not affect other items when removing one", async () => {
      const { result } = renderHook(() => useCart());
      const product2 = { ...mockProduct, id: "product-2", name: "Product 2" };

      await act(async () => {
        await result.current.addItem(mockProduct);
        await result.current.addItem(product2);
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.removeItem("product-1");
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe("Product 2");
    });
  });

  describe("updateQuantity", () => {
    it("should update the quantity of an item", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
      });

      act(() => {
        result.current.updateQuantity("product-1", 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it("should remove item when quantity is set to 0", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
      });

      act(() => {
        result.current.updateQuantity("product-1", 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("should remove item when quantity is negative", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
      });

      act(() => {
        result.current.updateQuantity("product-1", -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("toggleCart", () => {
    it("should toggle cart open state", () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("setCartOpen", () => {
    it("should set cart open state directly", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.setCartOpen(true);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.setCartOpen(false);
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("clearCart", () => {
    it("should remove all items from cart", async () => {
      const { result } = renderHook(() => useCart());
      const product2 = { ...mockProduct, id: "product-2" };

      await act(async () => {
        await result.current.addItem(mockProduct);
        await result.current.addItem(product2);
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("total", () => {
    it("should calculate total price correctly", async () => {
      const { result } = renderHook(() => useCart());
      const product2 = { ...mockProduct, id: "product-2", price: 19.99 };

      await act(async () => {
        await result.current.addItem(mockProduct); // 29.99
        await result.current.addItem(product2); // 19.99
      });

      expect(result.current.total()).toBeCloseTo(49.98);
    });

    it("should account for quantities in total", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
      });

      act(() => {
        result.current.updateQuantity("product-1", 3);
      });

      expect(result.current.total()).toBeCloseTo(89.97);
    });

    it("should return 0 for empty cart", () => {
      const { result } = renderHook(() => useCart());
      expect(result.current.total()).toBe(0);
    });
  });

  describe("count", () => {
    it("should return total number of items", async () => {
      const { result } = renderHook(() => useCart());
      const product2 = { ...mockProduct, id: "product-2" };

      await act(async () => {
        await result.current.addItem(mockProduct);
        await result.current.addItem(product2);
      });

      expect(result.current.count()).toBe(2);
    });

    it("should account for quantities in count", async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct);
      });

      act(() => {
        result.current.updateQuantity("product-1", 5);
      });

      expect(result.current.count()).toBe(5);
    });

    it("should return 0 for empty cart", () => {
      const { result } = renderHook(() => useCart());
      expect(result.current.count()).toBe(0);
    });
  });
});
