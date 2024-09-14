// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-07 15:18:54
// --------------------------------------------------------------------
var MainuiController = require("mainui_controller")
var MainuiConst = require("mainui_const");
var EsecsiceModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {

        //红点状态信息
		this.esecsice_main_rp_status = {};
		//红点基础数据信息
		this.esecsice_main_rp_data = {};
    },

    setEsecsiceMainRedPointData(bid,data){
        var hasred = false;
        this.esecsice_main_rp_data[bid] = data;
        if(typeof(data) == "boolean")
        {
            this.esecsice_main_rp_status[bid] = data;
        }
        for(var item in this.esecsice_main_rp_status){
			if(this.esecsice_main_rp_status[item] == true){
				hasred = true;
			}
		}
        MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.esecsice, hasred);
		gcore.GlobalEvent.fire(require("esecsice_const").Esecsice_Main_RedPoint_Event);
    },
    getEsecsiceMainRedPointData(){
        return this.esecsice_main_rp_status;
    }

});
