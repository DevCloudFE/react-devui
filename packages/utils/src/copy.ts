export function copy(str: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str);
  } else {
    let el: HTMLTextAreaElement | null = document.createElement('textarea');
    el.style.cssText = 'position:fixed;opacity:0;';
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    el = null;
  }
}
