
Worker = cc.Class.extend({
    _worker: null,
    _newWorkSuccess: false,
    _task: null,
    _cb: null,
    ctor: function(jsUrl, options){
		//1.处理子线程运行脚本文件url
        if(window.REMOTE_SERVER_ROOT){
            //jsUrl = window.REMOTE_SERVER_ROOT + jsUrl;
        }else{
            var url = getLocationUrl().split('?')[0];
            var lastIndex = url.lastIndexOf('/');
            url = url.substring(0, lastIndex+1);
            jsUrl = url + jsUrl;
        }
		
		//2. 创建worker对象
        var self = this;
        self._newWorkSuccess = false;
        self._task = null;
        if(window.wx && window.wx.createWorker){
            var worker = window.wx.createWorker(jsUrl);
            worker.onMessage(this.onMessageWx.bind(this));
            self._worker = worker;
            self._newWorkSuccess = true;
        }else if(window && window.Worker){
			//3.为避免Web Worker的同源限制，将子线程代码从远程下载下来。通过createObjectURL创建同源环境
			// 此处下载代码可自行创建，cc.loader.loadTxt为引擎cocos-js的下载方法
            cc.loader.loadTxt(jsUrl, function(err, txt){
                var blob = new Blob([txt]);
                var url = window.URL.createObjectURL(blob);
                var work = new window.Worker(url);
                work.onmessage = self.onMessage.bind(self);
                work.onmessageerror = self.onMessageError.bind(self);
                work.onerror = self.onError.bind(self);
                self._worker = work;
                self._newWorkSuccess = true;
                if(self._task){
                    self.doTask(self._task);
                }
            });
        }else {
            self._newWorkSuccess = true;
            return null;
        }
    },

	//主线程派发消息到子线程，并触发对于任务
    doTask: function(data){
        if(!this._newWorkSuccess){
            this._task = data;
            return;
        }
        if(window.REMOTE_SERVER_ROOT){
            data.taskMsg = window.REMOTE_SERVER_ROOT + data.taskMsg;
        }else{
            var url = getLocationUrl().split('?')[0];
            var lastIndex = url.lastIndexOf('/');
            url = url.substring(0, lastIndex+1);
            data.taskMsg = url + data.taskMsg;

        }
        var msg = data.taskMsg;
        this._cb = data.cb;
        this.postMessage(msg);
    },

	//主线程监听子线程派发来的消息
    onMessage: function(msg){
        cc.log("message");
        this._cb && this._cb(null, msg.data);
    },

	//主线程监听子线程派发来的消息(微信校友、QQ小游戏版)
    onMessageWx: function(msg){
        cc.log("message");
        this._cb && this._cb(null, msg);
    },

	//监听错误
    onMessageError: function(){
        this._cb && this._cb("data parse error");
    },

	//监听错误
    onError: function(msg){
        this._cb && this._cb(msg);
    },

	//派发消息
    postMessage: function(msg){
       this._worker.postMessage(msg);
    },

	//关闭子线程
    terminate: function(){
        if(window.Worker){
            this._worker.terminate();
        }else if(wx && wx.creeateWorker){
            this._worker.terminate();
        }
    },
});

Worker.support = function(){
    return ((window && window.Worker) || (wx && wx.createWorker));
};