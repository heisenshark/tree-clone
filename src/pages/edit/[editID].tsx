import { Tree } from "@prisma/client";
import { GetServerSideProps, GetStaticPaths } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { parseTreeString, TreeContent } from "~/shared";
import { api } from "~/utils/api";

interface Inputs {
  newLink: string;
  newContent: string;
}

export default function Edit() {
  const router = useRouter();
  const arg = router.query.editID ?? "";
  const [treeData, setTreeData] = useState<TreeContent>([]);
  const edittedTree = api.example.trees.findOne.useQuery(
    {
      link: arg instanceof Array<string> ? "" : arg,
    },
    {
      enabled: !!arg,
      onSuccess(data) {
        console.log(data);
        setTreeData(parseTreeString(data?.content) as TreeContent);
      },
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
  const form2 = useForm<{
    type: "link" | "header";
    text: string;
    link?: string;
  }>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!edittedTree.data) return;
    updateTree.mutate({
      link: edittedTree.data?.link,
      newLink: data.newLink,
      newContent: JSON.stringify(treeData),
    });
  };

  const onSubmit2: SubmitHandler<{
    type: "link" | "header";
    text: string;
    link?: string;
  }> = async (data) => {
    if (!edittedTree.data) return;
    if (data.type === "header") delete data["link"];
    console.log(data);
    treeData.push({ ...data });
    setTreeData([...treeData]);
  };

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
      </Link>
      <form
        action=""
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col"
      >
        <label className="text-md" htmlFor="newLink">
          Change url of tree
        </label>
        <input
          className="my-2 max-w-fit rounded-md border-2 border-white bg-slate-600 p-2 text-sm text-slate-300"
          type="text"
          {...register("newLink")}
          defaultValue={edittedTree.data.link}
        />
        <input
          type="submit"
          className="text-md my-2 max-w-fit cursor-pointer rounded-md bg-red-500 p-2"
          value="Update Name"
        />
      </form>
      <form
        className="flex flex-col"
        action=""
        onSubmit={form2.handleSubmit(onSubmit2)}
      >
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
