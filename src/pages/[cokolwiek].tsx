import { GetServerSideProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import React from "react";

export default function Something() {
  const router = useRouter();
  console.log(router.query);
  return <div>{router.query.cokolwiek}</div>;
}
