import QtQuick 2.0

Item {
    id: root
    
    property var _appCache
    property bool isOwn: _appCache.user.id === info.id
    
    property var info: ({})
    
    
    function load(_id) {
        if (root._appCache.user.id) {
            console.log(_id, root._appCache.user.id);
            if (_id !== root._appCache.user.id) {
                socketIo.emit('getPageById', { id: _id });
                socketIo.on('getPageByIdResult', function(page) {
                    root.page = page;
                });
            }
            else {
                root.page = root._appCache.user;
            }
        }
    }
    
    function unload() {
        root.page = {};
    }
    
    function setPage(_page) {
        root.page = _page;
    }
    
    Rectangle {
        id: rectangle
        color: "#ffffff"
        anchors.fill: parent
        
        Text {
            id: name
            x: 260
            y: 16
            text: root.page ? root.page.name : ""
            font.pixelSize: 24
            font.family: fPlay.name
        }
        
        Text {
            id: id
            x: 262
            y: 43
            color: "#1268ad"
            text: "id: " + root.page.id
            font.pixelSize: 14
            font.family: fPlay.name
        }
        
        Text {
            id: phone
            x: 266
            y: 66
            text: root.page ? root.page.phone : ""
            font.pixelSize: 16
            font.family: fPlay.name
        }
        
        Rectangle {
            id: rectangle1
            width: 213
            height: 265
            color: "#10213d"
            radius: 5
            anchors.top: parent.top
            anchors.topMargin: 16
            anchors.left: parent.left
            anchors.leftMargin: 19
            
            Text {
                id: firstLetter
                text: root.page.name[0]
                fontSizeMode: Text.Fit
                verticalAlignment: Text.AlignVCenter
                horizontalAlignment: Text.AlignHCenter
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter
                font.pixelSize: 90
                color: "white"
            }
            
            /*Image {
                id: image
                x: 20
                y: 19
                width: 143
                height: 142
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter
                source: "logo-3-white.png"
                fillMode: Image.PreserveAspectFit
            }*/
        }
        
        CustomButton {
            id: friendBtn
            x: 19
            y: 287
            width: 213
            height: 34
            radius: 7
            text: "Add friend"
            visible: false
            textFillColor: "#10213d"
            borderColor: "#10213d"
            fontSize: 15
            backgroundColor: "#10213d"
            textColor: "#ffffff"
            font: fPlay.name
        }
        
        Component.onCompleted: {
            friendBtn.font = fPlay;
            subscribeBtn.font = fPlay;
            editBtn.font = fPlay;
            mailBtn.font = fPlay;
        }
        
        FontLoader {
            id: fPlay
            source: "qrc:/assets/Play.ttf"
        }
        
        CustomButton {
            id: subscribeBtn
            x: 19
            y: 322
            width: 213
            height: 34
            radius: 5
            text: "Subscribe"
            textColor: "#ffffff"
            backgroundColor: "#10213d"
            fontSize: 17
            textFillColor: "#10213d"
            font: fPlay.name
            borderColor: "#10213d"
            visible: isOwn ? false : true
        }
        
        CustomButton {
            id: editBtn
            x: 19
            y: 285
            width: 213
            height: 34
            radius: 5
            text: "Edit"
            textColor: "#ffffff"
            backgroundColor: "#10213d"
            fontSize: 17
            textFillColor: "#10213d"
            font: fPlay.name
            borderColor: "#10213d"
            visible: isOwn ? true : false
        }
        
        CustomButton {
            id: mailBtn
            x: 19
            y: 359
            width: 213
            height: 34
            radius: 5
            text: "Go to chat"
            backgroundColor: "#10213d"
            textColor: "#ffffff"
            fontSize: 17
            textFillColor: "#10213d"
            visible: isOwn ? false : true
            font: fPlay.name
            borderColor: "#10213d"
            onClicked: {
                socketIo.emit("openPersonalDialog", root.page.id);
                socketIo.on("openPersonalDialogResult", function (info) {
                    showOne(chatPage, info);
                });
            }
        }
        
        CustomButton {
            id: filelBtn
            x: 19
            y: 406
            width: 200
            height: 34
            radius: 5
            text: "File test"
            visible: true
            backgroundColor: "#10213d"
            textFillColor: "#10213d"
            borderColor: "#10213d"
            textColor: "#ffffff"
            fontSize: 15
            font: fPlay.name
            onClicked: {
                mainUploader.openFileDialog()
            }
        }
    }
    
    
}















/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}
}
 ##^##*/
