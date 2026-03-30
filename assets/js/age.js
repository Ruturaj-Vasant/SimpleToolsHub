const dobInput = document.getElementById('dob');
const currentInput = document.getElementById('current-date');
const ageResult = document.getElementById('age-result');
const birthdayResult = document.getElementById('birthday-result');
const calcAgeBtn = document.getElementById('calc-age');
const resetAgeBtn = document.getElementById('reset-age');

function toDate(value) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function formatISO(date) {
  return date.toISOString().split('T')[0];
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function calculateAge(source) {
  const birthDate = toDate(dobInput.value);
  const currentDate = toDate(currentInput.value) || new Date();
  if (!birthDate || isNaN(birthDate.getTime())) {
    ageResult.textContent = 'Enter a valid birth date';
    birthdayResult.textContent = '';
    if (source && window.trackEvent) {
      window.trackEvent('age_calculate', { source, valid: false });
    }
    return;
  }
  if (birthDate > currentDate) {
    ageResult.textContent = 'Birth date is in the future';
    birthdayResult.textContent = '';
    if (source && window.trackEvent) {
      window.trackEvent('age_calculate', { source, valid: false });
    }
    return;
  }
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let months = currentDate.getMonth() - birthDate.getMonth();
  let days = currentDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthIndex = (currentDate.getMonth() + 11) % 12;
    const prevMonthYear = prevMonthIndex === 11 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    days += daysInMonth(prevMonthYear, prevMonthIndex);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  ageResult.textContent = `${years}y ${months}m ${days}d`;

  let nextBirthdayYear = currentDate.getFullYear();
  let nextBirthday = new Date(nextBirthdayYear, birthDate.getMonth(), birthDate.getDate());
  if (isNaN(nextBirthday.getTime())) {
    nextBirthday = new Date(nextBirthdayYear, birthDate.getMonth() + 1, 0);
  }
  if (nextBirthday < currentDate || formatISO(nextBirthday) === formatISO(currentDate)) {
    nextBirthdayYear += 1;
    nextBirthday = new Date(nextBirthdayYear, birthDate.getMonth(), birthDate.getDate());
    if (isNaN(nextBirthday.getTime())) {
      nextBirthday = new Date(nextBirthdayYear, birthDate.getMonth() + 1, 0);
    }
  }
  const diffMs = nextBirthday - currentDate;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  birthdayResult.textContent = `${diffDays} day(s) until next birthday (${formatISO(nextBirthday)})`;
  if (source && window.trackEvent) {
    window.trackEvent('age_calculate', { source, valid: true });
  }
}

function resetAge() {
  dobInput.value = '';
  currentInput.value = formatISO(new Date());
  ageResult.textContent = '0 years';
  birthdayResult.textContent = 'Enter a birth date to see the countdown.';
}

resetAge();

calcAgeBtn.addEventListener('click', () => calculateAge('button'));
resetAgeBtn.addEventListener('click', () => {
  resetAge();
  if (window.trackEvent) {
    window.trackEvent('age_reset');
  }
});
dobInput.addEventListener('change', () => calculateAge('input'));
currentInput.addEventListener('change', () => calculateAge('input'));
