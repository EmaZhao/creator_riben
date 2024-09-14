// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     锻造屋的模块,合成装备的地方
// <br/>Create: 2019-01-03 10:09:32
// --------------------------------------------------------------------
var ForgehouseController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var ForgehouseModel = require("forgehouse_model");

        this.model = new ForgehouseModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(11080, this.handle11080);
        this.RegisterProtocal(11079, this.handle11079);
        this.RegisterProtocal(11081, this.handle11081);
        this.RegisterProtocal(11082, this.handle11082);
    },

    // 合成
    handle11080: function (data) {
        message(data.msg)
        if (data.result == 1) {
            gcore.GlobalEvent.fire(EventId.COMPOSITE_RESULT);
        }
    },

    // 请求合成物品
    send11080: function (id, num) {
        var proto = {}
        proto.base_id = id
        proto.num = num
        this.SendProtocal(11080, proto)
    },

    //一键合成装备预览
    send11079: function (base_id, num) {
        var proto = {};
        proto.base_id = Number(base_id);
        proto.num = num || 0;
        this.SendProtocal(11079, proto);
    },

    handle11079: function (data) {
        if (Utils.next(data.list) == null) {
            message(Utils.TI18N("暂时无法合成任何装备或金币不足"));
            return
        }
        if (data.type == 0) {
            this.openEquipmentAllSynthesisWindow(true, data);
        }
    },

    //一键合成
    send11081: function (base_id, num) {
        var proto = {};
        proto.base_id = base_id;
        proto.num = num || 0;
        this.SendProtocal(11081, proto);
    },

    handle11081: function (data) {
        message(data.msg);
        if (data.result == 1) {
            this.openEquipmentAllSynthesisWindow(false);
            gcore.GlobalEvent.fire(EventId.COMPOSITE_RESULT);
        }
    },

    //合成日志
    send11082: function () {
        this.SendProtocal(11082, {});
    },

    handle11082: function (data) {
        gcore.GlobalEvent.fire(EventId.COMPOSITE_RECORD, data);
    },

    // 打开关闭锻造屋
    //sub_type:1为装备锻造；2为符文锻造
    openForgeHouseView: function (status, sub_type) {
        if (!status) {
            if (this.forgehouse_win) {
                this.forgehouse_win.close();
                this.forgehouse_win = null;
            }
        } else {
            if (this.forgehouse_win == null) {
                var ForgehouseWindow = require("forge_house_window")
                this.forgehouse_win = new ForgehouseWindow()
            }
            this.forgehouse_win.open(sub_type)
        }
    },

    //打开一键合成预览界面
    openEquipmentAllSynthesisWindow: function (bool, data) {
        if (bool == true) {
            if (this.all_synthsis_view == null) {
                this.all_synthsis_view = Utils.createClass("equipment_all_synthesis_window");
            }
            this.all_synthsis_view.open(data);
        } else {
            if (this.all_synthsis_view) {
                this.all_synthsis_view.close();
                this.all_synthsis_view = null;
            }
        }
    },

    //打开合成日志界面
    openEquipmentCompRecordWindow: function (bool) {
        if (bool == true) {
            if (this.comp_record_view == null) {
                this.comp_record_view = Utils.createClass("equipment_comp_record_window");
            }
            this.comp_record_view.open();
        } else {
            if (this.comp_record_view) {
                this.comp_record_view.close();
                this.comp_record_view = null;
            }
        }
    },

    getForgeHouseRoot: function () {
        if (this.forgehouse_win)
            return this.forgehouse_win.root_wnd;
    },

    getForgeArtifactRoot: function () {
        if (this.forgehouse_win){
            if(this.forgehouse_win.panel_list){
                return this.forgehouse_win.panel_list[2].root_wnd;
            }
        }
            
    },
});

module.exports = ForgehouseController;
