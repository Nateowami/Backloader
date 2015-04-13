Backloader
==========

A Chrome extension to redirect CDN requests to another CDN

Some CDNs are extremely fast in one place and extremely slow or outright blocked in another. When a webpage makes a request for a JavaScript file from a CDN (Content Delivery Network), Backloader can redirect the request to another, hopefully faster, CDN. This decreases page load time dramatically. In some cases, Backloader will outright block requests for files that aren't needed and are slow in loading (for example, fonts, or scripts that simply allow for compatibility with another browser). **Of course, this can also cause problems, so if you ever experience problems, you should disable Backloader and try again.**

Installation
============

1. Download the latest release from https://github.com/Nateowami/Backloader/releases/latest.
2. Open <a href="chrome://extensions/">chrome://extensions/</a>.
3. Open your downloads folder.
4. Drag the file (Backloader.crx) from its folder to Chrome on the extensions page.
5. Chrome will ask you to confirm that you want to install the file. Click "Add."

That's it! If you experience any issues try disabling Backloader by clicking on the extension's icon and deselecting "Enable redirects and blocking."

Future Plans
============

* Expand default filter list
* Fix bug whereby blocked-count (and possibly redirect-count) sometimes become undefined
