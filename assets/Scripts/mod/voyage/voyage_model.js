// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-06 20:33:19
// --------------------------------------------------------------------
var VoyageOrderVo = require("voyage_order_vo");
var VoyageConst = require("voyage_const");

var VoyageModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.ctrl = require("voyage_controller").getInstance();
        this.order_list = []  // 全部订单数据
        this.free_times = 0   // 今日已经免费刷新次数
        this.coin_times = 0   // 今日已经钻石刷新次数
    },

    //设置所有订单数据
    setOrderList: function (data) {
        this.order_list = [];
        for (var k in data) {
            var v = data[k];
            var order_vo = new VoyageOrderVo();
            order_vo.updateData(v);
            this.order_list.push(order_vo);
        }
    },

    //获取所有订单数据
    getAllOrderList: function () {
        return this.order_list
    },

    //刷新某一订单数据
    updateOneOrderData: function (data) {
        for (var k in this.order_list) {
            var v = this.order_list[k];
            if (v.order_id == data.order_id) {
                v.updateData(data);
                break
            }
        }
    },

    //删除某一订单数据
    deleteOneOrderData: function (order_id) {
        for (var k in this.order_list) {
            var order_vo = this.order_list[k];
            if (order_vo.order_id == order_id) {
                this.order_list.splice(k, 1);
                break
            }
        }
    },

    setFreeTimes: function (times) {
        this.free_times = times;
    },

    //获取今日已经免费刷新次数
    getFreeTimes: function () {
        return this.free_times
    },

    setCoinTimes: function (times) {
        this.coin_times = times;
    },

    //获取今日已经钻石刷新次数
    getCoinTimes: function () {
        return this.coin_times
    },

    //订单中是否有紫色（史诗）品质及以上的订单并且未接取
    checkIsHaveHigherEpicOrder: function () {
        var is_have = false;
        for (var k in this.order_list) {
            var order_vo = this.order_list[k];
            if (order_vo.status == VoyageConst.Order_Status.Unget && order_vo.config && order_vo.config.quality >= VoyageConst.Order_Rarity.Epic) {
                is_have = true;
                break
            }
        }
        return is_have
    },

    //根据英雄id判断是否为任务中
    checkHeroIsInTaskById: function (id) {
        var is_in = false;
        for (var k in this.order_list) {
            var order_vo = this.order_list[k];
            if (order_vo.assign_ids) {
                for (var i in order_vo.assign_ids) {
                    var assign = order_vo.assign_ids[i];
                    if (assign.partner_id && assign.partner_id == id) {
                        is_in = true;
                        break
                    }
                }
            }
            if (is_in) {
                break
            }
        }
        return is_in
    },

    //根据订单剩余时间获取加速所需钻石数量
    getQuickFinishNeedGoldByTime: function (lefttime) {
        var gold_num = 0;
        for (var k in Config.shipping_data.data_quick_cost) {
            var config = Config.shipping_data.data_quick_cost[k];
            if (lefttime >= config.min && lefttime <= config.max) {
                gold_num = config.gold;
            }
        }

        return gold_num
    },

    //是否有订单缓存数据
    checkIsHaveOrderData: function () {
        return (Utils.next(this.order_list) != null)
    },

    //是否显示红点(是否有已完成的订单任务)
    checkVoyageRedStatus: function () {
        var is_show_red = false;
        for (var k in this.order_list) {
            var order_vo = this.order_list[k];
            if (order_vo.status == VoyageConst.Order_Status.Finish) {
                is_show_red = true
                break
            }
        }
        return is_show_red
    },

    //远航活动状态
    setActivityStatus: function (status) {
        this.activity_status = status;
    },

    getActivityStatus: function () {
        return this.activity_status || 0;
    },

    //获取是否第一次提示特权
    getFirstFresh: function () {
        return this.is_first_fresh || false
    },

    setFirstFresh: function (status) {
        this.is_first_fresh = status;
    }
});