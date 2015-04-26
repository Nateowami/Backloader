var p = photonui;

var options = {
  widgets: {},
};

var filterList = null;
var filterSelection = 0;
var ruleSelection = null;

$(document).ready(function() {
  prepareLayout();
  chrome.storage.local.get('filter-list', init);
});

function init(storageResults) {
  filterList = storageResults["filter-list"] ? storageResults["filter-list"] : [];
  reBuildTopBar();
  reBuildRuleList();
  reBuildDetails();
}

function prepareLayout() {
  options.widgets.topBar = new p.FluidLayout({ orientation: "horizontal" });
  options.widgets.ruleListBox = new p.BoxLayout({ orientation: "vertical" });
  options.widgets.detailsGrid = new p.GridLayout();
  
  p.domInsert(options.widgets.topBar, document.getElementById("topBar"));
  p.domInsert(options.widgets.ruleListBox, document.getElementById("filterList"));
  p.domInsert(options.widgets.detailsGrid, document.getElementById("details"));
}

function reBuildTopBar(selectedIndex) {
  var selectedIndex = selectedIndex != null ? selectedIndex : 0;
  // Try to avoid re-defining any widgets.
  var listSelect = options.widgets.listSelect;
  if(!listSelect) {
    listSelect = options.widgets.listSelect = new p.Select({});
    options.widgets.topBar.addChild(listSelect);
    
    // When the value changes, set the enable Checkbox's value.
    listSelect.registerCallback("change", "value-changed", function() {
      var val = listSelect.getValue();
      if(val == "NEW") {
        addEditList(true);
      } else {
        var item = filterList[val];
        
        // Update the enable togglebutton's value
        enableToggle.value = item.isEnabled;
        enableToggle.text = item.isEnabled ? "Disable" : "Enable";
        
        // Handle lists which do not allow editing
        if(!item.isEditable) {
          $("#topControls .photonui-button").addClass("disabled");
          editButton.addClass("disabled");
        } else {
          $("#topControls .photonui-button").removeClass("disabled");
          editButton.removeClass("disabled");
        }
        
        filterSelection = +val;
        
        reBuildRuleList();
        reBuildDetails();

      }
    });
    listSelect.addClass("listSelect");
  }
  
  
  var enableToggle = options.widgets.enableToggle;
  if(!enableToggle) {
    enableToggle = options.widgets.enableToggle = new p.ToggleButton({
      text: "Enable"
    });
    enableToggle.addClass("enableToggle");
    
    enableToggle.registerCallback("toggled", "value-changed", function(widget) {
      // Yay, text changing
      widget.text = widget.value ? "Disable" : "Enable";
      
      // When the value changes, set the selected list's isEnabled value.
      filterList[listSelect.getValue()].isEnabled = enableToggle.value;
    });
    
    options.widgets.topBar.addChild(enableToggle);
  }
  
  var editButton = options.widgets.listEditButton;
  if(!editButton) {
    editButton = options.widgets.listEditButton = new p.Button({
      textVisible: false,
      leftIcon: new p.FAIcon("fa-pencil"),
    });
    editButton.registerCallback("clicked", "click", function() {
      // Open the edit popup
      addEditList();
    });
    options.widgets.topBar.addChild(editButton);
  }
  
  // Clear out the list
  listSelect.children = [];
  // Add the list items
  for(var i = 0; i < filterList.length; i++) {
    var item = new p.MenuItem({
      value: i+"",
      text: filterList[i].name,
      icon: filterList[i].isEditable ? null : new p.FAIcon("fa-lock"),
    });
    listSelect.addChild(item);
    
    // Set up the default selection
    if(i == selectedIndex) {
      // Make sure to unset the value first, otherwise the text won't update.
      listSelect.value = null;
      listSelect.value = ""+selectedIndex;
      
      enableToggle.value = filterList[i].isEnabled;
      enableToggle.text = filterList[i].isEnabled ? "Disable" : "Enable";
      if(!filterList[i].isEditable)
        editButton.addClass("disabled");
      listSelect._callCallbacks("value-changed");
    }
  }
  
  // Don't forget the New List... option.
  listSelect.addChild(new p.MenuItem({
    value: "NEW",
    text: "New List...",
    icon: new p.FAIcon("fa-plus"),
  }));
}

function reBuildRuleList() {
  var topControls = options.widgets.topControls;
  if(!topControls) {
    topControls = options.widgets.topControls = new p.FluidLayout({
      orientation: "horizontal",
    });
    
    var ruleUpBtn = new p.Button({
      textVisible: false,
      leftIcon: new p.FAIcon("fa-caret-up"),
    });
    ruleUpBtn.registerCallback("move-up", "click", function(widget) {
      var rules = filterList[filterSelection].rules;
      rules.moveUp(rules[ruleSelection]);
      
      if(ruleSelection >= 2) {
        ruleSelection -= 1;
        ruleDownBtn.removeClass("disabled");
      } else {
        ruleSelection = 0;
        ruleUpBtn.addClass("disabled");
      }
      
      reBuildRuleList();
      saveList();
    });
    topControls.addChild(ruleUpBtn);
    
    var ruleDownBtn = new p.Button({
      textVisible: false,
      leftIcon: new p.FAIcon("fa-caret-down"),
    });
    ruleDownBtn.registerCallback("move-down", "click", function(widget) {
      var rules = filterList[filterSelection].rules;
      rules.moveDown(rules[ruleSelection]);
      
      if(ruleSelection < rules.length - 2) {
        ruleSelection += 1;
        ruleUpBtn.removeClass("disabled");
      } else {
        ruleSelection = rules.length - 1;
        ruleDownBtn.addClass("disabled");
      }
      
      reBuildRuleList();
      saveList();
    });
    topControls.addChild(ruleDownBtn);
    
    var addButton = new p.Button({
      text: "Add Rule",
      tooltip: "Add a New Filter Rule",
      leftIcon: new p.FAIcon("fa-plus"),
    });
    addButton.addClass("addButton");
    addButton.registerCallback("add-item", "click", function(widget) {
      var rules = filterList[filterSelection].rules;
      rules.push({
        src: "",
        dest: "",
        matchProtocol: false,
      });
      ruleSelection = rules.length-1;
      reBuildRuleList();
      reBuildDetails(rules.length-1);
    });
    topControls.addChild(addButton);
    
    var removeButton = new p.Button({
      text: "Remove Rule",
      tooltip: "Remove the Selected Filter Rule",
      leftIcon: new p.FAIcon("fa-times"),
    });
    removeButton.addClass("removeButton");
    removeButton.registerCallback("remove-item", "click", function(widget) {
      var rules = filterList[filterSelection].rules;
      rules.splice(-1,1)
      ruleSelection = rules.length-1;
      reBuildRuleList();
      reBuildDetails();
      saveList();
    });
    topControls.addChild(removeButton);
    
    p.domInsert(topControls, document.getElementById("topControls"));
    
    if(!filterList[filterSelection].isEditable) {
      $("#topControls .photonui-button").addClass("disabled");
    } else {
      $("#topControls .photonui-button").removeClass("disabled");
    }
  }
  
  var currentActiveId = $(".listButton.active").attr("id");
  options.widgets.ruleListBox.empty();
  
  for(var i = 0; i < filterList[filterSelection].rules.length; i++) {
    var item = filterList[filterSelection].rules[i];
    
    var listButton = new p.Button({
      text: item.src,
      tooltip: "Edit This Filter",
      name: "listButton-"+i
    });
    
    listButton.id = "listButton-"+i,
    listButton.addClass("listButton");
    listButton.registerCallback("clicked", "click", function(widget) {
      ruleSelection = +widget.name.split("-")[1];
      
      reBuildDetails(ruleSelection);
      
      $(".listButton").removeClass("active");
      $(widget.html).addClass("active");
    });
    
    if(ruleSelection == i) {
      listButton.addClass("active");
      
      //Don't rebuild details if they're already viewing the same id
      if(!currentActiveId || i != +currentActiveId.split("-")[1]) {
        reBuildDetails(i);
      }
    }
    
    options.widgets.ruleListBox.addChild(listButton);
  }
}

function reBuildDetails(id) {
  var detailsGrid = options.widgets.detailsGrid;
  
  if(id != null) {
    var rule = filterList[filterSelection].rules[id];

    var srcLabel = p.getWidget("details-src-label");
    var srcField = p.getWidget("details-src-field");
    var destLabel = p.getWidget("details-dest-label");
    var destField = p.getWidget("details-dest-field");
    var applyBtn = p.getWidget("details-apply-btn");
    
    // All widgets should be intialized if one is.
    if(!srcLabel) {
      srcLabel = new p.Label({
        name: "details-src-label",
        text: "Source:"
      });
      
      srcField = new p.TextField({
        name: "details-src-field",
        value: rule.src,
        placeholder: 'Match URL (eg. "google.com" or "https://twitter.com/some/page/*")',
        tooltip: 'Match URL (eg. "google.com" or "https://twitter.com/some/page/*")',
      });
      
      destLabel = new p.Label({
        name: "details-dest-label",
        text: "Destination:"
      });
      
      destField = new p.TextField({
        name: "details-dest-field",
        value: rule.dest,
        placeholder: 'Redirect URL (eg. "example.com" or "http://somewhereelse.net/*")',
        tooltip: 'Redirect URL (eg. "example.com" or "http://somewhereelse.net/*")',
      });
      
      applyBtn = new p.Button({
        name: "details-apply-btn",
        text: "Apply",
        leftIcon: new p.FAIcon("fa-check"),
      });
      
      applyBtn.registerCallback("apply", "click", function() {
        rule.src = srcField.value;
        rule.dest = destField.value;
        reBuildDetails();
        reBuildRuleList();
        
        saveList();
      });
      
      detailsGrid.addChild(srcLabel, {
        gridX: 0, gridY: 0,
      });
      
      detailsGrid.addChild(srcField, {
        gridX: 1, gridY: 0,
      });
      
      detailsGrid.addChild(destLabel, {
        gridX: 0, gridY: 1,
      });
      
      detailsGrid.addChild(destField, {
        gridX: 1, gridY: 1,
      });
      
      detailsGrid.addChild(applyBtn, {
        gridX: 0, gridY: 2,
        gridWidth: 2,
      });
    } else {
      srcField.value = rule.src;
      destField.value = rule.dest;
    }
    
    detailsGrid.setVisible(true);
  } else {
    detailsGrid.setVisible(false);
  }
}

function addEditList(isNew) {
  var name = isNew ? "New List" : filterList[filterSelection].name;
  var activeIndex = isNew ? filterList.length : filterSelection;
  
  // Create base dialog with buttons
  var editDialog = new p.Dialog({
    title: isNew ? "Add List" : "Edit List: "+name,
    x: $(document).width()/2-150, y: 100,
    modal: true,
    width: 300,
    visible: true,
    padding: 5,
    child: new p.GridLayout({
      name: "list-edit-grid",
    }),
    buttons: [
      new p.Button({
        name: "list-edit-cancel",
        text: "Cancel",
        leftIcon: new p.FAIcon("fa-times"),
      }),
      new p.Button({
        name: "list-edit-delete",
        text: "Delete",
        leftIcon: new p.FAIcon("fa-exclamation-triangle")
      }),
      new p.Button({
        name: "list-edit-apply",
        text: "Apply",
        leftIcon: new p.FAIcon("fa-check"),
      }),
    ]
  });
  
  // Build dialog contents
  var nameLabel, nameField, positionLabel, positionBox, positionBtn, controlBtnBox,
  listUpBtn, listDownBtn;
  
  nameLabel = new p.Label({
    text: "Name:"
  });
  nameField = new p.TextField({
    value: name,
  });
  
  // Update the name of the position button when value changes
  nameField.registerCallback("change", "value-changed", function(widget) {
    positionBtn.text = widget.value;
  });
  
  positionLabel = new p.Label({
    text: "Position:"
  });
  
  positionBox = new p.BoxLayout({
    orientation: "vertical",
  });
  
  controlBtnBox = new p.BoxLayout({
    orientation: "horizontal",
  });
  
  listUpBtn = new p.Button({
    textVisible: false,
    leftIcon: new p.FAIcon("fa-caret-up"),
  });
  listUpBtn.registerCallback("move-up", "click", function() {
    if(activeIndex < 2) {
      listUpBtn.addClass("disabled");
    }
    
    activeIndex -= 1;
      
    listDownBtn.removeClass("disabled");
    buildPositionBox();
  });
  if(activeIndex < 1) {
    listUpBtn.addClass("disabled");
  }
  controlBtnBox.addChild(listUpBtn);

  // Create the down button
  listDownBtn = new p.Button({
    textVisible: false,
    leftIcon: new p.FAIcon("fa-caret-down"),
  });
  listDownBtn.registerCallback("move-down", "click", function() {
    if(!isNew && activeIndex > filterList.length - 3) {
      listDownBtn.addClass("disabled");
    } else if (isNew && activeIndex > filterList.length -2) {
      listDownBtn.addClass("disabled");
    }
    
    activeIndex += 1;
      
    listUpBtn.removeClass("disabled");
    buildPositionBox();
  });
  
  // Disable the down button if we're adding a new item or the active one is at the end of the list.
  if(isNew || activeIndex > filterList.length - 2) {
    listDownBtn.addClass("disabled");
  }
  controlBtnBox.addChild(listDownBtn);

  var buildPositionBox = function() {
    // Reset the position box's children.
    positionBox.children = [controlBtnBox];
    positionBox.childrenNames = [controlBtnBox.name];
    
    // Insert the active list early.
    positionBox.childrenNames[activeIndex+1] = "Active";
    
    positionBtn = new p.Button({
      name: "Active",
      text: nameField.value,
    });
    positionBtn.addClass("listButton positionButton active");
    
    var insertionOffset = 1;
    for(var i = 0; i < filterList.length; i++) {
      // If we've passed the active item, increase the offset to account for it.
      if(positionBox.childrenNames[i+insertionOffset] != null) {
        insertionOffset += 1;
      }
      
      // We've already added the active item, so skip over the previous selection.
      if(!isNew && i == filterSelection) {
        insertionOffset -= 1;
        continue;
      };
      
      var btn = new p.Button();
      btn.addClass("listButton");
      btn.addClass("positionButton");
      
      btn.name = "filterList-"+i;
      btn.text = filterList[i].name;

      positionBox.childrenNames[i+insertionOffset] = btn.name;
    }
    // Don't forget to call this, or else none of the changes will be applied.
    positionBox._updateLayout();
  }
  
  // Build the initial position box
  buildPositionBox();
  
  var grid = p.getWidget("list-edit-grid");
  grid.addChild(nameLabel, {
    gridX: 0, gridY: 0,
  });
  grid.addChild(nameField, {
    gridX: 1, gridY: 0,
  });
  grid.addChild(positionLabel, {
    gridX: 0, gridY: 1,
  });
  grid.addChild(positionBox, {
    gridX: 1, gridY: 1,
  });
  
  // Apply logic
  p.getWidget("list-edit-apply").registerCallback("apply", "click", function() {
    var filterObject = {
      name: nameField.value,
      isEnabled: true,
      isEditable: true,
      rules: [],
    }
    
    if(!isNew) {
      filterObject.rules = filterList[filterSelection].rules;
      filterObject.isEnabled = filterList[filterSelection].isEnabled;
      // Remove the previous list
      filterList.splice(filterSelection, 1);
    }
    
    // Insert the added/edited list.
    filterList.splice(activeIndex, 0, filterObject);
    
    // Rebuild all the things!
    reBuildTopBar(activeIndex);
    reBuildRuleList();
    reBuildDetails();
    
    // Commit
    saveList();
    editDialog.destroy();
  });
  
  // Deletion logic
  p.getWidget("list-edit-delete").registerCallback("delete", "click", function() {
    // Always check if this is a new list, just in case.
    if(!isNew) {
      filterList.splice(filterSelection, 1);
      // Rebuild all the things!
      reBuildTopBar(0);
      reBuildRuleList();
      reBuildDetails();

    
      // Commit
      saveList();
      editDialog.destroy();
    }
  });
  p.getWidget("list-edit-delete").setVisible(!isNew);
  
  // Both buttons close the dialog without making changes.
  p.getWidget("list-edit-cancel").registerCallback("cancel-close", "click", editDialog.destroy, editDialog);
  editDialog.registerCallback("dialog-close", "close-button-clicked", editDialog.destroy, editDialog);
}

function saveList() {
  chrome.storage.local.set({
    "filter-list": filterList,
  }, function() {
  });
}
