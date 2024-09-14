// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     深海小程序客服
// <br/>Create: 2019-08-31 17:44:22
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LoginController = require("login_controller");

var Customer_serviceWindow = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mainui", "customer_service_view");
        // this.viewTag = SCENE_TAG.loading;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.is_move = false;
        this.touch_began = cc.v2(0,0);

        var size2 = cc.size(0,0);
        var loading_node = require("viewmanager").getInstance().getSceneNode(SCENE_TAG.msg);
        if(loading_node){
            size2 = loading_node.getContentSize();
        }

        this.size = size2;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    initPanel:function(){
        this.root_wnd.setPosition(cc.v2(-this.size.width/2+35, this.size.height/2-300));
        this.main_container = this.root_wnd.getChildByName("container");
        this.info_node = this.main_container.getChildByName("info_node");
        this.info_bg = this.info_node.getChildByName("info_bg");
        this.customer_service_btn = this.info_node.getChildByName("customer_service_btn");
        this.reset_btn = this.info_node.getChildByName("reset_btn");

        this.cur_timer = gcore.Timer.set(function () {
            if(this.info_node.active == false){
                var posX = -(this.size.width / 2);;
                if(this.root_wnd.getPosition().x>=0){
                    posX = this.size.width / 2;
                }
                this.root_wnd.runAction(cc.sequence(cc.moveTo(0.1,posX,this.root_wnd.y),cc.callFunc(function(){})));
            }
        }.bind(this), 4000);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.customer_service_btn, function(){
            this.info_node.active = false;
            if(PLATFORM_TYPR == "SH_SDK" && SDK){
                SDK.openCustomerServiceConversation();
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.reset_btn, function(){
            this.info_node.active = false;
            if(PLATFORM_TYPR == "SH_SDK"){
                if(IS_RESET == true)return;
                // cc.game.restart();
                IS_RESET = true;
                LoginController.getInstance().sender10312();
            }
        }.bind(this), 1)

        this.root_wnd.on("touchstart", function (event) {
            this.is_move = false
            this.touch_began = event.getLocation()
            if(this.root_wnd.getPosition().x<=-(this.size.width / 2)){
                this.root_wnd.x = -(this.size.width / 2) + 35;
            }else if(this.root_wnd.getPosition().x>=this.size.width / 2){
                this.root_wnd.x = this.size.width / 2-35;
            }
        }, this)
        this.root_wnd.on("touchmove", function (event) {
            // if(this.info_node.active == true){
            //     return;
            // }
            if (this.cur_timer) {
                gcore.Timer.del(this.cur_timer);
                this.cur_timer = null;
            }

            let pos = event.getLocation()
            if (!this.is_move) {
                let is_click = Math.abs(pos.x - this.touch_began.x) <= 30 && Math.abs(pos.y - this.touch_began.y) <= 30
                if (is_click == false) {
                    this.is_move = true;
                }
            }
            if (this.is_move) {
                pos = ViewManager.getInstance().getSceneNode(SCENE_TAG.loading).convertToNodeSpaceAR(pos)
                if (!this.checkPosInRect(pos)) return
                this.root_wnd.setPosition(pos)
                if(this.info_node.active == true){
                    this.info_node.active = false;
                }
            }
        }, this)
        this.root_wnd.on("touchend", function (event) {
            if (this.is_move == false) {
                Utils.playButtonSound(1);

                if(this.info_node.active == false){
                    if(this.root_wnd.getPosition().x>=0){
                        this.info_node.x = -73;
                        this.customer_service_btn.x = 8;
                        this.reset_btn.x = -56.4;
                    }else{
                        this.info_node.x = 73;
                        this.customer_service_btn.x = -8;
                        this.reset_btn.x = 56.4;
                    }
                }
                
                this.info_node.active = !this.info_node.active;
            }else{
                this.root_wnd.stopAllActions();
                var posX = -(this.size.width / 2) + 35;
                if(this.root_wnd.getPosition().x>=0){
                    posX = this.size.width / 2 - 35;
                }
                this.root_wnd.runAction(cc.sequence(cc.moveTo(0.1,posX,this.root_wnd.y),cc.callFunc(function(){})));
            }

            if (this.cur_timer) {
                gcore.Timer.del(this.cur_timer);
                this.cur_timer = null;
            }

            this.cur_timer = gcore.Timer.set(function () {
                if(this.info_node.active == false){
                    var posX = -(this.size.width / 2);
                     if(this.root_wnd.getPosition().x>=0){
                        posX = this.size.width / 2;
                    }
                    this.root_wnd.runAction(cc.sequence(cc.moveTo(0.1,posX,this.root_wnd.y),cc.callFunc(function(){})));
                }
            }.bind(this), 4000);
        }, this)
    },

    checkPosInRect:function(pos) {
        if(!this.size)return;

        let left_x = -(this.size.width / 2) + 35;
        let right_x = this.size.width / 2 - 35;
        let top_y = this.size.height / 2 - 35;
        let bottom_y = -(this.size.height / 2) + 35;
        if (pos.x < left_x) return false
        if (pos.y < bottom_y) return false
        if (pos.x > right_x) return false
        if (pos.y > top_y) return false
        return true
    },

    onShow: function (params) {
       
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.cur_timer) {
            gcore.Timer.del(this.cur_timer);
            this.cur_timer = null;
        }
    },
})