import QtQuick 2.0

Item {
    id: root
    
    property int spaceBetween: 20
    
    property var _userPage
    
    property var users: ({})
    
    function load() {
        userModel.clear();
        userView.forceLayout();
        getUsers();
    }
    
    function unload() {
        console.log("Unload userModel");
        userView.forceLayout();
        userModel.clear();
        console.log(userModel.count);
    }
    
    function getUsers() {
        socketIo.emit('getAllUsers', {});
        socketIo.on('getAllUsersResult', function(_users) {
            userModel.clear();
            console.log(_users);
            for (var i = 0; i < _users.length; i++) {
                addUser(_users[i]);
            }
        });
    }
    
    function addUser(userInfo) {
        users[userInfo.id] = function() {
            console.log(userInfo.id);
            showOne(root._userPage, userInfo.id);
        };
        userModel.append({
            id: userInfo.id,
            user_id: userInfo.id,
            name: userInfo.name
        });
    }
    
    ListModel {
        id: userModel
        dynamicRoles: true
    }
    
    Component {
        id: userDelegate
        
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
                        text: name[0]
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
                    onClicked: users[user_id]()
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
        id: userView
        highlightRangeMode: ListView.NoHighlightRange
        flickableDirection: Flickable.VerticalFlick
        boundsBehavior: Flickable.DragOverBounds
        keyNavigationWraps: false
        snapMode: ListView.SnapToItem
        anchors.fill: root
        spacing: root.spaceBetween
        model: userModel
        delegate: userDelegate
    }
    
}

