import { type TreeSchema, type TreeStylesSchema } from "~/utils/types";

function TreeView({
  tree,
  styles,
  himassage,
}: {
  tree: TreeSchema;
  styles: TreeStylesSchema;
  himassage?: string;
}) {
  console.log(tree, himassage, styles);

  if (!tree) return <div>none</div>;
  return (
    <div className="flex w-[40em] min-w-min max-w-full flex-1 flex-col items-center">
      {tree.map((n, index) => {
        return n.type == "header" ? (
          <h1 className="my-4 break-all text-2xl font-bold" key={index}>
            {n.text}
          </h1>
        ) : (
          <a
            href={n.link}
            key={index}
            className="my-2 flex w-full justify-center rounded-full border-2 bg-red-300 p-2 py-4 transition-all duration-100 active:scale-95"
            style={{
              color: styles?.buttonStyle?.textColor ?? "white",
              boxShadow: styles.buttonStyle?.shadow
                ? `-0.4em 0.4em 0 0px ${
                    styles?.buttonStyle?.shadowColor ?? "white"
                  }`
                : "none",
              backgroundColor: styles?.buttonStyle?.buttonColor ?? "black",
            }}
          >
            <div className="text-md text-center font-medium">{n.text}</div>
          </a>
        );
      })}
    </div>
  );
}

export default TreeView;
