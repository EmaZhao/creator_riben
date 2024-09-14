var HeroConst = {}
var BackPackConst = require("backpack_const")
// 英雄背包页签类型
HeroConst.BagTab = {
	eBagHero : 1 ,    // 英雄页签
    eBagPokedex : 2 , // 图鉴页签
    // eElfin  : 3,  // 精灵
    eHalidom : 4,  // 圣物
}
//英雄面板功能按钮
HeroConst.FunctionTab = {
	eHeroInfo : 1 ,    // 英雄总览
    eProphet : 2 , // 先知圣殿
    eSacrifice  : 3,  // 祭祀小屋
    eFusion : 4,  // 融合神殿
    eForge : 5,  //锻造屋
    eArtifact : 6,  //神器
}
//英雄主信息界面页签类型
HeroConst.MainInfoTab = {
    eMainTrain          : 1 , //培养  // eMainEquip          : 2 , //装备 装备界面被移除了 放到英雄旁边
    eMainUpgradeStar    : 2 , //升星 
    eMainTalent         : 3 , //天赋
}

//布阵界面中间的页签类型
HeroConst.FormMiddleTab = {
    eFormHero          : 1 , //上阵英雄
    eFormHallows       : 2 , //神器
    eFormFormation     : 3 , //阵法
}

HeroConst.FormShowType = {
    eFormFight   : 1 , //出战
    eFormSave    : 2 , //保存布阵
}

//英雄锁定类型(一般由服务端定义)
HeroConst.LockType = {
    eHeroLock          :   1,  //英雄锁定
    eHeroChangeLock    :   2,  //英雄置换锁定
    eFormLock          :   99, //英雄上阵锁定 //客户端定义 
}

//英雄阵营类型
HeroConst.CampType = { 
	eNone    : 0 , //无
	eWater   : 1 , //水
	eFire    : 2 , //火
	eWind    : 3 , //风
	eLight   : 4 , //光
	eDark    : 5 , //暗
}

//英雄阵营对应名字
// HeroConst.CampName = { //水火风光暗
//     [HeroConst.CampType.eNone]          : "无" , //无
//     [HeroConst.CampType.eWater]         : "水" , //无
//     [HeroConst.CampType.eFire]          : "火" , //无
//     [HeroConst.CampType.eWind]          : "风" , //无
//     [HeroConst.CampType.eLight]         : "光" , //无
//     [HeroConst.CampType.eDark]          : "暗" , //无
// }

HeroConst.CampName = {}
Object.defineProperty(HeroConst.CampName, HeroConst.CampType.eNone, {get: function(){return "无"}})
Object.defineProperty(HeroConst.CampName, HeroConst.CampType.eWater, {get: function(){return "人間"}})
Object.defineProperty(HeroConst.CampName, HeroConst.CampType.eFire, {get: function(){return "獣人"}})
Object.defineProperty(HeroConst.CampName, HeroConst.CampType.eWind, {get: function(){return "エルフ"}})
Object.defineProperty(HeroConst.CampName, HeroConst.CampType.eLight, {get: function(){return "女神"}})
Object.defineProperty(HeroConst.CampName, HeroConst.CampType.eDark, {get: function(){return "魔族"}})

//英雄阵营对应属性名字

// HeroConst.CampAttrName = { //水火风光暗
//     [HeroConst.CampType.eNone]          : "无" ,   //无
//     [HeroConst.CampType.eWater]         : "水系" , //无
//     [HeroConst.CampType.eFire]          : "火系" , //无
//     [HeroConst.CampType.eWind]          : "自然" , //无
//     [HeroConst.CampType.eLight]         : "光明" , //无
//     [HeroConst.CampType.eDark]          : "黑暗" , //无
// }

HeroConst.CampAttrName = {}
Object.defineProperty(HeroConst.CampAttrName, HeroConst.CampType.eNone, {get: function(){return "无"}})
Object.defineProperty(HeroConst.CampAttrName, HeroConst.CampType.eWater, {get: function(){return Utils.TI18N("水系")}})
Object.defineProperty(HeroConst.CampAttrName, HeroConst.CampType.eFire, {get: function(){return Utils.TI18N("火系")}})
Object.defineProperty(HeroConst.CampAttrName, HeroConst.CampType.eWind, {get: function(){return Utils.TI18N("自然")}})
Object.defineProperty(HeroConst.CampAttrName, HeroConst.CampType.eLight, {get: function(){return Utils.TI18N("光明")}})
Object.defineProperty(HeroConst.CampAttrName, HeroConst.CampType.eDark, {get: function(){return Utils.TI18N("黑暗")}})

//阵营背景资源名字
HeroConst.CampBgRes = {
    [HeroConst.CampType.eWater] : "hero_info_bg_1",
    [HeroConst.CampType.eFire]  : "hero_info_bg_2",
    [HeroConst.CampType.eWind]  : "hero_info_bg_3",
    [HeroConst.CampType.eLight] : "hero_info_bg_4",
    [HeroConst.CampType.eDark]  : "hero_info_bg_5",
}

//阵营底座背景资源名字
HeroConst.CampBottomBgRes = {
    [HeroConst.CampType.eWater] : "hero_camp_1",
    [HeroConst.CampType.eFire]  : "hero_camp_2",
    [HeroConst.CampType.eWind]  : "hero_camp_3",
    [HeroConst.CampType.eLight] : "hero_camp_4",
    [HeroConst.CampType.eDark]  : "hero_camp_5",
}

//英雄职业类型
HeroConst.CareerType = {
    eNone     : 0 , //无
    eMagician     : 2 , //法师
    eWarrior      : 3 , //战士
    eTank         : 4 , //坦克
    eSsistant     : 5 , //補助
}

//英雄职业对应名字

// HeroConst.CareerName = {
//     [0] : "无",
//     // [1] : "无"),
//     [HeroConst.CareerType.eMagician]    : "法师",
//     [HeroConst.CareerType.eWarrior]     : "战士",
//     [HeroConst.CareerType.eTank]        : "坦克",
//     [HeroConst.CareerType.eSsistant]    : "補助",
// }


HeroConst.CareerName = {}
Object.defineProperty(HeroConst.CareerName, 0, {get: function(){return "无"}})
Object.defineProperty(HeroConst.CareerName, HeroConst.CareerType.eMagician, {get: function(){return Utils.TI18N("法师")}})
Object.defineProperty(HeroConst.CareerName, HeroConst.CareerType.eWarrior, {get: function(){return Utils.TI18N("战士")}})
Object.defineProperty(HeroConst.CareerName, HeroConst.CareerType.eTank, {get: function(){return Utils.TI18N("坦克")}})
Object.defineProperty(HeroConst.CareerName, HeroConst.CareerType.eSsistant, {get: function(){return Utils.TI18N("補助")}})


//英雄item显示类型
HeroConst.ExhibitionItemType = {
    eNone  :   0, // 无
    eHeroBag : 1 , //英雄背包类型
    ePokedex : 2 , //图鉴变灰类型
    eHeroChange : 4 , //英雄转换界面
    eHeroReset : 5 , //英雄重生遣散界面
    eFormFight : 7 , //布阵出战界面
    eVoyage : 8 , //远航界面
    eExpeditFight : 9 , //远征
    eStronger : 10 , //我要变强
    eEndLessHero : 11 , //是否是无尽试炼雇佣的英雄
    eHeroSelect: 12,    // 英雄选择
    eUpStar: 13,
    eHeroFuse: 14,
}

//英雄红点类型
HeroConst.RedPointType = {
    eRPLevelUp  : 1,   //升级升阶
    eRPEquip    : 2,   //装备
    eRPStar     : 3,   //升星
    eRPTalent   : 4,   //天赋技能
    // Artifact : 5,
    eRPHalidom_Unlock : 5, // 圣物解锁
    eRPHalidom_Lvup : 6,   // 圣物升级
    eRPHalidom_Step : 7,   // 圣物进阶
    eRPNewPlot  : 8    // 新成人剧情解锁
}

// 装备位置列表
HeroConst.EquipPosList = {
    [1] : BackPackConst.item_type.WEAPON, // 武器
    [2] : BackPackConst.item_type.SHOE, // 鞋子
    [3] : BackPackConst.item_type.CLOTHES, // 衣服
    [4] : BackPackConst.item_type.HAT, // 头盔
}

//神装装备位置列表
HeroConst.HolyequipmentPosList = {
    [1] : BackPackConst.item_type.GOD_EARRING,  //-- 耳环
    [2] : BackPackConst.item_type.GOD_NECKLACE, //-- 项链
    [3] : BackPackConst.item_type.GOD_RING,     //-- 戒指
    [4] : BackPackConst.item_type.GOD_BANGLE,   //-- 手镯
}

//英雄红点类型
HeroConst.ShareType = {
    eHeroInfoShare : 1,     //英雄信息绘图分享
    eLibraryInfoShare : 2,  //图书馆信息绘图分享
}

//英雄界面分享频道类型
HeroConst.ShareBtnType = {
    eHeroShareCross : 1 , //跨服频道 
    eHeroShareWorld : 2 , //世界频道 
    eHeroShareGuild : 3 , //公会频道 
}
//英雄献祭类型
HeroConst.SacrificeType = {
    eHeroSacrifice     :   1, //英雄献祭
    eChipSacrifice     :   2, //英雄碎片献祭
}

//英雄分解类型
HeroConst.ResetType = {
    eHeroReset     :   1, //英雄献祭
    eChipReset     :   2, //英雄碎片献祭
    eHolyEquipSell :   3, //神装出售
    eTenStarChang  :   4, //10星置换
    eActionHeroReset   :   5, //活动的英雄重生
}

HeroConst.SelectHeroType = {
    eStarFuse     : 1, //表示融合祭坛
    eUpgradeStar  : 2, //表示升星界面的
    eHalidom      : 3, //圣物
    eTenConvert   : 4, //活动10星置换
    eResonateStone     : 5, //共鸣圣阵选择英雄
    eResonateEmpowerment : 6,   // 共鸣赋能选择英雄
}
module.exports = HeroConst;