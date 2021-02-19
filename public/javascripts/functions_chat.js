var chatPartner;

function setupChatStuff(username) {
    if (username !== chatPartner) {    //nur wenn neuer Name eingegeben wurde, wird gefetcht
        document.getElementById("loading_messages").style.display = "block"; //ladesymbol anzeigen
        getMessagesFromDatabase(username);
    }
}

function getMessagesFromDatabase(username) {
    fetch("/profile/getMessages", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.json())
        .then(result => displayChatMessages(result, username))
}

function sendMessage(message) {
    fetch("/profile/sendMessage", {
        method: 'POST',
        body: JSON.stringify({
            receiver: chatPartner,
            message_text: message
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    })
}

function displayChatMessages(messages, user2Username) {
    if (messages != null && messages !== 'undefined') {
        chatPartner = user2Username;  //chatPartner-Variable in Zeile 1 zuweisen
        document.getElementById("chatMessages_div").innerHTML = ''; //alten Chat löschen

        document.getElementById("chatWithWhoInput").style.borderColor = "black"; //roten Rand des Inputs entfernen, falls er da war
        document.getElementById("chat_heading").textContent = "Chat mit " + user2Username.toString().toUpperCase();  //Überschrift mit Username2
        //SendeInput und SendeButton anzeigen
        document.getElementById("sendMessageInput").style.display = "inline";
        document.getElementById("sendMessageButton").style.display = "inline";

        //Display Messages
        messages.forEach(function (item) {
            const container = document.createElement('div');

            const content = document.createElement('p');
            content.textContent = item.message_text;

            const timeSpan = document.createElement('span');
            var date = new Date(item.time)
            timeSpan.textContent = date.getHours() + ":" + date.getMinutes() + " " + date.toDateString();

            if (item.senderName.toLowerCase() === user2Username.toLowerCase()) {  //falls ausgewählter Freund Nachricht gesendet hat
                container.setAttribute('class', 'container');
                timeSpan.setAttribute('class', 'time-right');
            }
            else {
                container.setAttribute('class', 'container darker');
                timeSpan.setAttribute('class', 'time-left');
            }

            container.appendChild(content);
            container.appendChild(timeSpan);
            document.getElementById("chatMessages_div").appendChild(container);
        });
        document.getElementById("loading_messages").style.display = "none";
    }
    else {  //nicht befreundet oder Übergabeparameter == null
        document.getElementById("loading_messages").style.display = "none";
        document.getElementById("chatWithWhoInput").style.borderColor = "red"; //roten Rand beim Input hinzufügen
    }
}