import {
  InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { linkValidString } from "~/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { exampleRouter, treeRouter } from "~/server/api/routers/example";
import superjson from "superjson";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
const Admin = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const session = useSession();
  const router = useRouter();
  console.log(props.trpcState);
  const userTrees = api.example.trees.getUserTrees.useQuery(
    {},
    {
      onError(err) {
        router.push("/api/auth/signin").catch((e) => console.log(e));
      },
      onSuccess(data) {
        console.log("data", data);
      },
      enabled: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );
  console.log(userTrees);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(inputsType),
  });
  const add = api.example.trees.addOne.useMutation({
    async onSuccess(data) {
      console.log("deleted", data);
      await userTrees.refetch();
    },
  });

  const deleteTree = api.example.trees.deleteTree.useMutation({
    onSuccess(data) {
      userTrees.refetch().catch((e) => console.log(e));
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log("adding stuff\n", data);
    const xd = add.mutate({
      link: data.link,
      content: "[]",
    });
    console.log(xd);
  };

  useEffect(() => {
    console.log("rerender");
  });

  function formatError() {
    return <div>{add.error?.data?.zodError?.fieldErrors.title}</div>;
  }

  return (
    <div className="flex flex-1 justify-center bg-lime-900 px-8 text-white">
      <div className="max-w-2xl flex-auto">
        <h1 className="my-4 text-3xl">Add tree</h1>
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              handleSubmit(onSubmit)(e).catch((ee) => {
                console.log("ee", ee);
              });
            }}
            className="flex"
          >
            {/* register your input into the hook by invoking the "register" function */}
            <input
              className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="/link"
              required
              {...register("link")}
              onInput={() => {
                console.log("oninput");
                if (add.error) add.reset();
              }}
            />
            <input
              className="ml-4 inline-flex rounded border-0 bg-indigo-500 py-2 px-6 text-lg text-white hover:bg-indigo-600 focus:outline-none"
              type="submit"
            />
          </form>
          <span className="text-md font-bold text-red-500">
            {errors.link?.message}
            {JSON.stringify(add?.error?.data?.zodError?.fieldErrors)}
            {add?.error?.message}
          </span>
          {formatError()}
        </div>

        <div className="flex flex-col gap-0">
          <h1 className="text-3xl">
            {session.data?.user.name}
            {"'s"} trees
          </h1>
          {!userTrees.data && (
            <div role="status" className="my-40 self-center">
              <svg
                aria-hidden="true"
                className="mr-2 h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )}
          {userTrees.data?.map((n) => {
            return (
              <div
                key={n.id}
                className="my-2 flex rounded-md border-2 bg-slate-700 p-4 text-xl"
              >
                <div className="inline-flex text-3xl">{n.link}</div>
                <Link
                  className="mx-2 ml-auto font-light tracking-tighter underline hover:text-slate-500"
                  href={`/${n.link}`}
                >
                  Go to Tree
                </Link>
                <Link
                  className="mx-2 font-light tracking-tighter underline hover:text-slate-500"
                  href={`/edit/${n.link}`}
                >
                  Edit
                </Link>
                <a
                  className="mx-2 cursor-pointer font-light tracking-tighter underline hover:text-slate-500"
                  onClick={() => {
                    deleteTree.mutate({ link: n.link });
                  }}
                >
                  Delete
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Admin;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { session, prisma, req: undefined, res: undefined },
    transformer: superjson,
  });
  await ssg.example.trees.getUserTrees.prefetch({});
  return {
    props: {
      trpcState: ssg.dehydrate(),
      // session: await getServerSession(context.req, context.res, authOptions),
    },
  };
}

const inputsType = z.object({
  link: linkValidString,
});

type Inputs = z.infer<typeof inputsType>;
