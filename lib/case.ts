export const toCamelCase = <T>(obj: T): T => {
  const convert = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(convert);
    if (value instanceof Date) return value;
    if (value !== null && typeof value === "object") {
      return Object.entries(value).reduce<Record<string, unknown>>(
        (acc, [key, nestedValue]) => {
          const camelKey = key.replace(/_([a-z])/g, (_, letter: string) =>
            letter.toUpperCase(),
          );
          acc[camelKey] = convert(nestedValue);
          return acc;
        },
        {},
      );
    }
    return value;
  };

  return convert(obj) as T;
};
