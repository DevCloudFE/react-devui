export function toString(arr: number[]) {
  return new TextDecoder().decode(Uint8Array.from(arr));
}
