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
  return (
    <div>
      <div>{parseContent(hello.data?.content)}</div>
    </div>
  );
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
    <div>
      {siema.map((n, index) => {
        return n.type == "header" ? (
          <h1 className="text-3xl" key={index}>
            {n.text}
          </h1>
        ) : (
          <div key={index}>
            <a className="font-bold text-blue-900" href={n.link}>
              {n.text}
            </a>
          </div>
        );
      })}
    </div>
  );
}

const arr = [{ type: "header", text: "elo wale wiadro" }];
