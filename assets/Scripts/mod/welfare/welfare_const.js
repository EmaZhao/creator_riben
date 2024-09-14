// --------------------------------------------------------------------
// @author: o@syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var WelfareConst = {
    // 活动所有标签页的类型控制器
    WelfarePanelTypeView: {
        [1]: "supre_yueka_panel",
        [2]: "hero_soul_wish_panel",
        [3]: "sign_panel",
        [6]: "weixin_gift_panel",
        [7]: "action_invest_panel",
        [8]: "action_grow_fund_panel",
        [9]: "qrcode_shard_panel",
        [10]: "honor_yueka_panel",
        [11]: "surevey_quest_window",
        [12]: "month_week_panel",
        [13]: "month_week_panel",
        [14]: "subscription_wechat_panel",
        [15]: "bind_phone_panel",
        [16]: "invitecode_panel",
        [17]: "paste_panel",
        [18]: "notice_panel",
        [19]: "collect_panel",
    },

    WelfareIcon: {
        supre_yueka: 8001, //至尊月卡
        sign: 8003,
        level_gift: 8004,
        power_gift: 8005,
        weixin_gift: 8006,
        share_game: 8007, //游戏分享
        partnersummon_welfar: 8008,
        honor_yueka: 8009, //荣耀月卡
        quest: 8010, //问卷调查
        week: 8011, //周福利
        month: 8012, //月福利
        wechat: 8014, //微信公众号
        bindphone: 8015, //手机绑定
        invicode: 8016, //推荐码
        poste: 8017, //贴吧
        qq_notice: 7001, //qq公告
        sh_share_game: 8101, //深海小程序游戏分享
        sh_wechat: 8102, //深海小程序微信公众号
        sh_collect: 8103, //深海小程序收藏有礼
    },

    //问卷类型
    QuestConst: {
        single: 1,//单选 
        multiple: 3,//多选 
        fill_blank: 4,//填空
    }
};

module.exports = WelfareConst;

