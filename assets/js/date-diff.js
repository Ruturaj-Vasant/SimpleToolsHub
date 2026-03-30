const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const inclusiveToggle = document.getElementById('inclusive-toggle');
const daysResult = document.getElementById('days-result');
const weeksResult = document.getElementById('weeks-result');
const monthsResult = document.getElementById('months-result');
const calcDiffBtn = document.getElementById('calc-diff');
const resetDiffBtn = document.getElementById('reset-diff');

function toDate(value) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function calcDifference(source) {
  let start = toDate(startDateInput.value);
  let end = toDate(endDateInput.value);
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
    daysResult.textContent = '0';
    weeksResult.textContent = '0';
    monthsResult.textContent = '0';
    if (source && window.trackEvent) {
      window.trackEvent('date_diff_calculate', { source, valid: false });
    }
    return;
  }
  if (end < start) {
    [start, end] = [end, start];
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  let diffDays = Math.round((end - start) / msPerDay);
  if (inclusiveToggle.checked) diffDays += 1;
  daysResult.textContent = diffDays;
  weeksResult.textContent = (diffDays / 7).toFixed(2);
  monthsResult.textContent = (diffDays / 30).toFixed(2);
  if (source && window.trackEvent) {
    window.trackEvent('date_diff_calculate', { source, valid: true, inclusive: inclusiveToggle.checked });
  }
}

function resetDiff() {
  const today = new Date();
  startDateInput.value = today.toISOString().split('T')[0];
  endDateInput.value = today.toISOString().split('T')[0];
  inclusiveToggle.checked = false;
  calcDifference();
}

calcDiffBtn.addEventListener('click', () => calcDifference('button'));
resetDiffBtn.addEventListener('click', () => {
  resetDiff();
  if (window.trackEvent) {
    window.trackEvent('date_diff_reset');
  }
});
startDateInput.addEventListener('change', () => calcDifference('input'));
endDateInput.addEventListener('change', () => calcDifference('input'));
inclusiveToggle.addEventListener('change', () => calcDifference('toggle'));

resetDiff();
