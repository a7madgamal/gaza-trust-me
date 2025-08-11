/**
 * Asserts that a value is not null
 * This function narrows the type from T | null to T
 */
export function assertNotNull<T>(value: T | null, message?: string): asserts value is T {
  if (value === null) {
    throw new Error(message || `Expected value to not be null, but got null`);
  }
}

/**
 * Asserts that a value is not undefined
 * This function narrows the type from T | undefined to T
 */
export function assertNotUndefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error('value is undefined');
  }
}

/**
 * Asserts that a string is not empty
 * This function narrows the type from string to non-empty string
 */
export function assertNotEmptyString<T>(value: T | ''): asserts value is T {
  if (value === '') {
    throw new Error('empty string');
  }
}
