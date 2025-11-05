export function includedLimit() {
  return 10;
}
export function blockSize() {
  return 10;
}
export function blockPriceEUR() {
  return 10;
}
export function totalBlocksBeyondIncluded(n: any) {
  const extra = Math.max(0, n - includedLimit());
  return extra === 0 ? 0 : Math.ceil(extra / blockSize());
}
