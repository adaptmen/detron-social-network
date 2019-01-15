import QtQuick 2.9
import QtQuick.Window 2.2
import QtQuick.Controls 2.2
import QtQuick.Shapes 1.11
import QtQuick.XmlListModel 2.0
import QtGraphicalEffects 1.0
import QtWebSockets 1.0
import QtQuick.Layouts 1.3
import "xhr.js" as XhrMethods
import Qt.labs.calendar 1.0
import QtQuick.Dialogs 1.0

Window {
    id: window
    visible: true
    width: 640
    height: 480
    color: "#ffffff"
    flags: Qt.Window// | Qt.FramelessWindowHint
    title: qsTr("Detron Social Network")

    property int i: 0;
    property alias appCache: appCache
    property var currentPage: authPage
        
    function addPage(tabText, uri, innerString) {
        actionCache.actions[uri] = ({});
        actionCache.actions[uri]["onclick"] = function() {
            viewPort.moveTo(viewPort.getIndexByUri(uri));
        };
        actionCache.actions[uri]["remove"] = function() {
            viewPort.remove(viewPort.getIndexByUri(uri));
            navBar.remove(navBar.getIndexByUri(uri));
            delete actionCache.actions[uri];
        };
        navBar.addTab(tabText, uri);
        viewPort.addPage(innerString, uri);
    }
	
	function goToPage(uri) {
		if (navBar.getIndexByUri(uri) !== -1) {
			viewPort.moveTo(viewPort.getIndexByUri(uri));
		}
		else {
			getPage(uri, function(page) {
				addPage(page.title, uri, "import QtQuick 2.9
					Wall {
						owner_info: JSON.parse(" + JSON.stringify(page.owner_info) + ");
						posts: JSON.parse(" + JSON.stringify(page.posts) + ");
					}");
				viewPort.moveTo(viewPort.getIndexByUri(uri));
			});
		}
	}
	
	function toggleLike(id, callback) {
		socketIo.emit("toggle_like", { id: id });
		socketIo.on("toggle_like", callback());
	}
	
	function getPage(uri, callback) {
		socketIo.emit('get_page', { uri: uri });
		socketIo.on('get_page', function(page) {
			callback(page);
		});
	}
    
    Component.onCompleted: {
        window.addPage('main', 'main', "import QtQuick 2.5;
            Rectangle {
                color: \"#10213d\"
                Text {
                    text: \"Main\";
                    color: \"#ffffff\";
                    anchors.centerIn: parent;
                    font.pixelSize: 30;
                }
        }");
    }
    
    
    Item {
        id: actionCache;
        property var actions: ({});
    }
    
    NavigationBar {
        id: navBar
        y: 30
        height: 28
        anchors.topMargin: 29
        anchors.rightMargin: 0
        anchors.leftMargin: 0
        anchors.bottomMargin: 423
        anchors.fill: parent
    }
    
    ViewPort {
        id: viewPort
        anchors.rightMargin: 50
        anchors.leftMargin: 50
        anchors.bottomMargin: 121
        anchors.topMargin: 112
        anchors.fill: parent
    }
    
    Button {
        id: addButton
        x: 9
        y: 431
        text: qsTr("Add new")
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 9
        onClicked: {
            i++;
            console.log(i);
            window.addPage(i, "item/"+i, "import QtQuick 2.5;
            Rectangle {
                color: \"#10213d\"
                Text {
                    text: \"uri: item/" + String(i) + "\";
                    color: \"#ffffff\";
                    anchors.centerIn: parent;
                    font.pixelSize: 30;
                }
            }");
        }
    }
    
    Button {
        id: moveButton
        x: 115
        y: 431
        text: qsTr("Move ++")
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 9
        onClicked: {
            viewPort.moveTo(i++);
        }
    }

    Cache {
        id: appCache
    }

    SocketIo {
        id: socketIo
        onOpened: {
            console.log("Connected");
            if (authPage.visible) {
                authPage.visible = false;
            }
        }
        onClosed: {
            socketIo.handshake(appCache.user.phone, appCache.user.token);
        }
        Component.onCompleted: {
            socketIo.on("user_init", function(user) {
                if (!appCache.user.id) {
                    window.appCache.user = user;
                    userPage.setPage(user);
                    socketIo.emit('get_wall', {id: appCache.user.wall_id});
                    socketIo.on('get_wall', function(wall) {
                        window.addPage('main', 'main', "import QtQuick 2.5;
                            Rectangle {
                                color: \"#10213d\"
                                Text {
                                    text: \"Main\";
                                    color: \"#ffffff\";
                                    anchors.centerIn: parent;
                                    font.pixelSize: 30;
                                }
                        }");
                    });
                }
            })
        }
    }
    
    Auth {
        id: authPage
        visible: false
        anchors.fill: parent
        z: 1
        onAuth: {
            socketIo.handshake(phone, token)
        }
    }

    FontLoader {
        id: fPlay
        source: "qrc:/assets/Play.ttf"
    }
    
    FileUploader {
        id: mainUploader
        visible: false
    }
    
    Modal {
        id: modal
        anchors.topMargin: 30
        anchors.bottomMargin: 30
    }
    
    Text {
        id: testText
        visible: false
        text: "Test text"
    }
    
    Header {
        id: header
        height: 29
        z: 100
        visible: true
        anchors.left: parent.left
        anchors.leftMargin: 0
        anchors.right: parent.right
        anchors.rightMargin: 0
        anchors.top: parent.top
        anchors.topMargin: 0
    }
    
    CustomButton {
        id: customButton
        x: 163
        y: 246
        width: 150
        height: 43
        radius: 8
        visible: false
        borderColor: "#10213d"
        fontSize: 20
        backgroundColor: "#10213d"
        onClicked: {
            //modal.z = 10;
            //modal.visible = true;
            //modal.setChild(testText);
            testText.visible = true;
        }
    }
    
}













































































/*##^## Designer {
    D{i:9;anchors_height:418;anchors_width:331;anchors_x:17;anchors_y:21}
}
 ##^##*/
