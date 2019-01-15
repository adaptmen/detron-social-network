
var XHR = XMLHttpRequest;
var authUrl = "http://176.119.158.61:4000";

function auth(_phone, onSuccess, onError) {
    _send(authUrl + "/auth/number" + "?phone=" + _phone)
    .then(function(ans) {
        onSuccess(ans);
    })
    .catch(function(ans) {
        onError(ans);
    });
}

function authWithCode(_phone, _code, onSuccess, onError) {
    _send(authUrl + "/auth/code" + "?phone=" + _phone + "&code=" + _code)
    .then(function(ans) {
        onSuccess(ans);
    })
    .catch(function(ans) {
        if (onError)
            onError(ans);
    });
}

function _send(_url, _data, _method) {
    _method = _method || "POST";
    _data = _data || {};
    console.log(_url, _data, _method);
    var xhr = new XHR();
    xhr.open(_method, _url);
    xhr.send(_data);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            console.log("Error xhr");
            _onError(xhr.responseText);
        } 
        else if (xhr.readyState === XMLHttpRequest.DONE) {
            var _jsonAnswer = JSON.parse(xhr.responseText);
            _onSuccess(_jsonAnswer ? _jsonAnswer : xhr.responseText);
        }
    }
    
    var _onSuccess;
    var _onError;
    
    var _then = function(onSuccess) {
        _onSuccess = onSuccess;
        return { catch: _catch }
    };
    var _catch = function(onError) {
        _onError = onError;
        return { then: _then }
    };
    
    return {
        then: _then,
        catch: _catch
    }
}




