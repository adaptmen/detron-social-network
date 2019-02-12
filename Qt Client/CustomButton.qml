import QtQuick 2.0
import QtGraphicalEffects 1.0


Item {
    id: root
    
    width: 200
    height: 100
    
    property color backgroundColor: "transparent"
    property int radius: 24
    property int borderWidth: 2
    property color borderColor: "white"
    
    property color textColor: "white"
    property string text: "Custom"
    property FontLoader font
    property int fontSize: 14
    
    property color backgroundFillColor: "white"
    property color textFillColor
    
    signal clicked
    
    Rectangle {
        id: background
        anchors.fill: root
        color: root.backgroundColor
        radius: root.radius
        border.color: root.borderColor
        border.width: root.borderWidth
        clip: true
        
        /*Rectangle {
            id: fillBackground
            anchors.fill: background
            color: root.fillColor
            radius: background.radius
        }*/
        
        MouseArea {
            id: mouseArea
            anchors.fill: background
            onPressedChanged: {
                if (pressed) {
                    background.color = root.backgroundFillColor;
                    textButton.color = root.textFillColor;
                }
                else {
                    background.color = root.backgroundColor;
                    textButton.color = root.textColor;
                }
            }
            onClicked: {
                root.clicked()
            }
        }
    }
    
    
    Text {
        id: textButton
        text: root.text
        anchors.fill: root
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        color: root.textColor
        font.family: fPlay.name
        font.pixelSize: root.fontSize
    }

    FontLoader {
        id: fPlay
        source: "qrc:/assets/Play.ttf"
    }
    
}