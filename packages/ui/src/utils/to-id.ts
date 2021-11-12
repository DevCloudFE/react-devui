export function toId(id: string) {
  if (/\s/.test(id)) {
    let _id = id.replace(/\s/g, '-');
    _id = _id.toLowerCase();
    return _id;
  }
  if (/^[A-Z]+$/.test(id)) {
    return id.toLowerCase();
  }

  const arr = id.split('');
  let _id = '';
  arr.forEach((char, index) => {
    if (/[A-Z]/.test(char) && index !== 0) {
      _id += '-';
    }

    _id += char.toLowerCase();
  });

  return _id;
}
