$(function()
{
    var isTakePlace = false;
    var roomId = 1;

    loadSvgTable('img/tables.svg');

    // load svg table in html
    function loadSvgTable(svgPath)
    {
        $('#wrap-table').load(svgPath);
    }

    // event click in circle place
    $('#wrap-table').on('click', 'circle[r=42]', function()
    {
        var sendData = {
            placeId: $(this).index('circle[r=42]'),
            roomId: roomId
        };

        if(isTakePlace)
            socket.emit('change-place', sendData);
        else
            socket.emit('take-place', sendData);

        isTakePlace = true;
    });

    // take place
    function takePlace(element, dataUser)
    {
        var circle = Snap(element);
        var cx = parseFloat(circle.attr('cx'));
        var cy = parseFloat(circle.attr('cy'));

        // change color circle
        $(element).attr({
            'fill': '#fff',
            'class': '',
            'data-class': $(element).attr('class'),
            'data-user-take': dataUser.id
        });
        // add avatar
        circle.paper.image(dataUser.avatar, cx - 39, cy - 39, 78, 78).attr('data-user-id', dataUser.id);
        // add circle status
        circle.paper.circle(cx - 25, cy - 30, 5).attr({
            fill: '#2ecc71',
            stroke: '#fff',
            'stroke-width': 2,
            'data-user-id': dataUser.id
        });
        // add rect info
        var rectInfo = circle.paper.rect(cx - 60, cy + 39, 120, 28, 10, 10).attr({
            fill: '#fff',
            stroke: '#e4e4e4',
            'stroke-width': 1,
            'data-user-id': dataUser.id
        });
        // add text user name
        circle.paper.text(cx, cy + 58, dataUser.lastName + ' ' + dataUser.firstName).attr({
            fill: '#000',
            'text-anchor': 'middle',
            'data-user-id': dataUser.id
        });
    }

    // client socket.io

    var socket = io(':60001');
    socket.emit('enter-in-room', roomId);

    socket.on('new-user', function(data)
    {
        var circle = $('#wrap-table circle[r=42]').eq(data.placeId).get(0);
        takePlace(circle, data.user);
    });

    socket.on('list-user', function(listUser)
    {
        listUser.forEach(function(data)
        {
            var circle = $('#wrap-table circle[r=42]').eq(data.placeId).get(0);
            takePlace(circle, data.user);
        });
    });

    socket.on('clear-place', function(userId)
    {
        $('#wrap-table svg *[data-user-id=' + userId + ']').remove();
        var $circlePlace = $('#wrap-table *[data-user-take=' + userId + ']');
        $circlePlace.addClass($circlePlace.attr('data-class'));
    });

});