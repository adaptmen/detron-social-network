import QtQuick 2.0
import "xhr.js" as XhrMethods
import QtQuick.Controls.Universal 2.0
import QtQuick.Controls 2.3

Item {
    id: root
    clip: false
    
    function load() {
        
    }
    
    function unload() {
        
    }
    
    signal auth(string phone, string token)
    
    Rectangle {
        id: rectangle
        color: "#10213d"
        
        anchors.fill: parent
        antialiasing: false
        clip: false
        
        Item {
            id: center
            width: 452
            height: 350
            anchors.verticalCenter: parent.verticalCenter
            anchors.horizontalCenter: parent.horizontalCenter
            Label {
                id: phoneLabel
                y: 112
                width: 152
                height: 27
                color: "#ffffff"
                text: qsTr("Phone number")
                anchors.left: parent.left
                anchors.leftMargin: 28
                font.bold: false
                horizontalAlignment: Text.AlignRight
                renderType: Text.QtRendering
                font.pointSize: 17
                verticalAlignment: Text.AlignVCenter
                wrapMode: Text.WordWrap
                font.family: fPlay.name
            }
            
            Label {
                id: codeLabel
                y: 175
                width: 119
                height: 27
                color: "#ffffff"
                text: qsTr("Voice-Code*")
                anchors.left: parent.left
                anchors.leftMargin: 61
                horizontalAlignment: Text.AlignRight
                wrapMode: Text.WordWrap
                font.pointSize: 17
                verticalAlignment: Text.AlignVCenter
                font.family: fPlay.name
            }
            
            
            CustomInput {
                id: phoneInput
                x: 202
                y: 105
                width: 222
                height: 41
                radius: 4
                anchors.right: parent.right
                anchors.rightMargin: 28
                font: fIstokRegular
                inputColorOnFocus: "#10213d"
                backgroundColorOnFocus: "#ffffff"
                inputFontSize: 17
                marginLeft: 9
                placeholderText: "Enter your phone..."
                placeholderFontSize: 17
                borderWidth: 1
                onFocusIn: console.log("In", phoneInput.focused);
                onFocusOut: console.log("Out", phoneInput.focused);
            }
            
            CustomInput {
                id: codeInput
                x: 202
                y: 168
                width: 222
                height: 41
                radius: 4
                anchors.right: parent.right
                anchors.rightMargin: 28
                font: fIstokRegular
                inputColorOnFocus: "#10213d"
                backgroundColorOnFocus: "#ffffff"
                inputFontSize: 17
                marginLeft: 9
                placeholderFontSize: 17
                borderWidth: 1
                placeholderText: "Enter sms-code..."
            }
            
            Text {
                id: element
                x: 103
                width: 418
                height: 89
                color: "#ffffff"
                text: qsTr("Authorization")
                anchors.horizontalCenterOffset: 0
                anchors.top: parent.top
                anchors.topMargin: 8
                anchors.horizontalCenter: parent.horizontalCenter
                font.family: fTittilium.name
                styleColor: "#e39c9c"
                font.bold: true
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
                font.pixelSize: 44
            }
            
            CustomButton {
                id: customButton
                x: 160
                y: 257
                width: 134
                height: 37
                radius: 4
                text: "Login"
                anchors.horizontalCenter: parent.horizontalCenter
                textFillColor: "#10213d"
                borderWidth: 1
                fontSize: 20
                onClicked: {
                    if (phoneInput.text !== "" && codeInput.text !== "") {
                        XhrMethods.authWithCode(phoneInput.text, codeInput.text, function(ans) {
                            console.log(JSON.stringify(ans));
                            if (ans.code === "cred") {
                                root.auth(ans.answer.phone, ans.answer.token);
                            }
                            else if (ans.code === "count") {
                                statusLabel.visible = true;
                                statusLabel.text = "Now you will hear from your phone call with the code, the number of attempts is now equal to: " 
                                        + ans.answer.count;
                            }
                            else if (ans.code === "date") {
                                statusLabel.visible = true;
                                statusLabel.text = "You can try entering the code again after "
                                + Number(ans.answer.date) / 1000 + "seconds";
                            }
                            else if (ans.code === "first") {
                                statusLabel.visible = true;
                                statusLabel.text = "Welcome! Wait for a phone call!";
                            }
                        },
                        function(err) {
                            console.log(err.message);
                        }); 
                    }
                    else if (phoneInput.text !== "" && codeInput.text === "") {
                        XhrMethods.auth(phoneInput.text, function(ans) {
                            console.log(JSON.stringify(ans));
                            if (ans.code === "count") {
                                statusLabel.visible = true;
                                statusLabel.text = "Now you will hear from your phone call with the code, the number of attempts is now equal to: " 
                                        + ans.answer.count;
                            }
                            else if (ans.code === "date") {
                                statusLabel.visible = true;
                                statusLabel.text = "You can try entering the code again after "
                                + Number(ans.answer.date) / 1000 + "seconds";
                            }
                            else if (ans.code === "first") {
                                statusLabel.visible = true;
                                statusLabel.text = "Welcome! Wait for a phone call!";
                            }
                        });
                    } 
                    else {
                        console.log('Empty inputs');
                    }
                }
            }
            
            Label {
                id: infoLabel
                x: -2
                y: 363
                width: 363
                height: 27
                color: "#ffffff"
                text: qsTr("*If you do not have a code or you have forgotten it, leave this field blank, you will be called and your code will be reported")
                verticalAlignment: Text.AlignVCenter
                anchors.leftMargin: 61
                wrapMode: Text.WrapAtWordBoundaryOrAnywhere
                font.family: fPlay.name
                horizontalAlignment: Text.AlignHCenter
                anchors.left: parent.left
                font.pointSize: 8
            }
            
            Label {
                id: statusLabel
                x: 4
                y: 315
                width: 435
                height: 35
                color: "#ffffff"
                text: "Now you will hear from your phone call with the code, the number of attempts is now equal to: 5"
                visible: false
                font.pointSize: 9
                font.family: fPlay.name
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
                anchors.left: parent.left
                anchors.leftMargin: 17
                wrapMode: Text.WrapAtWordBoundaryOrAnywhere
            }
        }
        
    }
    
    FontLoader {
        id: fPlay
        source: "qrc:/assets/Play.ttf"
    }
    
    FontLoader {
        id: fPlayBold
        source: "qrc:/assets/Play-Bold.ttf"
    }
    
    FontLoader {
        id: fTittilium
        source: "qrc:/assets/Tittilium.ttf"
    }
    
    FontLoader {
        id: fIstokRegular
        source: "qrc:/assets/Istok-Regular.ttf"
    }
    
}













































/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}
}
 ##^##*/
