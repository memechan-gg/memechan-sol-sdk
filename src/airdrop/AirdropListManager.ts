import { PublicKey, Connection } from "@solana/web3.js";
import { fetchChanKeys } from "./fetchChanKeys";
import { fetchSagaKeys } from "./fetchSagaKeys";
import { filterByActivity } from "./sagaFilter";

export class AirdropListManager {
  constructor(
    private chanKeys: Set<PublicKey> = new Set(),
    private sagaKeys: Set<PublicKey> = new Set(),
  ) {}

  public async fetchChanKeys(): Promise<PublicKey[]> {
    const chanKeys = await fetchChanKeys();
    this.chanKeys = new Set(chanKeys);

    return Array.from(this.chanKeys);
  }

  public async fetchSagaKeys(): Promise<PublicKey[]> {
    const sagaKeys = await fetchSagaKeys();
    this.sagaKeys = new Set(sagaKeys);

    return Array.from(this.sagaKeys);
  }

  public async filterSagaKeys(connection: Connection): Promise<PublicKey[]> {
    const filteredKeys = await filterByActivity(connection, Array.from(this.sagaKeys));
    this.sagaKeys = new Set(filteredKeys);

    return this.getSagaKeys();
  }

  public selectRandomChanKeys(amount: number) {
    return selectRandomKeys(amount, Array.from(this.chanKeys));
  }

  public selectRandomSagaKeys(amount: number) {
    return selectRandomKeys(amount, Array.from(this.sagaKeys));
  }

  public getChanKeys(): PublicKey[] {
    return Array.from(this.chanKeys);
  }

  public getSagaKeys(): PublicKey[] {
    return Array.from(this.sagaKeys);
  }
}

function selectRandomKeys(amount: number, keys: PublicKey[]): PublicKey[] {
  if (amount >= keys.length) {
    return keys;
  }

  shuffleArray(keys);
  return keys.slice(0, amount);
}

function shuffleArray(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    // TODO: probably want to use better PRNG
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}
