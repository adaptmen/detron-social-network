import QtQuick 2.0
import QtQuick.Layouts 1.3

Item {
    
    id: root
    
    function addPage(innerString, uri) {
        var innerObject = Qt.createQmlObject(innerString, pageView, 'newObject');
        pageModel.append({
            innerObject: innerObject,
            uri: uri
        });
    }
    
    function moveTo(index) {
        pageView.currentIndex = index;
    }
    
    function remove(index) {
        pageModel.remove(index);
    }
    
    function getIndexByUri(uri) {
        for (var i = 0; i < pageModel.count; i++) {
            if (pageModel.get(i)['uri'] === uri) {
                return i;
            }
        }
    }
    
    PathView {
        id: pageView
        flickDeceleration: 300
        highlightMoveDuration: 500
        highlightRangeMode: PathView.StrictlyEnforceRange
        anchors.fill: parent
        model: pageModel
        delegate: Item {
            property string uri: uri;
            opacity: PathView.isCurrentItem ? 1 : 0
            width: root.width
            height: root.height
            z: parent.z + 1
            Rectangle {
                color: "#ffffff"
                anchors.fill: parent
                ColumnLayout {
                    id: pageLayout
                    width: parent.width
                    height: parent.height
                    anchors.centerIn: parent
                    anchors.fill: parent
                    children: innerObject
                    Component.onCompleted: {
                        pageLayout.children[0].anchors.fill = pageLayout.children[0].parent;
                    }
                }
            }
        }
        path: Path {
            startX: root.width / 2; startY: root.height / 2
            PathQuad { 
                x: root.width / 2;
                y: root.height / 2;
                controlX: root.width;
                controlY: root.height / 2;
            }
            PathQuad { 
                x: root.width / 2;
                y: root.height / 2;
                controlX: 0;
                controlY: root.height / 2;
            }
        }
    }
    
    ListModel {
        id: pageModel
        dynamicRoles: true
    }
    
}
