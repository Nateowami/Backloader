var p = photonui;

var layout;
var filterList;

$(document).ready(function() {
  layout = buildLayout();
  
  chrome.storage.local.get('filter-list', init);
  
  p.domInsert(layout.filterListBox, document.getElementById("filterList"));
  
  p.domInsert(layout.detailBox, document.getElementById("details"));
});

function buildLayout() {
  var layout = {};
  
  layout.filterListBox = new p.BoxLayout({
    orientation: "vertical",
  });
  
  layout.detailBox = new p.GridLayout();
  
  return layout;
}

function init(storageResults) {
  filterList = storageResults["filter-list"] ? storageResults["filter-list"] : [];
  
  buildFilterList();
}

function buildFilterList(activeIndex) {
  var currentActiveId = $(".listButton.active").attr("id");
  layout.filterListBox.empty();
  
  for(var i = 0; i < filterList.length; i++) {
    var item = filterList[i];
    
    var listItem = new p.BoxLayout({
      orientation: "horizontal",
    });
    
    var listButton = new p.Button({
      text: item.src,
      tooltip: "Edit This Filter",
      name: "listButton-"+i
    });
    
    listButton.id = "listButton-"+i,
    listButton.addClass("listButton");
    listButton.registerCallback("clicked", "click", function(widget) {
      buildDetails(filterList[+widget.name.split("-")[1]]);
      
      for(var i = 0; i < layout.filterListBox.children.length; i++) {
        $(".listButton").removeClass("active");
      }
      
      $(widget.html).addClass("active");
    });
    
    if(activeIndex == i) {
      listButton.addClass("active");

      //Don't reload details if they're already viewing the same id
      if(!currentActiveId || i != +currentActiveId.split("-")[1]) {
        buildDetails(item);
      }
    }
    
    var upButton = new p.Button({
      textVisible: false,
      leftIcon: new p.FAIcon("fa-caret-up"),
      tooltip: "Move Filter Up",
    });
    upButton.id = "upButton-"+i,
    
    upButton.registerCallback("move-up", "click", function(widget) {
      saveList(filterList.moveUp(filterList[+widget.id.split("-")[1]]));
    });
    
    
    var downButton = new p.Button({
      textVisible: false,
      leftIcon: new p.FAIcon("fa-caret-down"),
      tooltip: "Move Filter Down",
    });
    downButton.id = "downButton-"+i,
    
    downButton.registerCallback("move-down", "click", function(widget) {
      saveList(filterList.moveDown(filterList[+widget.id.split("-")[1]]));
    });
    
    listItem.addChild(upButton);
    listItem.addChild(downButton);
    listItem.addChild(listButton);
    
    layout.filterListBox.addChild(listItem);
  }
  
  var addButton = new p.Button({
    text: "Add Filter",
    tooltip: "Add a New Filter",
    leftIcon: new p.FAIcon("fa-plus"),
  });
  addButton.addClass("addButton");
  addButton.registerCallback("add-item", "click", function(widget) {
    filterList.push({
      src: "",
      dest: "",
      matchProtocol: false,
    });
    buildFilterList(filterList.length-1);
  });
  
  var resetButton = new p.Button({
    text: "Reset",
    tooltip: "Reset Filter List",
    leftIcon: new p.FAIcon("fa-exclamation-triangle"),
  });
  
  resetButton.addClass("resetButton");
  resetButton.registerCallback("reset-list", "click", function(widget) {
    filterList = $.extend([], defaultFilterList);
    saveList();
  });
  
  
  p.domInsert(addButton, document.getElementById("controlButtons"));
  p.domInsert(resetButton, document.getElementById("controlButtons"));

}

function buildDetails(item) {
  layout.detailBox.empty();
  layout.applyButton ? layout.applyButton.destroy() : null;
  layout.deleteButton ? layout.deleteButton.destroy() : null;
  
  if(item) {
    var srcField = new p.TextField({
      value: item.src,
      tooltip: "The URL to Block or Redirect",
    });
    
    var srcLabel = new p.Label({
      text: "Source:",
      forInput: srcField,
      tooltip: "The URL to Block or Redirect",
    });
    
    
    var destField = new p.TextField({
      value: item.dest,
      tooltip: "Redirect to This URL (Leave blank to block)",
    });
    
    var destLabel = new p.Label({
      text: "Destination:",
      forInput: destField,
      tooltip: "Redirect to This URL (Leave blank to block)",
    });
    
    
    var protocolSwitch = new p.Switch({
      value: item.matchProtocol,
      tooltip: "Check the URL's Protocol (http://, https://, etc.) when Testing for This Match.",
    });
    
    var protocolLabel = new p.Label({
      text: "Match Protocol:",
      forInput: protocolSwitch,
      tooltip: "Check the URL's Protocol (http://, https://, etc.) when Testing for This Match.",
    });
    
    layout.applyButton ? layout.applyButton.destroy() : null;
    layout.applyButton = new p.Button({
      text: "Apply",
      leftIcon: new p.FAIcon("fa-check"),
      tooltip: "Apply Changes",
    });
    layout.applyButton.addClass("applyButton");
    
    layout.applyButton.registerCallback("clicked", "click", function(widget) {
      item.src = srcField.value;
      item.dest = destField.value;
      item.matchProtocol = protocolSwitch.value;
      // Fake delay.
      // Prevents spam-clicking which might cause isseues with localstorage settings.
      widget.leftIcon = new p.FAIcon("fa-spin fa-cog");
      widget.addClass("disabled");
      saveList(filterList.indexOf(item));
      
      setTimeout(function() {
        widget.leftIcon = new p.FAIcon("fa-check");
        widget.removeClass("disabled");
      }, 1000);
    });
    p.domInsert(layout.applyButton, document.getElementById("details"));
    
    layout.deleteButton ? layout.deleteButton.destroy() : null;
    layout.deleteButton = new p.Button({
      text: "Delete",
      leftIcon: new p.FAIcon("fa-times"),
      tooltip: "Delete This Filter",
    });
    layout.deleteButton.addClass("deleteButton");
    
    layout.deleteButton.registerCallback("clicked", "click", function(widget) {
      filterList.splice(filterList.indexOf(item), 1);
      saveList();
      buildDetails(null);
    });
    
    p.domInsert(layout.deleteButton, document.getElementById("details"));
    
    
    var i = 0;
    layout.detailBox.addChild(srcLabel, {
      gridX: 0, gridY: i,
    });
    layout.detailBox.addChild(srcField, {
      gridX: 1, gridY: i,
    });
    i++;
    
    layout.detailBox.addChild(destLabel, {
      gridX: 0, gridY: i,
    });
    layout.detailBox.addChild(destField, {
      gridX: 1, gridY: i,
    });
    i++;
    
    layout.detailBox.addChild(protocolLabel, {
      gridX: 0, gridY: i,
    });
    layout.detailBox.addChild(protocolSwitch, {
      gridX: 1, gridY: i,
    });
    i++;
  }
}

function saveList(selectIndex) {
  chrome.storage.local.set({
    "filter-list": filterList,
  }, function() {
    buildFilterList(selectIndex);
  });
}
