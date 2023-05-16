import {
  type InferGetServerSidePropsType,
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
  type TreeStylesSchema,
  type TreeSchema,
  type treeStyles,
} from "~/utils/types";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import Head from "next/head";
import * as Tabs from "@radix-ui/react-tabs";
import EditableInput from "~/components/EditableInput";
import TreeView from "~/components/TreeView";
import { atom } from "jotai";
import { useAtom, useSetAtom } from "jotai/react";
import {stylesFallback} from "~/utils/types";
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
    {
      ...stylesFallback(edittedTree?.data?.style ?? {})
    }
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
    if (!treeStyles.bgType) treeStyles.bgType = "color";


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

      <div className="flex flex-1 justify-center bg-gray-700 p-4 text-white">
        <div className="flex w-[80em] flex-row justify-center">
          <Tabs.Root className="flex-auto flex flex-col min-w-[60%]" defaultValue="content">
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
            <Tabs.Content className="overflow-y-scroll h-[85vh] px-2" value="content">
              <form
                onSubmit={(e) => {
                  handleSubmit(onSubmit)(e).catch(console.log);
                }}
                className="flex flex-col"
              >
                <label className="text-md" htmlFor="newLink">
                  Tree Url
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
                <div className="flex flex-wrap gap-2 flex-grow-0">
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
            <Tabs.Content className="overflow-y-scroll h-[85vh] px-2" value="Appearance">
              <div className="flex w-96 max-w-2xl flex-col">
                <div className="flex flex-col">
                <h1 className="text-xl my-4">Tree Style</h1>
                <label htmlFor="">background color</label>
                  <ColorInput
                    initialColor={treeStyles.backgroundColor ?? "#ffffff"}
                    onColorChange={(color) => {
                      console.log(color);
                      setTreeStyles({
                        ...treeStyles,
                        backgroundColor: color,
                        bgType: "color",
                      });
                    }}
                  ></ColorInput>
                  <h1 className="text-xl">Gradient</h1>
                  <label htmlFor="">From color</label>
                  <ColorInput
                    initialColor={treeStyles.gradient?.from ?? "#ffffff"}
                    onColorChange={(color) => {
                      console.log(color);
                      if (treeStyles.gradient) treeStyles.gradient.from = color;
                      else treeStyles.gradient = { from: color, to: color };
                      setTreeStyles({
                        ...treeStyles,
                        bgType: "gradient",
                      });
                    }}
                  ></ColorInput>
                  <label htmlFor="">To color</label>
                  <ColorInput
                    initialColor={treeStyles.gradient?.to ?? "#ffffff"}
                    onColorChange={(color) => {
                      console.log(color);
                      if (treeStyles.gradient) treeStyles.gradient.to = color;
                      else treeStyles.gradient = { from: color, to: color };
                      setTreeStyles({
                        ...treeStyles,
                        bgType: "gradient",
                      });
                    }}
                  ></ColorInput>
                  <label htmlFor="">Text color</label>
                  <ColorInput
                    initialColor={treeStyles.textColor ?? "#000000"}
                    onColorChange={(color) => {
                      setTreeStyles({
                        ...treeStyles,
                        textColor: color,
                      });
                    }}
                  ></ColorInput>
                  <h1 className="text-xl my-4">Button Style</h1>
                  <label htmlFor="">text color</label>
                  <ColorInput
                    initialColor={
                      treeStyles.buttonStyle?.textColor ?? "#ffffff"
                    }
                    onColorChange={(color) => {
                      treeStyles.buttonStyle.textColor = color;
                      setTreeStyles({
                        ...treeStyles,
                      });
                    }}
                  ></ColorInput>
                  <label htmlFor="">color</label>
                  <ColorInput
                    initialColor={
                      treeStyles.buttonStyle?.buttonColor ?? "#ffffff"
                    }
                    onColorChange={(color) => {
                      treeStyles.buttonStyle.buttonColor = color;
                      setTreeStyles({
                        ...treeStyles,
                      });
                    }}
                  ></ColorInput>
                  <label htmlFor="">shadow color</label>
                  <ColorInput
                    initialColor={
                      treeStyles.buttonStyle?.shadowColor ?? "#ffffff"
                    }
                    onColorChange={(color) => {
                      treeStyles.buttonStyle.shadowColor = color;
                      setTreeStyles({
                        ...treeStyles,
                      });
                    }}
                  ></ColorInput>
                  <label htmlFor="">Shadow shape</label>
                  <select
                    className="my-2 max-w-fit rounded-md bg-white p-2 text-sm text-gray-900"
                    onChange={(e) => {
                      treeStyles.buttonStyle.shadow = e.target.value as NonNullable<treeStyles['buttonStyle']>["shadow"];
                      setTreeStyles({
                        ...treeStyles,
                      });
                    }}
                  >
                    <option value="none">none</option>
                    <option value="soft">soft</option>
                    <option value="hard">hard</option>
                  </select>
                  <label htmlFor="">Roundness</label>
                  <select
                    className="my-2 max-w-fit rounded-md bg-white p-2 text-sm text-gray-900"
                    onChange={(e) => {
                      treeStyles.buttonStyle.roundness = e.target.value as NonNullable<treeStyles['buttonStyle']>["roundness"];
                      setTreeStyles({
                        ...treeStyles,
                      });
                    }}
                  >
                    <option value="none">none</option>
                    <option value="medium">medium</option>
                    <option value="full">full</option>
                  </select>

                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 rounded-full text-indigo-600 transition duration-150 ease-in-out"
                      checked={treeStyles.buttonStyle.outline}
                      onChange={(e) => {
                        treeStyles.buttonStyle.outline = e.target.checked;
                        setTreeStyles({
                          ...treeStyles,
                        });
                      }}
                    />
                    <span className="ml-2 text-white">only outline?</span>
                  </label>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
          <div className="flex-grow-1 flex h-full flex-auto flex-col items-center mmd:hidden">
            <div className="">
              <div
                className="flex aspect-[1/2] h-[85vh] justify-center overflow-hidden rounded-[3em] border-[1em] border-black p-4 text-[1rem] transition-all duration-1000"
                style={{
                  //`linear-gradient(0deg, black 0%, white 100%)`,
                  background:
                    treeStyles.bgType == "gradient"
                      ? `linear-gradient(${0}deg, ${
                          treeStyles.gradient?.to ?? "black"
                        }, ${treeStyles.gradient?.from ?? "white"} )`
                      : treeStyles.backgroundColor ?? "#fff",
                }}
              >
                <TreeView tree={treeData} styles={treeStyles}></TreeView>
              </div>
              <div className="flex flex-auto justify-center text-center py-1">
                <Link
                  href={`/${treeName}`}
                  className="text-2xl font-bold text-black underline hover:text-slate-400"
                >
                  Tree link: /{treeName}
                </Link>
              </div>
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
          className="relative h-10 w-10 flex-initial rounded-xl tracking-widest shadow-inner transition-all [clip-path:circle(35%)] hover:[clip-path:circle(40%)] focus:ring-2 active:[clip-path:circle(39%)]"
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

