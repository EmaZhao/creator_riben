// ------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      公会红包
// <br/>Create: 2019-02-13 11:19:47
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var MainuiEvent = require("mainui_event");
var RedbagEvent = require("redbag_event");

var RedbagController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var RedbagModel = require("redbag_model");

        this.model = new RedbagModel();
        this.model.initConfig();
        this.red_bag_vo = null; //临时存储当前领的
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (!this.role_create_success) {
            this.role_create_success = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function () {
                gcore.GlobalEvent.unbind(this.role_create_success);
                this.role_create_success = null;
                if (this.role_vo) {
                    if (this.role_update_event == null) {
                        this.role_update_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                            if (key == "gid" && value == 0) {
                                this.model.resetData();
                            }
                        }.bind(this))
                    }
                }
            }).bind(this));
        }

        if (!this.red_bg_event) {
            this.red_bg_event = gcore.GlobalEvent.bind(MainuiEvent.CLOSE_ITEM_VIEW, function (data) {
                if (data && data.is_red_bag && data.is_red_bag == true) {
                    var info_data = this.model.getRedBagListById(data.info_data.id);
                    if (info_data != null) {
                        this.openLookWindow(true, info_data);
                    }
                }
            }.bind(this))
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(13534, this.handle13534);
        this.RegisterProtocal(13535, this.handle13535);
        this.RegisterProtocal(13536, this.handle13536)     //领取成员红包

        this.RegisterProtocal(13546, this.handle13546)     // 当前发放红包情况

        this.RegisterProtocal(13540, this.handle13540)     //公会红包领取情况
        this.RegisterProtocal(13545, this.handle13545)     //发红包排名
    },

    openMainView: function (bool, extend_id) {
        if (bool == false) {
            if (this.main_window) {
                this.main_window.close();
                this.main_window = null;
            }
        } else {
            if (this.main_window == null) {
                this.main_window = Utils.createClass("redbag_window", extend_id);
            }
            this.main_window.open()
        }
    },

    openLookWindow: function (bool, data) {
        if (bool == false) {
            if (this.look_window) {
                this.look_window.close();
                this.look_window = null;
            }
        } else {
            if (this.look_window == null) {
                this.look_window = Utils.createClass("redbag_look_window", data);
            }
            this.look_window.open(data)
        }
    },

    //成员红包列表信息
    sender13534: function () {
        var protocal = {};
        this.SendProtocal(13534, protocal);
    },

    handle13534: function (data) {
        this.model.updateData(data);
    },

    //请求使用道具发放公会红包
    sender13535: function (type, loss_type) {
        let protocal = {}
        protocal.type = type
        protocal.num = 1
        protocal.msg_id = 0
        protocal.loss_type = loss_type
        this.SendProtocal(13535, protocal)
    },

    handle13535:function(data){
        if(data){
            message(data.msg);
        }
    },

    //领取成员红包
    sender13536: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(13536, protocal);
    },

    handle13536: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.openRegBagWindow(true, data);
    },

    //公会红包领取情况
    sender13540: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(13540, protocal);
    },

    handle13540: function (data) {
        gcore.GlobalEvent.fire(RedbagEvent.Get_List_Event, data);
    },

    //发红包排名
    sender13545: function () {
        this.SendProtocal(13545, {});
    },

    handle13545: function (data) {
        gcore.GlobalEvent.fire(RedbagEvent.Rank_List_Event, data);
    },

    setRedBagVo: function (vo) {
        this.red_bag_vo = vo;
    },

    //打开红包特效界面
    openRegBagWindow: function (bool, data) {
        if (bool == false) {
            if (this.open_window) {
                this.open_window.close();
                this.open_window = null;
            }
        } else {
            if (this.open_window == null) {
                this.open_window = Utils.createClass("redbag_open_window", data);
            }
            this.open_window.open(data)
        }
    },

    //请求红包数据
    send13546: function () {
        this.SendProtocal(13546, {});
    },

    handle13546: function (data) {
        gcore.GlobalEvent.fire(RedbagEvent.Update_Red_Bag_Event, data.list);
    }
});

module.exports = RedbagController;