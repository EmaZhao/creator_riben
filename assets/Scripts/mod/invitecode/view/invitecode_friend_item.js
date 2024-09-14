// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-29 14:54:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var FunctionTool = require("functiontool");
var ChatConst = require("chat_const");

var Invitecode_friendPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("invitecode", "invitecode_friend_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        this.btn_chat = this.seekChild("btn_chat");
        this.btn_chat.active = false;
        this.power_text_lb = this.seekChild("power_text", cc.Label);
        this.power_text_lb.string = "0";
        this.name_text_lb = this.seekChild("name_text", cc.Label);
        this.name_text_lb.string = "";

        this.player_head = new PlayerHead();
        this.player_head.setParent(this.main_container);
        this.player_head.show();
        this.player_head.setScale(1);
        this.player_head.setPosition(67, 62);

        this.vip_num_cr = this.seekChild("vip_num").getComponent("CusRichText");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        // Utils.onTouchEnd(this.btn_chat, function () {//屏蔽私聊
        //     if (this.data) {
        //         // var temp_data = {};
        //         // temp_data.rid = this.data.rid;
        //         // temp_data.srv_id = this.data.srv_id;
        //         require("chat_controller").getInstance().openChatPanel(ChatConst.Channel.Friend, "friend", this.data)
        //     }
        // }.bind(this), 1)
        if (this.player_head) {
            this.player_head.addCallBack(function () {
                if (this.data) {
                    var roleVo = require("role_controller").getInstance().getRoleVo();
                    var rid = this.data.rid;
                    var srv_id = this.data.srv_id;
                    if (roleVo.rid == rid && roleVo.srv_id == srv_id) return
                    var vo = { rid: rid, srv_id: srv_id };
                    require("chat_controller").getInstance().openFriendInfo(vo)
                }
            }.bind(this))
        }
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        var data = this.data;
        this.vip_num_cr.setNum(data.vip || 0);
        this.player_head.setHeadRes(data.face_id);
        this.player_head.setLev(data.lev);
        this.power_text_lb.string = data.power;

        var server_name = FunctionTool.getServerName(data.srv_id);
        var str = cc.js.formatStr("[%s]%s", server_name, data.name);
        this.name_text_lb.string = str;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})