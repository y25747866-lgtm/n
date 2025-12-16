
'use server';

import { genkit, type GenkitErrorCode, type GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

function isGenkitError(error: unknown): error is GenkitError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '__isGenkitError' in error &&
    error.__isGenkitError === true
  );
}

function getErrorMessage(error: unknown): {
  message: string;
  code?: GenkitErrorCode;
  details?: unknown;
} {
  if (isGenkitError(error)) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    };
  } else if (error instanceof Error) {
    return { message: error.message };
  } else {
    return { message: String(error) };
  }
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
  // Intercept errors and enrich them before they are returned to the client
  errorInterceptor: (err, context, next) => {
    const errorInfo = getErrorMessage(err);
    if (errorInfo.code === 'aborted' || errorInfo.code === 'cancelled') {
      errorInfo.message =
        `The ${context.flow?.name} flow was aborted or cancelled. ` +
        'Please try again.';
    }

    if (errorInfo.code === 'resource-exhausted') {
      errorInfo.message =
        `The model is currently overloaded. Please try again later. ` +
        errorInfo.message;
    }

    // Pass an enriched error to the default error handler
    return next(
      new Error(errorInfo.message, {
        cause: err,
      })
    );
  },
});
