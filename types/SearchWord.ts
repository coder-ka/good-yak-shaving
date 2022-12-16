import { Site } from "./Site";

export type SearchWord = {
  id: string;
  word: string;
  created: string;
  siteId: Site["id"];
};
