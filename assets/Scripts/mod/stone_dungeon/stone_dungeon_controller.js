// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-08 11:59:10
// --------------------------------------------------------------------

var StoneDungeonEvent = require("stone_dungeon_event");

var Stone_dungeonController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var Stone_dungeonModel = require("stone_dungeon_model");

        this.model = new Stone_dungeonModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // if(!this.init_role_event){
        //     this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function(){
        //         gcore.GlobalEvent.unbind(this.init_role_event);
        //         this.init_role_event = null;
        //         this.send13030();
        //     }).bind(this));
        // }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(13030, this.on13030);
        this.RegisterProtocal(13031, this.on13031);
        this.RegisterProtocal(13032, this.on13032);
    },

    openStoneDungeonView : function(status){
        if(status){
            var  open_data = Config.dailyplay_data.data_exerciseactivity[1];
            if(open_data == null){
                message(Utils.TI18N("日常副本数据异常"))
                return 
            }
            var MainuiController    = require("mainui_controller");
            var bool = MainuiController.getInstance().checkIsOpenByActivate(open_data.activate);
            if(bool == false){
                message(open_data.lock_desc)
                return 
            }

            if(!this.stoneDungeonView){
                this.stoneDungeonView = Utils.createClass("stone_dungeon_window",this);
            }
            if(this.stoneDungeonView && this.stoneDungeonView.isOpen() == false){
                this.stoneDungeonView.open();
            }
            
        }else{
            if(this.stoneDungeonView){
                this.stoneDungeonView.close();
                this.stoneDungeonView = null;
            }
        }
    },

    // 副本信息
    send13030 : function(){
        this.SendProtocal(13030, {});
    },

    on13030 : function(data){
        this.model.setChangeSweepCount(data.list);
        this.model.setPassClearanceID(data.pass_list);
        gcore.GlobalEvent.fire(StoneDungeonEvent.Update_StoneDungeon_Data, data);
    },

    // 挑战副本
    send13031 : function(id){
        this.SendProtocal(13031, {id : id});
    },

    on13031 : function(data){
        message(data.msg);
    }, 

    // 扫荡副本
    send13032 : function(id){
        this.SendProtocal(13032, {id : id});
    },

    on13032 : function(data){
        message(data.msg);
    },

    getStoneDungeonRoot: function(finish_cb) {
        if (!finish_cb) {
            if (this.stoneDungeonView)
                return this.stoneDungeonView.root_wnd;
        } else {
            if (this.stoneDungeonView) {
                this.stoneDungeonView.getRootWnd(finish_cb);
            } else {
                finish_cb(null);
            }
        }
    },
});

module.exports = Stone_dungeonController;
