const colors = ["#e57373", "#f06292", "#ba68c8", "#9575cd", "#7986cb", "#64b5f6", "#4fc3f7", "#4db6ac", "#81c784", "#aed581", "#dce775", "#fff176", "#ffd54f", "#ffb74d", "#ff8a65"];
const userColors = {};

$('#signout-button').click(() => {
    $.post("/api/sign-out", () => {
        location.href = "/sign-in";
    });
});

$('#editaccount-button').click(() => {
    location.href = "/edit";
});

$('#deleteaccount-button').click(() => {
    location.href = "/delete";
});

var socket = io();

socket.emit('hello', myUsername);

socket.on('new user', username => {
    assignColor(username);
    let html = $('.home__container__users-view__list').html();
    html += `
        <div class="home__container__users-view__list__user ${username === myUsername ? 'current-user' : ''}" id="user_${username}" style="color:${userColors[username]}">${username}</div>
    `;
    $('.home__container__users-view__list').html(html);
});

// Update receive message event handling in home.js
socket.on('receive message', message => {
    const { username, content, timestamp } = message; // Extract timestamp from message
    let html = `
        <div class="home__container__chat-view__chatlog__message ${username === myUsername ? 'my-message' : 'other-message'}">
            <div class="${username === myUsername ? 'my-round' : 'round'}" style="background-color:${userColors[username]}">
                <strong>${username.charAt(0).toUpperCase()}</strong>
            </div>
            <div class="message-content">
                <p>${content}</p>
                <span class="message-timestamp">${timestamp}</span> <!-- Display timestamp -->
            </div>
        </div>
    `;
    $('.home__container__chat-view__chatlog').append(html);
    $('.home__container__chat-view__chatlog')[0].scrollTop = $('.home__container__chat-view__chatlog')[0].scrollHeight;
});


socket.on('receive chatlog', messages => {
    let html = '';
    for (let i = messages.length - 1; i >= 0; i--) {
        const { username, content } = messages[i];
        assignColor(username);
        html += `
            <div class="home__container__chat-view__chatlog__message ${username === myUsername ? 'my-message' : 'other-message'}">
                <div class="${username === myUsername ? 'my-round' : 'round'}" style="background-color:${userColors[username]}">
                    <strong>${username.charAt(0).toUpperCase()}</strong>
                </div>
                <div class="message-content">
                    ${content}
                </div>
            </div>
        `;
    }
    $('.home__container__chat-view__chatlog').html(html);
});

socket.on('receive users', users => {
    let html = '';
    users.forEach(user => {
        assignColor(user);
        html += `
            <div class="home__container__users-view__list__user ${user === myUsername ? 'current-user' : ''}" id="user_${user}" >${user}</div>
        `;
    });
    $('.home__container__users-view__list').html(html);
});

socket.on('user left', username => {
    $('#user_' + username).remove();
});

$('.home__container__chat-view__message__send').click(() => {
    const content = $('.home__container__chat-view__message__body').val();
    const length = content.length;

    if (length > 0 && length <= 250) {
        socket.emit('send message', {
            username: myUsername,
            content: content
        });
        $('.home__container__chat-view__message__body').val("");
        $('.home__container__chat-view__message__char-count').text("0/250");
    }
});

$('.home__container__chat-view__message__body').on('keydown', e => {
    const keyCode = e.keyCode;

    if (keyCode === 13) {
        $('.home__container__chat-view__message__send').click();
    }
});

$('.home__container__chat-view__message__body').on('input', () => {
    const length = $('.home__container__chat-view__message__body').val().length;
    $('.home__container__chat-view__message__char-count').text(length + "/250");

    if (length > 250) {
        $('.home__container__chat-view__message__char-count').css('color', 'red');
        $('.home__container__chat-view__message__send').attr('disabled', true);
    } else {
        $('.home__container__chat-view__message__char-count').css('color', '');
        $('.home__container__chat-view__message__send').attr('disabled', false);
    }
});

function assignColor(username) {
    if (!userColors[username]) {
        userColors[username] = colors[Object.keys(userColors).length % colors.length];
    }
}
