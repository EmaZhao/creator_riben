// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-04 21:12:18
// --------------------------------------------------------------------
var Endless_trailEvent = require("endless_trail_event");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");


var Endless_trailModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.role_rank_list = {}
        this.first_item_list = [];
        this.five_item_list = [];
        this.rank_item_list = [];
        this.endless_data = {}
        this.first_data = {}
        this.send_partner = {}
        this.hire_partner_list = {}
        this.has_hire_partner_list = {} //已雇佣的
        this.is_first_get = false
        this.is_award_get = false
        this.is_send_partner = false
        this.endless_battle_data = null;
        // this.getFirstKindList()
        // this.getFiveKindList()
        // this.getRankKindList()
    },

    // 设置无尽试炼基础信息
    setEndlessData:function(data){
        if(data){
            this.endless_data = data;
            this.updateRedPoint();
            gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_BASE_DATA,data);
        }
    },

    // 获取无尽试炼基础信息
    getEndlessData:function(){
        if(this.endless_data && Utils.next(this.endless_data || {}) != null){
            return  this.endless_data;
        }
    },

    // 设置首通奖励展示
    setFirstData:function(data){
        if(data){
            this.first_data = data;
            this.updateRedPoint();
            gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_FIRST_DATA,data);
        }
    },

    // 获取首通奖励
    getFirstData:function(){
        if(this.first_data && Utils.next(this.first_data || {}) !=null){
            return this.first_data;
        }
    },

    // 已派遣的伙伴信息
    setSendPartnerData:function(data){
        this.send_partner = data; 
        gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_SENDPARTNER_DATA,data);
        this.updateRedPoint();
    },

    getSendPartnerData:function(){
        if(this.send_partner && Utils.next(this.send_partner || {}) != null){
            return this.send_partner;
        }
    },

    // 可雇佣伙伴的信息
    setHirePartnerData:function(data){
        this.hire_partner_list = data;
        gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_HIREPARNER_DATA,data);
    },

    getHirePartnerData:function(){
        if(this.hire_partner_list && Utils.next(this.hire_partner_list || {}) != null){
            return this.hire_partner_list;
        }
    },

    // 已雇佣的伙伴列表
    setHasHirePartnerData:function(data){
        this.has_hire_partner_list = data;
        gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_HASHIREPARNER_DATA,data);
    },


    getHasHirePartnerData:function(){
        if(this.has_hire_partner_list && Utils.next(this.has_hire_partner_list || {}) != null){
            return this.has_hire_partner_list;
        }
    },

    setEndlessBattleData:function(data){
        this.endless_battle_data = data;
        gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_ENDLESSBATTLE_DATA,data);
    },

    getEndlessBattleData:function(){
        if(this.endless_battle_data){
            return this.endless_battle_data;
        }
    },

    // 获取前三个
    getRaknRoleTopThreeList:function(){
        var list = [{rank: 1, name: Utils.TI18N("虚位以待")}, {rank: 2, name: Utils.TI18N("虚位以待")}, {rank: 3, name: Utils.TI18N("虚位以待")}]
        if(this.endless_data.rank_list && Utils.next(this.endless_data.rank_list || {}) != null){
            var rank_list = this.endless_data.rank_list;
            for(var i in rank_list){
                for(var j in list){
                    if(rank_list[i].idx == list[j].rank){
                        list[j] = rank_list[i];
                    }
                }

            }
        }
        return list;
    },

    // 获取首通奖励种类
    getFirstKindList:function(){
        if(Utils.next(this.first_item_list || []) ==null){
            if(Config.endless_data.data_first_data){
                var temp_id = 0;
                for(var i in Config.endless_data.data_first_data){
                    var items = Config.endless_data.data_first_data[i].items;
                    for(var j in items){
                        var bid = items[j][0];
                        if(!this.is_include(bid,this.first_item_list)){
                            this.first_item_list.push({bid: bid,num:1});
                        }
                    }
                }
            }
        }
    },

    getFirstList:function(){
        if(this.first_item_list){
            return this.first_item_list;
        }
    },

    // 获取5次的奖励
    getFiveKindList:function(){
        if(Utils.next(this.five_item_list || []) == null){
            if(Config.endless_data.data_floor_data){
                var temp_id = 0;
                for(var i in Config.endless_data.data_floor_data){
                    var items = Config.endless_data.data_floor_data[i].items;
                    for(var j in items){
                        var bid = items[j][0];
                        if(!this.is_include(bid, this.five_item_list)){
                            this.five_item_list.push({bid: bid,num:1});
                        }
                    }
                }
            }
        }
    },

    getFiveList:function(){
        if(this.five_item_list){
            return this.five_item_list;
        }
    },

    // 排行种类获取
    getRankKindList:function(){
        if(Utils.next(this.rank_item_list || []) == null){
            if(Config.endless_data.data_rank_reward_data){
                var temp_id = 0;
                for(var i in Config.endless_data.data_rank_reward_data){
                    var items = Config.endless_data.data_rank_reward_data[i].items;
                    for(var j in items){
                        var bid = items[j][0];
                        if(!this.is_include(bid, this.rank_item_list)){
                            this.rank_item_list.push({bid: bid,num:1});
                        }
                    }
                }
            }
        }
    },

    updateRedPoint: function() {
        RedMgr.getInstance().addCalHandler(this.checkRedPoint.bind(this), RedIds.Endless);
    },

    // 红点判断
    checkRedPoint:function(){
        var is_open = MainuiController.getInstance().checkMainFunctionOpenStatus(MainuiConst.new_btn_index.esecsice, MainuiConst.function_type.main, true)
        if(is_open == null)return;
        // 先判断首通奖励是否领取
        if(this.first_data){
            if(this.first_data.status == 1){
                this.is_first_get = true;
            }else{
                this.is_first_get = false
            }
            gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_REDPOINT_FIRST_DATA,this.is_first_get);
        }
        // 再判断是否已获所有日常奖励结算
        if(this.endless_data){
            if(this.endless_data.is_reward != 1){
                this.is_award_get = true;
            }else{
                this.is_award_get = false;
            }
            gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_REDPOINT_REWARD_DATA,this.is_award_get);
        }
        // 再判断是否已上阵
        if(this.endless_data){
            if(this.endless_data.is_appoint == 0 && this.send_partner && Utils.next(this.send_partner.list || {}) == null){//没派出
                this.is_send_partner = true;
            }else{
                this.is_send_partner = false;
            }
        }

        var is_show_red = this.is_first_get || this.is_award_get || this.is_send_partner;
        // 设置入口红点
        gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_REDPOINT_SENDPARTNER_DATA,this.is_send_partner);
        gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_ESECSICE_ENDLESS_REDPOINT);

        //var SceneConst = require("scene_const");
        //MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.esecsice, {bid:SceneConst.RedPointType.endless, status:is_show_red})
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.endless, is_show_red);
    },

    // 获取首通红点状态
    getFirstGet:function(){
        return this.is_first_get;
    },

    // 获取是否已经派遣伙伴
    getIsSendPartner:function(){
        return this.is_send_partner;
    },

    // 获取是否已获所有日常奖励结算
    getIsGetAllReward:function(  ){
        return this.is_award_get;    
    },

    checkRedStatus:function(){
        return this.is_first_get || this.is_send_partner || this.is_award_get;
    },

    // -- --根据当前通关获取临近的可以领取奖励
    // -- function Endless_trailModel:getNearFirstRewardByID(id)
    // --     if Config.EndlessData.data_first_data then
    // --         for i, v in ipairs(Config.EndlessData.data_first_data) do
    // --             if id == v.id then
    // --                 return v
    // --             end 
    // --         end
    // --     end
    // -- end


    getRankList:function(){
        if(this.rank_item_list){
            return this.rank_item_list;
        }
    },

    is_include:function(value, list){
        for(var i in list){
            if(list[i].bid == value){
                return true 
            }
        }
        return false
    }


});