// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      竖版排行榜排行界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RankController = require("rank_controller");
var RankConstant = require("rank_constant");
var RankEvent = require("rank_event");
var ArenaEvent = require("arena_event");
var CommonScrollView = require("common_scrollview");
var RankItem = require("rank_item");
var RoleController = require("role_controller");
var PlayerHead = require("playerhead");
var TimeTool = require("timetool");
var HeroVo = require("hero_vo");

var RankWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("rank", "rank_window");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = RankController.getInstance();
        this.cur_type = 0;
        this.res_list = {};
        this.tab_info_list = {};
        this.first_list = {};
        this.click_index = arguments[0] || 1;
        this.is_cluster = arguments[1] || false;
        this.node_list = [];
    },


    openCallBack: function() {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.seekChild("main_container");
        this.close_btn = this.seekChild(this.main_panel, "close_btn");

        this.rank_panel = this.seekChild(this.main_panel, "rank_panel");
        this.my_rank = this.seekChild(this.main_panel, "my_rank");
        this.seekChild(this.my_rank, "title", cc.Label).string = Utils.TI18N("我的排名");

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
        this.no_rank.string = Utils.TI18N("未上榜");
        this.my_name.string = "";

        this.title_con = this.seekChild(this.main_panel, "title_con");
        var title = this.seekChild(this.title_con, "title_label", cc.Label);
        var name = RankConstant.TitleName[this.click_index] instanceof Function ? RankConstant.TitleName[this.click_index]() : "";
        title.string = name;

        this.top_bg = this.seekChild(this.main_panel, "top_bg", cc.Sprite);
        this.top_bg.node.setScale(0.9, 0.9);

        var res_id = PathTool.getBigBg("rank_1", null, "rank");
        this.loadRes(res_id, function(sf_obj) {
            this.top_bg.spriteFrame = sf_obj;
        }.bind(this))

        this.top_container = this.seekChild("top_container");
        this.top_rank_list = {}; //顶部前3;
        for (var i = 1; i <= 3; i++) {
            var label = this.seekChild(this.top_container, "name_" + i, cc.Label);
            var img = this.seekChild(this.top_container, "guan_" + i);
            if (this.top_rank_list[i] == null) {
                this.top_rank_list[i] = {};
                this.top_rank_list[i].label = label;
                this.top_rank_list[i].img = img;
            }
        }

        this.updateTitle();
    },



    registerEvent: function() {
        this.background.on(cc.Node.EventType.TOUCH_END, function() {
            this.ctrl.openRankView(false);
        }, this)
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function() {
            Utils.playButtonSound("c_close");
            this.ctrl.openRankView(false);
        }, this)

        this.addGlobalEvent(RankEvent.RankEvent_Get_Rank_data, function(data) {
            this.updateRankList(data);
        }, this)

        this.addGlobalEvent(ArenaEvent.UpdateLoopChallengeRank, function(data) {
            this.updateRankList(data);
        }, this)

        this.addGlobalEvent(RankEvent.RankEvent_Get_Time_event, function(data) {
            if (!data || !this.click_index) return
            var index = this.click_index || RankConstant.RankType.drama;
            if (data.type && index != data.type) return
                // var info = SysEnv.getInstance().loadRankFile(index, this.is_cluster);
                // if (!info || Utils.next(info) == null) {
                //     this.senProto(index);
                // } else { 
                //     if (data.time && info.data && data.type && (data.time == 0 || data.time == info.timestamp) && index == data.type) {
                //         this.updateRankList(info.data);
                //     } else {
            this.senProto(index);
            //     }
            // }
        }, this)

        //--公会boss使用的监听
        if (this.click_index == RankConstant.RankType.union_boss) {
            var GuildbossEvent = require("guildboss_event");
            var GuildbossConst = require("guildboss_const");
            this.addGlobalEvent(GuildbossEvent.UpdateGuildDunRank, function(data, index) {
                if (index == GuildbossConst.rank.role) {
                    this.updateRankList(data);
                }
            }, this)
            var RoleEvent = require("role_event");
            this.addGlobalEvent(RoleEvent.WorshipOtherRole, function(data) {
                cc.log(data, this.select_item)
                if (data.idx != null && this.select_item != null && this.select_item.data != null) {
                    if (data.idx == this.select_item.data.rank)
                        this.select_item.updateWorshipStatus();
                }
            }, this)
        }
    },

    openRootWnd: function(data) {
        if (data == null) {
            this.ctrl.send_12901(this.click_index, this.is_cluster);
        } else {
            this.data = data;
            var protocal = {
                boss_id: this.data.boss_id,
                start_num: 1,
                end_num: 100
            }
            var GuildbossConst = require("guildboss_const");
            require("guildboss_controller").getInstance().requestGuildDunRank(GuildbossConst.rank.role, protocal)
        }
    },

    //更新标题
    updateTitle: function() {
        var title_list = RankConstant.RankTitle[this.click_index] || {};
        var num = Object.keys(title_list).length || 0;
        var pos_list = RankConstant.TitlePos[this.click_index] || {};
        var line_pos_list = RankConstant.TitleLinePos[this.click_index] || {};
        for (var i = 1; i <= num; i++) {
            if (i != num) {
                this.createImage(line_pos_list[i])
            }
            var offx = pos_list[i] || 0;
            var label = Utils.createLabel(20, null, null, offx - 336, 230, "", this.main_panel, 0, cc.v2(0, 0.5))
            var str = title_list[i] instanceof Function ? title_list[i]() : "";
            label.string = str;
            this.node_list.push(label);
        }
    },

    createImage: function(x) {
        var line_offx = x || 0;
        var res = PathTool.getCommonIcomPath("common_1069");
        var line = Utils.createImage(this.main_panel, res, line_offx - 338, 230, cc.v2(0, 0.5), true, 1, false);
        this.loadRes(res, function(sf_obj) {
            line.spriteFrame = sf_obj;
        }.bind(this))
        line.node.setScale(1, 0.8);
        this.node_list.push(line);
    },

    updateRankList: function(data) {
        this.data = data;
        this.updateMyData();
        this.updateRankData();
        if (!this.list_view) {
            var list_size = cc.size(610, 512);
            var setting = {
                item_class: RankItem, // 单元类
                start_x: 5, // 第一个单元的X起点
                space_x: 0, // x方向的间隔
                start_y: 0, // 第一个单元的Y起点
                space_y: 0, // y方向的间隔
                item_width: 600, // 单元的尺寸width
                item_height: 120, // 单元的尺寸height
                row: 0, // 行数，作用于水平滚动类型
                col: 1, // 列数，作用于垂直滚动类型
                need_dynamic: true
            }
            this.list_view = new CommonScrollView()
            this.list_view.createScroll(this.rank_panel, cc.v2(0, -30), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
        }
        if (!data || Utils.next(data) == null) {
            this.senProto(this.click_index);
            return
        }
        var list = data.rank_list || {};
        this.showEmptyIcon(false);
        if (list.length <= 0) {
            this.showEmptyIcon(true);
        }
        var callback = function(item, vo) {

        }
        if (this.click_index == RankConstant.RankType.union_boss) {
            callback = function(item) {
                this.worshipOtherRole(item);
            }.bind(this)
        }
        this.list_view.setData(list, callback, { rank_type: this.click_index, is_cluster: this.is_cluster });
    },

    worshipOtherRole: function(item) {
        if (item.data != null) {
            this.select_item = item;
        }
    },

    //显示空白
    showEmptyIcon: function(bool) {
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
            this.loadRes(res, function(sf_obj) {
                this.empty_bg.spriteFrame = sf_obj;
            }.bind(this))
            this.empty_label = Utils.createLabel(26, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 0, -100, "", this.empty_con, 0, cc.v2(0.5, 0.5));
        }
        var str = Utils.TI18N("当前排行榜暂无数据");
        this.empty_label.string = str;
        this.empty_con.active = bool;
    },

    senProto: function(index) {
        if (index == RankConstant.RankType.union) {
            this.ctrl.send_12903();
        } else if (index == RankConstant.RankType.arena) {
            var ArenaController = require("arena_controller");
            ArenaController.getInstance().sender20221();
        } else if (index == RankConstant.RankType.action_partner) {
            this.ctrl.send_12904(0, 100);
        } else {
            var num = null;
            if (index == 2 || index == 3 || index == 6 || index == 18) {
                num = 300;
            }
            this.ctrl.send_12900(index, null, null, this.is_cluster);
        }
    },

    //更新自己数据
    updateMyData: function() {
        if (!this.data) return
        var data = this.data;
        var str = "0";
        var my_idx = data.my_idx || data.rank || 0;
        if (my_idx && my_idx > 0) {
            str = my_idx;
        }
        this.no_rank.node.active = false;
        var role_vo = RoleController.getInstance().getRoleVo();
        this.rank_index.string = str;
        if (my_idx && my_idx >= 1 && my_idx <= 3) {
            this.rank_index.node.active = false;
            if (!this.my_rank_icon) {
                this.my_rank_icon = this.seekChild(this.my_rank, "my_rank_icon", cc.Sprite);
            }
            this.my_rank_icon.node.active = true;
            this.loadRes(PathTool.getCommonIcomPath("common_200" + my_idx), function(sf_obj) {
                this.my_rank_icon.spriteFrame = sf_obj;
            }.bind(this))
            this.my_rank_icon.node.setScale(0.7);
        } else {
            if (my_idx <= 0) {
                this.no_rank.node.active = true;
                this.rank_index.node.active = false;
            } else {
                this.rank_index.node.active = true;
                if (this.my_rank_icon)
                    this.my_rank_icon.node.active = false;
            }
        }
        this.my_head.setHeadRes(role_vo.face_id);
        var name = role_vo.name || "";
        this.my_name.string = name;
        var avatar_bid = role_vo.avatar_base_id;
        this.my_head.setFrameRes(avatar_bid);

        var str = "";
        var res = null;
        //- 311是main——panel的width一半，
        this.my_rank_power.node.x = 518 - 311;
        this.four_label.node.x = -310;
        this.four_label.node.active = true;
        if (this.rune_item)
            this.rune_item.active = false;

        this.my_rank_power.string = "";
        this.four_label.node.setPosition(cc.v2(310, 50));
        if (this.click_index == RankConstant.RankType.power || this.click_index == RankConstant.RankType.action_power) {
            res = PathTool.getCommonIcomPath("common_90002");
            var power = data.my_val1 || 0;
            str = cc.js.formatStr("<img src='%s' /> %s", "common_90002", power)
        } else if (this.click_index == RankConstant.RankType.drama || this.click_index == RankConstant.RankType.action_drama) {
            var config = gdata("dungeon_data", "data_drama_dungeon_info", [data.my_val1]);
            if (config)
                str = config.name;
        } else if (this.click_index == RankConstant.RankType.union) {
            str = cc.js.formatStr(Utils.TI18N("<size=20><color=#ffffff>ギルド長名：%s</c></size>"), data.leader_name);
            if (role_vo.gid == 0)
                str = Utils.TI18N("暂无公会");
            this.my_name.string = role_vo.name;
            this.my_name.node.setPosition(cc.v2(205 - 311, 82));
            this.my_head.setVisible(false);
            this.four_label.node.setPosition(cc.v2(-310, 45));
            var power = data.power || 0;
            if (power <= 0) {
                this.my_rank_power.string = "0";
            } else {
                this.my_rank_power.string = power;
            }
            this.my_rank_power.node.x = 525 - 300;
        } else if (this.click_index == RankConstant.RankType.tower || this.click_index == RankConstant.RankType.action_tower) {
            var num = data.my_val2 || 0;
            var tim = TimeTool.getTimeMs(num, true);
            if (data.my_val1 && data.my_val1 == 0) {
                tim = "";
                this.four_label.node.active = false;
            }
            this.my_head.setVisible(true);
            this.my_name.node.x = 0;
            this.my_rank_power.string = tim;
            str = data.my_val1.toString() || "";
            this.my_name.node.y = 53;
            this.four_label.node.setPosition(cc.v2(-310, 53));
            this.my_rank_power.node.setPosition(cc.v2(530 - 311, 53));
        } else if (this.click_index == RankConstant.RankType.arena || this.click_index == RankConstant.RankType.action_arena) {
            var res = PathTool.getItemRes("8")
            var score = this.data.score || this.data.my_val1 || 0
            str = cc.js.formatStr("<img src='%s' scale=0.35 /> %s", 8, score)
        } else if (this.click_index == RankConstant.RankType.union_boss) {
            this.four_label.node.active = true;
            this.four_label.node.setPosition(cc.v2(-310, 50))
            this.my_name.node.setPosition(cc.v2(275 - 311, 53));
            this.my_rank_power.node.setPosition(cc.v2(530 - 311, 53));
            this.four_label.string = String(data.mydps || 0);
        } else if (this.click_index == RankConstant.RankType.action_star || this.click_index == RankConstant.RankType.star_power) {

        } else if (this.click_index == RankConstant.RankType.adventure) {
            str = data.my_val1.toString() || 0;
            var val2_str = (data.my_val2 != 0) && data.my_val2 || "";
            this.my_rank_power.string = val2_str;
            this.four_label.node.setPosition(cc.v2(-310, 53));
            this.my_rank_power.node.setPosition(cc.v2(530 - 311, 53))
        }

        if (str == 0) {
            str = "";
        }
        this.four_label.string = str;
        this.loadRes(res, (function(resObject) {
            this.four_label.addSpriteFrame(resObject);
        }).bind(this));
    },

    //创建一个英雄数据
    createPartnerVo: function() {
        var vo = new HeroVo();
        var data = {
            partner_id: self.data.pid,
            bid: self.data.pbid,
            lev: self.data.plev,
            star: self.data.pstar,
        }
        vo.updateHeroVo(data);
        return vo
    },

    //更新前三名头像
    updateRankData: function() {
        if (!this.data) return
        var rank_list = this.data.rank_list || {};
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
                    var height = 380;
                    var off_y = 0;
                    if (idx == 2) {
                        width = -170;
                        height = 370;
                        off_y = 6;
                    } else if (idx == 3) {
                        width = 170;
                        height = 370;
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
                var avatar_bid = v.avatar_id || v.avatar_bid || v.leader_avatar_bid || 0;
                this.first_list[idx].setFrameRes(avatar_bid);

                this.first_list[idx].setHeadRes(face_id);
                this.first_list[idx].addCallBack(function(v) {
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
        var pos_list = {
            [1]: 336 - size.width / 2,
            [2]: 167 - size.width / 2,
            [3]: 508 - size.width / 2
        };
        if (rank_list.length < 3) {
            for (var i = rank_list.length + 1; i <= 3; i++) {
                if (!this.no_label_list[i]) {
                    var label = Utils.createLabel(20, null, null, pos_list[i], 360, Utils.TI18N("虚位以待"), this.main_panel, 0, cc.v2(0.5, 0.5))
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

    closeCallBack: function() {
        if (this.list_view) {
            this.list_view.DeleteMe()
        }
        this.list_view = null;
        this.ctrl.openRankView(false)
        if (this.empty_con) {
            this.empty_con.destroy();
            this.empty_label.destroy();
            this.empty_bg.destroy();
            this.empty_con = null;
            this.empty_bg = null;
            this.empty_label = null;
        }
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
        if (this.my_head) {
            this.my_head.deleteMe();
            this.my_head = null;
        }
        if (this.first_list) {
            for (let i in this.first_list) {
                if (this.first_list[i]) {
                    this.first_list[i].deleteMe()
                    this.first_list[i] = null;
                }
            }
            this.first_list = null;
        }
    }

});

module.exports = RankWindow;