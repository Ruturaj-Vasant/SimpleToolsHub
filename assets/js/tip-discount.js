const billInput = document.getElementById('bill-amount');
const tipPercentInput = document.getElementById('tip-percent');
const splitInput = document.getElementById('split-count');
const tipAmountEl = document.getElementById('tip-amount');
const tipTotalEl = document.getElementById('tip-total');
const tipPerPersonEl = document.getElementById('tip-per-person');
const calcTipBtn = document.getElementById('calc-tip');

const originalPriceInput = document.getElementById('original-price');
const discountPercentInput = document.getElementById('discount-percent');
const savingsEl = document.getElementById('savings');
const finalPriceEl = document.getElementById('final-price');
const calcDiscountBtn = document.getElementById('calc-discount');

function money(value) {
  return `$${(Math.round(value * 100) / 100).toFixed(2)}`;
}

function calculateTip(source) {
  const bill = parseFloat(billInput.value) || 0;
  const tipPercent = parseFloat(tipPercentInput.value) || 0;
  const split = Math.max(1, parseInt(splitInput.value, 10) || 1);
  const tipAmount = bill * (tipPercent / 100);
  const total = bill + tipAmount;
  const perPerson = total / split;

  tipAmountEl.textContent = money(tipAmount);
  tipTotalEl.textContent = money(total);
  tipPerPersonEl.textContent = money(perPerson);
  if (source && window.trackEvent) {
    window.trackEvent('tip_calculate', {
      source,
      tip_percent: tipPercent,
      split_count: split,
    });
  }
}

function calculateDiscount(source) {
  const original = parseFloat(originalPriceInput.value) || 0;
  const discountPercent = parseFloat(discountPercentInput.value) || 0;
  const savings = original * (discountPercent / 100);
  const finalPrice = Math.max(0, original - savings);

  savingsEl.textContent = money(savings);
  finalPriceEl.textContent = money(finalPrice);
  if (source && window.trackEvent) {
    window.trackEvent('discount_calculate', {
      source,
      discount_percent: discountPercent,
    });
  }
}

calcTipBtn.addEventListener('click', () => calculateTip('button'));
calcDiscountBtn.addEventListener('click', () => calculateDiscount('button'));

document.querySelectorAll('.tip-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    tipPercentInput.value = btn.dataset.tip;
    calculateTip('preset');
  });
});

billInput.addEventListener('input', () => calculateTip());
tipPercentInput.addEventListener('input', () => calculateTip());
splitInput.addEventListener('input', () => calculateTip());
originalPriceInput.addEventListener('input', () => calculateDiscount());
discountPercentInput.addEventListener('input', () => calculateDiscount());

calculateTip();
calculateDiscount();
