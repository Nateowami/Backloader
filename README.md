Backloader
==========

A browser extension to redirect HTTP requests to other URLs
**Firefox WebExtension Compatible!**

Some CDNs are extremely fast in one place and extremely slow or outright blocked in another. When a webpage makes a request for a file from a CDN (Content Delivery Network), Backloader can redirect the request to another, hopefully faster, CDN. This decreases page load time dramatically. In some cases, Backloader will outright block requests for files that aren't needed and are slow in loading (for example, fonts, or scripts that simply allow for compatibility with another browser). **Of course, this can also cause problems, so if you ever experience problems, you should disable Backloader and try again.**

Browser Compatibility
============
| Tested Browsers              | Compatibility | Notes              |
|------------------------------|---------------|--------------------|
| Google Chrome                | 100%          |
| Chromium                     | 100%          |
| Firefox Nightly Builds (44)  | 90%           | Requires work-arounds in-code. Popup doesn't auto-update with the latest information. Tabs appear to be loading infinitely when navigating to a blocked url.
| Opera                        | 100%          |
| Vivaldi (1.0.252.3-snapshot+)| 100%          |
| Maxathon                     | 99%           | Requires unsupported manual installation method.

Installation
============

1. Download the latest release from https://github.com/Nateowami/Backloader/releases/latest.
2. Open chrome://extensions/ or equivalent, according to your browser.
3. Open your downloads folder, or wherever you saved Backloader when you downloaded it.
4. Drag the file (Backloader.crx) from its folder to your browser's extensions page.
5. The browser will ask you to confirm that you want to install the file. Click "Add."

That's it! If you experience any issues try disabling Backloader by clicking on the extension's icon and clicking "Disable."

Future Plans
============

* Expand default filter list
* Fix bug whereby blocked-count (and possibly redirect-count) sometimes become undefined
