import { type TreeSchema, type TreeStylesSchema } from "~/utils/types";
import Image from "next/image";
import { useSession } from "next-auth/react";

function TreeView({
  tree,
  styles,
}: {
  tree: TreeSchema;
  styles: TreeStylesSchema;
}) {
  console.log(tree, styles);
  const session = useSession();
  if (!tree) return <div>none</div>;

  const { buttonStyle } = styles;
  let bgColor = styles?.buttonStyle?.buttonColor ?? "black";
  if (buttonStyle?.outline) bgColor = "transparent";

  return (
    <>
      <style jsx global>
        {`
          :root {
            --shadow-color: ${buttonStyle?.shadowColor ?? "black"};
            --button-color: ${buttonStyle?.buttonColor ?? "black"};
            font-family: ${styles?.fontFamily ?? "sans-serif"};
          }
          .border-pad {
            padding: ${buttonStyle?.outline ? 0.8 : 1}em 1em;
          }

          .button{
            margin: 0.5rem 0.5rem;
            border: ${buttonStyle?.outline
                  ? `.2em solid ${buttonStyle.buttonColor}`
                  : `0px solid ${buttonStyle?.buttonColor ?? "white"}`};
            background: ${bgColor};
            color: ${buttonStyle?.textColor ?? "white"};
            ${buttonStyle?.shadow == "hard" ? "box-shadow: -0.4em 0.4em 0 0px var(--shadow-color);" : ""}
            ${buttonStyle?.shadow == "soft" ? "box-shadow: 0 0 15px black;" : ""}
            ${buttonStyle?.roundness == "full" ? "border-radius: 9999px;" : ""}
            ${buttonStyle?.roundness == "medium" ? "border-radius: 0.8em;" : ""}
          }
          .button:hover{ 
              ${buttonStyle?.shadow == "hard" ? "box-shadow: -0.2em 0.2em 0 0px var(--shadow-color);transform: translate(-0.2em, 0.2em);" : ""}
              ${buttonStyle?.shadow == "soft" &&!buttonStyle.outline ? "transform: scale(98%);" : ""}
              ${buttonStyle?.shadow == "none" &&!buttonStyle.outline ? "transform: scale(98%);" : ""}
              background-color: var(--button-color);
          }
          .button:active{ 
              transform: scale(95%);
          }
        `}
      </style>

      <div className="flex w-[40em] min-w-min max-w-full flex-1 flex-col items-center">
        <Image
          width={128}
          height={128}
          className="mt-8 w-[8em] cursor-pointer rounded-full border-4 bg-stone-500 shadow-md"
          src={session?.data?.user.image ?? ""}
          alt="user image"
        />
        {tree.map((n, index) => {
          return n.type == "header" ? (
            <h1
              className="my-4 break-all text-[2em] font-bold transition-all duration-300"
              key={index}
              style={{
                color: styles?.textColor ?? "white",
              }}
            >
              {n.text}
            </h1>
          ) : (
            <a
              href={n.link}
              key={index}
              className={`background button page-button-anim border-pad flex w-full justify-center transition-all duration-100`}
            >
              <div className="text-lg text-center font-medium">{n.text}</div>
            </a>
          );
        })}
      </div>
    </>
  );
}

export default TreeView;
