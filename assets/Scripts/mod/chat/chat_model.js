var ChatConst = require("chat_const");
var ChatEvent = require("chat_event");
var RoleController = require("role_controller")

var ChatModel = cc.Class({
    extends: BaseClass,

    properties: {
    	stack_list: {
    		default: {}
    	},
    	stack_limit: {
    		default: {}
    	},
        outline_msgs: {
            default: {}
        },
        private_targets: null,  // 私聊对象
        role_vo: null,
    },

    ctor: function () {
        this.ctrl = arguments[0];
    },

    initConfig: function () {
        this.unread_msgs = {};                        // 未读消息
        for (var channel_i in ChatConst.Channel) {
            this.unread_msgs[ChatConst.Channel[channel_i]] = 0;
        }

        for (var channelIndex in ChatConst.Channel) {
        	this.stack_list[channelIndex] = [];
        }
    },

    initChatMsg: function() {

    },

    // 添加私聊对象
    addPrivateTarget: function(target_data) {
        if (!target_data) return;
        if (!this.private_targets) this.initPrivatreTargets();
        for (var target_i in this.private_targets) {
            if (this.private_targets[target_i] && this.private_targets[target_i].srv_id === target_data.srv_id && this.private_targets[target_i].rid === target_data.rid)
                return;
        }
        this.private_targets.push(target_data);
        var role_vo = RoleController.getInstance().getRoleVo();
        cc.sys.localStorage.setItem("rec_private" + role_vo.srv_id + role_vo.rid, JSON.stringify(this.private_targets));
        
    },

    deltePrivateTarget: function(friend_vo) {
        var role_vo = RoleController.getInstance().getRoleVo();
        cc.sys.localStorage.removeItem("rec_private" + role_vo.srv_id + role_vo.rid);

        var private_index = friend_vo.srv_id + friend_vo.rid;
        var stack_list = cc.sys.localStorage.removeItem(role_vo.srv_id + role_vo.rid + private_index);

        for (var target_i in this.private_targets) {
            var target_data = this.private_targets[target_i];
            var target_index = target_data.srv_id + target_data.rid;
            if (private_index == target_index) {
                this.private_targets.splice(target_i, 1);
            }
        }

        delete this.stack_list[private_index]
    },

    getPrivateTarget: function(rid) {
        if (rid) {
            for (var friend_i in this.private_targets) {
                if (this.private_targets[friend_i].rid == rid) {
                    return this.private_targets[friend_i]
                }
            }
        }
    },

    // 获取所有私聊对象
    getPrivateTargets: function() {
        if (!this.private_targets)
            this.initPrivatreTargets();

        cc.log(this.private_targets);

        return this.private_targets
    },

    initPrivatreTargets: function() {
                
        if (!this.private_targets) {
            var role_vo = RoleController.getInstance().getRoleVo();
            var targets_info = cc.sys.localStorage.getItem("rec_private" + role_vo.srv_id + role_vo.rid);
            if (targets_info) {
                this.private_targets = JSON.parse(targets_info);
            } else {
                this.private_targets = [];
            }
        }
    },

    // 从本地初始化私聊消息 
    initPrivateMsg: function(private_index) {
        if (!private_index) return;
        var role_vo = RoleController.getInstance().getRoleVo();
        var stack_list = JSON.parse(cc.sys.localStorage.getItem(role_vo.srv_id + role_vo.rid + private_index));
        this.stack_list[private_index] = stack_list || [];
    },


    // 添加通用消息
    addNormalChatMsg: function(channel, msgData) {
        if (!channel || !msgData) return;
        if(channel == 48){//传闻左下和顶 暂时处理为普通传闻
            msgData.subChanner = channel;
            channel = ChatConst.Channel.System;
            msgData.channel = channel;
        }
        if(channel == 256){//传闻左下和顶 暂时处理为普通传闻
          msgData.subChanner = channel;
          channel = ChatConst.Channel.Gang;
          msgData.channel = channel;
        }
        if(channel == ChatConst.Channel.System || channel == ChatConst.Channel.NoticeTop || channel == ChatConst.Channel.System1 || channel == ChatConst.Channel.SystemTop){
          return;
        }
        var channel_index = this.getChannelIndex(channel);
        if (!channel_index) return;
        var add_unread = true;
        if (this.stack_list[channel_index].length > ChatConst.ChannelLimit[channel_index]) {
            var msg_data = this.stack_list[channel_index].shift();
            gcore.GlobalEvent.fire(ChatEvent.MassageDelete, msg_data);
            if (this.unread_msgs[channel] >= ChatConst.ChannelLimit[channel_index])
                add_unread = false;
        }
        msgData.id = this.ctrl.getUniqueId();
        this.stack_list[channel_index].push(msgData);
        if (msgData.flag !== 1 && add_unread)
            this.addUnreadNum(channel);
        gcore.GlobalEvent.fire(ChatEvent.MassageUpdate, msgData);
    },

    // 添加离线私聊消息
    addOutlinePrivateMsg: function(msg_data) {
        var private_index = msg_data.srv_id + msg_data.rid;
        if (!this.outline_msgs[private_index])
            this.outline_msgs[private_index] = [];
        this.outline_msgs[private_index].push(msg_data);
        this.addUnreadNum(ChatConst.Channel.Friend);
    },

    // 添加私聊消息
    addPrivateMsg: function(msg_data, had_read) {
        if (!msg_data) return
        if (msg_data instanceof Array) {
            for (var msg_i in msg_data)
                this.addPrivateMsg(msg_data[msg_i]);
        } else {
            // 判断是否有私聊对象
            var have_target = false;
            for (var target_i in this.private_targets) {
                if (this.private_targets[target_i].rid == msg_data.rid) {
                    have_target = true;
                    break;
                }
            }

            if (!have_target) {
                var FriendController = require("friend_controller");
                var target_data = FriendController.getInstance().getModel().getFriendInfo(msg_data.srv_id, msg_data.rid);
                if (target_data) {
                    this.addPrivateTarget(target_data);
                }
            }

            var private_index = msg_data.srv_id + msg_data.rid
            if (!this.stack_list[private_index])
                this.initPrivateMsg(private_index);

            if (this.stack_list[private_index].length > ChatConst.ChannelLimit.Friend) {
                var msg_data = this.stack_list[private_index].shift();
                var notice_info = {};
                notice_info.msg_data = msg_data;
                notice_info.channel = ChatConst.Channel.Friend;
                gcore.GlobalEvent.fire(ChatEvent.PrivateMassageDelete, notice_info);
            }

            var notice_info = {};
            msg_data.id = this.ctrl.getUniqueId();
            notice_info.msg_data = msg_data;
            notice_info.channel = ChatConst.Channel.Friend;
            this.stack_list[private_index].push(msg_data);

            var role_vo = RoleController.getInstance().getRoleVo();
            cc.sys.localStorage.setItem(role_vo.srv_id + role_vo.rid + private_index, JSON.stringify(this.stack_list[private_index]));

            if (msg_data.flag !== 1 && !had_read)
                this.addUnreadNum(ChatConst.Channel.Friend);

            gcore.GlobalEvent.fire(ChatEvent.PrivateMassageUpdate, notice_info);
        }
    },

    // 获取私聊消息
    getPrivateMsgs: function(srv_id, rid) {
        var private_index = srv_id + rid;
        if (!this.stack_list[private_index])
            this.initPrivateMsg(private_index);

        if (this.outline_msgs[private_index] && this.outline_msgs[private_index].length > 0) {
            while(this.outline_msgs[private_index].length > 0) {
                var mes_data = this.outline_msgs[private_index].shift();
                this.addPrivateMsg(mes_data, true);
            }
            this.ctrl.sender12723(srv_id, rid);
        }

        var sort_fun = function(msg1, msg2) {
            return msg1.tick - msg2.tick;
        }

        cc.log(this.stack_list[private_index].sort(sort_fun));
        return this.stack_list[private_index].sort(sort_fun);
    },

    getChannelIndex: function(channel) {
    	var channel_tag;
    	for (var channel_index in ChatConst.Channel) {
    		if (ChatConst.Channel[channel_index] == channel) channel_tag = channel_index;
    	}
    	return channel_tag;
    },

    getChannelMsgs: function(channel) {
    	var channel_index = this.getChannelIndex(channel);
    	if (this.stack_list[channel_index]) return this.stack_list[channel_index];
    	return {}
    },

    cleanUnredNum: function(channel) {
        if (this.unread_msgs[channel] > 0) {
            this.unread_msgs[channel] = 0;
            gcore.GlobalEvent.fire(EventId.CHAT_NEWMSG_FLAG);
        }
    },

    addUnreadNum: function(channel, num) {
        num = num || 1;
        this.unread_msgs[channel] += num;

        gcore.GlobalEvent.fire(EventId.CHAT_NEWMSG_FLAG);
    },

    getUnreadNum: function(channel) {
        if (channel) {
           return this.unread_msgs[channel];
        } else {
            var total_num = 0;
            var role_vo = RoleController.getInstance().getRoleVo();
            for (var channel_i in this.unread_msgs) {
                if ((channel_i == 1024 && role_vo && role_vo.lev < 50) || (channel_i == 4 && role_vo && !role_vo.gid)) {
                    continue;
                }
                total_num += this.unread_msgs[channel_i];
            }
            return total_num;
        } 
        return 0;
    },

    saveTalkTime:function(srv_id,rid){
        // var time = gcore.SmartSocket.getTime();
        // var vo = require("role_controller").getInstance().getRoleVo();
        // var key_str = cc.js.formatStr("%s_%s_%d","friend_info",vo.srv_id,vo.rid);

    },

    // 存一下最新的艾特数据
    setAtData:function( data ){
        this.at_data = data;
    },

    getAtData:function(  ){
        return this.at_data;
    },

})