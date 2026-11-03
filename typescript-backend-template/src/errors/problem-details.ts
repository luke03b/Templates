/**
 * Costruzione delle risposte di errore nel formato Problem Details (RFC 9457).
 * Un unico punto in cui si decide la forma del JSON di errore.
 */
import { STATUS_CODES } from 'node:http';
import type { FieldErrors } from './app-error.ts';

export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: FieldErrors;
}

export function createProblem(
  status: number,
  detail: string,
  options: { title?: string; errors?: FieldErrors } = {},
): ProblemDetails {
  const problem: ProblemDetails = {
    type: 'about:blank',
    // Con type "about:blank" la RFC raccomanda come title la frase standard dello status HTTP.
    title: options.title ?? STATUS_CODES[status] ?? 'Error',
    status,
    detail,
  };
  if (options.errors) problem.errors = options.errors;
  return problem;
}
