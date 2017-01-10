var io = require('socket.io')(60001, {
    origins: 'svg-tables:*'
});
var listUsers = [];

io.on('connection', function(socket)
{
    // send list users from room
    socket.on('enter-in-room', function(roomId)
    {
        socket.join(roomId);
        socket.emit('list-user', listUsers);
    })

    // send data new user
    socket.on('take-place', function(data)
    {
        var userData = {
            socketId: socket.id,
            placeId: data.placeId,
            roomId: data.roomId,
            user: getDataUser()
        };

        if(issetUserInRoom(data.roomId, userData.user.id))
            return;

        listUsers.push(userData);
        socket.emit('new-user', userData);
        socket.to(data.roomId).broadcast.emit('new-user', userData);
    });

    socket.on('change-place', function(data)
    {
        var userData = getUserWhereSocketId(socket.id);
        userData.placeId = data.placeId;

        socket.emit('clear-place', userData.user.id);
        socket.emit('new-user', userData);
        socket.to(data.roomId).broadcast.emit('clear-place', userData.user.id);
        socket.to(data.roomId).broadcast.emit('new-user', userData);
    });

    // disconnect client
    socket.on('disconnect', function()
    {
        for(var i = 0; i < listUsers.length; i++)
            if(listUsers[i].socketId == socket.id)
            {
                socket.to(listUsers[i].roomId).broadcast.emit('clear-place', listUsers[i].user.id);
                listUsers.splice(i, 1);
                break;
            }
    });

});

function issetUserInRoom(roomId, userId)
{
    for(var i = 0; i < listUsers.length; i++)
        if (listUsers[i].roomId == roomId && listUsers[i].user.id == userId)
            return true;

    return false
}

function getUserWhereSocketId(socketId)
{
    for(var i = 0; i < listUsers.length; i++)
        if(listUsers[i].socketId == socketId)
            return listUsers[i];
}

var indexUser = 1;

function getDataUser()
{
    return {
        id: indexUser++,
        avatar: 'img/avatar.png',
        firstName: 'John',
        lastName: 'Smith'
    };
}