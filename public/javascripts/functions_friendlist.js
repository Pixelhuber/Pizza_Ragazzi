function getFriendsData() {
    fetch("/highscore/getFriendsData")
        .then(result => result.json())
        .then(result => createFriendlist(result));
}

function createFriendlist(data){
    var list = document.createElement(`ul`)
    list.className = `friend-list`
    data.forEach(function (item,index) {
        var friend = document.createElement(`li`)
        friend.className = `friend`
        
        var name = document.createElement(`div`)
        name.className = `name`
        name.innerHTML = item;
        friend.appendChild(name)
        list.appendChild(friend)
    });
    document.body.appendChild(list)
}
