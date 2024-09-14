// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      排行榜单元项
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RankController = require("rank_controller");
var RankConstant = require("rank_constant");
var HeroVo = require("hero_vo");
var RoleController = require("role_controller");
var PlayerHead = require("playerhead");
var TimeTool = require("timetool");

var RankItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("rank", "rank_item");
        this.ctrl = RankController.getInstance();
        this.data = null;
        this.width = 600;
        this.height = 120;
        this.index = arguments[0] || 1;
        this.rank_type = RankConstant.RankType.drama;
        this.rank_num = 0;
        this.item_list = {};
        this.node_list = [];//放入的是node
    },

    initPanel: function () {
        this.background = this.seekChild("bg");
        this.rank_icon = this.seekChild("rank_icon", cc.Sprite);
        this.rank_index = this.seekChild("rank_index", cc.Label);
        this.other_panel = this.seekChild("other_panel");
        this.select = this.seekChild("select");
        this.select.active = false;
        this._btnPraise = this.seekChild("btnPraise");
        this._btnPraise_btn = this.seekChild("btnPraise", cc.Button);
        this._praise = this.seekChild(this._btnPraise, "img", cc.Sprite);
        this._labelPraise = this.seekChild(this._btnPraise, "label", cc.Label);
        this._btnPraise.active = false;
    },

    clickHandler: function () {
        if (this.call_fun)
            this.call_fun(this.vo);
    },

    setTouchFunc: function (value) {
        this.call_fun = value;
    },

    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_START, function (event) {
            var touches = event.getTouches();
            this.touch_began = touches[0].getLocation();
        }, this);

        this.background.on(cc.Node.EventType.TOUCH_END, function (event) {
            var touches = event.getTouches();
            this.touch_end = touches[0].getLocation();
            var is_click = true;
            if (this.touch_began != null) {
                is_click = Math.abs(this.touch_end.x - this.touch_began.x) <= 20 &&
                    Math.abs(this.touch_end.y - this.touch_began.y) <= 20
            }

            if (is_click == true) {
                Utils.playButtonSound(ButtonSound.Normal);
                if (this.rank_type != RankConstant.RankType.union) {
                    this.openChatMessage();
                }
            }
        }, this);
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null) return
        this.index = this.data.idx || this.data.rank || 1;
        this.rank_index.string = this.index;
        if (this.index >= 1 && this.index <= 3) {
            this.rank_index.node.active = false;
            this.rank_icon.node.active = true;
            this.rank_icon.node.setScale(0.7);
            this.loadRes(PathTool.getCommonIcomPath("common_200" + this.index), function (sf_obj) {
                this.rank_icon.spriteFrame = sf_obj;
            }.bind(this))
        } else {
            this.rank_index.node.active = true;
            this.rank_icon.node.active = false;
        }
        this.updateDataByRankType();
    },

    setExtendData: function (data) {
        if (!data) return
        this.rank_type = data.rank_type || RankConstant.RankType.drama;
        this.is_cluster = data.is_cluster || false;
    },

    updateDataByRankType: function () {
        if (!this.data) return
        for (var i in this.item_list) {
            this.item_list[i].setVisible(false);
        }
        this.other_panel.removeAllChildren();

        var role_name = this.data.name;
        if (this.is_cluster == true) {
            role_name = Utils.transformNameByServ(this.data.name, this.data.srv_id);
        }

        if (this.rank_type != RankConstant.RankType.union) {
            this.player_head = this.createPlayerHead(105, 60);
            var face_id = this.data.face_id || this.data.face;
            var avatar_bid = this.data.avatar_bid;
            this.player_head.setFrameRes(avatar_bid);
            this.player_head.setHeadRes(face_id);
            this.player_head.setLev(this.data.lev);
        }

        //生成的节点之类的都push进 this.node_list这里，统一destroy
        if (this.rank_type == RankConstant.RankType.power || this.rank_type == RankConstant.RankType.action_power) {
            //名字
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 198, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(label);
            label.string = role_name;

            //战力
            var label = Utils.createRichLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(480, this.height / 2), 0, 500)
            this.node_list.push(label);
            this.other_panel.addChild(label.node);

            var power = this.data.val1 || 0;
            var res = PathTool.getCommonIcomPath('common_90002')
            label.string = cc.js.formatStr("<img src='%s' /> %s", "common_90002", power);
            this.loadRes(res, (function (label, resObject) {
                label.addSpriteFrame(resObject);
            }).bind(this, label));
        } else if (this.rank_type == RankConstant.RankType.union) {
            var step = this.data.step || 0;
            step = Math.max(step, 1);
            step = Math.min(step, 11);
            //名字
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 204, 80, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(label);
            label.string = role_name;
            //宗主名字
            var label = Utils.createLabel(20, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 204, 40, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(label);
            label.string = Utils.TI18N("会长：") + (this.data.leader_name || "");
            //等级
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 342, this.height / 2, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(label);
            label.string = this.data.lev || 313;
            //人数
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 425, this.height / 2, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(label);
            var num1 = this.data.members_num || 0;
            var num2 = this.data.members_max || 0;
            label.string = cc.js.formatStr("%s/%s", num1, num2);
            //战力
            var label = Utils.createRichLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(525, this.height / 2), 0, 500)
            this.node_list.push(label);
            this.other_panel.addChild(label.node);
            label.string = String(this.data.power) || 0;
        } else if (this.rank_type == RankConstant.RankType.union_boss) {
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 210, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(label);
            label.string = role_name;
            //dps
            var label = Utils.createRichLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(505, this.height / 2 + 25), 0, 500)
            this.node_list.push(label);
            this.other_panel.addChild(label.node);
            var all_dps = this.data.all_dps || 0;
            label.string = String(all_dps);
            //增加点赞功能
            this.addPraise(this.data);
        } else if (this.rank_type == RankConstant.RankType.tower || this.rank_type == RankConstant.RankType.action_tower) {
            // 名字
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 210, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5));
            this.node_list.push(label);
            label.string = role_name;
            // 层数
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 405, 61, "", this.other_panel, 0, cc.v2(0, 0.5));
            this.node_list.push(label);
            label.string = this.data.val1 || 0;
            // 通关时间
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 500, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5));
            this.node_list.push(label);
            var num = this.data.val2 || 0
            label.string = TimeTool.getTimeMs(num, true);
        } else if (this.rank_type == RankConstant.RankType.action_star || this.rank_type == RankConstant.RankType.star_power ||
            this.rank_type == RankConstant.RankType.hallows_power || this.rank_type == RankConstant.RankType.treasure ||
            this.rank_type == RankConstant.RankType.colors_tone || this.rank_type == RankConstant.RankType.gemstone ||
            this.rank_type == RankConstant.RankType.pointglod || this.rank_type == RankConstant.RankType.speed_fight ||
            this.rank_type == RankConstant.RankType.voyage || this.rank_type == RankConstant.RankType.hero_expedit) {
            // --名字
            let name = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 198, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(name);
            name.string = (role_name)
            // --层数
            let num = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 455, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(num);
            num.string = (this.data.val1 || 0)
        } else if (this.rank_type == RankConstant.RankType.guild_war) {
            // --名字
            var name = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 198, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(name);
            name.string = role_name;
            //星数
            var label = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 402, this.height / 2, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(label);
            label.string = this.data.star || 0;
            //战绩
            var score = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 525, this.height / 2, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(score);
            score.string = this.data.war_score || 0;
        } else if (this.rank_type == RankConstant.RankType.drama || this.rank_type == RankConstant.RankType.action_drama) {
            // --名字
            let name = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 198, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(name);
            name.string = (role_name)

            // --装备评分
            let label = Utils.createLabel(20, new cc.Color(255, 255, 255, 255), null, 495, this.height / 2, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(label);
            var config = gdata("dungeon_data", "data_drama_dungeon_info", this.data.val1);
            if (config) {
                var str = config.name;
                label.string = str;
            }
        } else if (this.rank_type == RankConstant.RankType.arena || this.rank_type == RankConstant.RankType.action_arena) {
            // --名字
            let name = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 198, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(name);
            name.string = (role_name);
            // 装备评分
            var label = Utils.createRichLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(480, this.height / 2), 0, 500)
            this.node_list.push(label);
            this.other_panel.addChild(label.node);

            var score = this.data.score || this.data.val1 || 0;
            var res = PathTool.getItemRes('8')
            label.string = cc.js.formatStr("<img src='%s' /> %s", "8", score);
            this.loadRes(res, (function (label, resObject) {
                label.addSpriteFrame(resObject);
            }).bind(this, label));
        } else if (this.rank_type == RankConstant.RankType.endless || this.rank_type == RankConstant.RankType.endless_old
            || this.rank_type == RankConstant.RankType.adventure || this.rank_type == RankConstant.RankType.adventure_muster) {
            // --名字
            let name = Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, 198, this.height / 2, "", this.other_panel, 0, cc.v2(0, 0.5))
            this.node_list.push(name);
            name.string = (role_name);

            // --层数
            let num = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 403, this.height / 2, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(num);
            num.string = (this.data.val1 || 0);

            //战力
            var label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 535, this.height / 2, "", this.other_panel, 0, cc.v2(0.5, 0.5))
            this.node_list.push(label);
            label.string = (this.data.val2 || 0);
        }
    },

    //个人伤害排行------------start
    addCallBack: function (call_back) {
        this.call_back = call_back;
    },

    //增加点赞功能
    addPraise: function (data) {
        if (!this._btnPraise.active)
            this._btnPraise.active = true;
        Utils.setGreyButton(this._btnPraise_btn, false);
        this._praise.setState(cc.Sprite.State.NORMAL);

        if (this.index <= 3) {
            this._btnPraise.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound(1);
                if(this.index > 3) return
                if (this.call_back != null) {
                    this.call_back(this);
                }
                RoleController.getInstance().sender10316(data.r_rid, data.r_srvid, this.index, 2);
            }, this)
        } else {
            this._praise.setState(cc.Sprite.State.GRAY);
            Utils.setGreyButton(this._btnPraise_btn, true);
        }
        this._labelPraise.string = data.worship;
        //不可膜拜
        if (data.worship_status == 1) {
            this._praise.setState(cc.Sprite.State.GRAY);
            Utils.setGreyButton(this._btnPraise_btn, true);
        }
    },

    updateWorshipStatus: function () {
        if (this.data != null) {
            this.data.worship = this.data.worship + 1;
            this.data.worship_status = 1;
            this._labelPraise.string = this.data.worship;
            this._praise.setState(cc.Sprite.State.GRAY);
            Utils.setGreyButton(this._btnPraise_btn, true);
        }
    },

    //个人伤害排行------------end
    //打开玩家信息
    openChatMessage: function () {
        var roleVo = RoleController.getInstance().getRoleVo();
        var rid = this.data.rid || this.data.r_rid;
        var srv_id = this.data.srv_id || this.data.r_srvid;
        if (rid && srv_id && roleVo.rid == rid && roleVo.srv_id == srv_id) {
            message(Utils.TI18N("你不认识你自己了么？"));
            return
        }
        if (this.data.is_robot && this.data.is_robot == 1) {
            message(Utils.TI18N("神秘人太高冷，不给查看"));
            return
        }
        if (this.data) {
            var vo = { rid: rid, srv_id: srv_id };
            require("chat_controller").getInstance().openFriendInfo(vo, cc.v2(0, 0));
        }
    },

    //创建一个英雄数据
    createPartnerVo: function () {
        var vo = new HeroVo();
        var data = {
            partner_id: this.data.pid,
            bid: this.data.pbid,
            lev: this.data.plev,
            star: this.data.pstar,
        }
        vo.updateHeroVo(data);
        return vo
    },

    //创建玩家头像
    createPlayerHead: function (x, y) {
        x = x + 43;
        var player_head = new PlayerHead();
        player_head.setParent(this.other_panel);
        player_head.show();
        player_head.setScale(0.8);
        player_head.setPosition(x, y);
        return player_head
    },

    setSelected: function (bool) {
        this.select.active = bool;
        if (bool == true) {
            var fadein = cc.fadeIn(0.7);
            var fadeout = cc.fadeOut(0.7);
            this.select.runAction(cc.repeatForever(cc.sequence(fadein, fadeout)))
        } else {
            this.select.stopAllActions();
        }
    },

    isHaveData: function () {
        if (this.vo) {
            return true
        }
        return false
    },

    reset: function () {
        if (this.num)
            this.num.setVisible(false);
        this.vo = null;
    },

    getData: function () {
        return this.vo;
    },


    onDelete: function () {
        if (this.item_list) {
            for (var i in this.item_list) {
                var v = this.item_list[i];
                v.deleteMe();
                v = null;
            }
            this.item_list = null;
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
        if (this.player_head) {
            this.player_head.deleteMe();
            this.player_head = null
        }
    }
});

module.exports = RankItem;