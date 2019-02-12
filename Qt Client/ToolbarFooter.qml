import QtQuick 2.0
import QtQuick.Shapes 1.11
import QtGraphicalEffects 1.0
//import QtQuick.Particles 2.12

Item {
    
    id: root
    height: 28
    
    property real shadowSamples: 10
    property real shadowSpread: 1
    property real shadowRadius: 15
    
    property int sideWidthStart: 59
    property int sideWidthEnd: 70
    property color backColor: "red"
    property color fillColor: "blue"
    
    property var currentHovered: centralShape
    property var lastHovered: centralShape
    
    property int minHeight: root.height - 3
    
    signal leftClicked
    signal rightClicked
    
    Shape {
        id: leftShape
        width: root.sideWidthEnd
        height: root.height
        vendorExtensionsEnabled: true
        clip: true
        anchors.left: root.left
        anchors.leftMargin: 0
        
        property bool hovered: false
        
        layer.enabled: true
        layer.samples: 10
        
        ShapePath {
            id: leftShapePath
            fillColor: root.backColor
            strokeWidth: 1
            strokeColor: "#10213d"
            startX: 0;
            startY: 0;
            PathLine { x: 0; y: 3 }
            PathLine { x: root.sideWidthStart; y: 3 }
            PathLine { x: root.sideWidthEnd; y: root.height }
            PathLine { x: 0; y: root.height }
        }
        
        MouseArea {
            id: mouseArea
            anchors.bottomMargin: 0
            anchors.rightMargin: 12
            clip: false
            hoverEnabled: true
            anchors.fill: parent
            onEntered: {
                
            }
            onExited: {
                
            }
            onClicked: {
                root.leftClicked()
            }
            
            Image {
                id: image
                y: 25
                width: parent.width
                height: root.height - 14
                smooth: false
                anchors.left: parent.left
                anchors.leftMargin: 0
                anchors.topMargin: 4
                clip: false
                anchors.verticalCenter: parent.verticalCenter
                antialiasing: true
                z: 0
                opacity: 0.77
                source: "qrc:/assets/search-white.png"
                fillMode: Image.PreserveAspectFit
            }
        }
    }
    
    Shape {
        id: centralShape
        width: root.width - (root.sideWidthEnd * 2) + 40
        height: root.height
        smooth: true
        antialiasing: true
        vendorExtensionsEnabled: true
        x: root.sideWidthEnd
        anchors.horizontalCenter: parent.horizontalCenter
        clip: true
        z: 2
        
        property bool hovered: true
        
        layer.enabled: true
        layer.smooth: true
        layer.samples: 100
        layer.effect: DropShadow {
            horizontalOffset: 0
            verticalOffset: 14
            radius: root.shadowRadius
            samples: root.shadowSamples
            spread: root.shadowSpread    
        }
        
        ShapePath {
            id: centralShapePath
            fillColor: "#10213d"//root.backColor
            strokeWidth: 0
            strokeColor: "#10213d"
            //strokeStyle: ShapePath.DashLine
            startX: root.sideWidthEnd - root.sideWidthStart;
            startY: 0;
            PathLine { 
                x: root.sideWidthEnd - root.sideWidthStart;
                y: 0
            }
            PathLine {
                x: centralShape.width - (root.sideWidthEnd - root.sideWidthStart);
                y: 0
            }
            PathLine {
                x: centralShape.width;
                y: root.height 
            }
            PathLine {
                x: 0;
                y: root.height
            }
        }
        
        Rectangle {
            id: userBtn
            width: 20
            color: "#1c0c4f"
            radius: 10
            anchors.top: parent.top
            anchors.topMargin: 4
            anchors.bottom: parent.bottom
            anchors.bottomMargin: 4
            anchors.left: parent.left
            anchors.leftMargin: 27
            
            Image {
                width: 10
                sourceSize.height: 10
                sourceSize.width: 10
                antialiasing: true
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter
                fillMode: Image.PreserveAspectFit
                source: "qrc:/assets/logo-3-blue.png"
            }
            
            MouseArea {
                anchors.fill: parent
                onClicked: {
                    showOne(userPage, appCache.user.id);
                }
            }
        }
        
        Rectangle {
            id: chatsBtn
            width: 20
            color: "#1c0c4f"
            radius: 10
            anchors.top: parent.top
            anchors.topMargin: 4
            anchors.bottom: parent.bottom
            anchors.bottomMargin: 4
            anchors.left: parent.left
            anchors.leftMargin: 54
            
            Image {
                width: 10
                sourceSize.height: 12
                sourceSize.width: 12
                antialiasing: true
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter
                fillMode: Image.PreserveAspectFit
                source: "qrc:/assets/sms.png"
            }
            
            MouseArea {
                anchors.fill: parent
                onClicked: {
                    showOne(chatList);
                }
            }
        }
        
        
    }
    
    Shape {
        id: rightShape
        width: root.sideWidthEnd
        height: root.height
        vendorExtensionsEnabled: true
        anchors.right: parent.right
        x: root.sideWidthEnd
        clip: true
        z: 1
        
        property bool hovered: false
        property int i_scale: 1.0
        
        layer.enabled: true
        layer.samples: 50
        
        ShapePath {
            id: rightShapePath
            strokeWidth: 1
            strokeColor: "#10213d"
            fillColor: root.backColor
            startX: root.sideWidthEnd - root.sideWidthStart;
            startY: 3;
            PathLine { x: root.sideWidthEnd - root.sideWidthStart; y: 3 }
            PathLine { x: root.sideWidthEnd; y: 3 }
            PathLine { x: root.sideWidthEnd; y: root.height + 2 }
            PathLine { x: 0; y: root.height + 2 }
        }
        
        MouseArea {
            hoverEnabled: true
            anchors.fill: parent
            anchors.leftMargin: 12
            onEntered: {
                root.lastHovered = root.currentHovered;
                root.currentHovered = rightShape;
                rightShape.hovered = true;
            }
            onExited: {
                root.lastHovered = rightShape;
                root.currentHovered = centralShape;
                rightShape.hovered = false;
            }
            onClicked: {
                root.rightClicked()
            }
            Image {
                y: 25
                width: parent.width
                height: root.height - 14
                smooth: true
                anchors.left: parent.left
                anchors.leftMargin: 0
                anchors.topMargin: 4
                clip: false
                anchors.verticalCenter: parent.verticalCenter
                antialiasing: true
                z: 0
                opacity: 0.77
                source: "qrc:/assets/logo-3-small-3.png"
                fillMode: Image.PreserveAspectFit
            }
            
            states: [
                State {
                    name: "hoverIn"
                    when: rightShape.hovered
                },
                State {
                    name: "hoverOut"
                    when: !rightShape.hovered
                }
            ]
            
            transitions: [
                Transition {
                    from: "hoverOut"
                    to: "hoverIn"
                    animations: 
                        PropertyAnimation {
                            target: root.currentHovered
                            property: "scale"
                            easing.type: Easing.OutBounce
                            to: 1.03
                            duration: 1000
                        }
                        PropertyAnimation {
                            target: root.lastHovered
                            property: "height"
                            easing.type: Easing.InOutCubic
                            to: root.lastHovered - 3
                            duration: 1000
                        }
                },
                Transition {
                    from: "hoverIn"
                    to: "hoverOut"
                    animations: 
                        PropertyAnimation {
                            target: root.lastHovered
                            property: "scale"
                            easing.type: Easing.OutBounce
                            to: 1.0
                            duration: 1000
                        }
                        PropertyAnimation {
                            target: root.currentHovered
                            property: "height"
                            easing.type: Easing.InOutCubic
                            to: root.height
                            duration: 1000
                        }
                }
            ]
        }
    }
       
    
    
}





/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}
}
 ##^##*/
