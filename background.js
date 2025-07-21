"use strict";

chrome.runtime.onInstalled.addListener(() => {
  // Execute content scripts for existing tabs when extension installed/reloaded.
  addClickEventListenerToExistingTab();
});

const addClickEventListenerToExistingTab = async () => {
  chrome.tabs.query(
    {
      url: "*://*/*", // only http:// or https:// page
    },
    (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url.includes("ipm.macwin.pt")) {
          chrome.scripting.executeScript(
            {
              files: ["content_script.js"],
              target: {
                tabId: tab.id,
                allFrames: true,
              },
            },
            (result) => {
              if (typeof result === "undefined") {
                const message = chrome.i18n.getMessage("page_not_loaded");
                console.info(message, tab);
              }
            }
          );
        }
      });
    }
  );
};

chrome.extension.isAllowedFileSchemeAccess().then((isAllowed) => {
  const key = "isAllowedFileSchemeAccess.prev";
  chrome.storage.local.get(key, (result) => {
    const prevValue = result[key];
    if (typeof prevValue === "boolean") {
      if (prevValue !== isAllowed) {
        addClickEventListenerToExistingTab();
      }
    }
    chrome.storage.local.set({
      [key]: isAllowed,
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.method === "openLocalFile") {
    const localFileUrl = message.localFileUrl;
    const tab = sender.tab;
    openTab(localFileUrl, tab, (createdTab) => {
      // When set using GPO, chrome.extension.isAllowedFileSchemeAccess returns false but tabs can be opened
      // Therefore, it is determined whether the tab can actually be opened.
      if (!createdTab) {
        // If the tab doesn't open
        openTab(
          chrome.runtime.getURL("/options/index.html#need-file-scheme-access"),
          tab
        );
      }
    });
  }
});

const openTab = (url, baseTab, callback = () => {}) => {
  chrome.tabs.create(
    {
      url,
      index: baseTab.index + 1,
    },
    callback
  );
};

// background.js (Service Worker)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .open("my-cache")
      .then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response; // Return the cached response if available
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone()); // Cache the network response
            return networkResponse;
          });
        });
      })
      .catch((error) => {
        console.error("Cache operation failed:", error);
        return fetch(event.request); // Fallback to network if cache fails
      })
  );
});
