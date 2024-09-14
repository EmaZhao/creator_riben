// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      主ui界面的一些常量
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var SceneConst = {
    //中心场景建筑
    CenterSceneBuild: {
        shop: 1,                    //商城
        mall: 2,                    //集市
        arena: 3,                   //竞技场
        startower: 4,               //星命塔
        summon: 5,                  //召唤
        fuse: 6,                    //融合祭坛 
        guild: 7,                   //联盟
        seerpalace: 8,              //先知殿
        library: 9,                 //图书馆
        variety: 10,                //杂货店
        adventure: 11,              //冒险副口
        ladder: 12,                 //跨服天梯
        crossshow : 13,             //跨服时空
        //以下为旧的
        // video: 9,                   //军情期处
        // endless: 10,                //无尽试炼
    },

    MainSceneWharf: {
        awards: 1,
        monster: 2
    },

    BuildItemType: {
        build: 1,
        effect: 2,
        npc: 3
    },

    SceneId: {
        main_scene: 1,        // 主城
    },

    MainSceneStatus: {
        none: 0,
        main_scene: 1,         // 主城
        dungeon_scene: 2,      // 世界地图,剧情副本
        abyss_scene: 3,        // 深渊地图
        guildwar_scene: 4,     // 联盟战地图
        expedition_scene: 5,   // 远征地图
        godbattle_scene: 6,    // 众神战场
        role_scene: 7,         // 角色移动的地图
        bigworld_scene: 8,     // 大世界
    },

    //资源兑换的
    AlchemyType: {
        coin: 1,               // 金币标签
        exp: 2,                // 英雄经验标签
        energy: 3,             // 体力
    },

    // 红点来源
    RedPointType: {
        item: 1,               // 道具计算
        server: 2,             // 服务器
        guild_donate: 3,       // 联盟捐献
        guild_red: 4,          // 联盟红包
        guild_member_red: 5,   // 联盟成员红包
        guild_join: 6,         // 联盟申请
        guild_war: 7,          // 联盟战
        guild_tech_gift: 8,    // 联盟科技礼包
        guild_lev_gift: 9,     // 联盟等级礼包
        guild_boss: 10,        // 联盟boss挑战
        guild_wish: 11,        // 联盟许愿
        guild_daily: 12,       // 联盟每日
        endless: 13,           // 无尽试炼
        dungeonstone: 14,      // 日常任务
        primus: 20,            // 星河神殿
        heroexpedit: 21,       // 远征
    },

    MainSceneDataKey: {
        ["verifyios"]: "config.verifyios_main_scene_data",
        ["normal"]: "config.main_scene_data",
        ["special"]: "config.special_main_scene_data"
    }
};
module.exports = SceneConst;
