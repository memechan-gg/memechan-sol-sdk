export const toMap = <T, K>(list: T[], keyFn: (el: T) => K): Map<K, T> => {
  return new Map<K, T>(list.map((elem) => [keyFn(elem), elem]));
};
