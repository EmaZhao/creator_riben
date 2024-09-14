// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗的常量控制
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var BattleConst = {
    Fight_Type:{
        Nil: 0,
        Default: 1,
        Arena: 2,           //竞技场
        Darma: 3,           //剧情副本战斗
        SingleBoss: 4,      //个人Boss
        WorldBoss: 5,       //世界boss
        Adventrue: 6,       //神界探险
        StarTower: 7,       //星命塔
        PK: 8,              //切磋
        GuildDun: 9,        //帮会副本
        Champion: 10,       //冠军联赛
        Endless: 11,        //无尽试炼
        LimitBoss: 12,      //限时BOSS
        Escort: 13,         //护送
        DungeonStone: 14,   //宝石副本
        Godbattle: 15,      //众神战场
        GuildWar: 16,       //联盟战
        PrimusWar: 17,      //荣耀神殿战
        LadderWar: 18,      //跨服天梯
        ExpeditFight: 21,   //远征
        EliteMatchWar : 23, //精英赛
        EliteKingMatchWar : 24, //王者赛
        ElementWar: 25,     // 元素圣殿
        HeroTestWar: 26,    // 英雄试玩
        HeavenWar: 27,      // 天界副本
        CrossArenaWar : 28, // 跨服竞技场
        LimitExercise : 29, // 试炼之境
        AdventrueMine : 30, //秘矿冒险
    },

    // 战斗单位类型
    Unit_Type:{
        Role: 1,            // 主角单位,暂时没有用了
        Hero: 2,            // 伙伴
        Monster: 3,         // 怪物
        Hallows: 4,         // 神器
    },

    Group_Type:{
        Friend:1,
        Enemgy:2,
    },

    Battle_Type_Conf:{
        TYPE_ENEMY: - 1,
        TYPE_ROLE: 1,
        BATTLE_EXIT: 1
    },

    Skill_Type:{
        ACTIVE_SKILL: "active_skill",               //主动技能
        PASSIVE_SKILL: "passive_skill",             //被动技能
        EQM_PASSIVE_SKILL: "eqm_passive_skill",     //装备被动技能
    },

    // 战斗特效播放类型
    Effect_Play_Type:{
        ROLE: 1,                // 自己
        SCENE: 2,               // 场景
        ROLE_SCENE: 3,          // 友方场景
        ENEMY_SCENE: 4,         // 敌方场景
        TARGET: 5,              // 敌方目标
    },

    // 是否在战斗中的类型
    Battle_In_Type:{
        Nil: 0,                 // 当前不在战斗
        UnReal: 1,              // 假战斗
        Real: 2,                // 真战斗
    },
    // 分享类型
    ShareType : {
        SharePk : 1, //轮播
        SharePlunder : 2, //一直播
        ShareLadder : 3,  // 天梯
    },
    JumpType : {
        Summon : 1,   // 召唤
        HeroBag : 2,  // 英雄背包
        Forge : 3,    // 锻造屋
        Hallows : 4,  // 神器
    },

    // 根据战斗类型判断当前的ui类型
    getUIFightByFightType:function(fight_type){
        var MainuiConst = require("mainui_const");
        switch (fight_type) {
            case this.Fight_Type.Darma:
            case this.Fight_Type.Nil:
                return MainuiConst.ui_fight_type.drama_scene;
            case this.Fight_Type.StarTower:
                return MainuiConst.ui_fight_type.star_tower;
            case this.Fight_Type.GuildDun:
                return MainuiConst.ui_fight_type.guild_dun;
            case this.Fight_Type.Arena:
                return MainuiConst.ui_fight_type.arena;
            case this.Fight_Type.LimitBoss:
                return MainuiConst.ui_fight_type.limit_boss;
            case this.Fight_Type.GuildWar:
                return MainuiConst.ui_fight_type.guildwar;
            case this.Fight_Type.PrimusWar:
                return MainuiConst.ui_fight_type.primusWar;
            case this.Fight_Type.LadderWar:
                return MainuiConst.ui_fight_type.ladderwar;
            case this.Fight_Type.Endless://无尽试炼
                return MainuiConst.ui_fight_type.endless;
            case this.Fight_Type.ExpeditFight://远征
                return MainuiConst.ui_fight_type.expedit_fight;
            case this.Fight_Type.DungeonStone:
                return MainuiConst.ui_fight_type.dungeon_stone;
            case this.Fight_Type.ElementWar://元素圣殿
                return MainuiConst.ui_fight_type.dungeon_stone;
            case this.Fight_Type.HeavenWar://天界副本
                return MainuiConst.ui_fight_type.dungeon_stone;
            case this.Fight_Type.Adventrue://冒险
                return MainuiConst.ui_fight_type.sky_scene;
            default:
                return MainuiConst.ui_fight_type.drama_scene;
        }
    },

    // 特殊类型的战斗,
    isNoRequest:function(fight_type){
        return (fight_type == this.Fight_Type.Default || fight_type == this.Fight_Type.PK || fight_type == this.Fight_Type.HeroTestWar);
    },

    // 是否是pvp战斗
    isPvP:function(fight_type){
        return (fight_type == this.Fight_Type.Arena || fight_type == this.Fight_Type.Escort);
    },

    // 是否需要显示玩家名字的
    isNeedName:function(fight_type){
        return (fight_type == this.Fight_Type.PK);
    },

    // 是否显示入场pk动画
    isNeedSpecStart: function (fight_type) {
        return fight_type == BattleConst.Fight_Type.Arena || fight_type == BattleConst.Fight_Type.Champion || fight_type == BattleConst.Fight_Type.PK || fight_type == BattleConst.Fight_Type.LadderWar
    },

    // 是否可以进战斗,这个时候就需要判断当前战斗类型的面板类型跟主界面缓存的类型是否一致
    canDoBattle:function(fight_type){
        var target_ui_fight_type = this.getUIFightByFightType(fight_type);
        var MainUiController = require("mainui_controller");
        var BattleController = require("battle_controller");
        var cur_ui_fight_type = MainUiController.getInstance().getUIFightType();

        return (cur_ui_fight_type == target_ui_fight_type) || this.isNoRequest(fight_type) || BattleController.getInstance().getWatchReplayStatus();
    },
    //战斗分组
    BattleGroupTypeConf : {
        TYPE_GROUP_ENEMY : 2, 	//敌方
        TYPE_GROUP_ROLE : 1, 	//友方
    },  

    // --战斗单位类型
    BattleObjectType : {
        Role : 1,      //--角色(暂时没有了)
        Pet : 2,       //--伙伴(配置表取partern)
        Unit : 3,      //--单位(配置表取unit)
        Hallows : 4    //--神器
    },

    // -- 兼容旧的录像数据中阵营光环id（转为现在的id列表）
    Old_Halo_Id_Change : {
        [1] : [1],
        [2] : [2],
        [3] : [3],
        [4] : [4],
        [5] : [5],
        [6] : [21],
        [7] : [6],
        [8] : [6],
        [9] : [7],
        [10] : [7],
        [11] : [8],
        [12] : [8],
        [13] : [11,18],
        [14] : [13,17],
        [15] : [12,16],
        [16] : [14,20],
        [17] : [15,19],
    }
};
module.exports = BattleConst;