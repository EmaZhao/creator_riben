// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     每日首充界面
// <br/>Create: 2019-04-28 11:05:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var DayChargetEvent = require("daycharge_event");

var DaychargeWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_day_charge_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.first_effect = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.Sprite_8_node = this.main_container.getChildByName("Sprite_8");
        // this.Sprite_8_node.scale = 2;

        this.Sprite_8 = this.Sprite_8_node.getComponent(cc.Sprite);
        var res = PathTool.getBigBg("txt_cn_action_bigbg_2",null,"action");
        this.loadRes(res, (function(resObject){
            this.Sprite_8.spriteFrame = resObject;
        }).bind(this));

        this.btn_charge = this.main_container.getChildByName("btn_charge");
        this.btn_charge.active = false;
        this.btn_get = this.main_container.getChildByName("btn_get");
        this.btn_get.active = false;
    
        this.title_eff_nd = this.main_container.getChildByName("title_eff_nd");
        this.first_effect[1] = this.title_eff_nd.getComponent(sp.Skeleton);
        // var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(650), "action");
        // this.loadRes(anima_path, function(effect,ske_data) {
        //     effect.skeletonData = ske_data;
        //     effect.setAnimation(0, PlayerAction.action, true);
        // }.bind(this,this.first_effect[1]));

        this.get_eff_nd = this.main_container.getChildByName("get_eff_nd");
        this.first_effect[2] = this.get_eff_nd.getComponent(sp.Skeleton);
        this.first_effect[2].node.active = false;
        var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(651), "action");
        this.loadRes(anima_path, function(effect,ske_data) {
            effect.skeletonData = ske_data;
            effect.setAnimation(0, PlayerAction.action, true);
        }.bind(this,this.first_effect[2]));

        this.charge_num = this.seekChild(this.main_container, "charge_num").getComponent("CusRichText");
        this.cahrge_num_child_nd = this.seekChild(this.charge_num.node, "CusNum");
        
        this.diamond = this.main_container.getChildByName("Sprite_9");
        
        var good_cons = this.main_container.getChildByName("good_cons");
        var scroll_view_size = good_cons.getContentSize();
        var setting = {
            item_class: "backpack_item", // 单元类
            start_x: 0, // 第一个单元的X起点
            space_x: 15, // x方向的间隔
            start_y: 15, // 第一个单元的Y起点
            space_y: 0, // y方向的间隔
            item_width: 120 * 0.9, // 单元的尺寸width
            item_height: 120 * 0.9, // 单元的尺寸height
            row: 1, // 行数，作用于水平滚动类型
            col: 0, // 列数，作用于垂直滚动类型
            scale: 0.9
        }
        var CommonScrollView = require("common_scrollview");
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview .createScroll(good_cons, cc.v2(0,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);

        // this.item_scrollview:setSwallowTouches(false)
        this.item_scrollview.setClickEnabled(false);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(DayChargetEvent.DAY_FIRST_CHARGE_EVENT,function(data){
            if(!data)return;
            var reward_data = Config.charge_data.data_constant.day_charge_goal;
            var num = reward_data.val - data.num;
            if(num <= 0){
                num = 0;
            }
            this.charge_num.setNum(num);
            this.diamond.x = this.charge_num.node.x+this.cahrge_num_child_nd.getContentSize().width*1.4;
            if(data.status == 0){
                this.first_effect[2].node.active = true;
                this.btn_charge.active = true;
                this.btn_get.active = false;
            }else if(data.status == 1){
                this.first_effect[2].node.active = false;
                this.btn_charge.active = false;
                this.btn_get.active = true;
            }
        }.bind(this));

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openDayFirstChargeView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_charge, function () {
            this.ctrl.openDayFirstChargeView(false);
            var VipController = require("vip_controller")
            VipController.getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE);
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_get, function () {
            this.ctrl.sender21011();
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.sender21010();
        var RoleController = require("role_controller")
        var role_vo = RoleController.getInstance().getRoleVo();
        var open_day = Config.charge_data.data_daily_reward_length;
        var reward_data = Config.charge_data.data_daily_reward;

        for(var i in reward_data){
            if(role_vo.open_day >= reward_data[i].min && role_vo.open_day <= reward_data[i].max){
                open_day = reward_data[i].id;
                break;
            }
        }

        if(this.item_scrollview){
            var list = [];
            for(var i in reward_data[open_day].reward){
                var v = reward_data[open_day].reward[i];
                var vo = {};
                vo.bid = v[0];
                vo.num = v[1];
                list.push(vo);
            }
            this.item_scrollview.setData(list);

            this.item_scrollview.addEndCallBack(function(){
                var list = this.item_scrollview.getItemList();
                for(var i in list){
                    list[i].setDefaultTip();
                }
            }.bind(this));
        }

        this.diamond.x = this.charge_num.node.x+this.cahrge_num_child_nd.getContentSize().width*1.4;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }

        for(var i in this.first_effect){
            if(this.first_effect[i]){
                this.first_effect[i].setToSetupPose();
                this.first_effect[i].clearTracks();
            }
        }
        this.ctrl.openDayFirstChargeView(false);
    },
})