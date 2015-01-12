window.onload = function(){
	chrome.storage.local.get(
			["enabled", "redirected", "blocked"], initPopup);
};

function initPopup(items){
	//add event listener to checkbox
	document.getElementById("enabled").onclick = toggle;
	//set whether the checkbox is checked
	document.getElementById("enabled").checked = items.enabled;
	//set the number redirected
	document.getElementById("redirect-count").innerText= items.redirected;
	//set the number blocked
	document.getElementById("block-count").innerText = items.blocked;
}

function toggle(checkbox){
	console.log("Changing enable-status to " + this.checked);
	chrome.storage.local.set({enabled: this.checked});
}
