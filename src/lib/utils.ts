/**
 * @module lib/utils
 *
 * Shared utility functions used across the application. Provides the `cn`
 * helper that merges Tailwind CSS class names with conflict resolution,
 * enabling conditional and composable styling.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class name values into a single string with Tailwind CSS
 * conflict resolution. Combines clsx (conditional classes) with tailwind-merge
 * (last-wins deduplication of conflicting utilities).
 *
 * @param inputs - Any number of class values (strings, arrays, objects, or falsy).
 * @returns A deduplicated, conflict-resolved class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
