export const fieldErrorMessage = (errors: unknown[]) => {
  if (!errors.length) return undefined;

  return errors
    .map((error) => {
      if (typeof error === "string") return error;
      if (error && typeof error === "object" && "message" in error) {
        return String((error as { message: unknown }).message);
      }
      return undefined;
    })
    .filter(Boolean)
    .join(", ");
};
