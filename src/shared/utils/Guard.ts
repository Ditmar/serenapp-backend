export const Guard = {
  againstNullOrUndefined<T>(value: T, name: string) {
    if (value === null || value === undefined) {
      throw new Error(`${name} is required`);
    }
    return value;
  }
};
