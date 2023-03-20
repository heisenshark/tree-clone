import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { string, z, ZodError, ZodIssue } from "zod";
import { api } from "~/utils/api";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import Link from "next/link";

type Inputs = {
  example: string;
  exampleRequired: string;
};

const Admin = () => {
  const add = api.example.trees.addOne.useMutation();
  const userTrees = api.example.trees.getUserTrees.useQuery();
  const session = useSession();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log("adding stuff\n", data);
    const xd = add.mutate({
      link: data.example,
      content: data.exampleRequired,
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
  useEffect(() => {
    console.log(add);
  }, [add.error]);
  return (
    <div>
      <div className="mx-10 mt-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* register your input into the hook by invoking the "register" function */}
          <input
            className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            defaultValue="test"
            {...register("example")}
          />

          {/* include validation with required or other standard HTML validation rules */}
          <input
            className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            {...register("exampleRequired", { required: true })}
          />
          {/* errors will return when field validation fails  */}
          {errors.exampleRequired && <span>This field is required</span>}
          <input
            className="inline-flex rounded border-0 bg-indigo-500 py-2 px-6 text-lg text-white hover:bg-indigo-600 focus:outline-none"
            type="submit"
          />
        </form>
        {add.error && <div className="text-red-700">{computeError()}</div>}
      </div>

      <div>
        <h1>
          {session.data?.user.name}
          {"'s"} trees
        </h1>
        {userTrees.data?.map((n) => {
          return (
            <div key={n.id}>
              <details>
                <summary>
                  <Link
                    className="rounded-lg border-2 bg-slate-500 p-1 font-extrabold tracking-wide"
                    href={`/edit/${n.link}`}
                  >
                    Edit
                  </Link>
                  <Link
                    className="rounded-lg border-2 bg-slate-500 p-1 font-extrabold tracking-wide"
                    href={`/${n.link}`}
                  >
                    View
                  </Link>
                  {n.link}
                </summary>
                {JSON.stringify(n)}
              </details>
            </div>
          );
        })}
      </div>
      <DialogDemo></DialogDemo>
    </div>
  );
};

export default Admin;

export function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="inline-flex h-[35px] items-center justify-center rounded-[4px] bg-blue-400 px-[15px] font-medium leading-none text-white shadow-[0_2px_10px] shadow-blackA7 hover:bg-blue-500 focus:shadow-[0_0_0_2px] focus:shadow-gray-300 focus:outline-none">
          Edit profile
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-blackA9 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
            Edit profile
          </Dialog.Title>
          <Dialog.Description className="mt-[10px] mb-5 text-[15px] leading-normal text-mauve11">
            Make changes to your profile here. Click save when you're done.
          </Dialog.Description>
          <fieldset className="mb-[15px] flex items-center gap-5">
            <label
              className="w-[90px] text-right text-[15px] text-violet11"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
              id="name"
              defaultValue="Pedro Duarte"
            />
          </fieldset>
          <fieldset className="mb-[15px] flex items-center gap-5">
            <label
              className="w-[90px] text-right text-[15px] text-violet11"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
              id="username"
              defaultValue="@peduarte"
            />
          </fieldset>
          <div className="mt-[25px] flex justify-end">
            <Dialog.Close asChild>
              <button className="inline-flex h-[35px] items-center justify-center rounded-[4px] bg-green4 px-[15px] font-medium leading-none text-green11 hover:bg-green5 focus:shadow-[0_0_0_2px] focus:shadow-green7 focus:outline-none">
                Save changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
