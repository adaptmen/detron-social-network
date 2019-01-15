import QtQuick 2.0

Item {
    
    id: root
    
    function addTab(text, uri) {
        tabModel.append({
            tabText: text, 
            uri: uri
        });
        /*actionCache.actions[i] = function () {
            viewPort.moveTo(i - 1);
        }*/
    }
    
    function getIndexByUri(uri) {
        for (var i = 0; i < tabModel.count; i++) {
            if (tabModel.get(i)['uri'] === uri) 
                return i;
        }
		return -1
    }
    
    function remove(index) {
        tabModel.remove(index);
    }
    
    ListView {
        id: tabList
        anchors.fill: parent
        snapMode: ListView.SnapToItem
        highlightRangeMode: ListView.NoHighlightRange
        boundsBehavior: Flickable.DragOverBounds
        highlightFollowsCurrentItem: true
        highlightMoveDuration: 10
        spacing: 100
        flickableDirection: Flickable.HorizontalFlick
        keyNavigationWraps: false
        orientation: ListView.Horizontal
        model: tabModel
        delegate: Item {
            z: parent.z + 1;
            Rectangle {
                property string uri: uri;
                width: 80
                height: 29
                radius: 5
                color: "#10213d"
                Text {
                    id: textField
                    anchors.centerIn: parent
                    color: "#ffffff"
                    text: tabText
                }
                MouseArea {
                    anchors.fill: parent;
                    onClicked: {
                        actionCache.actions[uri]['onclick']();
                    }
                }
                Rectangle {
                    anchors.fill: parent
                    anchors.leftMargin: 80
                    anchors.topMargin: 5
                    anchors.rightMargin: 2
                    anchors.bottomMargin: 5
                    width: 10
                    height: 10
                    radius: 3
                    color: "#ffffff"
                    visible: !(uri === 'main')
                    MouseArea {
                        anchors.fill: parent;
                        onClicked: {
                            console.log(uri);
                            actionCache.actions[uri]['remove']();
                        }
                    }
                }
            }
        }
    }
    
    ListModel {
        id: tabModel
        dynamicRoles: true
    }
    
}































/*##^## Designer {
    D{i:0;autoSize:true;height:480;width:640}
}
 ##^##*/

