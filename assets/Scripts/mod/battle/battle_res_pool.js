var GC_TIME = 300;
// 动画资源的缓存池
var BattleResPool =  function() {
	this._loaddingRes = {};    // 加载中的资源
	this._finishRes = {};      // 加载完成的资源
	this._rescounter = {};
	this._delres = {};

    this.mainloop_timer = gcore.Timer.set(function () {
        this.update(10);
    }.bind(this), 10000, -1);
    this._test_load = {};
    this._test_del = {};    
}
var proto = BattleResPool.prototype;

proto.preLoadRes = function(path, callback) {
	this.getRes(path, callback, true);
}

proto.getRes = function(path, callback, is_pre) {
	if (!path || !callback) return;

	// if (!is_pre) {
	// 	if (!this._test_load[path])
	// 		this._test_load[path] = 0;

	// 	this._test_load[path]++		
	// }

	if (this._delres[path]) {
		delete this._delres[path]
	}

	if (this._finishRes[path]) {
		callback(this._finishRes[path]);
		if (!is_pre) {
			if (!this._rescounter[path])
				this._rescounter[path] = 0;
			this._rescounter[path] ++;
		}
		return;
	} else {
		var load_info = {};
		load_info.callback = callback;
		load_info.is_pre = is_pre;
		if (this._loaddingRes[path] && this._loaddingRes[path].length > 0) {
			this._loaddingRes[path].push(load_info);
			return;
		} else {
			this._loaddingRes[path] = [];
			this._loaddingRes[path].push(load_info);
		}
	}

    LoaderManager.getInstance().loadRes(path, function (path, res_object) {
    	this._finishRes[path] = res_object;
    	for (var callback_i in this._loaddingRes[path]) {
    		var load_info = this._loaddingRes[path][callback_i];
    		if (load_info.callback)
	    		load_info.callback(res_object);
    		if (!load_info.is_pre) {          // 如果不是预加载的则进行引用计数
    			if (!this._rescounter[path])
    				this._rescounter[path] = 0;
    			this._rescounter[path] ++;

				if (this._delres[path])
					delete this._delres[path]
    		} else {                          // 如果是预加载的暂时放到删除队列
    			if (!this._rescounter[path] || this._rescounter[path] <= 0)
	    		    this.delRes(path);
    		}
    	}
    	this._loaddingRes[path] = [];
    }.bind(this, path))
}

proto.delRes = function(path) {
	if (this._rescounter[path] && this._rescounter[path] > 0) {
		this._rescounter[path] --;

		if (this._rescounter[path] <= 0) {	
			if (!this._delres[path])
				this._delres[path] = GC_TIME;
			delete this._rescounter[path]
		}

		// if (!this._test_del[path])
		// 	this._test_del[path] = 0;
		// this._test_del[path]++
	}

}

proto.update = function(dt) {
	for (var res_i in this._delres) {
		this._delres[res_i] -= dt;

		if (this._delres[res_i] < 0) {
			LoaderManager.getInstance().releaseRes(res_i);
			delete this._delres[res_i]
		}


	}
}

BattleResPool.getInstance = function () {
    if (!BattleResPool.instance) {
        BattleResPool.instance = new BattleResPool();
    }
    return BattleResPool.instance;
}

module.exports = BattleResPool;