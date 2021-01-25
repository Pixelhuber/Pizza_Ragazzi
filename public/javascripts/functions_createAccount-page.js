$(function() {
    var visibilityToggle1 = document.getElementById("visibilityButton1");
    var visibilityToggle2 = document.getElementById("visibilityButton2");

    var username = document.getElementById("username");
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    var password2 = document.getElementById("password2");

    var username_error = document.getElementById("username_error");
    var email_error = document.getElementById("email_error")
    var password_error = document.getElementById("password_error");
    var password_error2 = document.getElementById("password_error2");

    username.addEventListener('input', function () {
        if (username.value.length >= 1) {
            username_error.style.display = "none";
        }
    });

    email.addEventListener('input', function () {
        if (email.value.length >= 1) {
            email_error.style.display = "none";
        }
    });

    password.addEventListener('input', function() {
        if (password.value.length >= 1) {
            password_error.style.display = "none";
        }
    });

    password2.addEventListener('input', function() {
        if (password2.value.length >= 1) {
            password_error2.style.display = "none";
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
    var username = document.forms['createAccountForm']['username'];
    var email = document.forms['createAccountForm']['email'];
    var password = document.forms['createAccountForm']['password'];
    var password2 = document.forms['createAccountForm']['password2'];

    var username_error = document.getElementById("username_error");
    var email_error = document.getElementById("email_error")
    var password_error = document.getElementById("password_error");
    var password_error2 = document.getElementById("password_error2");

    var validInputs = true;
    if (username.value.length < 1) {
        username_error.style.display = "block";
        validInputs = false;
    }

    if (email.value.length < 1) {
        email_error.style.display = "block";
        validInputs = false;
    }

    if (password.value.length < 1) {
        password_error.style.display = "block";
        validInputs = false;
    }

    if (password2.value.length < 1) {
        password_error2.style.display = "block";
        validInputs = false;
    }

    if (password.value === password2.value && validInputs) {
        createAccount();
    }
}

function changePage() {
    window.location.href = "login";
}

function createAccount() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let login_error = document.getElementById("login_error");

    fetch("/authenticate", {
        method: 'POST',
        body:   JSON.stringify({
            username:   username
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    })
        .then(result => result.text())
        .then(data => {
           window.location.href = "main";

        })

    function getUsernameFromSession() {

        let ret = "";

        fetch("/getUsername")
            .then(
                result => result.text()
            ).then(
            result => document.getElementById("username").textContent = result
        ).catch(
            username = username.value()
        );

        return ret;
    }


}
