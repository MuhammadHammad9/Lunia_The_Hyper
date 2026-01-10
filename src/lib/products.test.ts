import { describe, it, expect } from "vitest";
import {
  products,
  allProducts,
  bundles,
  reviews,
  giftCardProduct,
  Product,
} from "./products";

describe("Products Data", () => {
  describe("products array", () => {
    it("should have at least 3 products", () => {
      expect(products.length).toBeGreaterThanOrEqual(3);
    });

    it("should have valid product structure", () => {
      products.forEach((product) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("tagline");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("image");
        expect(product).toHaveProperty("badge");
      });
    });

    it("should have positive prices", () => {
      products.forEach((product) => {
        expect(product.price).toBeGreaterThan(0);
      });
    });

    it("should have valid image URLs", () => {
      products.forEach((product) => {
        expect(product.image).toMatch(/^https?:\/\//);
      });
    });

    it("should have unique IDs", () => {
      const ids = products.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(products.length);
    });
  });

  describe("allProducts array", () => {
    it("should contain all featured products", () => {
      products.forEach((product) => {
        expect(allProducts).toContainEqual(product);
      });
    });

    it("should have more products than featured list", () => {
      expect(allProducts.length).toBeGreaterThanOrEqual(products.length);
    });

    it("should have unique IDs", () => {
      const ids = allProducts.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(allProducts.length);
    });
  });

  describe("bundles array", () => {
    it("should have bundle products", () => {
      expect(bundles.length).toBeGreaterThan(0);
    });

    it("should have IDs in different range than regular products", () => {
      bundles.forEach((bundle) => {
        expect(bundle.id).toBeGreaterThanOrEqual(100);
      });
    });

    it("should have unique IDs", () => {
      const ids = bundles.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(bundles.length);
    });

    it("should have valid bundle structure", () => {
      bundles.forEach((bundle) => {
        expect(bundle).toHaveProperty("id");
        expect(bundle).toHaveProperty("name");
        expect(bundle).toHaveProperty("tagline");
        expect(bundle).toHaveProperty("price");
        expect(bundle).toHaveProperty("image");
        expect(bundle).toHaveProperty("badge");
      });
    });
  });

  describe("reviews array", () => {
    it("should have customer reviews", () => {
      expect(reviews.length).toBeGreaterThan(0);
    });

    it("should have valid review structure", () => {
      reviews.forEach((review) => {
        expect(review).toHaveProperty("name");
        expect(review).toHaveProperty("role");
        expect(review).toHaveProperty("text");
        expect(review).toHaveProperty("img");
        expect(review.name).not.toBe("");
        expect(review.text).not.toBe("");
      });
    });

    it("should have valid image URLs", () => {
      reviews.forEach((review) => {
        expect(review.img).toMatch(/^https?:\/\//);
      });
    });
  });

  describe("giftCardProduct", () => {
    it("should have valid gift card structure", () => {
      expect(giftCardProduct).toHaveProperty("id");
      expect(giftCardProduct).toHaveProperty("name");
      expect(giftCardProduct).toHaveProperty("tagline");
      expect(giftCardProduct).toHaveProperty("price");
      expect(giftCardProduct).toHaveProperty("image");
      expect(giftCardProduct).toHaveProperty("badge");
    });

    it("should have gift badge", () => {
      expect(giftCardProduct.badge).toBe("Gift");
    });

    it("should have special ID", () => {
      expect(giftCardProduct.id).toBe(999);
    });

    it("should have positive price", () => {
      expect(giftCardProduct.price).toBeGreaterThan(0);
    });
  });

  describe("Product type interface", () => {
    it("should allow badge to be null", () => {
      const productWithNullBadge = products.find((p) => p.badge === null);
      expect(productWithNullBadge).toBeDefined();
    });

    it("should allow badge to have value", () => {
      const productWithBadge = products.find((p) => p.badge !== null);
      expect(productWithBadge).toBeDefined();
    });
  });
});
