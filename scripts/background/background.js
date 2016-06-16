var filterList = [];

var splitTabPage = {
	protocol: null,
	path: null,
};

// Set "enabled" to true on first run
chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason === "install"){
		chrome.storage.local.set({
			"enabled": true,
			"redirected": 0,
			"blocked": 0,
			"filter-list": defaultFilterList,
		});
	}
});

// Listen for updates to local storage
chrome.storage.onChanged.addListener(updateEnabled);

// Update backloader.enabled when it get's changed in local storage
function updateEnabled(changes, namespace) {
	for (key in changes) {
		var change = changes[key];
		// Only do something if it's "enabled" that gets updated
		if(namespace == "local") {
			if(key == "enabled") {
				backloader.enabled = change.newValue;
                setIcon(backloader.enabled);
				console.log("Updated local-storage-enable-status from " + change.oldValue + " to " + change.newValue);
				
			} else if(key == "filter-list") {
				loadFilterList(function(list) {
					filterList = list;
				});
			}
		}
	}
}

var backloader = {
	"redirected": 0,
	"blocked": 0,
	"enabled": true,
	
	/**
	* Increments the value indicated by key (may be "redirected"
	* or "blocked").
	* @param {String} key - The variable to increment.
	*/
	increment: function(key){
		var obj = {};
		obj[key] = ++this[key];
		chrome.storage.local.set(obj);
		console.log("Updated " + key + " to " + this[key] + ".");
	}
};

// Initialize after loading the filter list
loadFilterList(function(list) {
	filterList = list;
	init();
});

loadEnabled(function(enabled) {
	backloader.enabled = enabled;
	setIcon(enabled);
});

function init() {
	// Update the current tab URL every time the tab changes.
	chrome.tabs.onActivated.addListener(function(data) {
		chrome.tabs.get(data.tabId, function(ret) {
			splitTabPage = splitByProtocol(ret.url);
		});
	});

	// Register an event listener for all web requests.
	chrome.webRequest.onBeforeRequest.addListener(manageRequest, {urls: ["<all_urls>"]}, ["blocking"]);
}

/**
* Manages a webrequest, redirecting or blocking as necessary. Called
* directly by Chrome when the onBeforeRequest event fires.
* @param request - The webrequest.
*/
function manageRequest(request) {
	// Only run if filtering is enabled
	if(!backloader.enabled) return;
	
	for(var r = 0; r < filterList.length; r++) {
		if(!filterList[r].isEnabled) continue;
		
		var list = filterList[r];
		// Only run the rule checks if this list is meant to be active on this page.
		if(list.activePage == null || list.activePage == "" || list.activePage == " ") {
			// Using || instead of && for speed.
		} else {
			var splitActivePage = splitByProtocol(list.activePage);
			// If this list is not active on this page, skip it.
			if(!match(splitActivePage.path, splitTabPage.path))
				continue;
		}
		
		for(var i = 0; i < list.rules.length; i++) {
			var rule = list.rules[i];
			var requestUrl = request.url;
			var testUrl = rule.src;
			
			// Just in-case someone leaves a field entirely whitespace.
			if(testUrl == null || testUrl == "" || testUrl == " ") continue;
			
			// Split up the URLs into protocols and paths
			var splitRequestUrl = splitByProtocol(requestUrl);
			var splitTestUrl = splitByProtocol(testUrl);
			
			if(match(splitTestUrl.path, splitRequestUrl.path)) {
				if(rule.dest != null && rule.dest != "" && match(rule.dest, requestUrl))
					continue;
					
				var splitTargetUrl = splitByProtocol(rule.dest);
				var protocol = splitRequestUrl.protocol;
				
				if(splitTargetUrl.protocol != null) {
					protocol = splitTargetUrl.protocol;
				}
				
				var redirect = redirectUrl(
					splitTestUrl.path,
					splitTargetUrl.path,
					splitRequestUrl.path,
					protocol
				);

				if(redirect) {
					console.log("Redirecting "+request.url+" to " + redirect);
					backloader.increment("redirected");
					return {redirectUrl: redirect};
					
				} else {
					//block the request
					console.log("Blocking " + request.url);
					backloader.increment("blocked");
					return {cancel: true};
				}
			};
		}
	}
}

function removeUrlObjProtocol(urlObj) {
	return urlObj.href.split(urlObj.protocol).join("");
}

/**
* Returns a complete list of URLs to filter.
*/
function loadFilterList(cb) {
	chrome.storage.local.get("filter-list", function(storageResults) {
		cb ? cb(storageResults["filter-list"]) : null;
	});
}

function loadEnabled(cb) {
	chrome.storage.local.get("enabled", function(storageResults) {
		cb ? cb(storageResults["enabled"]) : null;
	});
}


/**
* Tells if the parameters source and target match, including wildcards
* which may be present in the source.
* @param {String} source - The URL to match, which may include '*' as
* wildcards, matching one or more of any character.
* @param {String} target - The URL to test against.
* @return {Boolean} Tells if target matches source.
*/
function match(source, target) {
	return new RegExp(escapeUrl(source)).test(target);
}

/**
* Calculates a redirect URL given source and target (optionally
* containing wildcards), and the URL requested, by replaceing wildcards
* in target with their respective matches in url. For example,
* redirectUrl("*nowhere*", "*somewhere*", "http://nowhere.nil") returns
* "http://somewhere.nil".
* @param {String} source - A string optionally with wildcards, matching
* url.
* @param {String} target - A string optionally with wildcards matching
* url.
* @param {String} url - The string from which to find matches for
* wildcards.
* @return A string like url, with values matching source chagned to those
* in target. Or, if no target is provided, false.
*/
function redirectUrl(source, target, url, protocol){
	var protocol = protocol ? protocol : "";
	
	if(!target) return false;
	//a list of concrete values for the wildcards
	var matches = url.match(new RegExp(escapeUrl(source)));
	//a list of the non-wildcard parts of target
	var targetSplit = target.split("*");
	//now we join the two, taking every other, starting with targetSplit
	var joined = targetSplit[0];
	
	//i = 1 because targetSplit[0] has been appended above, and because
	//matches[0] is the same as url
	if(matches) {
		for(var i = 1; i < matches.length; i++){
			joined += matches[i] + targetSplit[i];
		}
		// Strip out any additional wildcards, just in case and add the protocol
		return protocol+joined.split("*").join("");
	}
	
	// In the rare but possible case that there are no matches, return the joined target.
	return protocol+targetSplit.join("");
}

/**
* Escape the match URL to make it safe for regex parsing, and convert all
* wildcards '*' to regex syntax.
* @param {String} url - the URL to be escaped
* @return {String} - The escaped URL.
**/
function escapeUrl(url) {
	//regex from http://stackoverflow.com/questions/2593637/how-to-escape-regular-expression-in-javascript
	return url.replace(/([.?+^$[\]\\(){}|-])/g, '\\$1')
	.split('*').join('(.*)');
}

/**
* Splits a URL into a protocol and a path.
* @param {String} url - the URL to split.
* @return {Object} {protocol: null or the URL's protocol, path: The rest of the URL.}
**/
function splitByProtocol(url) {
	var splitUrl = url.split("://");
	if(splitUrl.length > 1) {
		return {protocol: splitUrl[0]+"://", path: splitUrl[1]};
	} else {
		return {protocol: null, path: splitUrl[0]};
	}
}

/**
 * Sets the browser action icon to color or grayscale based on the provided paramater.
 * @param {boolean} status - True if icon should be in color, false for grayscale.
 */
function setIcon(status) {
  chrome.browserAction.setIcon({path: status ? "img/icon.png" : "img/icon-grayscale.png"});
}
