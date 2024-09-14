var ChatConst = require("chat_const");
var RoleEvent = require("role_event");

var ChatController = cc.Class({
    extends: BaseController,

    ctor: function() {
    	var ChatModel = require("chat_model");
    	this.model = new ChatModel(this);
        this.model.initConfig();
        this.chat_time = {};
    },

    registerEvents: function() {
        this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function() {
            gcore.GlobalEvent.unbind(this.init_role_event)
            this.model.initPrivatreTargets();
        }.bind(this))
        gcore.GlobalEvent.bind(RoleEvent.RefreshRoleLev, (function (key, val) {
          if(key == "lev"){
            if(!this.chat_window){
              return
            }
            if(val >=5){
              this.chat_window.setVisible(true);
            }else{
              this.chat_window.setVisible(false);
            }
          }
        }.bind(this)));
    },

    openChatPanel: function(channel, form, data) {
        if(game.preload_loading){
          return;
        }
        var open_parame = {};
        if (!this.chat_window) {
        	var ChatWindow = require("chat_window");
        	this.chat_window = new ChatWindow();
        }
        open_parame.channel = form;
        if (form == "friend") {
            this.model.addPrivateTarget(data);
            open_parame.channel = ChatConst.Channel.Friend;
            open_parame.friend_data = data;
        }
        if (!this.chat_window.getVisible()) {
            this.chat_window.setVisible(true,open_parame);        
        } else {
        	this.chat_window.open(open_parame);
        }
    },

    closeChatPanel: function() {
        if (this.chat_window) {
            var PromptController = require("prompt_controller")
            var PromptTypeConst = require("prompt_type_const")
            PromptController.getInstance().getModel().removePromptDataByTpye(PromptTypeConst.Private_chat)
            PromptController.getInstance().getModel().removePromptDataByTpye(PromptTypeConst.At_notice)
            // this.chat_window.close();
            // this.chat_window = null;
            if(!window.IS_PC){
              this.chat_window.setVisible(false);
            }
            var MainUIController = require("mainui_controller");
            MainUIController.getInstance().showChatBtn(true);
        }
    },
    initData: function() {

    },

    getModel: function() {
        return this.model
    },

    initConfig: function(){
        var ChatModel = require("chat_model");
        this.model = new ChatModel();
        this.model.initConfig();
        this.is_first = true;
        this.pro_12766 = true;
        this.stack_id = 0;
    },

    registerProtocals: function() {
        this.RegisterProtocal(12720, this.handle12720);         // 私聊
        this.RegisterProtocal(12721, this.handle12721);         // 推送私聊消息
        this.RegisterProtocal(12722, this.handle12722);         // 登陆推送私聊信息
        this.RegisterProtocal(12725, this.handle12725);         // 语音信息
        this.RegisterProtocal(12726, this.handle12726);         // 下载语音信息
        this.RegisterProtocal(12741, this.handle12741);         // 提示
        this.RegisterProtocal(12743, this.handle12743);         // 系统提示&聊天提示
        this.RegisterProtocal(12799, this.handle12799);         // 消息发送

        this.RegisterProtocal(12761, this.handle12761);         // 接受通用聊天
        this.RegisterProtocal(12762, this.handle12762);         // 发送通用聊天
        this.RegisterProtocal(12763, this.handle12763);         // 服务端分发翻译
        this.RegisterProtocal(12766, this.handle12766);         // 登录聊天记录

        this.RegisterProtocal(12771, this.handle12771);         // 聊天玩家队伍id

        this.RegisterProtocal(12767, this.handle12767);         // 聊天@
        this.RegisterProtocal(12768, this.handle12768);         // 已查看
    },
    isChatOpen(){
        if(this.chat_window){
            return this.chat_window.getVisible()
        }
        return false
    },

    /**
     * 发送翻译后的文字消息
     * @author zhanghuxing 2019-01-03
     * @param  {[type]} msg       [description]
     * @param  {[type]} channel   [description]
     * @param  {[type]} taken_obj [description]
     * @return {[type]}           [description]
     */
    sendVoidMsg: function(msg, channel, taken_obj) {
        if (channel == ChatConst.Channel.Friend) {
            this.sender12720();
        } else {
            this.sender12762();
        }
    },

    /**
     * 发送文字信息
     * @author zhanghuxing 2019-01-03
     * @param  {[type]} msg       [description]
     * @param  {[type]} channel   频道
     * @param  {[type]} taken_obj [description]
     * @param  {[type]} len       [description]
     * @return {[type]}           [description]
     */
    sendMessage: function(channel, msg, len, to_srv_id, to_rid,name) {
        cc.log("chat__________",msg,channel, len, to_srv_id, to_rid)

        if (channel == ChatConst.Channel.Friend) {
            this.sender12720(to_srv_id, to_rid, msg, len,name);
        } else {
            this.sender12762(channel, msg, len);
        }
    },


	sender12720: function(to_srv_id, to_rid, msg, len,name) {        // 发起私聊
        var msg_data = {};
        msg_data.to_srv_id = to_srv_id;
        msg_data.to_rid = to_rid;
        msg_data.msg = msg;
        msg_data.len = len;

        this.SendProtocal(12720, msg_data);
        // cc.log("sl---------------",to_rid.split("_"))
        //爱微游渠道聊天监控
        if(window.CHANNEL == "AIWEIYOU_PID"){
            let rid = null;
            to_rid = String(to_rid);
            let arr = to_rid.split("_");
            rid = arr[1];
            sdk.chatMonitor({
                to_srv_id:to_srv_id,
                to_rid:rid,
                type:1,//1表示私聊
                name:name,
                msg:msg
            })
        }
	},                                                          

	handle12720: function(data) {                               // 私聊失败提示
        cc.log("私聊失败");
        cc.log(data);
        if(data.code == 0){
            message(data.msg)
        }

	},

	handle12721: function(data) {                               // 收到私聊消息
        cc.log("私聊消息");
        cc.log(data);
        if (data)
            this.model.addPrivateMsg(data);
	},

	handle12722: function(msg_datas) {                               // 登陆推送离线私聊信息
        cc.log("离线私聊消息");
        cc.log(msg_datas);

        if (msg_datas && msg_datas.offline_list.length > 0) {
            var offline_Info = null;
            for (var offline_i = 0; offline_i < msg_datas.offline_list.length; offline_i++) {
                offline_Info = msg_datas.offline_list[offline_i];
                if (offline_Info.msg_list && offline_Info.msg_list) {
                    for (var msg_i = 0;  msg_i < offline_Info.msg_list.length; msg_i++) {
                        var msg_info = Utils.deepCopy(offline_Info);
                        delete msg_info.msg_list;
                        msg_info.msg = offline_Info.msg_list[msg_i].msg;
                        msg_info.len = offline_Info.msg_list[msg_i].len;
                        msg_info.tick = offline_Info.msg_list[msg_i].tick;
                        msg_info.offline = true;
                        msg_info.flag = 2;
                        this.model.addOutlinePrivateMsg(msg_info);
                    }
                }
            }
        }
	},

    // 通知服务端已读消息
    sender12723: function(srv_id, rid) {
        if (srv_id === null || rid === null) return
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(12723, protocal);
    },

	handle12725: function(data) {                               // 语音信息

	},

	handle12726: function(data) {                               // 下载语音信息

	},

    handle12741: function(data) {                               // 提示
        message(data.msg);
	},

	handle12743: function(data) {                               // 系统提示&聊天提示（在聊天框显示）
        message(data.msg);
        var sys_msg = {};
        sys_msg.len = 0;
        sys_msg.channel = ChatConst.Channel.System;
        sys_msg.role_list = {};
        sys_msg.msg = data.msg;
        this.handle12761(sys_msg,true);
	},

	handle12799: function(data) {                               // 消息发送

	},

	handle12761: function(data) {                               // 接受通用聊天
        if (!data) return

        if (this.pro_12766 && !this.is_first) 
            this.pro_12766 = false;

        this.is_first = false;
        this.model.addNormalChatMsg(data.channel, data);

        this.handle12761__(data)
	},
    handle12761__(data){
        let channel = data.channel
        if(channel == ChatConst.Channel.System || channel == ChatConst.Channel.NoticeTop || channel == ChatConst.Channel.System1 || channel == ChatConst.Channel.SystemTop){
            let msg = data.msg
            msg = StringUtil.parseStr(msg).string
            GlobalMessageMgr.getInstance().showMoveHorizontal(msg,new cc.Color(255,255,255))
        }
    },
	

    sender12762: function(channel, msg, len) {                  // 发起通用聊天
        if (!channel || !msg || !len) return;
        var sender_data = {};
        sender_data.channel = channel;
        sender_data.msg = msg;
        sender_data.len = len;

        // 判断时间
        var canSend = this.canSend(channel);

        if (canSend) {
            this.SendProtocal(12762, sender_data);
            this.saveChatTime(channel);            
        } else {
            var cur_time = gcore.SmartSocket.getTime(); 
            var last_time = this.chat_time["sec_" + channel];
            var time_index = ChatConst.ChatTimeIndex[channel];
            var time_info = SayConfig[time_index];
            if (time_info) {
                let time = time_info.val + last_time - cur_time
                time = time || 1
                message(cc.js.formatStr(Utils.TI18N("距离下次发言还剩下%d秒"), time));
            }
        }
    },

    canSend: function(channel) {
        if (!this.chat_time["sec_" + channel]) return true;

        var last_time = this.chat_time["sec_" + channel];
        var cur_time = gcore.SmartSocket.getTime();
        var time_index = ChatConst.ChatTimeIndex[channel];
        var time_info = SayConfig[time_index];

        if (time_info) {
            if (time_info.val + last_time < cur_time)
                return true
        }
        return false;
    },

    saveChatTime: function(channel) {
        var cur_time = gcore.SmartSocket.getTime();
        var chat_index = "sec_" + channel;
        // if (!this.chat_time[chat_index])
        this.chat_time[chat_index] = cur_time;
    },

	handle12762: function(data) {                               // 发送通用聊天结果
        cc.log("发送通用聊天结果");
        cc.log(data);
        if (data.code == 0)
            message(data.msg);            
	},

	handle12763: function(data) {                               // 服务端分发翻译

	},

	handle12766: function(data) {                               // 登录聊天记录
        if (this.pro_12766) {
            this.pro_12766 = false;
            for (var msg_i in data.msg_list) {
                this.handle12761(data.msg_list[msg_i]);
            }
            this.pro_12766 = true;
        }
	},

	handle12771: function(data) {                               // 聊天玩家队伍id

	},

	handle12767: function(data) {                               // 聊天@
        this.model.setAtData(data);
        if (this.chat_window) {
            this.chat_window.showAtNotice(true, data);
        }
    },

    // 已查看艾特信息
    sender12768: function(rid, srv_id, channel, msg) {
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        protocal.channel = channel;
        protocal.msg = msg;
        this.SendProtocal(12768, protocal);
    },

    handle12768: function(data) {// 已查看@

	},

    // 聊天记录唯一ID
    getUniqueId: function() {
        if (this.stack_id == null) {
            this.stack_id = 0;
        }
        this.stack_id = this.stack_id + 1;
        return this.stack_id;
    },

    // 打开好友信息界面
    openFriendInfo: function(data) {
        var FriendController = require("friend_controller");
        FriendController.getInstance().openFriendCheckPanel(true, data);
    },


    // 返回聊天的输入组件
    getChatInput: function() {
        if (this.chat_window) {
            if (this.chat_window.chat_input_panel) {
                return this.chat_window.chat_input_panel;
            }
        }
    },

    //  @人
    chatAtPeople: function(name, srv_id) {
        var chatInput = this.getChatInput();
        if (chatInput) {
            chatInput.setInputText("@" + name + " ", srv_id);
        }
    },

    // 返回信息的id
    getId: function(channel, srv_id, rid, name, msg) {
        var list = this.model.getChannelMsgs(channel);
        
        var id = 1;
        for (var i = 0,l = list.length;i<l;i++) {
            if (list[i].role_list && list[i].role_list[0]) {
                var v = list[i].role_list[0];
                if (srv_id == v.srv_id && rid == v.rid && name == v.name && msg == list[i].msg) {
                    id = list[i].id;
                }
            }
        }
        return id;
    }

})
module.exports = ChatController;