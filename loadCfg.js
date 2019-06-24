
(function(){
    //wxgame or qqgame
    //worker.onMessage(function(res){
    //    doTask(res);
    //});
	
    //web worker
    addEventListener('message', function(msg){
        doTask(msg.data);
    }, false);
})();


function doTask(url){
    loadBinary({
        url: url,
        dataType: "arraybuffer",
        async: true,
        success: function(result){
            doTaskFinish(result);
        },
        error: function(){
            doTaskFinish();
        }
    })
};

function doTaskFinish(arrayBuffer){
    //wxgame or qqgame
    //worker.postMessage(arrayBuffer);
	
    //web worker
    postMessage(arrayBuffer);
}

function loadBinary(url, success, error){
    if (typeof(url) == 'object') {
        success = url.success;
        error = url.error;
        url = url.url;
    }

    var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
    xhr.timeout = 10000;
    if (xhr.ontimeout === undefined) {
        xhr._timeoutId = -1;
    }
	
    xhr.open("GET", url, true);
    xhr.responseType = 'arraybuffer';

    if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=x-user-defined");
    xhr.onload = function () {
        xhr.readyState === 4 && xhr.status === 200 ? success(new Uint8Array(xhr.response)) : error();
    };
    xhr.onerror = function () {
        error();
    };
    xhr.send(null);
};