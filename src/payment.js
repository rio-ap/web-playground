function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function detectCardBrand(number) {
  const digits = onlyDigits(number);
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return 'mastercard';
  return null;
}

export function formatCardNumber(number) {
  const digits = onlyDigits(number);
  if (!digits) return '';

  const amex = detectCardBrand(digits) === 'amex';
  const groups = amex ? [4, 6, 5] : [4, 4, 4, 4];
  const capped = digits.slice(0, groups.reduce((total, size) => total + size, 0));

  const parts = [];
  let index = 0;
  for (const size of groups) {
    if (index >= capped.length) break;
    parts.push(capped.slice(index, index + size));
    index += size;
  }
  return parts.join(' ');
}

export function formatExpiry(input) {
  const digits = onlyDigits(input).slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isCardNumberComplete(number, brand) {
  const digits = onlyDigits(number);
  const expected = brand === 'amex' ? 15 : 16;
  return digits.length === expected;
}
