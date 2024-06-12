import * as fs from "fs";

/**
 * Save data to a JSON file with formatted content.
 *
 * @async
 * @function
 * @param {object | object[]} data - The data to be saved to the JSON file.
 * @param {string} filename - The name of the JSON file (excluding the file extension).
 * @return {Promise<void>} A Promise that resolves when the data is successfully saved.
 * @throws {Error} Throws an error if there is an issue saving the data to the file.
 *
 * @example
 * // Assuming retrievelAllPools returns an object or array of data
 * const cetusPools = await retrievelAllPools();
 * await saveDataToJsonFile(cetusPools, 'cetusPools');
 */
export async function saveDataToJsonFile(data: object | object[], filename: string): Promise<void> {
  try {
    const jsonData: string = JSON.stringify(data, null, 2);
    const filePath = `${__dirname}/${filename}.json`;

    await fs.promises.writeFile(filePath, jsonData);

    console.log(`Data has been saved to ${filename}.json`);
  } catch (error) {
    console.error("Error saving data to file:", error);
  }
}

/**
 * Reads data from a JSON file asynchronously.
 * @param {string} filename - The name of the JSON file to read.
 * @return {Promise<object | object[]>} A promise that resolves with the parsed JSON data.
 */
export async function readDataFromJsonFile(filename: string): Promise<object | object[] | null> {
  try {
    const filePath = `${__dirname}/${filename}.json`;
    const jsonData: string = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading data from file:", error);
    return null;
  }
}
