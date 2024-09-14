// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     
// <br/>Create: 2019-04-18 15:16:30
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller");
var TaskConst = require("task_const")
var TimeTool = require("timetool")
var ActionConst = require("action_const");
var ActionLimitCommonItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_limit_yuanzhen_item");
        this.ctrl = ActionController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.action_yuanzhen_id = 13005
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let main_container = this.root_wnd.getChildByName("main_container")
        this.btn_goto = main_container.getChildByName("btn_goto")
        this.btn_goto.getChildByName("Text_6").getComponent(cc.Label).string = Utils.TI18N("前往")
        this.btn_goto.active = false;
        this.btn_get = main_container.getChildByName("btn_get")
        this.btn_get.getChildByName("Text_5").getComponent(cc.Label).string = Utils.TI18N("受取")
        this.btn_get.active = false;
        this.btn_has = main_container.getChildByName("btn_has")
        this.btn_has.active = false;
    
        this.goods_con = main_container.getChildByName("good_cons")
    
        this.Image_1 = main_container.getChildByName("Image_1")
        this.line = main_container.getChildByName("line")

        if(this.action_id == this.action_yuanzhen_id){
            // this.line.active = false;

            // this.title_desc = createRichLabel(22, cc.c4b(0x64,0x32,0x23,0xff), cc.p(0,0.5), cc.p(14,129), nil, nil, 400)
            // main_container:addChild(this.title_desc)

            // this.goal_desc = createRichLabel(26, cc.c4b(0x93,0x53,0x22,0xff), cc.p(0.5,0.5), cc.p(596,127), nil, nil, 400)
            // main_container:addChild(this.goal_desc)

            // this.time_desc = createRichLabel(22, cc.c4b(0x93,0x53,0x22,0xff), cc.p(0.5,0.5), cc.p(594,24), nil, nil, 400)
            // main_container:addChild(this.time_desc)

            // let size = this.goods_con:getContentSize()
            // this.item_scrollview = createScrollView(size.width, size.height, 0, 0, this.goods_con, ScrollViewDir.vertical ) 

        }else{
            this.btn_goto.y = 0
            this.btn_get.y = 0
            this.btn_has.y = 0

            this.Image_1.active = false;
            // --标题
            this.title_desc = Utils.createLabel(22, new cc.Color(0x64,0x32,0x23,0xff),null ,-196 , 24 , null, null, null,cc.v2(0,0.5))
            main_container.addChild(this.title_desc.node)
            // --小标题
            this.little_desc = Utils.createRichLabel(20, new cc.Color(0x95,0x53,0x22,0xff),cc.v2(0,1), cc.v2(-196,-4),null,320)
            this.little_desc.horizontalAlign = cc.macro.TextAlignment.LEFT
            main_container.addChild(this.little_desc.node)

            this.time_desc = Utils.createLabel(20, new cc.Color(0x93,0x53,0x22,0xff),null,254,-52,null,null,null,cc.v2(0.5,0.5))
            main_container.addChild(this.time_desc.node)

            this.item = ItemsPool.getInstance().getItem("backpack_item") //BackPackItem.new(false, true, false, 0.9, false, true)  
            this.item.initConfig(false,0.9,false,true)
            this.item.setPosition(-264, 0)
            this.item.setParent(main_container)
            this.item.show()
        }
        if(this.data){
            this.setData(this.data)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.btn_get.on('click',function(){
            Utils.playButtonSound(1)
            if(!this.data) return;
            if(this.holiday_bid == ActionConst.ActionRankCommonType.yuanzhen_adventure){
                this.ctrl.sender24812(this.data.config.id)
            }else if(this.holiday_bid == ActionConst.ActionRankCommonType.exercise_1){
                this.ctrl.sender24814(this.data.config.id)
            }else if(this.holiday_bid == ActionConst.ActionRankCommonType.exercise_2){
                this.ctrl.sender24816(this.data.config.id)
            }else if(this.holiday_bid == ActionConst.ActionRankCommonType.exercise_3){
                this.ctrl.sender24818(this.data.config.id)
            }
        },this)
        this.btn_goto.on('click',this.onGotoBtn,this)
    },
    onGotoBtn(){
        if(!this.data) return;
        if(!this.data.config) return;
        // -- 特殊跳转 特殊处理
        if(this.data.config.source_id == 130051){
            // --跳转到元宵厨房的
            let tab_vo = this.ctrl.getActionSubTabVo(ActionConst.AnimateActionCommonType.YuanZhen_Kitchen)
            if(tab_vo && this.ctrl.action_operate && this.ctrl.action_operate.tab_list[tab_vo.bid]){
                this.ctrl.action_operate.handleSelectedTab(this.ctrl.action_operate.tab_list[tab_vo.bid])
            }else{
                message(Utils.TI18N("该活动已结束"))
            }
        }else if(this.data.config.source_id == 250131){
            // --跳转到沙滩保卫战.
            // var MainuiController = require("mainui_controller")
            // var BattleConst = require("battle_const")
            // MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.SandybeachBossFight)
        }else if(this.data.config.source_id == 250132 || this.data.config.source_id == 250133 || this.data.config.source_id == 250134){
            let jump_id = ActionConst.ActionRankCommonType.time_summon
            if(this.data.config.source_id == 250133){
                // jump_id = ActionConst.ActionRankCommonType.action_skin_buy
            }else if(this.data.config.source_id == 250134){
                jump_id = ActionConst.ActionRankCommonType.limit_exercise
            }
            let tab_vo = this.ctrl.getActionSubTabVo(jump_id)
            if(tab_vo && this.ctrl.action_operate && this.ctrl.action_operate.tab_list[tab_vo.bid]){
                this.ctrl.action_operate.handleSelectedTab(this.ctrl.action_operate.tab_list[tab_vo.bid])
            }else{
                message(Utils.TI18N("该活动已结束"))
            }
        }else{
            let config = Config.source_data.data_source_data[this.data.config.source_id]
            if(config){
                var BackpackController = require("backpack_controller")
                BackpackController.getInstance().gotoItemSources(config.evt_type, config.extend)
            }else{
                var StrongerController = require("stronger_controller")
                StrongerController.getInstance().clickCallBack(this.data.config.source_id)
            }
        }
    },

    setData:function( data ){
        this.data = data;
        if(!this.root_wnd)return
        this.holiday_bid = data.holiday_bid
        this.btn_goto.active = (data.status == TaskConst.task_status.un_finish)
        this.btn_get.active = (data.status == TaskConst.task_status.finish)
        this.btn_has.active = (data.status == TaskConst.task_status.completed)
        if(this.time_desc){
            this.time_desc.node.active = (data.status != TaskConst.task_status.completed)
        }
        if(this.action_id == this.action_yuanzhen_id){
        }else{
            this.title_desc.string = data.title;
            let desc = data.desc+data.goal
            if(data.status == TaskConst.task_status.finish){
                this.little_desc.string = cc.js.formatStr("<color=#249003>%s</color>",desc);
            }else{
                this.little_desc.string = desc;
            }
            if(this.item && data.item_list != null && Utils.next(data.item_list) != null){
                this.item.setData({bid:data.item_list[0][0],num:data.item_list[0][1]})         
            }
        }
        if(this.time_desc.node.active){
            let time = data.end_time - gcore.SmartSocket.getTime();
            if(time < 0){
                time = 0
            }
            this.time_desc.string = cc.js.formatStr("%s%s",Utils.TI18N("残り"), TimeTool.getDayOrHour(time))
        }

    },


    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item){
            this.item.deleteMe()
            this.item = null;
        }
    },
})