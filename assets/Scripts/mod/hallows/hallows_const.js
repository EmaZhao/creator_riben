// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var HallowsConst = {
    Tab_Index: {
        uplv: 1,  // 升级
	    skill: 2, // 技能
    },

    Status: {
        close: 1, 		// 未开启
        underway: 2, 	// 进行中
        open: 3 		// 已获得
    },


    // 神器红点类型
    Red_Index: {
        task_award: 1,   // 神器任务奖励可领
        hallows_lvup: 2, // 神器可升级
        skill_lvup: 3,   // 神器技能可升级
        stone_use: 4, 	  // 有圣印石可使用
    },

    //  神器激活类型
    Activity_Type : {
	    Hallows: 1,  // 神器激活
	    Magic: 2,    // 幻化激活
    },
}

module.exports = HallowsConst