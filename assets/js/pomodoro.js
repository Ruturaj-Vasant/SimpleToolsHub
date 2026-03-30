const pomDisplay = document.getElementById('pomodoro-display');
const startPomBtn = document.getElementById('start-pomodoro');
const pausePomBtn = document.getElementById('pause-pomodoro');
const resetPomBtn = document.getElementById('reset-pomodoro');
const workInput = document.getElementById('work-minutes');
const breakInput = document.getElementById('break-minutes');
const sessionLabel = document.getElementById('session-label');
const sessionCountEl = document.getElementById('session-count');
const soundToggle = document.getElementById('pomo-sound-toggle');
const vibrateToggle = document.getElementById('pomo-vibrate-toggle');
const fullscreenBtn = document.getElementById('fullscreen-pomodoro');

let workMinutes = 25;
let breakMinutes = 5;
let currentMode = 'work';
let remainingSeconds = workMinutes * 60;
let running = false;
let intervalId = null;
let endTime = null;
let sessionCount = 0;
let audioCtx;

function formatMMSS(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function sanitizeDurations() {
  workMinutes = Math.max(1, parseInt(workInput.value, 10) || 25);
  breakMinutes = Math.max(1, parseInt(breakInput.value, 10) || 5);
  workInput.value = workMinutes;
  breakInput.value = breakMinutes;
}

function updateDisplay() {
  pomDisplay.textContent = formatMMSS(remainingSeconds);
  sessionLabel.textContent = currentMode === 'work' ? 'Work session' : 'Break session';
  sessionCountEl.textContent = sessionCount;
  updateTitle();
}

function updateTitle() {
  const base = 'Pomodoro Timer | Simple Tools Hub';
  if (running) {
    document.title = `${formatMMSS(remainingSeconds)} · ${currentMode === 'work' ? 'Focus' : 'Break'} | Pomodoro`;
  } else {
    document.title = base;
  }
}

function startPomodoro() {
  if (running) return;
  sanitizeDurations();
  if (remainingSeconds <= 0) {
    remainingSeconds = (currentMode === 'work' ? workMinutes : breakMinutes) * 60;
  }
  endTime = Date.now() + remainingSeconds * 1000;
  running = true;
  intervalId = setInterval(() => {
    const msLeft = endTime - Date.now();
    remainingSeconds = Math.max(0, Math.round(msLeft / 1000));
    updateDisplay();
    if (msLeft <= 0) {
      switchSession();
    }
  }, 400);
  updateDisplay();
}

function pausePomodoro() {
  if (!running) return;
  const msLeft = endTime - Date.now();
  remainingSeconds = Math.max(0, Math.round(msLeft / 1000));
  clearInterval(intervalId);
  intervalId = null;
  running = false;
  updateDisplay();
}

function resetPomodoro() {
  clearInterval(intervalId);
  intervalId = null;
  running = false;
  sanitizeDurations();
  currentMode = 'work';
  remainingSeconds = workMinutes * 60;
  sessionCount = 0;
  updateDisplay();
}

function switchSession() {
  clearInterval(intervalId);
  intervalId = null;
  running = false;
  if (currentMode === 'work') {
    sessionCount += 1;
    currentMode = 'break';
    remainingSeconds = breakMinutes * 60;
  } else {
    currentMode = 'work';
    remainingSeconds = workMinutes * 60;
  }
  notifyComplete();
  updateDisplay();
  startPomodoro();
}

function applyPreset(work, rest) {
  workInput.value = work;
  breakInput.value = rest;
  resetPomodoro();
}

function playBeep() {
  if (soundToggle && !soundToggle.checked) return;
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = 750;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.8);
}

function notifyComplete() {
  playBeep();
  if (vibrateToggle?.checked && navigator.vibrate) {
    navigator.vibrate([180, 90, 180]);
  }
}

updateDisplay();

startPomBtn.addEventListener('click', startPomodoro);
pausePomBtn.addEventListener('click', pausePomodoro);
resetPomBtn.addEventListener('click', resetPomodoro);

['input', 'change'].forEach(evt => {
  workInput.addEventListener(evt, () => {
    sanitizeDurations();
    if (!running && currentMode === 'work') {
      remainingSeconds = workMinutes * 60;
      updateDisplay();
    }
  });
  breakInput.addEventListener(evt, () => {
    sanitizeDurations();
    if (!running && currentMode === 'break') {
      remainingSeconds = breakMinutes * 60;
      updateDisplay();
    }
  });
});

document.querySelectorAll('.pom-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    const work = Number(btn.dataset.work);
    const rest = Number(btn.dataset.break);
    applyPreset(work, rest);
  });
});

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
