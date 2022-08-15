export function handleModalKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
  if (e.code === 'Tab') {
    const focusableEls = Array.from(
      e.currentTarget.querySelectorAll('a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')) as HTMLElement[];

    if (e.shiftKey) {
      if (document.activeElement === focusableEls[0]) {
        e.preventDefault();
        focusableEls[focusableEls.length - 1].focus({ preventScroll: true });
      }
    } else {
      if (document.activeElement === focusableEls[focusableEls.length - 1]) {
        e.preventDefault();
        focusableEls[0].focus({ preventScroll: true });
      }
    }
  }
}
