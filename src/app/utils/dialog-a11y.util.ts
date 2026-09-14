const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusFirstInDialog(dialog: HTMLDialogElement): void {
  const focusable = getFocusableElements(dialog);
  focusable[0]?.focus();
}

export function trapDialogFocus(dialog: HTMLDialogElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !dialog.open) {
    return;
  }

  const focusable = getFocusableElements(dialog);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function getFocusableElements(dialog: HTMLDialogElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}
