export function isSimpleArrayEqual(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  if (set1.size !== set2.size) {
    return false;
  }
  for (const iterator of set1) {
    if (!set2.has(iterator)) {
      return false;
    }
  }

  return true;
}
