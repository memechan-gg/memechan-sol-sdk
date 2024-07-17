/**
 * Custom error class representing an error when a coin name provided for the coin creation is invalid.
 * @class
 * @extends Error
 */
export class InvalidCoinNameError extends Error {
  /**
   * Creates an instance of InvalidCoinNameError.
   * @constructor
   * @param {string} msg - The error message.
   */
  constructor(msg: string) {
    super(msg);
  }
}

/**
 * Custom error class representing an error when a coin symbol provided for the coin creation is invalid.
 * @class
 * @extends Error
 */
export class InvalidCoinSymbolError extends Error {
  /**
   * Creates an instance of InvalidCoinSymbolError.
   * @constructor
   * @param {string} msg - The error message.
   */
  constructor(msg: string) {
    super(msg);
  }
}

/**
 * Custom error class representing an error when a coin description provided for the coin creation is invalid.
 * @class
 * @extends Error
 */
export class InvalidCoinDescriptionError extends Error {
  /**
   * Creates an instance of InvalidCoinDescriptionError.
   * @constructor
   * @param {string} msg - The error message.
   */
  constructor(msg: string) {
    super(msg);
  }
}

/**
 * Custom error class representing an error when a coin description provided for the coin creation is too large.
 * @class
 * @extends Error
 */
export class CoinDescriptionTooLargeError extends Error {
  /**
   * Creates an instance of CoinDescriptionTooLargeError.
   * @constructor
   * @param {string} msg - The error message.
   */
  constructor(msg: string) {
    super(msg);
  }
}

/**
 * Custom error class representing an error when a coin image provided for the coin creation is invalid.
 * @class
 * @extends Error
 */
export class InvalidCoinImageError extends Error {
  /**
   * Creates an instance of InvalidCoinImageError.
   * @constructor
   * @param {string} msg - The error message.
   */
  constructor(msg: string) {
    super(msg);
  }
}
