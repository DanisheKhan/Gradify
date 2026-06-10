/**
 * Formats a ISO date string or Date object into a localized date.
 */
export const formatDate = (dateInput, locale = 'en') => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  
  // Set locale mapping for languages
  const localeMap = {
    en: 'en-US',
    hi: 'hi-IN',
    mr: 'mr-IN',
    ur: 'ur-PK'
  };

  const activeLocale = localeMap[locale] || 'en-US';
  return new Intl.DateTimeFormat(activeLocale, options).format(date);
};

/**
 * Validates and formats academic year format (e.g. 2024-25)
 */
export const formatAcademicYear = (year) => {
  if (!year) return '';
  return year.trim();
};
