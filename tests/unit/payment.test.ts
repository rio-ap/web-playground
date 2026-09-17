import { describe, it, expect } from 'vitest';
import { detectCardBrand, formatCardNumber, formatExpiry, isCardNumberComplete } from '../../src/payment';

describe('detectCardBrand', () => {
  it('detects visa numbers', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa');
    expect(detectCardBrand('4242 4242 4242 4242')).toBe('visa');
  });

  it('detects mastercard numbers across both ranges', () => {
    expect(detectCardBrand('5100000000000000')).toBe('mastercard');
    expect(detectCardBrand('5500000000000004')).toBe('mastercard');
    expect(detectCardBrand('2221000000000009')).toBe('mastercard');
    expect(detectCardBrand('2720999999999999')).toBe('mastercard');
  });

  it('detects amex numbers', () => {
    expect(detectCardBrand('378282246310005')).toBe('amex');
    expect(detectCardBrand('340000000000009')).toBe('amex');
  });

  it('returns null for unknown or incomplete numbers', () => {
    expect(detectCardBrand('6011000000000004')).toBeNull();
    expect(detectCardBrand('2721000000000000')).toBeNull();
    expect(detectCardBrand('')).toBeNull();
    expect(detectCardBrand(undefined)).toBeNull();
    expect(detectCardBrand('not a card')).toBeNull();
  });
});

describe('formatCardNumber', () => {
  it('groups digits in fours for non-amex cards', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('4242 4242 4242 4242')).toBe('4242 4242 4242 4242');
  });

  it('groups amex digits as 4-6-5', () => {
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
  });

  it('formats partial numbers as they are typed', () => {
    expect(formatCardNumber('424242')).toBe('4242 42');
    expect(formatCardNumber('378282')).toBe('3782 82');
  });

  it('strips non-digit characters', () => {
    expect(formatCardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
  });

  it('caps the number at its expected length', () => {
    expect(formatCardNumber('41111111111111119999')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('378282246310005999')).toBe('3782 822463 10005');
  });

  it('returns an empty string when there are no digits', () => {
    expect(formatCardNumber('')).toBe('');
    expect(formatCardNumber('abcd')).toBe('');
  });
});

describe('formatExpiry', () => {
  it('inserts a slash after two digits', () => {
    expect(formatExpiry('1228')).toBe('12/28');
    expect(formatExpiry('123')).toBe('12/3');
  });

  it('keeps an already formatted value unchanged', () => {
    expect(formatExpiry('12/28')).toBe('12/28');
  });

  it('leaves values shorter than three digits untouched', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('12')).toBe('12');
  });

  it('strips non-digits', () => {
    expect(formatExpiry('ab12cd28')).toBe('12/28');
  });

  it('takes the last two digits of a pasted four-digit year', () => {
    expect(formatExpiry('12/2028')).toBe('12/28');
    expect(formatExpiry('122028')).toBe('12/28');
    expect(formatExpiry('122899')).toBe('12/99');
  });

  it('returns an empty string for an empty value', () => {
    expect(formatExpiry('')).toBe('');
  });
});

describe('isCardNumberComplete', () => {
  it('is complete at 16 digits for non-amex cards', () => {
    expect(isCardNumberComplete('4111111111111111', 'visa')).toBe(true);
    expect(isCardNumberComplete('411111111111111', 'visa')).toBe(false);
  });

  it('is complete at 15 digits for amex cards', () => {
    expect(isCardNumberComplete('378282246310005', 'amex')).toBe(true);
    expect(isCardNumberComplete('3782822463100055', 'amex')).toBe(false);
  });

  it('ignores spaces when counting digits', () => {
    expect(isCardNumberComplete('4242 4242 4242 4242', 'visa')).toBe(true);
  });

  it('falls back to 16 digits when the brand is unknown', () => {
    expect(isCardNumberComplete('4242424242424242', null)).toBe(true);
    expect(isCardNumberComplete('378282246310005', null)).toBe(false);
  });
});
