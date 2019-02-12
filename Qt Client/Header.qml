import QtQuick 2.0
import QtQuick.Window 2.2

Item {
    
    id: root
    width: 640
    height: 29
    
    property bool hovered: false
    
    signal hoverIn
    signal hoverOut
    
    function setTitle(title) {
        pageTitle.text = title.toString();
    }
    
    Rectangle {
        id: background
        color: "#10213d"
        anchors.fill: parent
        
        Text {
            id: pageTitle
            font.family: defaultFont.name
            font.pixelSize: 18
            color: "#ffffff"
            text: ""
            anchors.verticalCenter: parent.verticalCenter
            anchors.horizontalCenter: parent.horizontalCenter
        }
        
        MouseArea {
            id: windowDrag
            anchors.fill: parent;
            property var clickPos: "1,1"
        
            onPressed: {
                clickPos = Qt.point(mouse.x,mouse.y)
            }
        
            onPositionChanged: {
                var delta = Qt.point(mouse.x-clickPos.x, mouse.y-clickPos.y)
                var new_x = window.x + delta.x
                var new_y = window.y + delta.y
                if (new_y <= 0)
                    window.visibility = Window.Maximized
                else
                {
                    if (window.visibility === Window.Maximized) {
                        window.visibility = Window.Windowed
                        window.x = delta.x + clickPos.x
                        window.y = delta.y + clickPos.y
                    }
                    if (window.x != new_x)
                        window.x = new_x
                    if (window.y != new_y)
                        window.y = new_y
                    window.x = new_x
                    window.y = new_y
                }
            }
        }
        
        MouseArea {
            id: windowButtonsArea
            width: 100
            height: parent.height
            hoverEnabled: true
            anchors.right: parent.right
            anchors.rightMargin: -75
            onEntered: {
                root.hovered = true;
                root.hoverIn();
            }
            onExited: {
                root.hovered = false;
                root.hoverOut();
            }
            
            Image {
                id: imageArrow
                y: 7
                width: 16
                height: 14
                enabled: false
                smooth: true
                rotation: 180
                antialiasing: true
                opacity: 0.77
                anchors.left: parent.left
                anchors.leftMargin: 3
                fillMode: Image.Stretch
                source: "assets/arrows-white.png"
            }
            
            states: [
                State {
                    name: "focusIn"
                    when: root.hovered
                },
                State {
                    name: "focusOut"
                    when: !root.hovered
                }
            ]
            
            transitions: [
                Transition {
                    from: "focusOut"
                    to: "focusIn"
                    animations: 
                        PropertyAnimation {
                            target: windowButtonsArea
                            property: "anchors.rightMargin"
                            easing.type: Easing.OutBounce
                            to: 0
                            duration: 1000
                        }
                        PropertyAnimation {
                            target: imageArrow
                            property: "rotation"
                            easing.type: Easing.InOutCubic
                            to: 360
                            duration: 1000
                        }
                },
                Transition {
                    from: "focusIn"
                    to: "focusOut"
                    animations: 
                        PropertyAnimation {
                            target: windowButtonsArea
                            property: "anchors.rightMargin"
                            easing.type: Easing.OutBounce
                            to: -75
                            duration: 1000
                        }
                        PropertyAnimation {
                            target: imageArrow
                            property: "rotation"
                            easing.type: Easing.InOutCubic
                            to: 180
                            duration: 1000
                        }
                }
            ]
            
            Rectangle {
                id: closeBtn
                width: closeBtn.radius * 2
                height: closeBtn.radius * 2
                radius: 8
                anchors.right: parent.right
                anchors.rightMargin: 4
                anchors.verticalCenter: parent.verticalCenter
                border.width: 0
                color: "#ffffff"
                Image {
                    anchors.fill: parent
                    source: "assets/window-close.png"
                }
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        console.log(window.visibility);
                        window.close();
                    }
                }
            }
            
            Rectangle {
                id: minmaxBtn
                width: minmaxBtn.radius * 2
                height: minmaxBtn.radius * 2
                radius: 8
                anchors.right: parent.right
                anchors.rightMargin: 27
                anchors.verticalCenter: parent.verticalCenter
                border.width: 0
                color: "#ffffff"
                Image {
                    anchors.rightMargin: 2
                    anchors.leftMargin: 2
                    anchors.bottomMargin: 2
                    anchors.topMargin: 2
                    anchors.fill: parent
                    fillMode: Image.PreserveAspectFit
                    source: "assets/minmax.png"
                }
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        if (window.visibility === Window.Maximized)
                            window.visibility = Window.AutomaticVisibility
                        else
                            window.visibility = Window.Maximized
                    }
                }
            }
            
            Rectangle {
                id: swapBtn
                width: swapBtn.radius * 2
                height: swapBtn.radius * 2
                radius: 8
                antialiasing: true
                smooth: true
                anchors.right: parent.right
                anchors.rightMargin: 51
                anchors.verticalCenter: parent.verticalCenter
                border.width: 0
                color: "#ffffff"
                Image {
                    anchors.right: parent.right
                    anchors.rightMargin: 3
                    anchors.left: parent.left
                    anchors.leftMargin: 3
                    anchors.bottom: parent.bottom
                    anchors.bottomMargin: 4
                    anchors.top: parent.top
                    source: "assets/swap-window.png"
                }
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        window.showMinimized();
                    }
                }
            }
            
        }
        
        FontLoader {
            id: defaultFont
            source: "qrc:/assets/Play.ttf"
        }
    }
    
}

















































/*##^## Designer {
    D{i:5;anchors_x:15}
}
 ##^##*/
