// Listen Elements
var elmFile = document.getElementById('fileSelector');
var elmAdd = document.getElementById('add2DB');
var elmView = document.getElementById('viewDB');
var elmDeldb = document.getElementById('delDB');
// Add Listeners
elmFile.addEventListener('change', handleFileSelection, false);
elmAdd.addEventListener('click', handleAdd, false);
elmView.addEventListener('click', handleView, false);
elmDeldb.addEventListener('click', handleDeleteDB, false);

//Global Stores
var fileStore;
var imgStore;

// Misc Elements
var elmTitle = document.getElementById('title');
var elmArtist = document.getElementById('artist');
var elmImage = document.getElementById('img');
var elmAudio = document.getElementById('audio');
var elmPicture = document.getElementById('picture');
var elmTable = document.getElementById('display');

// Debug Element | xalert('message');
var elmMessages = document.getElementById('messages');

function xalert(message) {
    elmMessages.innerHTML += message + "<br>";
}

// Delete Database
function handleDeleteDB() {
    db.delete();
    handleView();
    xalert("You'll need to refresh");
}

// Create Database
var db = new Dexie("visDB");
db.version(1).stores({
    id3: "++id, artist, title, duration, img, audio"
});
db.open().catch(function(e) {
    xalert("Open failed: " + e);
});


function handleFileSelection(e) {
    //reset globals
    imgStore = undefined;
    fileStore = e.target.files[0];

    var url = URL.createObjectURL(fileStore);
    ID3.loadTags(url, function() {
        var tags = ID3.getAllTags(url);
        if (tags.picture !== undefined) {
            // Convert picture to base64
            var image = tags.picture;
            var base64String = "";
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
            }
            imgurl = "data:" + image.format + ";base64," + window.btoa(base64String);
            imgStore = imgurl;
            elmImage.src = imgStore;
        } else {
            elmImage.src = "";
        }
        if (tags.title !== undefined) {
            elmTitle.value = tags.title;
        } else {
            elmTitle.value = "";
        }
        if (tags.artist !== undefined) {
            elmArtist.value = tags.artist;
        } else {
            elmArtist.value = "";
        }
    }, {
        dataReader: ID3.FileAPIReader(fileStore),
        tags: ["artist", "title", "picture"]
    });
    elmAudio.src = url;
    handleView();
}

function handleAdd() {
    var image = imgStore;
    var artist = elmArtist.value;
    var title = elmTitle.value;
    var duration = secondsToHms(elmAudio.duration);
    db.id3.add({
        artist: artist,
        title: title,
        duration: duration,
        img: image,
        audio: fileStore
    });
    handleView();
}

function handleView() {
    elmTable.innerHTML = "";
    db.id3.each(function(result) {
        var tr = "<tr>";
        if (result.img !== undefined) {
            var td1 = "<td><img width='50px' src=\"" + result.img + "\"></td>";
        } else {
            var td1 = "<td></td>";
        }
        var td2 = "<td><a onclick=\"handlePlay(" + result.id + ")\">Play</a></td>";
        var td3 = "<td>" + result.title + "</td>";
        var td4 = "<td>" + result.artist + "</td>";
        var td5 = "<td><a onclick=\"handleRemove(" + result.id + ")\">Remove</a></td>";
        var td6 = "<td>" + result.duration + "</td>";
        var tr2 = "</tr></td>";
        elmTable.innerHTML = elmTable.innerHTML + tr + td1 + td2 + td3 + td4 + td5 + td6 + tr2;
    })
}

function handlePlay(i) {
    db.id3.where("id").equals(i).each(function(result) {
        elmAudio.src = URL.createObjectURL(result.audio);
        elmImage.src = result.img;
    })
    handleView();
}

function handleRemove(i) {
    db.id3.where("id").equals(i).delete();
    handleView();
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

handleView();