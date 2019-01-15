import QtQuick 2.0
import QtGraphicalEffects 1.0

Item {
    
    property color backgroundColor
    property int radius
    property color borderColor
    property int borderWidth
    
    property color hoverColor
    property color fillColor
    property real fillOpacityStart: 0.4
    property real fillOpacityEnd: 0.2
    
    property int fillDuration: 3000
    
    property bool focused
    property bool pressed: false
    
    property string text: 'Button'
    
    signal clicked
    
    property int mX: 0
    property int mY: 0
    
    id: root
    
    Rectangle {
        
        id: background
        anchors.fill: parent
        color: root.backgroundColor
        radius: root.radius
        clip: true
        border.color: root.borderColor
        border.width: root.borderWidth
        
        Text {
            id: textButton
            text: root.text
            anchors.fill: background
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
            color: root.textColor
            font.family: root.font.name
            font.pixelSize: root.fontSize
        }
        
        MouseArea {
            id: mouseArea
            anchors.fill: parent
            hoverEnabled: true
            onEntered: {
                //background.color = root.hoverColor
            }
            onExited: {
                //background.color = root.backgroundColor
            }

            onPressedChanged: {
                root.pressed = pressed;
                console.log(pressed);
                if (pressed) {
                    fillCircle.visible = true;
                    root.mX = mouseX;
                    root.mY = mouseY;
                    //fillCircle.x = mouseX - fillCircle.radius;
                    //fillCircle.y = mouseY - fillCircle.radius;
                    animRadius.paused ? animRadius.restart() : animRadius.start();
                    console.log(mouseX, mouseY);
                }
                else {
                    root.mX = 0;
                    root.mY = 0;
                    fillCircle.visible = false;
                    fillCircle.radius = 10;
                    animRadius.stop();
                }
            }
            onClicked: {
                root.clicked()
            }
        }
        Item {
            id: element
            
            anchors.fill: background
            anchors.verticalCenter: background.verticalCenter
            anchors.horizontalCenter: background.horizontalCenter
            layer.enabled: true
            layer.effect: OpacityMask {
                maskSource: background
            }
        
            Rectangle {
                id: fillCircle
                width: fillCircle.radius * 2
                height: fillCircle.radius * 2
                color: root.fillColor
                visible: false
                opacity: root.fillOpacityStart
                anchors.verticalCenter: parent.verticalCenter
                anchors.horizontalCenter: parent.horizontalCenter
                //anchors.leftMargin: -1 * fillCircle.radius
                //anchors.topMargin: -1 * fillCircle.radius
                radius: background.width / 10
                anchors.top: parent.top
                anchors.right: parent.right
                anchors.left: parent.left
                
                NumberAnimation {
                    id: animRadius
                    target: fillCircle
                    property: "radius"
                    duration: root.fillDuration
                    easing.type: Easing.OutCubic
                    to: background.width
                    alwaysRunToEnd: false
                    onStarted: {
                        console.log('Radius started');
                    }
                    onStopped: {
                        console.log('Radius stopped');
                    }
                }
                
                /*NumberAnimation {
                    id: animPosX
                    target: fillCircle
                    property: "x"
                    duration: root.fillDuration
                    easing.type: Easing.OutCubic
                    to: root.mX
                    alwaysRunToEnd: false
                    onStarted: {
                        console.log('Anim started');
                    }
                    onStopped: {
                        console.log('Anim stopped');
                    }
                }
                
                NumberAnimation {
                    id: animPosY
                    target: fillCircle
                    property: "y"
                    duration: root.fillDuration
                    easing.type: Easing.OutCubic
                    to: root.mY
                    alwaysRunToEnd: false
                    onStarted: {
                        console.log('Anim started');
                    }
                    onStopped: {
                        console.log('Anim stopped');
                    }
                }*/
                
            }
        }
        
    }
    
    states: [
        State {
            name: "focusIn"
            when: root.focused
        },
        State {
            name: "focusOut"
            when: !root.focused
        },
        State {
            name: "pressIn"
            when: root.pressed === true
        },
        State {
            name: "pressOut"
            when: root.pressed === false
        }
    ]
    
    transitions: [
        /*Transition {
            from: "pressOut"
            to: "pressIn"
            animations: 
                PropertyAnimation {
                    target: fillCircle
                    property: "radius"
                    easing.type: Easing.OutQuart
                    to: background.width * 260
                    duration: 2000
            }
                PropertyAnimation {
                    target: fillCircle
                    property: "opacity"
                    easing.type: Easing.OutQuart
                    to: root.fillOpacityEnd
                    duration: root.fillDuration
                }
        },
        Transition {
            from: "pressIn"
            to: "pressOut"
            animations: 
                PropertyAnimation {
                target: fillCircle
                property: "visible"
                easing.type: Easing.OutQuart
                to: false
                duration: 1
            }
        }*/
        /*Transition {
            from: "focusOut"
            to: "focusIn"
            animations: 
                PropertyAnimation {
                target: background
                property: "color"
                easing.type: Easing.InOutCubic
                to: root.backgroundColorOnFocus
                duration: root.fillDuration
            }
            PropertyAnimation {
                target: textButton
                property: "color"
                easing.type: Easing.InOutCubic
                to: root.inputColorOnFocus
                duration: root.focusDuration
            }
        },
        Transition {
            from: "focusIn"
            to: "focusOut"
            animations: 
                PropertyAnimation {
                    target: background
                    property: "color"
                    easing.type: Easing.InOutCubic
                    to: root.backgroundColor
                    duration: root.focusDuration
                }
                PropertyAnimation {
                    target: textButton
                    property: "color"
                    easing.type: Easing.InOutCubic
                    to: root.inputColor
                    duration: root.focusDuration
                }
        }*/
    ]
    
}



/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}D{i:10;anchors_height:128;anchors_width:128}
}
 ##^##*/
