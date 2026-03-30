const displayEl = document.getElementById('timer-display');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const progressEl = document.getElementById('timer-progress');
const soundToggle = document.getElementById('sound-toggle');
const vibrateToggle = document.getElementById('vibrate-toggle');
let totalSeconds = 300;
let remainingSeconds = totalSeconds;
let timerInterval = null;
let audioCtx;
let endTime = null;

function loadFromParams() {
  const params = new URLSearchParams(window.location.search);
  const h = parseInt(params.get('h'), 10);
  const m = parseInt(params.get('m'), 10);
  const s = parseInt(params.get('s'), 10);
  if (!Number.isNaN(h)) hoursEl.value = h;
  if (!Number.isNaN(m)) minutesEl.value = m;
  if (!Number.isNaN(s)) secondsEl.value = s;
}

function updateURLFromInputs() {
  const params = new URLSearchParams(window.location.search);
  params.set('h', hoursEl.value || 0);
  params.set('m', minutesEl.value || 0);
  params.set('s', secondsEl.value || 0);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

function formatTime(total) {
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const parts = [hrs, mins, secs].map(v => String(v).padStart(2, '0'));
  return parts.join(':');
}

function sanitizeInputs() {
  let h = Math.max(0, parseInt(hoursEl.value, 10) || 0);
  let m = Math.max(0, parseInt(minutesEl.value, 10) || 0);
  let s = Math.max(0, parseInt(secondsEl.value, 10) || 0);
  const total = Math.max(0, h * 3600 + m * 60 + s);
  h = Math.floor(total / 3600);
  m = Math.floor((total % 3600) / 60);
  s = total % 60;
  hoursEl.value = h;
  minutesEl.value = m;
  secondsEl.value = s;
  return total;
}

function updateDisplay() {
  displayEl.textContent = formatTime(Math.max(0, remainingSeconds));
  if (totalSeconds > 0) {
    const percent = 100 - (remainingSeconds / totalSeconds) * 100;
    progressEl.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  } else {
    progressEl.style.width = '0%';
  }
}

function resetTimerValues() {
  totalSeconds = sanitizeInputs();
  remainingSeconds = totalSeconds;
  endTime = null;
  updateDisplay();
  updateURLFromInputs();
}

function startTimer() {
  if (timerInterval) return;
  if (remainingSeconds <= 0) {
    resetTimerValues();
  }
  if (totalSeconds <= 0) return;
  if (window.trackEvent) {
    window.trackEvent('timer_start', {
      total_seconds: totalSeconds,
      remaining_seconds: remainingSeconds,
    });
  }
  const now = Date.now();
  endTime = now + remainingSeconds * 1000;
  timerInterval = setInterval(() => {
    const msLeft = endTime - Date.now();
    remainingSeconds = Math.max(0, Math.round(msLeft / 1000));
    updateDisplay();
    if (msLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      notifyComplete();
    }
  }, 300);
}

function pauseTimer() {
  if (timerInterval) {
    const msLeft = endTime - Date.now();
    remainingSeconds = Math.max(0, Math.round(msLeft / 1000));
    clearInterval(timerInterval);
    timerInterval = null;
    if (window.trackEvent) {
      window.trackEvent('timer_pause', { remaining_seconds: remainingSeconds });
    }
  }
}

function resetTimer() {
  pauseTimer();
  resetTimerValues();
  if (window.trackEvent) {
    window.trackEvent('timer_reset', { total_seconds: totalSeconds });
  }
}

function applyPreset(minutes) {
  const total = minutes * 60;
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  hoursEl.value = hrs;
  minutesEl.value = mins;
  secondsEl.value = secs;
  resetTimer();
  if (window.trackEvent) {
    window.trackEvent('timer_preset', { preset_minutes: minutes });
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

function notifyComplete() {
  playBeep();
  if (vibrateToggle?.checked && navigator.vibrate) {
    navigator.vibrate([180, 90, 180]);
  }
}

function playBeep() {
  if (!soundToggle.checked) return;
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1);
}

loadFromParams();
resetTimerValues();

['change', 'blur'].forEach(evt => {
  hoursEl.addEventListener(evt, resetTimerValues);
  minutesEl.addEventListener(evt, resetTimerValues);
  secondsEl.addEventListener(evt, resetTimerValues);
});

document.getElementById('start-timer').addEventListener('click', startTimer);
document.getElementById('pause-timer').addEventListener('click', pauseTimer);
document.getElementById('reset-timer').addEventListener('click', resetTimer);

document.querySelectorAll('.preset').forEach(btn => {
  btn.addEventListener('click', () => {
    const mins = Number(btn.dataset.minutes || 0);
    applyPreset(mins);
  });
});

document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

document.addEventListener('fullscreenchange', () => {
  document.body.classList.toggle('fullscreen-mode', Boolean(document.fullscreenElement));
  if (window.trackEvent) {
    window.trackEvent('fullscreen_toggle', {
      tool: 'timer',
      state: document.fullscreenElement ? 'enter' : 'exit',
    });
  }
});
