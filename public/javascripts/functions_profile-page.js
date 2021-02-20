function displayAchievements(allAchievements) {
    if (allAchievements !== 'undefined') {
        // Display Achievements
        allAchievements.forEach(function (item) {
            const achievementDiv = document.createElement('div');
            achievementDiv.textContent = item.name;
            achievementDiv.setAttribute('class', 'achievementBox');

            const descriptionSpan = document.createElement('span');
            descriptionSpan.textContent = item.description;
            descriptionSpan.setAttribute('class', 'achievementDescription');
            achievementDiv.appendChild(descriptionSpan);

            document.getElementById("achievements_table").appendChild(achievementDiv);
        });
        document.getElementById("loading_achievements").style.display = "none"; //loading achievements hiden

    } else document.getElementById("loading_achievements").style.display = "none"; //loading achievements hiden, wenn Nutzer keine achievements hat
}

$(function () {

    //edit the profile (username, picture) (email and password could be added in the future)
    $("#editProfileButton").on('click', function () {

        // CONSTANTS -----------------------------------
        const profileButton = $(this);
        const usernameField = $("#username");
        const selectFile = $("#p-image");
        // ---------------------------------------------

        if (profileButton.text() === "Profil bearbeiten") {
            const usernameText = usernameField.text();

            // change usernameField into an inputField
            const usernameInputField = "<input style='font-size: 25px; border: 2px black solid' name=\"new_username\" value=\"" + usernameText + "\">"; //hier nutze ich den style tag nur, weil er aus dem css sheet irgendwie nicht geladen wurde
            usernameField.html(usernameInputField);

            // display field to change profile-picture
            const selectFileButton = "<input style='font-size: 18px' id=\"file-upload\" type=\"file\" accept=\"image/*\"/>"
            selectFile.html(selectFileButton);
            $("#file-upload").on('change', function () {
                readURL(this);
            });

            profileButton.text("Speichern");

        } else if (profileButton.text() === "Speichern") {

            const newUsername = document.forms["userForm"]["new_username"].value;
            if (newUsername === "") {
                alert("Your Username should not be empty");
            } else {
                usernameField.html(newUsername);
                //updateUsernameInDatabaseAndSession(newUsername);
                selectFile.html("");
                uploadProfilePictureIntoDB();
                profileButton.text("Profil bearbeiten");
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
    document.getElementById("chatWithWhoButton").onclick = function () { //onclick für Chat mit Freund input (Wem willst du schreiben?)
        setupChatStuff(document.getElementById("chatWithWhoInput").value)
    };
    document.getElementById("sendMessageButton").onclick = function () { //onclick für Chat sendMessage
        let currentDate = new Date();
        sendMessage(document.getElementById("sendMessageInput").value, currentDate.getTime());
    };

    getUsernameFromDatabase();
    getGesamtpunkteFromDatabase();
    getHighscoreFromDatabase();
    getMailFromDatabase();
    getTierFromDatabase();
    getProfilePicFromDatabase();
    getAchievementsFromDatabase();
    getFriendsData();
}

//TODO update username und profilepic zusammenlegen

// Sends a request to update the username in the session
function updateUsernameInDatabaseAndSession(newUsername) {

    let loginViewModel = {
        username: newUsername,
        password: "Hallo" // Passwort brauch ich hier eigentlich nicht, ich lass es trotzdem mal drin
    }

    $.post("/profile/updateUsername", loginViewModel,
        function (data, status) {
            // Das funktioniert noch nicht ganz! Beim ausführen sieht man, dass "data" irgendwie leer bleibt... aber der Wert wird korrekt gespeichert
            alert("Session and Database updated!\nData: " + data + "\nStatus: " + status)
        }
    ).fail(function () {
        alert("Something went wrong")
    });
}

function uploadProfilePictureIntoDB() {
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

function getAchievementsFromDatabase() {
    document.getElementById("loading_achievements").style.display = "block" //loading achievements anzeigen
    $.get("/profile/getAchievements", function (data, status) {
        displayAchievements(JSON.parse(data));
    }).fail(function (data, status) {
        alert("Couldn't retrieve achievements from database");
    });
}

// Reads username from Database and updates html
function getUsernameFromDatabase() {
    $.get("/getUsername", function (data, status) {
        document.getElementById("username").textContent = data
    }).fail(function (data, status) {
        document.getElementById("username").textContent = "Default Name";
        alert("Couldn't retrieve username from database");
    });
}

//TODO hier evtl "getMail" route nutzen
function getMailFromDatabase() {
    $.get("/profile/getMail", function (data, status) {
        document.getElementById("mail").textContent = "Email: " + data
    }).fail(function (data, status) {
        document.getElementById("mail").textContent = "Default Mail";
        alert("Couldn't retrieve mail from database");
    });
}

function getGesamtpunkteFromDatabase() {
    $.get("/profile/getTotalPoints", function (data, status) {
        document.getElementById("gesamtpunkte").textContent = "Gesamtpunkte: " + data
    }).fail(function (data, status) {
        document.getElementById("gesamtpunkte").textContent = "Default Gesamtpunkte";
        alert("Couldn't retrieve gesamtpunkte from database");
    });
}

function getHighscoreFromDatabase() {
    $.get("/profile/getHighScore", function (data, status) {
        document.getElementById("highscore").textContent = "Highscore: " + data
    }).fail(function (data, status) {
        document.getElementById("highscore").textContent = "Default Highscore";
        alert("Couldn't retrieve highscore from database");
    });
}

function getTierFromDatabase() {
    $.get("/profile/getTierName", function (data, status) {
        document.getElementById("tier").textContent = "Rang: " + data
    }).fail(function (data, status) {
        document.getElementById("highscore").textContent = "Default Tier";
        alert("Couldn't retrieve tier from database");
    });
}

function getProfilePicFromDatabase() {
    $.get("/profile/getProfilePic", function (data, status) {
        if (data != null) {
            document.getElementById("profile-picture").setAttribute("src", data)
        } else document.getElementById("profile-picture").setAttribute("src", "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
    }).fail(function (data, status) {
        alert("Couldn't retrieve Profile Picture from database");
    });
}

//onclick-function von friend aus friendlist (functions_friendlist.js)
function setupInformationFromFriend(elm) {
    if (document.getElementById("editProfileButton").innerText === "Speichern") {  //gegen seltenen Bug: während dem Editieren des Profiles das Profil eines Freundes anschauen
        alert("Bitte erst Profil speichern!")
    }

    else if (!viewOnly) {        //Funktion wird nur ausgeführt, wenn man auf dem eigenen Profil ist
        var name = elm.childNodes[1].innerHTML;  //childnodes[1] gibt das "name" child von friend

        friendGetUsernameFromDatabase(name);
        friendGetGesamtpunkteFromDatabase(name);
        friendGetHighscoreFromDatabase(name);
        friendGetMailFromDatabase(name);
        friendGetTierFromDatabase(name);
        friendGetProfilePicFromDatabase(name);

        deleteOldAchievements();            //Achievements werden gelöscht, damit nur neue angezeigt werden
        friendGetAchievementsFromDatabase(name);

        deleteOldFriendList();          //Liste wird gelöscht, damit nur neue angezeigt wird
        friendGetFriendsData(name);

        hideSensibleStuff();

        document.getElementById("backToMyProfileButton").style.display = "block";  //Zurück Button visible
        document.getElementById("chat_heading").textContent = "Chat"; //Chat-Überschrift neutral machen

        viewOnly = true;                //in functions_friendlist.js wird der Freundeslisten hoverEffect und onclick nicht mehr ausgeführt (diese Funktion auch nicht)
    }
}

function backToMyProfile() {
    deleteOldAchievements();         //Achievements werden gelöscht, damit nur die vom logged in user angezeigt werden
    deleteOldFriendList();          //FreundesListe wird gelöscht, damit nur die vom logged in user angezeigt werden

    setup();

    showSensibleStuff();

    viewOnly = false;
}

function hideSensibleStuff() {
    document.getElementById("editProfileButton").style.display = "none";       //Edit-Profile-Knopf hidden
    document.getElementById("addFriendInputLabel").style.display = "none";          //Freund hinzufügen Label hidden
    document.getElementById("addFriendInput").style.display = "none";          //Freund hinzufügen Searchbar hidden
    document.getElementById("addFriendButton").style.display = "none";          //Freund hinzufügen Button hidden
    //chatStuff hiden
    document.getElementById("chatWithWhoInputLabel").style.display = "none";
    document.getElementById("chatWithWhoInput").style.display = "none";
    document.getElementById("chatWithWhoButton").style.display = "none";
    document.getElementById("sendMessageInput").style.display = "none";
    document.getElementById("sendMessageButton").style.display = "none";
    document.getElementById("chatMessages_div").style.display = "none"; //alles Messages hiden
}

function showSensibleStuff() {
    document.getElementById("editProfileButton").style.display = "block";       //Edit-Profile-Knopf zeigen
    document.getElementById("addFriendInputLabel").style.display = "inline";           //Freund hinzufügen Label zeigen
    document.getElementById("addFriendInput").style.display = "inline";          //Freund hinzufügen Searchbar zeigen
    document.getElementById("addFriendButton").style.display = "inline";         //Freund hinzufügen Button zeigen
    document.getElementById("backToMyProfileButton").style.display = "none";  //Zurück Button verstecken
    //chatStuff zeigen
    document.getElementById("chatWithWhoInputLabel").style.display = "inline";
    document.getElementById("chatWithWhoInput").style.display = "inline";
    document.getElementById("chatWithWhoButton").style.display = "inline";
    if (chatPartner !== undefined) {
        document.getElementById("sendMessageInput").style.display = "inline";
        document.getElementById("sendMessageButton").style.display = "inline";
    }
    document.getElementById("chatMessages_div").style.display = "block"; //alles Messages zeigen
}

//löscht Freundesliste um nur Freundesliste des Freundes zu sehen
function deleteOldFriendList() {
    var friendList = document.getElementsByClassName("friend-list");
    for (i = 0; i < friendList.length; i++) {
        friendList.item(i).remove();
    }
}

//löscht Achievements um nur Achievements des Freundes zu sehen
function deleteOldAchievements() {
    var achievements = document.getElementById("achievements_table");
    achievements.innerHTML = '';
}

function friendGetAchievementsFromDatabase(username) {
    document.getElementById("loading_achievements").style.display = "block" //loading achievements anzeigen
    fetch("/profile/friendGetAchievements", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.json())
        .then(result => displayAchievements(result))
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
    } else document.getElementById("profile-picture").setAttribute("src", "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
}