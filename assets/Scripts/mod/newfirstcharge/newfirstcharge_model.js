// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-22 11:01:46
// --------------------------------------------------------------------
var NewfirstchargeModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
    },

    // 充值的状态
    setFirstBtnStatus:function(data){
        if(data && Utils.next(data)){
            this.newFirstBtnStatus = [];
            for(var i in data){
                this.newFirstBtnStatus[data[i].id] = data[i].status;
            }
            var status = false;
            for(var i in data){
                if(data[i].status == 1){
                    status = true;
                    break;
                }
            }
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.first_charge_new, status)
        }
    },

    getFirstBtnStatus:function(index){
        if(!this.newFirstBtnStatus)return 0;
        return this.newFirstBtnStatus[index] || 0;
    },

    // 首充与累充的奖励
    setFirstRechargeData:function(){
        var data = Config.charge_data.data_new_first_charge_data;
        this.firstRewardData1 = []; // 6
        this.firstRewardData2 = []; // 100
        for(var i in data){
            if(data[i].fid == 1){
                this.firstRewardData1.push(data[i]);
            }else if(data[i].fid == 2){
                this.firstRewardData2.push(data[i]);
            }
        }
        
        this.firstRewardData1.sort(function(a,b){
            return a.id - b.id;
        });

        this.firstRewardData2.sort(function(a,b){
            return a.id - b.id;
        });
    },

    getFirstRechargeData:function(index){
        if(!this.firstRewardData1 || !this.firstRewardData2)return [];
        if(index == 1){
            return this.firstRewardData1;
        }else if(index == 2){
            return this.firstRewardData2;
        }
    },
    //新版充值的状态
    setFirstBtnNewStatus(data){
        if(data && Utils.next(data)){
            this.newFirstBtnStatus = {}
            for(let i=0;i<data.length;++i){
                let v = data[i]
                this.newFirstBtnStatus[v.id] = v.status
            }
            let status = false
            for(let i=0;i<data.length;++i){
                let v = data[i]
                if(v.status == 1){
                    status = true
                    break
                }
            }
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.first_charge_new1, status)
        }
    },
    // 新版首充与累充的奖励
    setFirstRechargeNewData(){
        let data = Config.charge_data.data_first_charge_data
        this.firstRewardData1 = [] //-- 6
        this.firstRewardData2 = [] //-- 100
        for(let i in data){
            let v = data[i]
            if(v.fid == 1){
                this.firstRewardData1.push(v)
            }else if(v.fid == 2){
                this.firstRewardData2.push(v)
            }
        }
        this.firstRewardData1.sort(function(a,b){
            return a.id - b.id;
        });

        this.firstRewardData2.sort(function(a,b){
            return a.id - b.id;
        });
    },
    __delete:function(){

    },

});