
function displayAchievements() {
    var allAchievements = [];
    for (i = 0; i <= 30; i++){
        allAchievements.push('Achievement '+i);
    }

    allAchievements.forEach(function (item, index, array) {
        console.log(index);
        var div = document.createElement('div');
        div.textContent = item;
        div.setAttribute('class', 'achievementBox');
        document.body.appendChild(div);
    });
}

$(function () {

    //edit the profile (username, picture) (email and password could be added in the future)
    $("#profileButton").on('click', function () {

        if ($(this).text() === "Edit Profile") {

            var username = $("#username").text();
            //hier nutze ich den style tag nur, weil er aus dem css sheet irgendwie nicht geladen wurde
            var usernameInputField = "<input style='font-size: 60px' name=\"new_username\" value=" + username + ">";
            $("#username").html(usernameInputField);
            $(this).text("Save Profile");

            $("#p-image").html("<input style='font-size: 22px' id=\"file-upload\" type=\"file\" accept=\"image/*\"/>")
            $("#file-upload").on('change', function(){
                readURL(this);
            });

        }else if ($(this).text() === "Save Profile"){

            var newUsername = document.forms["userForm"]["new_username"].value;
            if (newUsername === "") {
                alert("Your Username should not be empty");
            }else {
                $("#username").html(newUsername);
                $(this).text("Edit Profile");
                $("#p-image").html("");
            }
        }
    });

    //function to upload pictures
    var readURL = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#profile-picture').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }
});
