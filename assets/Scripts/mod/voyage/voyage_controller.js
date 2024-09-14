// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-06 20:33:19
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var VoyageEvent = require("voyage_event");

var VoyageController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var VoyageModel = require("voyage_model");

        this.model = new VoyageModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.init_role_event == null) {
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function () {
                gcore.GlobalEvent.unbind(this.init_role_event);
                this.init_role_event = null;
            }, this)
        }

        //断线重连的时候
        if (this.re_link_game_event == null) {
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function () {
            }, this)
        }
    },

    //请求远航数据
    requestVoyageInfo: function () {
        this.SendProtocal(23800, {});
    },

    //请求接取订单
    requestReceiveOrder: function (order_id, assign_ids) {
        var protocal = {};
        protocal.order_id = order_id;
        protocal.assign_ids = assign_ids;
        this.SendProtocal(23802, protocal);
    },

    //请求完成订单
    requestFinishOrder: function (order_id, type) {
        var protocal = {};
        protocal.order_id = order_id;
        protocal.type = type;
        this.SendProtocal(23803, protocal);
    },

    //请求刷新
    requestRefreshOrder: function () {
        this.SendProtocal(23804, {})
    },

    //请求远航活动状态
    requestActivityStatus: function () {
        var protocal = {};
        this.SendProtocal(23805, protocal);
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(23800, this.handle23800)     // 远航数据（订单、刷新次数等）
        this.RegisterProtocal(23801, this.handle23801)     // 远航订单数据
        this.RegisterProtocal(23802, this.handle23802)     // 远航接取订单
        this.RegisterProtocal(23803, this.handle23803)     // 远航完成订单
        this.RegisterProtocal(23804, this.handle23804)     // 远航刷新订单
        this.RegisterProtocal(23805, this.handle23805)     // 远航活动状态
        this.RegisterProtocal(23820, this.handle23820)     // 远航记录返回
        this.RegisterProtocal(23821, this.handle23821)     // 第一次弹出特权提示
    },

    //远航数据（订单、刷新次数等）
    handle23800: function (data) {
        if (data.order_list) {
            this.model.setOrderList(data.order_list);
        }
        if (data.free_times) {
            this.model.setFreeTimes(data.free_times);
        }
        if (data.coin_times) {
            this.model.setCoinTimes(data.coin_times);
        }
        gcore.GlobalEvent.fire(VoyageEvent.UpdateVoyageDataEvent)
        gcore.GlobalEvent.fire(VoyageEvent.UpdateVoyageRedEvent)
    },

    //远航订单数据更新
    handle23801: function (data) {
        if (data) {
            this.model.updateOneOrderData(data);
            gcore.GlobalEvent.fire(VoyageEvent.UpdateVoyageRedEvent)
        }
    },

    //接取订单返回
    handle23802: function (data) {
        message(data.msg)
        if (data.flag == 1) {
            this.openVoyageDispatchWindow(false);
        }
    },

    //完成订单返回
    handle23803: function (data) {
        message(data.msg);
        if (data.flag == 1 && data.order_id) {
            this.model.deleteOneOrderData(data.order_id);
            gcore.GlobalEvent.fire(VoyageEvent.DeleteOrderDataEvent)
            gcore.GlobalEvent.fire(VoyageEvent.UpdateVoyageRedEvent)
        }
    },

    //刷新订单返回
    handle23804: function (data) {
        message(data.msg);
    },

    //远航活动状态
    handle23805: function (data) {
        if (data.flag) {
            this.model.setActivityStatus(data.flag);
            gcore.GlobalEvent.fire(VoyageEvent.UpdateActivityStatusEvent)
        }
    },

    //远航第一次点击特权记录
    send23820: function () {
        this.SendProtocal(23820,{})
    },

    handle23820: function (data) {
    },

    //请求特权记录情况
    send23821: function () {
        this.SendProtocal(23821,{})
    },

    handle23821: function (data) {
        this.model.setFirstFresh(data.flag != 1);
    },

    //--------------------------@ 界面相关
    openVoyageMainWindow: function (status, not_tips) {
        if (status == true) {
            if (!this.checkVoyageIsOpen(not_tips)) {
                return
            }
            if (!this.voyage_main_window) {
                this.voyage_main_window = Utils.createClass("voyage_main_window");
                this.voyage_main_window.open();
            }
        } else {
            if (this.voyage_main_window) {
                this.voyage_main_window.close();
                this.voyage_main_window = null;
            }
        }
    },

    //引导需要
    getVoyageMainRoot: function () {
        if (this.voyage_main_window) {
            return this.voyage_main_window.root_wnd
        }
    },

    //打开远航派遣界面
    openVoyageDispatchWindow: function (status, data) {
        if (status == true) {
            if (!this.voyage_dispatch_window) {
                this.voyage_dispatch_window = Utils.createClass("voyage_dispatch_window");
                this.voyage_dispatch_window.open(data);
            }
        } else {
            if (this.voyage_dispatch_window) {
                this.voyage_dispatch_window.close();
                this.voyage_dispatch_window = null;
            }
        }
    },

    //远航是否开启
    checkVoyageIsOpen: function (no_tips) {
        var is_open = false;
        var lev_config = Config.shipping_data.data_const["guild_lev"];
        var role_vo = RoleController.getInstance().getRoleVo();
        if (lev_config && lev_config.val <= role_vo.lev) {
            is_open = true;
        } else if (!no_tips) {
            message(lev_config.desc)
        }
        return is_open;
    },

    getVoyageMainRoot: function () {
        if (this.voyage_main_window)
            return this.voyage_main_window.root_wnd;
    },

    getVoyageDispatchRoot: function () {
        if (this.voyage_dispatch_window)
            return this.voyage_dispatch_window.root_wnd;
    },
});

module.exports = VoyageController;