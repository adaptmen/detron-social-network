import QtQuick 2.0
import QtQuick.Controls.Universal 2.0
import QtQuick.Controls 2.3

Item {
    id: root
    
    property int offsetLevel: 0
    property int spaceBetween: 10
    
    property string chatId
    property string chatName
    property string chatPrivacy
    
    function load(chatInfo) {
        console.log(JSON.stringify(chatInfo));
        root.setInfo(chatInfo);
        if (root.chatInfo) {
            root.getMessages();
        }
    }
    
    function unload() {
        msgModel.clear();
        root.offsetLevel = 0;
    }
    
    function loadInfo(chatId) {
        socketIo.emit("getPersonalChatInfo", chatId);
        socketIo.on("getPersonalChatInfoResult", function(chatInfo) {
            chatName = chatInfo.name;
            chatPrivacy = chatInfo.privacy;
            getMessages();
        });
    }
    
    function setInfo(info) {
        console.log("Chat id: ", JSON.stringify(info));
        root.chatId = info.id;
        /*if (info.name) {
            chatName = info.name;
            chatPrivacy = info.privacy;
        }
        else {*/
            loadInfo(root.chatId);
        //}
        
        socketIo.on('updateMessage', function(msg) {
            var _isOwn = appCache.user.id === msg.maker_id;
            var _msg = {
                msg_id: msg.id,
                maker_name: msg.maker_name,
                maker_id: msg.maker_id,
                time: String(msg.time),
                content: msg.content,
                msgOwn: _isOwn
            };
            addMessage(_msg);
        });
    }
    
    function getMessages() {
        socketIo.emit('getMessagesByChat', { 
            chat_id: chatId,
            offsetLevel: offsetLevel
        });
        socketIo.on('getMessagesByChatResult', function(messages) {
            console.log(messages.length, root.offsetLevel);
            if (offsetLevel !== 0) {
                msgModel.clear();
            }
            offsetLevel += 1;
            for (var i = 0; i < messages.length; i++) {
                var _isOwn = appCache.user.id === messages[i].maker_id;
                var msg = {
                    msg_id: messages[i].id,
                    maker_name: messages[i].maker_name,
                    maker_id: messages[i].maker_id,
                    time: String(messages[i].time),
                    content: messages[i].content,
                    msgOwn: _isOwn
                };
                addMessage(msg);
                listView.contentY = listView.contentHeight;
            }
            listView.contentY = listView.contentHeight;
        });
    }
    
    function addMessage(msg) {
        msgModel.append(msg);
        console.log(listView.contentHeight, listView.contentY);
        listView.contentY = listView.contentHeight;
    }
    
    function sendMessage(_content) {
        msgInput.focused = false;
        msgInput.text = "";
        socketIo.emit('sendMessage', {
            chat_id: chatId,
            content: _content
        });
        socketIo.on('updateMessage', function(msg) {
            var _isOwn = appCache.user.id === msg.maker_id;
            var _msg = {
                msg_id: msg.id,
                maker_name: msg.maker_name,
                maker_id: msg.maker_id,
                time: String(msg.time),
                content: msg.content,
                msgOwn: _isOwn
            };
            addMessage(_msg);
        });
    }
    
    TextEdit {
        
    }
    
    ListModel {
        id: msgModel
        
        /*ListElement {
            msg_id: "1"
            maker_name: "Dens"
            maker_id: "2h3iuh1hd"
            time: "1233546346453"
            content: "Привет"
            msgOwn: true
        }
        
        ListElement {
            msg_id: "2"
            maker_name: "Qt User"
            maker_id: "gh4t44btb"
            time: String(1233546346433)
            content: "Окей"
            msgOwn: false
        }
        
        ListElement {
            msg_id: "3"
            maker_name: "Dens"
            maker_id: "2h3iuh1hd"
            time: String(1233546346444)
            content: "Пока"
            msgOwn: true
        }*/
    }
    
    Component {
        id: msgDelegate
        
        Item {
            id: itemDelegate
            width: (root.width / 2) - 25
            height: 40
            anchors.left: !msgOwn ? parent.left : undefined
            anchors.right: !msgOwn ? undefined : parent.right
            Rectangle {
                id: backgroundMsg
                color: msgOwn ? "#86cbf5" : "#99d3ff"
                Component.onCompleted: {
                    //console.log(msgOwn);
                    //backgroundMsg.color = msgOwn ? "#440000" : "#99d3ff";
                }
                anchors.fill: parent
                Text {
                    text: maker_name
                }
                Text {
                    y: 10
                    text: content
                    wrapMode: Text.WordWrap
                }
                Text {
                    anchors.right: parent.right
                    text: new Date(time).toLocaleString()
                }
                
                MouseArea {
                    anchors.fill: parent
                    //onClicked: _clicked()
                }
            }
        }
    }
    
    ScrollView {
        id: scrollView
        enabled: true
        focusPolicy: Qt.WheelFocus
        anchors.bottomMargin: 45
        anchors.fill: parent
        
        ListView {
            id: listView
            highlightRangeMode: ListView.ApplyRange
            boundsBehavior: Flickable.StopAtBounds
            layoutDirection: Qt.LeftToRight
            orientation: ListView.Vertical
            flickableDirection: Flickable.HorizontalAndVerticalFlick
            anchors.fill: parent
            spacing: root.spaceBetween
            model: msgModel
            delegate: msgDelegate
        }
    }
    
    CustomButton {
        id: sendBtn
        x: 489
        y: 423
        width: 120
        height: 35
        radius: 5
        text: "Send"
        anchors.right: parent.right
        anchors.rightMargin: 4
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 4
        fontSize: 21
        textFillColor: "#10213d"
        backgroundColor: "#10213d"
        borderColor: "#10213d"
        textColor: "#ffffff"
        onClicked: {
            root.sendMessage(msgInput.text);
        }
    }
    
    CustomInput {
        id: msgInput
        width: root.width - 134
        height: 35
        radius: 5
        anchors.left: parent.left
        anchors.leftMargin: 4
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 4
        marginBottom: 5
        margins: 5
        marginTop: 5
        marginRight: 5
        marginLeft: 8
        placeholderFontSize: 19
        placeholderColor: "#10213d"
        inputFontSize: 19
        borderWidth: 2
        focusDuration: 600
        backgroundColorOnFocus: "#10213d"
        placeholderText: "Write message...."
        inputColor: "#10213d"
        borderColor: "#10213d"
    }
    
}

































/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}
}
 ##^##*/
