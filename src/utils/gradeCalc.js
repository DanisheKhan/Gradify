// Standard grading scale
export const DEFAULT_GRADING_SCALE = [
  { min: 90, max: 100, grade: 'A+', label: 'grades.outstanding' },
  { min: 75, max: 89, grade: 'A', label: 'grades.excellent' },
  { min: 60, max: 74, grade: 'B', label: 'grades.good' },
  { min: 45, max: 59, grade: 'C', label: 'grades.average' },
  { min: 35, max: 44, grade: 'D', label: 'grades.satisfactory' },
  { min: 0, max: 34, grade: 'F', label: 'grades.fail' }
];

/**
 * Calculates grade based on obtained marks and maximum marks.
 */
export const calculateGrade = (obtained, max, gradingScale = DEFAULT_GRADING_SCALE) => {
  if (max <= 0) return 'F';
  const percentage = (obtained / max) * 100;
  
  const match = gradingScale.find(
    (range) => percentage >= range.min && percentage <= range.max
  );
  
  return match ? match.grade : 'F';
};

/**
 * Calculates overall exam results for a list of marks and subjects.
 * @param {Array} marksList - Array of mark objects (with subject_id, marks_obtained)
 * @param {Array} subjectsList - Array of subject definitions (with id, max_marks, pass_marks)
 * @returns {Object} { totalObtained, totalMax, percentage, grade, status }
 */
export const calculateResultSummary = (marksList = [], subjectsList = [], compartmentThreshold = 1) => {
  let totalObtained = 0;
  let totalMax = 0;
  let failedSubjectsCount = 0;
  
  marksList.forEach((mark) => {
    const subject = subjectsList.find((s) => s.id === mark.subject_id);
    if (subject) {
      const obtained = Number(mark.marks_obtained) || 0;
      totalObtained += obtained;
      totalMax += subject.max_marks;
      
      if (obtained < subject.pass_marks) {
        failedSubjectsCount++;
      }
    }
  });

  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  
  // Decide grade based on overall percentage
  const grade = calculateGrade(totalObtained, totalMax);
  
  let status = 'PASS';
  if (failedSubjectsCount > 0) {
    if (failedSubjectsCount <= compartmentThreshold) {
      status = 'COMPARTMENT';
    } else {
      status = 'FAIL';
    }
  }

  return {
    totalObtained,
    totalMax,
    percentage: parseFloat(percentage.toFixed(2)),
    grade,
    status,
    failedSubjectsCount
  };
};
