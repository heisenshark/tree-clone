import { prisma } from "./../../db";
import { Prisma, PrismaClient, Tree } from "@prisma/client"
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { parseTreeString } from "~/shared"
import { linkValidString, treeSchema, TreeSchema } from "~/utils/types"



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
      const res = await ctx.prisma.tree.create({
        data: {
          link: input.link,
          content: input.content,
          userId: ctx.session.user.id,
        },
      });
      await ctx.res?.revalidate(`/${input.link}`); 
      return res;
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
      if(!res)return undefined;
      const content = {...res, content: JSON.parse(res.content) as TreeSchema};
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: {
            equals: res?.userId,
          },
        },
      });
      return {...content, ...user} as const;
    }),
  findOneJSON: publicProcedure
    .input(z.object({ link: linkValidString }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.tree.findFirst({
        where: {
          link: {
            equals: input.link,
          },
        },
      });
      console.log(res?.content);
      
      return parseTreeString(res?.content ?? "");
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
      z.object({ link: linkValidString.and(z.string()), newContent: treeSchema, newLink:linkValidString.and(z.string()) })
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

      if(input.newLink!=input.link && await findTree(input.newLink, ctx.prisma)) throw new TRPCError({ code:"BAD_REQUEST",message:"new name is already in use."});

      tree.content = JSON.stringify(input.newContent);
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
    deleteTree: protectedProcedure
    .input(
      z.object({ link: linkValidString.and(z.string()) })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.tree.deleteMany({
        where: {
          link: input.link,
          userId: ctx.session.user.id,
        },
      })
    })
});

async function findTree(link: string, prisma: PrismaClient): Promise<Tree | null>{
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
