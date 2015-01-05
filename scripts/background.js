//register an event listener for all web requests
chrome.webRequest.onBeforeRequest.addListener(manageRequest, {urls: ["<all_urls>"]}, ["blocking"]);

/**
 * Manages a webrequest, redirecting or blocking as necessary. Called 
 * directly by Chrome when the onBeforeRequest even fires.
 * @param request - The webrequest.
 */
function manageRequest(request){
	var list = completeFilterList();
	for(var i in list){
		if(match(list[i].source, request.url)){
		
			//block or redirect
			var redirect = 
				redirectUrl(list[i].source, list[i].target, request.url);
				
			if(redirect){
				console.log("Redirecting "+request.url+" to " + redirect);
				return {redirectUrl: redirect};
			}
			
			else {
				//block the request
				console.log("Blocking " + request.url);
				return {cancel: true};
			}
			
		}
	}
}

/**
 * Returns a complete list of URLs to filter.
 */
function completeFilterList(){
	return standardList;
}

/**
 * Tells if the parameters source and target match, including wildcards 
 * which may be present in the source.
 * @param {String} source - The URL to match, which may include '*' as 
 * wildcards, matching one or more of any character.
 * @param {String} target - The URL to test against.
 * @return {Boolean} Tells if target matches source.
 */
function match(source, target){
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
function redirectUrl(source, target, url){
	if(!target) return false;
	//a list of concrete values for the wildcards
	var matches = url.match(new RegExp(escapeUrl(source)));
	//a list of the non-wildcard parts of target
	var targetSplit = target.split("*");
	//now we join the two, taking every other, starting with targetSplit
	var joined = targetSplit[0];
	//i = 1 because targetSplit[0] has been appended above, and because
	//matches[0] is the same as url
	for(var i = 1; i < targetSplit.length; i++){
		joined += matches[i] + targetSplit[i];
	}
	return joined;
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
		.split('*').join('(.+)');
}
