// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会boss主窗体
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildBossController = require("guildboss_controller");
var GuildEvent = require("guild_event");
var PlayerHead = require("playerhead");
var BackpackController = require("backpack_controller");
var TimeTool = require("timetool");
var RoleController = require("role_controller");
var GuildbossEvent = require("guildboss_event");
var GuildBossConst = require("guildboss_const");
var BaseRole = require("baserole");
var HeroController = require("hero_controller");
var PartnerConst = require("partner_const");
var ActivityController = require("activity_controller");
var GuideEvent = require("guide_event");

var GuildBossMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildboss", "guildboss_main_window");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildBossController.getInstance();
        this.model = this.ctrl.getModel();

        this._doubleRewardList = {}
        this._currentPassNum = {}
        this._doublePassNum = {}
        this.item_pool = []
        this.item_list = []
        this.item_list_1 = {};
        this.item_list_2 = {};
        this.rank_list = {}
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var main_panel = this.seekChild("main_panel");
        this.close_btn = this.seekChild(main_panel, "close_btn");
        this.explain_btn = this.seekChild(main_panel, "explain_btn");
        this.add_btn = this.seekChild(main_panel, "add_btn");

        this.rank_btn = this.seekChild(main_panel, "rank_btn");
        this.challenge_btn = this.seekChild(main_panel, "challenge_btn");
        this.mopup_btn = this.seekChild(main_panel, "mopup_btn", cc.Button);
        this.challenge_btn_label = this.seekChild(this.challenge_btn, "label", cc.Label);
        this.challenge_btn_lo = this.seekChild(this.challenge_btn, "label", cc.LabelOutline);
        this.mopup_btn_label = this.seekChild(this.mopup_btn.node, "label", cc.Label);
        this.mopup_btn_lo = this.seekChild(this.mopup_btn.node, "label", cc.LabelOutline);
        this.challenge_btn_label.string = Utils.TI18N("挑战");
        this.mopup_btn_label.string = Utils.TI18N("扫荡");

        //集结
        this.muster_btn = this.seekChild(main_panel, "muster_btn");
        this.muster_btn_tips = this.seekChild(this.muster_btn, "label", cc.Label);
        this.muster_btn_tips.string = "";

        this.musterImage = this.seekChild(main_panel, "musterImage");
        // this.musterImage.x = this.muster_btn.x - 43;
        this.musterImage.active = false;
        this.muster_btn_label = this.seekChild(this.musterImage, "label", cc.Label);

        this._doubleReward = this.seekChild(main_panel, "doubleReward");
        this._doubleReward.active = false;

        this.reset_time_value = this.seekChild(main_panel, "reset_time_value", cc.RichText);
        this.challenge_times_value = this.seekChild(main_panel, "challenge_times_value", cc.Label);
        this.chapter_name = this.seekChild(main_panel, "chapter_name", cc.Label);
        this.chapter_boss_container = this.seekChild(main_panel, "chapter_boss_container");
        var Preview = require("guildboss_preview_window");
        this.guild_boss_view = new Preview();
        this.guild_boss_view.setParent(this.chapter_boss_container);
        this.guild_boss_view.show();

        this.buff_container = this.seekChild(main_panel, "buff_container");
        this.buff_name = this.seekChild(this.buff_container, "buff_name", cc.Label);
        this.buff_name.string = "";
        this.buff_icon = this.seekChild(this.buff_container, "buff_icon", cc.Sprite);
        this.buff_acitive_label = this.seekChild(this.buff_container, "buff_acitive_label", cc.RichText);

        this.remain_buy_lb = this.seekChild(main_panel, "remain_buy", cc.Label);

        this.rank_container = this.seekChild(main_panel, "rank_container");
        this.rank_info_btn = this.seekChild(this.rank_container, "rank_btn");
        this.rank_btn_label = this.seekChild(this.rank_btn, "label", cc.Label);
        this.bg = this.seekChild(main_panel, "bg", cc.Sprite);

        var object = {};
        object.container = this.seekChild(main_panel, "monster_container_1");
        object.model = this.seekChild(object.container, "monster_model");
        object.pass_icon = this.seekChild(object.container, "pass_icon");
        object.monster_name = this.seekChild(object.container, "monster_name", cc.Label);
        object.progress_container = this.seekChild(object.container, "progress_container");
        object.progress = this.seekChild(object.progress_container, "progress", cc.ProgressBar);
        object.hp_value = this.seekChild(object.progress_container, "hp_value", cc.Label);
        object.boss_icon = new PlayerHead();
        this.boss_icon = object.boss_icon;
        object.boss_icon.show()
        object.boss_icon.setPosition(-105, 133);
        object.boss_icon.setScale(0.55);
        object.boss_icon.setParent(object.container);
        this.monster_container = object;

        this.main_panel = main_panel;
        Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("公会副本");
        Utils.getNodeCompByPath("main_container/main_panel/rank_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("排行奖励");
        Utils.getNodeCompByPath("main_container/main_panel/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("剩余购买次数：");
        Utils.getNodeCompByPath("main_container/main_panel/challenge_times_title", this.root_wnd, cc.Label).string = Utils.TI18N("剩余次数：");
        Utils.getNodeCompByPath("main_container/main_panel/dps_reward_title", this.root_wnd, cc.Label).string = Utils.TI18N("伤害\n奖励");
        Utils.getNodeCompByPath("main_container/main_panel/kill_reward_title", this.root_wnd, cc.Label).string = Utils.TI18N("击杀\n奖励");
        Utils.getNodeCompByPath("main_container/main_panel/mail_notice", this.root_wnd, cc.Label).string = Utils.TI18N("奖励通过邮件发放");
        Utils.getNodeCompByPath("main_container/main_panel/rank_container/rank_desc_label", this.root_wnd, cc.Label).string = Utils.TI18N("伤害排行前三");
        Utils.getNodeCompByPath("main_container/main_panel/doubleReward", this.root_wnd, cc.Label).string = Utils.TI18N("双倍奖励进行中");
    },



    registerEvent: function () {
        this.role_vo = RoleController.getInstance().getRoleVo();
        if (this.role_vo != null) {
            if (this.role_assets_event == null) {
                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (key == "position") {

                    }
                }, this)
            }
        }

        this.muster_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.role_vo.position == 1 || this.role_vo.position == 2) {
                var str = Utils.TI18N("发出集结后将会提醒所有会友，且有1小时内不可再发出集结（全会），是否确定发出集结？");
                var fun = function () {
                    this.ctrl.send21323();
                }.bind(this)
                var CommonAlert = require("commonalert");
                CommonAlert.show(str, Utils.TI18N("确定"), fun, Utils.TI18N("取消"), null, 1, null, null, 24)
            } else {
                message(Utils.TI18N("只有会长、副会长可发出集结"))
            }
        }, this)

        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound("c_close");
            this.ctrl.openMainWindow(false);
        }, this)


        this.addGlobalEvent(GuildbossEvent.MusterCoolTime, function (data) {
            if (this.role_vo.position == 1 || this.role_vo.position == 2) {
                this.musterCoolCountTime(data);
            } else {
                this.muster_btn_tips.string = Utils.TI18N("集结号角");
            }
        }, this)

        this.addGlobalEvent(GuildbossEvent.BossActivityDoubleTime, function (data) {
            this.doubleTimeAction(data);
        }, this)

        this.buff_container.on(cc.Node.EventType.TOUCH_END, function () {
            this.checkBuff();
        }, this)

        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openMainWindow(false);
        }, this)

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            pos.y-=720;
            require("tips_controller").getInstance().showCommonTips(Config.guild_dun_data.data_const.game_rule.desc, pos);
        }, this)

        this.add_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.requestBuyChallengeTimes(0);
        }, this)

        this.rank_btn.on(cc.Node.EventType.TOUCH_END, function () {
            var select_item;
            if (this.guild_boss_view) {
                select_item = this.guild_boss_view.getCurSelect();
            }
            if (select_item && select_item.data) {
                this.ctrl.openGuildBossRankWindow(true, select_item.data);
            }
        }, this)

        this.rank_info_btn.on(cc.Node.EventType.TOUCH_END, function () {
            var data = null;
            if (this.guild_boss_view) {
                data = this.guild_boss_view.getCurSelect();
            }
            require("rank_controller").getInstance().openRankView(true, require("rank_constant").RankType.union_boss, null, data);
        }, this)

        this.challenge_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.cur_selected_object && this.cur_selected_object.config && this.base_info) {
                if (this.base_info.count > 0) {
                    HeroController.getInstance().openFormGoFightPanel(true, PartnerConst.Fun_Form.GuildDun_AD, { boss_id: this.cur_selected_object.config.boss_id })
                } else {
                    this.ctrl.requestBuyChallengeTimes(1);
                }
            }
            gcore.GlobalEvent.fire(GuideEvent.TaskNextStep,"challenge_btn")
        }, this)

        this.mopup_btn.node.on("click", function () {
            if (this.cur_selected_object && this.cur_selected_object.config && this.base_info) {
                this.requestMopupMonster();
            }
        }, this)

        //更新面板基础信息
        this.addGlobalEvent(GuildbossEvent.UpdateGuildDunBaseInfo, function () {
            if (this.guild_boss_view) {
                this.guild_boss_view.updateScrollViewList();
            }
            this.updateDunBaseInfo();
        }, this)

        this.addGlobalEvent(GuildbossEvent.UpdateChangeStatus, function (data) {
            this.updateChangeStatus(data);
        }, this)

        this.addGlobalEvent(GuildbossEvent.UpdateGuildDunRank, function () {
            var rank_list = this.ctrl.getModel().getRaknRoleTopThreeList();
            if (rank_list && Utils.next(rank_list || {}) != null) {
                for (var i in rank_list) {
                    var v = rank_list[i];
                    if (!this.rank_list[i]) {
                        var item = this.createSingleRankItem(i, v);
                        this.rank_list[i] = item;
                    }
                    var item = this.rank_list[i];
                    if (item) {
                        item.label.string = v.name;
                        if (v.all_dps) {
                            item.value.string = "[" + Utils.getMoneyString(v.all_dps, false) + Utils.TI18N("伤害") + "]";
                        } else {
                            item.value.string = "";
                        }
                    }
                }
            }
        }, this)

        //更新当前剩余挑战次数
        this.addGlobalEvent(GuildbossEvent.UpdateGuildBossChallengeTimes, function (buy_type) {
            if (this.base_info != null) {
                this.challenge_times_value.string = this.base_info.count;
                this.remainBuyCount(this.base_info.buy_count);
            } else {
                var base_info = this.model.getBaseInfo();
                if (base_info != null) {
                    this.remainBuyCount(base_info.buy_count);
                    this.challenge_times_value.string = base_info.count;
                }
            }
            //挑战购买的时候自动打开挑战界面
            if (buy_type == 1) {
                this.autoOpenChallengeWindow();
            }
        }, this);


        this.addGlobalEvent(GuildEvent.UpdateGuildRedStatus, function (type, status) {
            this.updateSomeRedStatus(type, status);
        }, this)
    },

    checkBuff: function () {
        if (this.base_info) {
            var item = gdata("guild_dun_data", "data_const", "buff_item").val;
            var num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(item);
            var cost = gdata("guild_dun_data", "data_const", "buff_cost").val;
            var item_icon = Utils.getItemConfig(item).icon;
            var index_lev = Math.min(this.base_info.buff_lev + 1, Config.guild_dun_data.data_buff_data_length);
            var desc = gdata("guild_dun_data", "data_buff_data", [index_lev]).desc;
            var str = "";
            var str_ = "";
            var str_end = cc.js.formatStr(Utils.TI18N("<color=#764519>(激活后效果为</c><color=#289b14 ><size= 24>%s</></c><color=#764519>)</c>"), desc);
            var res = null;
            if (num > 0) { //如果存在道具
                if (this.base_info.buff_lev == 0) { //表示没buff
                    str = cc.js.formatStr("を消費して<img src='%s' visible=true scale=0.5 /><color=#289b14 ><size= 24>%s</></c><color=#764519>(拥有:</c><color=#289b14><size=24>%s</></c><color=#764519>)ギルドメンバー全員のダメージ増加バフを獲得しますか\n</c>", item_icon, 1, num);
                    str_ = str + str_end;
                    res = PathTool.getItemRes(item_icon)
                } else {
                    str = cc.js.formatStr("を消費して<img src='%s' visible=true scale=0.5 /><color=#289b14 ><size= 24>%s</></c><color=#764519>(拥有:</c><color=#289b14><size=24>%s</></c><color=#764519>)ギルドメンバー全員のダメージ増加バフを獲得しますか\n</c>", item_icon, 1, num);
                    str_ = str + str_end;
                    res = PathTool.getItemRes(item_icon)
                }
            } else {
                if (this.base_info.buff_lev == 0) { //表示没buff
                    str = cc.js.formatStr("を消費して<img src='%s' visible=true scale=0.5 /><color=#289b14 ><size= 24>%s</></c><color=#764519>ギルドメンバー全員のダメージ増加バフを獲得しますか\n</c>", Config.item_data.data_assets_label2id.gold, cost);
                    str_ = str + str_end;
                    res = PathTool.getItemRes(Config.item_data.data_assets_label2id.gold)
                } else {
                    str = cc.js.formatStr("を消費して<img src='%s' visible=true scale=0.5 /><color=#289b14 ><size= 24>%s</></c><color=#764519>ギルドメンバー全員のダメージ増加バフを獲得しますか\n</c>", Config.item_data.data_assets_label2id.gold, cost);
                    str_ = str + str_end;
                    res = PathTool.getItemRes(Config.item_data.data_assets_label2id.gold)
                }
            }
            var fun = function () {
                this.ctrl.send21305();
            }.bind(this)
            var CommonAlert = new require("commonalert");
            CommonAlert.show(str_, Utils.TI18N('确认'), fun, Utils.TI18N('取消'), null, 2, null, { resArr: [res] })
        }
    },

    updateMusterCoolTimeTicket: function () {
        this.remainTime = this.remainTime - 1;
        if (this.remainTime <= 0) {
            this.musterImage.active = false;
            this.muster_btn_tips.node.active = true;
            this.muster_btn_label.node.stopAllActions();
        }
        this.muster_btn_label.string = cc.js.formatStr(Utils.TI18N("%s\n后可集结"), TimeTool.getTimeFormat(this.remainTime));
    },

    musterCoolCountTime: function (less_time) {
        if (!this.muster_btn_label) return
        this.remainTime = less_time;
        this.muster_btn_label.node.stopAllActions();
        if (this.remainTime > 0) {
            this.musterImage.active = true;
            this.muster_btn_tips.node.active = false;
            var self = this;
            this.muster_btn_label.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
                self.remainTime = self.remainTime - 1;
                if (self.remainTime <= 0) {
                    self.musterImage.active = false;
                    self.muster_btn_tips.node.active = true;
                    self.muster_btn_label.node.stopAllActions();
                } else {
                    self.musterImage.active = true;
                    self.muster_btn_tips.node.active = false;
                    self.muster_btn_label.string = cc.js.formatStr(Utils.TI18N("%s\n后可集结"), TimeTool.getTimeFormat(self.remainTime));
                }
            }))))
            this.updateMusterCoolTimeTicket();
        } else {
            this.musterImage.active = false;
            this.muster_btn_label.node.stopAllActions();
            this.muster_btn_tips.string = Utils.TI18N("集结号角");
        }
    },

    //切换Boss的时候
    updateChangeStatus: function (data) {
        if (!data) return
        var fid = 0;
        var base_info = this.model.getBaseInfo();
        var object = this.monster_container;
        var hp_info = null;
        if (data.status == 0) {
            fid = base_info.fid;
            if (base_info != null && base_info.info != null) {
                //储存容器里面相关的boss模型
                for (var i in base_info.info) {
                    var v = base_info.info[i];
                    var boss_config = gdata("guild_dun_data", "data_guildboss_list", [v.boss_id]);
                    if (boss_config) {
                        if (object != null) {
                            object.config = boss_config;
                            hp_info = v;
                        }
                    }
                }
                if (base_info.combat_info) {
                    for (var i in base_info.combat_info) {
                        var v = base_info.combat_info[i];
                        if (object && object.config && v.boss_id == object.config.boss_id) {
                            object.dps = v.dps;
                        }
                    }
                }
            }
            this.buff_container.active = true;
        } else {
            fid = data.config.id;
            object.config = data.config;
            hp_info = { boss_id: data.config.boss_id, hp: 0 };
            object.dps = 0;
            this.buff_container.active = false;
        }
        if (fid) {
            var chatpter_config = gdata("guild_dun_data", "data_chapter_reward", [fid]);
            var config = gdata("guild_dun_data", "data_guildboss_list", [chatpter_config.show_id]);
            if (chatpter_config != null) {
                this.chapter_name.string = chatpter_config.chapter_name + " " + chatpter_config.chapter_desc;
            }
            this.updateBg(config.bg_res);
        }
        if (hp_info) {
            this.updateMonsterHPStatus(object, hp_info);
        }
        if (object) {
            this.updateMonsterInfo(object);//更新模型
            this.updateSelectedBtnStatus();
        }
    },

    createSingleRankItem: function (i, data) {
        var container = {}
        var node = this.seekChild(this.rank_container, "rank_" + (Number(i) + 1));
        var label = this.seekChild(node, "label", cc.Label);
        var value = this.seekChild(node, "value", cc.Label);
        var sp = this.seekChild(node, "sp");
        container.node = node;
        container.label = label;
        container.value = value;
        container.sp = sp;
        return container
    },

    requestMopupMonster: function () {
        if (this.base_info == null) return
        var base_info = this.base_info;
        if (base_info.count > 0) {
            var msg = cc.js.formatStr(Utils.TI18N("确定按照上次挑战的伤害量<color=#249003>%s</c>扫荡一次吗？"), this.cur_selected_object.dps);
            var CommonAlert = require("commonalert");
            CommonAlert.show(msg, Utils.TI18N("确定"), function () {
                this.ctrl.requestMopupMonster(this.cur_selected_object.config.boss_id)
            }.bind(this), Utils.TI18N("取消"), null, 2)
        } else {
            var buy_next_num = base_info.buy_count + 1;
            var buy_config = gdata("guild_dun_data", "data_buy_count", [buy_next_num]);
            if (buy_config == null) {
                message(Utils.TI18N("当前没有扫荡次数，且购买次数已到达本日上限！"));
            } else {
                var role_vo = RoleController.getInstance().getRoleVo();
                if (role_vo) {
                    if (role_vo.vip_lev < buy_config.vip_lev) {
                        var msg = cc.js.formatStr(Utils.TI18N("挑战次数不足，提升至<color='#289b14'>vip%s</c>，可增加<color='#289b14'>1</c>点次数购买上限！"), buy_config.vip_lev);
                        var CommonAlert = require("commonalert");
                        CommonAlert.show(msg, Utils.TI18N("我要提升"), function () {
                            require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE)
                        }.bind(this), Utils.TI18N("取消"), null, 2)
                    } else {
                        var cost = buy_config.expend;
                        if (cost == null || cost.length < 2) return
                        var item_config = Utils.getItemConfig(cost[0]);
                        if (item_config) {
                            var msg = cc.js.formatStr(Utils.TI18N("挑战次数不足，是否花费 <img src='%s' scale=0.5 /> %s 购买<color=#289b14>1</c>点挑战次数并扫荡？\n(扫荡根据上次的伤害量<color=#249003>%s</c>进行结算)"), item_config.icon, cost[1], this.cur_selected_object.dps)
                            var res = PathTool.getItemRes(item_config.icon)
                            var CommonAlert = require("commonalert");
                            CommonAlert.show(msg, Utils.TI18N("确定"), function () {
                                this.ctrl.requestMopupMonster(this.cur_selected_object.config.boss_id);
                            }.bind(this), Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
                        }
                    }
                }
            }
        }
    },

    openRootWnd: function () {
        //基础信息，服务端要求没次打开面板的时候都请求一下
        this.ctrl.requestGuildDunBaseInfo();
        ActivityController.getInstance().setFirstComeGuild(false)
        //设置初始红点
        this.updateSomeRedStatus();
        if (ActivityController.getInstance().getBossActivityDoubleTime() == true) {
            this._doubleReward.active = true;
        }
    },

    //设置buff倒计时
    updateBuffTime: function (time) {
        if (time && time) {
            this.buff_second = time;
            if (this.buff_second <= 0) {
                this.clearBuffTimeTicket();
            } else {
                if (this.buff_time_ticket == null) {
                    this.buff_time_ticket = gcore.Timer.set((function () {
                        this.updateBuffTimeTicket()
                    }).bind(this), 1000, -1);
                }
            }
        }
    },

    clearBuffTimeTicket: function () {
        if (this.buff_time_ticket != null) {
            gcore.Timer.del(this.buff_time_ticket);
            this.buff_time_ticket = null;
        }
    },

    updateBuffTimeTicket: function () {
        this.buff_second = this.buff_second - 1;
        if (this.buff_second <= 0) {
            this.clearBuffTimeTicket();
        }
        this.buff_acitive_label.string = cc.js.formatStr(Utils.TI18N("<color=#35ff14>(%s后失效)</c>"), TimeTool.getTimeFormat(this.buff_second));
    },

    //挑战购买次数的时候自动打开面板
    autoOpenChallengeWindow: function () {
        if (this.cur_selected_object && this.cur_selected_object.config && this.base_info) {
            if (this.base_info.count > 0) {
                HeroController.getInstance().openFormGoFightPanel(true, PartnerConst.Fun_Form.GuildDun_AD, { boss_id: this.cur_selected_object.config.boss_id })
            }
        }
    },

    //协议返回用于更新基础信息
    updateDunBaseInfo: function () {
        this.base_info = this.model.getBaseInfo();
        var base_info = this.base_info;
        if (base_info != null && base_info.info != null) {
            this.remainBuyCount(base_info.buy_count);
            //储存容器里面相关的boss模型
            for (var i in base_info.info) {
                var v = base_info.info[i];
                var boss_config = gdata("guild_dun_data", "data_guildboss_list", [v.boss_id]);
                if (boss_config) {
                    var object = this.monster_container;
                    if (object != null) {
                        object.config = boss_config;
                        //更新血量
                        this.updateMonsterHPStatus(object, v);
                    }
                }
            }
            //存储dps
            if (base_info.combat_info) {
                for (var i in this.base_info.combat_info) {
                    var v = this.base_info.combat_info[i];
                    if (this.monster_container && this.monster_container.config && v.boss_id == this.monster_container.config.boss_id) {
                        this.monster_container.dps = v.dps;
                    }
                }
            }

            //设置基础信息显示
            this.challenge_times_value.string = base_info.count;
            if (this.cur_fid != base_info.fid) {
                this.cur_fid = base_info.fid;
                var chatpter_config = gdata("guild_dun_data", "data_chapter_reward", [base_info.fid]);
                if (chatpter_config != null) {
                    if (this.monster_container && this.monster_container.boss_icon) {
                        var config = gdata("guild_dun_data", "data_guildboss_list", [chatpter_config.show_id]);
                        if (config) {
                            this.monster_container.boss_icon.setHeadRes(config.head_icon);
                            this.updateBg(config.bg_res);
                        }
                    }
                    this.chapter_name.string = chatpter_config.chapter_name + " " + chatpter_config.chapter_desc;
                    //这里设置挑战奖励吧
                    this.updateFillRewardsItems(chatpter_config.dps_awrard, chatpter_config.award, chatpter_config.guild_exp);
                }
            }

            //延迟创建模型
            gcore.Timer.set((function () {
                this.updateMonsterInfo(this.monster_container);
            }).bind(this), 8 / 60, 1);
            this.selecetMonsterContainer();

            if (base_info != null && base_info.buff_end_time != 0) {
                var buff_config = gdata("guild_dun_data", "data_buff_data", [base_info.buff_lev]);
                if (buff_config) {
                    this.buff_name.string = buff_config.desc;
                    // this.buff_acitive_label.node.x = this.buff_name.node.width + this.buff_name.node.x + 10;
                }
                this.buff_icon.setState(cc.Sprite.State.NORMAL);
                this.buff_name.node.color = new cc.Color(137, 237, 255, 255);
                this.updateBuffTime(base_info.buff_end_time);
                this.buff_container.active = true;
            } else {
                this.buff_icon.setState(cc.Sprite.State.GRAY)
                this.buff_name.node.color = new cc.Color(cc.Color.WHITE);
                this.buff_name.string = gdata("guild_dun_data", "data_const", ["des_nobuff"]).desc;
                // this.buff_acitive_label.node.x = this.buff_name.node.width + this.buff_name.node.x + 10;
                this.buff_acitive_label.string = Utils.TI18N("<color=#ff5858>(未激活)</c>");
            }
        }
    },

    //剩余购买次数
    remainBuyCount: function (count) {
        count = count || 0;
        var num = 0;
        var length = Config.guild_dun_data.data_buy_count_length;
        var buy_config = Config.guild_dun_data.data_buy_count[length];
        if (buy_config) {
            num = buy_config.count - count;
        }
        this.remain_buy_lb.string = num;
    },

    updateBg: function (image) {
        var res_id = PathTool.getBigBg(image, null, "guildboss");
        if (this.res_id != res_id) {
            this.res_id = res_id;
            this.loadRes(this.res_id, function (sf_obj) {
                this.bg.spriteFrame = sf_obj;
            }.bind(this))
        }
    },

    //创建模型,根据config
    updateMonsterInfo: function (object) {
        if (object == null || object.config == null) return
        var config = object.config;
        //怪物模型方面，只有id不同才做处理
        if (object.boss_id != config.boss_id) {
            object.boss_id = config.boss_id;
            object.monster_name.string = config.item_name;
            //清除掉之前的模型
            if (object.spine) {
                // object.spine.deleteMe();
                // object.spine = null;
                object.spine.setData(BaseRole.type.unit, config.combat_id, PlayerAction.show, true);
            } else {
                object.spine = new BaseRole();
                object.spine.setParent(object.model);
                object.spine.setData(BaseRole.type.unit, config.combat_id, PlayerAction.show, true);
            }
        }
    },

    //选中指定的怪物节点
    selecetMonsterContainer: function (type) {
        this.cur_selected_object = this.monster_container;
        // var protocal = {
        //     boss_id: this.cur_selected_object.config.boss_id,
        //     start_num: 1,
        //     end_num: 3
        // }
        // this.ctrl.requestGuildDunRank(GuildBossConst.rank.role, protocal)
        this.updateSelectedBtnStatus();
    },

    //更新选中对象的按钮状态
    updateSelectedBtnStatus: function () {
        if (this.cur_selected_object == null) return
        if (this.cur_selected_object.hp == null || this.cur_selected_object.dps == null) return
        if (this.cur_selected_object.hp == 0) { //已经被击杀了
            Utils.setGreyButton(this.challenge_btn, true);
            Utils.setGreyButton(this.mopup_btn, true);
            this.challenge_btn_lo.enabled = false;
            this.mopup_btn_lo.enabled = false;
        } else {
            if (this.cur_selected_object.dps == 0) {    //没有挑战过，不可以扫荡
                Utils.setGreyButton(this.mopup_btn, true);
                Utils.setGreyButton(this.challenge_btn, false);
                this.challenge_btn_lo.enabled = true;
                this.mopup_btn_lo.enabled = false;
            } else {
                Utils.setGreyButton(this.challenge_btn, false);
                Utils.setGreyButton(this.mopup_btn, false);
                this.challenge_btn_lo.enabled = true;
                this.mopup_btn_lo.enabled = true;
            }
        }
    },

    //更新血条
    updateMonsterHPStatus: function (object, info) {
        if (object == null || info == null || object.config == null) return
        if (info.hp <= 0) {
            this.doubleTimeAction(false);
        } else {
            if (ActivityController.getInstance().getBossActivityDoubleTime() == true)
                this.doubleTimeAction(true)
        }
        //设置血量
        var config = object.config;
        var percent = Math.ceil(100 * info.hp / config.hp);
        object.hp_value.string = percent + "%";
        object.progress.progress = percent / 100;
        object.hp = info.hp;
        object.pass_icon.active = info.hp == 0;
        object.boss_icon.setVisible(info.hp != 0);
        object.monster_name.node.active = info.hp != 0;
        object.progress_container.active = info.hp != 0;
    },

    doubleTimeAction: function (bool) {
        if (bool == false) {
            this._doubleReward.stopAllActions();
            if (Utils.next(this._doubleRewardList) != null) {
                for (var i in this._doubleReward) {
                    var v = this._doubleReward[i];
                    // v.setSpecialColor();
                    // v.setSpecialNum(this._currentPassNum[i]);
                    // v.setDoubleIcon(false);
                }
            }
        }
        this._doubleReward.active = bool;
        var seq = cc.sequence(cc.fadeOut(1.0), cc.fadeIn(1.0), cc.delayTime(0.3));
        this._doubleReward.runAction(cc.repeatForever(seq));

        if (Utils.next(this._doubleRewardList) != null) {
            for (var i in this._doubleRewardList) {
                var v = this._doubleRewardList[i];
                // v.setSpecialColor(true);
                // v.setSpecialNum(this._doublePassNum[i]);
                // v.setDoubleIcon(true);
            }
        }
    },

    //设置物品奖励
    //dps_award:伤害奖励列表
    //fixed_award:固定奖励列表
    //guild_award:公会贡献特殊
    updateFillRewardsItems: function (dps_award, fixed_award, guild_award) {
        dps_award = dps_award || {};
        _fixed_award = fixed_award || [];
        var _fixed_award = Utils.deepCopy(fixed_award);
        guild_award = guild_award || 0;
        _fixed_award.push([gdata("item_data", "data_assets_label2id", "guild_exp"), guild_award]);
        // for (var i in this.item_list) {
        //     var item = this.item_list[i];
        //     item.setVisible(false);
        //     this.item_pool.push(item);
        // }
        // this.item_list = [];
        for (var i in this.item_list_1) {
            var item = this.item_list_1[i];
            if (item) {
                item.setVisible(false);
            }
        }
        for (var i in this.item_list_2) {
            var item = this.item_list_2[i];
            if (item) {
                item.setVisible(false);
            }
        }

        var item_config = null;
        var index = 1;
        // var backpack_item = null;
        var _x = 0;
        var _y = -339;
        var scale = 0.8;
        var desc = null;
        //设置伤害奖励
        for (var i in dps_award) {
            var v = dps_award[i];
            if (this.item_list_1[index] == null) {
                const backpack_item = ItemsPool.getInstance().getItem("backpack_item");
                backpack_item.initConfig(false, scale, false, true)
                backpack_item.setParent(this.main_panel);
                backpack_item.show();
                this.item_list_1[index] = backpack_item;
            }
            var backpack_item = this.item_list_1[index]
            // backpack_item = this.item_pool.shift();
            backpack_item.setVisible(true);

            _x = 100 + (index - 1) * (BackPackItem.Width * scale + 14) + BackPackItem.Width * scale * 0.5 - 335;
            // backpack_item.setDefaultTip();

            backpack_item.setPosition(_x, _y);
            backpack_item.setData({ bid: v[0], num: v[1] });
            if (v[1] >= 1000) {
                desc = cc.js.formatStr("%sK", Math.floor(v[1] * 0.001));
            } else {
                desc = v[1];
            }
            if (v[2]) {
                desc = desc;
            }
            // backpack_item.setSpecialNum(desc);
            // backpack_item.setSpecialColor();
            this._currentPassNum[i] = desc;

            if (!this._doubleRewardList[i]) {
                this._doubleRewardList[i] = backpack_item;
                var doubleDesc = null;
                if (v[1] * 2 >= 1000) {
                    doubleDesc = cc.js.formatStr("%sK", Math.floor(v[1] * 2 * 0.001));
                } else {
                    doubleDesc = v[1] * 2;
                }
                if (v[2]) {
                    doubleDesc = doubleDesc;
                }
                this._doublePassNum[i] = doubleDesc;
            }
            // this.item_list.push(backpack_item);
            index = index + 1;
        }
        if (ActivityController.getInstance().getBossActivityDoubleTime() == true) {
            this.doubleTimeAction(true);
        }
        //设置击杀奖励
        index = 1;
        // backpack_item = null;
        for (var i in _fixed_award) {
            var v = _fixed_award[i];
            if (v instanceof Array && v[0] && v[1]) {
                if (this.item_list_2[index] == null) {
                    const backpack_item = ItemsPool.getInstance().getItem("backpack_item");
                    backpack_item.initConfig(false, scale, false, true)
                    backpack_item.setParent(this.main_panel);
                    backpack_item.show();
                    this.item_list_2[index] = backpack_item;
                }
                var backpack_item = this.item_list_2[index];
                // backpack_item = this.item_pool.shift();
                backpack_item.setVisible(true);

                _x = 100 + (index - 1) * (BackPackItem.Width * scale + 14) + BackPackItem.Width * scale * 0.5 - 23;
                // backpack_item.setDefaultTip();

                backpack_item.setPosition(_x, _y);
                backpack_item.setData({ bid: v[0], num: v[1] });
                this.item_list.push(backpack_item);
                index = index + 1;
            }
        }
    },

    //更新红点
    updateSomeRedStatus: function (type, status) {

    },

    getType: function (index) {
        if (index == 1) {
            return GuildBossConst.type.physics;
        } else {
            return GuildBossConst.type.magic;
        }
    },


    closeCallBack: function () {
        if (this.boss_icon) {
            this.boss_icon.deleteMe();
            this.boss_icon = null;
        }
        if (this._doubleRewardList) {
            for (var i in this._doubleRewardList) {
                var v = this._doubleRewardList[i];
                if (v.deleteMe) {
                    v.deleteMe();
                    v = null;
                }
            }
            this._doubleRewardList = null;
        }

        // this.clearTimeTicket();
        this.clearBuffTimeTicket();

        if (this.monster_list) {
            for (var i in this.monster_list) {
                var v = this.monster_list[i];
                if (v.spine) {
                    v.spine.deleteMe();
                    v.spine = null;
                }
            }
            this.monster_list = null;
        }

        // if (this.item_list) {
        //     for (var i in this.item_list) {
        //         var v = this.item_list[i];
        //         if (v.deleteMe) {
        //             v.deleteMe();
        //             v = null;
        //         }
        //     }
        //     this.item_list = null;
        // }
        // for (var i in this.item_pool) {
        //     this.item_pool[i].deleteMe();
        //     this.item_pool[i] = null;
        // }
        // this.item_pool = null;


        if (this.item_list_2) {
            for (var i in this.item_list_2) {
                if (this.item_list_2[i]) {
                    this.item_list_2[i].deleteMe();
                    this.item_list_2[i] = null;
                }
            }
            this.item_list_2 = null;
        }
        // if (this.item_list_1) {
        //     for (var i in this.item_list_1) {
        //         if (this.item_list_1[i]) {
        //             this.item_list_1[i].deleteMe();
        //             this.item_list_1[i] = null;
        //         }
        //     }
        //     this.item_list_1 = null;
        // }

        this.muster_btn_label.node.stopAllActions()

        if (this.guild_boss_view) {
            this.guild_boss_view.deleteMe();
            this.guild_boss_view = null;
        }

        if (this.role_vo != null) {
            if (this.role_assets_event != null) {
                this.role_vo.unbind(this.role_assets_event);
                this.role_assets_event = null;
            }
            this.role_vo = null;
        }

        this.ctrl.openMainWindow(false)
    }

});

module.exports = GuildBossMainWindow;