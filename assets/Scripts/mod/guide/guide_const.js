var GuideConst = {}



// 配置表与prefab的对应
GuideConst.NodeKeys = {
	"mainui_tab_1": "mainui_tab_1",
	"guidesign_build_5": "guidesign_build_5",
	"guildsign_summon_1_1": "tag|recruit_btn_one_1",
	"guildsign_summon_comfirm_btn": "confirm_btn",
	"guidesign_battle_reward_btn": "passnode",
	"guildsign_summon_3_1": "tag|recruit_btn_one_3",
	"guidesign_quick_btn": "source_btn",
	 "guidesign_tipsqingbao": "qingbao",
},

GuideConst.NodeTas = {

},

GuideConst.getNameInfo = function(index) {
	var result = null;
	if (GuideConst.NodeKeys[index]) {
		result = GuideConst.NodeKeys[index].split("|");
	}
	return result;
}

GuideConst.special_id = {
    guild: 10212,          // 公会剧情,这个剧情的时候不能关闭其他面板
    market: 10510,         // 同公会剧情
    seerpalace: 10222, 	// 先知殿剧情
    stronger: 10174, 		// 变强剧情
    //adventure: 10310,      // 冒险剧情

    quick_guide: 10120,    // 快速作战
    hook_guide: 10165, 	// 挂机收益引导
    //break_guide = 10072,    // 突破引导的时候,不要弹出物品来源

    // arena_guide = 10000,    // 竞技场引导
}


GuideConst.Finger_Speed = 1500;

module.exports = GuideConst;