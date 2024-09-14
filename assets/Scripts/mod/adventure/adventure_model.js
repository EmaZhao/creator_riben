// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-09 14:14:52
// --------------------------------------------------------------------
var AdventureEvent = require("adventure_event");
var AdventureActivityController = require("adventureactivity_controller");
var AdventureActivityConst= require("adventureactivity_const");
var MainSceneController = require("mainscene_controller");
var SceneConst          = require("scene_const");
var RoleController = require("role_controller")

var AdventureModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.room_list = [];     // 所有房间的
        this.base_data = [];     // 当前冒险的基础数据
        this.buff_data = [];     // buff数据
        this.holiday_buff_data = []; // 活动buff数据

        this.form_list = [];     // 当前上阵伙伴信息
        this.select_partner_id = 0;  // 当前选中的伙伴id

        this.red_status = false;

        this.backpack_list = [];
        this.plist = []; //伙伴死亡情况信息
        this.before_room = 0;
        this.plunder_record_list = []; //防御布阵掠夺记录
        this.is_first_record_red = true;
    },

    // ==============================--
    // desc:获取当前上阵伙伴信息
    // @data:
    // @return 
    // ==============================-- 
    updateFormPartner:function(data, partner_id){
        this.form_list = data;
        this.select_partner_id = partner_id;
        // 这里判断一下如果列表为空,则显示一个红点
        this.updateRedStatus(data.length == 0);
        gcore.GlobalEvent.fire(AdventureEvent.UpdateAdventureForm);
    },

    updateRedStatus:function(status){
        this.red_status = status;
        var is_open = AdventureActivityController.getInstance().isOpenActivity(AdventureActivityConst.Ground_Type.adventure);
        if(is_open == false){
            this.red_status = false;
        }
        MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.adventure, {bid: AdventureActivityConst.Red_Type.adventure, status: this.red_status});
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.adventure, this.red_status);
    },

    // 宝箱领取红点
    setAdventureBoxStatus:function(data){
        this.box_status_list = {};
        for(var i in data.list){
            this.box_status_list[data.list[i].id] = data.list[i].status;
        }
        var red_point = false;
        for(var i in data.list){
            if(data.list[i].status == 1){
                red_point = true;
                break;
            }
        }
        this.box_redpoint = red_point;
        gcore.GlobalEvent.fire(AdventureEvent.UpdateAdventureForm);
        var scene_adventure_redpiont = this.getAdventureRedPoint();
        MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.adventure, {bid: AdventureActivityConst.Red_Type.adventure, status: scene_adventure_redpiont});
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.adventure, scene_adventure_redpiont);
    },

    getAdventureBoxStatus:function(id){
        if(this.box_status_list && this.box_status_list[id]){
            return this.box_status_list[id];
        }
        return 0;
    },

    // 冒险红点
    getAdventureRedPoint:function(){
        var status = this.red_status || false;
        var box_status = this.box_redpoint || false;
        return (status || box_status);
    },

    getFormList:function(){
        return this.form_list
    },

    // ==============================--
    // desc:全部伙伴是否都已经死亡
    // @return 
    // ==============================--
    allHeroIsDie:function(){
        var is_die = true;
        for(var i in this.form_list){
            if(this.form_list[i].now_hp != 0){
                is_die = false;
                break;
            }
        }
        return is_die;
    },

    getSelectPartnerID:function(){
        return this.select_partner_id;
    },

    updateSelectPartnerID:function(id){
        this.select_partner_id = id;
        gcore.GlobalEvent.fire(AdventureEvent.UpdateAdventureSelectHero);
    },

    // ==============================--
    // desc:冒险的基础信息,对应协议的20600
    // @data:
    // @return 
    // ==============================--
    setAdventureBaseData:function(data){
        this.base_data = data;
        gcore.GlobalEvent.fire(AdventureEvent.Update_Room_Base_Info);
    },

    getAdventureBaseData:function(){
        return this.base_data;
    },
    
    setBuffData:function(data){
        this.buff_data = data.buff_list;
        this.holiday_buff_data = data.holiday_buff_list;
        gcore.GlobalEvent.fire(AdventureEvent.Update_Buff_Info);
    },

    getBuffData:function(){
        if(this.buff_data && Utils.next(this.buff_data || {}) != null){
            return this.buff_data;
        }
    },

    getHolidayBuffData:function(  ){
        if(this.holiday_buff_data && Utils.next(this.holiday_buff_data || {}) != null){
            return this.holiday_buff_data;
        }
    },

    setRoomList:function(data){
        if(data == null || data.room_list == null)return;
        for(var i in data.room_list){
            this.room_list[data.room_list[i].id] = data.room_list[i];
        }
        gcore.GlobalEvent.fire(AdventureEvent.Update_Room_Info);
    },

    getRoomList:function(){
        if(this.room_list && Utils.next(this.room_list || {}) != null){
            return this.room_list;
        }
    },

    updateRoomList:function(data){
        for(var i in data.room_list){
            var room = this.room_list[data.room_list[i].id];
            if(room){
                room.status = data.room_list[i].status;
                room.lock = data.room_list[i].lock;
                room.evt_id = data.room_list[i].evt_id;
            }
        }
        gcore.GlobalEvent.fire(AdventureEvent.Update_Single_Room_Info,data);
    },

    getRoomInfoByRoomID:function(id){
        if(this.room_list && Utils.next(this.room_list || {}) != null){
            var data = null;
            for(var i in this.room_list){
                if(this.room_list[i].id == id){
                    data = this.room_list[i];
                    break;
                }
            }
            return data;
        }
    },

    getCurIndex:function(reset_num, config){
        var idx = reset_num + 1;
        var free_num = 0;
        var cost_num = 0;
        var vip_lev = RoleController.getInstance().getRoleVo().vip_lev;

        while(config[idx]){
            if(config[idx].cost == 0){
                free_num = free_num + 1;
            }else{
                if(vip_lev >= config[idx].vip){
                    cost_num = cost_num + 1;
                }
            }
            idx = idx + 1;
        }
        return [free_num, cost_num];
    },

});