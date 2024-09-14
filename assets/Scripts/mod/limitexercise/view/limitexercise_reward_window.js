// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-11 15:50:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LimitExerciseRewardItem = require("limit_exercise_reward_item_panel")
var Limitexercise_rewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("limitexercise", "reward_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.length = Config.holiday_boss_new_data.data_lev_reward_list_length
        this.lev_reward_list = Config.holiday_boss_new_data.data_lev_reward_list
        this.item_list = []
        this.item_list_panel = []
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background")
        let main_container = this.root_wnd.getChildByName("main_container")
        main_container.getChildByName("Image_2").getChildByName("Text_1").getComponent(cc.Label).string = (Utils.TI18N("奖励详情"))
        this.name = main_container.getChildByName("name").getComponent(cc.Label)
        this.name.string = ("")
        this.btn_left = main_container.getChildByName("btn_left")
        this.btn_right = main_container.getChildByName("btn_right")
        let txt2 = main_container.getChildByName("Text_3").getComponent(cc.Label)
        txt2.string = (Utils.TI18N("通关boss关卡即可升级结算奖励，完成所有关卡可直接获得\n当期奖励。若未完成所有关卡，奖励会在本期结束时邮件发放"))
        // let real_label = txt2.getVirtualRenderer()
        // if real_label then
            // real_label:setLineSpacing(10)
        // end
    
        this.item_scrollview = main_container.getChildByName("item_scrollview").getComponent(cc.ScrollView)
        this.btn_close = main_container.getChildByName("btn_close")

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            this.ctrl.openLimitExerciseRewardView(false)
            Utils.playButtonSound(2)
        },this)
        this.background.on("touchend",function(){
            this.ctrl.openLimitExerciseRewardView(false)
            Utils.playButtonSound(2)
        },this)
        this.btn_close.on("click",function(){
            this.ctrl.openLimitExerciseRewardView(false)
            Utils.playButtonSound(2)
        },this)
        this.btn_left.on('click',function(){
            this.show_minus()
            Utils.playButtonSound(3)
        },this)
        this.btn_right.on('click',function(){
            this.show_add()
            Utils.playButtonSound(3)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.cur_index = this.ctrl.getModel().getCurrentDiff()
        this.dropItem(this.cur_index)
    },
    dropItem(id){
        id = id || 0
        if(id >= (this.length+1)){
            this.cur_index = this.length
            message(Utils.TI18N("已经是最大等级啦~~~~"))
            return
        }
        if(id <= 0){
            this.cur_index = 1
            message(Utils.TI18N("已经是最小等级啦~~~~"))
            return
        }
    
        this.name.string = (Utils.TI18N("难度 ")+id)
        if(id >= this.length){
            id = this.length
        }
        if(id <= 0){
            id = 1
        }
        if(!this.lev_reward_list[id]) return;
        let arr = []
        for(let i in this.lev_reward_list[id]){
            arr.push(this.lev_reward_list[id][i])   
        }
        arr.sort(function(a,b){
            return a.order_id - b.order_id
        })
        if(this.item_list.length == 0){
            this.item_list = arr
            this.timer = this.startUpdate(this.item_list.length,function(index){
                let cell = this.createAreaChangeCell()
                cell.setPosition(0,-144*index)
                cell.setData(this.item_list[index])
                this.item_list_panel.push(cell)
            }.bind(this),100)
        }else{
            this.item_list = arr
            for(let i=0;i<this.item_list.length;++i){
                let cell = this.item_list_panel[i]
                if(!cell){
                    cell = this.createAreaChangeCell()
                    this.item_list_panel[i] = cell
                }
                this.item_list_panel[i].setData(this.item_list[i])
            }
        }
        this.item_scrollview.content.height = 144 * this.item_list.length;

    },
    createAreaChangeCell(){
        let item = new LimitExerciseRewardItem();
        item.setParent(this.item_scrollview.content)
        item.show()
        return item
    },
    show_minus(){
        this.cur_index = this.cur_index - 1
        this.dropItem(this.cur_index)
    },
    show_add(){
        this.cur_index = this.cur_index + 1
        this.dropItem(this.cur_index)
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_list_panel){
            for(let i=0;i<this.item_list_panel.length;++i){
                if(this.item_list_panel[i]){
                    this.item_list_panel[i].deleteMe()
                    this.item_list_panel[i] = null;
                }
            }
            this.item_list_panel = null;
        }
        if(this.timer){
            this.stopUpdate(this.timer)
            this.timer = null;
        }
        this.ctrl.openLimitExerciseRewardView(false)
    },
})