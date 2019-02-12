#!/usr/bin/env python
# -*- coding: utf-8 -*-
#os.environ["QT_QUICK_CONTROLS_STYLE"] = "Material"


import os
import sys
import requests
import src

from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtQml import *




class FileUploader(QObject):
    
    url = 'http://176.119.158.61:4000/upload'
    
    def __init__(self):
        QObject.__init__(self)
        
    loaded = pyqtSignal(str)
        
    @pyqtSlot(str, str)
    def upload(self, filePath, f_token):
        files = { 
            'file': ('file', open(filePath[8:]
                                .replace ('\n', '')
                                .replace ('\r', ''), 'rb')
                    )
        }
        req = requests.post('{0}/{1}'.format(self.url, f_token), files=files)
        self.loaded.emit(req.text)

if __name__ == "__main__":
    
    _fileUploader = FileUploader()
    
    app = QApplication(sys.argv)
    engine = QQmlApplicationEngine()
    engine.rootContext().setContextProperty('fileUploader', _fileUploader)
    engine.load(QUrl('qrc:/main.qml'))
    sys.exit(app.exec_())
    input("Press Enter to continue...")
    
input("Press Enter to continue...")
