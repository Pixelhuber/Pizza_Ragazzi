$(function() {
    var visibilityToggle1 = document.getElementById("visibilityButton1");
    var visibilityToggle2 = document.getElementById("visibilityButton2");

    var password = document.getElementById("password");
    var password2 = document.getElementById("password2");

    visibilityToggle1.addEventListener('click', function () {
        if (password.type === "password") {
            password.type = "text";
            visibilityToggle1.innerHTML = 'visibility';
        }
        else {
            password.type = "password";
            visibilityToggle1.innerHTML = 'visibility_off';
        }
    });
    visibilityToggle2.addEventListener('click', function () {
        if (password2.type === "password") {
            password2.type = "text";
            visibilityToggle2.innerHTML = 'visibility';
        }
        else {
            password2.type = "password";
            visibilityToggle2.innerHTML = 'visibility_off';
        }
    });
});

function validateCreateAccountData() {
    var username = document.forms['loginForm']['username'];
    var email = document.forms['loginForm']['email'];
    var password = document.forms['loginForm']['password'];
    var password2 = document.forms['loginForm']['password2'];

    if (password.value === password2.value) {
        return true;
    } else {
        alert("Passwörter stimmen nicht überein!")
        return false;
    }
}