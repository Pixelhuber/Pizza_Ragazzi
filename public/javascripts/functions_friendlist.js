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

        var image= document.createElement(`img`)
        if (data[userName]!=null) {
            image.src = data[userName]
        }else image.src="assets/images/profile-icon.png"
        var name = document.createElement(`div`);
        name.className = `name`;
        name.innerHTML = userName;
        friend.appendChild(image)
        friend.appendChild(name);
        list.appendChild(friend);
    }
    document.getElementById("container_friends").append(list);
}

function getUsernameFromListItem(elm) {
    var name = elm.childNodes[1].innerHTML;
    console.log(name);
}

function defaultList(){
    var test = ["Andres Perez","Leah Slaten","Max Mustermann"];
    createFriendlist(test);

}