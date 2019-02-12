import QtQuick 2.0
import QtQuick.Dialogs 1.0

Item {
    
    id: root
    
    signal uploaded(string file_id)
    
    function openFileDialog() {
        fileDialog.visible = true;
    }
    
    FileDialog {
        id: fileDialog
        title: "Please choose a file"
        folder: shortcuts.home
        visible: false
        onAccepted: {
            console.log("You chose: " + fileDialog.fileUrl)
            socketIo.emit('accessFile', {});
            socketIo.on('accessFile', function(info) {
                var f_token = info.answer.access_code;
                fileUploader.upload(fileDialog.fileUrl, f_token);
            });
        }
        onRejected: {
            console.log("Canceled")
        }
    }
    
    Component.onCompleted: {
        fileUploader.loaded.connect(function(res_text) {
            root.uploaded(JSON.parse(res_text).file_id);
        });
    }
    
    Connections {
        target: fileUploader
    }
    
}
