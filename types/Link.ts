import { Site } from "./Site";

export function isLink(x: any): x is Link {
  return x && !!x["url"];
}

export type Link = {
  id: string;
  url: string;
  title: string;
  memo: string;
  created: string;
  siteId?: Site["id"];
};
