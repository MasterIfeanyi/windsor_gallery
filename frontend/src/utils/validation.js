import { MIN_YEAR } from '../constants/upload.js'

// Returns '' if the year is fine, otherwise a message.
// An empty year is fine, because the year is optional.
export const getYearError = (value) => {
  const year = value.trim()
  if (year === '') return ''

  const currentYear = new Date().getFullYear()
  const isValid =
    /^\d{4}$/.test(year) && Number(year) >= MIN_YEAR && Number(year) <= currentYear

  return isValid ? '' : `Enter a year between ${MIN_YEAR} and ${currentYear}.`
}
