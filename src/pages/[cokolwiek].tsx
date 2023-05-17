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
import { appRouter } from "~/server/api/root";
import { TreeSchema, TreeStylesSchema } from "~/utils/types";
import Head from "next/head";
import TreeView from "~/components/TreeView";
import { resolveBackground } from "~/components/TreeView";

export default function Something(
  props: InferGetServerSidePropsType<typeof getStaticProps>
) {
  const { tree, styles } = props;
  // let bg = "";
  // let footColor = "";
  // switch (styles.bgType) {
  //   case "color":
  //     bg = styles?.backgroundColor ?? "lime";
  //     footColor = getTextColorBasedOnBackground(bg);
  //     break;
  //   case "gradient":
  //     bg = `linear-gradient(${0}deg, ${styles.gradient?.to ?? "black"},${
  //       styles.gradient?.from ?? "white"
  //     })`;
  //     footColor = getTextColorBasedOnBackground(styles.gradient?.to ?? "black");
  //     break;
  //   case "wave":
  //     bg = "url(/wave.svg)";
  //     break;
  //   default:
  //     bg = "white";
  //     break;
  // }

  const [bg, footColor] = resolveBackground(styles);

  return (
    <>
      <Head>
        <title>{props.id}</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <div
        className="flex flex-1 flex-col items-center justify-center px-8"
        style={{
          background: bg,
        }}
      >
        <TreeView tree={tree} styles={styles}></TreeView>
        <footer className="flex-0 mt-auto flex w-full items-center justify-center pt-10 pb-4">
          <Link className=" flex-0 flex-row" href="/">
            <h1
              className={`whitespace-nowrap rounded-lg p-1 text-center text-xl font-bold text-${footColor} drop-shadow-xl`}
            >
              Tr<span className={`text-${footColor}`}>ee</span> Clon
              <span className={`text-${footColor}`}>e</span>
            </h1>
          </Link>
        </footer>
      </div>
    </>
  );
}

export async function getStaticProps(
  context: GetStaticPropsContext<{ cokolwiek: string }>
) {
  const ctx = await createTRPCContext();
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: ctx,
    transformer: superjson,
  });
  const id = context.params?.cokolwiek as string;
  const tree = await ssg.example.trees.findOne.fetch({ link: id });
  console.log(tree);
  if (tree) {
    return {
      props: {
        // trpcState: ssg.dehydrate(),
        id,
        tree: tree?.content,
        userImg: tree?.image,
        styles: tree?.style,
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
