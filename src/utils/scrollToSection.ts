/**
 * Scrolls to a section element with an offset to account for the fixed header.
 * The header is 56px (pt-14), so we add some extra padding.
 */
export const scrollToSection = (element: HTMLElement | null, behavior: ScrollBehavior = 'smooth') => {
  if (!element) return;
  const headerOffset = 72; // 56px header + 16px padding
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: elementPosition - headerOffset,
    behavior,
  });
};
