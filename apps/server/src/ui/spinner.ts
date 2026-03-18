/**
 * Spinner utilities for the Fizzy MCP CLI.
 *
 * Provides a consistent loading spinner experience with Fizzy branding.
 * Uses fun spinner animations that match the Fizzy aesthetic.
 */

import ora, { type Ora, type Spinner } from 'ora';
import { colors } from './branding.js';

/**
 * Custom Fizzy spinner frames - bubbly and playful
 */
const FIZZY_SPINNER: Spinner = {
  interval: 80,
  frames: ['◐', '◓', '◑', '◒'],
};

/**
 * Alternative spinner styles
 */
const SPINNERS: Record<string, Spinner | string> = {
  fizzy: FIZZY_SPINNER,
  dots: 'dots',
  bubbles: {
    interval: 120,
    frames: ['○', '◔', '◑', '◕', '●', '◕', '◑', '◔'],
  },
  bounce: {
    interval: 100,
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  },
  sparkle: {
    interval: 100,
    frames: ['✦', '✧', '✦', '✧', '⋆', '✧', '✦', '✧'],
  },
};

/**
 * Creates a new spinner with Fizzy branding.
 *
 * @param text - Initial spinner text
 * @param spinnerStyle - Optional spinner style to use
 * @returns Ora spinner instance
 *
 * @example
 * ```typescript
 * const spinner = createSpinner('Validating token...');
 * spinner.start();
 * // ... do work
 * spinner.succeed('Token validated');
 * ```
 */
export function createSpinner(text: string, spinnerStyle = 'fizzy'): Ora {
  const spinner = SPINNERS[spinnerStyle] ?? FIZZY_SPINNER;
  return ora({
    text,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spinner: spinner as any,
    color: 'cyan',
  });
}

/**
 * Runs an async operation with a loading spinner.
 *
 * @param text - Text to show while loading
 * @param operation - Async operation to run
 * @param options - Optional success/failure messages
 * @returns The result of the operation
 *
 * @example
 * ```typescript
 * const result = await withSpinner(
 *   'Fetching account...',
 *   () => client.account.getSettings(),
 *   { success: 'Account loaded', failure: 'Failed to load account' }
 * );
 * ```
 */
export async function withSpinner<T>(
  text: string,
  operation: () => Promise<T>,
  options?: {
    success?: string | ((result: T) => string);
    failure?: string | ((error: Error) => string);
    spinnerStyle?: string;
  },
): Promise<T> {
  const spinner = createSpinner(text, options?.spinnerStyle);
  spinner.start();

  try {
    const result = await operation();
    const successText =
      typeof options?.success === 'function' ? options.success(result) : options?.success;
    if (successText) {
      spinner.succeed(colors.success(successText));
    } else {
      spinner.stop();
    }
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const failureText =
      typeof options?.failure === 'function' ? options.failure(err) : options?.failure;
    spinner.fail(colors.error(failureText || err.message));
    throw error;
  }
}

/**
 * Shows a quick success message without a spinner.
 */
export function showSuccess(text: string): void {
  const spinner = createSpinner(text);
  spinner.succeed(colors.success(text));
}

/**
 * Shows a quick failure message without a spinner.
 */
export function showFailure(text: string): void {
  const spinner = createSpinner(text);
  spinner.fail(colors.error(text));
}

/**
 * Shows a quick info message without a spinner.
 */
export function showInfo(text: string): void {
  const spinner = createSpinner(text);
  spinner.info(colors.primary(text));
}

/**
 * Shows a quick warning message without a spinner.
 */
export function showWarning(text: string): void {
  const spinner = createSpinner(text);
  spinner.warn(colors.warning(text));
}
