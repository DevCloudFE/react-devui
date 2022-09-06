export function saveFile(url: string, name: string) {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = name;
  a.click();
  document.body.removeChild(a);
}
