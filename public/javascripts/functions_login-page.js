$(function() {
    var visibilityToggle1 = document.getElementById("visibilityButton1");
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    var username_error = document.getElementById("username_error");
    var password_error = document.getElementById("password_error");
    var login_error = document.getElementById("login_error");

    username.addEventListener('input', function () {
        if (username.value.length >= 1) {
            username_error.style.display = "none";
            login_error.style.display = "none";
        }
    });

    password.addEventListener('input', function() {

        if (password.value.length >= 1) {
            password_error.style.display = "none";
            login_error.style.display = "none";
        }
    });

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
    var username_error = document.getElementById("username_error");
    var password_error = document.getElementById("password_error");
    var login_error = document.getElementById("login_error");

    if (username.value === "admin" && password.value === "admin") {
        window.location.href = "main";
    }

    let usernameTyped = username.value.length >= 1;
    if (!usernameTyped) {
        username_error.style.display = "block";
        login_error.style.display = "none";
    }

    if (password.value.length < 1) {
        password_error.style.display = "block";
        login_error.style.display = "none";
    }

    else if (usernameTyped) {
        login_error.style.display = "block";
    }
}

function changePage() {
    window.location.href = "createAccount";
}

