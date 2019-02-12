import QtQuick 2.0

Item {
    
    id: root
    
    property int spaceBetween: 20
    
    property var chats: ({})
    
    function load() {
        getChats();
    }
    
    function unload() {
        chatModel.clear();
    }
    
    function getChats() {
        socketIo.emit('getChats', {});
        socketIo.on('getChats', function(chats) {
            chatModel.clear();
            for (var i = 0; i < chats.length; i++) {
                addChat(chats[i]);
            }
        });
    }
    
    function addChat(chatInfo) {
        chats[chatInfo.id] = function() { 
            console.log(chatInfo.id);
            showOne(chatPage, chatInfo);
        };
        var chat = {
            chat_id: chatInfo.id,
            privacy: chatInfo.privacy,
            name: chatInfo.name
        };
        chatModel.append(chat);
    }
    
    ListModel {
        id: chatModel
    }
    
    Component {
        id: chatDelegate
        
        Item {
            id: element
            width: root.width
            height: 58
            Rectangle {
                color: "transparent"
                anchors.fill: parent
                radius: 6
                
                Rectangle {
                    height: parent.height - 16
                    width: parent.height - 16
                    x: 8
                    radius: 5
                    anchors.verticalCenter: parent.verticalCenter
                    color: "#1C0C4F"
                    Text {
                        anchors.fill: parent
                        color: "#75A9F9"
                        text: "D"
                        font.bold: false
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                        font.pixelSize: 21
                        font.family: fIcon.name
                        rotation: 0
                    }
                }
                Text {
                    x: 60
                    y: 9
                    font.pixelSize: 14
                    text: name
                    font.family: fText.name
                    font.bold: true
                }                
                MouseArea {
                    hoverEnabled: true
                    anchors.fill: parent
                    onClicked: chats[chat_id]()
                    onEntered: parent.color = "#ECF2FD"
                    onExited: parent.color = "transparent"
                }
                FontLoader {
                    id: fIcon
                    name: "Extra-Fruity"
                    source: "qrc:/assets/Extra-Fruity.ttf"
                }
                FontLoader {
                    id: fText
                    name: "Tittilium"
                    source: "qrc:/assets/Tittilium.ttf"
                }
            }
        }
    }
    
    ListView {
        boundsBehavior: Flickable.DragOverBounds
        keyNavigationWraps: false
        snapMode: ListView.SnapToItem
        anchors.fill: root
        spacing: root.spaceBetween
        model: chatModel
        delegate: chatDelegate
    }
    
}
