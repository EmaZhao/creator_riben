// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-29 10:47:25
// --------------------------------------------------------------------
var RankEvent = require("rank_event");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");

var RankController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var RankModel = require("rank_model");

        this.model = new RankModel();
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
        this.RegisterProtocal(12900, this.handle_12900)  //排行榜数据
        this.RegisterProtocal(12901, this.handle_12901)  //指定排行榜最后更新时间
        this.RegisterProtocal(12902, this.handle_12902)  //请求各个排行榜第一数据
        this.RegisterProtocal(12903, this.handle_12903)  //请求公会排行榜数据
        this.RegisterProtocal(12904, this.handle_12904)  //请求公会排行榜数据
    },

    //排行榜
    send_12900: function (rank_type, start, num, is_cluster) {
        //请求排行榜
        var cluster = 0;
        if (is_cluster == true) {
            cluster = 1;
        }
        var protocal = {};
        protocal.type = rank_type;
        protocal.start = start || 1;
        protocal.num = num || 100;
        protocal.is_cluster = cluster;
        this.SendProtocal(12900, protocal);
    },

    handle_12900:function(data){
        gcore.GlobalEvent.fire(RankEvent.RankEvent_Get_Rank_data, data);
    },

    //指定排行榜最后更新时间
    send_12901: function (type, is_cluster) {
        //请求排行榜
        var cluster = 0;
        if (is_cluster == true)
            cluster = 1;
        var protocal = {};
        protocal.type = type;
        protocal.is_cluster = cluster;
        this.SendProtocal(12901, protocal);
    },

    handle_12901: function (data) {
        gcore.GlobalEvent.fire(RankEvent.RankEvent_Get_Time_event, data);
    },

    //请求各个排行榜第一数据
    send_12902: function (is_cluster) {
        //请求排行榜
        var cluster = 0;
        if (is_cluster == true)
            cluster = 1;
        var protocal = {};
        protocal.is_cluster = cluster;
        this.SendProtocal(12902, protocal);
    },

    handle_12902: function (data) {
        gcore.GlobalEvent.fire(RankEvent.RankEvent_Get_First_data, data);
    },

    //请求公会排行榜数据
    send_12903: function (start, num) {
        //请求排行榜
        var protocal = {};
        protocal.start = start || 1;
        protocal.num = num || 100;
        this.SendProtocal(12903, protocal);
    },

    handle_12903: function (data) {
        gcore.GlobalEvent.fire(RankEvent.RankEvent_Get_Rank_data, data);
    },

    //请求英雄排行榜数据
    send_12904: function (start, num) {
        var protocal = {};
        protocal.start = start || 1;
        protocal.num = num || 100;
        this.SendProtocal(12904, protocal);
    },

    handle_12904: function (data) {
        gcore.GlobalEvent.fire(RankEvent.RankEvent_Get_Rank_data, data);
    },

    //index打开对应的标签页
    openMainView: function (bool) {
        if (bool == true) {
            if (MainuiController.getInstance().checkMainFunctionOpenStatus(MainuiConst.icon.rank, MainuiConst.function_type.other) == false)
                return
            if (!this.main_view) {
                this.main_view = Utils.createClass("rank_main_window");
            }
            this.main_view.open();

        } else {
            if (this.main_view) {
                this.main_view.close();
                this.main_view = null;
            }
        }
    },

    //打开排行榜信息
    openRankView: function (bool, index, is_cluster,data) {
        if (bool == true) {
            if (!this.rank_panel) {
                var view = require("rank_window");
                this.rank_panel = new view(index, is_cluster);
            }
            this.rank_panel.open(data);
        } else {
            if (this.rank_panel) {
                this.rank_panel.close();
                this.rank_panel = null;
            }
        }
    },

    //打开奖励排行榜界面
    openRankRewardPanel: function (bool, rank_reward_type) {
        if (bool == true) {
            if (!this.rank_reward_panel) {
                this.rank_reward_panel = Utils.createClass("rank_reward_window");
            }
            this.rank_reward_panel.open(rank_reward_type);
        } else {
            if (this.rank_reward_panel) {
                this.rank_reward_panel.close();
                this.rank_reward_panel = null;
            }
        }
    }
});

module.exports = RankController;