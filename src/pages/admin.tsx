import { type GetServerSidePropsContext } from "next";
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

const Admin = () => {
  const session = useSession();
  const router = useRouter();
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

        <div className="">
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
  console.log(session?.user);

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

const inputsType = z.object({
  link: linkValidString,
});

type Inputs = z.infer<typeof inputsType>;
