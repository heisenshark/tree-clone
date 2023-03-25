import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-auto flex-col items-center justify-center bg-gradient-to-b from-lime-600 to-lime-900 pb-10">
        <h1 className="my-12 p-4 text-[5rem] font-bold text-white sm:text-9xl">
          TR<span className="text-lime-300">EE</span> CLON
          <span className="text-lime-300">E</span>
        </h1>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <AuthShowcase />
        </div>
        <div className="m-10 flex h-80 w-10/12 max-w-screen-lg flex-row border-b-2 p-10">
          <div className="w-1/2 text-4xl text-white sm:text-6xl">
            All of your social media, in one place
          </div>
          {/* <div>elo</div> */}
        </div>
        <div className="m-10 h-80 w-10/12 max-w-screen-lg border-b-2 p-10">
          <div className="w-1/2 text-4xl text-white sm:text-6xl">
            Add all of your links into multiple tree links
          </div>
        </div>
        <div className="m-10 h-80 w-10/12 max-w-screen-lg border-b-2 p-10">
          <div className="w-1/2 text-4xl text-white sm:text-6xl">
            Every user can create up to 20 trees
          </div>
        </div>
        <div className="m-10 h-80 w-10/12 max-w-screen-lg border-b-2 p-10">
          <div className="w-1/2 text-4xl text-white sm:text-6xl">
            U can describe and customize the list
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
// export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
