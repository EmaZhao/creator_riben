// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var RankConstant = {
    RankType: {
        drama: 2, //剧情进度
        power: 6,  //战力	
        union: 4, //公会
        arena: 5, //竞技场
        tower: 3,      //星命塔
        action_drama: 9, //七天活动剧情进度
        action_arena: 11, //七天活动竞技场
        action_tower: 10, //七天活动星命塔
        action_power: 12, //七天活动战力
        star_power: 13,     //星命评分
        action_partner: 14,  //七天排行，英雄
        action_adventure: 15,//七天排行，神界冒险
        union_boss: 16, //公会boss个人伤害,.暂时就客户端
        endless: 18,   //无尽试炼排行榜
        action_star: 19,     //七天排行，星命
        hallows_power: 20,    //圣器排行榜
        colors_tone: 21, // 炫彩宝石
        summon: 22, // 召唤
        consumption: 23, // 消费排行
        star_master: 24, // 观星大师
        strong_battle: 25, // 最强阵容
        holy_device: 26, // 圣器比拼
        holy_device_1: 27, // 圣器比拼(七天排行的延伸
        treasure: 28,	// 寻宝排行
        endless_old: 29,   //无尽试炼排行榜(七天排行的延伸
        guild_war: 30,  // 联盟战
        colors_tone: 31, // 炫彩宝石(七天排行的延伸
        gemstone: 32, // 炫彩宝石(七天排行的延伸
        pointglod: 34, // 点金排行榜
        speed_fight: 35,//速战达人
        voyage: 36,//远航排行
        hero_expedit: 37,//远征排行
        adventure: 38,//冒险事件
        elite: 39, //精英段位赛
        element: 40, // 元素圣殿
        adventure_muster: 41, //冒险集结
        heaven: 42, // 天界副本
    },

    RankRewardType: {
        ePointGlod: 97001,   //点金奖励预览 
    },

    RankRewardTitleName: {
        [97001]: function(){ return Utils.TI18N("奖励预览")},   //点金奖励预览 
    }
}

//标题
RankConstant.RankTitle = {
    [2]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("剧情进度")} },
    [3]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("层数")}, [4]: function(){ return Utils.TI18N("通关用时")} },
    [4]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("公会名称")}, [3]: function(){ return Utils.TI18N("等级")}, [4]: function(){ return Utils.TI18N("成员")}, [5]: function(){ return Utils.TI18N("总战力")} },
    [5]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("竞技杯数")} },
    [6]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战斗力")} },
    [9]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("剧情进度")} },
    [10]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("层数")}, [4]: function(){ return Utils.TI18N("通关用时")} },
    [11]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("竞技杯数")} },
    [12]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战斗力")} },
    [13]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战斗力")} },
    [14]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("英雄")}, [4]: function(){ return Utils.TI18N("战斗力")} },
    [15]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("神界探索度")} },
    [16]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("累计伤害")} },
    [18]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("层数")}, [4]: function(){ return Utils.TI18N("战力")} },
    [20]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战力")} },
    [21]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("等级")}, [4]: function(){ return Utils.TI18N("战力")} },
    [22]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("召唤次数")} },
    [23]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("消费排名")} },
    [24]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("观星次数")} },
    [25]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战力")} },
    [26]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战力")} },
    [27]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战力")} },
    [28]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("寻宝次数")} },
    [29]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("层数")}, [4]: function(){ return Utils.TI18N("战力")} },
    [30]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("星数")}, [4]: function(){ return Utils.TI18N("战绩")} },
    [31]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战力")} },
    [32]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("战力")} },

    [RankConstant.RankType.ladder]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("公会名称")} },
    [RankConstant.RankType.pointglod]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("点金次数")} },
    [RankConstant.RankType.hero_expedit]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("活动积分")} },
    [RankConstant.RankType.voyage]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("远航次数")} },
    [RankConstant.RankType.speed_fight]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("速战次数")} },
    [RankConstant.RankType.adventure]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("层数")}, [4]: function(){ return Utils.TI18N("探索度")} },
    [RankConstant.RankType.elite]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("段位")}, [4]: function(){ return Utils.TI18N("积分")} },
    [RankConstant.RankType.adventure_muster]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("层数")}, [4]: function(){ return Utils.TI18N("探索度")} },
    [RankConstant.RankType.heaven]: { [1]: function(){ return Utils.TI18N("排名")}, [2]: function(){ return Utils.TI18N("玩家名称")}, [3]: function(){ return Utils.TI18N("通关星数")} },

}

//标题的线位置
RankConstant.TitleLinePos = {
    [2]: { [1]: 130, [2]: 415, [3]: 675 },
    [3]: { [1]: 130, [2]: 405, [3]: 500 },
    [4]: { [1]: 130, [2]: 340, [3]: 415, [4]: 503 },
    [5]: { [1]: 130, [2]: 415, [3]: 675 },
    [6]: { [1]: 130, [2]: 415, [3]: 665 },
    [9]: { [1]: 130, [2]: 415, [3]: 675 },
    [10]: { [1]: 130, [2]: 405, [3]: 500 },
    [11]: { [1]: 130, [2]: 415, [3]: 675 },
    [12]: { [1]: 130, [2]: 415, [3]: 675 },
    [13]: { [1]: 130, [2]: 405, [3]: 500 },
    [14]: { [1]: 130, [2]: 380, [3]: 500 },
    [15]: { [1]: 130, [2]: 405, [3]: 500 },
    [16]: { [1]: 130, [2]: 415, [3]: 665 },
    [18]: { [1]: 130, [2]: 380, [3]: 500 },
    [20]: { [1]: 130, [2]: 405, [3]: 500 },
    [21]: { [1]: 130, [2]: 380, [3]: 500 },
    [22]: { [1]: 130, [2]: 405, [3]: 500 },
    [23]: { [1]: 130, [2]: 405, [3]: 500 },
    [24]: { [1]: 130, [2]: 405, [3]: 500 },
    [25]: { [1]: 130, [2]: 405, [3]: 500 },
    [26]: { [1]: 130, [2]: 405, [3]: 500 },
    [27]: { [1]: 130, [2]: 405, [3]: 500 },
    [28]: { [1]: 130, [2]: 380, [3]: 500 },
    [29]: { [1]: 130, [2]: 380, [3]: 500 },
    [30]: { [1]: 130, [2]: 380, [3]: 500 },
    [31]: { [1]: 130, [2]: 380, [3]: 500 },
    [32]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.ladder]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.pointglod]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.hero_expedit]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.voyage]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.speed_fight]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.adventure]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.elite]: { [1]: 130, [2]: 425, [3]: 524 },
    [RankConstant.RankType.adventure_muster]: { [1]: 130, [2]: 380, [3]: 500 },
    [RankConstant.RankType.heaven]: { [1]: 130, [2]: 380, [3]: 500 },
}

//标题
RankConstant.TitleName = {
    [2]: function(){ return Utils.TI18N("剧情进度")},
    [3]: function(){ return Utils.TI18N("试炼塔")},
    [4]: function(){ return Utils.TI18N("公会排名")},
    [5]: function(){ return Utils.TI18N("竞技场")},
    [6]: function(){ return Utils.TI18N("战力排名")},
    [9]: function(){ return Utils.TI18N("剧情进度")},
    [10]: function(){ return Utils.TI18N("星命塔")},
    [11]: function(){ return Utils.TI18N("竞技场")},
    [12]: function(){ return Utils.TI18N("战力排名")},
    [13]: function(){ return Utils.TI18N("星命评分")},
    [14]: function(){ return Utils.TI18N("英雄战力")},
    [15]: function(){ return Utils.TI18N("神界评分")},
    [16]: function(){ return Utils.TI18N("伤害排行")},
    [18]: function(){ return Utils.TI18N("无尽试炼")},
    [19]: function(){ return Utils.TI18N("星命评分")},
    [20]: function(){ return Utils.TI18N("圣器战力")},
    [21]: function(){ return Utils.TI18N("炫彩宝石")},
    [22]: function(){ return Utils.TI18N("召唤排行")},
    [30]: function(){ return Utils.TI18N("战绩排行榜")},
    [23]: function(){ return Utils.TI18N("消费排行")},
    [24]: function(){ return Utils.TI18N("观星大师")},
    [25]: function(){ return Utils.TI18N("最强阵容")},
    [26]: function(){ return Utils.TI18N("圣器比拼")},
    [27]: function(){ return Utils.TI18N("圣器比拼")},
    [28]: function(){ return Utils.TI18N("寻宝比拼")},
    [29]: function(){ return Utils.TI18N("无尽试炼")},
    [31]: function(){ return Utils.TI18N("炫彩宝石")},
    [32]: function(){ return Utils.TI18N("炫彩宝石")},
    [RankConstant.RankType.ladder]: function(){ return Utils.TI18N("天梯排行")},
    [RankConstant.RankType.pointglod]: function(){ return Utils.TI18N("点金榜")},
    [RankConstant.RankType.hero_expedit]: function(){ return Utils.TI18N("远征榜")},
    [RankConstant.RankType.voyage]: function(){ return Utils.TI18N("远航榜")},
    [RankConstant.RankType.speed_fight]: function(){ return Utils.TI18N("速战榜")},
    [RankConstant.RankType.adventure]: function(){ return Utils.TI18N("冒险榜")},
    [RankConstant.RankType.elite]: function(){ return Utils.TI18N("精英赛")},
    [RankConstant.RankType.adventure_muster]: function(){ return Utils.TI18N("冒险榜")},
    [RankConstant.RankType.heaven]: function(){ return Utils.TI18N("天界副本")},
},



    //标题位置
    RankConstant.TitlePos = {
        [2]: { [1]: 60, [2]: 220, [3]: 450 },
        [3]: { [1]: 60, [2]: 210, [3]: 430, [4]: 520 },
        [4]: { [1]: 60, [2]: 192, [3]: 343, [4]: 415, [5]: 535 },
        [5]: { [1]: 60, [2]: 220, [3]: 485 },
        [6]: { [1]: 60, [2]: 220, [3]: 485 },
        [9]: { [1]: 60, [2]: 220, [3]: 485 },
        [10]: { [1]: 60, [2]: 210, [3]: 430, [4]: 520 },
        [11]: { [1]: 60, [2]: 220, [3]: 485 },
        [12]: { [1]: 60, [2]: 220, [3]: 485 },
        [13]: { [1]: 60, [2]: 210, [3]: 485 },
        [14]: { [1]: 60, [2]: 210, [3]: 421, [4]: 520 },
        [15]: { [1]: 60, [2]: 210, [3]: 460 },
        [16]: { [1]: 60, [2]: 220, [3]: 485 },
        [18]: { [1]: 60, [2]: 210, [3]: 418, [4]: 550 },
        [20]: { [1]: 60, [2]: 210, [3]: 485 },
        [21]: { [1]: 60, [2]: 210, [3]: 415, [4]: 540 },
        [22]: { [1]: 60, [2]: 210, [3]: 467 },
        [23]: { [1]: 60, [2]: 210, [3]: 470 },
        [24]: { [1]: 60, [2]: 210, [3]: 473 },
        [25]: { [1]: 60, [2]: 210, [3]: 485 },
        [26]: { [1]: 60, [2]: 210, [3]: 485 },
        [27]: { [1]: 60, [2]: 210, [3]: 485 },
        [28]: { [1]: 60, [2]: 210, [3]: 485 },
        [29]: { [1]: 60, [2]: 210, [3]: 418, [4]: 550 },
        [30]: { [1]: 60, [2]: 210, [3]: 421, [4]: 548 },
        [31]: { [1]: 60, [2]: 210, [3]: 485 },
        [32]: { [1]: 60, [2]: 210, [3]: 485 },
        [RankConstant.RankType.ladder]: { [1]: 60, [2]: 210, [3]: 485 },
        [RankConstant.RankType.pointglod]: { [1]: 60, [2]: 210, [3]: 485 },
        [RankConstant.RankType.hero_expedit]: { [1]: 60, [2]: 210, [3]: 448 },
        [RankConstant.RankType.voyage]: { [1]: 60, [2]: 210, [3]: 448 },
        [RankConstant.RankType.speed_fight]: { [1]: 60, [2]: 210, [3]: 448 },
        [RankConstant.RankType.adventure]: { [1]: 60, [2]: 210, [3]: 421, [4]: 548 },
        [RankConstant.RankType.elite]: { [1]: 60, [2]: 210, [3]: 450, [4]: 548 },
        [RankConstant.RankType.adventure_muster]: { [1]: 60, [2]: 210, [3]: 421, [4]: 548 },
        [RankConstant.RankType.heaven]: { [1]: 60, [2]: 210, [3]: 448 },
    },

    module.exports = RankConstant