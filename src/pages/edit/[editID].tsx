import { Tree } from "@prisma/client";
import { GetServerSideProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/utils/api";

interface Inputs {
  newLink: string;
  newContent: string;
}

export default function Edit() {
  const router = useRouter();
  const arg = router.query.editID ?? "";
  const edittedTree = api.example.trees.findOne.useQuery(
    {
      link: arg instanceof Array<string> ? "" : arg,
    },
    {
      enabled: !!arg,
    }
  );
  const updateTree = api.example.trees.updateUserTree.useMutation({
    onSuccess: async (data, variables, context) => {
      console.log(data, variables, context);
      await router.push(`/edit/${data.link}`, undefined, { shallow: true });
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!edittedTree.data) return;
    updateTree.mutate({ link: edittedTree.data?.link, ...data });
  };

  if (!edittedTree.data) return <div>could not find the tree</div>;
  return (
    <>
      <div>{arg}</div>
      <form
        action=""
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col"
      >
        <textarea
          cols={90}
          rows={10}
          defaultValue={edittedTree.data.content}
          required
          {...register("newContent")}
        ></textarea>
        <input
          type="text"
          {...register("newLink")}
          defaultValue={edittedTree.data.link}
        />
        <input type="submit" />
      </form>
    </>
  );
}
