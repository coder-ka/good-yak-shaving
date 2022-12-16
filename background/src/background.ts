import { nanoid } from "nanoid";
import { Link } from "../../types/Link";
import { SearchWord } from "../../types/SearchWord";
import { Site } from "../../types/Site";

type ContextMenuId =
  | "save-link"
  | "save-selection-as-search-word"
  | "save-current-page"
  | "open-view-page";

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "save-link",
    title: "Save link for later",
    type: "normal",
    contexts: ["link"],
  });

  chrome.contextMenus.create({
    id: "save-selection-as-search-word",
    title: "Save selection as search word for later",
    type: "normal",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "save-current-page",
    title: "Save current page for later",
    type: "normal",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "open-view-page",
    title: "View saved items.",
    type: "normal",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((item) => {
  const id = item.menuItemId as ContextMenuId;
  switch (id) {
    case "save-link":
      if (item.linkUrl && item.pageUrl) {
        const now = new Date().toISOString();
        chrome.storage.local.get(["links", "sites"], async (result) => {
          const { sites, links } = result as {
            sites?: Site[];
            links?: Link[];
          };

          const siteFound = sites?.find((site) => site.url === item.pageUrl);
          const site = siteFound || {
            id: nanoid(12),
            url: item.pageUrl!,
            created: now,
            title: await getPageTitle(item.pageUrl),
          };

          const linkFoundIndex = links?.findIndex(
            (link) => link.url === item.linkUrl
          );
          const linkFound = links && linkFoundIndex && linkFoundIndex !== -1;
          if (linkFound) {
            links[linkFoundIndex].created = now;
          }

          chrome.storage.local.set({
            links: (links || []).concat(
              linkFound
                ? []
                : [
                    {
                      id: nanoid(12),
                      url: item.linkUrl!,
                      title: await getPageTitle(item.linkUrl!),
                      memo: "",
                      created: now,
                      siteId: site.id,
                    },
                  ]
            ),
            sites: (sites || []).concat(siteFound ? [] : [site]),
          });
        });
      }
      break;
    case "save-selection-as-search-word":
      if (item.selectionText && item.pageUrl) {
        const now = new Date().toISOString();
        chrome.storage.local.get(["searchWord", "sites"], async (result) => {
          const { sites, searchWords } = result as {
            sites?: Site[];
            searchWords?: SearchWord[];
          };

          const siteFound = sites?.find((site) => site.url === item.pageUrl);
          const site = siteFound || {
            id: nanoid(12),
            url: item.pageUrl!,
            created: now,
            title: await getPageTitle(item.pageUrl),
          };

          const searchWordFoundIndex = searchWords?.findIndex(
            (searchWord) => searchWord.word === item.selectionText
          );
          const searchWordFound =
            searchWords && searchWordFoundIndex && searchWordFoundIndex !== -1;
          if (searchWordFound) {
            searchWords[searchWordFoundIndex].created = now;
          }

          chrome.storage.local.set({
            searchWords: (searchWords || []).concat(
              searchWordFound
                ? []
                : [
                    {
                      id: nanoid(12),
                      word: item.selectionText!,
                      created: now,
                      siteId: site.id,
                    },
                  ]
            ),
            sites: (sites || []).concat(siteFound ? [] : [site]),
          });
        });
      }
      break;
    case "save-current-page":
      if (item.pageUrl) {
        const now = new Date().toISOString();
        chrome.storage.local.get(["links"], async (result) => {
          const { links } = result as {
            links?: Link[];
          };

          chrome.storage.local.set({
            links: (links || []).concat([
              {
                id: nanoid(12),
                url: item.pageUrl!,
                title: await getPageTitle(item.pageUrl!),
                memo: "",
                created: now,
              },
            ]),
          });
        });
      }
      break;
    case "open-view-page":
      chrome.tabs.create({
        url: "pages/view.html",
      });
    default:
      break;
  }
});

async function getPageTitle(url: string) {
  return await fetch(url, {
    method: "GET",
  }).then(async (res) => {
    if (res.status === 200) {
      const text = await res.text();
      const match = /.*<title>(.+)<\/title>.*/m.exec(text);
      return match ? match[1] : "";
    } else {
      return "";
    }
  });
}
