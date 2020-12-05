$(function() {
    var visibilityToggle1 = document.getElementById("visibilityButton1");

    var password = document.getElementById("password");

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
});

function validateLoginData() {
    var username = document.forms['loginForm']['username'];
    var password = document.forms['loginForm']['password'];

    if (username.value === "admin" && password.value === "admin") {
        return true;
    }
    else {
        alert("Ungültige Zugangsdaten!")
        return false;
    }
}

