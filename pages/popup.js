var p = photonui;
$(document).ready(function() {
  chrome.storage.local.get(["enabled", "redirected", "blocked"], initPopup);
});


function initPopup(items) {
  var rootBox = new p.BoxLayout({
    orientation: "vertical",
  });
  
  var controlBox = new p.BoxLayout({
    orientation: "horizontal",
  });
  
  var enableButton = new p.ToggleButton({
    text: items.enabled ? "Disable" : "Enable",
    value: items.enabled,
    tooltip: "Enable or Disable Backloader",
  });
  enableButton.addClass("enableButton");
  
  enableButton.registerCallback("toggled", "click", function(widget) {
    widget.text = widget.value ? "Disable" : "Enable";
    chrome.storage.local.set({enabled: widget.value});
  });
  
  var optionsButton = new p.Button({
    textVisible: false,
    leftIcon: new p.FAIcon("fa-cog"),
  });
  optionsButton.registerCallback("open-options", "click", function(widget) {
    chrome.tabs.create({url: './pages/options.html'});
  });
  
  controlBox.addChild(enableButton);
  controlBox.addChild(optionsButton);
  rootBox.addChild(controlBox);
  
  rootBox.addChild(new p.Separator());
  
  rootBox.addChild(new p.Label({
    text: "Redirected: "+items.redirected,
  }));
  
  rootBox.addChild(new p.Label({
    text: "Blocked: "+items.blocked,
  }));
  
  p.domInsert(rootBox, document.body);
}
