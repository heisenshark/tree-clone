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

export interface treeStyles{
  textColor:string | undefined;
  backgroundColor:string | undefined;
  customBgAnimation: string | undefined;
  gradient: {
    from:string;
    to:string;
  } | undefined;
  fontFamily:string | undefined;
  buttonStyle:{
    roundness: "none"|"medium"|"full";
    shadow: "none"|"soft"|"hard";
    outline: boolean;
    textColor:string;
    shadowColor: string;
    buttonColor: string;
    specialStyle: "none";
  } | undefined;
}

export const treeStylesSchema = z.object({
  textColor: z.string().max(7).startsWith("#").optional(),
  backgroundColor: z.string().max(7).startsWith("#").optional(),
  customBgAnimation: z.string().optional(),
  gradient: z.object({
    from: z.string().max(7).startsWith("#"),
    to: z.string().max(7).startsWith("#")
  }).optional(),
  fontFamily: z.string().optional(),
  buttonStyle: z.object({
    roundness: z.union([z.literal("none"), z.literal("medium"), z.literal("full")]),
    shadow: z.union([z.literal("none"), z.literal("soft"), z.literal("hard")]),
    outline: z.boolean(),
    textColor: z.string().max(7).startsWith("#"),
    shadowColor: z.string().max(7).startsWith("#"),
    buttonColor: z.string().max(7).startsWith("#"),
    specialStyle: z.literal("none").optional()
  }).optional()
})

export type TreeStylesSchema= z.infer<typeof treeStylesSchema>;

export const colorHexSchema = z.string().regex( /^#[A-F0-9]{6}$/).or(z.string().regex( /^#[A-F0-9]{3}$/)).or(z.string().regex( /^#[A-F0-9]{8}$/)).or(z.string().regex( /^#[A-F0-9]{4}$/));