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

  // useEffect(() => {
  //   chrome.storage.sync.set({ color: currentColor });
  // }, [currentColor]);

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
            <a
              key={linkOrSearchWord.id}
              href={
                isLink(linkOrSearchWord)
                  ? linkOrSearchWord.url
                  : `https://www.google.com/search?q=${linkOrSearchWord.word}`
              }
              target="_blank"
            >
              <span className="text-xs text-gray-500">
                Saved at {new Date(linkOrSearchWord.created).toLocaleString()}
              </span>
              <div className="p-2 border border-blue-500 rounded  hover:text-blue-600">
                <div className=" text-sm">
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
