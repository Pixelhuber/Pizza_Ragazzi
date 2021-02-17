
function displayAchievements() {

    // Create Achievement-Array
    const allAchievements = [];
    for (i = 0; i <= 14; i++){
        allAchievements.push('Achievement '+ (i+1));
    }

    // Display Achievements
    allAchievements.forEach(function (item, index, array) {
        const achievementDiv = document.createElement('div');
        achievementDiv.textContent = item;
        achievementDiv.setAttribute('class', 'achievementBox');
        document.getElementById("achievements_table").appendChild(achievementDiv);
    });
}

$(function () {

    //edit the profile (username, picture) (email and password could be added in the future)
    $("#editProfileButton").on('click', function () {

        // CONSTANTS -----------------------------------
        const profileButton = $(this);
        const usernameField = $("#username");
        const selectFile = $("#p-image");
        // ---------------------------------------------

        if (profileButton.text() === "Edit Profile") {
            const usernameText = usernameField.text();

            // change usernameField into an inputField
            const usernameInputField = "<input style='font-size: 30px' name=\"new_username\" value=\"" + usernameText + "\">"; //hier nutze ich den style tag nur, weil er aus dem css sheet irgendwie nicht geladen wurde
            usernameField.html(usernameInputField);

            // display field to change profile-picture
            const selectFileButton = "<input style='font-size: 18px' id=\"file-upload\" type=\"file\" accept=\"image/*\"/>"
            selectFile.html(selectFileButton);
            $("#file-upload").on('change', function(){
                readURL(this);
            });

            profileButton.text("Save Profile");

        } else if (profileButton.text() === "Save Profile"){

            const newUsername = document.forms["userForm"]["new_username"].value;
            if (newUsername === "") {
                alert("Your Username should not be empty");
            }else {
                usernameField.html(newUsername);
                //updateUsernameInDatabaseAndSession(newUsername);
                selectFile.html("");
                uploadProfilePictureIntoDB();
                profileButton.text("Edit Profile");
            }
        }
    });

    //function to upload pictures
    function readURL(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#profile-picture').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]); //Actually change the picture
        }
    }
});

function setup() {
    getUsernameFromDatabase();
    getGesamtpunkteFromDatabase();
    getHighscoreFromDatabase();
    getMailFromDatabase();
    getTierFromDatabase();
    getProfilePicFromDatabase();
}
//TODO update username und profilepic zusammenlegen

// Sends a request to update the username in the session
function updateUsernameInDatabaseAndSession(newUsername) {

    let loginViewModel = {
        username: newUsername,
        password: "Hallo" // Passwort brauch ich hier eigentlich nicht, ich lass es trotzdem mal drin
    }

    $.post("/profile/updateUsername", loginViewModel,
        function (data, status){
            // Das funktioniert noch nicht ganz! Beim ausführen sieht man, dass "data" irgendwie leer bleibt... aber der Wert wird korrekt gespeichert
            alert("Session and Database updated!\nData: " + data + "\nStatus: " + status)
        }
        ).fail(function (){
            alert("Something went wrong")
        });
}

function uploadProfilePictureIntoDB(){
    let im = document.getElementById("profile-picture");
    console.log(im);
    let s = document.getElementById("profile-picture").src;
    console.log(s);
    //let img = document.getElementById("profile-picture").files[0];
    //console.log(img)
    console.log(JSON.stringify({img: s}));
    fetch('/profile/uploadProfilePicture',
        {
            method: 'POST',
            body: JSON.stringify({img: s}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        }
    )
        .then(
            result => result.text()
        )
        .catch(err => {
            console.log('ERROR: ');
            console.error();
        })
}

// Reads username from Database and updates html
function getUsernameFromDatabase() {

    $.get("/getUsername", function(data, status){
        document.getElementById("username").textContent = data
    }).fail(function (data, status){
        document.getElementById("username").textContent = "Default Name";
        alert("Couldn't retrieve username from session");
    });
}

//TODO hier evtl "getMail" route nutzen
function getMailFromDatabase() {
    $.get("/profile/getMail", function(data, status){
        document.getElementById("mail").textContent = "Email: " + data
    }).fail(function (data, status){
        document.getElementById("mail").textContent = "Default Mail";
        alert("Couldn't retrieve mail from database");
    });
}

function getGesamtpunkteFromDatabase() {
    $.get("/profile/getTotalPoints", function(data, status){
        document.getElementById("gesamtpunkte").textContent = "Gesamtpunkte: " + data
    }).fail(function (data, status){
        document.getElementById("gesamtpunkte").textContent = "Default Gesamtpunkte";
        alert("Couldn't retrieve gesamtpunkte from database");
    });
}

function getHighscoreFromDatabase() {
    $.get("/profile/getHighScore", function(data, status){
        document.getElementById("highscore").textContent = "Highscore: " + data
    }).fail(function (data, status){
        document.getElementById("highscore").textContent = "Default Highscore";
        alert("Couldn't retrieve highscore from database");
    });
}

function getTierFromDatabase() {
    $.get("/profile/getTierName", function(data, status){
        document.getElementById("tier").textContent = "Rang: " + data
    }).fail(function (data, status){
        document.getElementById("highscore").textContent = "Default Tier";
        alert("Couldn't retrieve tier from database");
    });
}

function getProfilePicFromDatabase() {
        $.get("/profile/getProfilePic", function(data, status){
            if (data != null) {
                document.getElementById("profile-picture").setAttribute("src", data)
            }
            else document.getElementById("profile-picture").setAttribute("src","https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
        }).fail(function (data, status){
            alert("Couldn't retrieve Profile Picture from database");
        });
}

//onclick-function von friend aus friendlist (functions_friendlist.js)
function setupInformationFromFriend(elm) {
    if (!viewOnly) {
        var name = elm.childNodes[1].innerHTML;  //childnodes[1] gibt das "name" child von friend

        friendGetUsernameFromDatabase(name);
        friendGetGesamtpunkteFromDatabase(name);
        friendGetHighscoreFromDatabase(name);
        friendGetMailFromDatabase(name);
        friendGetTierFromDatabase(name);
        friendGetProfilePicFromDatabase(name);

        deleteOldFriendList();          //Liste wird gelöscht, damit nur neue angezeigt wird
        friendGetFriendsData(name);

        document.getElementById("editProfileButton").style.visibility = "hidden";       //Edit-Profile-Knopf hidden
        document.getElementById("addFriendInputLabel").style.visibility = "hidden";         //Freund hinzufügen Label hidden
        document.getElementById("addFriendInput").style.visibility = "hidden";         //Freund hinzufügen Searchbar hidden
        document.getElementById("addFriendButton").style.visibility = "hidden";         //Freund hinzufügen Button hidden
        document.getElementById("backToMyProfileButton").style.visibility = "visible";  //Zurück Button visible
        viewOnly = true;                //in functions_friendlist.js wird der Freundeslisten hoverEffect und onclick nicht mehr ausgeführt
    }
}

function backToMyProfile() {
    setup();

    deleteOldFriendList();          //Liste wird gelöscht, damit nur neue angezeigt wird
    getFriendsData();

    document.getElementById("editProfileButton").style.visibility = "visible";       //Edit-Profile-Knopf hidden
    document.getElementById("addFriendInputLabel").style.visibility = "visible";         //Freund hinzufügen Label hidden
    document.getElementById("addFriendInput").style.visibility = "visible";         //Freund hinzufügen Searchbar hidden
    document.getElementById("addFriendButton").style.visibility = "visible";         //Freund hinzufügen Button hidden
    document.getElementById("backToMyProfileButton").style.visibility = "hidden";  //Zurück Button visible
    viewOnly = false;
}

function deleteOldFriendList() {
    var friendList = document.getElementsByClassName("friend-list");
    for (i = 0; i < friendList.length; i++) {
        friendList.item(i).remove();
    }
}

function friendGetUsernameFromDatabase(username) {
    fetch("/friendGetUsername", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("username").textContent = result)
}

function friendGetMailFromDatabase(username) {
    fetch("/profile/friendGetMail", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("mail").textContent = "Email: " + result)
}

function friendGetGesamtpunkteFromDatabase(username) {
    fetch("/profile/friendGetTotalPoints", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("gesamtpunkte").textContent = "Gesamtpunkte: " + result)
}

function friendGetHighscoreFromDatabase(username) {
    fetch("/profile/friendGetHighScore", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("highscore").textContent = "Highscore: " + result)
}

function friendGetTierFromDatabase(username) {
    fetch("/profile/friendGetTierName", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("tier").textContent = "Rang: " + result)
}

function friendGetProfilePicFromDatabase(username) {
    fetch("/profile/friendGetProfilePic", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.json())
        .then(result => setFriendsProfilePic(result))
        .catch((error) => {
        alert("Couldn't retrieve Profile Picture from database");
        console.error('Error:', error);
    });
}

function setFriendsProfilePic(result) {
    if (result != null) {
        document.getElementById("profile-picture").setAttribute("src", result)
    }
    else document.getElementById("profile-picture").setAttribute("src","https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
}