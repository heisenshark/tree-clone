import { type } from "os";
import { z } from "zod";

type TreeContent = {
  type: "header" | "link";
  text: string;
  link?: string;
}[];

const treeType = z.array(
  z
    .object({
      type: z.string(),
      text: z.string(),
    })
    .passthrough()
);

function parseTreeString(treeString: string) {
  if (!(typeof treeString == "string")) return [];
  try {
    return treeType.parse(JSON.parse(treeString));
  } catch (e) {
    console.log(e);
    return [];
  }
}


export { parseTreeString, treeType };
export type { TreeContent };
