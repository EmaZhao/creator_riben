// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-07-02 16:51:49
// --------------------------------------------------------------------
var BattleDramaController = require("battle_drama_controller");
var MainuiController = require("mainui_controller");
var MainUiConst = require("mainui_const");

var RecruitheroModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.day_first_login = true;
    },

    setDayFirstLogin:function(status){
        this.day_first_login = status;
    },

    //获取当前通关的最大关卡
    getDramaDunMaxID:function(){
        var dun_id = 1;
        var drame_controller = BattleDramaController.getInstance();
        var drama_data = drame_controller.getModel().getDramaData();
        if(drama_data && drama_data.max_dun_id){
            var current_dun = gdata("dungeon_data", "data_drama_dungeon_info", drama_data.max_dun_id);
            if(current_dun){
                dun_id = current_dun.floor || 1;
            }
        }
        return dun_id;
    },
    
    // 结束时间
    setRecruitEndTime:function(end_time){
        var time = end_time - gcore.SmartSocket.getTime();
        if(time <= 0){
            this.recruit_status = false;
        }else{
            this.recruit_status = true;
        }
    },

    getRecruitEndTime:function(){
        if(this.recruit_status){
            return this.recruit_status;    
        }
        return false;
    },

    setRecruitBaseData:function(data){
        this.recruit_data = [];
        if(data.quests){
            for(var i in data.quests){
                this.recruit_data[data.quests[i].id] = data.quests[i];
            }
        }
    },

    getRecruitBaseData:function(id){
        if(this.recruit_data[id]){
            return this.recruit_data[id];    
        }
        return null;
    },

    // 计算红点
    setStatusRedPoint:function(data){
        if(!data)return;
        var info = Config.function_data.data_info[MainUiConst.icon.limit_recruit]
        var bool = MainuiController.getInstance().checkIsOpenByActivate(info.activate);
        if(bool == false)return;
        var cur_status = this.day_first_login;
        if(!cur_status){
            var status = false;
            if(data.quests){
                for(var i in data.quests){
                    if(data.quests[i].status == 1){
                        status = true;
                        break;
                    }
                }
            }
            cur_status = status;
        }

        if(!cur_status){
            var all_get_status = false;
            if(data.state && data.state == 1){
                all_get_status = true;
            }
            cur_status = all_get_status;
        }
        

        MainuiController.getInstance().setFunctionTipsStatus(MainUiConst.icon.limit_recruit, cur_status)
    },
});