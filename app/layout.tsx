import { GetServerSideProps } from "next";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <head></head>

      <body>
        <div className="h-52">aaaaaaaaaaa</div>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
