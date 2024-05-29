import { CreateCoinTransactionParams } from "./CreateCoinTransactionParams";
import {
  CoinDescriptionTooLargeError,
  InvalidCoinDescriptionError,
  InvalidCoinImageError,
  InvalidCoinNameError,
  InvalidCoinSymbolError,
} from "./invalidParamErrors";
import { validateCoinDescription, validateCoinImage, validateCoinName, validateCoinSymbol } from "./validation";

/**
 * Validates parameters for creating the coin.
 *
 * @param {CreateCoinTransactionParams} params - Parameters for creating the coin.
 * @throws {Error} If the validation fails.
 */
export function validateCreateCoinParams({ name, symbol, image, description }: CreateCoinTransactionParams): void {
  if (!validateCoinName(name)) {
    throw new InvalidCoinNameError(`[validateCreateCoinParams] Coin name ${name} is invalid`);
  }

  if (!validateCoinSymbol(symbol)) {
    throw new InvalidCoinSymbolError(`[validateCreateCoinParams] Coin symbol ${symbol} is invalid`);
  }

  if (!validateCoinDescription(description)) {
    if (description.length > 300) {
      throw new CoinDescriptionTooLargeError(`[validateCreateCoinParams] Coin description ${description} is too large`);
    }

    throw new InvalidCoinDescriptionError(`[validateCreateCoinParams] Coin description ${description} is invalid`);
  }

  if (!validateCoinImage(image)) {
    throw new InvalidCoinImageError(`[validateCreateCoinParams] Coin image ${image} is invalid`);
  }
}
