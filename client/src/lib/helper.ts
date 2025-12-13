/* eslint-disable @typescript-eslint/no-explicit-any */
export function validationWrapper<T>(
  validator: (value: any) => T,
  value: any,
  errors: string[]
): T | undefined {
  try {
    return validator(value);
  } catch (err) {
    if (err instanceof Error) {
      errors.push(err.message);
    } else {
      errors.push("Unknown Error in form input!");
    }
    return undefined;
  }
}
