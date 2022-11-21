let globalKey = 0;
export function getGlobalKey() {
  globalKey += 1;
  return globalKey;
}
