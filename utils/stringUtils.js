/**
 * Capitalizes the first letter of every word in a string.
 * Example: "men's fashion" → "Men's Fashion"
 */
const capitalizeWords = (str) =>
    str
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())

// "men's fashion" → "MEN'S FASHION"
const toUpperCase = (str) => str.trim().toUpperCase();

module.exports = {
    capitalizeWords,
    toUpperCase,
}
