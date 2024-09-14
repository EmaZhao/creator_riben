var PartnersummonConst = {
	Summon_Type : {
		Normal : 100, 	// 普通召唤
		Friend : 200, 	// 友情召唤
		Advanced : 300, // 高级召唤
		Score : 400, 	// 积分召唤
	},

	Recruit_Key : {
		Free_Count : 4, // 当前可以免费刷新次数
		Free_Time : 5,  // 下次免费刷新时间
	},

	// 服务器1:免费，2:金币，3:红钻/钻石兑换，4:道具"
	Status : {
		Free : 1, // 免费召唤
		Item : 2, // 道具召唤
		Gold : 3, // 钻石召唤
	},

	Good_Bg : {
		[100] : "partnersummon_image_5",
		[200] : "partnersummon_image_6",
		[300] : "partnersummon_image_7",
	},
	Summon_Bg : {
		[100] : "Zhaohuan_Beijing_Putong_1_1",
		[200] : "Zhaohuan_Beijing_Youqing_1_1",
		[300] : "Zhaohuan_Beijing_Gaoji_1_1",
	},

	Gain_Show_Type : {
		Common_Show  : 1,    // 普通召唤显示
		Skin_show    : 2,    // 皮肤召唤显示
	},

	Recruit_type:{
		Normal:1,
		Time:2,
		Elite:3,
	},
	// Gain_Skill_Pos : {
	// 	[1] : {{x : 368, y : 327}},
	// 	[2] : {{ x : 270, y : 327 }, { x : 466, y : 327 }},
	// 	[3] : {{ x : 170, y : 327 }, { x : 368, y : 327 }, { x : 566, y : 327 }},
	// 	[4] : {{ x : 66, y : 327 }, {x : 262, y : 327}, { x : 458, y : 327 }, { x : 654, y : 327 }}
	// },

	Normal_Id : 10401,      // 普通召唤道具
	Advanced_Id : 10403,	// 高级召唤道具
};

module.exports = PartnersummonConst;