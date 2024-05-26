// eslint-disable-next-line max-len
// Byte limits from https://github.com/metaplex-foundation/metaplex-program-library/blob/9fc2a13b5a66d407f0b9ab31eb7b161b78f28ef0/token-metadata/program/src/state/metadata.rs#L63

import { MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH } from "./consts";

/**
 * Validates the coin name to be a non-empty string and within the byte length limit.
 *
 * @param {string} coinName - The coin name to validate.
 * @return {boolean} - Returns true if the coin name is valid, otherwise false.
 */
export function validateCoinName(coinName: string): boolean {
  const regex = /^[a-zA-Z0-9\s]+$/;
  const maxByteLength = MAX_NAME_LENGTH;

  return (
    typeof coinName === "string" &&
    coinName.trim() !== "" &&
    regex.test(coinName) &&
    getByteSize(coinName) <= maxByteLength
  );
}

/**
 * Validates the coin symbol based on the specified pattern and byte length.
 *
 * @param {string} coinSymbol - The coin symbol to validate.
 * @return {boolean} - Returns true if the coin symbol is valid, otherwise false.
 */
export function validateCoinSymbol(coinSymbol: string): boolean {
  const regex = /^[a-zA-Z_]+$/;
  const maxByteLength = MAX_SYMBOL_LENGTH;

  const isCoinSymbolValid =
    typeof coinSymbol === "string" && regex.test(coinSymbol) && getByteSize(coinSymbol) <= maxByteLength;

  return isCoinSymbolValid;
}

/**
 * Validates the coin description to be a string.
 *
 * @param {string} coinDescription - The coin description to validate.
 * @return {boolean} - Returns true if the coin description is a string, otherwise false.
 */
export function validateCoinDescription(coinDescription: string): boolean {
  return typeof coinDescription === "string";
}

/**
 * Validates a parameter intended for use as an image of a coin.
 *
 * @param {string} coinImage - The value to be validated as a coin image.
 * @return {boolean} Returns true if the coinImage is valid, otherwise false.
 *
 * @description
 * This function validates the `coinImage` parameter to ensure it meets the criteria for an acceptable coin image.
 * The validation process includes:
 * - Checking if the `coinImage` parameter is an empty string, which is allowed.
 * - Verifying if the `coinImage` parameter matches either a base64-encoded string or a valid URL format.
 */
export function validateCoinImage(coinImage: string): boolean {
  const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif);base64,([A-Za-z0-9+/]+={0,2})$/;
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  return coinImage === "" || base64ImageRegex.test(coinImage) || urlRegex.test(coinImage);
}

const getByteSize = (str: BlobPart) => new Blob([str]).size;
