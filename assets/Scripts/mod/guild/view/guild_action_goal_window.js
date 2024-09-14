// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会活跃
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildEvent = require("guild_event");
var CommonScrollView = require("common_scrollview");
var GuildActionGoalItem = require("guild_action_goal_item");


var GuildActionGoalWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_action_goal");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
        this.reward_list = {};
        this.receve_list = {}
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var container = this.seekChild("main_container");
        var main_panel = this.seekChild(container, "main_panel");
        this.close_btn = this.seekChild(main_panel, "close_btn");
        this.textLv = this.seekChild(main_panel, "textLv", cc.Label);

        this.progress = this.seekChild(main_panel, "progress", cc.ProgressBar);
        this.progress_num = this.seekChild(main_panel, "progress_num", cc.Label);

        this.goods = this.seekChild(main_panel, "goods").getChildByName("content");

        this.rewardLayer = this.seekChild(main_panel, "rewardLayer");
        this.btn_reward = this.seekChild(main_panel, "btn_reward");
        this.btn_reward_redpoint = this.seekChild(this.btn_reward, "redpoint");
        this.btn_reward_redpoint.active = false;
        this.textAllGetReward = this.seekChild(main_panel, "textAllGetReward", cc.Label);
        this.textAllGetReward.node.active = false;

        this.skill_full = {};
        for (var i = 1; i < 4; i++) {
            this.skill_full[i] = this.seekChild(main_panel, "skill_full_" + i);
            this.skill_full[i].actvie = false;
        }

        this.goods_list = this.seekChild(main_panel, "goods_list");
        var bgSize = this.goods_list.getContentSize();
        var scroll_view_size = cc.size(bgSize.width, bgSize.height - 4)
        var setting = {
            item_class: GuildActionGoalItem,      // 单元类
            start_x: 1,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 599,               // 单元的尺寸width
            item_height: 73,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.goods_list, cc.v2(0, 4), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))

        this.desc_label = this.seekChild("desc_label", cc.RichText);

        var cur = this.seekChild(main_panel, "cur");
        this.current_att = {};
        for (var i = 0; i < 3; i++) {
            this.current_att[i] = {};
            this.current_att[i].label = this.seekChild(cur, "label_" + (i + 1), cc.RichText);
            this.current_att[i].sprite = this.seekChild(cur, "sprite_" + (i + 1), cc.Sprite);
        }

        var next = this.seekChild(main_panel, "next");
        this.next_att = {};
        for (var i = 0; i < 3; i++) {
            this.next_att[i] = {};
            this.next_att[i].label = this.seekChild(next, "label_" + (i + 1), cc.RichText);
            this.next_att[i].sprite = this.seekChild(next, "sprite_" + (i + 1), cc.Sprite);
        }
        this.seekChild(main_panel, "win_title", cc.Label).string = Utils.TI18N("公会活跃");
        this.seekChild(main_panel, "Text_48_1", cc.Label).string = Utils.TI18N("当前属性");
        this.seekChild(main_panel, "Text_48_2", cc.Label).string = Utils.TI18N("下级属性");
        this.seekChild(main_panel, "Text_48_3", cc.Label).string = Utils.TI18N("等级奖励");
        this.seekChild(main_panel, "Text_48", cc.Label).string = Utils.TI18N("活跃等级:");
        this.seekChild(main_panel, "Text_48_4", cc.Label).string = Utils.TI18N("任务简述");
        this.seekChild(main_panel, "Text_48_5", cc.Label).string = Utils.TI18N("次数上限");
        this.seekChild(main_panel, "Text_48_6", cc.Label).string = Utils.TI18N("单次活跃");
        this.seekChild(main_panel, "Text_48_7", cc.Label).string = Utils.TI18N("完成状况");
        this.seekChild(main_panel, "Text_54", cc.Label).string = Utils.TI18N("奖励预览");
    },


    registerEvent: function () {
        this.addGlobalEvent(GuildEvent.UpdataGuildGoalBasicData, function (data) {
            var lev_data = Config.guild_quest_data.data_lev_data;
            if (data.exp >= lev_data[data.lev].exp)
                this.btn_reward_redpoint.active = true;
            else
                this.btn_reward_redpoint.active = false;

            this.textLv.string = cc.js.formatStr("Lv.%s", data.lev);
            var str = cc.js.formatStr(Utils.TI18N("<color=#68452A>今日已获活跃：<color=#249003>%s</c> 本周已获活跃：<color=#249003>%s</c></c>"), data.day_exp, data.week_exp);
            this.desc_label.string = str;

            var num = data.lev + 1;
            if (num >= Config.guild_quest_data.data_lev_data_length) {
                this.progress_num.string = Utils.TI18N("已满级");
                this.progress.progress = 1;

                this.textAllGetReward.node.active = true;
                this.textAllGetReward.string = Utils.TI18N("所有奖励已领完");
                this.textAllGetReward.node.color = new cc.Color(0x68, 0x45, 0x2A, 0xff);
                this.btn_reward.active = false;
                this.upGradeReward(lev_data[data.lev], items);
                this.upGradeAttr(lev_data[data.lev].attr);
                for (var i = 1; i < 4; i++) {
                    this.skill_full[i].active = true;
                    this.next_att[i].active = false;
                }
            } else {
                var strLev = cc.js.formatStr("%s/%s", data.exp, lev_data[data.lev].exp);
                this.progress_num.string = strLev;
                this.progress.progress = Math.floor(data.exp / lev_data[data.lev].exp * 100) / 100;
                if (data.exp >= lev_data[data.lev].exp) {
                    this.btn_reward.active = true;
                    this.textAllGetReward.node.active = false;
                } else {
                    this.btn_reward.active = false;
                    this.textAllGetReward.node.active = true;
                    var str = cc.js.formatStr(Utils.TI18N("活跃等级%s级可领"), num);
                    this.textAllGetReward.node.color = new cc.Color(0xd9, 0x50, 0x14, 0xff);
                    this.textAllGetReward.string = str;
                }
                this.upGradeAttr(lev_data[data.lev].attr, lev_data[num].attr);
                this.upGradeReward(lev_data[num].items);
            }
        }, this)

        this.addGlobalEvent(GuildEvent.UpdataGuildGoalTaskData, function (data) {
            this.receve_list = {};
            var data_sort = [];
            for (var i in data.list) {
                var v = data.list[i];
                for (var k in Config.guild_quest_data.data_task_data) {
                    var m = Config.guild_quest_data.data_task_data[k];
                    if (v.id == m.id) {
                        m.index = i;
                        data_sort.push(m)
                    }
                }
            }
            this.receve_list = data.list;
            if (this.item_scrollview)
                this.item_scrollview.setData(data_sort, null, data.list);
        }, this)

        this.addGlobalEvent(GuildEvent.UpdataGuildGoalSingleTaskData, function (data) {
            var id = data.list[0].id;
            var num = 1;
            for (var i in this.receve_list) {
                var v = this.receve_list[i];
                if (v.id == id) {
                    num = i;
                    break;
                }
            }
            if (this.item_scrollview) {
                var item_list = this.item_scrollview.getItemList();
                if (item_list) {
                    for (var k in item_list) {
                        var item = item_list[k];
                        if (k == num) {
                            this.receve_list[num].finish = data.list[0].finish;
                            this.receve_list[num].target_val = data.list[0].target_val;
                            this.receve_list[num].value = data.list[0].value;
                            item.changeItemStatus(num);
                        }
                    }
                }
            }
        }, this)

        if (this.background) {
            this.background.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound(2);
                this.ctrl.openGuildActionGoalWindow(false);
            }, this)
        }

        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound(2);
                this.ctrl.openGuildActionGoalWindow(false);
            }, this)
        }

        if (this.btn_reward) {
            this.btn_reward.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound(1);
                this.ctrl.send16904();
            }, this)
        }

        if (this.rewardLayer) {
            this.rewardLayer.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound(1);
                this.ctrl.openGuildRewardWindow(true);
            }, this)
        }
    },

    openRootWnd: function () {
        this.ctrl.send16900();
        this.ctrl.send16901();
    },

    //升级奖励
    upGradeReward: function (items) {
        for (var i in this.reward_list) {
            this.reward_list[i].active = false;
        }

        for (var i = 0; i < items.length; i++) {
            if (!this.reward_list[i]) {
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 0.75, false, false)
                item.setParent(this.goods);
                item.show();
                this.reward_list[i] = item
            }
            var v = this.reward_list[i];
            if (v) {
                v.setVisible(true);
                v.setPosition(-155 + i * 100, 0);
                v.setData({ bid: items[i][0], num: items[i][1] });
            }
        }
    },

    //属性
    upGradeAttr: function (currentAtt, nextAtt) {
        if (currentAtt) {
            for (var i in currentAtt) {
                var v = currentAtt[i];
                var attr_icon = PathTool.getAttrIconByStr(v[0]);
                var name = Config.attr_data.data_key_to_name[v[0]] || "";
                var msg = cc.js.formatStr("%s： %s ", name, v[1]);
                this.current_att[i].label.string = msg;
                var common_res_path = PathTool.getCommonIcomPath(attr_icon);
                this.updateImg(common_res_path, this.current_att[i])
            }
        }
        if (nextAtt) {
            for (var i in nextAtt) {
                var v = nextAtt[i];
                var attr_icon = PathTool.getAttrIconByStr(v[0]);
                var name = Config.attr_data.data_key_to_name[v[0]] || "";
                var msg = cc.js.formatStr("%s： %s ", name, v[1]);
                this.next_att[i].label.string = msg;
                var common_res_path = PathTool.getCommonIcomPath(attr_icon);
                this.updateImg(common_res_path, this.next_att[i])
            }
        }
    },

    updateImg: function (res, obj) {
        this.loadRes(res, function (sf_obj) {
            obj.sprite.spriteFrame = sf_obj;
        }.bind(this))
    },

    closeCallBack: function () {
        if (this.item_scrollview)
            this.item_scrollview.deleteMe();
        this.item_scrollview = null;
        for(let i in this.reward_list){
            if(this.reward_list[i]){
                this.reward_list[i].deleteMe()
                this.reward_list[i] = null
            }
        }
        this.reward_list = null
        this.ctrl.openGuildActionGoalWindow(false);
    }

});

module.exports = GuildActionGoalWindow;