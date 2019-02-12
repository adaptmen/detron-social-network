import QtQuick 2.0

Item {
    id: root
    
    width: 200
    height: 50
    
    property alias text: textInput.text
    
    property color borderColor: "white"
    property color backgroundColor: "transparent"
    property int borderWidth: 3
    property int radius: 3
    
    property int margins: 3
    property int marginLeft: 3
    property int marginTop: 3
    property int marginRight: 3
    property int marginBottom: 3    

    property int placeholderFontSize: 10
    property color placeholderColor: "white"
    property string placeholderText
    
    property color inputColor: "white"
    property int inputFontSize: 11
    
    property color backgroundColorOnFocus: "transparent"
    property color inputColorOnFocus: "white"
    
    property FontLoader font
    
    property int focusDuration: 1000
    
    signal focusIn()
    signal focusOut()
    
    property bool focused: false
    
    Rectangle {
        id: background
        anchors.fill: root
        color: root.backgroundColor
        border.color: root.borderColor
        border.width: root.borderWidth
        radius: root.radius
        
        Text {
            id: placeholder
            text: root.placeholderText
            anchors.fill: background
            anchors.margins: root.margins
            anchors.leftMargin: root.marginLeft
            anchors.rightMargin: root.marginRight
            anchors.topMargin: root.marginTop
            anchors.bottomMargin: root.marginBottom
            font.pixelSize: root.placeholderFontSize
            font.family: root.font.name
            color: root.placeholderColor
            verticalAlignment: Text.AlignVCenter
            horizontalAlignment: Text.AlignLeft
            clip: true
            visible: !textInput.text && !textInput.activeFocus
        }
        
        TextInput {
            id: textInput
            text: ""
            anchors.fill: background
            verticalAlignment: Text.AlignVCenter
            horizontalAlignment: Text.AlignLeft
            clip: true
            wrapMode: TextInput.NoWrap
            anchors.margins: root.margins
            anchors.leftMargin: root.marginLeft
            anchors.rightMargin: root.marginRight
            anchors.topMargin: root.marginTop
            anchors.bottomMargin: root.marginBottom
            font.pixelSize: root.inputFontSize
            font.family: root.font.name
            font.bold: true
            color: root.inputColor
            onFocusChanged: {
                if (focus) {
                    root.focused = focus
                    root.focusIn()
                }
                else {
                    root.focused = focus
                    root.focusOut()
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
                }
            ]
            
            transitions: [
                Transition {
                    from: "focusOut"
                    to: "focusIn"
                    animations: 
                        PropertyAnimation {
                            target: background
                            property: "color"
                            easing.type: Easing.InOutCubic
                            to: root.backgroundColorOnFocus
                            duration: root.focusDuration
                        }
                        PropertyAnimation {
                            target: textInput
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
                            target: textInput
                            property: "color"
                            easing.type: Easing.InOutCubic
                            to: root.inputColor
                            duration: root.focusDuration
                        }
                }
            ]
            
        }
        
        
    }
    
}
