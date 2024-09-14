// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     奖励vip界面
// <br/>Create: 2019-08-19 10:38:01
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipLabelItemPanel = require("vip_award_item_panel");
var CommonScrollView = require("common_scrollview");
var VipController = require("vip_controller");
var VipEvent = require("vip_event");

var Vip_awardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "vip_award_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.BtnState = 1;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");

        this.vip_bg = this.main_container.getChildByName("background").getComponent(cc.Sprite);
        var res_id = PathTool.getBigBg("give_vip_bg", null, "vip");
        this.loadRes(res_id,function(res){
            this.vip_bg.spriteFrame = res
        }.bind(this))

        this.time_lab = this.main_container.getChildByName("time_lab").getComponent(cc.Label);
        this.giftCon_nd = this.main_container.getChildByName("giftCon");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.get_btn = this.main_container.getChildByName("get_btn");
        this.get_btn_btn = this.get_btn.getComponent(cc.Button);
        this.get_btn_lab = this.get_btn.getChildByName("Label").getComponent(cc.Label);
        this.get_btn_lab.string = Utils.TI18N("免费领取");
        this.common_goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.common_goods_item.initConfig(false, 1,null,true);
        this.common_goods_item.setParent(this.main_container);
        this.common_goods_item.setPosition(0, -250);
        this.common_goods_item.show();

        var tab_size = this.giftCon_nd.getContentSize();
        var setting = {
            item_class: VipLabelItemPanel,      // 单元类
            start_x: 15,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 340,               // 单元的尺寸width
            item_height: 36,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.info_scroll = new CommonScrollView();
        this.info_scroll.createScroll(this.giftCon_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openVipAwardWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.get_btn, function () {
            var vipGiveInfo = VipController.getInstance().getModel().getGiveVipInfo();
            if(!vipGiveInfo)return;

            var refresh = vipGiveInfo.time -gcore.SmartSocket.getTime();      
            if(vipGiveInfo.state == 0 && refresh>0){
                return;
            }

            this.ctrl.sender16731();
        }.bind(this), 1);

        // 赠送vip处理
        this.addGlobalEvent(VipEvent.GIVE_VIP_UPDATE, function(){
            this.updateData();
        }.bind(this));
    },

    updateData:function(){
        var vipGiveInfo = VipController.getInstance().getModel().getGiveVipInfo();
        var configReward = Config.vip_data.data_vip_const.vip_give_reward;
        var config = gdata("vip_data", "data_get_reward", [1]);
        if(vipGiveInfo == null || config == null || configReward == null) return;
        //特权信息
        var desc_list = config.spe_desc;
        this.info_scroll.setData(desc_list);
        
        this.common_goods_item.setData({bid:configReward.val[0][0],num:configReward.val[0][1]});

        var refresh = vipGiveInfo.time -gcore.SmartSocket.getTime();  
        this.setCountDownTime(this.time_lab,refresh);
    },

    setCountDownTime(text,less_time){
        let node = text.node
        if(!node)return
        node.stopAllActions();
        if (less_time > 0){
            this.updateBtnState(0);
            this.setTimeFormatString(text,less_time)
            let callfun = cc.callFunc(function () {
                less_time = less_time - 1;
                if (less_time <= 0) {
                    node.stopAllActions();
                    text.string = ""
                    this.updateBtnState(1);
                } else {
                    this.setTimeFormatString(text,less_time)
                    this.updateBtnState(0);
                }
            }.bind(this))
            node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1), callfun)))
        }else{
            this.time_lab.node.stopAllActions();
            this.time_lab.string = "";
            this.updateBtnState(1);
        }
    },

    setTimeFormatString(text,time){
        var TimeTool = require("timetool")
        if(time > 0){
            text.string = TimeTool.getTimeForFunction(time);
        }else{
            text.node.stopAllActions();
            text.string = ""
        }
    },

    updateBtnState:function(state){
        if(!this.get_btn_btn)return;
        if(this.BtnState == state)return;
        this.BtnState = state;
        var vipGiveInfo = VipController.getInstance().getModel().getGiveVipInfo();
        if(vipGiveInfo){
            var refresh = vipGiveInfo.time -gcore.SmartSocket.getTime();      
            if(vipGiveInfo.state == 0 && refresh>0){
                this.get_btn_btn.interactable = false;
                this.get_btn_btn.enableAutoGrayEffect = true;
                // this.get_btn_lab.node.getComponent(cc.LabelOutline).enabled = false;
            }else{
                this.get_btn_btn.interactable = true;
                this.get_btn_btn.enableAutoGrayEffect = false;
                // this.get_btn_lab.node.getComponent(cc.LabelOutline).enabled = true;
            }
        }
        this.model.setGiveVipStatus();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.updateData();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.common_goods_item){
            this.common_goods_item.deleteMe();
            this.common_goods_item = null;
        }

        if(this.info_scroll){
            this.info_scroll.deleteMe()
            this.info_scroll = null;
        }

        if(this.time_lab){
            this.time_lab.node.stopAllActions();
        }
        this.ctrl.openVipAwardWindow(false);
    },
})