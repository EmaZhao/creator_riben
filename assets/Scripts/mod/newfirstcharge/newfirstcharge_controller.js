// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-22 11:01:46
// --------------------------------------------------------------------
var NewfirstchargeController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var NewfirstchargeModel = require("newfirstcharge_model");

        this.model = new NewfirstchargeModel();
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
        this.RegisterProtocal(21012, this.handle21012);
        this.RegisterProtocal(21013, this.handle21013);
        this.RegisterProtocal(21014, this.handle21014);
        this.RegisterProtocal(21015, this.handle21015);
        this.RegisterProtocal(21000, this.handle21000)
        this.RegisterProtocal(21001,this.handle21001)
    },

    openNewFirstChargeView:function(bool){
        if(bool == true){
            var MainuiController = require("mainui_controller")
            var MainuiConst = require("mainui_const")
            let first_icon = MainuiController.getInstance().getFunctionIconById(MainuiConst.icon.first_charge_new1)
            if(first_icon){
                if(!this.new_first_charge_window){
                    this.new_first_charge_window = Utils.createClass("newfirstcharge1_window",this);
                }
            }
            let first_icon1 = MainuiController.getInstance().getFunctionIconById(MainuiConst.icon.first_charge_new)
            if(first_icon1){
                if(!this.new_first_charge_window){
                    this.new_first_charge_window = Utils.createClass("newfirstcharge_window",this);
                }
            }
            if(!this.new_first_charge_window) return
            var RoleController = require("role_controller");
            var role_vo = RoleController.getInstance().getRoleVo();
            var index = 1;
            if(role_vo.vip_exp!=0){
                index = 2;
            }
            if(this.new_first_get_data){
                // 首充是否可以领取
                var first_status = false;
                for(var i = 1;i<=3;i++){
                    if(this.new_first_get_data[i-1] && this.new_first_get_data[i-1].status == 1){
                        first_status = true;
                        index = 1;
                        break;
                    }
                }
                // 累充是否可以领取
                var total_status = false;
                for(var i = 4;i<=6;i++){
                    if(this.new_first_get_data[i-1] && this.new_first_get_data[i-1].status == 1){
                        total_status = true
                        index = 2;
                        break;
                    }
                }
                if(first_status == true && total_status == true){
                    index = 1;
                }
            }
            this.new_first_charge_window.open(index);
        }else{
            if(this.new_first_charge_window){
                this.new_first_charge_window.close();
                this.new_first_charge_window = null;
            }
        }
    },

    //  信息
    sender21012:function(){
        this.SendProtocal(21012,{});
    },

    handle21012:function(data){
        this.new_first_get_data = data.first_gift; //首充是否可领取的数据
        this.model.setFirstBtnStatus(data.first_gift);
        var NewFirstChargeEvent = require("newfirstcharge_event");
        gcore.GlobalEvent.fire(NewFirstChargeEvent.New_First_Charge_Event, data);
    },

    // 领取
    sender21013:function(id){
        var proto = {}
        proto.id = id
        this.SendProtocal(21013,proto)
    },

    handle21013:function(data){
        message(data.msg);
    },
    
    // 自选英雄
    sender21014:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(21014,proto);
    },

    handle21014:function(data){
        message(data.msg)
    },
    //  每日礼包红点
    handle21015:function( data ){
        if(data.open_id && Utils.next(data.open_id)!=null){
            // WelfareController.getInstance().getModel().updateDailyGiftRedStatus(true)
        }
    },
    //新版首充礼包信息
    sender21000(){
        this.SendProtocal(21000, {})
    },
    handle21000(data){
        this.new_first_get_data = data.first_gift //--首充是否可领取的数据
        this.model.setFirstBtnNewStatus(data.first_gift)
        var NewFirstChargeEvent = require("newfirstcharge_event");
        gcore.GlobalEvent.fire(NewFirstChargeEvent.New_First_Charge_Event,data)
    },
    //--领取新版首冲礼包
    sender21001(id){
        let protocal = {}
        protocal.id = id
        this.SendProtocal(21001, protocal)
    },
    handle21001(data){
        message(data.msg)
    },
    getNewFirstChargeView(){
        return this.new_first_charge_window
    },
    __delete:function(){
        // if(this.model != null){
        //     this.model.DeleteMe();
        //     this.model = null;
        // }
    }

});

module.exports = NewfirstchargeController;