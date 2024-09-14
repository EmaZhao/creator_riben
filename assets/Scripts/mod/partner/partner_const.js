var PartnerConst = {}


// -竖版伙伴常量配置-------
PartnerConst.Type = {
    Message: 1,
    Break: 2,
    Skill: 3,
    Star: 4,
    StarLife: 5,
}

PartnerConst.Form_Type = {
    Pos : 1,   // 布阵阵位设置
    Learn : 2, // 阵法学习
    Help : 3,  // 助阵
    Other : 4, // 其他

}

// 处理对应 PartnerViewItem 的创建来源类型  和 PartnerConst.Form_Type类似
PartnerConst.Item_Create_Form_Type = {
    ItemCreateReset : 1,   // 重生
    ItemCreateOther : 99   // 其他
}

// 神器面板类型
PartnerConst.Artifact_Type = {
    Compose : 1,   // 合成
    Recast : 2,    // 重铸
    Resolve : 3,   // 分解
    Cloth : 4,     // 穿戴
    Getoff : 5,    // 卸下
    Replace : 6,   // 替换
    Upstar : 7,    // 升星
    Source : 8,    // 来源
}


// 功能阵法类型，通用的
PartnerConst.Fun_Form = {
    Drama : 0,                  // 剧情副本阵法
    Arena : 1,                  // 竞技场防御阵型
    // Adventure_Defence : 2,   
    // Adventure_Act : 3,
    GuildDun_AD : 4,            // 公会副本的戦士阵
    ArenaChampion : 6,          // 冠军赛阵法
    EndLess : 7,                // 无尽试炼
    GodBattle : 8,              // 众神战场
    Ladder : 9,                 // 跨服天梯
    Expedit_Fight : 10,         // 远征的战斗
    Startower: 17,              //试练塔 --旧星命塔
    LimitExercise  : 21,         //活动试炼之境的
}

PartnerConst.Red_Point_Type = {
    Level : 1,
    Star : 2,
    Skill : 3,
    Equip : 4,
    Artifact : 5,
    Form : 6,
    Equip_make : 7,
    Gemstone : 8,
}

// 伙伴自身的红点状态
PartnerConst.Vo_Red_Type = {
    Level : 1,
    Skill : 2,
    Star : 3,
    Equip : 4,
    Artifact : 5,
    EequipJing : 6,
    EquipMake : 7,
    Gemstone : 8,
    Break : 9
}


PartnerConst.Hero_Type ={
    [0] : "全部",
    [1] : "控制",
    [2] : "魔法",
    [3] : "戦士",
    [4] : "タンク",
    [5] : "補助",
}

PartnerConst.EqmTips = {
    normal : 0,
    backpack : 1,
    partner : 2,
    other : 3,
}

PartnerConst.ArtifactTips = {
    normal : 0,
    backpack : 1,
    partner : 2,
}


// 一共能存多少个队伍
PartnerConst.FormCount = 5
// 公会战布防侧边栏
PartnerConst.OpenType =
{
    Jie : 1,       // 升阶
    Level : 2,     // 升级
    Star : 3,      // 升星
    Skill : 4,     // 技能
    Equip : 5,     // 装备
    Awake : 6,     // 装备
}
PartnerConst.SubType ={
    Halo : 1,      // 光环
    EquipBag : 2,   // 装备背包
    AritfactBag : 3,   // 神器背包
    ArtifactMake : 4,   // 神器合成
    ArtifactSummon : 5,   // 神器铸造
}
// 星阶线路图
PartnerConst.starPos = {
    [1]:{x:34,y:391},
    [2]:{x:118,y:366},    
    [3]:{x:212,y:416},
    [4]:{x:294,y:365},
    [5]:{x:234,y:312},    
    [6]:{x:308,y:255},
    [7]:{x:208,y:202},
    [8]:{x:140,y:275},
    [9]:{x:38,y:262},
    [10]:{x:105,y:204},
}
// 星阶线条位置
PartnerConst.linePos = {
    [1]: {x: 53,y: 421,rota: 20},
    [2]: {x: 150,y: 394,rota: -25},    
    [3]: {x: 238,y: 432,rota: 23},
    [4]: {x: 262,y: 324,rota: -40},
    [5]: {x: 257,y: 330,rota: 45},    
    [6]: {x: 246,y: 236,rota: -25},
    [7]: {x: 166,y: 290,rota: 43},
    [8]: {x: 70,y: 280,rota: -7},
    [9]: {x: 66,y: 278,rota: 45},  
}
PartnerConst.AttrIconPos = {
    [1] : {x:37,y:31},
    [2] : {x:109,y:83},
    [3] : {x:150,y:156},
    [4] : {x:0, y:0}
}

// 觉醒星星位置
PartnerConst.awakePos = {
    [1]: {x: 175,y: 454},
    [2]: {x: 245,y: 426},    
    [3]: {x: 267,y: 361},
    [4]: {x: 244,y: 295},
    [5]: {x: 176,y: 267},    
    [6]: {x: 109,y: 293},
    [7]: {x: 82,y: 361},
    [8]: {x: 108,y: 429},
}

// 装备出售面板小星星的位置
PartnerConst.StarPos = {
    [1] : {[1]:{x:52,y:87}},
    [2] : {[1]:{x:34,y:87},[2]:{x:70,y:87}},
    [3] : {[1]:{x:50,y:100},[2]:{x:33,y:73},[3]:{x:70,y:73}},
    [4] : {[1]:{x:34,y:104},[2]:{x:70,y:104},[3]:{x:33,y:73},[4]:{x:70,y:73}},
    [5] : {[1]:{x:35,y:104},[2]:{x:65,y:104},[3]:{x:23,y:74},[4]:{x:52,y:72},[5]:{x:81,y:72}},
}

// 装备出售筛选主属性顺序
PartnerConst.EquipSellAttrType = {
    [1] : 1,
    [2] : 101,
    [3] : 104,
    [4] : 107,
    [5] : 106,
    [6] : 118,
    [7] : 119,
    [8] : 120,
    [9] : 113,
    [10] : 114,
    [11] : 115,
    [12] : 116,

}
// 装备出售筛选主属性顺序，翻转
PartnerConst.EquipSellAttrTypeII = {
    [1] : 1,
    [101] : 2,
    [104] : 3,
    [107] : 4,
    [106] : 5,
    [118] : 6,
    [119] : 7,
    [120] : 8,
    [113] : 9,
    [114] : 10,
    [115] : 11,
    [116] : 12,

}

// 装备套装又要一套排序
PartnerConst.EquipSellAttrTypeIII = {
    [1] : 1,
    [2] : 104,
    [3] : 101,
    [4] : 107,
    [5] : 113,
    [6] : 115,
    [7] : 106,
    [8] : 120,
    [9] : 118,
    [10] : 119,
    [11] : 114,
    [12] : 116,

}

// 装备整套排序问题
PartnerConst.EqmPosByType = {
    [1] : 4,
    [2] : 3,
    [3] : 5,
    [4] : 1,
    [5] : 6,
    [6] : 2,
}

// 穿戴的装备类型顺序位置跟表不一致，要转换
PartnerConst.Eqm_posII = {
    [1]:1,
    [2]:6,
	[3]:2,
    [4]:4,
    [5]:3,
	[6]:5,
}

 PartnerConst.getSkillDesc = function (level) {
    if (level == 2) {
        return Utils.TI18N("中级")
    } else if (level == 3) {
        return Utils.TI18N("高级")
    } else if (level == 4) {
        return Utils.TI18N("特级")        
    } else if (level == 5) {
        return Utils.TI18N("神级")
    } else {
        return Utils.TI18N("低级")
    }
 },

// 英雄重生 
PartnerConst.Reset = {
    ResetType    : 1,  // 英雄重生类型
    DisbandType  : 2   // 英雄遣散类型
}

// 技能名称颜色
PartnerConst.SkillColor = {
    [1] : new cc.Color(0x68,0x45,0x2a,0xff),
    [2] : new cc.Color(0x3a,0x78,0xc4,0xff),
    [3] : new cc.Color(0xb3,0x58,0x00,0xff),
    [4] : new cc.Color(0xa8,0x38,0xb3,0xff),
    [5] : new cc.Color(0xe2,0x87,0x00,0xff),
    [6] : new cc.Color(0xd9,0x50,0x14,0xff),
}

module.exports = PartnerConst;