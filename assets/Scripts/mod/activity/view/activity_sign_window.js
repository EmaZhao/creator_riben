// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-06 14:34:01
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MainuiController = require("mainui_controller")
var MainuiConst = require("mainui_const");
var ActivityConst = require("activity_const");

var Activity_signWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("activity", "activity_sign_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.main_panel = this.root_wnd.getChildByName("main_panel");

        this.background = this.root_wnd.getChildByName("background_panel");
        this.background.scale = FIT_SCALE;
        this.main_container = this.main_panel.getChildByName("main_container");
        
        this.label = Utils.createRichLabel(24, new cc.Color(0x68,0x45,0x2a, 0xff), cc.v2(0, 0.5), cc.v2(-this.main_container.width/2+30,-this.main_container.height/2+60),30,500);
        this.label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.main_container.addChild(this.label.node);
    
        this.item_container = this.main_panel.getChildByName("item_container");
        this.item_view = this.item_container.getChildByName("item_view");
        this.item_content = this.item_view.getChildByName("content");
        
        this.ok_btn = this.main_panel.getChildByName("ok_btn");
        this.cancel_btn = this.main_panel.getChildByName("cancel_btn");
        this.close_btn = this.main_panel.getChildByName("close_btn");

        this.cancel_lab = this.cancel_btn.getChildByName("Label").getComponent(cc.Label);
        this.ok_lab = this.ok_btn.getChildByName("Label").getComponent(cc.Label);

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openSignView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.cancel_btn, function () {
            this.ctrl.openSignView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.ok_btn, function () {
            this.clickHandle();
            this.ctrl.openSignView(false);
        }.bind(this), 2);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if(!params || params[0] == null)return;
        var config = Config.activity_data.data_sign_info[params[0]];
        if(!config)return;
        this.id = params[0];
        this.time = config.time;
        this.label.string = config.desc;
        this.createItemList(config.items);
        this.cancel_lab.string = config.cancel;
        this.ok_lab.string = config.ok;
        if(params[1] && params[1].timer){
            this.setTimer(config);
        }
    },

    createItemList:function(list){
        if(list == null || Utils.next(list) == null)return;
        for(var i in this.item_list){
            this.item_list[i].suspendAllActions();
            this.item_list[i].setVisible(false);
        }
        var item = null;
        var scale = 0.8;
        var off = 6;
        var _x = 0;
        var _y = 0;
        var sum = list.length;
        var item_conf = null;
        var total_width = sum * 120 * scale + (sum - 1) * off;
        var start_x = 0;
        var index = 0;

        var max_width = Math.max(this.item_view.getContentSize().width, total_width)
        this.item_content.setContentSize(cc.size(max_width, this.item_view.getContentSize().height));

        for(var i in list){
            var bid = list[i];
            var num = 1;
            item_conf = Utils.getItemConfig(bid);
            if(item_conf){
                item = this.item_list[index];
                if(item == null){
                    var item = ItemsPool.getInstance().getItem("backpack_item");
                    if(this.item_view){
                        item.setParent(this.item_content)
                    }
                    this.item_list.push(item);
                    item.initConfig(false, scale, false, true);
                    item.show();
                }
                _x = start_x + (120 * scale + off) * (index) + 120*scale*0.5;
                item.setData({bid:bid, num:num});
                item.setPosition(_x, _y);
                item.setVisible(true);
                index = index + 1
            }
        }
    },
    
    setTimer:function(){
    var config = Config.activity_data.data_sign_info[this.id];
        if(this.timer_id){
            gcore.Timer.del(this.timer_id);
        }
        this.timer_id = gcore.Timer.set(function(){
            this.time = this.time - 1;
            if(this.time == 0){
                this.ctrl.openSignView(false);
            }else if(this.cancel_lab){
                this.cancel_lab.string = cc.js.formatStr("%s(%s)", config.cancel, this.time);
            }
        }.bind(this), 1000, this.time)
        this.cancel_lab.string = cc.js.formatStr("%s(%s)", config.cancel, this.time);
    },

    clickHandle:function(){
        if(this.id == ActivityConst.ActivitySignType.arena_champion){
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.champion_call);
        }else if(this.id == ActivityConst.ActivitySignType.arena_champion_guess){
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene, MainuiConst.sub_type.champion_call);
        }else if(this.id == ActivityConst.ActivitySignType.godbattle || this.id == ActivityConst.ActivitySignType.godbattle_sign){
            // if(GodbattleController:getInstance():getModel():getApplyStatus() == GodBattleConstants.apply_status.un_apply){
            //     GodbattleController:getInstance():requestApplyGodBattle()
            // }else{
            //     GodbattleController:getInstance():requestEnterGodBattle()
            // }
        }
    },


    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.item_list){
            this.item_list[i].deleteMe();
        }
        if(this.timer_id){
            gcore.Timer.del(this.timer_id);
        }
        this.item_list = null;
    },
})