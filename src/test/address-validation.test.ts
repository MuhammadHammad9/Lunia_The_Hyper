import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create the address schema from Addresses.tsx
const addressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().optional(),
  label: z.string().optional(),
  is_default_shipping: z.boolean().optional(),
});

describe("Address Validation Schema", () => {
  const validAddress = {
    first_name: "John",
    last_name: "Doe",
    address_line1: "123 Main Street",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US",
  };

  describe("valid addresses", () => {
    it("should accept a valid minimal address", () => {
      expect(() => addressSchema.parse(validAddress)).not.toThrow();
    });

    it("should accept a full address with optional fields", () => {
      const fullAddress = {
        ...validAddress,
        address_line2: "Apt 4B",
        phone: "+1-555-123-4567",
        label: "Home",
        is_default_shipping: true,
      };
      expect(() => addressSchema.parse(fullAddress)).not.toThrow();
    });

    it("should accept empty string for optional address_line2", () => {
      const address = {
        ...validAddress,
        address_line2: "",
      };
      expect(() => addressSchema.parse(address)).not.toThrow();
    });
  });

  describe("first_name validation", () => {
    it("should reject empty first name", () => {
      const address = { ...validAddress, first_name: "" };
      expect(() => addressSchema.parse(address)).toThrow("First name is required");
    });
  });

  describe("last_name validation", () => {
    it("should reject empty last name", () => {
      const address = { ...validAddress, last_name: "" };
      expect(() => addressSchema.parse(address)).toThrow("Last name is required");
    });
  });

  describe("address_line1 validation", () => {
    it("should reject address shorter than 5 characters", () => {
      const address = { ...validAddress, address_line1: "123" };
      expect(() => addressSchema.parse(address)).toThrow("Address is required");
    });

    it("should accept address with exactly 5 characters", () => {
      const address = { ...validAddress, address_line1: "123 M" };
      expect(() => addressSchema.parse(address)).not.toThrow();
    });
  });

  describe("city validation", () => {
    it("should reject city shorter than 2 characters", () => {
      const address = { ...validAddress, city: "N" };
      expect(() => addressSchema.parse(address)).toThrow("City is required");
    });

    it("should accept city with exactly 2 characters", () => {
      const address = { ...validAddress, city: "NY" };
      expect(() => addressSchema.parse(address)).not.toThrow();
    });
  });

  describe("state validation", () => {
    it("should reject state shorter than 2 characters", () => {
      const address = { ...validAddress, state: "N" };
      expect(() => addressSchema.parse(address)).toThrow("State is required");
    });
  });

  describe("postal_code validation", () => {
    it("should reject postal code shorter than 3 characters", () => {
      const address = { ...validAddress, postal_code: "10" };
      expect(() => addressSchema.parse(address)).toThrow("ZIP code is required");
    });

    it("should accept various postal code formats", () => {
      expect(() =>
        addressSchema.parse({ ...validAddress, postal_code: "10001" })
      ).not.toThrow();
      expect(() =>
        addressSchema.parse({ ...validAddress, postal_code: "10001-1234" })
      ).not.toThrow();
      expect(() =>
        addressSchema.parse({ ...validAddress, postal_code: "SW1A 1AA" })
      ).not.toThrow();
    });
  });

  describe("country validation", () => {
    it("should reject country shorter than 2 characters", () => {
      const address = { ...validAddress, country: "U" };
      expect(() => addressSchema.parse(address)).toThrow("Country is required");
    });

    it("should accept country codes", () => {
      expect(() =>
        addressSchema.parse({ ...validAddress, country: "US" })
      ).not.toThrow();
      expect(() =>
        addressSchema.parse({ ...validAddress, country: "United States" })
      ).not.toThrow();
    });
  });

  describe("optional fields", () => {
    it("should handle undefined optional fields", () => {
      const address = {
        first_name: "John",
        last_name: "Doe",
        address_line1: "123 Main Street",
        city: "New York",
        state: "NY",
        postal_code: "10001",
        country: "US",
      };
      const result = addressSchema.parse(address);
      expect(result.address_line2).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.label).toBeUndefined();
      expect(result.is_default_shipping).toBeUndefined();
    });

    it("should accept is_default_shipping as boolean", () => {
      expect(() =>
        addressSchema.parse({ ...validAddress, is_default_shipping: true })
      ).not.toThrow();
      expect(() =>
        addressSchema.parse({ ...validAddress, is_default_shipping: false })
      ).not.toThrow();
    });
  });
});
