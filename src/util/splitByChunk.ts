// https://stackoverflow.com/a/11764168
export function splitByChunk(arr: unknown[], len: number) {
  if (len <= 0 || parseInt(String(len)) != len) {
    return [];
  }

  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
}
