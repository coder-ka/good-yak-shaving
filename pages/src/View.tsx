import React, { useEffect, useState } from "react";
import { isLink, Link } from "../../types/Link";
import { Site } from "../../types/Site";
import { SearchWord } from "../../types/SearchWord";

function View() {
  const [links, setLinks] = useState<Link[] | undefined>([]);
  const [sites, setSites] = useState<Site[] | undefined>([]);
  const [searchWords, setSearchWords] = useState<SearchWord[] | undefined>([]);

  useEffect(() => {
    chrome.storage.local.get(["links", "sites", "searchWords"], (data) => {
      setLinks(data.links);
      setSites(data.sites);
      setSearchWords(data.searchWords);
    });
  }, []);

  if (
    (links === undefined || links.length === 0) &&
    (searchWords === undefined || searchWords.length === 0)
  ) {
    return <div className="p-4 text-lg">There is no items yet.</div>;
  }

  return (
    <div className="text-base p-4 flex flex-col gap-y-3">
      {([] as (Link | SearchWord)[])
        .concat(links || [])
        ?.concat(searchWords || [])
        ?.sort((a, b) => {
          if (a.created < b.created) return 1;
          if (a.created > b.created) return -1;
          return 0;
        })
        .map((linkOrSearchWord) => {
          function seekParentSites(seeked: Site[]): Site[] {
            const linkFound = links?.find((x) => x.url === seeked[0].url);
            const parentSiteFound = linkFound
              ? sites?.find(
                  (site) =>
                    site.id === linkFound.siteId &&
                    seeked.every((s) => s.id !== site.id)
                )
              : undefined;

            if (parentSiteFound) {
              return [parentSiteFound].concat(seeked);
            }

            return seeked;
          }
          const parentSite = sites?.find(
            (x) => x.id === linkOrSearchWord.siteId
          );
          const parentSites = parentSite ? seekParentSites([parentSite]) : [];

          return (
            <div className="max-w-[480px]">
              <span className="text-xs text-gray-500">
                Saved at {new Date(linkOrSearchWord.created).toLocaleString()}
              </span>
              <div className=" border border-blue-500 rounded  hover:text-blue-600 relative">
                <div className="absolute right-0 top-0">
                  <button
                    className="flex justify-center items-center w-[24px] h-[24px] border rounded bg-red-800 text-white"
                    onClick={(e) => {
                      const newLinks = links?.filter(
                        (x) => x.id !== linkOrSearchWord.id
                      );
                      setLinks(newLinks);
                      const newSearchWords = searchWords?.filter(
                        (x) => x.id !== linkOrSearchWord.id
                      );
                      setSearchWords(newSearchWords);

                      chrome.storage.local.set({
                        links: newLinks,
                        searchWords: newSearchWords,
                      });

                      e.stopPropagation();
                    }}
                  >
                    ×
                  </button>
                </div>
                <a
                  key={linkOrSearchWord.id}
                  href={
                    isLink(linkOrSearchWord)
                      ? linkOrSearchWord.url
                      : `https://www.google.com/search?q=${linkOrSearchWord.word}`
                  }
                  target="_blank"
                >
                  <div className="p-2 text-sm">
                    <div>
                      {parentSites.map((s) => (
                        <BreadcrumbItem key={s.id} site={s}></BreadcrumbItem>
                      ))}
                    </div>
                    <div className="p-2 whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {isLink(linkOrSearchWord)
                        ? linkOrSearchWord.title || linkOrSearchWord.url
                        : `Search "${linkOrSearchWord.word}" in Google.`}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default View;

function BreadcrumbItem({ site }: { site: Site }) {
  return (
    <div className="flex items-center">
      <span className="text-gray-500 mr-1">&gt;</span>
      <a
        href={site.url}
        target="_blank"
        className="text-blue-400 hover:underline"
      >
        {site.title}
      </a>
    </div>
  );
}
