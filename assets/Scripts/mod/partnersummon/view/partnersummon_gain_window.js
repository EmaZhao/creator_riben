// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-16 10:06:06
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var SummonConst = require("partnersummon_const");
var RoleController = require("role_controller");
var BackpackController = require("backpack_controller");
var TimesummonController = require("timesummon_controller")
var PartnersummonGainWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("partnersummon", "partnersummon_gain_window");
        this.viewTag = SCENE_TAG.dialogue; // 该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; // 是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.can_show = false;

        this.ctrl = arguments[0];
        this.iType = arguments[2];
        this.modle = this.ctrl.getModel();
        this.recruit_data = this.modle.getRecruitData();
    },

    initConfig: function() {
        this.partnersummon_config = Config.recruit_data.data_partnersummon_data;
    },

    openCallBack: function() {

        Utils.getNodeCompByPath("again_btn/again_one_txt", this.root_wnd, cc.RichText).string = Utils.TI18N("再抽一次");
        Utils.getNodeCompByPath("again_btn/again_ten_txt", this.root_wnd, cc.RichText).string = Utils.TI18N("再抽十次");
        Utils.getNodeCompByPath("confirm_btn/again_txt", this.root_wnd, cc.RichText).string = Utils.TI18N("确定");

        // this.summon_bg_sp = this.seekChild("summon_bg", cc.Sprite);
        this.bg_effect_sk = this.seekChild("bg_effect", sp.Skeleton);
        this.partnersummon_bg = this.seekChild("partnersummon_bg");
        this.summon_bg_nd = this.seekChild("summon_bg");
        this.partnersummon_bg.scale = FIT_SCALE;
        this.summon_bg_nd.scale = FIT_SCALE

        this.get_des_nd = this.seekChild("get_des");
        this.items_content_nd = this.seekChild("items_content");
        this.again_btn_nd = this.seekChild("again_btn");
        this.confirm_btn_nd = this.seekChild("confirm_btn");
        this.again_one_txt_nd = this.seekChild("again_one_txt");
        this.again_ten_txt_nd = this.seekChild("again_ten_txt");

        this.again_need_nd = this.seekChild("again_need");
        this.goods_num_lb = this.seekChild("goods_num", cc.RichText);
        this.goods_sp = this.seekChild("goods", cc.Sprite);

        this.confirm_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickConfirmBtn, this);
        this.again_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickAgainBtn, this);
    },

    registerEvent: function() {

    },

    closeCallBack: function() {
        if (this.item_nds) {
            for (let i = 0; i < this.item_nds.length; ++i) {
                if (this.item_nds[i]) {
                    this.item_nds[i].deleteMe()
                    this.item_nds[i] = null;
                }
            }
            this.item_nds = null;
        }
        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        if (this.get_des_nd && this.get_des_nd.isValid) {
            this.get_des_nd.stopAllActions()
        }
        this.ctrl.openSummonGainWindow(false)
    },

    openRootWnd: function(params) {
        if (!this.recruit_data) return;
        this.root_wnd.active = false;
        this.udpateWidgets();
        this.createGetItems();
        this.analyseRecruitData();
    },

    udpateWidgets: function() {
        this.type_flag = this.recruit_data.flag
            // 背景
        if (this.type_flag == 0) {
            this.partnersummon_config = Config.recruit_data.data_partnersummon_data;
        } else if (this.type_flag == 1) {
            this.partnersummon_config = Config.recruit_holiday_data.data_summon
        } else if (this.type_flag == 2) {
            this.partnersummon_config = Config.recruit_holiday_elite_data.data_summon
        }
        var summon_cfg_item = this.partnersummon_config[this.recruit_data.group_id];
        var resources_id = "partnersummon_call_bg_100";
        if (summon_cfg_item)
            resources_id = summon_cfg_item.call_bg;
        var bg_path = PathTool.getUIIconPath("bigbg/partnersummon", resources_id);
        // this.loadRes(bg_path, function(bigbg_sf) {
        //     this.summon_bg_sp.spriteFrame = bigbg_sf;
        // }.bind(this));

        // 背景动画
        // var bg_effect_id = "140"
        // if (summon_cfg_item)
        //     bg_effect_id = summon_cfg_item.call_bg_action;

        // var effect_res = PathTool.getEffectRes(bg_effect_id);
        // var effect_path = PathTool.getSpinePath(effect_res, "action");

        // this.loadRes(effect_path, function(bg_sd) {
        //     this.bg_effect_sk.skeletonData = bg_sd;
        //     this.bg_effect_sk.setAnimation(0, "action", true);
        // }.bind(this));

        // 按钮
        if (this.recruit_data.times === 1) {
            this.again_one_txt_nd.active = true;
            this.again_ten_txt_nd.active = false;
        } else {
            this.again_one_txt_nd.active = false;
            this.again_ten_txt_nd.active = true;
        }

        // 道具提示
        this.need_item_id = null;
        this.item_enough = false;
        var need_count;
        var have_count;

        if (this.recruit_data.group_id != SummonConst.Summon_Type.Score) {
            if (this.type_flag == 0) {
                if (this.recruit_data.times === 1) {
                    this.need_item_id = summon_cfg_item.item_once[0][0];
                    need_count = summon_cfg_item.item_once[0][1];
                } else {
                    this.need_item_id = summon_cfg_item.item_five[0][0];
                    need_count = summon_cfg_item.item_five[0][1];
                }
            } else if (this.type_flag == 1) {
                if (this.recruit_data.times === 1) {
                    this.need_item_id = summon_cfg_item.loss_item_once[0][0];
                    need_count = summon_cfg_item.loss_item_once[0][1];
                } else {
                    this.need_item_id = summon_cfg_item.loss_item_ten[0][0];
                    need_count = summon_cfg_item.loss_item_ten[0][1];
                }
            } else if (this.type_flag == 2) {
                if (this.recruit_data.times === 1) {
                    this.need_item_id = summon_cfg_item.loss_item_once[0][0];
                    need_count = summon_cfg_item.loss_item_once[0][1];
                } else {
                    this.need_item_id = summon_cfg_item.loss_item_ten[0][0];
                    need_count = summon_cfg_item.loss_item_ten[0][1];
                }
            }

        } else {}

        if (this.recruit_data.group_id === SummonConst.Summon_Type.Friend) {
            var role_vo = RoleController.getInstance().getRoleVo();
            have_count = role_vo.friend_point;
        } else {
            have_count = BackpackController.getInstance().getModel().getBackPackItemNumByBid(this.need_item_id);
        }

        if (this.recruit_data.group_id === SummonConst.Summon_Type.Score || this.iType == 1) {
            this.again_need_nd.active = false;
            this.again_btn_nd.active = false;
            this.confirm_btn_nd.x = this.root_wnd.width * 0.5;
        } else {
            this.again_need_nd.active = true;
            this.again_btn_nd.active = true;
            this.confirm_btn_nd.x = 530;
            var good_res_config = Utils.getItemConfig(this.need_item_id);
            var good_res_path = PathTool.getItemRes(good_res_config.icon)
                // var item_res_path = PathTool.getIconPath("item", this.need_item_id);
            this.loadRes(good_res_path, function(item_sf) {
                this.goods_sp.spriteFrame = item_sf;
            }.bind(this));

            var label_str = "";
            if (have_count < need_count) {
                this.item_enough = false;
                label_str = cc.js.formatStr("<color=#e14737><outline color=#000000 width=2>%s</outline></color><color=#ffffff><outline color=#000000 width=2>/%s</outline></color>", have_count, need_count);
            } else {
                this.item_enough = true;
                label_str = cc.js.formatStr("<color=#35ff14><outline color=#000000 width=2>%s</outline></color><color=#ffffff><outline color=#000000 width=2>/%s</outline></color>", have_count, need_count);
            }
            this.goods_num_lb.string = label_str;
        }
    },

    showItems: function() {
        this.root_wnd.active =true;
        if (!this.get_des_nd || !this.get_des_nd.isValid) return
        this.get_des_nd.scale = 1.5;
        if (!this.get_action) {
            var delay_act = cc.delayTime(0.1);
            var scale_act = cc.scaleTo(0.1, 1);
            this.get_action = cc.sequence(delay_act, scale_act);
        }
        this.get_des_nd.runAction(this.get_action);
        this.can_show = true;
        if (this.items_init) {
            this.addGetItems();
        }
    },

    addGetItems: function() {
        Utils.playEffectSound(AUDIO_TYPE.Recruit, "result_01");
        if (this.item_nds == null) return
        for (var item_i = 0; item_i < this.item_nds.length; item_i++) {
            this.items_content_nd.addChild(this.item_nds[item_i].root_wnd);
            this.item_nds[item_i].playShowAction(item_i);
            // this.item_nds[item_i].showEffect();
        }
    },

    createGetItems: function() {
        if (!this.recruit_data) return;
        this.rewards = this.recruit_data.rewards;
        this.init_num = 0;
        this.item_nds = [];
        var scheIndex = 0;

        var HeroExhibitionItem = require("hero_get_item");
        var create_item_sch = gcore.Timer.set((function() {
            var hero_item = new HeroExhibitionItem(this.rewards[scheIndex], scheIndex, this.itemFinishCreate.bind(this));
            if (this.item_nds == null) return
            this.item_nds.push(hero_item);
            ++scheIndex;
        }.bind(this)), 50, this.rewards.length);
    },

    itemFinishCreate: function(index, root_wn) {
        ++this.init_num
        if (this.init_num == this.rewards.length) {
            if (this.item_nds == null) return
            if (this.item_nds.length > 5) {
                this.items_content_nd.width = 120 * 5 + 20 * 4
            } else {
                this.items_content_nd.width = 120 * this.item_nds.length + (20 * this.item_nds.length - 1)
            }
            this.items_init = true;
            if (this.can_show)
                this.addGetItems();
        }
    },

    analyseRecruitData: function() {
        if (this.finish_cb) this.finish_cb();
        // return
        var show_bids = []; // 需要召唤的高级英雄 
        if (this.recruit_data.partner_bids) {
            var bid_info = null;
            for (var bid_i in this.recruit_data.partner_bids) {
                bid_info = this.recruit_data.partner_bids[bid_i];
                var par_config = Config.partner_data.data_partner_base[bid_info.partner_bid]
                if (par_config.show_effect) show_bids.push(bid_info);
            }
        }

        if (show_bids.length > 0) {
            this.ctrl.openSummonGainShowWindow(true, show_bids, this.showItems.bind(this));
        } else {
            this.showItems();
        }
    },

    didClickConfirmBtn: function(event) {
        // var show_bids = [{partner_bid: 40403, init_star: 4}, {partner_bid: 20504, init_star: 5}, {partner_bid: 30402, init_star: 4}];
        // this.ctrl.openSummonGainShowWindow(true, show_bids, this.showItems.bind(this));
        this.ctrl.openSummonGainWindow(false);
    },

    didClickAgainBtn: function(event) {
        // 判断英雄背包空间
        var HeroController = require("hero_controller");
        var hero_model = HeroController.getInstance().getModel();
        var hero_bag_info = hero_model.getHeroMaxCount();
        var limit_num = hero_bag_info.max_count - hero_bag_info.have_coutn;
        if (this.recruit_data.times > limit_num) {
            var str = Utils.TI18N("英雄列表已满，可通过提升贵族等级或购买增加英雄携带数量，是否前往购买？")
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, Utils.TI18N("确定"), function() {
                // var MainuiConst = require("mainui_const")
                var ActionController = require("action_controller")
                // var MainuiController = require("mainui_controller")
                // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner)
                var hero_controller = require("hero_controller").getInstance();
                hero_controller.openHeroBagWindow(true);
                ActionController.getInstance().openActionMainPanel(false)
            }, Utils.TI18N("取り消し"), function() {})
            return
        }
        if (this.type_flag == 0) {
            if (!this.item_enough) {
                if (this.recruit_data.group_id == SummonConst.Summon_Type.Advanced) {
                    this.showGoldTips(this.recruit_data.times);
                    return;
                }

                BackpackController.getInstance().openTipsSource(true, this.need_item_id);
            } else {
                this.ctrl.againRecruit();
                if (this.modle.getClickStatus()) {
                    this.modle.clickIntervalStatus(false)
                } else {
                    this.ctrl.openSummonGainWindow(false);
                }
            }
        } else {
            if (this.item_enough) {
                if (this.type_flag == 1) {
                    this.ctrl.openSummonGainWindow(false);
                    TimesummonController.getInstance().requestTimeSummon(this.recruit_data.times, 4)
                } else if (this.type_flag == 2) {
                    this.ctrl.openSummonGainWindow(false);
                    var ElitesummonController = require("elitesummon_controller")
                    ElitesummonController.getInstance().send23221(this.recruit_data.times, 4)
                }
                return
            }
            this.showGoldTips(this.recruit_data.times)

        }

    },

    showGoldTips: function(times) {
        var config_data
        if (this.type_flag == 0) {
            config_data = Config.recruit_data.data_partnersummon_data["300"];
        } else if (this.type_flag == 1) {
            config_data = Config.recruit_holiday_data.data_summon[this.recruit_data.group_id];
        } else if (this.type_flag == 2) {
            config_data = Config.recruit_holiday_elite_data.data_summon[this.recruit_data.group_id]
        }

        var recruit_data = this.modle.getSummonProtoDataByGroupID(300);

        var RoleController = require("role_controller")
        var role_vo = RoleController.getInstance().getRoleVo();
        var need_num, val_str, val_num, call_num
        if (this.type_flag == 0) {
            // good_res_config = Utils.getItemConfig(config_data.exchange_once[0][0]);
            need_num = config_data.exchange_once[0][1];
            val_str = Utils.getItemConfig(config_data.exchange_once_gain[0][0]).name
            val_num = config_data.exchange_once_gain[0][1];
            call_num = recruit_data.draw_list[1].times || 1;
        } else if (this.type_flag == 1 || this.type_flag == 2) {
            // good_res_config = Utils.getItemConfig(config_data.loss_gold_once[0][0]);
            need_num = config_data.loss_gold_once[0][1]
            val_str = Utils.getItemConfig(config_data.gain_once[0][0]).name
            val_num = config_data.gain_once[0][1];
            call_num = this.recruit_data.times
        }
        var good_res_path = "3";
        var hvae_num = role_vo.getTotalGold();

        if (times === 10) {
            if (this.type_flag == 0) {
                need_num = config_data.exchange_five[0][1];
                val_str = Utils.getItemConfig(config_data.exchange_five_gain[0][0]).name
                val_num = config_data.exchange_once_gain[0][1];
                call_num = recruit_data.draw_list[0].times || 10;
            } else if (this.type_flag == 1 || this.type_flag == 2) {
                need_num = config_data.loss_gold_ten[0][1];
                val_str = Utils.getItemConfig(config_data.gain_ten[0][0]).name
                val_num = config_data.gain_once[0][1];
                call_num = this.recruit_data.times;
            }

        }

        var buy_ori = cc.js.formatStr(Utils.TI18N("是否使用<img src='%s' /><color=#289b14>%s</color><color=#764519>(拥有:</color><color=#289b14>%s</color><color=#764519>)</color>"), good_res_path, need_num, hvae_num);
        // var get_ori = cc.js.formatStr(Utils.TI18N("<color=#764519>购买</color><color=#289b14>%s</color><color=#764519></color><color=#d95014>%s</color><color=#764519>(同时附赠</color><color=#289b14>%s</color><color=#764519>次招募)</color>"), val_str, val_num, call_num);
        var des_str = buy_ori ;

        var frame_arrays = [];
        var good_path = PathTool.getIconPath("item", "3");
        frame_arrays.push(good_path);

        var CommonAlert = require("commonalert");
        var common_aler_view = CommonAlert.show(des_str, "決定", this.configUseGold.bind(this, times), "取り消し", null, null, null, { resArr: frame_arrays, maxWidth: 500, align: cc.macro.TextAlignment.LEFT });
    },

    configUseGold: function() {
        if (this.type_flag == 0) {
            var group_id = 300;
            var times = this.recruit_data.times;
            var recruit_type = 3;

            this.ctrl.recurit(group_id, times, recruit_type);
            this.ctrl.openSummonGainWindow(false);
        } else if (this.type_flag == 1) {
            TimesummonController.getInstance().requestTimeSummon(this.recruit_data.times, 3)
            this.ctrl.openSummonGainWindow(false);
        } else if (this.type_flag == 2) {
            var ElitesummonController = require("elitesummon_controller")
            ElitesummonController.getInstance().send23221(this.recruit_data.times, 3)
            this.ctrl.openSummonGainWindow(false);
        }

        // if (this.recruit_cb) this.recruit_cb(group_id, times, recruit_type);
    },
})