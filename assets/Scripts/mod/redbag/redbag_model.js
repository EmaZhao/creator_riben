// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-02-13 11:19:47
// --------------------------------------------------------------------
var RedbagEvent = require("redbag_event");
var GuildController = require("guild_controller");
var MainuiConst = require("mainui_const");
var MainuiController = require("mainui_controller");
var BackpackController = require("backpack_controller");
var GuildConst = require("guild_const");
var GuildEvent = require("guild_event");

var RedbagModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = require("redbag_controller").getInstance();
    },

    properties: {
    },

    initConfig: function () {
        this.redbag_list = {};
        this.redbag_num = 0;
        this.redbag_send_num = 0;
        this.redbag_rec_num = 0;
        this.is_get_redbag = 0;
        this.red_bag_item_num = [];
        this.all_red_show = false;
    },

    resetData: function () {
        this.initConfig();
    },

    updateData: function (data) {
        if (!data)
            return
        if (data.type && data.type == 0) {
            this.redbag_list = {};
        }
        var list = data.list || {};
        for (var i in list) {
            var v = list[i];
            v.order = 0 - v.time;
            if (v.flag == 0 && v.num < v.max_num && v.time - gcore.SmartSocket.getTime() >= 0) {
                v.order = gcore.SmartSocket.getTime() - v.time;
            }
            this.redbag_list[v.id] = v;
        }
        gcore.GlobalEvent.fire(RedbagEvent.Get_Data_Event, data);

        if (this.is_get_redbag != 0) {
            this.checkRedBagRedPoint();
        } else {
            GuildController.getInstance().SendProtocal(13523, {});
        }
        this.is_get_redbag = 0;
    },

    updateRedBagNum: function (send_num, rec_num) {
        this.redbag_send_num = send_num || 0;
        this.redbag_rec_num = rec_num || 0;
        this.is_get_redbag = 1;
        var max_rec_num = gdata("guild_data", "data_const", "red_packet_get").val;
        if (this.redbag_rec_num >= max_rec_num) {
            this.is_get_redbag = 2;
        }
        this.checkRedBagRedPoint();
    },

    checkRedBagRedPoint: function () {
        //判断有没有没领取的红包，有就抛事件推送
        var vo;
        this.is_have_red = false;
        this.all_red_show = false;
        this.redbag_num = 0;
        for (var i in this.redbag_list) {
            this.redbag_num = this.redbag_num + 1;
            var v = this.redbag_list[i];
            //没过期也没被领完的
            if (v.num < v.max_num) {
                if (v.time - gcore.SmartSocket.getTime() >= 0) {
                    if (v.flag == 0) {
                        vo = v;
                        this.is_have_red = true;
                        this.all_red_show = true;
                        break
                    }
                }
            }
        }
        if (this.is_get_redbag == 2) {
            vo = null;
            this.is_have_red = false;
            this.all_red_show = false;
        }

        this.checkItemNumRedPoint();
        if (this.red_bag_item_num && Utils.next(this.red_bag_item_num || {}) != null) {
            for (var i in this.red_bag_item_num) {
                var v = this.red_bag_item_num[i];
                if (v.status == true) {
                    this.all_red_show = true;
                    break
                }
            }
        }

        //抛去主界面播特效
        gcore.GlobalEvent.fire(RedbagEvent.Can_Get_Red_Bag, vo);
        //抛去公会界面红点
        gcore.GlobalEvent.fire(GuildEvent.UpdateGuildRedStatus, GuildConst.red_index.red_bag, this.all_red_show);
        //更新场景红点
        var base_data = Config.function_data.data_base;
        var bool = MainuiController.getInstance().checkIsOpenByActivate(base_data[6].activate);
        if (bool == true)
            MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.guild, { bid: GuildConst.red_index.red_bag, status: this.all_red_show });
    },

    //主要红包道具的数量判断
    checkItemNumRedPoint: function () {
        if (Config.guild_data.data_guild_red_bag) {
            this.red_bag_item_num = [];
            for (var i in Config.guild_data.data_guild_red_bag) {
                var v = gdata("guild_data", "data_guild_red_bag", [i]);
                if (v && v.loss_item && v.loss_item[0]) {
                    var has_num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(v.loss_item[0][0])
                    var status = false;
                    if (has_num >= v.loss_item[0][1]) {
                        status = true;
                    }
                    this.red_bag_item_num.push({ id: v.id, status: status, bid: v.loss_item[0][0] })
                }
            }
        }
    },

    getRedBagNum: function () {
        return this.redbag_num || 0;
    },

    getIsHaveRedBag: function () {
        return this.is_have_red || false;
    },

    getAllRedBagStatus: function () {
        return this.all_red_show || false;
    },

    //每次打开获取拥有红包道具的的最少来ID来默认打开那个界面
    getHaveItemID: function () {
        if (this.red_bag_item_num && Utils.next(this.red_bag_item_num || {} != null)) {
            var temp_id = 99;
            for (var i in this.red_bag_item_num) {
                var v = this.red_bag_item_num[i];
                if (v.status == true && v.id <= temp_id) {
                    temp_id = v.id;
                }
            }
            return temp_id
        }
    },

    getSendRedBagStatue: function (id) {
        var status = false;
        if (this.red_bag_item_num && Utils.next(this.red_bag_item_num || {}) != null) {
            for (var i in this.red_bag_item_num) {
                var v = this.red_bag_item_num[i];
                if (id) {
                    if (v.id != id) {
                        if (v.status == true) {
                            status = true;
                            break
                        }
                    }
                } else {
                    if (v.status == true) {
                        status = true;
                        break
                    }
                }
            }
        }
        return status
    },

    getRebBagItemNumList: function () {
        if (this.red_bag_item_num && Utils.next(this.red_bag_item_num || {}) != null) {
            return this.red_bag_item_num;
        }
    },

    getRedBagList: function () {
        var redbag_list = [];
        for (var k in this.redbag_list) {
            var v = this.redbag_list[k];
            redbag_list.push(v);
        }
        return redbag_list;
    },

    getRedBagListById: function (id) {
        return this.redbag_list[id];
    }
});