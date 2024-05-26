import { CreateCoinTransactionParams } from "./CreateCoinTransactionParams";
import {
  InvalidCoinDescriptionError,
  InvalidCoinImageError,
  InvalidCoinNameError,
  InvalidCoinSymbolError,
  NameEqualsToDescriptionError,
  SymbolEqualsToDescriptionError,
} from "./invalid-param-errors";
import { validateCoinDescription, validateCoinImage, validateCoinName, validateCoinSymbol } from "./validation";

/**
 * Validates parameters for creating the coin.
 *
 * @param {CreateCoinTransactionParams} params - Parameters for creating the coin.
 * @throws {Error} If the validation fails.
 */
export function validateCreateCoinParams({ name, symbol, url, description }: CreateCoinTransactionParams): void {
  if (!validateCoinName(name)) {
    throw new InvalidCoinNameError(`[validateCreateCoinParams] Coin name ${name} is invalid`);
  }

  if (!validateCoinSymbol(symbol)) {
    throw new InvalidCoinSymbolError(`[validateCreateCoinParams] Coin symbol ${symbol} is invalid`);
  }

  if (!validateCoinDescription(description)) {
    throw new InvalidCoinDescriptionError(`[validateCreateCoinParams] Coin description ${description} is invalid`);
  }

  if (!validateCoinImage(url)) {
    throw new InvalidCoinImageError(`[validateCreateCoinParams] Coin image ${url} is invalid`);
  }

  if (name.trim() === description.trim()) {
    throw new NameEqualsToDescriptionError(
      `[validateCreateCoinParams] Coin name ${name} and coin description ${description} are equal`,
    );
  }

  if (symbol.trim() === description.trim()) {
    throw new SymbolEqualsToDescriptionError(
      `[validateCreateCoinParams] Coin symbol ${symbol} and coin description ${description} are equal`,
    );
  }
}
