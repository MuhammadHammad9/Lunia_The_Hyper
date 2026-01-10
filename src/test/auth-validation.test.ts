import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create the validation schemas from Auth.tsx
const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email is too long" });

const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters" })
  .max(128, { message: "Password is too long" });

const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required" })
  .max(100, { message: "Name is too long" });

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

describe("Auth Validation Schemas", () => {
  describe("emailSchema", () => {
    it("should accept valid email addresses", () => {
      expect(() => emailSchema.parse("test@example.com")).not.toThrow();
      expect(() => emailSchema.parse("user.name@domain.co.uk")).not.toThrow();
      expect(() => emailSchema.parse("  test@example.com  ")).not.toThrow(); // trimmed
    });

    it("should reject invalid email addresses", () => {
      expect(() => emailSchema.parse("invalid")).toThrow();
      expect(() => emailSchema.parse("@domain.com")).toThrow();
      expect(() => emailSchema.parse("test@")).toThrow();
      expect(() => emailSchema.parse("")).toThrow();
    });

    it("should reject emails that are too long", () => {
      const longEmail = "a".repeat(250) + "@test.com";
      expect(() => emailSchema.parse(longEmail)).toThrow("Email is too long");
    });

    it("should trim whitespace", () => {
      const result = emailSchema.parse("  test@example.com  ");
      expect(result).toBe("test@example.com");
    });
  });

  describe("passwordSchema", () => {
    it("should accept valid passwords", () => {
      expect(() => passwordSchema.parse("password123")).not.toThrow();
      expect(() => passwordSchema.parse("123456")).not.toThrow();
      expect(() => passwordSchema.parse("abcdef")).not.toThrow();
    });

    it("should reject passwords that are too short", () => {
      expect(() => passwordSchema.parse("12345")).toThrow(
        "Password must be at least 6 characters"
      );
      expect(() => passwordSchema.parse("")).toThrow();
    });

    it("should reject passwords that are too long", () => {
      const longPassword = "a".repeat(129);
      expect(() => passwordSchema.parse(longPassword)).toThrow(
        "Password is too long"
      );
    });
  });

  describe("nameSchema", () => {
    it("should accept valid names", () => {
      expect(() => nameSchema.parse("John Doe")).not.toThrow();
      expect(() => nameSchema.parse("A")).not.toThrow();
      expect(() => nameSchema.parse("  John Doe  ")).not.toThrow();
    });

    it("should reject empty names", () => {
      expect(() => nameSchema.parse("")).toThrow("Name is required");
      expect(() => nameSchema.parse("   ")).toThrow("Name is required"); // whitespace only
    });

    it("should reject names that are too long", () => {
      const longName = "a".repeat(101);
      expect(() => nameSchema.parse(longName)).toThrow("Name is too long");
    });

    it("should trim whitespace", () => {
      const result = nameSchema.parse("  John Doe  ");
      expect(result).toBe("John Doe");
    });
  });

  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid email in login", () => {
      const invalidData = {
        email: "invalid",
        password: "password123",
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it("should reject invalid password in login", () => {
      const invalidData = {
        email: "test@example.com",
        password: "short",
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe("signupSchema", () => {
    it("should accept valid signup data", () => {
      const validData = {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
      };
      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it("should reject missing name", () => {
      const invalidData = {
        name: "",
        email: "test@example.com",
        password: "password123",
      };
      expect(() => signupSchema.parse(invalidData)).toThrow();
    });

    it("should reject invalid email in signup", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid",
        password: "password123",
      };
      expect(() => signupSchema.parse(invalidData)).toThrow();
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should accept valid email", () => {
      const validData = {
        email: "test@example.com",
      };
      expect(() => forgotPasswordSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid",
      };
      expect(() => forgotPasswordSchema.parse(invalidData)).toThrow();
    });
  });
});
