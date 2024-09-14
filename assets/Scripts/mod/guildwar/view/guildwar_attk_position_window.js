// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-14 20:08:38
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PartnerCalculate = require("partner_calculate");
var GuildwarBattleArrayPanel = require("guildwar_battle_array_panel");

var Guildwar_attk_positionWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_attk_position_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.star_list = {};
        this.color_1 = new cc.Color(0x24, 0x90, 0x03, 0xff);
        this.color_2 = new cc.Color(0xd9, 0x50, 0x14, 0xff);
        this.color_3 = new cc.Color(0xff, 0xff, 0xff, 0xff);
        this.item_list = {};

        this.star_list_3 = {};
        this.star_list_2 = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.container = this.seekChild("container");
        this.background.scale = FIT_SCALE;
        var top_panel = this.seekChild("top_panel");
        this.pos_panel = this.seekChild("pos_panel");
        this.buff_panel = this.seekChild("buff_panel");
        this.buff_panel.active = false;
        var pos_panel = this.pos_panel;
        var buff_panel = this.buff_panel;

        this.defend_lb = this.seekChild(top_panel, "defend_label", cc.Label);
        this.check_def_label_nd = this.seekChild(top_panel, "check_def_label");

        var temp_index = {
            [1]: 3,
            [2]: 2,
            [3]: 1
        }
        for (var i = 1; i <= 3; i++) {
            var star = this.seekChild(top_panel, "star_" + i);
            if (star) {
                star.active = false;
                var index = temp_index[i];
                this.star_list[index] = star;
            }
        }


        this.close_btn = this.seekChild("close_btn");
        this.easy_btn = this.seekChild(this.pos_panel, "easy_btn");
        this.com_btn = this.seekChild(pos_panel, "com_btn");
        this.diff_btn = this.seekChild(pos_panel, "diff_btn");
        this.com_btn_sp = this.com_btn.getComponent(cc.Sprite);
        this.com_btn_label = this.seekChild(this.com_btn, "label");
        this.diff_btn_sp = this.diff_btn.getComponent(cc.Sprite);
        this.diff_btn_label = this.seekChild(this.diff_btn, "label");

        this.tips_lb = this.seekChild("tips_label", cc.Label);
        this.award_bg_nd = this.seekChild("image_2");
        this.count_lb = this.seekChild("count_label", cc.Label);
        this.easy_lb = this.seekChild("easy_label", cc.Label);
        this.easy_coe_lb = this.seekChild(pos_panel, "easy_coe_label", cc.Label);
        this.com_lb = this.seekChild(pos_panel, "com_label", cc.Label);
        this.com_coe_lb = this.seekChild(pos_panel, "com_coe_label", cc.Label);
        this.diff_lb = this.seekChild(pos_panel, "diff_label", cc.Label);
        this.diff_coe_lb = this.seekChild(pos_panel, "diff_coe_label", cc.Label);
        this.good_con = this.seekChild("good_con");

        this.challenge_btn = this.seekChild(buff_panel, "challenge_btn");
        this.challenge_btn_btn = this.challenge_btn.getComponent(cc.Button);
        this.buff_count_lb = this.seekChild(buff_panel, "buff_count_label", cc.Label);
        this.lv_label_lb = this.seekChild(buff_panel, "lv_label", cc.Label);
        this.progress_pb = this.seekChild(buff_panel, "progress", cc.ProgressBar);
        this.image_com_sp = this.seekChild("image_com", cc.Sprite);
        this.image_dif_sp = this.seekChild("image_dif", cc.Sprite);

        for (var i = 1; i <= 2; i++) {
            var star = this.seekChild(this.image_com_sp.node, "star_" + i, cc.Sprite);
            if (star) {
                star.active = false;
                var index = temp_index[i];
                this.star_list_2[index] = star;
            }
        }
        for (var i = 1; i <= 3; i++) {
            var star = this.seekChild(this.image_dif_sp.node, "star_" + i, cc.Sprite);
            if (star) {
                star.active = false;
                var index = temp_index[i];
                this.star_list_3[index] = star;
            }
        }

        this.attr_panel = {};
        for (var i = 1; i <= 6; i++) {
            var attr_panel = this.seekChild(buff_panel, "attr_panel_" + i);
            if (attr_panel) {
                attr_panel.attr_label = attr_panel.getChildByName("attr_label").getComponent(cc.Label);
                attr_panel.attr_value_1_lb = attr_panel.getChildByName("attr_value_1").getComponent(cc.Label);
                attr_panel.attr_value_2_lb = attr_panel.getChildByName("attr_value_2").getComponent(cc.Label);
                attr_panel.attr_iamge_nd = attr_panel.getChildByName("image");
                this.attr_panel[i] = attr_panel;
            }
        }

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.check_def_label_nd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.data && this.data.pos) {
                var enemyBaseInfo = this.model.getEnemyGuildWarBaseInfo();
                this.ctrl.openDefendLookWindow(true, enemyBaseInfo.g_id, enemyBaseInfo.g_sid, this.data.pos) // 打开据点防守记录
            }
        }, this)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAttkPositionWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openAttkPositionWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.easy_btn, function () {
            if (this.data && this.data.pos) {
                this.ctrl.requestGuildWarFighting(this.data.pos, 1, 0);
            }
        }.bind(this), 1)
        this.com_btn.on("click", function () {
            if (this.data && this.data.pos) {
                this.ctrl.requestGuildWarFighting(this.data.pos, 2, 0);
            }
            Utils.playButtonSound(1)
        }, this)
        this.diff_btn.on("click", function () {
            if (this.data && this.data.pos) {
                this.ctrl.requestGuildWarFighting(this.data.pos, 3, 0);
            }
            Utils.playButtonSound(1)
        }, this)
        //挑战废墟
        this.challenge_btn.on("click", function () {
            if (this.model.checkEnemyIsHaveLivePosition()) {      //判断是否还有存活的据点
                var fun = function () {
                    this.ctrl.requestGuildWarFighting(this.data.pos, 0, 1);
                }.bind(this)
                var str = cc.js.formatStr(Utils.TI18N("挑战废墟获得的战绩将大大减少，推荐优先挑战其他未沦陷的据点，请问是否继续挑战废墟？"));
                var CommonAlert = require("commonalert");
                CommonAlert.show(str, Utils.TI18N("确定"), fun, Utils.TI18N("取消"), null, 1);
            } else {
                this.ctrl.requestGuildWarFighting(this.data.pos, 0, 1);
            }
            Utils.playButtonSound(1)
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (pos) {
        this.ctrl.requestEnemyPositionData(pos)
    },

    setData: function (data) {
        this.data = data;

        this.pos_panel.active = data.hp > 0;
        this.buff_panel.active = data.hp <= 0;
        var power = data.power || 0;
        if (data.hp > 0) {
            if (data.hp == 1) {
                this.image_com_sp.setState(cc.Sprite.State.GRAY);
                this.image_dif_sp.setState(cc.Sprite.State.GRAY);
                this.com_btn_sp.setState(cc.Sprite.State.GRAY);
                this.diff_btn_sp.setState(cc.Sprite.State.GRAY);
                this.com_btn_label.color = this.color_3;
                this.diff_btn_label.color = this.color_3;
                for (var i in this.star_list_2) {
                    if (this.star_list_2[i]) {
                        this.star_list_2[i].setState(cc.Sprite.State.GRAY);
                    }
                }
                for (var i in this.star_list_3) {
                    if (this.star_list_3[i]) {
                        this.star_list_3[i].setState(cc.Sprite.State.GRAY);
                    }
                }
            } else if (data.hp == 2) {
                this.image_dif_sp.setState(cc.Sprite.State.GRAY);
                this.diff_btn_sp.setState(cc.Sprite.State.GRAY);
                this.diff_btn_label.color = this.color_3;
                for (var i in this.star_list_3) {
                    if (this.star_list_3[i]) {
                        this.star_list_3[i].setState(cc.Sprite.State.GRAY);
                    }
                }
            }

            //难度系数显示
            var easy_cfg = Config.guild_war_data.data_const["easy_difficulty"];
            this.easy_coe_lb.string = easy_cfg.val / 10 + "%" + Utils.TI18N("难度")
            var normal_cfg = Config.guild_war_data.data_const["normal_difficulty"];
            this.com_coe_lb.string = normal_cfg.val / 10 + "%" + Utils.TI18N("难度")
            var hard_cfg = Config.guild_war_data.data_const["hard_difficulty"];
            this.diff_coe_lb.string = hard_cfg.val / 10 + "%" + Utils.TI18N("难度")

            var pos_data = Config.guild_war_data.data_position[data.pos];
            if (pos_data) {
                var easy_value = pos_data.warscore[0][1] || 0;
                this.easy_lb.string = cc.js.formatStr(Utils.TI18N("+%s战绩"), Math.ceil(easy_value));
                var com_value = pos_data.warscore[1][1] || 0;
                this.com_lb.string = cc.js.formatStr(Utils.TI18N("+%s战绩"), Math.ceil(com_value));
                var diff_value = pos_data.warscore[2][1] || 0;
                this.diff_lb.string = cc.js.formatStr(Utils.TI18N("+%s战绩"), Math.ceil(diff_value));
            }

            this.award_bg_nd.setContentSize(560, 190);
            this.tips_lb.string = Utils.TI18N("难度越高，敌方属性加成越高");
        } else {
            this.award_bg_nd.setContentSize(560, 160);
            this.tips_lb.string = Utils.TI18N("挑战成功可增强公会增益");

            var myGuildBaseData = this.model.getMyGuildWarBaseInfo();
            var buff_lev = myGuildBaseData.buff_lev || 0;
            var max_level = Config.guild_war_data.data_buff_length;
            this.progress_pb.progress = buff_lev / max_level;
            this.lv_label_lb.string = cc.js.formatStr("%s/%s", buff_lev, max_level);

            var cur_buff_info = Config.guild_war_data.data_buff[buff_lev] || {};
            var next_buff_info = Config.guild_war_data.data_buff[buff_lev + 1] || {};
            cur_buff_info.attr = cur_buff_info.attr || {};
            next_buff_info.attr = next_buff_info.attr || {};
            for (var i = 0; i < 6; i++) {
                var attr_panel = this.attr_panel[i + 1];
                if (!cur_buff_info.attr[i] && !next_buff_info.attr[i]) {
                    attr_panel.active = false;
                } else {
                    attr_panel.active = true;
                    var attr_info = cur_buff_info.attr[i] || next_buff_info.attr[i];
                    var attr_name = Config.attr_data.data_key_to_name[attr_info[0]];
                    var cur_value = 0;
                    if (cur_buff_info.attr[i]) {
                        cur_value = cur_buff_info.attr[i][1];
                    }
                    var next_value = null;
                    if (next_buff_info.attr[i]) {
                        next_value = next_buff_info.attr[i][1];
                    }
                    attr_panel.attr_label.string = attr_name;
                    var is_per = PartnerCalculate.isShowPerByStr(attr_info[0]); //是否为千分比
                    if (is_per) {
                        cur_value = cur_value / 10 + "%";
                    }
                    attr_panel.attr_value_1_lb.string = cur_value;
                    if (next_value) {
                        if (is_per) {
                            next_value = next_value / 10 + "%";
                        }
                        attr_panel.attr_value_2_lb.string = next_value;
                        attr_panel.attr_value_2_lb.node.active = true;
                        attr_panel.attr_iamge_nd.active = true;
                    } else {
                        attr_panel.attr_value_2_lb.node.active = false;
                        attr_panel.attr_iamge_nd.active = false;
                    }
                }
            }

            var max_count_1 = 0;
            var count_config = Config.guild_war_data.data_const.ruins_challange_limit;
            if (count_config) {
                max_count_1 = count_config.val;
            }
            var cur_count_1 = data.relic_def_count || 0;
            var left_count_1 = max_count_1 - cur_count_1;
            if (left_count_1 < 0) {
                left_count_1 = 0;
            }
            if (left_count_1 > 0) {
                this.buff_count_lb.node.color = this.color_1;
            } else {
                this.buff_count_lb.node.color = this.color_2;
            }
            this.buff_count_lb.string = cc.js.formatStr("%s/%s", left_count_1, max_count_1);

            if (cur_count_1 >= max_count_1) {
                Utils.setGreyButton(this.challenge_btn_btn);
            }
        }

        //星数
        for (var i = 1; i < 4; i++) {
            var star = this.star_list[i];
            if (star && i > data.hp) {
                star.active = true;
            } else {
                star.active = false;
            }
        }

        this.defend_lb.string = cc.js.formatStr(Utils.TI18N("已成功防御%s次"), data.def_count || 0);

        var award_data = Config.guild_war_data.data_const.win_strongholds_reward_hard;

        if (award_data && award_data.val) {
            var item_num = award_data.val.length;
            var scale = 0.8;
            var index = 1;
            for (var k in award_data.val) {
                var award = award_data.val[k];
                var bid = award[0];
                var num = award[1];
                var item_conf = Utils.getItemConfig(bid);
                if (item_conf) {
                    var item = this.item_list[k];
                    if (!item) {
                        item = ItemsPool.getInstance().getItem("backpack_item");
                        item.initConfig(false, scale, false, true);
                        this.item_list[k] = item;
                        item.setParent(this.good_con);
                        item.show();
                    }
                    item.setData({ bid: bid, num: num });
                    item.setPosition(index * 110 - 110 * item_num / 2 - 55, 0);
                }
                index = index + 1;
            }
        }

        var challenge_count = this.model.getGuildWarChallengeCount();
        var max_count = Config.guild_war_data.data_const.challange_time_limit.val;
        var left_count = max_count - challenge_count;
        if (left_count < 0) {
            left_count = 0;
        }
        if (left_count > 0) {
            this.count_lb.node.color = this.color_1;
        } else {
            this.count_lb.node.color = this.color_2;
        }
        this.count_lb.string = cc.js.formatStr("%s/%s", left_count, max_count);

        //敌方阵容
        if (!this.enemy_battle_array_panel) {
            this.enemy_battle_array_panel = new GuildwarBattleArrayPanel();
            this.enemy_battle_array_panel.show();
            this.enemy_battle_array_panel.setParent(this.container);
            this.enemy_battle_array_panel.setPosition(0, 220);
        }
        var battle_array_data = [];
        var partner_list = [];
        for (var k in data.defense) {
            partner_list.push(data.defense[k]);
        }
        battle_array_data.partner_list = partner_list;
        battle_array_data.rid = data.rid;
        battle_array_data.srv_id = data.srv_id;
        battle_array_data.power = power;
        battle_array_data.formation_type = data.formation_type;
        battle_array_data.formation_lev = data.formation_lev;
        this.enemy_battle_array_panel.setData(battle_array_data);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.enemy_battle_array_panel) {
            this.enemy_battle_array_panel.deleteMe();
            this.enemy_battle_array_panel = null;
        }
        if (this.item_list) {
            for (var i in this.item_list) {
                var v = this.item_list[i];
                if (v) {
                    v.deleteMe();
                    v = null;
                }
            }
            this.item_list = null;
        }
        this.ctrl.openAttkPositionWindow(false);
    },
})