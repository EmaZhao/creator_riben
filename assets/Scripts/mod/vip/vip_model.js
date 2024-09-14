// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-02-26 21:07:32
// --------------------------------------------------------------------
var VipEvent = require("vip_event");

var VipModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.get_list = {};
        this.daily_gift = {};
        this.privilege_list = {};
    },

    //vip礼包信息
    setGetGiftList:function(list){
        if(list && Utils.getArrLen(list) > 0){
            for(var k in list){
                var v = list[k];
                this.get_list[v.lev] = v.lev;
            }
        }
        gcore.GlobalEvent.fire(VipEvent.UPDATE_GET_LIST);
    },

    getGetGiftList:function(){
        return this.get_list || {};
    },

    //累充信息
    setAccList:function(list){
        this.acc_list = list;
    },

    getAccList:function(){
        return this.acc_list
    },

    checkGiftList:function(vip_lev){
        for(var i in this.get_list){
            var v = this.get_list[i];
            if(v==vip_lev){
                return true
            }
        }
        return false
    },

    getGiftListVip:function(){
        var vip_lev = 1;
        var list = [];
        if(Config.vip_data.data_vip_icon){
            for (var i in Config.vip_data.data_vip_icon){
                var v = gdata("vip_data","data_vip_icon",[i]);
                list.push(v);
            }
        }
        list.sort(Utils.tableLowerSorter(["vip_lev"]));
        for(var i in list){
            var v = list[i];
            var is_get = this.checkGiftList(v.vip_lev);
            if(!is_get){
                vip_lev = v.vip_lev;
                break
            }
        }
        return vip_lev
    },

    //是否有未领取累充礼包
    getIsGetAcc:function(){
        if(this.acc_lsit && Utils.next(this.acc_list)!= null){
            var index = 0;
            for (var k in this.acc_list){
                var v = this.acc_list[k];
                if(v.status == 1){  //可领取
                    return true
                }else if (v.status == 0 || v.status == 2){  //未达成/已领取
                    index = index + 1;
                }
            }
            if(index == Utils.getArrLen(this.acc_list)){
                return false
            }
        }
        return false
    },

    //每日礼包数据
    setDailyGiftData:function(data){
        this.daily_gift = data || {};
    },

    //获取每日礼包已购数量
    getDailyGiftBuyCountById:function(id){
        var count = 0;
        for(var k in this.daily_gift){
            var v = this.daily_gift[k]
            if(v.id == id){
                count = v.count;
                break
            }
        }
        return count
    },

    //特权礼包数据
    setPrivilegeList:function(data){
        this.privilege_list = data || {};
    },

    //获取特权礼包数据
    getPrivilegeDataById:function(id){
        for (var k in this.privilege_list){
            if(this.privilege_list[k].id == id){
                return this.privilege_list[k]
            }
        }
    },

    //获取特权礼包红点
    getPrivilegeRedStatus:function(){
        var privelege_red = false;
        //登陆时未购买过vip特权礼包的需要显示红点
        if(!this.privilege_flag){
            privelege_red = true;
            for(var k in this.privilege_list){
                if(this.privilege_list[k].status == 1){
                    privelege_red = false;
                    break
                }
            }
        }
        return privelege_red
    },

    //记录打开过vip特权礼包界面
    setPrivilegeOpenFlag:function(flag){
        this.privilege_flag = flag;
    },

    //月卡领取
    setMonthCard:function(status){
        this.monthCard = status
    },

    getMonthCard:function(){
        var status = false;
        this.monthCard = this.monthCard || 0;
        if(this.monthCard == 1){
            status = true;
        }else{
            status = false
        }
        return status
    },

    //赠送Vip数据
    setGiveVipInfo:function(data){
        this.giveVipInfo = data;
    },

    //获取赠送Vip数据
    getGiveVipInfo:function(){
        return this.giveVipInfo;
    },

    //赠送Vip的状态
    setGiveVipStatus(){
        var vipGiveInfo = this.getGiveVipInfo();
        var status = false;
        if(vipGiveInfo){
            var refresh = vipGiveInfo.time -gcore.SmartSocket.getTime();
            if(vipGiveInfo.state == 0 && refresh<=0){
                status = true;
            }
        }
        this.giveVipRedStatus = status;
        var MainuiController    = require("mainui_controller");
        var MainuiConst = require("mainui_const");
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.give_vip, status)
    },

    getGiveVipStatus(){
        if(this.giveVipRedStatus == null)return false;
        return this.giveVipRedStatus;
    },

});