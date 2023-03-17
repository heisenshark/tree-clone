import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
const treeRouter = createTRPCRouter({
  addOne: protectedProcedure
  .input(z.object({content: z.string()}))
  .mutation(({ctx,input})=>{
    console.log("siema");
    return ctx.prisma.tree.create({data:{content:input.content,userId:ctx.session.user.id}});
  }
  ),
  findOne: publicProcedure.input(
    z.object({link:z.string().nonempty().regex(new RegExp("^[a-zA-Z0-9]+$"))})
  ).query(({ctx,input})=>{
    ctx.prisma.tree.findFirst()
  })
  // updateOne:undefined,
});
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
  trees: treeRouter
});

