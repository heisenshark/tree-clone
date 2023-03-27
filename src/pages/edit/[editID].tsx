import { Tree } from "@prisma/client";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetStaticPaths,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { parseTreeString, TreeContent } from "~/shared";
import { api } from "~/utils/api";
import { ErrorMessage } from "@hookform/error-message";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { Flatten, TreeSchema, treeSchema } from "~/utils/types";

type ElementSchema = z.infer<typeof elementSchema>;
export default function Edit() {
  const router = useRouter();
  const arg = router.query.editID ?? "";
  const [treeData, setTreeData] = useState<TreeSchema>([]);
  const edittedTree = api.example.trees.findOne.useQuery(
    {
      link: arg instanceof Array<string> ? "" : arg,
    },
    {
      enabled: !!arg,
      onSuccess(data) {
        console.log(data);
        setTreeData(data?.content);
      },
    }
  );

  const updateTree = api.example.trees.updateUserTree.useMutation({
    onSuccess: async (data, variables, context) => {
      await router.push(`/edit/${data.link}`, undefined, { shallow: true });
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log("ading");
    if (!edittedTree.data) return;
    console.log("there was data");
    updateTree.mutate({
      link: edittedTree.data?.link,
      newLink: data.newLink,
      newContent: treeData,
    });
  };
  const onSubmit2: SubmitHandler<Flatten<TreeSchema>> = (data) => {
    console.log(data);
    if (!edittedTree.data) return;
    treeData.push({ ...data });
    setTreeData([...treeData]);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(inputsSchema),
  });

  const form2 = useForm<ElementSchema>({
    resolver: zodResolver(elementSchema),
  });

  function moveElement(index: number, move: number) {
    if (
      index + move < 0 ||
      index + move > treeData.length ||
      index < 0 ||
      index > treeData.length
    )
      return;
    const a = treeData[index],
      b = treeData[index + move];
    if (!a || !b) return;
    treeData[index + move] = a;
    treeData[index] = b;
    setTreeData([...treeData]);
  }
  function deleteElement(index: number): void {
    treeData.splice(index, 1);
    setTreeData([...treeData]);
  }

  if (!edittedTree.data) return <div>could not find the tree</div>;
  return (
    <div className="flex-1 bg-gradient-to-t from-lime-900 to-lime-600 p-4 text-white">
      <Link
        href={`/${edittedTree.data.link}`}
        className="text-2xl text-slate-300 underline hover:text-slate-400"
      >
        Tree link: /{edittedTree.data.link}
        {JSON.stringify(updateTree.error?.data?.zodError?.fieldErrors)}
      </Link>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <label className="text-md" htmlFor="newLink">
          Change url of tree
        </label>
        <input
          className="my-2 max-w-fit rounded-md border-2 border-white bg-slate-600 p-2 text-sm text-slate-300 invalid:bg-red-300"
          type="text"
          {...register("newLink", { required: "siema kurwa", minLength: 4 })}
          defaultValue={edittedTree.data.link}
        />
        {errors.newLink?.message}

        <input
          type="submit"
          className="text-md my-2 max-w-fit cursor-pointer rounded-md bg-red-500 p-2"
          value="Update Name"
        />
      </form>
      <form className="flex flex-col" onSubmit={form2.handleSubmit(onSubmit2)}>
        <h1>Add Element</h1>
        <div className="flex flex-wrap gap-2">
          <select
            className="my-2 max-w-fit rounded-md border-2 border-white bg-slate-600 p-2 text-sm text-slate-300"
            {...form2.register("type")}
            onChange={(e) => {
              form2.setValue("type", e.target.value);
              console.log(e);
            }}
          >
            <option value="header">header</option>
            <option value="link">link</option>
          </select>
          <input
            className="my-2 max-w-fit rounded-md border-2 border-white bg-slate-600 p-2 text-sm text-slate-300"
            type="text"
            {...form2.register("text")}
            placeholder="title"
          />
          {form2.watch("type") == "link" && (
            <input
              className="my-2 max-w-fit rounded-md border-2 border-white bg-slate-600 p-2 text-sm text-slate-300"
              type="text"
              placeholder="link"
              {...form2.register("link")}
            />
          )}
        </div>
        <input
          type="submit"
          className="text-md my-2 max-w-fit cursor-pointer rounded-md bg-red-500 p-2"
          value="Add Element"
        />
      </form>
      {treeData.map((n, index) => {
        return (
          <div
            key={index}
            className="my-4 rounded-xl border-2 bg-slate-600 p-4"
          >
            <div className="">{n.type}</div>
            <span className="text-3xl">{" " + n.text}</span>
            <div className="mr-2">
              <a
                className="ml-auto cursor-pointer"
                onClick={() => moveElement(index, -1)}
              >
                {" "}
                Up{" "}
              </a>
              <a
                className="ml-2 cursor-pointer"
                onClick={() => moveElement(index, 1)}
              >
                {" "}
                Down{" "}
              </a>
              <a
                className="ml-2 cursor-pointer"
                onClick={() => deleteElement(index)}
              >
                {" "}
                Delete{" "}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

//TODO Ad dsome serversied props mumbo jumbo an dredirects if not logged in lol

const inputsSchema = z.object({
  newLink: z
    .string()
    .min(4, "Link must be above 4 characters")
    .max(20, "link length must be below 20 characters")
    .nonempty("link must not be empty")
    .regex(
      new RegExp("^[a-zA-Z0-9]+$"),
      "link must contain only letters and numbers, no special signs"
    ),
});

type Inputs = z.infer<typeof inputsSchema>;

const elementSchema = z.object({
  type: z.union([z.literal("header"), z.literal("link")]),
  text: z.string().nonempty("text must not be empty"),
  link: z.string().url().optional(),
});

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const arg = context.query.editID ?? "";
  // api.example.trees.findOne.useQuery.
  if (!session?.user) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session: await getServerSession(context.req, context.res, authOptions),
    },
  };
}
