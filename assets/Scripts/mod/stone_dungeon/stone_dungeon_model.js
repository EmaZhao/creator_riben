// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-08 11:59:10
// --------------------------------------------------------------------
var MainuiController    = require("mainui_controller");

var Stone_dungeonModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.change_count = {};
        this.passClearanceId = {};
    },

    properties: {
    },

    initConfig: function () {
    },

    // 通关的副本ID
    setPassClearanceID:function(data){
        if(data && Utils.next(data)!=null){
            for(var i in data){
                this.passClearanceId[data[i].id] = {status: 1};
            }
        }
    },

    getPassClearanceID:function(id){
        if(!this.passClearanceId)return null;
        return this.passClearanceId[id];
    },

    // 今天已挑战/扫荡次数
    setChangeSweepCount:function(data){
        if(data && Utils.next(data)!=null){
            for(var i in data){
                this.change_count[data[i].type] = data[i].day_num;
            }
        }
        this.updateRedPoint();
    },

    getChangeSweepCount:function(_type){
        if(!this.change_count) return 2;
        if(this.change_count[_type]!=null){
            return this.change_count[_type];
        }
        return 2;
    },

    updateRedPoint: function() {
        RedMgr.getInstance().addCalHandler(this.checkRed.bind(this), RedIds.StoneDungeon);
    },

    checkRed:function(){
        var status = this.checkRedStatus();
        // var MainuiConst = require("mainui_const");
        // var SceneConst = require("scene_const");
        // MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.esecsice, {bid:SceneConst.RedPointType.dungeonstone, status:status}) 
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.stonedungeon, status);
    },
    // ==============================
    // desc:宝石副本红点
    // time:2018-09-11 12:45:33
    // @return 
    // ==============================
    checkRedStatus:function(){
        var type_open = Config.dungeon_stone_data.data_type_open;
        if(type_open && type_open[1] && type_open[1].activate){
            var bool = MainuiController.getInstance().checkIsOpenByActivate(type_open[1].activate);
            if(bool == false)return false;
            if(!this.change_count)return;
            var length = Config.dungeon_stone_data.data_type_open_length;
            for(var i = 1;i<=length;i++){
                var bool = MainuiController.getInstance().checkIsOpenByActivate(type_open[i].activate) || false;
                var count = this.change_count[i] || 0;
                if(count < 2 && bool == true){
                    return true;
                }
            }
            return false;
        }
        return false;
    },
});
