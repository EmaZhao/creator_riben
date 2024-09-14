// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: {DATE}
// --------------------------------------------------------------------
var PartnersummonEvent = require("partnersummon_event");
var PartnersummonConst = require("partnersummon_const");

var PartnersummonModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
        recruit_list: null,         // 卡库的数据
        recruit_data: null,         // 召唤结果
        had_open_view: false,
    },

    initConfig: function () {
      this.is_show_red = false;
    },

    setSummonData: function(summon_data) {
        if (!summon_data) return;
        this.recruit_list = summon_data.recruit_list;
        this.setShareData(summon_data);
        this.updateRecruitData();

        this.updateRedPoint();
    },

    // 更新免费召唤次数、下次免费时间
    updateSummonData: function(update_data) {
        if (!update_data) return;
        if (!this.recruit_list) return; 
        for (var recruit_i in this.recruit_list) {
            var recruit_info = this.recruit_list[recruit_i];
            if (recruit_info.group_id === update_data.group_id && recruit_info.draw_list) {
                for (var draw_i in recruit_info.draw_list) {
                    var draw_info = recruit_info.draw_list[draw_i];
                    if (draw_info.times === 1 && draw_info.kv_list) {
                        for (var kv_i in draw_info.kv_list) {
                            var kv_info = draw_info.kv_list[kv_i];
                            if (kv_info.key == PartnersummonConst.Recruit_Key.Free_Count)
                                kv_info.val = update_data.free_times;
                            if (kv_info.key == PartnersummonConst.Recruit_Key.Free_Time)
                                kv_info.val = update_data.free_cd_end;
                        }
                    }
                }
            }
        }
        this.updateRedPoint();
        gcore.GlobalEvent.fire(PartnersummonEvent.UpdateSummonDataEvent, update_data);
    },

    setRecruitData: function(recruit_data) {
        this.recruit_data = recruit_data
    },

    getRecruitData: function() {
        return this.recruit_data
    },

    setShareData: function(data) {

    },

    updateRecruitData: function(data_list) {

    },

    // 更新某个卡库的CD时间、次数等数据
    updateExtendData: function() {

    },

    // 获取卡库数据
    getSummonGroupData: function() {
        var group_data = []
        var recruit_config = Config.recruit_data.data_partnersummon_data;

        var group_item = null;
        var recruit_config_info = null;
        var group_id = null;
        for (var recruit_i in recruit_config) {
            recruit_config_info = recruit_config[recruit_i];
            if (recruit_config_info.is_show === 0) {            
                group_id = recruit_config_info.group_id;
                var recruit_data = this.getSummonProtoDataByGroupID(group_id);
                group_item = {};
                group_item.config_data = recruit_config[recruit_i];
                group_item.recruit_data = recruit_data;
                group_item.group_id = recruit_config_info.group_id;
                group_data.push(group_item);
            }
        }

        // 排序
        function sortById(pro) {
            return function(obj1, obj2) {
                var c_val1 = obj1.config_data[pro];
                var c_val2 = obj2.config_data[pro];
                if (c_val1 < c_val2) {
                    return -1;
                } else {
                    return 1
                }
                return 0;
            }
        }

        var summon_group_data = group_data.sort(sortById("sort_id"));
        return summon_group_data
    },

    getSummonProtoDataByGroupID: function(group_id) {
        if (!group_id || !this.recruit_list) return;
        var recruit_data = null;
        for (var recruit_i in this.recruit_list) {
            recruit_data = this.recruit_list[recruit_i];
            if (recruit_data.group_id === group_id) {
                return recruit_data
            }
        }
        return null
    },

    getScoreSummonNeedCount: function() {
        var count = 0;
        var score_recruit_info = Config.recruit_data.data_partnersummon_data[PartnersummonConst.Summon_Type.Score];
        if (score_recruit_info.exchange_once && score_recruit_info.exchange_once[0]) {
            count = score_recruit_info.exchange_once[0][1];
        }
        return count
    },

    // 更新红点状态
    updateMainSceneRedPoint: function() {
        var MainSceneController = require("mainscene_controller");
        var SceneConst = require("scene_const");
        // 是否有免费
        var is_show_red = false;
        for (var recruit_i in this.recruit_list) {
            var group_data = this.recruit_list[recruit_i];
            if (group_data.draw_list) {
                for (var draw_i in group_data.draw_list) {
                    var draw_data = group_data.draw_list[draw_i];
                    if (draw_data.kv_list) {
                        for (var time_i in draw_data.kv_list) {
                            var time_info = draw_data.kv_list[time_i];
                            if (time_info.key == PartnersummonConst.Recruit_Key.Free_Count && time_info.val > 0) {
                                is_show_red = true;
                            }
                        }
                    }
                }
            }
        }

        // 如果没有免费切没有从打开过界面企鹅道具数量充足则提示红点
        if (!is_show_red && !this.had_open_view) {
            var BackpackController = require("backpack_controller");
            var normal_item_num = BackpackController.getInstance().getModel().getItemNumByBid(PartnersummonConst.Normal_Id);
            var advanced_item_num = BackpackController.getInstance().getModel().getItemNumByBid(PartnersummonConst.Advanced_Id);            
            if (normal_item_num > 0 || advanced_item_num > 0)
                is_show_red = true;
        }

        this.is_show_red = is_show_red;

        MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.summon, is_show_red);
    },


    setOpenPartnerSummonFlag: function(status) {
        this.had_open_view = status;
        this.updateRedPoint()    
    },

    updateRedPoint: function() {
        RedMgr.getInstance().addCalHandler(this.updateMainSceneRedPoint.bind(this), RedIds.PartnerSummon);
    },
    //快速点击间隔
    clickIntervalStatus(status){
        this.updateTime = status
    },
    getClickStatus(){
        return this.updateTime
    },

    getIsShowRed:function(){
      return this.is_show_red;
    }
});