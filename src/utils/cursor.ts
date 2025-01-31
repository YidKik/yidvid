export function initializeCursor() {
  document.addEventListener('mousemove', (e) => {
    document.body.style.setProperty('--cursor-x', `${e.clientX}px`);
    document.body.style.setProperty('--cursor-y', `${e.clientY}px`);
  });
}