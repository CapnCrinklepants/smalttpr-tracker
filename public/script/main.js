
var trackerOptions = {
  showchests: true,
  showprizes: true,
  showmedals: true,
  showlabels: true,
  editmode: false,
  selected: {}
}

var chestsopenedInit = [];
for(var i = 0; i < chests.length; i++) {
    chestsopenedInit.push(false);
}

var trackerData = {
  items: itemsInit,
  dungeonchests: dungeonchestsInit,
  dungeonbeaten: dungeonbeatenInit,
  prizes: prizesInit,
  medallions: medallionsInit,
  chestsopened: chestsopenedInit
};

function setCookie(obj) {
    var d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    var val = JSON.stringify(obj);
    document.cookie = "key=" + val + ";" + expires + ";path=/";
}

function getCookie() {
    var name = "key=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return JSON.parse(c.substring(name.length, c.length));
        }
    }
    return {};
}

var cookiekeys = ['ts', 'map', 'iZoom', 'mZoom', 'mOrien', 'mPos', 'chest', 'prize', 'medal', 'label', 'items'];
var cookieDefault = {
    ts:94,
    map:1,
    iZoom:100,
    mZoom:50,
    mOrien:0,
    mPos:0,
    chest:1,
    prize:1,
    medal:1,
    label:1,
    items:defaultItemGrid
}

var cookielock = false;
function loadCookie() {
    if (cookielock)
        return;
    cookielock = true;
    cookieobj = getConfigObjectFromCookie();
    setConfigObject(cookieobj);
    cookielock = false;
}

function setConfigObject(configobj) {
    //initGridRow(JSON.parse(JSON.stringify(configobj.items)));
    //while(itemLayout.length > 0) {itemLayout.length.pop();}
    //itemLayout = configobj.items;
    //Array.prototype.push.apply(itemLayout, configobj.items);
    window.vm.itemRows = configobj.items;

    document.getElementsByName('showmap')[0].checked = !!configobj.map;
    document.getElementsByName('showmap')[0].onchange();
    document.getElementsByName('itemdivsize')[0].value = configobj.iZoom;
    document.getElementsByName('itemdivsize')[0].onchange();
    document.getElementsByName('mapdivsize')[0].value = configobj.mZoom;
    document.getElementsByName('mapdivsize')[0].onchange();

    document.getElementsByName('maporientation')[configobj.mOrien].click();
    document.getElementsByName('mapposition')[configobj.mPos].click();

    document.getElementsByName('showchest')[0].checked = !!configobj.chest;
    document.getElementsByName('showchest')[0].onchange();
    document.getElementsByName('showcrystal')[0].checked = !!configobj.prize;
    document.getElementsByName('showcrystal')[0].onchange();
    document.getElementsByName('showmedallion')[0].checked = !!configobj.medal;
    document.getElementsByName('showmedallion')[0].onchange();
    document.getElementsByName('showlabel')[0].checked = !!configobj.label;
    document.getElementsByName('showlabel')[0].onchange();
}

function updateConfigFromFirebase(configobj) {
    var existingConfig = getConfigObjectFromCookie();
    if(!existingConfig || !existingConfig.ts || existingConfig.ts < configobj.ts) {
        console.log("Overwriting config with Firebase values");
        setConfigObject(configobj);
        saveCookie();
    }
    else {
        console.log("Ignoring Firebase config values due to older timestamp");
    }
}

function saveConfigToFirebase() {
    var existingConfig = getConfigObject();
    rootRef.child('config').set(existingConfig);
}

function saveCookie() {
    if (cookielock)
        return;
    cookielock = true;

    cookieobj = getConfigObject();
    setCookie(cookieobj);

    cookielock = false;
}

function getConfigObjectFromCookie() {
    configobj = getCookie();

    cookiekeys.forEach(function (key) {
        if (configobj[key] === undefined) {
            configobj[key] = cookieDefault[key];
        }
    });
    return configobj;
}

function getConfigObject() {
    configobj = {};
    configobj.ts = (new Date()).getTime();

    configobj.map = document.getElementsByName('showmap')[0].checked ? 1 : 0;
    configobj.iZoom = document.getElementsByName('itemdivsize')[0].value;
    configobj.mZoom = document.getElementsByName('mapdivsize')[0].value;

    configobj.mOrien = document.getElementsByName('maporientation')[1].checked ? 1 : 0;
    configobj.mPos = document.getElementsByName('mapposition')[1].checked ? 1 : 0;

    configobj.chest = document.getElementsByName('showchest')[0].checked ? 1 : 0;
    configobj.prize = document.getElementsByName('showcrystal')[0].checked ? 1 : 0;
    configobj.medal = document.getElementsByName('showmedallion')[0].checked ? 1 : 0;
    configobj.label = document.getElementsByName('showlabel')[0].checked ? 1 : 0;

    configobj.items = window.vm.itemRows;

    return configobj;
}

// Event of clicking a chest on the map
function toggleChest(x){
    rootRef.child('chestsopened').child(x).set(!trackerData.chestsopened[x]);
}

// Highlights a chest location and shows the name as caption
function highlight(x){
    document.getElementById(x).style.backgroundImage = "url(/images/highlighted.png)";
    document.getElementById("caption").innerHTML = chests[x].name;
}

function unhighlight(x){
    document.getElementById(x).style.backgroundImage = "url(/images/poi.png)";
    document.getElementById("caption").innerHTML = "&nbsp;";
}

// Highlights a chest location and shows the name as caption (but for dungeons)
function highlightDungeon(x){
    document.getElementById("dungeon"+x).style.backgroundImage = "url(/images/highlighted.png)";
    document.getElementById("caption").innerHTML = dungeons[x].name;
}

function unhighlightDungeon(x){
    document.getElementById("dungeon"+x).style.backgroundImage = "url(/images/poi.png)";
    document.getElementById("caption").innerHTML = "&nbsp;";
}

function showChest(sender) {
    trackerOptions.showchests = sender.checked;
    refreshMap();
    saveCookie();
}

function showCrystal(sender) {
    trackerOptions.showprizes = sender.checked;
    refreshMap();
    saveCookie();
}

function showMedallion(sender) {
    trackerOptions.showmedals = sender.checked;
    refreshMap();
    saveCookie();
}

function showLabel(sender) {
    trackerOptions.showlabels = sender.checked;
    refreshMap();
    saveCookie();
}

function setOrder(H) {
    if (H) {
        document.getElementById('layoutdiv').classList.remove('flexcontainer');
    } 
    else {
        document.getElementById('layoutdiv').classList.add('flexcontainer');
    }
    saveCookie();
}

function setOrientation() {
    
}

function setZoom(target, sender) {
    document.getElementById(target).style.zoom = sender.value / 100;

    //    -moz-transform: scale(0.5);

    document.getElementById(target + 'size').innerHTML = (sender.value) + '%';
    saveCookie();
}

var prevH = false;
function setMapOrientation(H) {
    if (H == prevH) {
        return;
    }
    prevH = H;


    var chest = document.getElementsByClassName("mapspan");
    var i;

    if (H) {
        document.getElementById("mapdiv").classList.remove('mapdiv');
        document.getElementById("mapdiv").classList.add('mapvdiv');
        for (i = 0; i < chest.length; i++) {
            var x = parseFloat(chest[i].style.left) / 100;
            var y = parseFloat(chest[i].style.top) / 100;

            if (x > 0.5) {
                chest[i].style.left = (((x - 0.5) * 2) * 100) + '%';
                chest[i].style.top = (((y / 2) + 0.5) * 100) + '%';
            }
            else {
                chest[i].style.left = ((x  * 2) * 100) + '%';
                chest[i].style.top = ((y / 2) * 100) + '%';
            }
        }
    }
    else {
        document.getElementById("mapdiv").classList.add('mapdiv');
        document.getElementById("mapdiv").classList.remove('mapvdiv');
        for (i = 0; i < chest.length; i++) {
            var x = parseFloat(chest[i].style.left) / 100;
            var y = parseFloat(chest[i].style.top) / 100;

            if (y > 0.5) {
                chest[i].style.left = (((x / 2) + 0.5) * 100) + '%';
                chest[i].style.top = (((y - 0.5) * 2) * 100) + '%';
            }
            else {
                chest[i].style.left = ((x / 2) * 100) + '%';
                chest[i].style.top = ((y * 2) * 100) + '%';
            }
        }
    }
    saveCookie();
}

function showSettings(sender) {
    if (trackerOptions.editmode) {
        trackerOptions.showchests = document.getElementsByName('showchest')[0].checked;
        trackerOptions.showprizes = document.getElementsByName('showcrystal')[0].checked;
        trackerOptions.showmedals = document.getElementsByName('showmedallion')[0].checked;
        trackerOptions.showlabels = document.getElementsByName('showlabel')[0].checked;
        trackerOptions.editmode = false;
        showTracker('mapdiv', document.getElementsByName('showmap')[0]);
        document.getElementById('itemconfig').style.display = 'none';

        sender.innerHTML = '🔧';
        saveCookie();
    } else {
        var x = document.getElementById("settings");
        if (!x.style.display || x.style.display == 'none') {
            x.style.display = 'initial';
            sender.innerHTML = 'X';
        } else {
            x.style.display = 'none';		
            sender.innerHTML = '🔧';
        } 
    }
}

function showTracker(target, sender) {
    if (sender.checked) {
        document.getElementById(target).style.display = '';
    }
    else {
        document.getElementById(target).style.display = 'none';
    }
}

function EditMode() {
    trackerOptions.showchests = false;
    trackerOptions.showprizes = false;
    trackerOptions.showmedals = false;
    trackerOptions.showlabels = false;
    trackerOptions.editmode = true;
    showTracker('mapdiv', {checked:false});
    document.getElementById('settings').style.display = 'none';
    document.getElementById('itemconfig').style.display = '';

    document.getElementById('settingsbutton').innerHTML = 'Exit Edit Mode';
}

function refreshMapMedallions() {
  refreshMapMedallion(8);
  refreshMapMedallion(9);
}

function refreshMapMedallion(d) {
    // Update availability of dungeon boss AND chests
    if(trackerData.dungeonbeaten[d])
        document.getElementById("bossMap"+d).className = "mapspan boss opened";
    else
        document.getElementById("bossMap"+d).className = "mapspan boss " + dungeons[d].isBeatable();

    if(trackerData.dungeonchests[d] > 0)
        document.getElementById("dungeon"+d).className = "mapspan 1dungeon " + dungeons[d].canGetChest();
    // TRock medallion affects Mimic Cave
    if(d == 9){
        refreshChests();
    }
    // Change the mouseover text on the map
    var dungeonName;
    if(d == 8)
        dungeonName = "Misery Mire";
    else
        dungeonName = "Turtle Rock";
    dungeons[d].name = dungeonName + " <img src='images/medallion"+trackerData.medallions[d]+".png' class='mini'><img src='images/lantern.png' class='mini'>";
}

function refreshChests() {
    for(k=0; k<chests.length; k++){
        if(trackerData.chestsopened[k])
            document.getElementById(k).className = "mapspan chest opened";
        else
            document.getElementById(k).className = "mapspan chest " + chests[k].isAvailable();
    }
}

function refreshMap() {
  refreshMapMedallions();
  refreshChests();

  for(k=0; k<dungeons.length; k++){
      if(trackerData.dungeonbeaten[k])
          document.getElementById("bossMap"+k).className = "mapspan boss opened";
      else
          document.getElementById("bossMap"+k).className = "mapspan boss " + dungeons[k].isBeatable();
      if(trackerData.dungeonchests[k])
          document.getElementById("dungeon"+k).className = "mapspan dungeon " + dungeons[k].canGetChest();
      else
          document.getElementById("dungeon"+k).className = "mapspan dungeon opened";
  }
}

function itemConfigClick (sender) {
    var item = sender.id;

    if (trackerOptions.selected.item) {
        document.getElementById(trackerOptions.selected.item).style.border = '0px';
        sender.style.border = '3px solid yellow';
        trackerOptions.selected = {item:item};	
    } else if (trackerOptions.selected.row !== undefined) {
        itemGrid[selected.row][selected.col]['item'].style.border = '1px solid white';
        var old = itemLayout[selected.row][selected.col];

        if (old == item) {
            selected = {};
            return;
        }

        if (item != 'blank') {
            sender.style.opacity = 0.25;

            var r,c;
            var found = false;
            for (r = 0; r < 8; r++) {
                for (c = 0; c < 7; c++) {
                    if (itemLayout[r][c] == item) {
                        itemLayout[r][c] = 'blank';
                        updateGridItem(r, c);
                        found = true;
                        break;
                    }
                }

                if (found)
                    break;
            }
        }

        itemLayout[selected.row][selected.col] = item;
        updateGridItem(selected.row, selected.col);

        document.getElementById(old).style.opacity = 1;

        trackerOptions.selected = {};
    } else {
        sender.style.border = '3px solid yellow';
        trackerOptions.selected = {item:item}
    }
}

function populateMapdiv() {
    var mapdiv = document.getElementById('mapdiv');

    // Initialize all chests on the map
    for(k=0; k<chests.length; k++){
        var s = document.createElement('span');
        s.style.backgroundImage = 'url(/images/poi.png)';
        s.style.color = 'black';
        s.id = k;
        s.onclick = new Function('toggleChest('+k+')');
        s.onmouseover = new Function('highlight('+k+')');
        s.onmouseout = new Function('unhighlight('+k+')');
        s.style.left = chests[k].x;
        s.style.top = chests[k].y;
        if(trackerData.chestsopened[k])
            s.className = "mapspan chest opened";
        else
            s.className = "mapspan chest " + chests[k].isAvailable();
        mapdiv.appendChild(s);
    }

    // Dungeon bosses & chests
    for(k=0; k<dungeons.length; k++){
        var s = document.createElement('span');
        s.style.backgroundImage = 'url(/images/' + dungeons[k].image + ')';
        s.id = 'bossMap' + k;
        s.onmouseover = new Function('highlightDungeon('+k+')');
        s.onmouseout = new Function('unhighlightDungeon('+k+')');
        s.style.left = dungeons[k].x;
        s.style.top = dungeons[k].y;
        s.className = "mapspan boss " + dungeons[k].isBeatable();
        mapdiv.appendChild(s);

        s = document.createElement('span');
        s.style.backgroundImage = 'url(/images/poi.png)';
        s.id = 'dungeon' + k;
        s.onmouseover = new Function('highlightDungeon('+k+')');
        s.onmouseout = new Function('unhighlightDungeon('+k+')');
        s.style.left = dungeons[k].x;
        s.style.top = dungeons[k].y;
        s.className = "mapspan dungeon " + dungeons[k].canGetChest();
        mapdiv.appendChild(s);
    }
}

function populateItemconfig() {
    var grid = document.getElementById('itemconfig');

    var i = 0;

    var row;

    for (var key in trackerData.items) {
        if (i % 10 == 0){
            row = document.createElement('tr');
            grid.appendChild(row);
        }
        i++;

        var rowitem = document.createElement('td');
        rowitem.className = 'corner';
        rowitem.id = key;
        rowitem.style.backgroundSize = '100% 100%';
        rowitem.onclick = new Function('itemConfigClick(this)');
        if((typeof trackerData.items[key]) == "boolean"){
            rowitem.style.backgroundImage = "url(/images/" + key + ".png)";
        }
        else{
            rowitem.style.backgroundImage = "url(/images/" + key + itemsMax[key] + ".png)";
        }
        row.appendChild(rowitem);
    }		
}

function enterPasscode() {
    var passcode = document.getElementById('entryPasscodeInput').value;
    rootRef.child('editors').child(uid).set(passcode, function(error) {
        if(error) {
            console.log("Did not add to editors");
            console.log(error);
        }
        else {
            console.log("Added to editors successfully");
        }
    });
}

function createRoom() {
    var editors = {};
    var passcode = document.getElementById('passcodeInput').value;
    editors[uid] = true;
    rootRef.set({
        owner: uid,
        editors: editors,
        passcode: passcode,
        items: itemsInit,
        dungeonchests: dungeonchestsInit,
        dungeonbeaten: dungeonbeatenInit,
        prizes: prizesInit,
        medallions: medallionsInit,
        chestsopened: chestsopenedInit
    });
}

function resetFirebase() {
    rootRef.child('items').set(itemsInit);
    rootRef.child('dungeonchests').set(dungeonchestsInit);
    rootRef.child('dungeonbeaten').set(dungeonbeatenInit);
    rootRef.child('prizes').set(prizesInit);
    rootRef.child('medallions').set(medallionsInit);
    rootRef.child('chestsopened').set(chestsopenedInit);
}


function initTracker() {
    //createItemTracker(document.getElementById('itemdiv'));
    populateMapdiv();
    populateItemconfig();

    loadCookie();

    rootRef.child('items').on('value', function(snapshot) {
      trackerData.items = snapshot.val();
        updateAll();
        document.getElementById('createRoomPanel').hidden = !!trackerData.items;
    });
    rootRef.child('dungeonchests').on('value', function(snapshot) {
        trackerData.dungeonchests = snapshot.val();
        updateAll();
    });
    rootRef.child('dungeonbeaten').on('value', function(snapshot) {
        trackerData.dungeonbeaten = snapshot.val();
        updateAll();
    });
    rootRef.child('prizes').on('value', function(snapshot) {
      trackerData.prizes = snapshot.val();
        updateAll();
    });
    rootRef.child('medallions').on('value', function(snapshot) {
      trackerData.medallions = snapshot.val();
        updateAll();
    });
    rootRef.child('chestsopened').on('value', function(snapshot) {
      trackerData.chestsopened = snapshot.val();
        updateAll();
    });
    rootRef.child('config').on('value', function(snapshot) {
       if(snapshot.val()) updateConfigFromFirebase(snapshot.val());
    });
}

function updateAll() {
    if(trackerData.items && trackerData.dungeonchests && trackerData.dungeonbeaten && trackerData.prizes && trackerData.medallions && trackerData.chestsopened) {
        refreshMap();
    }
}

function confirmSaveConfigToFirebase() {
    var confirm = window.confirm("Do you want to push your configuration to all other users of your tracker? This will overwrite their settings. (Use this to get a remote browser to match how this browser appears.)");
    if(confirm) {
        saveConfigToFirebase();
    }
}

Vue.component('tracker-table', {
  template: '#tracker-table',
  props: [
    'itemRows',
    'trackerData',
    'trackerOptions'
  ],
  computed: {
    maxRowLength: function() {
      return !this.itemRows.reduce ? 0 : this.itemRows.map(function(i) {return i.length}).reduce(function(a,b) {
          return Math.max(a, b);
      });
    }
  },
  methods: {
    itemFor: function(itemName) {
      if(!this.trackerData || !this.trackerData.items) return null;
      return this.trackerData.items[itemName];
    },
    addRow: function(e) {
      vm.itemRows.push(['blank']);
    },
    addItem: function(rowIndex) {
      vm.itemRows[rowIndex].push('blank');
    },
    removeItem: function(rowIndex) {
      vm.itemRows[rowIndex].pop();
      if(vm.itemRows[rowIndex].length == 0) {
        vm.itemRows.splice(rowIndex,1);
      }
    }
  }
});

Vue.component('tracker-cell', {
  template: '#tracker-cell',
  props: [
    'itemValue',
    'itemName',
    'columnIndex',
    'rowIndex',
    'trackerData',
    'trackerOptions'
  ],
  computed: {
    bossNum: function() {
      if(this.itemName.indexOf("boss") == -1) { return null; }
      return this.itemName.substring(4,5);
    },
    dungeonLabel: function() {
      if(this.bossNum && this.trackerOptions && this.trackerOptions.showlabels) {
        return dungeons[this.bossNum].label;
      }
      return null;
    },
    backgroundImage: function() {
      if(this.itemName == 'blank') {
        return this.trackerOptions.editmode ? 'url(/images/blank.png)' :'none';
      }
      else if((typeof this.itemValue) == "boolean") {
        return 'url(/images/' + this.itemName + '.png)';
      }
      return 'url(/images/' + this.itemName + (this.trackerOptions.editmode ? itemsMax[this.itemName] : this.itemValue) + '.png)';
    },
    isActive: function() {
      return this.trackerOptions.editmode || this.itemValue;
    },
    chestImage: function() {
      if(this.bossNum && this.trackerOptions && this.trackerOptions.showchests) {
        return "url(/images/chest" + this.trackerData.dungeonchests[this.bossNum] + ".png)";
      }
      return null;
    },
    prizeImage: function() {
      if(this.bossNum && this.trackerOptions && this.trackerOptions.showprizes) {
        return "url(/images/dungeon" + this.trackerData.prizes[this.bossNum] + ".png)";
      }
      return null;
    },
    medallionImage: function() {
      if((this.bossNum == "8" || this.bossNum == "9") && this.trackerOptions && this.trackerOptions.showmedals) {
        return "url(/images/medallion" + this.trackerData.medallions[this.bossNum] + ".png)";
      }
      return null;
    }
  },
  methods: {
    clickCell: function(e) {
      if(this.trackerOptions.editmode) {
          Vue.set(vm.itemRows[this.rowIndex], this.columnIndex, this.trackerOptions.selected.item || 'blank');
        return;
      }
      // Non-edit mode clicks
      if(this.bossNum) {
        // Do both this and the below for bosses
        rootRef.child('dungeonbeaten').child(this.bossNum).set(!this.trackerData.dungeonbeaten[this.bossNum])
      }
      if((typeof this.itemValue) == "boolean"){
        rootRef.child('items').child(this.itemName).set(!this.itemValue);
      }
      else{
        var newVal = this.itemValue + 1;
        if(newVal > itemsMax[this.itemName]){
          newVal = itemsMin[this.itemName];
        }
        rootRef.child('items').child(this.itemName).set(newVal);
      }
    },
    clickMedallion: function(e) {
      rootRef.child('medallions').child(this.bossNum).set( (this.trackerData.medallions[this.bossNum] + 1) % 4 );
    },
    clickChest: function(e) {
      var chestitem = 'chest' + this.bossNum;
      var newVal = this.trackerData.dungeonchests[this.bossNum] - 1;
      if(newVal < 0) {
        newVal = itemsMax[chestitem];
      }
      rootRef.child('dungeonchests').child(this.bossNum).set(newVal);
    },
    clickPrize: function(e) {
      rootRef.child('prizes').child(this.bossNum).set( (this.trackerData.prizes[this.bossNum] + 1) % 5 );
    }
  }
});

var vm = new Vue({
  data:{
      itemRows: [],
      trackerData: window.trackerData,
      trackerOptions: window.trackerOptions
  },
  el: '#layoutdiv'
})