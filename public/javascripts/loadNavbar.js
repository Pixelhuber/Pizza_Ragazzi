$(function (){
    $.get("navbar/navbar.html", function (data) {
        $("#nav-placeholder").html(data);
    });
});