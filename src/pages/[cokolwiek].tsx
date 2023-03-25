import { Tree } from "@prisma/client";
import { GetServerSideProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import Link from "next/link";
import { TreeContent, treeType } from "~/shared";
export default function Something() {
  const router = useRouter();
  const arg = router.query.cokolwiek ?? "";
  console.log(router.query);
  const hello = api.example.trees.findOne.useQuery(
    {
      link: arg instanceof Array<string> ? "" : arg,
    },
    {
      enabled: !!arg,
      onError: async (e) => {
        await router.push("/");
      },
      async onSuccess(data) {
        if (!data) await router.push("/");
      },
    }
  );

  return parseContent(hello.data?.content);
}
function parseContent(xd: string | undefined) {
  let siema;
  try {
    siema = treeType.parse(JSON.parse(xd)) as TreeContent;
  } catch (e) {
    console.log(e);
    return <div>error</div>;
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-lime-200 px-2">
      <div className="flex w-[40em] min-w-min max-w-full flex-1 flex-col items-center py-6">
        {siema.map((n, index) => {
          return n.type == "header" ? (
            <h1 className="my-16 break-all text-2xl font-bold" key={index}>
              {n.text}
            </h1>
          ) : (
            <div
              key={index}
              className="my-1 flex w-full justify-center rounded-full bg-red-300 p-2 py-4"
            >
              <a
                className="text-md text-center font-medium text-blue-900"
                href={n.link}
              >
                {n.text}
              </a>
            </div>
          );
        })}
      </div>
      <footer className="flex-0 mt-auto w-full py-6">
        {" "}
        <Link
          className="flex-0 mr-auto flex items-center justify-center md:ml-4"
          href="/"
        >
          <h1 className="max-w-min whitespace-nowrap rounded-lg bg-lime-100 p-3 text-2xl font-bold text-black drop-shadow-xl">
            TR<span className="text-lime-900">EE</span> CLON
            <span className="text-lime-900">E</span>
          </h1>
        </Link>
      </footer>
    </div>
  );
}

const arr = [{ type: "header", text: "elo wale wiadro" }];
