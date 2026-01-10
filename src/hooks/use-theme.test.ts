import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "./use-theme";

// Create a proper localStorage mock with state
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

describe("useTheme hook", () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    // Create fresh localStorage mock
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Clear document classes
    document.documentElement.classList.remove("dark");
  });

  describe("initial state", () => {
    it("should have isDark as boolean", () => {
      const { result } = renderHook(() => useTheme());
      expect(typeof result.current.isDark).toBe("boolean");
    });
  });

  describe("toggleTheme", () => {
    it("should toggle theme state", () => {
      const { result } = renderHook(() => useTheme());
      const initialState = result.current.isDark;

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(!initialState);
    });

    it("should add dark class when toggling to dark", () => {
      const { result } = renderHook(() => useTheme());

      // Ensure we start in light mode
      while (result.current.isDark) {
        act(() => {
          result.current.toggleTheme();
        });
      }

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should remove dark class when toggling to light", () => {
      const { result } = renderHook(() => useTheme());

      // Set to dark first
      while (!result.current.isDark) {
        act(() => {
          result.current.toggleTheme();
        });
      }

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should call localStorage.setItem when toggling", () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("initTheme", () => {
    it("should call localStorage.getItem on init", () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.initTheme();
      });

      expect(localStorageMock.getItem).toHaveBeenCalledWith("theme");
    });
  });
});

