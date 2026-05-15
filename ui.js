export function createUI() {
  const host = document.getElementById('overlay-ui');
  const panel = document.createElement('section');
  panel.className = 'ui-panel';
  panel.innerHTML = `<strong>Neon Hand Reactor</strong><br><span id="statusText">Initializing camera and MediaPipe…</span><div class="sr-only" id="a11yStatus"></div>`;
  host.append(panel);

  return {
    setStatus(text, isError = false) {
      panel.querySelector('#statusText').textContent = text;
      panel.querySelector('#a11yStatus').textContent = text;
      panel.classList.toggle('status-error', isError);
    }
  };
}
