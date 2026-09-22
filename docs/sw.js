/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "wedding-logo.svg",
    "revision": "198ac13d86d0186964e607b927b9b620"
  }, {
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "bec3f5c3948f6416bba006d2e33d9cba"
  }, {
    "url": "pwa-512x512.png",
    "revision": "fa51ebf927e474910ce46566196bdb16"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a6d9a4cc573ac7c63733f75dc60ff1f3"
  }, {
    "url": "index.html",
    "revision": "130bf1e32f7f5f05e3b07173a42f91d3"
  }, {
    "url": "favicon-32x32.png",
    "revision": "b6d197c90322ee8dc48a0037ea53627a"
  }, {
    "url": "favicon-16x16.png",
    "revision": "fe174556ec3ba6352bbd510263365510"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "df6efe19d63572cb58cf4ccb67ce288c"
  }, {
    "url": "404.html",
    "revision": "eebb222700d515b542544e969ca254e5"
  }, {
    "url": "assets/wedding-logo-DPjj-ugc.svg",
    "revision": null
  }, {
    "url": "assets/index-BzqxaXU0.css",
    "revision": null
  }, {
    "url": "assets/index-BJ2zKD5C.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "df6efe19d63572cb58cf4ccb67ce288c"
  }, {
    "url": "favicon-16x16.png",
    "revision": "fe174556ec3ba6352bbd510263365510"
  }, {
    "url": "favicon-32x32.png",
    "revision": "b6d197c90322ee8dc48a0037ea53627a"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a6d9a4cc573ac7c63733f75dc60ff1f3"
  }, {
    "url": "pwa-512x512.png",
    "revision": "fa51ebf927e474910ce46566196bdb16"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "bec3f5c3948f6416bba006d2e33d9cba"
  }, {
    "url": "wedding-logo.svg",
    "revision": "198ac13d86d0186964e607b927b9b620"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
