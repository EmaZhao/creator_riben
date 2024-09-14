// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-26 11:26:17
// --------------------------------------------------------------------
var StoryEvent = require("story_event")
var LevupgradeController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var LevupgradeModel = require("levupgrade_model");

        this.model = new LevupgradeModel();
        this.model.initConfig();
        this.wait_list = []
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        var self = this
        if(self.can_play_drama_event == null){
            self.can_play_drama_event = gcore.GlobalEvent.bind(StoryEvent.BATTLE_RESULT_OVER, function(){
                if(self.wait_list.length){
                    self.wait_list.splice(0,1)
                }
                if(Utils.next(self.wait_list) == null && self.cache_data){
                    self.openMainWindow(true, self.cache_data)
                    self.cache_data = null
                }else{
                    gcore.GlobalEvent.fire(StoryEvent.PREPARE_PLAY_PLOT) 
                }
            })
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(10344, this.handle10344)
    },
    handle10344(data){
        this.openMainWindow(true, data)
    },
    // --desc:设置出现升级时候不能马上出面板
    waitForOpenLevUpgrade(status){
        if(this.wait_list && this.wait_list.length == 0){
            this.wait_list.push(true)
        }
    },
    openMainWindow(status, data){
        var LoginPopupManager = require("LoginPopupManager")
        var b = LoginPopupManager.getInstance().getIsPopupStatus()
        if(b){
          return;
        }
        var self = this
        if(!status){
            if(self.lev_window){
                self.lev_window.close()
                self.lev_window = null
            }
        }else{
            if(Utils.next(self.wait_list) != null){
                self.cache_data = data
                return 
            }

            if(self.lev_window == null){
                let LevupgradeWindow = require("lev_upgrade_window")
                self.lev_window = new LevupgradeWindow()
            }
            self.lev_window.open(data)
        }
    },
    waitLevupgrade(){
        // if (this.cache_data || this.lev_window || this.wait_list.length > 0) return true;
        // if (this.lev_window) return true;


        // return false;
        return this.cache_data != null || this.lev_window != null || Utils.next(this.wait_list) != null
    },

    logStatus: function() {
        cc.log(this.cache_data);
        cc.log(!!this.lev_window);
        cc.log(this.wait_list);
    },

});

module.exports = LevupgradeController;