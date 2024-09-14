var ChatConst          = require("chat_const");
var ChatEvent          = require("chat_event");
var ChatItem           = require("chat_item");
var ChatItemController = require("chat_item_controller");
var ActivityEvent = require("activity_event");

var FRIEDN_CHAT_HEIGHT = 670;
var NORMAL_CHAT_HEIGHT = 794;

var ChatWindow = cc.Class({
	extends: BaseView,

	properties:{
		role_vo: null,                          // 角色信息
		channel: null,                    // 当前频道
		last_channel: null,
		prefabPath: null,
		chat_taps: {
			default: {}
		},
		cut_tap: null,                    // 当前选中的标签
		msgs_content: cc.Node,
		chat_items: {
			default: {}
		},
		chat_items_cache: [],
		is_update: false,                 // 消息列表更新中
		update_index: 0,                  // 消息更新序号
		chat_msgs: {
			default: {}
		},
		content_info: {                   // 不同channel content高度
			default: {}
		},
		channel_tg: {
			default: {},
		},
		channel_red: {
			default: {},
		},
		private_targets: null,
		chat_friends: {
			default: {}
		},
		cur_friend: null,                 // 当前私聊对象
		cur_friend_tap: null,             // 当前私聊对象标签页面
		chat_items_index: "",             // 当前聊天索引
		scroll_dis: 0,
	},

	ctor: function() {
        this.prefabPath = require("pathtool").getPrefabPath("chat", "chat_window");
        if(window.IS_PC){
          this.viewTag = SCENE_TAG.pcLeft;
        }else{
          this.viewTag = SCENE_TAG.top;
        }
        var RoleController = require("role_controller")
        this.role_vo = RoleController.getInstance().getRoleVo();

        this.ctrl = require("chat_controller").getInstance();
        this.model = this.ctrl.getModel();

        if (!this.timer){
            this.timer = gcore.Timer.set((function(){
                this.mainLoop();
            }).bind(this), 100, -1);
        }

        this.chat_item_ctrl = ChatItemController.getInstance();
        this.pc_type = 1//1是默认打开2是默认关闭mainpanel
	},

	openCallBack: function() {
		this.msg_nd = this.seekChild("msg_rt");
		this.msg_rt = this.seekChild("msg_rt", cc.RichText)
    this.mainPanel = this.seekChild("mainPanel");

		// 半透区域
		this.mask_node = this.seekChild("masknd");
        this.mask_node.scale = FIT_SCALE;
		var graphics_cp = this.mask_node.addComponent(cc.Graphics);
        graphics_cp.clear();
        graphics_cp.fillColor = cc.color(0, 0, 0, 128);
        graphics_cp.rect(-this.root_wnd.width * 0.5,  -this.root_wnd.height * 0.5, this.root_wnd.width, this.root_wnd.height);
        graphics_cp.fill();

		// 背景
		this.main_bg_nd        = this.seekChild("main_bg");

        // 聊天区域
		this.contern_bg_nd     = this.seekChild("contern_bg");
		this.scrollview_nd     = this.seekChild("scrollview_mgs");
		this.scrollview_mgs_sc = this.seekChild("scrollview_mgs", cc.ScrollView)
		this.view_nd 	       = this.seekChild("scrollview_view");
		this.msgs_content      = this.seekChild("content_msgs");
        this.scrollview_nd.on("scrolling", this.contentScrolling.bind(this))

        // enpty
        // this.empty_tips_nd     = this.seekChild("empty_tips");
        // this.empty_desc_lb     = this.seekChild("empty_desc", cc.Label);

        // 私聊区域
		this.private_add_bg_nd = this.seekChild("private_add_bg");
		this.private_add_nd    = this.seekChild("private_add");
		this.private_nd        = this.seekChild("friends_sv");
		this.private_contend   = this.seekChild("friends_content");
		this.private_add_nd.on(cc.Node.EventType.TOUCH_END, this.onClickAddPriBtn, this);

        // 聊天标签
        for (var tab_index = 1; tab_index <= 6; tab_index++) {
        	var tab_nd = this.seekChild("toggle" + tab_index);
        	tab_nd.tag_1 = tab_index;
        	tab_nd.on('toggle', this.checkToggle, this);
        	tab_nd.on(cc.Node.EventType.TOUCH_END, this.didClickTap, this);
        	var tab_lb = this.seekChild("chat_tap_" + tab_index);
        	this.chat_taps["chat_tap_" + tab_index] = tab_lb;

        	var tab_tg = tab_nd.getComponent(cc.Toggle);
			this.channel_tg[tab_index] = tab_tg;
			
			var tab_red = tab_nd.getChildByName("red");
			var tab_red_lb = tab_red.getChildByName("red_num").getComponent(cc.Label);
			this.channel_red[tab_index] = { red: tab_red, num: tab_red_lb };
        }

		this.notice_node = this.seekChild("notice_node");
		this.notice_node.active = false;
		this.notice_lab = this.seekChild("notice_label",cc.Label);
		this.notice_lab.string = Utils.TI18N("该频道下无法发言");

		//他人@我
		this.at_notice_node = this.seekChild("at_notice");
		this.at_close = this.at_notice_node.getChildByName("at_close");

        // 输入区域
        var ChatInput = require("chat_input");
        var chat_input_panel = this.chat_input_panel = new ChatInput(this.ctrl);
        chat_input_panel.setParent(this.mainPanel);
        chat_input_panel.setSendCallback(this.didiClickSendMsg.bind(this));
        chat_input_panel.show();
        
        // var chat_input_nd = this.chat_input_panel = new ChatInput();
        // this.root_wnd.addChild(chat_input_nd.root_wnd, 999);
    var close_btn = this.seekChild("close_btn");
    this.close_pc_btn = this.seekChild("close_pc_btn");
    this.close_pc_btn.active = false;
    close_btn.active = false;
    this.mask_node.active = false;
    if(!window.IS_PC){
        close_btn.active = true;
        close_btn.on(cc.Node.EventType.TOUCH_END, function() {
          this.ctrl.closeChatPanel();
        }.bind(this));
        this.mask_node.active = true;
        this.mask_node.on(cc.Node.EventType.TOUCH_END, function() {
        	this.ctrl.closeChatPanel();
		    }.bind(this));
    }else{
      this.close_pc_btn.active = true;
      this.close_pc_btn.on(cc.Node.EventType.TOUCH_END,function(event){
        var iType = this.pc_type;
        if(this.pc_type == 1){
          this.pc_type = 2;
          this.mainPanel.active = false;
          this.close_pc_btn.rotation = 180;
        }else{
          this.pc_type = 1;
          this.mainPanel.active = true;
          this.close_pc_btn.rotation = 0;
        }
        gcore.GlobalEvent.fire(ChatEvent.ChickCloseButton, iType);
      }.bind(this))
    }
    
	

		Utils.getNodeCompByPath("mainPanel/scrollview/view/tapToggleContainer/toggle1/chat_tap_1", this.root_wnd, cc.Label).string = Utils.TI18N("同省");
		Utils.getNodeCompByPath("mainPanel/scrollview/view/tapToggleContainer/toggle2/chat_tap_2", this.root_wnd, cc.Label).string = Utils.TI18N("邻服");
		Utils.getNodeCompByPath("mainPanel/scrollview/view/tapToggleContainer/toggle3/chat_tap_3", this.root_wnd, cc.Label).string = Utils.TI18N("世界");
		Utils.getNodeCompByPath("mainPanel/scrollview/view/tapToggleContainer/toggle4/chat_tap_4", this.root_wnd, cc.Label).string = Utils.TI18N("公会");
		Utils.getNodeCompByPath("mainPanel/scrollview/view/tapToggleContainer/toggle5/chat_tap_5", this.root_wnd, cc.Label).string = Utils.TI18N("私聊");
		Utils.getNodeCompByPath("mainPanel/scrollview/view/tapToggleContainer/toggle6/chat_tap_6", this.root_wnd, cc.Label).string = Utils.TI18N("系统");
		Utils.getNodeCompByPath("mainPanel/win_bg/at_notice/at_label", this.root_wnd, cc.Label).string = Utils.TI18N("有人提到我");
		//Utils.getNodeCompByPath("close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
	},

	registerEvent: function() {
		var RoleEvent = require("role_event");		
        this.role_update_event = this.role_vo.bind(RoleEvent.UPDATE_ROLE_ATTRIBUTE, function(key, val){
        	if (key == "lev" || key == "gid")
        		this.updateWidget()
            if(this.cur_select)
                this.changeChannel(this.cur_select)
        }.bind(this));

		this.addGlobalEvent(ChatEvent.MassageUpdate, function(msgData) {                       // 为频道增加一条最新消息
			this.addMsgs(msgData, msgData.channel);
		}.bind(this));

		this.addGlobalEvent(ChatEvent.MassageDelete, function(msgData) {                        // 为频道删除一条消息
			this.deleteMsgs(msgData);
		}.bind(this));

		this.addGlobalEvent(ChatEvent.PrivateMassageUpdate, function(notice_info) {             // 为频道增加一条私聊最新消息
			this.addMsgs(notice_info.msg_data, notice_info.channel);
		}.bind(this));

		this.addGlobalEvent(ChatEvent.PrivateMassageDelete, function(notice_info) {             // 为频道删除一条私聊消息
			this.deleteMsgs(notice_info.msg_data, notice_info.channel);
		}.bind(this));

		this.addGlobalEvent(EventId.CHAT_NEWMSG_FLAG,function(){
			this.setAllRedStatus();
		},this)

    this.addGlobalEvent(ActivityEvent.ChickCloseButton,(iType)=>{
      if(iType == 1){
        this.pc_type = 2;
        this.mainPanel.active = false;
        this.close_pc_btn.rotation = 180;
      }else{
        this.pc_type = 1;
        this.mainPanel.active = true;
        this.close_pc_btn.rotation = 0;
      }
    });
	},

	openRootWnd: function(params) {
		var channel = ChatConst.Channel.World;
		if (params && params.channel)
			channel = params.channel;
		var channel_tag = this.getChannelTag(channel);

		if (channel == ChatConst.Channel.Friend) {
			this.cur_friend = params.friend_data;
		}

		this.changeChannel(channel_tag);

		this.updateWidget();
		this.setAllRedStatus();
	},

	closeCallBack: function() {
        if(this.role_vo && this.role_update_event){
            this.role_vo.unbind(this.role_update_event);
            this.role_update_event = null;
            this.role_vo = null;
        }

        if (this.chat_input_panel)
        	this.chat_input_panel.deleteMe();

        if (this.timer)
        	gcore.Timer.del(this.timer);

		this.ctrl.closeChatPanel();
	},

	updateWidget: function() {
		// 设置个频道状态
		for (var channel_i in ChatConst.ChannelTag) {
			var channel_status = this.checkBtnIsOpen(channel_i);
			this.setChannelStatus(channel_i, channel_status);
		}
	},

	checkBtnIsOpen: function(channel) {
		if (channel == 2) {
			if(this.role_vo.lev < 50)
				return false;
		} else if (channel == 4) {
			if (!this.role_vo.gid)
				return false;
		}
		return true
	},

	setChannelStatus: function(index, status) {
		var chat_tap_color = this.chat_taps["chat_tap_" + index].color;
		if (status) {
			chat_tap_color.fromHEX("#FFFFFF");
			this.channel_tg[index].interactable = true;			
		} else {
			chat_tap_color.fromHEX("#F5E0B9");
			this.channel_tg[index].interactable = false;						
		}
	},

	getChannelTag: function(channel) {
		var channel_tag = null, channel_index = null;
		for (var channel_i in ChatConst.Channel) {
			if (ChatConst.Channel[channel_i] === channel)
				channel_index = channel_i;
		}

		if (channel_index) {
			for (var tag_i in ChatConst.ChannelTag) {
				if (ChatConst.ChannelTag[tag_i] == channel_index)
					channel_tag = tag_i;
			}
		}

		return channel_tag;
	},

	didiClickSendMsg: function(msg) {
		if (msg.length > 0) {
			if (this.channel === ChatConst.Channel.Friend) {
				if (this.cur_friend)
					this.ctrl.sendMessage(this.channel, msg, 2, this.cur_friend.srv_id, this.cur_friend.rid,this.cur_friend.name);
			} else {
				this.ctrl.sendMessage(this.channel, msg, 2);
			}
		}
	},

	checkToggle: function(event) {
		var toggle_tag_1 = event.node.tag_1;
		if (toggle_tag_1 == this.cur_select) return;
    // this.cur_select = toggle_tag_1;
		this.changeChannel(toggle_tag_1);
	},

	// 点击标签
	didClickTap: function(event) {
		Utils.playButtonSound(ButtonSound.Tab);
		if (event.target.tag_1 == 2 && this.role_vo.lev < 50) {
			message(Utils.TI18N("等级不足50级"));
		} 

		if (event.target.tag_1 == 4 && !this.role_vo.gid) {
			message(Utils.TI18N("您暂时没有加入公会"));
		}
		this.setRedStatus(event.target.tag_1);
	},

	changeChannel: function(channel_tag) {
    this.cur_select = channel_tag
		this.setRedStatus(channel_tag);

		var channel_index = ChatConst.ChannelTag[channel_tag];
        this.last_chat_index = this.chat_items_index;
		this.channel = ChatConst.Channel[channel_index];

		this.chat_input_panel.setVisible(true);
		if(this.channel == ChatConst.Channel.Event || this.channel == ChatConst.Channel.System){
			this.chat_input_panel.setVisible(false);
			this.notice_node.active = true;
		}else if(this.channel == ChatConst.Channel.Province){
			var province_config = Config.misc_data.data_const["province_level"];
			if(!province_config || this.role_vo.lev < province_config.val){
				this.chat_input_panel.setVisible(false);
				this.notice_node.active = false;
			}else{
				this.chat_input_panel.setVisible(true);
				this.notice_node.active = false;
			}
		}else{
			this.notice_node.active = false;
		}

		if (channel_tag === 1) {
			if (this.role_vo && this.role_vo.lev < 35) {
				// this.empty_tips_nd.active = true;
				// this.empty_desc_lb.string = Utils.TI18N("角色35级可见该频道聊天内容");
				this.chat_input_panel.setVisible(false);
			} else {
				// this.empty_tips_nd.active = false;
				this.chat_input_panel.setVisible(true);
			}
		}

		if (this.cut_tap) {
			var cur_select = this.chat_taps["chat_tap_" + this.cut_tap].color;
			cur_select.fromHEX(Config.color_data.data_color16[141]);
			this.chat_taps["chat_tap_" + this.cut_tap].color = cur_select;
		}

		this.channel_tg[channel_tag].isChecked = true;
		this.channel_tg[channel_tag].check();

		var new_select = this.chat_taps["chat_tap_" + channel_tag].color;
		new_select.fromHEX(Config.color_data.data_color16[254]);
		this.chat_taps["chat_tap_" + channel_tag].color = new_select;
		this.cut_tap = channel_tag;

		// 更新记录切换时的高度和位置 
        this.updageChannelSizeInfo();

        this.chat_items_index = this.channel;
        if (this.channel == ChatConst.Channel.Friend) {
        	if (!this.private_targets) {
				this.private_targets = [];
				var h_private_targets = this.model.getPrivateTargets();
				if (h_private_targets.length > 0) {
					if (!this.cur_friend)
						this.cur_friend = h_private_targets[0];
					for (var friend_i = 0; friend_i < h_private_targets.length; friend_i++)
						this.addPrivateTap(h_private_targets[friend_i]);
				}
        	}
		    if (this.cur_friend) {
	        	this.chat_items_index = this.cur_friend.srv_id + this.cur_friend.rid;
		    	this.private_add_bg_nd.active = false;
		    } else {
		    	this.private_add_bg_nd.active = true;
			}

        } else {
        	if (this.private_add_bg_nd.active)
        		this.private_add_bg_nd.active = false;
		}
		

        // 清楚频道未读消息
        this.model.cleanUnredNum(this.channel);
		// 更新显示区域
		this.updateMsgsContent();

		var tempStr = Utils.TI18N("请输入信息");
		//  同省、跨服、世界、公会可以@人
		if (channel_tag == 1 || channel_tag == 2 || channel_tag == 3 || channel_tag == 4) {
			var data = this.model.getAtData();
			if (data && Utils.next(data)) {
				this.showAtNotice(true, data);
			}
			tempStr = Utils.TI18N("请输入信息,长按头像可快捷@人");
		}

		this.chat_input_panel.setPlacholderLabel(tempStr);
		this.chat_input_panel.setChannel(this.channel);
		
	},

	// 更新消息容器的高度和位置
	updageChannelSizeInfo: function(is_clean) {
		if (!this.chat_items_index) return;
		if (!this.content_info[this.chat_items_index]) this.content_info[this.chat_items_index] = {};
		var c_pos = this.msgs_content.y;
		var c_height = this.msgs_content.height;
		if (is_clean) {
			c_pos = 0;
			c_height = 0;
		}
		this.content_info[this.chat_items_index].c_pos = c_pos;
		this.content_info[this.chat_items_index].c_height = c_height;
	},

	mainLoop: function() {
		if (!this.is_update) return
		if (this.chat_items[this.chat_items_index] && this.update_index < this.chat_items[this.chat_items_index].length) {
			this.chat_items[this.chat_items_index][this.update_index].updateContent();
			this.update_index ++;
		} else {
			this.update_index = 0;
			this.is_update = false;
		}
	},

	addMsgs: function(msg_data, channel) {
		if (!msg_data) return;
		channel = channel ? channel : msg_data.channel;
		var chat_items_index = channel;
		if (channel === ChatConst.Channel.Friend) {
			chat_items_index = msg_data.srv_id + msg_data.rid;
		}
		if (!this.chat_items[chat_items_index]) {
			if (chat_items_index == this.chat_items_index) {			
				if (this.getVisible()) {
					this.initItems(channel, chat_items_index);
				}
			}
		} else {
			var mes_item = this.addMsgItem(msg_data, channel);
			if (chat_items_index == this.chat_items_index) {
				// if ((this.msgs_content.height - mes_item.height) - (this.scrollview_nd.height + this.msgs_content.y) < 10) {
					if (this.msgs_content.height > this.scrollview_nd.height) {
						this.scrollview_mgs_sc.scrollToPercentVertical(0, 0.1,true);
					}
				// }
			}
		}

		this.setRedStatus(channel);
		if (channel === this.channel && this.getVisible())
			this.model.cleanUnredNum(channel);
	},

	deleteMsgs: function(msg_data, channel) {
		if(!msg_data) return;
		channel = channel ? channel : msg_data.channel;
		var chat_items_index = msg_data.channel;
		if (channel === ChatConst.Channel.Friend)
			chat_items_index = msg_data.srv_id + msg_data.rid;

		if(this.chat_msgs && this.chat_msgs[chat_items_index]){
			var this_msg = this.chat_msgs[chat_items_index].shift();
		}
		
		if(this.chat_items && this.chat_items[chat_items_index]){
			var chat_item = this.chat_items[chat_items_index].shift();

			chat_item.updateContent(true);

			if (this.content_info[chat_items_index]) {		
				this.content_info[chat_items_index].c_height -= chat_item.height;
				this.content_info[chat_items_index].c_pos -= chat_item.height;
			}

			for (var chat_i in this.chat_items[chat_items_index])
				this.chat_items[chat_items_index][chat_i].pos_y -= chat_item.height;

			if (chat_items_index = this.chat_items_index) {
				this.msgs_content.y -= chat_item.height;
				this.updateMsgsContent();
			}
		}
		

		this.setRedStatus(channel);
	},

	// 删除、初始化消息来创建chat_item, 更新区域
	updateMsgsContent: function() {
		// if (!this.chat_items_index) return;

		// 初始化当前频道信息
		if (this.chat_items_index && !this.chat_items[this.chat_items_index]) {
	        this.updageChannelSizeInfo(true);
			this.initItems(this.channel, this.chat_items_index);
		}

		var content_pos = 0;
		var content_height = 0;

		if (this.chat_items_index && this.content_info[this.chat_items_index]) {
		    content_pos = this.content_info[this.chat_items_index].c_pos;			
		    content_height = this.content_info[this.chat_items_index].c_height;
		} else {  // 更到最底端
			// content_height = 
		}

		// 切换toggle时更新背景大小位置
		if (this.channel == ChatConst.Channel.Friend) {
			// && this.cur_friend) {
			this.contern_bg_nd.height = FRIEDN_CHAT_HEIGHT;
			this.scrollview_nd.y = 270;
			this.view_nd.height = this.scrollview_nd.height = 655;

			this.main_bg_nd.height = 664;
		} else {
			this.contern_bg_nd.height = NORMAL_CHAT_HEIGHT;
			this.scrollview_nd.y = 396;
			this.view_nd.height = this.scrollview_nd.height = 764;

			this.main_bg_nd.height = 786;
		}

		this.msgs_content.y = content_pos;
		this.msgs_content.height = content_height;

        // 清除上个上个频道信息
		this.cleanConten();
		// 更新当前频道信息条目
		this.updageItems();
	},

	addMsgItem: function(msg_data, channel) {
		channel = channel ? channel : msg_data.channel;
		var items_index = channel;
		var chat_base_height = 100;
		if (channel === ChatConst.Channel.Friend) {
			items_index = msg_data.srv_id + msg_data.rid;
		}
		var other_height = 0;

		if (!this.content_info[items_index]) return;
		if (channel === ChatConst.Channel.System || msg_data.subChanner == 256) {
			chat_base_height = 32;
			other_height = 10;
		} 

		// 解析聊天字符串，增加表情和图片高度
		// analyzeMessage
		var test_msg = this.chat_item_ctrl.analyzeMessage(msg_data.msg);
		this.msg_rt.string = test_msg;

		var msg_height = this.msg_nd.height + chat_base_height;

	// this.content_info[this.chat_items_index].c_height
	    var content_height = 0;
	    if (this.content_info[items_index])
			content_height = this.content_info[items_index].c_height

		var msg_item = new ChatItem(this, msg_data, msg_height, content_height, channel);
		this.content_info[items_index].c_height += msg_height;

		this.chat_msgs[items_index].push(msg_data);
		this.chat_items[items_index].push(msg_item);

		// 此条后面需要优化
		if (items_index == this.chat_items_index) {
			this.msgs_content.height += (msg_height +　10);	
			if (this.chat_items[this.chat_items_index].length > 0) {
				// this.empty_tips_nd.active = false;
			} else {
				if (this.cut_tap !== 1 || (this.role_vo && this.role_vo.lev > 35)) {
					// this.empty_tips_nd.active = true;
					// this.empty_desc_lb.string = Utils.TI18N("暂时没有人说话");
				}
			}					
			msg_item.updateContent();
		}

		return msg_item
	},

	cleanConten: function() {
		if (!this.last_chat_index) return
	    this.update_index = 0;
		for (var chat_i in this.chat_items[this.last_chat_index]) {
			this.chat_items[this.last_chat_index][chat_i].updateContent(true);
		}
	},

	// 在此处更新content当前位置
	contentScrolling: function(event) {
		if (this.scroll_dis == 0) {
			this.scroll_dis = event.content.y;
		} else {
			if (Math.abs(Math.abs(event.content.y) - Math.abs(this.scroll_dis)) > 40) {
				this.updageItems();
				this.scroll_dis = 0;
			}
		}
	},

	// 初始化某个channel的消息条目
	initItems: function(channel, item_index) {
		if (!channel) return;

		this.msgs_content.height = 0;
		this.msgs_content.y = 0;

		var items_index = item_index ? item_index : channel;
		var msgs = [];
		this.chat_msgs[items_index] = [];
		this.chat_items[items_index] = [];

		if (channel == ChatConst.Channel.Friend && item_index) {
			if (this.cur_friend) {
				msgs = this.model.getPrivateMsgs(this.cur_friend.srv_id, this.cur_friend.rid);
				this.ctrl.sender12723(this.cur_friend.srv_id, this.cur_friend.rid);
			}
		} else {
			msgs = this.model.getChannelMsgs(channel);
		}

		for (var msg_i = 0; msg_i < msgs.length; msg_i++) {
			var chat_item = this.addMsgItem(msgs[msg_i], channel);
		}

		if(this.msgs_content.height > this.scrollview_nd.height) {
			this.scrollview_mgs_sc.scrollToBottom(0.1);
		}

		this.is_update = true;
		this.update_index = 0;
	},

	// 更新条目状态
	updageItems: function() {
		if (this.chat_items_index) {
			if (this.chat_items[this.chat_items_index]) {
				for (var item_index in this.chat_items[this.chat_items_index]) {
					this.chat_items[this.chat_items_index][item_index].updateContent();
				}
				// 更新到最新位置
				if (this.chat_items[this.chat_items_index].length > 0) {
					// this.empty_tips_nd.active = false;
				} else {
					if (this.cut_tap !== 1 || (this.role_vo && this.role_vo.lev > 35)) {
						// this.empty_tips_nd.active = true;
						// this.empty_desc_lb.string = Utils.TI18N("暂时没有人说话");
					}
				}
			}
		}
	},

	getChatItemNd: function() {
		if (this.chat_items_cache.length > 0) {
			return this.chat_items_cache.shift();	
		}
	},

	cacheChatItemNd: function(item_nd) {
		this.chat_items_cache.push(item_nd);
	},

	getContentPos: function() {
		return this.msgs_content.y
	},

	addPrivateTap: function(friend_vo) {
		for (var friend_i = 0; friend_i < this.private_targets.length; friend_i++) {
			if (this.private_targets[friend_i].srv_id === friend_vo.srv_id && this.private_targets[friend_i].rid === friend_vo.rid){
				return
			}
		}
		var ChatFriend = require("chat_friend");
		var is_select = false;
		if (this.cur_friend &&　this.cur_friend.srv_id === friend_vo.srv_id && this.cur_friend.rid == friend_vo.rid)
			is_select = true;
		var chat_friend = new ChatFriend(friend_vo, this.private_contend, is_select);
		chat_friend.setSelectCallback(this.selectPrivate.bind(this));
		chat_friend.setDeleteCallBack(this.deletePrivate.bind(this));
		this.private_targets.push(friend_vo);
		this.chat_friends[friend_vo.srv_id + friend_vo.rid] = chat_friend;
		if (is_select) this.cur_friend_tap = chat_friend;
	},

	selectPrivate: function(private_index, friend_vo) {
		if (private_index && friend_vo && private_index !== this.chat_items_index) {
			// 更新记录切换时的高度和位置 
	        this.updageChannelSizeInfo();
			if (this.cur_friend_tap) this.cur_friend_tap.cancelSelcet();
			this.cur_friend_tap = this.chat_friends[friend_vo.srv_id + friend_vo.rid];
			this.cur_friend_tap.setSelectStatus();
			this.cur_friend = friend_vo;
			this.last_chat_index = this.chat_items_index;
			this.chat_items_index = private_index;
			this.updateMsgsContent();
		}
	},

	deletePrivate: function(private_index, friend_vo) {
		if (private_index && friend_vo) {
			for (var friend_i in this.private_targets) {
				if (this.private_targets[friend_i].rid === friend_vo.rid) {
					this.private_targets.splice(friend_i, 1);
				}
			}

			if (this.private_targets.length > 0) {
				var new_friend_vo = this.private_targets[0];
				var private_index = new_friend_vo.srv_id + new_friend_vo.rid
				this.selectPrivate(private_index, new_friend_vo);
		    	this.private_add_bg_nd.active = false;			
			} else {
				this.last_chat_index = friend_vo.srv_id + friend_vo.rid;
				this.chat_items_index = null;
				this.updateMsgsContent();
				this.cur_friend = null;
				this.last_chat_index = null;
		    	this.private_add_bg_nd.active = true;
			}

			delete this.chat_friends[friend_vo.srv_id + friend_vo.rid];
			
			this.model.deltePrivateTarget(friend_vo);
		}
	},

	onClickAddPriBtn: function() {
    	this.ctrl.closeChatPanel();
    	
		var FriendController = require("friend_controller");
		FriendController.getInstance().openFriendWindow(true);
	},

	//标签页红点处理
	setRedStatus: function (channel) {
		if (channel == null) return
		if (this.channel_red == null) return
		if (this.channel_red[channel] == null) return

		if ((channel == 2 && this.role_vo && this.role_vo.lev < 50) || (channel == 4 && this.role_vo && !this.role_vo.gid)) {
			return;
		}

		let btn = this.channel_red[channel];
		let num = this.model.getUnreadNum(ChatConst.Channel[ChatConst.ChannelTag[channel]]);
		if (num > 0) {
			btn.red.active = true;
			btn.num.string = "";
			// btn.num.string = num;
		} else {
			btn.red.active = false;
		}
	},

	//所有标签页红点处理
	setAllRedStatus: function () {
		for (let i = 1; i <= 6; i++) {
			this.setRedStatus(i);
		}
	},

	showAtNotice: function(status, data) {
		if (this.root_wnd == null) return;

		this.at_close.targetOff(this);

		var close_callback = function () {
			this.at_notice_node.active = false;
			this.model.setAtData({});
			if (data && Utils.next(data)) {
				this.ctrl.sender12768(data.rid, data.srv_id, data.channel, data.msg);
			}
		}.bind(this);
		Utils.onTouchEnd(this.at_close, function () {
			close_callback();
		}.bind(this), 1);

		var item = null;
		if (data && Utils.next(data) != null) {
			var id = this.ctrl.getId(this.channel, data.srv_id, data.rid, data.name, data.msg);
			

			var scroll = this.chat_items[this.channel];
			if (scroll) {
				var isHave = false;
				for (var i = 0,l = scroll.length;i<l;i++) {
					if (scroll[i].getId() == id) {
						item = scroll[i];
						this.at_notice_node.active = status;
						isHave = true;
						break;
					}
				}
				if (isHave == false) {
					this.at_notice_node.active = false;
				}
			} else {
				this.at_notice_node.active = false;
			}
		} else {
			this.at_notice_node.active = false;
		}

		Utils.onTouchEnd(this.at_notice_node, function (item) {
			if (item) {
				var precent = (this.msgs_content.height - item.pos_y-item.height) / this.msgs_content.height;
				if(precent>1){
					precent = 1;
				}
				this.scrollview_mgs_sc.scrollToPercentVertical(precent, 0.1,true);
				close_callback();
			}
		}.bind(this, item), 1);
	},

	setVisible: function (status,params) {
		if (this.active_status == status) {
            return
        }
        if (this.root_wnd) {
            this.root_wnd.active = status;
            this.active_status = status;
        } else {
            this.fastShowThenHide = !status;
        }
		if(status == true){
			this.openRootWnd(params);
		}else{
			if(this.chat_friends){
				for(let i in this.chat_friends){
					let v = this.chat_friends[i];
					if(v && v.deleteMe){
						v.deleteMe();
						v = null
					}
				}
				this.chat_friends = {};
				this.private_targets = null;
			}
		}
    },

});