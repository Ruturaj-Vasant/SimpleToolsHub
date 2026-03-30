function toNumber(value) {
  return parseFloat(value) || 0;
}

function loadParams() {
  const params = new URLSearchParams(window.location.search);
  const setVal = (id, key) => {
    const v = params.get(key);
    if (v !== null && v !== '') {
      document.getElementById(id).value = v;
    }
  };
  setVal('percent-of', 'po');
  setVal('percent-base', 'pb');
  setVal('percent-part', 'pp');
  setVal('percent-whole', 'pw');
  setVal('percent-original', 'porig');
  setVal('percent-new', 'pnew');
  setVal('grade-earned', 'ge');
  setVal('grade-total', 'gt');
}

function updateParams() {
  const params = new URLSearchParams(window.location.search);
  params.set('po', document.getElementById('percent-of').value || 0);
  params.set('pb', document.getElementById('percent-base').value || 0);
  params.set('pp', document.getElementById('percent-part').value || 0);
  params.set('pw', document.getElementById('percent-whole').value || 0);
  params.set('porig', document.getElementById('percent-original').value || 0);
  params.set('pnew', document.getElementById('percent-new').value || 0);
  params.set('ge', document.getElementById('grade-earned').value || 0);
  params.set('gt', document.getElementById('grade-total').value || 0);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

function calcPercentOf() {
  const percent = toNumber(document.getElementById('percent-of').value);
  const base = toNumber(document.getElementById('percent-base').value);
  const result = (percent / 100) * base;
  document.getElementById('percent-of-result').textContent = result.toFixed(2);
}

function calcWhatPercent() {
  const part = toNumber(document.getElementById('percent-part').value);
  const whole = toNumber(document.getElementById('percent-whole').value);
  const result = whole === 0 ? 0 : (part / whole) * 100;
  document.getElementById('what-percent-result').textContent = `${result.toFixed(2)}%`;
}

function calcChange() {
  const original = toNumber(document.getElementById('percent-original').value);
  const newer = toNumber(document.getElementById('percent-new').value);
  if (original === 0) {
    document.getElementById('change-result').textContent = newer === 0 ? '0% change' : 'N/A (original is 0)';
    return;
  }
  const diff = ((newer - original) / original) * 100;
  const direction = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'no change';
  const symbol = diff > 0 ? '+' : '';
  document.getElementById('change-result').textContent = `${symbol}${diff.toFixed(2)}% ${direction}`;
}

function calcGrade() {
  const earned = toNumber(document.getElementById('grade-earned').value);
  const total = toNumber(document.getElementById('grade-total').value);
  const result = total === 0 ? 0 : (earned / total) * 100;
  document.getElementById('grade-result').textContent = `${result.toFixed(2)}%`;
}

function recalcAll() {
  calcPercentOf();
  calcWhatPercent();
  calcChange();
  calcGrade();
  updateParams();
}

async function copyResults() {
  const text = [
    `X% of Y: ${document.getElementById('percent-of-result').textContent}`,
    `X is what percent of Y: ${document.getElementById('what-percent-result').textContent}`,
    `Percent change: ${document.getElementById('change-result').textContent}`,
    `Grade percent: ${document.getElementById('grade-result').textContent}`,
  ].join('\\n');
  const btn = document.getElementById('copy-percent-results');
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
    if (window.trackEvent) {
      window.trackEvent('percentage_copy_results');
    }
  } catch (err) {
    btn.textContent = 'Copy not available';
  }
  setTimeout(() => (btn.textContent = 'Copy results'), 1400);
}

document.getElementById('calc-percent-of').addEventListener('click', () => {
  recalcAll();
  if (window.trackEvent) {
    window.trackEvent('percentage_calculate', { type: 'percent_of' });
  }
});
document.getElementById('calc-what-percent').addEventListener('click', () => {
  recalcAll();
  if (window.trackEvent) {
    window.trackEvent('percentage_calculate', { type: 'what_percent' });
  }
});
document.getElementById('calc-change').addEventListener('click', () => {
  recalcAll();
  if (window.trackEvent) {
    window.trackEvent('percentage_calculate', { type: 'percent_change' });
  }
});
document.getElementById('calc-grade').addEventListener('click', () => {
  recalcAll();
  if (window.trackEvent) {
    window.trackEvent('percentage_calculate', { type: 'grade' });
  }
});
document.getElementById('copy-percent-results').addEventListener('click', copyResults);

['percent-of', 'percent-base', 'percent-part', 'percent-whole', 'percent-original', 'percent-new', 'grade-earned', 'grade-total'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', recalcAll);
});

loadParams();
recalcAll();
