var LoaderManager = require("loadermanager");
window.ViewClass = cc.Class({
    extends: BaseClass,

    ctor: function() {
        this.active_status = true;
        this.base_view_event_list = {};
        this.res_list = {};
        this.update_timers = {};
        this.parent = null;
        this.ticks = {};
        this.rleasePrefab = true;
    },

    /**
     * 递归获取子节点
     * @Author   Zhx
     * @DateTime 2017-12-06
     * @param    {[type]}   parent 父节点
     * @param    {[type]}   uiName 子节点名称
     * @return   {[type]}          [description]
     */
    seekChild: function(parent, uiName, component) {
        if (!parent || (!(typeof parent == "string") && !(parent instanceof cc.Node))) return;

        if (typeof parent == "string") {
            if (uiName && cc.js.isChildClassOf(uiName, cc.Component))
                component = uiName; 
            uiName = parent;
            parent = this.root_wnd;
        }

        if (uiName && (cc.js.isChildClassOf(uiName, cc.Component)))
            component = uiName;
        if (parent.name === uiName)
            return parent;

        var childrens = parent.getChildren();
        for (var index in childrens) {
            var resultNode = this.seekChild(childrens[index], uiName, component);
            if (resultNode) {
                if (component) return resultNode.getComponent(component);
                return resultNode;
            }
        }
    },

    // 加载资源
    loadRes:function(path, callback){
        if(this.res_list[path]){
            if(this.root_wnd && this.root_wnd.isValid){
                callback(this.res_list[path])
            }else{
                console.log("节点已销毁",this.prefabPath)
            }
            return
        } else {
            LoaderManager.getInstance().loadRes(path,function(res_object){
                if(!this.isCache && (this.is_close || this.delete)){
                    return;
                }
                if (!(res_object instanceof cc.Node))
                    this.res_list[path] = res_object
                
                if(this.root_wnd && this.root_wnd.isValid){
                    callback(res_object)
                }else{
                    console.log("节点已销毁",this.prefabPath)
                }
            }.bind(this))            
        }
    },

    setParent: function(parent) {
        this.parent = parent;
    },

    deleteMe: function() {
        // this.iss
        cc.log("deleteMe",this.prefabPath)
        this.removeGlobalEvent();
        if(this.root_wnd && !this.isCache){
            // this.root_wnd.destroyAllChildren();
            this.root_wnd.destroy();
            this.root_wnd = null;
        }

        if (this.mainloop_timer)
            gcore.Timer.del(this.mainloop_timer);

        for (var timer_i in this.update_timers){
            if (this.update_timers[timer_i])
                gcore.Timer.del(this.update_timers[timer_i]["timer"]);
                this.update_timers[timer_i] = null;
        }

        // LoaderManager.getInstance().deleteRes(this.prefabPath);
        for(var key in this.res_list){
            LoaderManager.getInstance().releaseRes(key)
        }

        if (!this.isCache) {
            if (this.rleasePrefab)
                LoaderManager.getInstance().releasePrefab(this.prefabPath);
        }
    },

    /**
     * 添加通用监听事件
     * @param {*} eveny_type 
     * @param {*} callback 
     */
    addGlobalEvent: function (event_type, callback) {
        if (!event_type) return
        if (!this.base_view_event_list[event_type]) {
            this.base_view_event_list[event_type] = gcore.GlobalEvent.bind(event_type, (function (...value) {
                if (callback) {
                    callback.apply(this, value);
                }
            }).bind(this))
            return this.base_view_event_list[event_type];
        }
    },

    removeGlobalEvent:function(event_hand){
        if (!event_hand) {
            for(var key in this.base_view_event_list){
                if (this.base_view_event_list[key])
                    gcore.GlobalEvent.unbind(this.base_view_event_list[key]);
            }
            this.base_view_event_list = null;            
        } else {
            if (this.base_view_event_list[event_hand]) {
                gcore.GlobalEvent.unbind(this.base_view_event_list[event_hand]);
                delete this.base_view_event_list[event_hand];
            }
        }
    },

    startUpdate: function(times, update_cb, interval) {
        times = times > 0 ? times : -1;
        interval = interval || 100;
        if (times > 0) {
            if (update_cb) {
                var timer_count = 0;
                var timer_index = null;
                for (var timer_i in this.update_timers) {
                    if (!this.update_timers[timer_i]) {
                        timer_index = timer_i;
                        break;
                    }
                    timer_count += 1;
                }

                if (!timer_index)
                    timer_index = "udpatetimer_" + timer_count
                this.update_timers[timer_index] = {};
                this.update_timers[timer_index]["finish"] = 0;
                this.update_timers[timer_index]["times"] = times;
                this.update_timers[timer_index]["timer"] = gcore.Timer.set(function (callback, timer_index) {
                        if (callback)
                            callback(this.update_timers[timer_index]["finish"]);
                    if (this.update_timers[timer_index]) {
                        this.update_timers[timer_index]["finish"] += 1;
                        if (this.update_timers[timer_index]["finish"] == this.update_timers[timer_index]["times"]) {
                            gcore.Timer.del(this.update_timers[timer_index]["timer"]);
                            this.update_timers[timer_index] = null;
                        }                        
                    }
                }.bind(this, update_cb, timer_index), interval, times);
                return this.update_timers[timer_index]["timer"];
            }
        } else {
            if (!this.mainloop_timer) {
                this.mainloop_timer = gcore.Timer.set(function () {
                    if (this.update)
                        this.update(200/1000);
                }.bind(this), 200, -1);
                return this.mainloop_timer;
            }
        }
    },

    stopUpdate: function(timer_hander) {
        if (timer_hander) {
            for (var timer_i in this.update_timers) {
                if (this.update_timers[timer_i] && this.update_timers[timer_i]["timer"] === timer_hander) {
                    gcore.Timer.del(this.update_timers[timer_i]["timer"]);
                    this.update_timers[timer_i] = null;
                }
            }
        } else {
            if (this.mainloop_timer) {
                gcore.Timer.del(this.mainloop_timer);   
                this.mainloop_timer = null;                
            }
        }
    },

    isOpen: function() {
        if (this.root_wnd && this.root_wnd.active)
            return true;
        return false 
    }, 

    addTicket: function(cf, interval, index) {
        interval = (typeof parseInt(interval) == "number") ? interval * 1000 : 0;
        var tick_id = gcore.Timer.set(function(cb) {
            if (cb)
                cb();
        }.bind(this, cf), interval, 1);
        if (index)
            this.ticks[index] = tick_id;
    },

    delTicker: function(index) {
        if (this.ticks[index]) {
            gcore.Timer.del(this.ticks[index]);
            delete this.ticks[index];
        }

    },

    hasTicket: function(index) {
        return !!this.ticks[index]
    },


    seekChildByTag: function(parent, tag) {
        if (!parent) return;
        if (parent.ui_tag === tag) {          
            return parent;
        }
        var childrens = parent.getChildren();
        for (var index in childrens) {
            var resultNode = this.seekChildByTag(childrens[index], tag);
            if (resultNode) return resultNode;
        }
    },

})