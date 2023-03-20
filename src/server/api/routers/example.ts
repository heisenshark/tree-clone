import { Prisma } from "@prisma/client"
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

const linkValidString = z
  .string()
  .min(4, "Link must be above 4 characters")
  .max(20, "link length must be below 20 characters")
  .nonempty()
  .regex(
    new RegExp("^[a-zA-Z0-9]+$"),
    "link must contain only letters and numbers, no special signs"
  );

const reservedNames = ["admin", "about", "", "index", "trpc", "auth"];
const treeRouter = createTRPCRouter({
  addOne: protectedProcedure
    .input(
      z.object({ link: linkValidString.and(z.string()), content: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("siema");
      if (reservedNames.includes(input.link))
        throw new TRPCError({
          message: "Tree name reserved",
          code: "BAD_REQUEST",
        });
      const xd = await ctx.prisma.tree.findFirst({
        where: {
          link: {
            equals: input.link,
          },
        },
      });
      if (xd)
        throw new TRPCError({
          message: "Tree name already taken",
          code: "BAD_REQUEST",
        });
      return ctx.prisma.tree.create({
        data: {
          link: input.link,
          content: input.content,
          userId: ctx.session.user.id,
        },
      });
    }),
  findOne: publicProcedure
    .input(z.object({ link: linkValidString }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.tree.findFirst({
        where: {
          link: {
            equals: input.link,
          },
        },
      });
      return res;
    }),
  getUserTrees: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.tree.findMany({
      where: {
        userId: {
          equals: ctx.session.user.id,
        },
      },
    });
  }),
  updateUserTree: protectedProcedure
    .input(
      z.object({ link: linkValidString.and(z.string()), newContent: z.string(), newLink:linkValidString.and(z.string()) })
    )
    .mutation(async ({ ctx, input }) => {
      const tree = await ctx.prisma.tree.findFirst({
        where: {
          link: {
            equals: input.link,
          },
        },
      });
      if (!tree) throw new TRPCError({ code:"BAD_REQUEST",message:"tree does not exist"});
      if (tree.userId!= ctx.session.user.id) throw new TRPCError({ code:"UNAUTHORIZED",message:"tree is not owned by current user"});
      
      if(input.newLink!=input.link && await findTree(input.newLink, ctx.prisma)) throw new TRPCError({ code:"BAD_REQUEST",message:"new name is reserved"});

      tree.content = input.newContent;
      tree.link = input.newLink;
      const res = await ctx.prisma.tree.update(
        {
          where: {
            link:input.link
          },
          data:{
            ...tree
          }
        }
      );
      return res; 
    }),
});

async function findTree(link: string, prisma: Prisma): Tree | null{
  const tree: Tree|null= await prisma.tree.findFirst({
    where: {
      link: {
        equals: link,
      },
    },
  });
  return tree;
}

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  trees: treeRouter,
});
