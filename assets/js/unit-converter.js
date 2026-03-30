const categorySelect = document.getElementById('category');
const fromUnitSelect = document.getElementById('from-unit');
const toUnitSelect = document.getElementById('to-unit');
const fromValueInput = document.getElementById('from-value');
const toValueInput = document.getElementById('to-value');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const copyBtn = document.getElementById('copy-conversion');

const conversionData = {
  length: {
    label: 'Length',
    units: {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      inch: 0.0254,
      foot: 0.3048,
      yard: 0.9144,
      mile: 1609.34,
    },
  },
  weight: {
    label: 'Weight',
    units: {
      kilogram: 1,
      gram: 0.001,
      pound: 0.453592,
      ounce: 0.0283495,
    },
  },
  volume: {
    label: 'Volume',
    units: {
      liter: 1,
      milliliter: 0.001,
      gallon: 3.78541,
      quart: 0.946353,
      cup: 0.24,
    },
  },
  temperature: {
    label: 'Temperature',
    units: {
      Celsius: 'Celsius',
      Fahrenheit: 'Fahrenheit',
      Kelvin: 'Kelvin',
    },
  },
};

function populateUnits(category) {
  const units = conversionData[category].units;
  fromUnitSelect.innerHTML = '';
  toUnitSelect.innerHTML = '';
  Object.keys(units).forEach(unit => {
    const optionFrom = document.createElement('option');
    optionFrom.value = unit;
    optionFrom.textContent = unit;
    fromUnitSelect.appendChild(optionFrom);

    const optionTo = document.createElement('option');
    optionTo.value = unit;
    optionTo.textContent = unit;
    toUnitSelect.appendChild(optionTo);
  });
  if (category === 'temperature') {
    fromUnitSelect.value = 'Celsius';
    toUnitSelect.value = 'Fahrenheit';
  } else {
    fromUnitSelect.selectedIndex = 0;
    toUnitSelect.selectedIndex = 1;
  }
}

function convert() {
  const category = categorySelect.value;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  const value = parseFloat(fromValueInput.value) || 0;

  let result = value;

  if (category === 'temperature') {
    const celsius = toCelsius(value, fromUnit);
    result = fromCelsius(celsius, toUnit);
  } else {
    const units = conversionData[category].units;
    const fromFactor = units[fromUnit];
    const toFactor = units[toUnit];
    const inBase = value * fromFactor;
    result = inBase / toFactor;
  }
  toValueInput.value = Number.isFinite(result) ? result.toFixed(4) : '0';
}

function toCelsius(value, unit) {
  switch (unit) {
    case 'Celsius':
      return value;
    case 'Fahrenheit':
      return (value - 32) * (5 / 9);
    case 'Kelvin':
      return value - 273.15;
    default:
      return value;
  }
}

function fromCelsius(value, unit) {
  switch (unit) {
    case 'Celsius':
      return value;
    case 'Fahrenheit':
      return value * (9 / 5) + 32;
    case 'Kelvin':
      return value + 273.15;
    default:
      return value;
  }
}

function swapUnits() {
  const temp = fromUnitSelect.value;
  fromUnitSelect.value = toUnitSelect.value;
  toUnitSelect.value = temp;
  convert();
}

categorySelect.addEventListener('change', () => {
  populateUnits(categorySelect.value);
  convert();
});

convertBtn.addEventListener('click', () => {
  convert();
  if (window.trackEvent) {
    window.trackEvent('unit_convert', {
      category: categorySelect.value,
      from_unit: fromUnitSelect.value,
      to_unit: toUnitSelect.value,
    });
  }
});
swapBtn.addEventListener('click', () => {
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  swapUnits();
  if (window.trackEvent) {
    window.trackEvent('unit_swap', { from_unit: fromUnit, to_unit: toUnit });
  }
});
fromValueInput.addEventListener('input', convert);
fromUnitSelect.addEventListener('change', convert);
toUnitSelect.addEventListener('change', convert);

async function copyConversion() {
  const text = `${fromValueInput.value || 0} ${fromUnitSelect.value} = ${toValueInput.value || 0} ${toUnitSelect.value}`;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    if (window.trackEvent) {
      window.trackEvent('unit_copy_result', {
        category: categorySelect.value,
        from_unit: fromUnitSelect.value,
        to_unit: toUnitSelect.value,
      });
    }
  } catch (err) {
    copyBtn.textContent = 'Copy not available';
  }
  setTimeout(() => (copyBtn.textContent = 'Copy result'), 1400);
}

copyBtn.addEventListener('click', copyConversion);

populateUnits('length');
convert();
