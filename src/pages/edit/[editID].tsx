import { Tree } from "@prisma/client";
import { GetServerSideProps, GetStaticPaths } from "next";
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

  const onSubmit: SubmitHandler<Inputs> = (data) => {
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
      <h1>Add Element</h1>
      <form
        className="flex flex-col"
        action=""
        onSubmit={form2.handleSubmit(onSubmit2)}
      >
        <select
          {...form2.register("type")}
          onChange={(e) => {
            form2.setValue("type", e.target.value);
            console.log(e);
          }}
        >
          <option value="header">header</option>
          <option value="link">link</option>
        </select>
        <input type="text" {...form2.register("text")} />
        {form2.watch("type") == "link" && (
          <input type="text" {...form2.register("link")} />
        )}
        <input type="submit" />
      </form>
      {treeData.map((n, index) => {
        return (
          <div key={index}>
            <span>{n.text}</span>
            <a
              className="cursor-pointer"
              onClick={() => moveElement(index, -1)}
            >
              {" "}
              Up{" "}
            </a>
            <a className="cursor-pointer" onClick={() => moveElement(index, 1)}>
              {" "}
              Down{" "}
            </a>
            <a className="cursor-pointer" onClick={() => deleteElement(index)}>
              {" "}
              Delete{" "}
            </a>
          </div>
        );
      })}
    </>
  );
}
