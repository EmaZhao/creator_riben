// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PromptTypeConst = {

    Mail: 1,         //邮件提示
    Add_friend: 2,  //加好友提示
    Join_guild: 4,  //加宗门提示
    Challenge: 6,  //切磋提示
    Private_chat: 8,  //私聊
    Invite_guild: 9,  //邀请公会
    GuildWar_summon: 10, // 公会战集结号
    Guild_merge: 11,//公会合并
    Team_invite: 12,//组队副本邀请
    Friend_energy: 13,//领取好友体力
    World_boss: 14,//世界boss提示
    At_notice: 15,//有人@你
    Endless_trail: 16, //无尽试炼
    Escort: 17,
    GuileMuster: 18, //公会集结
    Guild: 19,       //公会
    Guild_war : 20,   //公会战
    Guild_voyage : 21,   //公会副本
    BBS_message : 22,   //自己留言板消息提醒
    BBS_message_reply : 23,   //他人留言板回复提醒
    BBS_message_reply_self : 24,   //自己留言板有新回复
    Mine_defeat : 25,   //灵矿被掠夺

};
module.exports = PromptTypeConst;
