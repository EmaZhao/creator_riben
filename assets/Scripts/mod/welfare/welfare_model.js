// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-19 10:57:29
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var WelfareConst = require("welfare_const");
var PartnersummonController = require("partnersummon_controller");
var ActionController = require("action_controller");
var VipController = require("vip_controller");

var WelfareModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    initConfig: function () {
        this.daily_award_status = 1//每日礼状态
    },

    //保存下月卡信息
    setYueka: function (data) {
        this.yueka_data = data;
    },

    getYueka: function () {
        return this.yueka_data;
    },

    //保存下今日充值次数
    setRechargeCount: function (count) {
        this.recharge_num = count;
    },

    checkWelfareSubIsOpen: function (id) {
        var config = gdata("holiday_client_data", "data_info", [id]);
        if (config) {
            var role_vo = RoleController.getInstance().getRoleVo();
            if (IS_SHOW_CHARGE || (IS_SHOW_CHARGE == false && config.is_verifyios == 1)) {
                if (role_vo.lev >= config.open_lev) {
                    return true
                }
            }
        }
        return false
    },

    //判断月卡状态
    getYuekaStatus: function () {
        var can_charge = true;
        if (!this.checkWelfareSubIsOpen(WelfareConst.WelfareIcon.yueka)) {
            can_charge = false;
        } else {
            if (this.yueka_data == null) {
                can_charge = true;
            } else {
                var cur_time = gcore.SmartSocket.getTime();
                if (this.yueka_data.card1_end_time && this.yueka_data.card2_end_time) {
                    can_charge = (this.yueka_data.card1_end_time < cur_time) || (this.yueka_data.card2_end_time < cur_time);
                }
            }
        }
        return can_charge
    },

    getRechargeCount: function () {
        return this.recharge_num || 0
    },

    /*[[
        {"钻石召唤", 0}, --常驻类型
        {"月耀召唤", 200},
        {"神圣召唤", 300},
        {"天辉召唤", 400}
    ]]*/

    //逆向排序
    reverseTable: function (tab) {
        // var tmp = {};
        // for (var i = 1; i <= Utils.getArrLen(tab); i++) {
        //     var key = Utils.getArrLen(tab);
        //     // tmp[i] = 
        // }
        return tab.reverse()
    },

    getPartnerSummonData: function () {
        var config = Config.recruit_award_data.data_huoli;
        var list1 = {};
        var list2 = {};
        var list3 = {};
        var list4 = {};
        //本地数据分类
        for (var i in config) {
            var v = config[i];
            if (v.type == 0) {
                list1.push(v);
            } else if (v.type == 200) {
                list2.push(v);
            } else if (v.type == 300) {
                list3.push(v);
            } else if (v.type == 400) {
                list4.push(v)
            }
        }
        //获取开启的卡库
        var list = PartnersummonController.getInstance().getModel().getOpenSummonData();
        //开启的
        var data = [];
        for (var i in list) {
            var v = list[i];
            if (v == 200) {
                for (var k in list2) {
                    data.push(list2[k]);
                }
            } else if (v == 300) {
                for (var k in list3) {
                    data.push(list3[k]);
                }

            } else if (v == 400) {
                for (var k in list4) {
                    data.push(list4[k]);
                }
            }
        }

        data = this.reverseTable(data);
        for (var i in data) {
            list1.push(data[i]);
        }
        list1 = this.reverseTable(list1);
        return list1
    },

    //接收服务端的数据  返回： 服务端的数据，本地配置表的数据
    getServeData: function (data1) {
        var list = [];
        var data2 = this.getPartnerSummonData();
        //抽取出开启的状态
        var open_data = [];
        for (var i in data1) {
            var v = data1[i];
            for (var k in data2) {
                var m = data2[k];
                if (v.id == m.id) {
                    open_data.push(v);
                }
            }
        }

        var model = ActionController.getInstance().getModel();
        open_data = model.getReawardSortList(open_data);
        for (var i in open_data) {
            var v = open_data[i];
            for (var k in data2) {
                var val = data2[k];
                if (v.id == val.id) {
                    list.push(val)
                }
            }
        }
        this.setPartnerWelfarCallRedPoint(open_data);
        return { open_data: open_data, list: list }
    },

    setPartnerWelfarCallRedPoint: function (data) {
        this.callPartnerData = data;
    },

    getPartnerWelfarCallRedPoint: function () {
        if (this.callPartnerData && Utils.next(this.callPartnerData) != null) {
            var bool = false;
            for (var i in this.callPartnerData) {
                var v = this.callPartnerData[i];
                if (v.status == 1) {
                    bool = true;
                    break
                }
            }
            return bool
        }
    },

    //召唤界面是否显示入口
    setPartnerSunmonWelfarData: function (bool) {
        this.summonWelfarBool = bool;
    },

    getPartnerSunmonWelfarData: function () {
        var bool = false;
        if (this.summonWelfarBool == 1) {
            bool = true;
        }
        return bool
    },

    //问卷调查
    setQuestOpenData: function (data) {
        this.questOpenData = data;
    },

    getQuestOpenData: function () {
        return this.questOpenData;
    },

    /*周、月循环礼包
    --[[
    {"周循环", 1}
    {"月循环", 2}
    ]]*/
    setWeekMonthSortData: function () {
        var data = Config.misc_data.data_cycle_gift_info;
        this.weekGiftData = [];
        this.monthGiftData = [];
        for (var i in data) {
            var v = data[i];
            if (v) {
                for (var k in v) {
                    var obj = v[k];
                    if (obj.gift_type == 1) {
                        this.weekGiftData.push(obj);
                    } else if (obj.gift_type == 2) {
                        this.monthGiftData.push(obj);
                    }
                }
            }
        }
        this.weekGiftData.sort(Utils.tableLowerSorter(["charge_id"]));
        this.monthGiftData.sort(Utils.tableLowerSorter(["charge_id"]));
    },

    getWeekMonthSortData: function (index) {
        if (!this.weekGiftData || !this.monthGiftData) return
        if (index == 1) {
            return this.weekGiftData || [];
        } else if (index == 2) {
            return this.monthGiftData || [];
        }
    },

    //每日礼领取状态
    setDailyAwardStatus: function (status) {
        this.daily_award_status = status;
        if (status == 0) {
            VipController.getInstance().setTipsVIPStstus(VIPREDPOINT.DAILY_AWARD, true);
        } else {
            VipController.getInstance().setTipsVIPStstus(VIPREDPOINT.DAILY_AWARD, false);
        }
    },

    getDailyAwardStatus: function () {
        return this.daily_award_status;
    },


    //shrh------
    setShareAward: function (data) {
        this.share_award = data;
    },

    getShareAward: function () {
        return this.share_award || [];
    },

    setShareAwardStatus: function (status) {
        this.share_award_status = status;
    },

    getShareAwardStatus:function(){
        return this.share_award_status || 0;
    },

    setSubscriptionAward: function (data) {
        this.subscription_award = data
    },

    //设置关注奖励领取状态,1是领取了
    setSubscriptionAwardStatus: function (status) {
        this.subscription_award_status = status;
    },

    getSubscriptionAwardStatus:function(){
        return this.subscription_award_status || 0;
    },

    getSubscriptionAward: function () {
        return this.subscription_award || [];
    },

    //shwx-----
    setCollectAward: function (data) {
        this.collect_award = data;
    },

    getCollectAward: function () {
        return this.collect_award || [];
    },

    setCollectAwardStatus: function (status) {
        this.collect_award_status = status;
    },

    getCollectAwardStatus:function(){
        return this.collect_award_status || 0;
    },
});

module.exports = WelfareModel;