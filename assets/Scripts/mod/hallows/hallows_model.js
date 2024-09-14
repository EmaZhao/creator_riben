// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-02-18 14:15:05
// --------------------------------------------------------------------
var HallowsVo = require("hallows_vo");
var MainuiController = require("mainui_controller");
var HeroController = require("hero_controller");
var RoleController = require("role_controller");
var BackpackController = require("backpack_controller");
var HallowsEvent = require("hallows_event");
var HallowsConst = require("hallows_const");
var MainuiConst = require("mainui_const");
var HeroConst = require("hero_const");

var HallowsModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = require("hallows_controller").getInstance();
        this.initConfig();
    },

    properties: {
    },

    initConfig: function () {
        this.hallows_list = [];

        this.open_flag = false;  // 该玩家是否打开过神器界面
        this.had_request = false;
        this.attr_ratio_list = [];
    
        this.hallows_red_list = []; // 红点数据
    },

    //更新圣器数据
    updateHallowsInfo:function(data){
        if(!data)return;
        for(var i in data.hallows){
            var hallows_vo = this.hallows_list[data.hallows[i].id];
            if(!hallows_vo){
                hallows_vo = new HallowsVo();
                this.hallows_list[data.hallows[i].id] = hallows_vo;
            }
            hallows_vo.initAttributeData(data.hallows[i]);
        }
        //计算神器红点
        this.updateRedPoint()
    },

    //新增或者更新一个圣器
    updateHallowsData:function(data){
        var hallows_vo = this.getHallowsById(data.id);
        if(!hallows_vo){
            hallows_vo = new HallowsVo();
            this.hallows_list[data.id] = hallows_vo ;
        }
        hallows_vo.initAttributeData(data);
        // 计算神器红点
        this.updateRedPoint()
    },

    //监测红点
    updateHallowsRedStatus:function( bid, status ){
        var _status = this.hallows_red_list[bid];
        if(_status == status)return;
        this.hallows_red_list[bid] = status;
//TODO:RP
        //MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.partner, { bid: bid, status: status });
        HeroController.getInstance().getModel().setHeroMainRedPointData(HeroConst.FunctionTab.eArtifact,this.hallows_red_list);
        gcore.GlobalEvent.fire(HallowsEvent.HallowsRedStatus, bid, status);
    },

    // 根据红点类型判断是否显示红点
    checkRedIsShowByRedType:function( redType ){
        return this.hallows_red_list[redType] || false;
    },

    //判断神器是否有红点
    getHallowsRedStatus:function(  ){
        var red_status = false;
        for(var i in this.hallows_red_list){
            if(this.hallows_red_list[i]){
                red_status = true
                break
            }
        }
        return red_status
    },

    updateRedPoint: function() {
        RedMgr.getInstance().addCalHandler(this.checkHallowsRedStatus.bind(this), RedIds.Hallow);
    },

    checkHallowsRedStatus:function(){
        var show_red = false;    
        if(this.checkIsHaveAllHallows()){//是否激活所有神器
           //按照等级、进度、id排序，取出第一个神器来判断红点
            var sort_func = function(objA, objB){
                if(objA.step!=objB.step){
                    return objB.step - objA.step;
                }else if(objA.lucky != objB.lucky){
                    return objB.lucky - objA.lucky;
                }else{
                    return objB.id - objA.id;
                }
            }
            var hallows_list = Utils.deepCopy(this.hallows_list);
            hallows_list.sort(sort_func);
            var hallows_vo = hallows_list[0];
            if(hallows_vo){
                this.setRedHallowsId(hallows_vo.id);
                var role_vo = RoleController.getInstance().getRoleVo();
                // 神器升级
                var hallows_config = gdata("hallows_data","data_info",Utils.getNorKey(hallows_vo.id, hallows_vo.step));
                var cost_config = hallows_config.loss;
                if(cost_config && Utils.next(cost_config)!=null){
                    for(var i in cost_config){
                        var bid = cost_config[i][0];
                        var num = cost_config[i][1];
                        var have_num = 0;
                        var assert = Config.item_data.data_assets_id2label[bid];
                        if(assert){
                            have_num = BackpackController.getInstance().getModel().getRoleAssetByAssetKey(assert);
                        }else{
                            have_num = BackpackController.getInstance().getModel().getItemNumByBid(bid);
                        }
                        if(have_num < num){
                            show_red = false;
                            break
                        }else{
                            show_red = true;
                        }
                    }
                } 
                this.updateHallowsRedStatus(HallowsConst.Red_Index.hallows_lvup, show_red);
                // 神器技能升级
                show_red = false;
                // 神器技能升级
                var skill_config = gdata("hallows_data","data_skill_up",Utils.getNorKey(hallows_vo.id, hallows_vo.skill_lev));
                if(skill_config && skill_config.lev_limit != 0 && skill_config.lev_limit <= hallows_vo.step){
                    var cost_config = skill_config.lose;
                    if(cost_config && Utils.next(cost_config)!=null){
                        for(var j in cost_config){
                            var bid = cost_config[j][0];
                            var num = cost_config[j][1];
                            var have_num = 0;
                            var assert = Config.item_data.data_assets_id2label[bid];
                            if(assert){
                                have_num = BackpackController.getInstance().getModel().getRoleAssetByAssetKey(assert);
                            }else{
                                have_num = BackpackController.getInstance().getModel().getItemNumByBid(bid);
                            }

                            if(have_num < num){
                                show_red = false
                                break
                            }else{
                                show_red = true
                            }
                        }
                    }
                }
                this.updateHallowsRedStatus(HallowsConst.Red_Index.skill_lvup, show_red);

                // 是否可以使用圣印石
                show_red = false
                var trace_config = gdata("hallows_data","data_trace_cost",Utils.getNorKey(hallows_vo.id, hallows_vo.step));
                var id_stone_config = Config.hallows_data.data_const["id_stone"];
                if(trace_config && id_stone_config){
                    var have_num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(id_stone_config.val);
                    if(hallows_vo.seal < trace_config.num && have_num > 0){
                        show_red = true;
                    }
                }
                this.updateHallowsRedStatus(HallowsConst.Red_Index.stone_use, show_red);
            }
            // 当从神器任务界面变为神器界面时，要先清一下任务的红点
            if(this.checkRedIsShowByRedType(HallowsConst.Red_Index.task_award)){
                this.updateHallowsRedStatus(HallowsConst.Red_Index.task_award, false);
            }
        }else{
            show_red = this.checkHallowsAwardTips();
            this.updateHallowsRedStatus(HallowsConst.Red_Index.task_award, show_red)
        }
    },


    // 保存一下显示红点的神器id(等级最高的)
    setRedHallowsId:function( id ){
        var old_id = this.red_hallows_id;
        this.red_hallows_id = id;
        
        if(old_id != this.red_hallows_id){
            gcore.GlobalEvent.fire(HallowsEvent.HallowsRedStatus);
        }
        
    },

    getRedHallowsId:function(  ){
        return this.red_hallows_id;
    },
    
    //返回圣器数据
    getHallowsById:function(id){
        return this.hallows_list[id];
    },

    //当前总结束
    curTotalStep:function(){
        var step = 0;
        for(var i in this.hallows_list){
            step = step + this.hallows_list[i].step;
        }
        return step;
    },
    
    //获取圣器列表
    getHallowsList:function(){
        var list = [];
        for(var i in this.hallows_list){
            list.push(this.hallows_list[i]);
        }
        return list;
    },

    //圣器共鸣等级
    getResonateLev:function(){
        return 0;
        //return self.resonate_lev 
    },

    //获取上阵伙伴数据
    getFormInfo:function(){
        if(Utils.next(this.attr_ratio_list) == null){
            for(var i in Config.hallows_data.data_attr_radio){
                var info = Config.hallows_data.data_attr_radio[i];
                for(var j in info.ratio){
                    var attr_key = info.ratio[i][0];
                    var ratio = info.ratio[i][1];
                    this.attr_ratio_list[Utils.getNorKey(info.type, attr_key)] = ratio
                }
            }
        }
        var type_list = {};
        var partner_model = HeroController.getInstance().getModel();
        if(partner_model){
            var form_pos_list = partner_model.getMyPosList();
            for(var k in form_pos_list){
                var vo = partner_model.getHeroById(form_pos_list[k].id);
                if(vo){
                    if(type_list[vo.type] == null){
                        type_list[vo.type] = 0
                    }
                    type_list[vo.type] = type_list[vo.type] + 1
                }
            }
        }
        return type_list;
    },

    getRatio:function(type, attr_key){
        return this.attr_ratio_list[Utils.getNorKey(type, attr_key)]
    },

    // 圣器任务列表
    updateHallowsTask:function(list){
        if(list == null || Utils.next(list) == null)return;
        if(this.hallows_task_list == null){
            this.hallows_task_list = {};
        }
        for(var i in list){
            this.hallows_task_list[list[i].id] = list[i];
        }
        this.updateRedPoint();
        gcore.GlobalEvent.fire(HallowsEvent.UpdateHallowsTaskEvent);
    },

    // 获取指定圣器的任务列表, 这个id是圣器的id,
    getHallowsTaskList:function(id){
        var task_list = [];
        var hallows_task_config = Config.hallows_data.data_task;
        if(this.hallows_task_list){
            for(var i in this.hallows_task_list){
                var config = hallows_task_config[this.hallows_task_list[i].id];
                if(config.hid == id){
                    this.hallows_task_list[i].sort = config.sort;
                    task_list.push(this.hallows_task_list[i]);
                }
            }
        }
        if(Utils.next(task_list)){
            task_list.sort(function (a, b) {
                return a.id - b.id;
            })
        }
        return task_list;
    },

    // 获取指定任务数据
    getHallowsTaks:function(id){
        if(this.hallows_task_list){
            return this.hallows_task_list[id];
        }
    },

    // 获取当前待激活的圣器id
    getCurActivityHallowsId:function(){
        if(this.hallows_list == null || Utils.next(this.hallows_list) == null){//-- 第一个圣器
            return 1;
        }
        var next_id = 0;
        for(var i in this.hallows_list){
            if(next_id<this.hallows_list[i].id){
                next_id = this.hallows_list[i].id;
            }
        }
        return (next_id + 1)            // 取出当前待激活的圣器的id
    },

    // 当前待激活的神器是否有可领取的任务奖励
    checkHallowsAwardTips:function(){
        if(this.hallows_task_list == null || Utils.next(this.hallows_task_list) == null){
            return false;
        }
        var cur_hallows_id = this.getCurActivityHallowsId();
        var task_list = this.getHallowsTaskList(cur_hallows_id);
        if(task_list == null || Utils.next(task_list) == null){
            return false;
        }
        for(var i in task_list){
            if(task_list[i].finish == 1){
                return true;
            }
        }
        return false;
    },

    // 获取当前是否已经激活所有神器
    checkIsHaveAllHallows:function(){
        var max_count = Config.hallows_data.data_base_length;
        var cur_count = 0;
        for(var i in this.hallows_list){
            cur_count = cur_count + 1;
        }
        return (cur_count>=max_count);
    },
    
    // 设置是否打开过神器界面的标记
    setOpenHallowsFlag:function( flag ){
        this.open_flag = flag;
    },

    //1 为打开过，2为没打开过
    getHallowsOpenFlag:function(  ){
        return this.open_flag;
    },

    // 根据神器id，从配置表数据中获取该神器最高属性数据
    makeHighestHallowVo:function( hallows_id ){
        if(hallows_id){
            var hallows_vo = new HallowsVo();
            var max_lv = Config.hallows_data.data_max_lev[hallows_id];
            var max_skill_lv = Config.hallows_data.data_skill_max_lev[hallows_id];
            var config_info = gdata("hallows_data","data_info",Utils.getNorKey(hallows_id, max_lv));
            var config_skill = gdata("hallows_data","data_skill_up",Utils.getNorKey(hallows_id, max_skill_lv));;
            var attr_data = [];
            for(var i in config_info.attr){
                var attr_str = config_info.attr[i][0];
                var attr_temp = {}
                attr_temp.attr_id = Config.attr_data.data_key_to_id[attr_str]
                attr_temp.attr_val = config_info.attr[i][1]
                attr_data.push(attr_temp);
            }
            hallows_vo.id = hallows_id;
            hallows_vo.step = max_lv;
            hallows_vo.add_attr = attr_data;
            hallows_vo.skill_bid = config_skill.skill_bid;
            hallows_vo.skill_lev = max_skill_lv;
    
            return hallows_vo;
        }
    },

    __delete:function(){

    },
});