import {
  InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/utils/api";
import { z, ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import {
  colorHexSchema,
  TreeStylesSchema,
  type TreeSchema,
} from "~/utils/types";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { strict } from "assert";
import Head from "next/head";
import * as Tabs from "@radix-ui/react-tabs";
import EditableInput from "~/components/EditableInput";
import TreeView from "~/components/TreeView";
import { log } from "console";
import { atom } from "jotai";
import { useAtom, useSetAtom } from "jotai/react";

type ElementSchema = z.infer<typeof elementSchema>;

const treeAtom = atom<TreeSchema>([]);
export default function Edit({
  link,
  trpcState,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [treeName, setTreeName] = useState(link);
  const [treeData, setTreeData] = useAtom(treeAtom);
  const edittedTree = api.example.trees.findOne.useQuery(
    {
      link: treeName,
    },
    {
      refetchOnWindowFocus: false,
      onSuccess(data) {
        setTreeData(data?.content ?? []);
      },
    }
  );
  const [treeStyles, setTreeStyles] = useState<TreeStylesSchema>(
    edittedTree?.data?.style ?? {}
  );
  const updateTree = api.example.trees.updateUserTree.useMutation({
    onSuccess: async (data, variables, context) => {
      await router.push(`/edit/${data.link}`, undefined, { shallow: true });
      setTreeName(data.link);
    },
    onMutate() {
      console.log("mutating");
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!treeData) return;
    console.log("ading");
    if (!edittedTree.data) return;
    console.log("there was data");
    updateTree.mutate({
      link: edittedTree.data?.link,
      newLink: data.newLink,
      newContent: treeData,
      newStyles: treeStyles,
    });
  };
  const onSubmit2: SubmitHandler<ElementSchema> = (data) => {
    console.log(data);
    if (!edittedTree.data) return;
    if (!treeData) return;
    // if (!arraySchema.safeParse(treeData).success) {
    //   return;
    // }
    if (data.type === "link" && data.link === undefined) return;
    treeData.push({ type: data.type, link: data.link ?? "", text: data.text });
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
    if (!treeData) return;
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
    if (!treeData) return;
    treeData.splice(index, 1);
    setTreeData([...treeData]);
  }

  console.log(treeData);
  return (
    <>
      <Head>
        <title>{link} Edit</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-1 justify-center bg-gray-700 p-4 text-white md:mr-96">
        <div className="flex max-w-2xl flex-auto flex-row flex-wrap">
          <Tabs.Root className="flex-1" defaultValue="content">
            <Tabs.List
              className="flex shrink-0 border-b border-mauve6"
              aria-label="Manage your account"
            >
              <Tabs.Trigger
                className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-white px-5 text-[15px] leading-none text-mauve11 outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black"
                value="content"
              >
                Content
              </Tabs.Trigger>
              <Tabs.Trigger
                className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-white px-5 text-[15px] leading-none text-mauve11 outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black"
                value="Appearance"
              >
                Appearance
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="content">
              <Link
                href={`/${treeName}`}
                className="text-2xl font-bold text-white underline hover:text-slate-400"
              >
                Tree link: /{treeName}
              </Link>
              <form
                onSubmit={(e) => {
                  handleSubmit(onSubmit)(e).catch(console.log);
                }}
                className="flex flex-col"
              >
                <label className="text-md" htmlFor="newLink">
                  Change url of tree
                </label>
                <div className="flex w-full">
                  <input
                    className="my-2 flex-auto rounded-md bg-white p-2 text-sm text-gray-900 invalid:bg-red-300"
                    type="text"
                    {...register("newLink", {
                      required: "required",
                      minLength: 4,
                    })}
                    defaultValue={treeName}
                  />

                  <input
                    type="submit"
                    className="text-md my-2 ml-4 max-w-fit cursor-pointer rounded-md bg-red-500 p-2"
                    value="Update tree"
                  />
                </div>
                <span className="font-bold text-red-300">
                  <span>{updateTree?.error?.message}</span>
                </span>
              </form>
              <form
                className="flex flex-col"
                onSubmit={(e) => {
                  form2.handleSubmit(onSubmit2)(e).catch(console.log);
                }}
              >
                <h1>Add Element</h1>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="my-2 max-w-fit rounded-md bg-white p-2 text-sm text-gray-900"
                    {...form2.register("type")}
                    onChange={(e) => {
                      form2.setValue(
                        "type",
                        e.target.value as "header" | "link"
                      );
                      console.log(e);
                    }}
                  >
                    <option value="header">header</option>
                    <option value="link">link</option>
                  </select>
                  <input
                    className="my-2 max-w-fit rounded-md bg-white p-2 text-sm text-gray-900"
                    type="text"
                    {...form2.register("text")}
                    placeholder="title"
                  />
                  {form2.watch("type") == "link" && (
                    <input
                      className="my-2 max-w-fit rounded-md bg-white p-2 text-sm text-gray-900"
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
                <span className="font-bold text-red-300">
                  {form2.formState.errors.text && (
                    <span>
                      {form2.formState.errors.text?.message} <br />
                    </span>
                  )}
                  <span>{form2.formState.errors.link?.message}</span>
                </span>
              </form>
              {treeData?.map((n, index) => (
                <div className="text-xl" key={index}>
                  <TreeElementCard element={n}>
                    <a
                      className="ml-auto cursor-pointer text-sm hover:underline"
                      onClick={() => {
                        moveElement(index, -1);
                        console.log(treeData);
                      }}
                    >
                      Up
                    </a>
                    <a
                      className="ml-2 cursor-pointer text-sm hover:underline"
                      onClick={() => moveElement(index, 1)}
                    >
                      Down
                    </a>
                    <a
                      className="ml-2 cursor-pointer text-sm hover:underline"
                      onClick={() => deleteElement(index)}
                    >
                      Delete
                    </a>
                  </TreeElementCard>
                </div>
              ))}
            </Tabs.Content>
            <Tabs.Content value="Appearance">
              <div className="flex flex-col">
                <label className="text-md" htmlFor="newLink">
                  Change background color
                </label>
                <div className="flex flex-col">
                  <ColorInput
                    initialColor={treeStyles.backgroundColor ?? "#ffffff"}
                    onColorChange={(color) => {
                      console.log(color);
                      setTreeStyles({
                        ...treeStyles,
                        backgroundColor: color,
                      });
                    }}
                  ></ColorInput>
                  <input
                    type="submit"
                    className="text-md my-2 ml-4 max-w-fit cursor-pointer rounded-md bg-red-500 p-2"
                    value="Update tree"
                  />
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
          <div className="fixed right-0 top-0 flex h-full w-80 flex-initial flex-grow-0 items-center justify-center lg:w-96 mmd:hidden">
            <div
              className="aspect-[1/2] max-h-[100vh] scale-75 overflow-hidden rounded-[3em] border-[1em] border-black p-4"
              style={{
                backgroundColor: treeStyles.backgroundColor,
              }}
            >
              <TreeView
                himassage="AAAAAA"
                tree={treeData}
                styles={treeStyles}
              ></TreeView>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TreeElementCard({
  element,
  children,
}: {
  element: ElementSchema;
  children?: React.ReactNode;
}) {
  const [tree, setTree] = useAtom(treeAtom);
  return (
    <div className="my-4 rounded-xl bg-white p-6 text-gray-900 shadow-xl">
      <div className={element.type === "header" ? "text-xl font-bold" : ""}>
        <EditableInput
          initialText={element.text}
          validator={z.string().min(1)}
          onTextChange={(text) => {
            element.text = text;
            setTree([...tree]);
          }}
        />
      </div>
      {element.type === "link" && (
        <EditableInput
          initialText={element.link ?? ""}
          validator={z.string().min(1).url()}
          onTextChange={(text) => {
            element.link = text;
            setTree([...tree]);
          }}
        />
      )}{" "}
      <div className="mr-2">
        <div>{children && children}</div>
      </div>
    </div>
  );
}

function ColorInput({
  onColorChange,
  initialColor,
}: {
  onColorChange: (color: string) => void;
  initialColor: string;
}) {
  const [color, setColor] = useState(initialColor ?? "#ffffff");
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full bg-white ring-black active:ring-2">
        <input
          type="color"
          className="h-10 w-10 flex-initial rounded-xl shadow-inner transition-all [clip-path:circle(35%)] hover:[clip-path:circle(40%)] focus:ring-2 active:[clip-path:circle(39%)]"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            onColorChange(e.target.value);
          }}
        />
      </div>
      <input
        type="text"
        id="color-input"
        className="rounded-lg border border-gray-300 px-3 py-2 text-black"
        value={color}
        onChange={(e) => {
          if (!colorHexSchema.safeParse(e.target.value)) return;
          setColor(e.target.value);
          onColorChange(e.target.value);
        }}
      />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { session, prisma, req: undefined, res: undefined },
    transformer: superjson,
  });

  await ssg.example.trees.findOne.prefetch({
    link: context.params?.editID as string,
  });

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
      link: context.params?.editID as string,
      trpcState: ssg.dehydrate(),
      session: await getServerSession(context.req, context.res, authOptions),
    },
  };
}

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
  type: z.union([z.literal("link"), z.literal("header")]),
  link: z
    .string()
    .url("Link must be valid url starting with https://")
    .optional(),
  text: z.string().nonempty("Title must not be empty"),
});

const arraySchema = z.array(elementSchema);
