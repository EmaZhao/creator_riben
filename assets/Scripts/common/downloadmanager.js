window.DownloadManager = cc.Class({
	ctor: function() {
        this._spinesCache = [];
	},

    checkAnimaCache: function() {
        return
        cc.sys.localStorage.removeItem("sszg_anima_cache_1");
        var cache_info = cc.sys.localStorage.getItem("sszg_anima_cache_1");
        if (cache_info) { 
            cache_info = JSON.parse(cache_info);
            if (cache_info.status != "finish") {
                var finish_num = parseInt(cache_info.status);
                if (typeof finish_num == "number" && finish_num > 0 && finish_num < CacheAnimas.length) {
                    for (var anima_i = finish_num + 1; anima_i < CacheAnimas.length - 1; anima_i ++) {
                        this.downloadSpine(CacheAnimas[anima_i], anima_i);
                    }
                }
            }
        } else {
            for (var anima_i in CacheAnimas) {
                this.downloadSpine(CacheAnimas[anima_i], anima_i);
            }            
        }
    },

    downloadSpine: function(spine_id, index) {
        var spine_info = {spine_id: spine_id, index: index};
        this._spinesCache.push(spine_info);

        if (this._spinesCache.length > 0 && !this._downTimer) {
            this._downTimer = gcore.Timer.set(this.preDownLoad.bind(this), 500, -1);
        }
    },

    preDownLoad: function() {
        var load_status = cc.loader.getDownLoadStatus();
        if (!load_status) {        // 主队列没有下载任务
            var spine_info = this._spinesCache.shift();

            if (spine_info.index) {
                var status = spine_info.index;
                if (spine_info.index >= CacheAnimas.length - 1) {
                    status = "finish"
                } 
                cc.sys.localStorage.setItem("sszg_anima_cache_1", JSON.stringify({status: status}));
            }
            this.doDownloadSpine(spine_info.spine_id);

            if (this._spinesCache.length <= 0 && this._downTimer) {
                gcore.Timer.del(this._downTimer);
                this._downTimer = null;
            }
        }
    },

    doDownloadSpine: function(spine_id) {
        if (!spine_id)
            return

        var spine_path = "spine/" + spine_id + "/";
        // spien文件
        var spine_uuids = cc.loader.getDirUuids(spine_path, sp.SkeletonData);

        cc.log(spine_uuids);

        // for (var spine_i in spine_uuids) {
        //     var spine_url = cc.loader.getUrlWithUuid(spine_uuids[spine_i]);

        //     this.downloadText(spine_url);
        // }

        // // 图片和纹理
        // var img_uuids = cc.loader.getDirUuids(spine_path, cc.Texture2D);
        // for (var img_i in img_uuids) {
        //     var texture_url = cc.loader.getUrlWithUuid(img_uuids[img_i]);
        //     var img_url = texture_url.replace(".json", ".png");
        //     this.downloadText(texture_url);
        //     this.downloadImage(img_url); 
        // }
    },

    downloadText: function (url, callback) {
        var xhr = cc.loader.getXMLHttpRequest(),
        // var xhr = new ActiveXObject("MSXML2.XMLHTTP");
        errInfo = 'Load text file failed: ' + url;
        xhr.open('GET', url, true);
        if (xhr.overrideMimeType) xhr.overrideMimeType('text\/plain; charset=utf-8');
        xhr.onload = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    callback && callback(null, xhr.responseText);
                }
                else {
                    callback && callback({status:xhr.status, errorMessage:errInfo + '(wrong status)'});
                }
            }
            else {
                callback && callback({status:xhr.status, errorMessage:errInfo + '(wrong readyState)'});
            }
        };
        xhr.onerror = function(){
            callback && callback({status:xhr.status, errorMessage:errInfo + '(error)'});
        };
        xhr.ontimeout = function(){
            callback && callback({status:xhr.status, errorMessage:errInfo + '(time out)'});
        };
        xhr.send(null);
    },

    downloadImage: function(url, callback, isCrossOrigin) {     
        if (!url) return;
        if (isCrossOrigin === undefined)
            isCrossOrigin = true;
        var img = new Image();
        if (isCrossOrigin && window.location.protocol !== 'file:') {
            img.crossOrigin = 'anonymous';
        } else {
            img.crossOrigin = null;
        }
        if (img.complete && img.naturalWidth > 0 && img.src === url) {
            return img;
        } else {
            var loadCallback = function loadCallback() {
                img.removeEventListener('load', loadCallback);
                img.removeEventListener('error', errorCallback);
            };
            var errorCallback = function errorCallback() {
                img.removeEventListener('load', loadCallback);
                img.removeEventListener('error', errorCallback);
            };
            img.addEventListener('load', loadCallback);
            img.addEventListener('error', errorCallback);
            img.src = url;
        }
    },


})

DownloadManager.getInstance = function () {
    if (!DownloadManager.instance) {
        DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
}

module.exports = DownloadManager;