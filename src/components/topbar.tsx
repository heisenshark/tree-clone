/* eslint-disable @typescript-eslint/no-misused-promises */
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { useRouter } from "next/router";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function TopBar() {
  const session = useSession();
  const router = useRouter();
  const arg = router.query.cokolwiek ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (arg !== "") return <></>;
  return (
    <div className="flex items-center justify-center bg-red-100">
      <div className="fixed flex w-full justify-center bg-white drop-shadow-xl">
        <div className="top-0 flex h-10 w-full max-w-5xl flex-row items-center justify-end bg-white">
          <Link className="mr-auto md:ml-4 " href="/">
            <h1 className="pl-4 text-2xl font-bold text-black drop-shadow-xl">
              TR<span className="text-lime-900">EE</span> CLON
              <span className="text-lime-900">E</span>
            </h1>
          </Link>
          {session.data?.user ? (
            <>
              <Link className="mx-2 mmd:hidden" href="/admin">
                Admin
              </Link>
              <a
                className="mx-2 cursor-pointer mmd:hidden"
                onClick={() => {
                  signOut()
                    .then(() => {
                      console.log("upa");
                    })
                    .catch(() => {
                      console.log("upa");
                    });
                }}
              >
                Sign Out
              </a>
              <span className="mx-2 text-slate-900 mmd:hidden">
                {session.data?.user.name}
              </span>
              <Image
                width={128}
                height={128}
                className="mr-4 w-8 cursor-pointer rounded-full bg-slate-500 shadow-md shadow-stone-500 hover:scale-105 mmd:hidden"
                src={session.data?.user.image ?? ""}
                alt="user image"
                onClick={async () => {
                  await router.push("/admin");
                }}
              />
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button className="mr-2 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none text-violet11 shadow-[0_2px_10px] shadow-blackA7 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none md:hidden">
                    <svg viewBox="0 0 100 100">
                      <rect
                        x="10"
                        y="20"
                        width="80"
                        height="10"
                        fill="#000000"
                      />
                      <rect
                        x="10"
                        y="45"
                        width="80"
                        height="10"
                        fill="#000000"
                      />
                      <rect
                        x="10"
                        y="70"
                        width="80"
                        height="10"
                        fill="#000000"
                      />
                    </svg>
                    <span>Menu</span>
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-blackA9 md:hidden" />
                  <Dialog.Content className="fixed top-0 right-0 h-full w-2/3 animate-translate-right bg-white p-[25px] duration-300 md:hidden">
                    <Dialog.Title className="m-0 mt-4 text-4xl font-bold text-mauve12">
                      User menu
                    </Dialog.Title>
                    <nav>
                      <ul className="mt-4 text-3xl underline">
                        <li>
                          <Dialog.Close asChild>
                            <Link className="" href="/admin">
                              Admin page
                            </Link>
                          </Dialog.Close>
                        </li>
                        <li>
                          <span className=" text-slate-900">
                            {session.data?.user.name}
                          </span>
                        </li>
                        <li>
                          <a
                            className=""
                            onClick={async () => {
                              await signOut();
                            }}
                          >
                            Sign Out
                          </a>
                        </li>
                        <li>
                          <Image
                            width={128}
                            height={128}
                            className="mr-4 w-8 cursor-pointer rounded-full bg-slate-500 shadow-md shadow-stone-500 hover:scale-105 mmd:hidden"
                            src={session.data?.user.image ?? ""}
                            alt="user image"
                            onClick={async () => {
                              await router.push("/admin");
                            }}
                          />
                        </li>
                      </ul>
                    </nav>
                    <Dialog.Close asChild>
                      <button
                        className="absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                        aria-label="Close"
                      >
                        <svg viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="#ff0000"
                            stroke="#000000"
                            stroke-width="3"
                          />
                          <text
                            x="50"
                            y="50"
                            text-anchor="middle"
                            font-size="40"
                            font-weight="bold"
                            fill="#ffffff"
                          >
                            X
                          </text>
                        </svg>
                      </button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
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
      {/* <div className="fixed top-0 right-0 h-screen w-2/3 bg-red-500"></div> */}
    </div>
  );
}
