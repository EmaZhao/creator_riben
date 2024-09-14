// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      tips常量
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var TipsConst = {
    type:{
        GOODS: 1,           // 通用物品
        EQUIP: 2,           // 装备tips
        HEAD_CIRCLE:3,      // 头像框
        COMMON:4,           //  普通通用tips
        SKILL:5,            //技能提示
        ADVENTURE_BUFF:6,     //神界buff
    },

    eqmTips:{
        normal: 0,
        backpack: 1,
        partner: 2,
        other: 3,
    },

    eqmBtnTypes: {
        LEFT: 1,
        RIGHT: 2,
    }
}

module.exports = TipsConst;