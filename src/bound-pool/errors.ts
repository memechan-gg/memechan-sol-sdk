/**
 * Custom error class representing an error when a bound pool that was tried to be fetched doesn't exist
 * in the blockchain.
 * @class
 * @extends Error
 */
export class NoBoundPoolExist extends Error {
  /**
   * Creates an instance of NoBoundPoolExist.
   * @constructor
   * @param {string} msg - The error message.
   */
  constructor(msg: string) {
    super(msg);
  }
}
