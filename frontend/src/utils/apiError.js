// just pull the error message from an axios error response
export function apiErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || fallback
}
