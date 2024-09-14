// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      试炼之境
// <br/>Create: 2019-09-09 19:11:57
// --------------------------------------------------------------------
var LimitExerciseEvent = require("limitexercise_event")
var LimitexerciseController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var LimitexerciseModel = require("limitexercise_model");

        this.model = new LimitexerciseModel();
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
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(25410, this.handle25410)
        this.RegisterProtocal(25411, this.handle25411)
        this.RegisterProtocal(25412, this.handle25412)
        this.RegisterProtocal(25413, this.handle25413)
        this.RegisterProtocal(25414, this.handle25414)
    },
    // --活动boss信息
    send25410(){
        this.SendProtocal(25410, {})
    },
    handle25410(data){
        this.model.setLimitExerciseData(data)
        gcore.GlobalEvent.fire(LimitExerciseEvent.LimitExercise_Message_Event,data)
    },
    //购买挑战次数
    send25411(){
        this.SendProtocal(25411, {})
    },
    handle25411(data){
        message(data.msg)
        if(data.code == 1){
            this.model.setChangeCount(data.count,data.buy_count)
            if(this.touch_buy_change && data.count == 1){
                this.send25413()
            }
            this.touch_buy_change = null
            gcore.GlobalEvent.fire(LimitExerciseEvent.LimitExercise_BuyCount_Event,data)
        }
    },
    //当挑战次数为0的时候，可以根据购买次数是否为0来判断出战
    checkJoinFight(){
        let const_data = Config.holiday_boss_new_data.data_const
        if(!const_data) return;

        let max_count = const_data.fight_buy_max_count.val
        let cur_count = this.model.getDayBuyCount()
        let remain_count = this.model.getReaminCount()
        // cc.log("max_count,cur_count,remain_count",max_count,cur_count,remain_count)
        if(cur_count >= max_count && remain_count == 0){
            message(Utils.TI18N("今日次数已用完~~"))
        }else{
            if(remain_count <= 0){
                var CommonAlert = require("commonalert");
                var str = cc.js.formatStr("是否花费<img src='%s' scale=0.3 />%s购买一次挑战次数？", Config.item_data.data_assets_label2id.gold,const_data.action_num_espensive.val)
                var res = PathTool.getItemRes(Config.item_data.data_assets_label2id.gold)
                var call_back = function(){
                    this.touch_buy_change = true
                    this.send25411()
                }.bind(this)
                CommonAlert.show(str, Utils.TI18N("确认"), call_back, Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
            }else{
                this.send25413()
            }
        }
    },
    send25412(){
        this.SendProtocal(25412, {})
    },
    handle25412(data){
        message(data.msg)
        gcore.GlobalEvent.fire(LimitExerciseEvent.LimitExercise_GetBox_Event,data)
    },
    // 挑战活动boss
    send25413(){
        this.SendProtocal(25413, {})
    },
    handle25413(data){
        message(data.msg)
        if(data.code == 1){
            var HeroController = require("hero_controller")
            HeroController.getInstance().openFormGoFightPanel(false)
        }
    },
    //当前伙伴已使用次数
    send25414(){
        this.SendProtocal(25414, {})
    },
    handle25414(data){
        this.model.setHeroUseId(data.p_list)
    },
    openLimitExerciseChangeView(status){
        if(status == true){
            if(!this.limit_exercise_view){
                var LimitExerciseChangeWindow = require("limitexercise_change_window")
                this.limit_exercise_view = new LimitExerciseChangeWindow(this)
            }
            this.limit_exercise_view.open()
        }else{
            if(this.limit_exercise_view){ 
                this.limit_exercise_view.close()
                this.limit_exercise_view = null
            }
        }
    },
    //打开查看奖励界面
    openLimitExerciseRewardView(status){
        if(status == true){
            if(!this.open_reward_view){
                var LimitExerciseRewardWindow = require("limitexercise_reward_window")
                this.open_reward_view = new LimitExerciseRewardWindow(this)
            }
            this.open_reward_view.open()
        }else{
            if(this.open_reward_view){ 
                this.open_reward_view.close()
                this.open_reward_view = null
            }
        }
    }
});

module.exports = LimitexerciseController;