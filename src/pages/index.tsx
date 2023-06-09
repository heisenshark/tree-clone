import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tree Clone</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <header className="bg-gray-800 pb-20 pt-8">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="mb-4 text-center text-9xl font-bold text-white">
            TR<span className="text-green-200">EE</span> CLON
            <span className="text-green-200">E</span>
          </h1>
          <h1 className="mb-4 text-5xl font-bold text-white">
            Share All Your Social Links in One Place
          </h1>
          <p className="mb-8 leading-7 text-gray-300">
            Social Linker allows you to easily share multiple social media
            profiles with just one URL. Share your profiles with friends,
            family, and followers with ease.
          </p>
          <Link
            href="/admin"
            className="rounded-lg bg-blue-500 py-4 px-8 font-bold text-white shadow-md hover:bg-blue-600"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 ">
        <div className="px-4 py-6 sm:px-0 ">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold leading-tight text-gray-900">
                Features
              </h2>
              <p className="mt-2 text-gray-500">With tree links, you can:</p>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li className="rounded-lg bg-white shadow">
                <div className="px-6 py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <i className="fab fa-facebook-f"></i>
                  </div>
                  <h3 className="mt-6 text-xl font-bold leading-tight text-gray-900">
                    Share your Facebook page
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Easily share your Facebook page with just one link. Your
                    friends and followers will be able to see all your social
                    media profiles in one place.
                  </p>
                </div>
              </li>
              <li className="rounded-lg bg-white shadow">
                <div className="px-6 py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <i className="fab fa-twitter"></i>
                  </div>
                  <h3 className="mt-6 text-xl font-bold leading-tight text-gray-900">
                    Share your Twitter profile
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Make it easy for your followers to find you on Twitter by
                    sharing your profile with just one link.
                  </p>
                </div>
              </li>
              <li className="rounded-lg bg-white shadow">
                <div className="px-6 py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <i className="fab fa-instagram"></i>
                  </div>
                  <h3 className="mt-6 text-xl font-bold leading-tight text-gray-900">
                    Share your Instagram profile
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Allow your followers to easily follow you on Instagram by
                    sharing your profile with just one link.
                  </p>
                </div>
              </li>
              <li className="rounded-lg bg-white shadow">
                <div className="px-6 py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <i className="fab fa-linkedin-in"></i>
                  </div>
                  <h3 className="mt-6 text-xl font-bold leading-tight text-gray-900">
                    Share your LinkedIn profile
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Make it easy for potential employers and colleagues to
                    connect with you on LinkedIn by sharing your profile with
                    just one link.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <footer className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Tree Clone. 2023</p>
        </div>
      </footer>
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
      {!sessionData ? (
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          Get Started
        </button>
      ) : (
        <Link
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          href={"/admin"}
        >
          Admin your links
        </Link>
      )}
    </div>
  );
};
