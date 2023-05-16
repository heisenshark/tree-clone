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

export default function Something(
  props: InferGetServerSidePropsType<typeof getStaticProps>
) {
  const { tree, styles } = props;
  let bg = "";
  let footColor = "";
  switch (styles.bgType) {
    case "color":
      bg = styles?.backgroundColor ?? "lime";
      footColor = getTextColorBasedOnBackground(bg);
      break;
    case "gradient":
      bg = `linear-gradient(${0}deg, ${styles.gradient?.to ?? "black"},${
        styles.gradient?.from ?? "white"
      })`;
      footColor = getTextColorBasedOnBackground(styles.gradient?.to ?? "black");
      break;
    default:
      bg = "white";
      break;
  }


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
        <footer className="flex flex-0 items-center justify-center mt-auto w-full pt-10 pb-4">
          <Link
            className=" flex-0 flex-row"
            href="/"
          >
            <h1 className={`text-center whitespace-nowrap rounded-lg p-1 text-xl font-bold text-${footColor} drop-shadow-xl`}>
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

function getTextColorBasedOnBackground(backgroundColor:string) {
  const cleanColor = backgroundColor.replace('#', '');
  const r = parseInt(cleanColor.substring(0, 2), 16);
  const g = parseInt(cleanColor.substring(2, 4), 16);
  const b = parseInt(cleanColor.substring(4, 6), 16);
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);
  return brightness > 125 ? 'black' : 'white';
}
