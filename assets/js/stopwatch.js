const swDisplay = document.getElementById('stopwatch-display');
const startBtn = document.getElementById('start-stopwatch');
const resetBtn = document.getElementById('reset-stopwatch');
const lapBtn = document.getElementById('lap-btn');
const copyBtn = document.getElementById('copy-laps');
const lapsList = document.getElementById('laps-list');
const fullscreenBtn = document.getElementById('fullscreen-stopwatch');

let startTime = 0;
let elapsed = 0;
let running = false;
let timerId = null;
let laps = [];

function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  const parts = [hours, minutes, seconds].map(v => String(v).padStart(2, '0'));
  return `${parts.join(':')}.${String(hundredths).padStart(2, '0')}`;
}

function render() {
  const current = running ? Date.now() - startTime : elapsed;
  swDisplay.textContent = formatMs(current);
}

function tick() {
  render();
}

function toggleStart() {
  if (!running) {
    startTime = Date.now() - elapsed;
    timerId = setInterval(tick, 50);
    running = true;
    startBtn.textContent = 'Pause';
  } else {
    elapsed = Date.now() - startTime;
    clearInterval(timerId);
    running = false;
    startBtn.textContent = 'Resume';
    render();
  }
}

function reset() {
  clearInterval(timerId);
  running = false;
  elapsed = 0;
  startTime = 0;
  laps = [];
  lapsList.innerHTML = '';
  startBtn.textContent = 'Start';
  render();
}

function addLap() {
  if (!running && elapsed === 0) return;
  const current = running ? Date.now() - startTime : elapsed;
  const lastLapTime = laps.length ? laps[laps.length - 1].timeMs : 0;
  laps.push({
    timeMs: current,
    split: current - lastLapTime,
  });
  renderLaps();
}

function renderLaps() {
  lapsList.innerHTML = '';
  laps.forEach((lap, index) => {
    const li = document.createElement('li');
    li.textContent = `Lap ${index + 1}: ${formatMs(lap.timeMs)} (+${formatMs(lap.split)})`;
    lapsList.appendChild(li);
  });
}

async function copyLapsToClipboard() {
  if (!laps.length) return;
  const text = laps.map((lap, i) => `Lap ${i + 1}: ${formatMs(lap.timeMs)} (+${formatMs(lap.split)})`).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy laps'), 1600);
  } catch (err) {
    copyBtn.textContent = 'Copy not available';
    setTimeout(() => (copyBtn.textContent = 'Copy laps'), 1600);
  }
}

render();

startBtn.addEventListener('click', toggleStart);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', addLap);
copyBtn.addEventListener('click', copyLapsToClipboard);
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  document.body.classList.toggle('fullscreen-mode', Boolean(document.fullscreenElement));
});
