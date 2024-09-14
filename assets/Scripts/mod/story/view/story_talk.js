// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-17 11:01:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StoryEvent = require("story_event");

var StoryTalkPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("drama", "dramatalk_view");

        this.talk_view = arguments[0];
    },

    // 可以初始化声明一些变量的
    initConfig:function() {
        this.item_info_list   = [];
        this.item_show_list   = [];      // 非头部的聊天对象
        this.head_item_height = 192;
        this.item_height      = 140;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.head_msg_nd      = this.seekChild("head_msg");
        this.item_nd          = this.seekChild("talk_item");
        this.items_con_nd     = this.seekChild("items_con");
        this.mask_bg_nd       = this.seekChild("mask_bg");
        this.image_bg_nd      = this.seekChild("image_bg");
        this.mask_bg_nd.scale = FIT_SCALE;
        this.image_bg_nd.width = this.image_bg_nd.width * FIT_SCALE;
        
        this.left_ani_nd      = this.seekChild("left_ani");
        this.left_ani_sp      = this.seekChild("left_ani", sp.Skeleton);

        // this.head_msg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickHeadMsg, this);
        this.items_con_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMsgCon, this);
        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMaskBg, this);

        if (!this.statu)
            this.root_wnd.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if (this.item_info_list.length > 0) {
            for (var info_i in this.item_info_list) {
                this.addMessageItem(this.item_info_list[info_i]);
            }
        }

        if (params) 
            params();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },

    addMessage: function(type, bid, actiontype, name, msg) {
        type = type || 1;
        actiontype = actiontype || 1;
        var index = this.item_info_list.length;
        var item_info = {type: type, bid: bid, actiontype: actiontype, name: name, msg: msg, index: index};
        this.item_info_list.push(item_info);
        if (this.root_wnd)
            this.addMessageItem(item_info);
    },

    addMessageItem: function(item_info) {
        var msg_num = this.item_info_list.length;
        var space_y = -18;    //顶部消息和底部消息的差
        this.max_height = (msg_num - 1) * this.item_height + this.head_item_height;
        this.max_height = Math.max(this.max_height, this.items_con_nd.height);
        this.items_con_nd.height = this.max_height;

        this.refreshTopItem(item_info);
        if (item_info && this.item_info_list.length > 1) {
            var new_noral_data = this.item_info_list[this.item_info_list.length - 2];
            this.updateNomalMsgs();
            this.createNormalItem(new_noral_data);
        }
        this.showRoleSpine(item_info.type, item_info.bid, item_info.actiontype)
    },

    createNormalItem: function(data) {
        var show_item = {};
        var item_nd = show_item["item_nd"]  = cc.instantiate(this.item_nd);
        var act_nd  = show_item["act_nd"]   = this.seekChild(item_nd, "nor_msg");
        var name_lb = show_item["name_lb"]  = this.seekChild(item_nd, "nor_name", cc.Label);
        var msg_rt  = show_item["msg_rt"]  = this.seekChild(item_nd, "msg_txt", cc.RichText);

        act_nd.string = data.name;
        msg_rt.string = data.msg;

        this.items_con_nd.addChild(item_nd);
        item_nd.position = cc.v2(0, -this.head_item_height);
        this.item_show_list.push(show_item);

        this.runNodeAct(item_nd);
    },

    updateNomalMsgs: function() {
        for (var item_i in this.item_show_list) {
            this.item_show_list[item_i]["item_nd"].y -= this.item_height;
            this.runNodeAct(this.item_show_list[item_i]["item_nd"]);
        }
    },

    // 刷新顶部固定的对话框
    refreshTopItem: function(data) {
        var act_nd = this.seekChild(this.head_msg_nd, "msg_con");
        var name_lb = this.seekChild(this.head_msg_nd, "name", cc.Label);
        var name_rt = this.seekChild(this.head_msg_nd, "msg_txt", cc.RichText);

        this.runNodeAct(act_nd);

        name_lb.string = data.name;
        name_rt.string = data.msg;
        this.can_click = false;

        // 设置可触摸时间
        var cal_fun = cc.callFunc(function() {
            this.can_click = true;
        }, this);
        var delay_act = cc.delayTime(0.5);
        var act_queque = cc.sequence(delay_act, cal_fun);
        this.root_wnd.runAction(act_queque);
    },

    runNodeAct: function(act_nd) {
        if (!act_nd) return;
        act_nd.y += act_nd.height;

        var action = cc.moveBy(0.2, cc.v2(0, -act_nd.height));
        act_nd.runAction(action);
    },

    showRoleSpine: function(dirType, effid, actionType) {
        var action = this.getSpineActionName(actionType);
        var eff_name = PathTool.getEffectRes(effid);
        var eff_path = PathTool.getSpinePath(eff_name);

        this.loadRes(eff_path, function(action, eff_sd) {
            this.left_ani_sp.skeletonData = eff_sd;
            this.left_ani_sp.setAnimation(0, action, true);
        }.bind(this, action));
        if (dirType === 1) {                             // 左侧动画

        } else if (dirType === 2) {                      // 右侧动画

        }
    },

    getSpineActionName: function(actionType) {
        var action = "action"
        if (actionType && typeof actionType == "number")
            action = "action" + actionType;
        return "action"
    },

    clearData: function() {
        this.item_info_list = [];
        for (var item_i in this.item_show_list) {
            this.item_show_list[item_i]["item_nd"].destroy();
        }
        this.item_show_list = [];
        this.items_con_nd.height = 680;
    },

    onClickMsgCon: function() {
        if (this.can_click) {
            this.playNextAcrt();
        }
    },

    playNextAcrt: function() {
        gcore.GlobalEvent.fire(StoryEvent.PLAY_NEXT_ACT);
    },

    onClickMaskBg: function() {
        if (this.can_click) {
            this.playNextAcrt();
        }        
    },

    changeStatus: function(statu) {
        this.statu = statu;
        if (statu) {
            if (this.root_wnd)
                this.root_wnd.active = true;
        } else {
            if (this.root_wnd)
                this.root_wnd.active = false;
        }
    }
})