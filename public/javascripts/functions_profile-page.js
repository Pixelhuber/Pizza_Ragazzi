
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
                updateUsernameInSession(newUsername);
                selectFile.html("");

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
    getUsernameFromSession();
    getGesamtpunkteFromDatabase();
    getHighscoreFromDatabase();
    getMailFromDatabase();
}

// Sends a request to update the username in the session
function updateUsernameInSession(newUsername) {

    let loginViewModel = {
        username: newUsername,
        password: "Hallo" // Passwort brauch ich hier eigentlich nicht, ich lass es trotzdem mal drin
    }

    $.post("/profile/updateUsername", loginViewModel,
        function (data, status){
            // Das funktioniert noch nicht ganz! Beim ausführen sieht man, dass "data" irgendwie leer bleibt... aber der Wert wird korrekt gespeichert
            alert("Session updated!\nData: " + data + "\nStatus: " + status)
        }
        ).fail(function (){
            alert("Something went wrong")
        });
}

// Reads username from session and updates html
function getUsernameFromSession() {

    $.get("/getUsername", function(data, status){
        //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
        document.getElementById("username").textContent = data
    }).fail(function (data, status){
        document.getElementById("username").textContent = "Default Name";
        alert("Couldn't retrieve username from session");
    });
}

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
    $.get("/profile/getGesamtpunkte", function(data, status){
        //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
        document.getElementById("gesamtpunkte").textContent = "Gesamtpunkte: " + data
    }).fail(function (data, status){
        document.getElementById("gesamtpunkte").textContent = "Default Gesamtpunkte";
        alert("Couldn't retrieve gesamtpunkte from database");
    });
}

function getHighscoreFromDatabase() {
    $.get("/profile/getHighscore", function(data, status){
        //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
        document.getElementById("highscore").textContent = "Highscore: " + data
    }).fail(function (data, status){
        document.getElementById("highscore").textContent = "Default Highscore";
        alert("Couldn't retrieve highscore from database");
    });
}