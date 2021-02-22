
function setup() {
    loadUserData();
    checkForLevelUp();
}

function loadUserData() {

    const username = document.getElementById("username");
    const total_points = document.getElementById("total_points");
    const tier_name = document.getElementById("tier_name");

    $.get("/getUsername", function (data, status) {
        username.innerHTML = data;
    }).fail(function (data, status) {
        username.innerHTML = "Error"
        alert("Couldn't retrieve Username from session");
    });

    $.get("/profile/getTierName", function (data, status) {
        tier_name.innerHTML = data;
    }).fail(function (data, status) {
        tier_name.innerHTML = "Error"
        alert("Couldn't retrieve Tier name from database");
    });

    $.get("/profile/getTotalPoints", function (data, status) {
        total_points.innerHTML = "Gesamtpunkte: " + data;
    }).fail(function (data, status) {
        total_points.innerHTML = "Error"
        alert("Couldn't retrieve Total points from database");
    });
}

function checkForLevelUp() {

    $.get("/menu/checkForLevelUp", function (data, status) {
        document.getElementById("button_memory").style.borderColor = "green";
    }).fail(function (data, status) {

    });
}