import { z } from "zod"

export type Flatten<T> = T extends any[] ? T[number] : T;

export const treeSchema = z.array(
 z.object({
   type: z.literal("link"),
   link: z.string().url(),
   text: z.string(),
 }).or(
   z.object(
   {
     type: z.literal("header"),
     text: z.string()
   }
   )
 )
);
export type TreeSchema= z.infer<typeof treeSchema>;

export const linkValidString = z
  .string()
  .min(4, "Link must be above 4 characters")
  .max(20, "link length must be below 20 characters")
  .nonempty("link must not be empty")
  .regex(
    new RegExp("^[a-zA-Z0-9]+$"),
    "link must contain only letters and numbers, no special signs"
  );

