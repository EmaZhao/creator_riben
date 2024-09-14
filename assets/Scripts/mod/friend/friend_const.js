// --------------------------------------------------------------------
// @author: zhangyusong@syg.com(必填, 创建模块的人员)
// @description:
//      
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var FriendConst = {

    Type: {
        MyFriend: 1,
        Award: 2,
        ApplyList: 3,
        BlackList: 4,
    },

    FriendGroupType: {
        friend: 1,         //我的好友
        cross_friend: 2,   //跨服好友
        black_list: 3,     //黑名单
    },

    FriendGroupName: {
        [1]: "我的好友",
        [2]: "跨服好友",
        [3]: "黑名单",
    },

    // apply_lev_limit = 5
};
module.exports = FriendConst;
