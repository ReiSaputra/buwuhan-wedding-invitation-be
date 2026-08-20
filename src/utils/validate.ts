import type z from "zod";

export function validate<T extends z.ZodSchema>(data: z.input<T>, schema: T): z.output<T> {
  return schema.parse(data);
}
