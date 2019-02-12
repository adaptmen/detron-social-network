import QtQuick 2.0

Item {
    
    id: root
    anchors.fill: full_area || parent
    visible: false
    
    property var full_area
    
    function setChild(item) {
        item.parent = container
    }
    
    Rectangle {
        id: shadow
        anchors.fill: parent
        color: "#4c000000"
        z: 12
        MouseArea {
            id: mouseArea
            z: 13
            hoverEnabled: true
            anchors.fill: parent
            propagateComposedEvents: true
            onClicked: {
                console.log(shadow.z, mouseArea.z, container.z);
                mouse.accepted = true;
                root.visible = false;
            }
        }
    }
    
    Rectangle {
        id: container
        anchors.centerIn: root
        color: "#ffffff"
        width: 100
        height: 150
        radius: 15
        z: 100
    }
    
}

























/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}
}
 ##^##*/
