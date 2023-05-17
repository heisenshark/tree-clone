import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import TopBar from "~/components/topbar";
import { Provider } from "jotai";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Provider>
        <div className="flex h-screen flex-col">
          <TopBar></TopBar>
          <Component {...pageProps} />
        </div>
      </Provider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
