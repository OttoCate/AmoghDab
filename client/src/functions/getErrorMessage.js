export const getErrorMessage = (error) => {
  let message

  if (error instanceof Error) {
    // If 'error' is an instance of Error, use its message property.
    message = error.response?.data?.msg
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    // If 'error' is an object with a 'response' property, attempt to extract a 'msg' property from 'response.data'.
    message = String(
      error.response?.data?.msg || error?.msg || 'Có gì đó không ổn'
    )
  } else if (typeof error === 'string') {
    // If 'error' is a string, use it as is.
    message = error
  } else {
    // If 'error' doesn't match any of the above cases, use a default message.
    message = 'Có gì đó không ổn'
  }

  return message
}
