
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

function setUsernameOnStartup() {
    const newUsername = getUsernameFromSession();

    if (newUsername !== undefined)
        document.getElementById("username").textContent = newUsername;
}

function updateUsernameInSession(newUsername) {

    fetch("/profile", {
        method: 'POST',
        body:   JSON.stringify({
            username:   newUsername
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(
        result => result.json()
    ).then(
        result => alert("Username saved: " + result)
    );
}

function getUsernameFromSession() {

    let ret = "";

    fetch("/getUsername")
        .then(
            result => result.text()
        ).then(
            //TODO: Ich will in dieser Methode nur den String zurückgeben und nicht schon das Feld ändern
            result => document.getElementById("username").textContent = result
        ).catch(
            err => alert("Couldn't retrieve username")
        );

    return ret;
}