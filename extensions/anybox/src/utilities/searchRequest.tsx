import fetch from "node-fetch";
import { handleError } from "./fetch";
import { URLSearchParams } from "url";
import { getPreferenceValues, showToast, Toast } from "@raycast/api";

interface Tag {
  name: string;
  originalName: string;
  color: string;
  icon: string;
}

export interface SearchQuery {
  // Search keyword
  q?: string;

  // Identifier of Smart List.
  // Limit search scope to one specific Smart List.
  filter?: string;

  // Identifier of tag.
  // Limit search scope to one specific tag.
  tag?: string;

  // Limit search scope to starred or unstarred.
  starred?: "yes" | "no";

  // If search link descriptions
  linkDescriptions?: "yes" | "no";

  // If search should support Pinyin.
  pinyin: "yes" | "no";

  // Bookmarks returned. 50 is the default and the maximum
  limit?: number;
}

export interface Link {
  tags: Tag[];
  dateLastOpened: string;
  dateAdded: string;
  preferredBrowser: string;
  host: string;
  id: string;
  isStarred: boolean;
  title: string;
  url: string;
  description: string;
  comment: string;
  hasLinkImage: boolean;
}

export interface Preferences {
  api_key: string;
  usePinyin: boolean;
  searchTags: boolean;
  searchLinkDescriptions: boolean;
}

export default async function searchRequest(query: SearchQuery): Promise<[Link]> {
  const preferences: Preferences = getPreferenceValues();
  if (preferences.searchLinkDescriptions) {
    query.linkDescriptions = "yes";
  }
  // @ts-expect-error: Don’t know how to satify URLSearchParams’s type.
  const searchParams = new URLSearchParams(query);
  return fetch("http://127.0.0.1:6391/search?" + searchParams, {
    method: "GET",
    headers: {
      "x-api-key": preferences.api_key,
    },
  })
    .then(async (res) => {
      if (res.status === 200) {
        return res.json();
      } else if (res.status === 401) {
        // Incorrect API key
        const options: Toast.Options = {
          style: Toast.Style.Failure,
          title: "Incorrect API Key",
          message: "Go to Anybox › Preferences › General to copy API key.",
        };
        await showToast(options);
      } else {
        return res.text().then((text) => {
          throw new Error(text);
        });
      }
    })
    .catch((error) => {
      handleError(error);
    }) as Promise<[Link]>;
}
