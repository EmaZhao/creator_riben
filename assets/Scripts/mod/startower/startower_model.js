// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      星命塔
// <br/>Create: 2019-02-27 11:03:16
// --------------------------------------------------------------------
var StartowerEvent = require("startower_event");

var StartowerModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = require("startower_controller").getInstance();
        this.initConfig();
    },

    properties: {
    },

    initConfig: function () {
        // 已通关的最大层数
        this.max_tower = 0;
        //剩余挑战次数
        this.less_count = 0;
        //已购买次数
        this.buy_count = 0;
        this.reward_list = [];  //通关奖励状态

    },

    setStarTowerData:function(data){
        var tempsort = {
            0: 2,  // 0 未领取放中间
            1: 1,  // 1 可领取放前面
            2: 3,  // 2 已领取放最后
        }
        this.max_tower = data.max_tower || 0;
        this.less_count = data.count || 0;
        this.buy_count = data.buy_count || 0; 
        if(Utils.next(data.award_list)!=null){
            for(var i in data.award_list){
                var tab = {};
                tab.id = data.award_list[i].id;
                tab.status = data.award_list[i].status;
                tab.sort = tempsort[tab.status];
                this.reward_list[data.award_list[i].id-1] = tab;
                
            }
        }
        
        this.reward_list.sort(Utils.tableLowerSorter(["sort","id"]))
        this.updateRedPoint();
        gcore.GlobalEvent.fire(StartowerEvent.Update_All_Data);
    },

    setRewardData:function(data){
        if(!this.reward_list || !data[0])return;
        var tempsort = {
            0: 2,  // 0 未领取放中间
            1: 1,  // 1 可领取放前面
            2: 3,  // 2 已领取放最后
        }
        for(var i in this.reward_list){
            if(this.reward_list[i].id == data[0].id){
                this.reward_list[i].status = data[0].status;
                this.reward_list[i].sort = tempsort[data[0].status];
                break;
            }
        }
        
        this.reward_list.sort(Utils.tableLowerSorter(["sort","id"]))
    },

    sortFunc:function(data){
        data.sort(function(objA, objB){
            if(objA.sort != objB.sort){
                if(objA.sort && objB.sort){
                    return objA.sort - objB.sort;
                }else{
                    return false;
                }
            }else{
                return objA.id - objB.id;
            }
        })

        return data
    },
    
    getRewardData:function(id){
        if(!this.reward_list)return;
        if(id == null){
            return this.reward_list || {};
        }else{
            return this.reward_list[id] || {};
        }
    },

    updateRedPoint: function() {
        RedMgr.getInstance().addCalHandler(this.checkRedPoint.bind(this), RedIds.StarTower);
    },

    checkRedPoint:function(){
        var is_open = this.ctrl.checkIsOpen();
        if(!is_open)return;
        var status = false;
        for(var i in this.reward_list){
            if(this.reward_list[i].status == 1){
                status = true;
                break;
            }
        }
        status = status || (this.less_count > 0);
        var SceneConst = require("scene_const");
        var MainSceneController = require("mainscene_controller");
        MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.startower, {bid: 1, status: status}) 
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.starTower, status);
    },

    updateMaxTower:function(data){
        if(data && data.max_tower && this.max_tower < data.max_tower){
            this.max_tower = data.max_tower;
        }
        gcore.GlobalEvent.fire(StartowerEvent.Fight_Success_Event)
    },

    updateLessCount:function(data){
        if(data.count != null){
            this.less_count = data.count || 0;
            this.updateRedPoint();
        }
        if(data.buy_count != null){
            this.buy_count = data.buy_count;
        }
        gcore.GlobalEvent.fire(StartowerEvent.Count_Change_Event);
    },

    getNowTowerId:function(){
        return this.max_tower || 0;
    },

    getTowerLessCount:function(){
        return this.less_count;
    },

    getBuyCount:function(){
        return this.buy_count;
    }
});