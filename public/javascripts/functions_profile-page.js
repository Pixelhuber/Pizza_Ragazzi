
function displayAchievements() {

    // Create Achievement-Array
    const allAchievements = [];
    for (i = 0; i <= 14; i++){
        allAchievements.push('Achievement '+ (i+1));
    }

    // Display Achievements
    allAchievements.forEach(function (item, index, array) {
        console.log(index);
        const achievementDiv = document.createElement('div');
        achievementDiv.textContent = item;
        achievementDiv.setAttribute('class', 'achievementBox');
        document.getElementById("achievements_table").appendChild(achievementDiv);
        document.getElementById("achievements_table")
    });
}

$(function () {

    //edit the profile (username, picture) (email and password could be added in the future)
    $("#profileButton").on('click', function () {

        // CONSTANTS -----------------------------------
        const profileButton = $(this);
        const usernameField = $("#username");
        const selectFile = $("#p-image");
        // ---------------------------------------------

        if (profileButton.text() === "Edit Profile") {
            const usernameText = usernameField.text();

            // change usernameField into an inputField
            const usernameInputField = "<input style='font-size: 60px' name=\"new_username\" value=\"" + usernameText + "\">"; //hier nutze ich den style tag nur, weil er aus dem css sheet irgendwie nicht geladen wurde
            usernameField.html(usernameInputField);

            // display field to change profile-picture
            const selectFileButton = "<input style='font-size: 22px' id=\"file-upload\" type=\"file\" accept=\"image/*\"/>"
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
        //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
        document.getElementById("username").textContent = data
    }).fail(function (data, status){
        document.getElementById("username").textContent = "Default Name";
        alert("Couldn't retrieve username from session");
    });
}

//TODO hier evtl "getMail" route nutzen
function getMailFromDatabase() {
    $.get("/profile/getMail", function(data, status){
        //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
        document.getElementById("mail").textContent = "Email: " + data
    }).fail(function (data, status){
        document.getElementById("mail").textContent = "Default Mail";
        alert("Couldn't retrieve mail from database");
    });
}

function getGesamtpunkteFromDatabase() {
    $.get("/profile/getTotalPoints", function(data, status){
        //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
        document.getElementById("gesamtpunkte").textContent = "Gesamtpunkte: " + data
    }).fail(function (data, status){
        document.getElementById("gesamtpunkte").textContent = "Default Gesamtpunkte";
        alert("Couldn't retrieve gesamtpunkte from database");
    });
}

function getHighscoreFromDatabase() {
    $.get("/profile/getHighScore", function(data, status){
        //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
        document.getElementById("highscore").textContent = "Highscore: " + data
    }).fail(function (data, status){
        document.getElementById("highscore").textContent = "Default Highscore";
        alert("Couldn't retrieve highscore from database");
    });
}

function getProfilePicFromDatabase() {
        $.get("/profile/getProfilePic", function(data, status){
            //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
            document.getElementById("profile-picture").setAttribute("src",data)
        }).fail(function (data, status){
            document.getElementById("highscore").textContent = "Default Highscore";
            alert("Couldn't retrieve highscore from database");
        });
}