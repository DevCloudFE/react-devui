export function isPrintableCharacter(str: string) {
  return str.length === 1 && str.match(/\S| /);
}
