import QtQuick 2.0
import QtWebSockets 1.1


Item {
    id: socketio

    property string url: "ws://176.119.158.61:4000/socket.io/?EIO=3&transport=websocket";
    readonly property alias connected: socket.active;
    property var handlers: ({});

    signal opened();
    signal closed();
    signal failed();

    WebSocket {
        id: socket
        active: false
        onTextMessageReceived: socketio.handler(message);
        onStatusChanged: {
            switch (socket.status) {
            case (WebSocket.Error):
                failed();
                break;
            case (WebSocket.Open):
                opened();
                break;
            case (WebSocket.Closed):
                socket.setActive(false);
                socket.setActive(true);
                closed();
                break;
            }
        }

        function setActive(_active) {
            socket.active = _active
        }
    }

    function handshake(phone, token) {
        socket.url = socketio.url + "&phone=" + phone.replace('+', '%2B') + "&token=" + token
        socket.setActive(true);
    }

    function parseMsg(msgString) {
        var regex = /(\d{1,})\["(\w+)",(.*)\]/;
        var pre = msgString.match(regex);
        if (pre) {
            return {
                eventName: pre[2].toString(),
                message: JSON.parse(pre[3])
            }
        }
        else {
            return false
        }
    }

    function handler(fullStringMsg) {
        var _parsed = socketio.parseMsg(fullStringMsg);
        if (_parsed) {
            var handlers = socketio.handlers[_parsed.eventName];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    console.log(_parsed.eventName, JSON.stringify(_parsed.message));
                    handlers[i](_parsed.message);
                }
            }
        }
    }

    function on(eventName, callback) {
        if (socketio.handlers[eventName]) {
            if (socketio.handlers[eventName][0] === callback) {
                socketio.handlers[eventName].push(callback)
            }
        }
        else {
            socketio.handlers[eventName] = [callback]
        }
    }

    function emit(eventName, data) {
        var msgString = "42" + "[" + "\"" + eventName + "\"" + "," + JSON.stringify(data) + "]";
        socket.sendTextMessage(msgString);
    }

}






/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}
}
 ##^##*/
