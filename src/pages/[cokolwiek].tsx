import { Tree } from "@prisma/client";
import { GetServerSideProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";

export default function Something() {
  const router = useRouter();
  const arg = router.query.cokolwiek ?? "";
  console.log(router.query);
  const hello = api.example.trees.findOne.useQuery({
    link: arg instanceof Array<string> ? "" : arg,
  });
  return (
    <div>
      {router.query.cokolwiek}
      <div>{JSON.stringify(hello.data)}</div>
    </div>
  );
}
