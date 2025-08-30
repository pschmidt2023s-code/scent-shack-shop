// IBAN validator utility
// Based on the IBAN check digit algorithm

/**
 * Validates an IBAN (International Bank Account Number)
 * @param iban - The IBAN to validate
 * @returns boolean - true if valid, false otherwise
 */
export function isValidIBAN(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Check if IBAN has the correct length (15-34 characters)
  if (cleanIban.length < 15 || cleanIban.length > 34) {
    return false;
  }
  
  // Check if IBAN starts with two letters followed by two digits
  if (!/^[A-Z]{2}\d{2}/.test(cleanIban)) {
    return false;
  }
  
  // Rearrange: move the first 4 characters to the end
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
  
  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (const char of rearranged) {
    if (/[A-Z]/.test(char)) {
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }
  
  // Calculate mod 97
  return mod97(numericString) === 1;
}

/**
 * Calculate modulo 97 for large numbers represented as strings
 * @param numericString - The numeric string to calculate mod 97 for
 * @returns number - The result of the modulo operation
 */
function mod97(numericString: string): number {
  let remainder = '';
  
  for (let i = 0; i < numericString.length; i++) {
    remainder += numericString[i];
    
    // Process when we have enough digits
    if (remainder.length >= 9) {
      remainder = (parseInt(remainder) % 97).toString();
    }
  }
  
  return parseInt(remainder) % 97;
}

/**
 * Formats an IBAN with spaces for better readability
 * @param iban - The IBAN to format
 * @returns string - The formatted IBAN
 */
export function formatIBAN(iban: string): string {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  return cleanIban.replace(/(.{4})/g, '$1 ').trim();
}