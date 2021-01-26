function getFriendsData() {
    fetch("/getFriendsData")
        .then(result => result.json())
        .then(result => createFriendlist(result));
}

function createFriendlist(data){
    var list = document.createElement(`ul`);
    list.className = `friend-list`;
    data.forEach(function (item,index) {
        var friend = document.createElement(`li`);
        friend.className = `friend`;
        var image= document.createElement(`img`)
        image.src = 'https://i.imgur.com/nkN3Mv0.jpg' //TODO Profilbild anstatt default Bild
        var name = document.createElement(`div`);
        name.className = `name`;
        name.innerHTML = item;
        friend.appendChild(image)
        friend.appendChild(name);
        list.appendChild(friend);
    });
    document.getElementById("container_friends").append(list);
}

function defaultList(){
    var test = ["Andres Perez","Leah Slaten","Max Mustermann"];
    createFriendlist(test);

}