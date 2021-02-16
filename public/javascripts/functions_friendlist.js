function getFriendsData() {
    fetch("/getFriendsData")
        .then(result => result.json())
        .then(result => createFriendlist(result));
}

function createFriendlist(data){
    var list = document.createElement(`ul`);
    list.className = `friend-list`;
    for (var userName in data){
        var friend = document.createElement(`li`);
        friend.className = `friend`;
        friend.onclick = function() {getUsernameFromListItem(this)};
        friend.onmouseover = function () {beginHoverEffect(this)};
        friend.onmouseleave = function () {endHoverEffect(this)};

        var image= document.createElement(`img`)
        if (data[userName]!=null) {
            image.src = data[userName]
        }else image.src="assets/images/profile-icon.png"

        //Element erstellen, um HoverText anzuzeigen
        var hoverText = document.createElement(`div`);
        hoverText.className = `hoverText`;
        hoverText.innerHTML = "Profil anschauen";
        hoverText.style.display = "none";

        var name = document.createElement(`div`);
        name.className = `name`;
        name.innerHTML = userName;
        friend.appendChild(image)
        friend.appendChild(name);
        friend.appendChild(hoverText);
        list.appendChild(friend);
    }
    document.getElementById("container_friends").append(list);
}

function getUsernameFromListItem(elm) {
    var name = elm.childNodes[1].innerHTML;  //childnodes[1] gibt das "name" child von friend
    console.log(name);
}

function beginHoverEffect(elm) {
    elm.childNodes[1].style.display = "none";
    let hoverText = elm.childNodes[2];     //childnodes[2] gibt das "hoverText" child von friend
    hoverText.style.display = "block";
    hoverText.style.fontSize = "1.3em";
    hoverText.style.color = "white";
}

function endHoverEffect(elm) {
    elm.childNodes[2].style.display = "none";
    let name = elm.childNodes[1];
    name.style.display = "block";
}

function defaultList(){
    var test = ["Andres Perez","Leah Slaten","Max Mustermann"];
    createFriendlist(test);

}