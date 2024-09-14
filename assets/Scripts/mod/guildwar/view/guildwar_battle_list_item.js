// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-09 10:21:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GuildwarConst = require("guildwar_const");

var Guildwar_battle_listPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_against_list_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.size = cc.size(616, 124);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.state_label_lb = this.seekChild("state_label", cc.Label);
        this.gname_label_1_lb = this.seekChild("gname_label_1", cc.Label);
        this.srvname_label_1_lb = this.seekChild("srvname_label_1", cc.Label);
        this.rank_label_1_lb = this.seekChild("rank_label_1", cc.Label);
        this.win_image_1_nd = this.seekChild("win_image_1");
        this.gname_label_2_lb = this.seekChild("gname_label_2", cc.Label);
        this.srvname_label_2_lb = this.seekChild("srvname_label_2", cc.Label);
        this.rank_label_2_lb = this.seekChild("rank_label_2", cc.Label);
        this.win_image_2_nd = this.seekChild("win_image_2");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        this.gname_label_1_lb.string = String(data.guild_name1);
        var index_1 = data.g_sid1.search("_");
        var srv_index_1 = 1;
        if (index_1 != null) {
            srv_index_1 = data.g_sid1.substring(index_1 + 1);
        }
        var srv_name_1 = cc.js.formatStr(Utils.TI18N("[S%s] %s"), srv_index_1, data.srv_name1);
        this.srvname_label_1_lb.string = srv_name_1;
        var rank_str_1 = "";
        if (data.rank1 <= 0) {
            rank_str_1 = Utils.TI18N("未上榜");
        } else {
            rank_str_1 = String(data.rank1);
        }
        this.rank_label_1_lb.string = cc.js.formatStr(Utils.TI18N("服务器排名：%s"), rank_str_1);

        this.gname_label_2_lb.string = data.guild_name2;
        var index_2 = data.g_sid2.search("_");
        var srv_index_2 = 1;
        if (index_2 != null) {
            srv_index_2 = data.g_sid2.substring(index_2 + 1);
        }
        var srv_name_2 = cc.js.formatStr(Utils.TI18N("[S%s] %s"), srv_index_2, data.srv_name2);
        this.srvname_label_2_lb.string = srv_name_2;
        var rank_str_2 = "";
        if (data.rank2 <= 0) {
            rank_str_2 = Utils.TI18N("未上榜");
        } else {
            rank_str_2 = String(data.rank2);
        }
        this.rank_label_2_lb.string = cc.js.formatStr(Utils.TI18N("服务器排名：%s"), rank_str_2);

        this.win_image_1_nd.active = false;
        this.win_image_2_nd.active = false;
        var guildwar_status = this.model.getGuildWarStatus();
        if (data.status == 1) {
            this.state_label_lb.node.active = true;
            if (data.g_id == 0) {
                this.state_label_lb.string = Utils.TI18N("平局");
                this.state_label_lb.node.color = GuildwarConst.against_color[3];
            } else {
                this.state_label_lb.string = Utils.TI18N("已结束");
                this.state_label_lb.node.color = GuildwarConst.against_color[1];
                if (data.g_id && data.g_sid == data.g_sid1) {
                    this.win_image_1_nd.active = true;
                } else {
                    this.win_image_2_nd.active = true;
                }
            }
        } else if (guildwar_status == GuildwarConst.status.processing) {
            this.state_label_lb.node.active = true;
            this.state_label_lb.string = Utils.TI18N("进行中");
            this.state_label_lb.node.color = GuildwarConst.against_color[2];
        } else {
            this.state_label_lb.node.active = false;
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})