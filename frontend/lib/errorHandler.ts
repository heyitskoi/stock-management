export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: ApiError): string {
  switch (error.status) {
    case 400:
      return error.details?.detail || 'Invalid request data'
    case 401:
      return 'Authentication required'
    case 403:
      return 'You do not have permission to perform this action'
    case 404:
      return 'Resource not found'
    case 422:
      return 'Validation error: ' + formatValidationErrors(error.details)
    case 500:
      return 'Server error. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred'
  }
}

function formatValidationErrors(details: any): string {
  if (details?.detail && Array.isArray(details.detail)) {
    return details.detail
      .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
      .join(', ')
  }
  return 'Invalid data provided'
}
