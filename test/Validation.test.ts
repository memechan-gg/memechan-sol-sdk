import { CreateCoinTransactionParams } from "../src/token/validation/CreateCoinTransactionParams";
import {
  InvalidCoinNameError,
  InvalidCoinSymbolError,
  InvalidCoinDescriptionError,
  InvalidCoinImageError,
  NameEqualsToDescriptionError,
  SymbolEqualsToDescriptionError,
} from "../src/token/validation/invalidParamErrors";
import { validateCreateCoinParams } from "../src/token/validation/validateCreateCoinParams";
import {
  validateCoinName,
  validateCoinSymbol,
  validateCoinDescription,
  validateCoinImage,
} from "../src/token/validation/validation";

describe("Validation Tests", () => {
  describe("validateCoinName", () => {
    it("should return true for a valid coin name", () => {
      expect(validateCoinName("ValidName")).toBe(true);
    });

    it("should return false for an empty coin name", () => {
      expect(validateCoinName("")).toBe(false);
    });

    it("should return false for a coin name with special characters", () => {
      expect(validateCoinName("Invalid@Name!")).toBe(false);
    });

    it("should return false for a coin name exceeding 32 bytes", () => {
      expect(validateCoinName("ThisNameIsWayTooLongToBeValidAndShouldFail")).toBe(false);
    });
  });

  describe("validateCoinSymbol", () => {
    it("should return true for a valid coin symbol", () => {
      expect(validateCoinSymbol("VALID")).toBe(true);
    });

    it("should return false for an empty coin symbol", () => {
      expect(validateCoinSymbol("")).toBe(false);
    });

    it("should return false for a coin symbol with special characters", () => {
      expect(validateCoinSymbol("INVALID@SYM!")).toBe(false);
    });

    it("should return false for a coin symbol exceeding 10 bytes", () => {
      expect(validateCoinSymbol("TOOLONGSYMBOL")).toBe(false);
    });
  });

  describe("validateCoinDescription", () => {
    it("should return true for a valid coin description", () => {
      expect(validateCoinDescription("This is a valid description.")).toBe(true);
    });

    it("should return false for a non-string coin description", () => {
      expect(validateCoinDescription(123 as any)).toBe(false);
    });
  });

  describe("validateCoinImage", () => {
    it("should return true for a valid URL", () => {
      expect(validateCoinImage("https://example.com/image.png")).toBe(true);
    });

    it("should return true for a valid base64 image", () => {
      expect(validateCoinImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA")).toBe(true);
    });

    it("should return true for an empty string", () => {
      expect(validateCoinImage("")).toBe(true);
    });

    it("should return false for an invalid URL", () => {
      expect(validateCoinImage("invalid-url")).toBe(false);
    });

    it("should return false for an invalid base64 image", () => {
      expect(validateCoinImage("data:image/png;base64,invalidbase     64")).toBe(false);
    });
  });

  describe("validateCreateCoinParams", () => {
    const validParams: CreateCoinTransactionParams = {
      name: "ValidName",
      symbol: "VALID",
      description: "This is a valid description.",
      image: "https://example.com/image.png",
    };

    it("should not throw an error for valid parameters", () => {
      expect(() => validateCreateCoinParams(validParams)).not.toThrow();
    });

    it("should throw InvalidCoinNameError for an invalid coin name", () => {
      const params = { ...validParams, name: "Invalid@Name!" };
      expect(() => validateCreateCoinParams(params)).toThrow(InvalidCoinNameError);
    });

    it("should throw InvalidCoinSymbolError for an invalid coin symbol", () => {
      const params = { ...validParams, symbol: "INVALID@SYM!" };
      expect(() => validateCreateCoinParams(params)).toThrow(InvalidCoinSymbolError);
    });

    it("should throw InvalidCoinDescriptionError for an invalid coin description", () => {
      const params = { ...validParams, description: 123 as any };
      expect(() => validateCreateCoinParams(params)).toThrow(InvalidCoinDescriptionError);
    });

    it("should throw InvalidCoinImageError for an invalid coin image", () => {
      const params = { ...validParams, image: "invalid-url" };
      expect(() => validateCreateCoinParams(params)).toThrow(InvalidCoinImageError);
    });

    it("should throw NameEqualsToDescriptionError if name equals description", () => {
      const params = { ...validParams, name: "SameText", description: "SameText" };
      expect(() => validateCreateCoinParams(params)).toThrow(NameEqualsToDescriptionError);
    });

    it("should throw SymbolEqualsToDescriptionError if symbol equals description", () => {
      const params = { ...validParams, symbol: "SameText", description: "SameText" };
      expect(() => validateCreateCoinParams(params)).toThrow(SymbolEqualsToDescriptionError);
    });
  });
});
