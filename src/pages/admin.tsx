import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { string, z, ZodError, ZodIssue } from "zod";
import { api } from "~/utils/api";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";

type Inputs = {
  link: string;
  exampleRequired: string;
};

const Admin = () => {
  const add = api.example.trees.addOne.useMutation();
  const session = useSession();
  const router = useRouter();
  const userTrees = api.example.trees.getUserTrees.useQuery(
    {},
    {
      onError() {
        router.push("/api/auth/signin");
      },
    }
  );
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log("adding stuff\n", data);
    const xd = add.mutate({
      link: data.link,
      content: "[]",
    });
    console.log(xd);
  };

  function computeError() {
    if (!add.error) return "";
    console.log(add.error?.message);
    try {
      const lol = JSON.parse(add.error.message);
      // if (lol instanceof Array<ZodIssue>) return add.error.message + "co do kurwy";
      return (lol as ZodIssue[]).reduce((a, n) => a + n.message + " ", "");
    } catch (e) {
      return add.error.message;
    }
  }

  return (
    <div className="flex-1 bg-lime-900 px-8 text-white">
      <h1 className="my-4 text-3xl">Add tree</h1>
      <div className="mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex">
          {/* register your input into the hook by invoking the "register" function */}
          <input
            className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="/link"
            required
            {...register("link")}
          />
          {/* errors will return when field validation fails  */}
          {errors.exampleRequired && <span>This field is required</span>}
          <input
            className="ml-4 inline-flex rounded border-0 bg-indigo-500 py-2 px-6 text-lg text-white hover:bg-indigo-600 focus:outline-none"
            type="submit"
          />
        </form>
        {add.error && <div className="text-red-700">{computeError()}</div>}
      </div>

      <div className="drop-shadow-lg">
        <h1 className="text-3xl">
          {session.data?.user.name}
          {"'s"} trees
        </h1>
        {userTrees.data?.map((n) => {
          return (
            <div
              key={n.id}
              className="my-4 flex rounded-md border-2 bg-slate-700 p-4 text-xl"
            >
              <div className="inline-flex text-3xl capitalize">{n.link}</div>
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
            </div>
          );
        })}
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
  return {
    props: {
      session: await getServerSession(context.req, context.res, authOptions),
    },
  };
}
