// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     通用获得道具展示显示面板,这边只支持物品样式的不支持其他任何样式的
// <br/>Create: 2019-03-01 09:54:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var MainuiEvent = require("mainui_event");
var MainuiConst = require("mainui_const");
var SeerpalaceController = require("seerpalace_controller");
var LoginPopupManager = require("LoginPopupManager");

var Item_exhibitionWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mainui", "item_exhibition_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.controller = require("mainui_controller").getInstance();
        this.open_type = MainuiConst.item_open_type.normal;
        this.start_y = 20;
        this.space = 40;
        this.col = 4;
        this.cache_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild("background");                 // 背景
        this.background.scale = FIT_SCALE;
        this.confirm_btn = this.seekChild("confirm_btn");               // 点击空白处关闭
        this.close_btn = this.seekChild("close_btn");
        this.close_btn_label = this.close_btn.getChildByName("label").getComponent(cc.Label);
        this.fun_btn = this.seekChild("fun_btn");
        this.fun_btn_label = this.fun_btn.getChildByName("label").getComponent(cc.Label);
        this.skeleton = this.seekChild("title_container", sp.Skeleton);       // 特效
        this.scroll_view = this.seekChild("scroll_view").getComponent(cc.ScrollView);
        this.content = this.seekChild("content");                       // 滚动容器
        this.notice_label = this.seekChild("notice_label", cc.Label);   // 额外描述

        this.scroll_height = this.content.height;                       // 获取控件高度
        this.scroll_width = this.content.width;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function(){
            if(!this.open_type || this.open_type == MainuiConst.item_open_type.normal){
                this.onClickClose();
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.confirm_btn, function () {
            this.onClickClose();
        }.bind(this), 1)

        //关闭按钮
        Utils.onTouchEnd(this.close_btn, function () {
            this.onClickClose();
        }.bind(this), 2)

        //功能按钮
        Utils.onTouchEnd(this.fun_btn, function () {
            this.onClickFunBtn();
        }.bind(this), 2)
    },

    onClickClose:function(){
        this.controller.openGetItemView(false);
        ActionController.getInstance().checkOpenActionLimitGiftMainWindow()
        // GlobalEvent:getInstance():Fire(BattleEvent.NEXT_SHOW_RESULT_VIEW)
    },

    onClickFunBtn:function(){
        if(this.open_type == MainuiConst.item_open_type.seerpalace){
            let group_id = SeerpalaceController.getInstance().getModel().getLastSummonGroupId();
            if(group_id != null && group_id != 0){
                SeerpalaceController.getInstance().requestSeerpalaceSummon(group_id);
            }
            this.onClickClose();
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    //{list:list, source:source}
    openRootWnd:function(params){
        // cc.error(params);
        Utils.playButtonSound("c_get");

        if(this.create_hanlder){
            this.stopUpdate(this.create_hanlder);
            this.create_hanlder = null;
        }
        this.start_y = 20;
        this.render_list = params.list;
        var source = params.source;
        this.extend = params.extend;
        this.open_type = params.open_type;

        if(this.open_type == MainuiConst.item_open_type.normal){
            this.close_btn.active = false;
            this.fun_btn.active = false;
            this.confirm_btn.active = true;
        }else if(this.open_type == MainuiConst.item_open_type.seerpalace){
            this.close_btn.active = true;
            this.fun_btn.active = true;
            this.confirm_btn.active = false;
            this.close_btn_label.string = Utils.TI18N("确定");
            this.fun_btn_label.string = Utils.TI18N("再次召唤");
        }

        this.handleEffect();
        this.updateData();
    },

    // 创建title展示动画
    handleEffect:function(){
        var resources_path = PathTool.getSpinePath("E51020");
        this.loadRes(resources_path, function (res_object) {
            this.skeleton.skeletonData = res_object;
            this.skeleton.setAnimation(0, PlayerAction.action_3, false)
        }.bind(this))
    },

    // 创建物品单例
    updateData:function(){
        for(let i in this.cache_list){
            if(this.cache_list[i]){
                this.cache_list[i].deleteMe()
                this.cache_list[i] = null;
            }
        }
        this.cache_list = {};
        var sum = this.render_list.length;
        this.row = Math.ceil(sum / this.col);
        var max_height = this.start_y + (this.space + 120) * this.row;
        this.max_height = Math.max(max_height, this.scroll_height);
        this.content.height = this.max_height;
        this.scroll_view.scrollToTop(0);
        if(sum >= this.col){
            sum = this.col;
        }
        var total_width = sum * 120 + (sum - 1) * this.space;
        this.start_x = (this.scroll_width - total_width) * 0.5;
        if(this.row == 1){
            this.start_y = this.max_height * 0.5;
        }else{
            this.start_y = this.max_height - this.start_y - 60;
        }
        if (this.create_hanlder == null){
            this.create_hanlder = this.startUpdate(this.render_list.length, this.creatItem.bind(this));
        }
    },

    // 分帧创建
    creatItem:function(index){
        if (this.cache_list[index] == null){
            var _x = this.start_x + 60 + (index % this.col) * (120 + this.space);
            var _y = this.start_y - Math.floor(index / this.col) * (120 + this.space);

            var item = Utils.createClass("item_exhibition_list_panel");
            item.setParent(this.content);
            item.show(this.render_list[index]);
            item.setPosition(_x, _y);
            this.cache_list[index] = item;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.cache_list){
            for(let i in this.cache_list){
                this.cache_list[i].deleteMe()
                this.cache_list[i] = null 
            }
        }
        gcore.GlobalEvent.fire(MainuiEvent.CLOSE_ITEM_VIEW,this.extend)
        this.controller.openGetItemView(false);
        if(LoginPopupManager.getInstance().getIsPopupStatus()){
          gcore.GlobalEvent.fire(EventId.POPUP_DORUN);
        }
    },
})
