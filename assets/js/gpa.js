const coursesBody = document.getElementById('courses-body');
const addCourseBtn = document.getElementById('add-course');
const calcBtn = document.getElementById('calculate-gpa');
const resetBtn = document.getElementById('reset-courses');
const gpaOutput = document.getElementById('gpa-output');
const STORAGE_KEY = 'gpaCourses';

const gradeScale = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D': 1.0,
  'F': 0.0,
};

function createCourseRow(course = '', credits = 3, grade = 'A') {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="Course name" value="${course}"></td>
    <td><input type="number" min="0" step="0.5" value="${credits}"></td>
    <td>
      <select>${Object.keys(gradeScale).map(key => `<option value="${key}" ${key === grade ? 'selected' : ''}>${key}</option>`).join('')}</select>
    </td>
    <td><button class="btn ghost remove-row">Remove</button></td>
  `;
  coursesBody.appendChild(tr);
  tr.querySelector('.remove-row').addEventListener('click', () => removeRow(tr));
  tr.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', calculateGPA);
    el.addEventListener('change', calculateGPA);
  });
}

function removeRow(row) {
  if (coursesBody.children.length <= 1) return;
  coursesBody.removeChild(row);
  calculateGPA();
}

function calculateGPA() {
  let totalCredits = 0;
  let totalPoints = 0;
  const snapshot = [];
  Array.from(coursesBody.children).forEach(row => {
    const inputs = row.querySelectorAll('input, select');
    const credits = parseFloat(inputs[1].value) || 0;
    const grade = inputs[2].value;
    snapshot.push({
      course: inputs[0].value || '',
      credits,
      grade,
    });
    totalCredits += credits;
    totalPoints += credits * (gradeScale[grade] ?? 0);
  });
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  gpaOutput.textContent = gpa.toFixed(2);
  saveCourses(snapshot);
}

function resetCourses() {
  coursesBody.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    createCourseRow('', 3, 'A');
  }
  gpaOutput.textContent = '0.00';
  saveCourses([]);
}

function saveCourses(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    // ignore storage errors
  }
}

function loadCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      resetCourses();
      return;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) {
      resetCourses();
      return;
    }
    coursesBody.innerHTML = '';
    parsed.forEach(item => {
      createCourseRow(item.course || '', item.credits ?? 3, item.grade || 'A');
    });
    calculateGPA();
  } catch (err) {
    resetCourses();
  }
}

addCourseBtn.addEventListener('click', () => {
  createCourseRow('', 3, 'A');
  calculateGPA();
  if (window.trackEvent) {
    window.trackEvent('gpa_add_course', { courses_count: coursesBody.children.length });
  }
});
calcBtn.addEventListener('click', () => {
  calculateGPA();
  if (window.trackEvent) {
    window.trackEvent('gpa_calculate', { courses_count: coursesBody.children.length });
  }
});
resetBtn.addEventListener('click', () => {
  resetCourses();
  if (window.trackEvent) {
    window.trackEvent('gpa_reset');
  }
});

loadCourses();
