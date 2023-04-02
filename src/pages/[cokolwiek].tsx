import {
  type GetStaticPaths,
  type GetStaticPropsContext,
  type InferGetServerSidePropsType,
} from "next";
import React from "react";
import Link from "next/link";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { exampleRouter } from "~/server/api/routers/example";
import superjson from "superjson";
import { prisma } from "~/server/db";
import Image from "next/image";
import { createTRPCContext } from "~/server/api/trpc";

export default function Something(
  props: InferGetServerSidePropsType<typeof getStaticProps>
) {
  const { tree } = props;
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-lime-200 px-8">
      <Image
        width={128}
        height={128}
        className="mt-8 w-32 cursor-pointer rounded-full border-4 shadow-md shadow-stone-500"
        src={props.userImg ?? ""}
        alt="user image"
      />

      <div className="flex w-[40em] min-w-min max-w-full flex-1 flex-col items-center">
        {tree?.map((n, index) => {
          return n.type == "header" ? (
            <h1 className="my-4 break-all text-2xl font-bold" key={index}>
              {n.text}
            </h1>
          ) : (
            <a
              href={n.link}
              key={index}
              className="backdrop my-2 flex w-full justify-center rounded-full border-2 bg-red-300 p-2 py-4 transition-all duration-100 active:scale-95"
            >
              <div className="text-md text-center font-medium text-black">
                {n.text}
              </div>
            </a>
          );
        })}
      </div>
      <footer className="flex-0 mt-auto w-full pt-10 pb-4">
        <Link
          className="flex-0 mr-auto flex items-center justify-center"
          href="/"
        >
          <h1 className="max-w-min whitespace-nowrap rounded-lg bg-lime-100 p-1 text-xl font-bold text-black drop-shadow-xl">
            TR<span className="text-lime-900">EE</span> CLON
            <span className="text-lime-900">E</span>
          </h1>
        </Link>
      </footer>
    </div>
  );
}

export async function getStaticProps(
  context: GetStaticPropsContext<{ cokolwiek: string }>
) {
  const ctx = await createTRPCContext();
  const ssg = createProxySSGHelpers({
    router: exampleRouter,
    ctx: ctx,
    transformer: superjson,
  });
  const id = context.params?.cokolwiek as string;
  const tree = await ssg.trees.findOne.fetch({ link: id });
  console.log(tree);
  if (tree) {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        id,
        tree: tree?.content,
        userImg: tree?.image,
      },
    };
  }
  return {
    redirect: {
      destination: "/",
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const trees = await prisma.tree.findMany({});
  const paths = trees.map((tree) => ({
    params: { cokolwiek: tree.link },
  }));
  return { paths, fallback: "blocking" };
};
