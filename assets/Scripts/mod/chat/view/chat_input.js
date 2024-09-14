var ChatEvent = require("chat_event");
var RoleController = require("role_controller");
var ChatItemController = require("chat_item_controller");
var ChatConst = require("chat_const");

var ChatInput = cc.Class({
	extends: BasePanel,

	properties: {
		root_wnd: cc.Node,
		is_keyboard: true,              // 是否是键盘输入状态
		send_cb: null,
		visible: true,
	}, 

	ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("chat", "chat_input");
		this.chat_item_ctrl = ChatItemController.getInstance();
		this.ctrl = require("chat_controller").getInstance();
	},


    // 可以初始化声明一些变量的
    initConfig:function(){
    	this.item_code_list = {};  // item eqip存储信息
    	this.item_desc_list = {};
    	this.select_face = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
		var change_nd        = this.seekChild("change_btn");
		var send_nd          = this.seekChild("send_btn");
		this.chat_sound_nd   = this.seekChild("chat_sound_icon");
		this.chat_keybord_nd = this.seekChild("chat_keybord_icon");
		this.keyboard_nd     = this.seekChild("keybord");
		this.sound_nd        = this.seekChild("song_btn");
		this.input_ed        = this.seekChild("editbox", cc.EditBox);
		this.placholder_label = this.seekChild("PLACEHOLDER_LABEL", cc.Label);
		
		this.face_btn        = this.seekChild("face_btn");
		
		change_nd.on(cc.Node.EventType.TOUCH_END, this.didClickChangeBtn, this);		
		send_nd.on(cc.Node.EventType.TOUCH_END, this.didClickSendBtn, this);
		this.face_btn.on(cc.Node.EventType.TOUCH_END, this.onClickFaceBtn, this);

		Utils.getNodeCompByPath("chat_bottom/send_btn/New Node", this.root_wnd, cc.Label).string = Utils.TI18N("发送");
		Utils.getNodeCompByPath("chat_bottom/keybord/editbox/PLACEHOLDER_LABEL", this.root_wnd, cc.Label).string = Utils.TI18N("请输入信息,长按头像可快捷@人");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
    	this.addGlobalEvent(ChatEvent.CHAT_SELECT_ITEM, function(data) {
    		this.onEditTextAddItem(data);
    	}.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
    	if (this.chat_input_list)
    		this.chat_input_list.deleteMe();
    },


	setSendCallback: function(send_cb) {
		this.send_cb = send_cb;
	},

	didClickChangeBtn: function(event) {
		if (this.is_keyboard) {
			this.is_keyboard = false;
			this.chat_keybord_nd.active = true;
			this.sound_nd.active = true;
			this.chat_sound_nd.active = false;
			this.keyboard_nd.active = false;
		} else {
			this.is_keyboard = true;
			this.chat_keybord_nd.active = false;
			this.sound_nd.active = false;
			this.chat_sound_nd.active = true;
			this.keyboard_nd.active = true;
		}
	},

	repleaceAtPeopleText:function( text, srv_id ){
		var num1 = text.search(/@/);
		var num2 = text.search(/ /);
		var len = text.length;
		if(num1!=-1 && num2!=-1){
			var at = text.substring(num1,num2);
			var rep = cc.js.formatStr("<on click='handler' param='atpeople srvid=%s'><u>%s</u></on>",srv_id,at+" ")
			text = text.replace(at,rep);
		}
		return text;
	},

	setChannel:function(channel){
		this.channel = channel;
	},

	didClickSendBtn: function() {
		var seedMesageArr = this.getInputText();
		if(!seedMesageArr)return;

		var seedMesage = seedMesageArr[0] || "";
		var srv_id = seedMesageArr[1] || "";
		
		if (seedMesage.length > 0 &&　this.send_cb) {
			// 替换表情
			var message = this.chat_item_ctrl.relapceFaceIconTag(seedMesage); // 替换表情
			// 替换teim
			for (var item_i in this.item_code_list) {
				var item_info = this.item_code_list[item_i];
				message = message.replace(new RegExp(item_info.key, 'i'), item_info.desc);
			}

			if(this.channel == ChatConst.Channel.World || this.channel == ChatConst.Channel.Cross || this.channel == ChatConst.Channel.Province || this.channel == ChatConst.Channel.Gang){//世界聊天 跨服聊天 同省聊天 帮派聊天
				message = this.repleaceAtPeopleText(message, srv_id);
			}
		
			if(this.ctrl.canSend(this.channel)){
				this.input_ed.string = "";
			}

			this.send_cb(message);
			
			if (this.chat_input_list)
				this.chat_input_list.setVisible(false);
		} else {
		}
	},

	onClickFaceBtn: function(event) {
		if (!this.chat_input_list) {
			var ChatInputList = require("chat_input_list");
			var chat_input_list = this.chat_input_list = new ChatInputList();
			chat_input_list.setParent(this.root_wnd);	
			chat_input_list.setSelectCB(this.onEditTextAddFace.bind(this));		
			chat_input_list.show();
		} else {
			if (this.chat_input_list.isOpen()) {
				this.chat_input_list.setVisible(false);
			} else {
				this.chat_input_list.setVisible(true);
			}
		}
	},

	// 选中表情返回
	onEditTextAddFace: function(face_txt) {
		if (face_txt) {
			if (this.select_face.length < 5) {
				this.select_face.push(face_txt);
				this.input_ed.string += face_txt;
			} else {
		        message(Utils.TI18N("发言中不能超过5个表情"));
			}
		}
	},

	onEditTextAddItem: function(data) {
		if (!data) return;
		var text = this.input_ed.string;
	
		if(text == ""){
			this.item_code_list = {};
			this.item_desc_list = {};
		}

		var base_id     = data.base_id;
		var share_id    = data.share_id;
		var count       = data.count;
		var role_vo     = RoleController.getInstance().getRoleVo();
		var item_config = Utils.getItemConfig(base_id);
		var code        = data.code;

	    if (item_config) {
	        var key = cc.js.formatStr("{%s,%s}", share_id, item_config.name);
	        var desc = this.chat_item_ctrl.buildItemMsg(base_id, role_vo.srv_id, share_id, count);

	        if (this.item_code_list[code]) {
	            var cur_object = this.item_code_list[code];
	            var cur_key = cur_object.key;
	            var cur_desc = cur_object.desc;
	            // 获取原有的
	            text = text.replace(cur_key, key);
	        } else {
	            text = text + key;
	        }

	        this.item_code_list[code] = {key:key, desc:desc};
	        this.input_ed.string = text;
	    } 
	},

	setPlacholderLabel:function(str){
		if(this.placholder_label && str){
			this.placholder_label.string = str;
		}
	},

	//  文本框内容
	getInputText:function(){
		return [this.input_ed.string,this.extend];
	},

	setInputText:function(str, extend){
		this.extend = extend;
		if(this.input_ed){
			if(!str){
				str="";
			}
			this.input_ed.string = str;
		}
	},

})
module.exports = ChatInput;
