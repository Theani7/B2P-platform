export function getErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    "An unexpected error occurred"
  );
}