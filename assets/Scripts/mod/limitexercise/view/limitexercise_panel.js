// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-09 17:32:54
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LimitexerciseController = require("limitexercise_controller")
var LimitExerciseEvent = require("limitexercise_event")
var LimitExerciseConst = require("limitExercise_const")
var TimeTool = require("timetool")
var LimitexercisePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("limitexercise", "limitexercise_panel");
        this.holiday_bid = arguments[0]
        this.ctrl = LimitexerciseController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let x = this.getPositionX()
        this.setPosition(x,-20)
        let main_container = this.root_wnd.getChildByName("main_container")
        let load_bg = main_container.getChildByName("bg").getComponent(cc.Sprite)
        let bg_res = PathTool.getUIIconPath("bigbg/limitexercise", "txt_cn_limit_exercise")
        this.loadRes(bg_res,function(res){
            load_bg.spriteFrame = res;
        }.bind(this))
        main_container.getChildByName("Text_1").getComponent(cc.Label).string = (Utils.TI18N("活动时间："))
    
        this.btn_change = main_container.getChildByName("btn_change")
        this.btn_change.getChildByName("Text_4").getComponent(cc.Label).string = (Utils.TI18N("前往挑战"))
    
        main_container.getChildByName("Text_1_0").getComponent(cc.Label).string = (Utils.TI18N("剩余次数:"))
        main_container.getChildByName("Text_2").getComponent(cc.Label).string = (Utils.TI18N("本轮剩余:"))
        this.round_time = main_container.getChildByName("round_time").getComponent(cc.Label)
        this.round_time.string =("")
        main_container.getChildByName("Text_2_0").getComponent(cc.Label).string = (Utils.TI18N("所在区域:"))
        main_container.getChildByName("Text_2_0_0").getComponent(cc.Label).string = (Utils.TI18N("挑战次数:"))
        main_container.getChildByName("Text_2_0_1").getComponent(cc.Label).string = (Utils.TI18N("击败怪物:"))
        this.aera_text = main_container.getChildByName("aera_text").getComponent(cc.Label)
        this.aera_text.string =("")
        this.change_count = main_container.getChildByName("change_count").getComponent(cc.Label)
        this.change_count.string =("")
        this.defaet_master = main_container.getChildByName("defaet_master").getComponent(cc.Label)
        this.defaet_master.string =("")
    
        this.item_count = main_container.getChildByName("item_count").getComponent(cc.Label)
        this.item_count.string =("")
        this.remain_time = main_container.getChildByName("remain_time").getComponent(cc.Label)
        this.remain_time.string =("")
        this.goods_con = main_container.getChildByName("goods_con")
        this.goods_con_content =  this.goods_con.getChildByName("content")
        this.setData()

        this.ctrl.send25410()
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(LimitExerciseEvent.LimitExercise_Message_Event,function(data){
            if(!data) return;
	        this.actionHolidayData(data)
        }.bind(this))
        this.addGlobalEvent(LimitExerciseEvent.LimitExercise_BuyCount_Event,function(data){
            if(!data) return;
            if(this.item_count){
                this.item_count.string = data.count || 0
            }
        }.bind(this))
        this.btn_change.on('click',function(){
            var MainuiController = require("mainui_controller")
            var BattleConst = require("battle_const")
            MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.LimitExercise)
            Utils.playButtonSound(1)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setVisibleStatus: function (bool) {
        bool = bool || false;
        this.setVisible(bool);
    },
    setData(){
        let const_data = Config.holiday_boss_new_data.data_const
        if(const_data){
            if(const_data.action_time){
                let time_desc = const_data.action_time.desc || ""
                this.remain_time.string = (time_desc)
            }
            if(const_data.action_pre_reward){
                let data_list = const_data.action_pre_reward.val || []
                let setting = {}
                setting.scale = 0.9
                setting.max_count = 4
                setting.is_center = true
                setting.show_effect_id = 263
                this.item_list = Utils.commonShowSingleRowItemList(this.goods_con, this.item_list, data_list, setting,this.goods_con_content)
            }
        }
    },
    actionHolidayData(data){
        let time = data.endtime || 0
        this.setCountDownTime(this.round_time, time - gcore.SmartSocket.getTime());
        this.item_count.string = (data.count || 0)
        this.aera_text.string = Utils.TI18N(LimitExerciseConst.type[data.order_type || 1])
        this.change_count.string = (data.round_combat || 0)
        this.defaet_master.string = (data.round_boss || 0)
    },
    setCountDownTime(label,less_time){
        if(!label){
            return
        }
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(less_time > 0){
            this.setTimeFormatString(label,less_time)
            this.time_tichet = gcore.Timer.set(function(){
                less_time-- 
                if(less_time < 0){
                    gcore.Timer.del(this.time_tichet);
                    this.time_tichet = null;
                    label.string = ("00:00:00")
                }else{
                    this.setTimeFormatString(label,less_time)
                }
            }.bind(this),1000,-1)
        }else{
            this.setTimeFormatString(label,less_time)
        }
    },
    setTimeFormatString(label , time ){
        if (time > 0){
            label.string = TimeTool.getTimeFormatDay(time);
        }else{
            label.string = "00:00:00";
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(this.item_list){
            for(let i=0;i<this.item_list.length;++i){
                if(this.item_list[i]){
                    this.item_list[i].deleteMe()
                    this.item_list[i] = null;
                }
            }
            this.item_list = null;
        }
    },
})