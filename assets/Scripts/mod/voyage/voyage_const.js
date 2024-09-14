////------------------------------------------------------------------
// @author: o@syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
////------------------------------------------------------------------
var VoyageConst = {};

//订单状态
VoyageConst.Order_Status = {
    Unget: 1,    // 未接取
    Underway: 2, // 进行中
    Finish: 3,   // 已完成
}

//订单稀有度
VoyageConst.Order_Rarity = {
    Normal: 0, 	// 普通
    Excellent: 1, // 精良
    Uncommon: 2,	// 稀有
    Epic: 3, 		// 史诗
    Legend: 4, 	// 传说
    Eternity: 5, 	// 不朽
}

//订单稀有度对应的资源
VoyageConst.Order_Rarity_Res = {
    [VoyageConst.Order_Rarity.Normal]: "voyage_1006",
    [VoyageConst.Order_Rarity.Excellent]: "voyage_1005",
    [VoyageConst.Order_Rarity.Uncommon]: "voyage_1004",
    [VoyageConst.Order_Rarity.Epic]: "voyage_1003",
    [VoyageConst.Order_Rarity.Legend]: "voyage_1002",
    [VoyageConst.Order_Rarity.Eternity]: "voyage_1001",
}

//订单稀有度对应的字色
VoyageConst.Order_Rarity_Color = {
    [VoyageConst.Order_Rarity.Normal]: new cc.Color(66, 75, 84, 255),
    [VoyageConst.Order_Rarity.Excellent]: new cc.Color(35, 119, 1, 255),
    [VoyageConst.Order_Rarity.Uncommon]: new cc.Color(6, 79, 147, 255),
    [VoyageConst.Order_Rarity.Epic]: new cc.Color(126, 6, 147, 255),
    [VoyageConst.Order_Rarity.Legend]: new cc.Color(147, 86, 6, 255),
    [VoyageConst.Order_Rarity.Eternity]: new cc.Color(161, 1, 1, 255),
}

//订单状态对应按钮的字色
VoyageConst.Order_Status_Color = {
    [VoyageConst.Order_Status.Unget]: new cc.Color(37, 85, 5, 255),
    [VoyageConst.Order_Status.Underway]: new cc.Color(37, 85, 5, 255),
    [VoyageConst.Order_Status.Finish]: new cc.Color(113, 40, 4, 255),
}

//选中的英雄头像框位置
VoyageConst.Chose_Hero_PosX = {
    [1]: [319],
    [2]: [255, 383],
    [3]: [191, 319, 447],
    [4]: [127, 255, 383, 511],
    [5]: [63, 191, 319, 447, 575]
}

VoyageConst.Condition_Icon_PosX = {
    [1]: [0],
    [2]: [-38, 38],
    [3]: [-76, 0, 76],
    [4]: [-114, -38, 38, 114],
    [5]: [-152, -76, 0, 76, 152]
}

module.exports = VoyageConst;

