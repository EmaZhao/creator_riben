var ChatConst = require("chat_const");
var ChatEvent = require("chat_event");
var BackPackConst = require("backpack_const");
var GoodsVo  = require("goods_vo");
var HeroController = require("hero_controller");
var TipsController = require("tips_controller");
var PartnerConst = require("partner_const");

var FriendController = cc.Class({
    extends: BaseController,

    ctor: function() {

    },

    registerProtocals: function() {
	    this.RegisterProtocal(12418, this.handle12418.bind(this));  // 发送任务到聊天
	    this.RegisterProtocal(12419, this.handle12419.bind(this));  // 点击任务返回数据
	    this.RegisterProtocal(11221, this.handle11221.bind(this));  // 发送伙伴到聊天
	    this.RegisterProtocal(11222, this.handle11222.bind(this));  // 点击伙伴返回数据
	    this.RegisterProtocal(10535, this.handle10535.bind(this));  
	    this.RegisterProtocal(10536, this.handle10536.bind(this));  // 点击物品返回数据  
    },

    // 生成item Text
	buildItemMsg: function(item_bid, srv_id, share_id, count) {
	    var config_data = Utils.getItemConfig(item_bid);
	    count = count || 0;
	    var item_name = config_data.name;
	    if (count > 1)
	        item_name = item_name + "x" + count;
	    if (config_data) {
	        return cc.js.formatStr("<color=%s><on click='handler' param='%s|%s|%s'>[%s]</on></color>",
	                BackPackConst.quality_color(config_data.quality),
	                ChatConst.Link.Item_Show,
	                srv_id,
	                share_id,
	                item_name);
	    }
	},

	relapceFaceIconTag: function(text) {
		var patt = /(#)\d+/g;
		var result = null;
		while((result = patt.exec(text)) != null) {
			var face_id = result[0].slice(1, result[0].length);
			var face_cfg = Config.face_data.data_biaoqing[face_id];
			var replace_str = "";
			if (face_cfg)
				replace_str = cc.js.formatStr("<img src='emoji' emoji='%s'/>", face_cfg.name);
			text = text.replace(new RegExp(result[0], 'i'), replace_str)
		}
		return text;
	},

	analyzeMessage: function(message) {
		var patt = /(src=)/g;
		var result = null;
		while((result = patt.exec(message)) != null) {
			message += "**";
		}

		return message;
	},

	getImages: function(message) {
		var img_ids = [];
		var emojis = message.match(/src='(\S*)'/g)
		for (var emoji_i in emojis) {
			var emoji = emojis[emoji_i];
			var emoji_info = emoji.match(/src='(\S*)'/);
			if (emoji_info[1] !== "emoji")
				img_ids.push(emoji_info[1]);
		}

		return img_ids;
	},

	getEmojis: function(message) {
		var emoji_ids = [];
		var emojis = message.match(/emoji='(\S*)'/g)
		for (var emoji_i in emojis) {
			var emoji = emojis[emoji_i];
			var emoji_info = emoji.match(/emoji='(\S*)'/);
			emoji_ids.push(emoji_info[1]);
		}

		return emoji_ids;
	},

    handle12418: function(data) {

    },

	handle12419: function(data) {

	},

	handle11221: function(data) {

	},

	handle11222: function(data) {

	},

	send10535: function(type, id, partner_id, code) {
	    var protocal = {}
	    protocal.type = type;
	    protocal.id = id;
	    protocal.partner_id = partner_id;
	    protocal.code = code;
	    this.SendProtocal(10535, protocal);	
	},

	handle10535: function(data) {
	    if (data.flag == 1) {
	        gcore.GlobalEvent.fire(ChatEvent.CHAT_SELECT_ITEM, data);
	    } else {
	        message(data.msg)
	    }
	},

	// 获取物品Tips
	sender10536: function(share_id, srv_id) {
	    if (!share_id) return;
	    var protocal = {};
	    protocal.srv_id = srv_id;
	    protocal.id = share_id;
	    this.SendProtocal(10536, protocal);		
	},

	// 显示物品Tips
	handle10536: function(data) {
		if (data) {
			var item_vo = new GoodsVo();
			item_vo.setBaseId(data.base_id);
			item_vo.initAttrData(data);
			if (!item_vo.config) {
				message(Utils.TI18N("数据异常"));
				return
			}

		    if (BackPackConst.checkIsEquip(item_vo.config.type)) {
		        HeroController.getInstance().openEquipTips(true, item_vo, PartnerConst.EqmTips.other);
		    } else if (BackPackConst.checkIsArtifact(item_vo.config.type)) {
		        HeroController.getInstance().openArtifactTipsWindow(true, item_vo, PartnerConst.ArtifactTips.normal);
		    } else {
				var TipsController = require("tips_controller");
		        TipsController.getInstance().showGoodsTips(item_vo.config);
		    }
		}
	},

})