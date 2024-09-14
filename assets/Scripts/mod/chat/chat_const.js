var ChatConst = {
	// 聊天类型
	TYPE_WORD  : 0,          // 文字聊天
	TYPE_VOICE : 1,          // 语音聊天
	TYPE_TASK  : 2,          // 任务聊天
	TYPE_HERO  : 3,          // 英雄聊天
	TYPE_PACK  : 4,          // 背包聊天

	ChannelTag: {
		[1] : "Province",
		[2] : "Cross",
		[3] : "World",
		[4] : "Gang",
		[5] : "Friend",
		[6] : "System",
	},

	ChatTimeIndex: {
		[2048]: "cooldown_same_province",
		[1024]: "cooldown_cross_service",
		[1]: "cooldown_world",
		[4]: "cooldown_guild",
	},

	Channel: {
		Province  : 2048,    // 同省频道
		Cross     : 1024,    // 跨服频道
		World     : 1,       // 世界频道
		Gang      : 4,       // 宗门频道
		Friend    : 7,       // 好友频道
		System 	  : 16,		 // 剧道
		NoticeTop : 32,      //传闻频道
		System1    : 64,     //系统频道
		SystemTop : 128,     //顶部系统
		// Notice	  :16,		 //	传闻
	},

	ChannelLimit: {
		Province  : 40,       // 跨服频道		
		Cross     : 40,       // 跨服频道
		World     : 40,       // 世界频道
		Gang      : 30,       // 宗门频道
		Friend    : 80,       // 好友频道
		System 	  : 50,		  // 剧道  		
	},

	Link: {
		Item_Show       : 49,   // 物品展示
		Guild_Join      : 6,	// 申请入帮
		Guild_mem_red   : 7,    // 公会成员红包
		Guild_show_red  : 8,    // 查看公会成员红包
		BargainHelp     : 15,   // 砍价链接
		BigworldBoss    : 16,	// 大世界的BS
		BigworldBossPos : 17,	// 世界指定位置
		OtherRole       : 18,	// 弹出信息面板
		Watch_Ladder    : 51,   // 查看天梯录像
		Open_Ladder     : 52,   // 打开天梯界面
		Open_Vedio_info : 57,	//打开从录像馆分享的录像
	},

};

ChatConst.ainNameColor = {
	[ChatConst.Channel.Province] : "#24ecf3",
	[ChatConst.Channel.Cross ] : "#24ecf3",
	[ChatConst.Channel.World ] : "#24ecf3",
	[ChatConst.Channel.Gang  ] : "#24ecf3",
	[ChatConst.Channel.Friend] : "#24ecf3",
	[ChatConst.Channel.System] : "#24ecf3",
},


module.exports = ChatConst;