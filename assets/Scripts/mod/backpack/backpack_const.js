// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      背包通用常量 
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var BackPackConst = {
    Bag_Code:{
        BACKPACK: 1,    // 背包
        STORAGE: 2,     // 仓库
        EQUIPS: 3,      // 装备
    },

    item_tab_type:{
        OTHERS: 0,      // 其他
        EQUIPS: 1,      // 装备
        PROPS: 2,       // 道具
        HERO:3,         // 英雄
        SPECIAL: 4,     // 特殊
        HOLYEQUIPMENT:5,// 神装
    },

    quality:{
        white: 0,          // 白
        green: 1,          // 绿
        blue: 2,           // 蓝
        purple: 3,         // 紫
        orange: 4,         // 橙
        red: 5             // 红
    },

    item_type: {
        NORMAL: 0,                  // 普通
        WEAPON: 1,                  // 武器
        SHOE: 2,                    // 鞋子
        CLOTHES: 3,                 // 衣服
        HAT: 4,                     // 头盔
        ASSET: 7,                   // 资产
        MATERIALS: 9,               // 材料
        ARTIFACTCHIPS: 10,          // 神器(现在叫 符文)
        GOD_EARRING: 23,            // 神装_耳环
        GOD_RING: 24,               // 神装_戒指
        GOD_NECKLACE: 25,           // 神装_项链
        GOD_BANGLE : 26,            // 神装_手镯
        GIFT: 100,                  // 礼包
        FREE_GIFT: 101,             // 自选礼包
        PARTNER_DEBRIS: 102,        // 伙伴碎片
        STAR_SOUL: 105,             // 星命
        WEEK_CARD: 27,              // 周卡
        HERO_SKIN: 28,              // 英雄皮肤
    },

    //  背包中物品的使用类型,只区分消耗和非消耗类
    item_use_type: {
        NO_DIRECT_USE: 0,                // 不能直接使用
        CONSUM: 1,                // 消耗,直接使用的
        NO_CONSUM: 2,                // 不消耗
        EQUIP: 3,                // 穿戴
        BATCH_USE: 4,                // 批量使用
    },
    
    // 物品tips按钮需要枚举

    tips_btn_type: {
        source: 1,              //来源
        goods_use: 2,           //普通物品使用
        boss_source: 3,         //跳转世界boss界面
        drama_new_source: 4,    //跳转剧情副本最新的关卡页面
        drama_source: 5,        //跳转剧情副本界面
        hero_source: 6,         //跳转英雄信息界面
        skill_source: 7,        //跳转英雄技能界面
        form_source: 8,         //跳转编队阵法界面
        call_source: 9,         //跳转召唤界面
        artifact_source: 10,    //跳转神器重铸界面
        redbag: 11,             //红包
        head: 12,               //个人设置头像
        chenghao: 13,           //个人设置称号
        stone_upgrade: 14,      //跳转宝石升级界面
        partner_character: 15,  //跳转形象设置
        arena_source     : 16,  //跳转竞技场
        low_treasure     : 17,  //跳转幸运探宝
        high_treasure     : 18,  //跳转高级探宝
        seerpalace_summon: 19,  // 先知殿
        seerpalace_change: 20,  // 先知召唤
        tanwei: 20,             //摆摊
        sell: 21,               //出售
        sell2: 22,              //按物品表填的价值出售
        fenjie: 30,             //分解
        hecheng: 31,            //英雄碎片合成
        hecheng2: 32,           //神器合成
        upgrade_star: 33,       // 伙伴直升卡,升星的
        halidom: 34,            // 跳转到圣物
        heaven_book : 35,       /// 神装图鉴
        item_sell  :  37,       //道具出售 
    },

    // 物品消耗使用还是出售
    ItemConsumeType:{
        use: 1,
        sell: 2,
        resolve: 3,
        special: 4,
    },

    // 监测是否为装备
    checkIsEquip:function(type){
        return type == this.item_type.WEAPON || type == this.item_type.SHOE || type == this.item_type.CLOTHES || type == this.item_type.HAT
    },

    checkIsArtifact: function(type) {
        return type == BackPackConst.item_type.ARTIFACTCHIPS
    },

    // 获取品质色
    quality_color:function(quality){
        if(quality == this.quality.green){
            return gdata("color_data", "data_color16", 178)
        }else if(quality == this.quality.blue){
            return gdata("color_data", "data_color16", 203)
        }else if(quality == this.quality.purple){
            return gdata("color_data", "data_color16", 185)
        }else if(quality == this.quality.orange){
            return gdata("color_data", "data_color16", 184)
        }else if(quality == this.quality.red){
            return gdata("color_data", "data_color16", 206)
        }else{
            return gdata("color_data", "data_color16", 1)
        }
    },

    // 通用获取属性值
    getAttrValue:function(attr_key, attr_val){
        if (attr_key == null || attr_key == "" || attr_val == null || attr_val == 0){
            return 0
        }
        var val_type = gdata("attr_data", "data_type", attr_key)
        if (val_type == null || val_type == 1){
            return attr_val
        }
        return attr_val*0.1+"%"
    },

    getEquipTipsColor: function (quality) {
        quality = quality || 0;
        if (quality == this.quality.red) {
            return new cc.Color(0xff, 0x9c, 0x97, 0xff)
        } else if (quality == this.quality.orange) {
            return new cc.Color(0xff, 0xed, 0x8b, 0xff)
        } else if (quality == this.quality.purple) {
            return new cc.Color(0xd4, 0xae, 0xff, 0xff)
        } else if (quality == this.quality.blue) {
            return new cc.Color(0x98, 0xfb, 0xff, 0xff)
        } else if (quality == this.quality.green) {
            return new cc.Color(0x8b, 0xff, 0x8e, 0xff)
        } else
            return new cc.Color(0xd9, 0xd9, 0xd9, 0xff)
    },
};

BackPackConst.tips_btn_title = {
    [BackPackConst.tips_btn_type.source]            : "入手方法",
    [BackPackConst.tips_btn_type.goods_use]         : "使用",
    [BackPackConst.tips_btn_type.boss_source]       : "使用",
    [BackPackConst.tips_btn_type.drama_new_source]  : "使用",
    [BackPackConst.tips_btn_type.drama_source]      : "使用",
    [BackPackConst.tips_btn_type.hero_source]       : "使用",
    [BackPackConst.tips_btn_type.skill_source]      : "使用",
    [BackPackConst.tips_btn_type.form_source]       : "使用",
    [BackPackConst.tips_btn_type.call_source]       : "使用",
    [BackPackConst.tips_btn_type.artifact_source]   : "改鋳",
    [BackPackConst.tips_btn_type.redbag]            : "使用",
    [BackPackConst.tips_btn_type.head]              : "使用",
    [BackPackConst.tips_btn_type.chenghao]          : "使用",
    [BackPackConst.tips_btn_type.stone_upgrade]     : "使用",
    [BackPackConst.tips_btn_type.partner_character] : "使用",
    [BackPackConst.tips_btn_type.arena_source]      : "使用",
    [BackPackConst.tips_btn_type.low_treasure]      : "使用",
    [BackPackConst.tips_btn_type.high_treasure]     : "使用",
    [BackPackConst.tips_btn_type.tanwei]            : "摆摊",
    [BackPackConst.tips_btn_type.sell]              : "売却",
    [BackPackConst.tips_btn_type.sell2]             : "売却",
    [BackPackConst.tips_btn_type.fenjie]            : "分解",
    [BackPackConst.tips_btn_type.hecheng]           : "合成",
    [BackPackConst.tips_btn_type.hecheng2]          : "合成",
    [BackPackConst.tips_btn_type.upgrade_star]      : "使用",
    [BackPackConst.tips_btn_type.seerpalace_summon] : "使用",
    [BackPackConst.tips_btn_type.seerpalace_change] : "使用",
    [BackPackConst.tips_btn_type.halidom]           : "使用",
    [BackPackConst.tips_btn_type.item_sell]         : "売却",
},
// -- 物品的使用效果,使用这个物品可以获得
BackPackConst.item_effect_type = {
    GOLD : 1,                  // -- 使用这类物品可以获得钻石
    COIN : 2,
    EXP : 3,
    PARTNER_EXP : 4,           // -- 获得伙伴经验
    PARTNER_DEBRIS : 5,        //-- 伙伴碎片
    BUFF : 6,                  // -- buff
    PARTNER : 7,               //-- 获得伙伴
    GIFT : 8                    //-- 商城特惠礼包时效
}
BackPackConst.getWhiteQualityColorStr = function(quality){
    quality = quality || 0
    if(quality == BackPackConst.quality.red){
        return Config.color_data.data_color16[206] 
    }else if(quality == BackPackConst.quality.orange){ 
        return Config.color_data.data_color16[184] 
    }else if(quality == BackPackConst.quality.purple){ 
        return Config.color_data.data_color16[185] 
    }else if(quality == BackPackConst.quality.blue){ 
        return Config.color_data.data_color16[203] 
    }else if(quality == BackPackConst.quality.green){ 
        return Config.color_data.data_color16[178] 
    }else{
        return Config.color_data.data_color16[274] 
    }
}
//是否周卡
BackPackConst.checkoutIsWeekCard = function(data_type){
    if(data_type){
        if(data_type == BackPackConst.item_type.WEEK_CARD){
            return true
        }else{
            return false
        }
    }
    return false
},
//是否皮肤
BackPackConst.checkIsHeroSkin = function(_type){
    if(!_type) return false;
    if (_type == BackPackConst.item_type.HERO_SKIN){
        return true
    }
    return false
},

//是否是英雄
BackPackConst.checkIsHero = function(data){
  if(data){
    if(data.type == BackPackConst.item_type.NORMAL && data.sub_type == 3){
      return true;
    }
  }
  return false;
}
module.exports = BackPackConst;