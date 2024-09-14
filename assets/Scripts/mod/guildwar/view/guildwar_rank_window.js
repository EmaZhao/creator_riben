// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     联盟战排名
// <br/>Create: 2019-05-09 15:51:03
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RankConstant = require("rank_constant");
var GuildwarEvent = require("guildwar_event");
var RankItem = require("rank_item");
var CommonScrollView = require("common_scrollview");
var RoleController = require("role_controller");
var PlayerHead = require("playerhead");

var Guildwar_rankWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("rank", "rank_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.first_list = {};
        this.click_index = RankConstant.RankType.guild_war;
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.node_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");

        this.main_panel = this.seekChild("main_container");
        this.close_btn = this.seekChild("close_btn");

        this.rank_panel = this.seekChild("rank_panel");
        this.my_rank = this.seekChild("my_rank");

        this.rank_index = this.seekChild(this.my_rank, "rank_id", cc.Label);
        this.four_label = this.seekChild(this.my_rank, "four_label", cc.RichText);
        this.my_rank_power = this.seekChild(this.my_rank, "my_rank_power", cc.Label);

        this.my_head = new PlayerHead();
        this.my_head.setParent(this.my_rank);
        this.my_head.show()
        this.my_head.setPosition(-155, 60);
        // this.my_head.setVisible(false);
        this.my_head.setScale(0.9)

        this.no_rank = this.seekChild(this.my_rank, "no_rank", cc.Label);
        this.my_name = this.seekChild(this.my_rank, "my_name", cc.Label);
        this.no_rank.string = "未上榜";
        this.my_name.string = "";

        this.star_label = Utils.createLabel(24, new cc.Color(0x68, 0x45, 0x2a, 0xff), null, 402, 56, "", this.my_rank, 0, cc.v2(0, 0.5));
        this.score_label = Utils.createLabel(24, new cc.Color(0x68, 0x45, 0x2a, 0xff), null, 525, 56, "", this.my_rank, 0, cc.v2(0, 0.5));
        this.node_list.push(this.star_label);
        this.node_list.push(this.score_label);

        this.title_con = this.seekChild(this.main_panel, "title_con");
        var title = this.seekChild(this.title_con, "title_label", cc.Label);
        var name = RankConstant.TitleName[this.click_index] instanceof Function ?RankConstant.TitleName[this.click_index]() : "";
        title.string = name;

        this.top_bg = this.seekChild(this.main_panel, "top_bg", cc.Sprite);
        this.top_bg.node.setScale(0.9, 0.9);

        var res_id = PathTool.getBigBg("rank_1", null, "rank");
        this.loadRes(res_id, function (sf_obj) {
            this.top_bg.spriteFrame = sf_obj;
        }.bind(this))

        this.top_container = this.seekChild("top_container");
        this.top_rank_list = {};//顶部前3;
        for (var i = 1; i <= 3; i++) {
            var label = this.seekChild(this.top_container, "name_" + i, cc.Label);
            var img = this.seekChild(this.top_container, "guan_" + i);
            if (this.top_rank_list[i] == null) {
                this.top_rank_list[i] = {};
                this.top_rank_list[i].label = label;
                this.top_rank_list[i].img = img;
            }
        }

        var list_size = cc.size(610, 510);
        var setting = {
            item_class: RankItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 600,               // 单元的尺寸width
            item_height: 120,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.list_view = new CommonScrollView()
        this.list_view.createScroll(this.rank_panel, cc.v2(0, -30), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))

        this.updateTitle();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildWarRankView(false);
        }, this)
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildWarRankView(false);
        }, this)

        this.addGlobalEvent(GuildwarEvent.UpdateGuildWarRankDataEvent, function (data) {
            this.updateRankList(data);
        }, this)
    },

    //更新标题
    updateTitle: function () {
        var title_list = RankConstant.RankTitle[this.click_index] || {};
        var num = Object.keys(title_list).length || 0;
        var pos_list = RankConstant.TitlePos[this.click_index] || {};
        var line_pos_list = RankConstant.TitleLinePos[this.click_index] || {};
        for (var i = 1; i <= num; i++) {
            if (i != num) {
                this.createImage(line_pos_list[i])
            }
            var offx = pos_list[i] || 0;
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, offx - 336, 230, "", this.main_panel, 0, cc.v2(0, 0.5))
            var str = title_list[i] instanceof Function ? title_list[i]() : "";
            label.string = str;
            this.node_list.push(label);
        }
    },

    createImage: function (x) {
        var line_offx = x || 0;
        var res = PathTool.getCommonIcomPath("common_1069");
        var line = Utils.createImage(this.main_panel, res, line_offx - 338, 230, cc.v2(0, 0.5), true, 1, false);
        this.loadRes(res, function (sf_obj) {
            line.spriteFrame = sf_obj;
        }.bind(this))
        line.node.setScale(1, 0.8);
        this.node_list.push(line);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.ctrl.requestGuildWarRankData();
    },

    updateRankList: function (data) {
        this.rank_data = data;
        this.updateMyData();
        this.updateRankData();
        if (this.rank_data.length <= 0) {
            this.showEmptyIcon(true)
        } else {
            this.showEmptyIcon(false);
        }
        this.list_view.setData(this.rank_data, null, { rank_type: RankConstant.RankType.guild_war })
    },

    getMyselfRankData: function (rid, srv_id) {
        var myself_data = {};
        for (var k in this.rank_data) {
            var data = this.rank_data[k];
            if (data.rid == rid && data.srv_id == srv_id) {
                myself_data = data;
                break
            }
        }
        return myself_data
    },

    updateMyData: function () {
        if (!this.rank_data) return

        var role_vo = RoleController.getInstance().getRoleVo();
        var myself_data = this.getMyselfRankData(role_vo.rid, role_vo.srv_id);

        var str = "0";
        var my_idx = myself_data.rank || 0;
        if (my_idx && my_idx > 0) {
            str = my_idx
        }

        this.no_rank.node.active = false;
        this.rank_index.string = str;

        if (my_idx && my_idx >= 1 && my_idx <= 3) {
            this.rank_index.node.active = false;
            if (!this.my_rank_icon) {
                this.my_rank_icon = this.seekChild(this.my_rank, "my_rank_icon", cc.Sprite);
            }
            this.my_rank_icon.node.active = true;
            this.loadRes(PathTool.getUIIconPath('common', 'common_300' + my_idx), function (sp) {
                this.my_rank_icon.spriteFrame = sp;
            }.bind(this))
            this.my_rank_icon.node.scale = 0.7;
        } else {
            if (my_idx <= 0) {
                this.no_rank.node.active = true;
                this.rank_index.node.active = false;
            } else {
                this.rank_index.node.active = true;
                if (this.my_rank_icon) {
                    this.my_rank_icon.node.active = false;
                }
            }
        }
        this.my_head.setHeadRes(role_vo.face_id);

        this.star_label.string = myself_data.star || "";
        this.my_name.string = myself_data.name || "";
        this.score_label.string = myself_data.war_score || "";
    },

    updateRankData: function () {
        if (!this.rank_data) return
        var rank_list = this.rank_data || {};
        var count = 0;
        var size = this.main_panel.getContentSize();
        for (var i in rank_list) {
            var v = rank_list[i];
            var idx = v.idx || v.rank;
            if (idx > 0 && idx <= 3) {
                count = count + 1;
                if (!this.first_list[idx]) {
                    var head = new PlayerHead();
                    head.show();
                    var width = 0;
                    var height = 373;
                    var off_y = 0;
                    if (idx == 2) {
                        width = - 170;
                        height = 360;
                        off_y = 6;
                    } else if (idx == 3) {
                        width = 170;
                        height = 360;
                        off_y = 6;
                    }
                    head.setPosition(width, height);
                    head.setParent(this.main_panel);

                    var name = this.top_rank_list[count].label;
                    name.node.active = true;
                    var title = this.top_rank_list[count].img;
                    title.active = true;
                    this.first_list[idx] = title;
                    this.first_list[idx] = head;
                    this.first_list[idx].head_name = name;
                }

                var face_id = v.face_id || v.face || v.leader_face || 0;
                var avatar_bid = v.avatar_bid || v.leader_avatar_bid || 0;
                // var vo = gdata("avatar_data", "data_avatar", [avatar_bid]);
                // if (vo) {
                //     var res_id = vo.res_id || 1;
                //     var res = "";
                // }

                this.first_list[idx].setHeadRes(face_id);
                this.first_list[idx].addCallBack(function (v) {
                    var roleVo = RoleController.getInstance().getRoleVo();
                    var rid = v.rid || v.leader_rid || 0;
                    var srv_id = v.srv_id || v.leader_srvid || 0;
                    if (roleVo.rid == rid && roleVo.srv_id == srv_id) return
                    var vo = { rid: rid, srv_id: srv_id };
                    require("chat_controller").getInstance().openFriendInfo(vo);
                }.bind(this, v))

                var name = v.name || "";
                this.first_list[idx].head_name.string = name;
            }
            if (count >= 3)
                break
        }

        if (!this.no_label_list) {
            this.no_label_list = {};
        }

        for (var i in this.no_label_list) {
            this.no_label_list[i].setVisible(false);
        }
        var pos_list = { [1]: 336 - size.width / 2, [2]: 167 - size.width / 2, [3]: 508 - size.width / 2 };
        if (rank_list.length < 3) {
            for (var i = rank_list.length + 1; i <= 3; i++) {
                if (!this.no_label_list[i]) {
                    var label = Utils.createLabel(24, null, null, pos_list[i], 360, Utils.TI18N("虚位以待"), this.main_panel, 0, cc.v2(0.5, 0.5))
                    this.no_label_list[i] = label.node;
                    this.node_list.push(label);
                    if (this.top_rank_list[i]) {
                        this.top_rank_list[i].label.node.active = false;
                        this.top_rank_list[i].img.active = false;
                    }
                }
                this.no_label_list[i].active = true;
            }
        }
    },

    //显示空白
    showEmptyIcon: function (bool) {
        if (!this.empty_con && bool == false) return
        if (!this.empty_con) {
            var size = cc.size(200, 200);
            this.empty_con = new cc.Node();
            this.empty_con.setContentSize(size);
            this.empty_con.setAnchorPoint(cc.v2(0.5, 0.5));
            this.empty_con.setPosition(cc.v2(0, 0));
            this.main_panel.addChild(this.empty_con);
            var res = PathTool.getBigBg("bigbg_3");
            this.empty_bg = Utils.createImage(this.empty_con, null, 0, 0, cc.v2(0.5, 0.5), false)
            this.loadRes(res, function (sf_obj) {
                this.empty_bg.spriteFrame = sf_obj;
            }.bind(this))
            this.empty_label = Utils.createLabel(26, new cc.Color(0x68, 0x45, 0x2a, 0xff), null, 0, -100, "", this.empty_con, 0, cc.v2(0.5, 0.5));
        }
        var str = Utils.TI18N("当前排行榜暂无数据");
        this.empty_label.string = str;
        this.empty_con.active = bool;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.node_list) {
            for (var i in this.node_list) {
                var v = this.node_list[i];
                if (v instanceof cc.Node) {
                    v.destroy();
                    v = null;
                } else {
                    v.node.destroy();
                    v = null;
                }
            }
            this.node_list = null;
        }
        if (this.empty_con) {
            this.empty_con.destroy();
            this.empty_label.destroy();
            this.empty_bg.destroy();
            this.empty_con = null;
            this.empty_bg = null;
            this.empty_label = null;
        }
        if (this.my_head) {
            this.my_head.deleteMe();
            this.my_head = null;
        }
        this.ctrl.openGuildWarRankView(false);
    },
})