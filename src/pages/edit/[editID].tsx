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
import { type TreeSchema } from "~/utils/types";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { strict } from "assert";
type ElementSchema = z.infer<typeof elementSchema>;
export default function Edit({
  link,
  trpcState,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [treeName, setTreeName] = useState(link);
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
  const [treeData, setTreeData] = useState<TreeSchema | undefined>(
    edittedTree?.data?.content ?? []
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
  // if (edittedTree.isLoading) return <div>Loading ...</div>;
  // if (edittedTree.isError || !edittedTree.data) return <div>Error</div>;
  return (
    <div className="flex flex-1 justify-center bg-gradient-to-t from-lime-900 to-lime-600 p-4 text-white">
      <div className="max-w-2xl flex-auto">
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
              className="my-2 flex-auto rounded-md border-2 border-white bg-slate-600 p-2 text-sm text-slate-300 invalid:bg-red-300"
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
            {}
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
              className="my-2 max-w-fit rounded-md border-2 border-white bg-slate-600 p-2 text-sm text-slate-300"
              {...form2.register("type")}
              onChange={(e) => {
                form2.setValue("type", e.target.value as "header" | "link");
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
          <span className="font-bold text-red-300">
            {form2.formState.errors.text?.message}
            {form2.formState.errors.link?.message}
          </span>
        </form>
        {treeData?.map((n, index) => (
          <TreeElementCard key={index} element={n}>
            <a
              className="ml-auto cursor-pointer"
              onClick={() => {
                moveElement(index, -1);
                console.log(treeData);
              }}
            >
              Up
            </a>
            <a
              className="ml-2 cursor-pointer"
              onClick={() => moveElement(index, 1)}
            >
              Down
            </a>
            <a
              className="ml-2 cursor-pointer"
              onClick={() => deleteElement(index)}
            >
              Delete
            </a>
          </TreeElementCard>
        ))}
      </div>
    </div>
  );
}

function TreeElementCard({
  element,
  children,
}: {
  element: ElementSchema;
  children?: React.ReactNode;
}) {
  return (
    <div className="my-4 rounded-xl bg-slate-600 p-4 shadow-xl">
      <div
        className={
          element.type === "header"
            ? "[&>div>div]:flex [&>div>div]:justify-center [&>div>div]:gap-1 [&>div>input]:text-center [&button]:relative"
            : ""
        }
      >
        <EditableInput
          initialText={element.text}
          validator={z.string().min(1)}
          onTextChange={(text) => {
            element.text = text;
          }}
        />
      </div>
      {element.type === "link" && (
        <EditableInput
          initialText={element.link ?? ""}
          validator={z.string().min(1).url()}
          onTextChange={(text) => {
            element.link = text;
          }}
        />
      )}{" "}
      <div className="mr-2">
        <div>{children && children}</div>
      </div>
    </div>
  );
}

function EditableInput({
  initialText,
  onTextChange,
  validator,
}: {
  initialText: string;
  onTextChange: (text: string) => void;
  validator?: z.ZodString;
}) {
  const [isError, setIsError] = useState(false);
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleBlur = () => {
    setEdit(false);
    onTextChange(text);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEdit(false);
      onTextChange(text);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validator) {
      setText(e.target.value);
      return;
    }
    const result = validator?.safeParse(e.target.value);
    if (result?.success) {
      setText(e.target.value);
      setIsError(false);
    } else {
      setText(e.target.value);
      setIsError(true);
    }
  };

  const focusInput = () => {
    setEdit(true);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`grid grid-cols-1 items-baseline ${
        isError ? "text-red-600" : ""
      }`}
    >
      {!edit && (
        <div className={"col-start-1 row-start-1"} onClick={focusInput}>
          {text} {isError && "!"} <button onClick={focusInput}>Edit</button>
        </div>
      )}
      <input
        className={`col-start-1 row-start-1 w-full ${
          edit ? "bg-transparent" : "pointer-events-none opacity-0"
        }`}
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

//TODO Ad dsome serversied props mumbo jumbo an dredirects if not logged in lol

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
