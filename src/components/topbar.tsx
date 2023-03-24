import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import Link from "next/link";
import Router from "next/router";
import { useRouter } from "next/router";
export default function TopBar() {
  const session = useSession();
  const router = useRouter();
  const arg = router.query.cokolwiek ?? "";
  if (arg !== "") return <></>;
  return (
    <div className="flex items-center justify-center bg-red-100 shadow-md">
      <div className="fixed flex w-full justify-center bg-white">
        <div className="top-0 flex h-10 w-full max-w-[100rem] flex-row items-center justify-end bg-white">
          <Link className="mr-auto ml-4 " href="/">
            <h1 className="p-4 text-2xl font-bold text-black drop-shadow-xl">
              TR<span className="text-lime-900">EE</span> CLON
              <span className="text-lime-900">E</span>
            </h1>
          </Link>
          {session.data?.user ? (
            <>
              <Link className="mx-2" href="/admin">
                Admin
              </Link>
              <a
                className="mx-2 cursor-pointer"
                onClick={async () => {
                  await signOut();
                }}
              >
                Sign Out
              </a>
              <span className="mx-2 text-slate-900">
                {session.data?.user.name}
              </span>
              <Image
                width={128}
                height={128}
                className="mr-4 w-8 cursor-pointer rounded-full bg-slate-500 shadow-md shadow-stone-500 hover:scale-105"
                src={session.data?.user.image ?? ""}
                alt="user image"
                onClick={async () => {
                  await router.push("/admin");
                }}
              />
            </>
          ) : (
            <button
              className="mr-4 shadow-stone-500"
              onClick={async () => {
                await signIn();
              }}
            >
              Login/Sign In
            </button>
          )}
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
}
