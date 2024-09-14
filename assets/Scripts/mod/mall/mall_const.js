// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var MallConst = {
    MallType: {
        GodShop: 1,             //钻石商城
        Recovery: 2,            //神格商店
        ScoreShop: 3,           // 积分商店
        VarietyShop: 4,          //杂货店
        UnionShop: 5,           //公会商店
        ArenaShop: 6,           //竞技积分商城
        BossShop: 7,            //Boss积分商城
        FriendShop: 8,          //友情商城
        SkillShop : 9,         //技能商店
        GuessShop: 16,          // 竞猜兑换
        EliteShop : 17,        // 精英段位赛
        HeroSkin : 18,        // 英雄皮肤
        Ladder: 30,             // 跨服天梯商城
        Seerpalace: 31,         // 先知殿商城
        ActionShop: 32,          // 活动商店
        FestivalAction : 33, //节日活动购买
        SteriousShop : 35, // 杂货铺
    },
    MallFunc:{
        Charge:0,//充值
        Welfare:1,//福利
        Mall:2,//交换所
        VarietyStore:3,//精灵商店
    },
};
module.exports = MallConst;
