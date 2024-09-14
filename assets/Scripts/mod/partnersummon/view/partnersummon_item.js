// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-14 09:29:03
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PartnersummonConst = require("partnersummon_const");
var GuideEvent = require("guide_event");
var PartnersummonEvent = require("partnersummon_event");

var PartnersSummonItem = cc.Class({
    extends: ViewClass,

    properties: {
        summon_data: null,
        parent: null,
        summon_data: null,
        sprite_frmas: null,
        height: 228,
        recruit_once_staus: null, // 单次召唤状态
        recruit_more_staus: null, // 多次召唤状态
        item_enough: false, // 道具充足
        cur_timer: null,
        final_once_use_item: null, // 最终使用的
        final_once_use_num: null, // 最终使用的数量
        final_more_use_item: null, // 最终使用的
        final_more_use_num: null, // 最终使用的数量        
    },

    ctor: function() {
        this.parent = arguments[0];
        //this.index = arguments[1];
        this.recruit_cb = arguments[2];
        var PartnersummonController = require("partnersummon_controller");
        this.ctrl = PartnersummonController.getInstance();
        this.rleasePrefab = false;

        this.prefabPath = PathTool.getPrefabPath("partnersummon", "partnersummon_item");
        this.initConfig();
        this.registerEvent();
        this.initWindRoot();
    },

    initConfig: function() {
        var RoleController = require("role_controller")
        this.role_vo = RoleController.getInstance().getRoleVo();
        var BackPackController = require("backpack_controller");
        this.backpack_ctrl = BackPackController.getInstance();
        this.backpack_model = BackPackController.getInstance().getModel();
    },

    initWindRoot: function() {
        LoaderManager.getInstance().loadRes(this.prefabPath, function(res_object) {
            this.root_wnd = res_object;
            //this.root_wnd. = -this.index * this.height;
            this.parent.addChild(this.root_wnd);
            this.initWidget();
        }.bind(this))
    },

    registerEvent: function() {
        // 道具数量更新
        this.addGlobalEvent(EventId.ADD_GOODS, function(bag_code, item_list) {
            if (this.summon_data.group_id != PartnersummonConst.Summon_Type.Friend) this.updateWidgets();
        }.bind(this))

        this.addGlobalEvent(EventId.DELETE_GOODS, function(bag_code, item_list) {
            if (this.summon_data.group_id != PartnersummonConst.Summon_Type.Friend) this.updateWidgets();
        }.bind(this))

        this.addGlobalEvent(EventId.MODIFY_GOODS_NUM, function(bag_code, item_list) {
            if (this.summon_data.group_id != PartnersummonConst.Summon_Type.Friend) this.updateWidgets();
        }.bind(this))

        // 友情点数更新
        if (this.role_vo && !this.role_vo_friend) {
            this.role_vo_friend = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value) {
                if (key == "friend_point" && this.summon_data.group_id == PartnersummonConst.Summon_Type.Friend)
                    this.updateWidgets();
            }.bind(this))
        }

        if (this.five_star_event == null) {
            this.five_star_event = gcore.GlobalEvent.bind(PartnersummonEvent.PartnerSummonFiveStar, function(data) {
                if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Advanced && this.desc_lb) {
                    if (data && data.need_times > 0) {
                        if (PLATFORM_TYPR == "QQ_SDK" || PLATFORM_TYPR == "SH_SDK" || PLATFORM_TYPR == "WX_SDK") {
                            this.desc_lb.string = Utils.TI18N("         回の召喚以内に★        英雄を必ず獲得");
                        } else {
                            this.desc_lb.string = Utils.TI18N("        回の召喚以内に★        英雄を必ず獲得");
                        }

                        this.updateFiveStarSp(data.need_times);
                        this.guarantee_tip.active = true;
                    } else {
                        this.desc_lb.string = Utils.TI18N("随机召唤1个或10个3~5星英雄");
                        //this.desc_lb.node.y = -84;
                        if (this.five_nd.active == true){
                            this.five_nd.active = false;
                            this.guarantee_tip.active = false;
                        }
                        if (this.five_star_event) {
                            gcore.GlobalEvent.unbind(this.five_star_event);
                            this.five_star_event = null;
                        }
                    }
                }
            }.bind(this))
        }
    },

    initWidget: function() {
        //this.item_bg_sp = this.seekChild("item_bg", cc.Sprite);

        // 物品数量
        //this.good_bg_sp = this.seekChild("good_bg", cc.Sprite);
        this.good_sp = this.seekChild("good", cc.Sprite);
        this.good_num_lb = this.seekChild("good_num_label", cc.Label);

        // 召募一次
        this.recruit_btn_one_nd = this.seekChild("recruit_btn_one");
        this.recruit_btn_one_nd.tag_1 = 1;
        this.l_item_icon_nd = this.seekChild("l_item_icon");
        this.l_item_icon_sp = this.seekChild("l_item_icon", cc.Sprite);
        this.l_item_num_lb = this.seekChild("l_item_num", cc.Label);
        this.l_free_recruit_nd = this.seekChild("l_free_recruit");
        this.l_item_recruit_nd = this.seekChild("l_item_recruit");

        // 召募十次
        this.recruit_but_ten_nd = this.seekChild("recruit_btn_ten");
        this.recruit_but_ten_nd.tag_1 = 2;
        this.r_item_icon_nd = this.seekChild("r_item_icon");
        this.r_item_icon_sp = this.seekChild("r_item_icon", cc.Sprite);
        this.r_item_num_lb = this.seekChild("r_item_num", cc.Label);
        this.guarantee_tip = this.seekChild("tip_bg");

        //下次免费时间
        this.next_free_time_nd = this.seekChild("next_free_time");
        this.next_free_time_rt = this.seekChild("next_free_time", cc.RichText);

        this.discount_nd = this.seekChild("discount");

        this.desc_lb = this.seekChild("desc_lb", cc.Label);
        this.desc_lo = this.seekChild("desc_lb", cc.LabelOutline);
        this.five_nd = this.seekChild("five_nd");
        this.five_sp_1 = this.seekChild(this.five_nd, "five_sp_1").getComponent("CusRichText");
        this.five_sp_2 = this.seekChild(this.five_nd, "five_sp_2").getComponent("CusRichText");

        this.recruit_btn_one_nd.on(cc.Node.EventType.TOUCH_END, this.onClickOnceBtn, this);
        this.recruit_but_ten_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMoreBtn, this);

        if (this.summon_data) this.updateWidgets();
        //Utils.getNodeCompByPath("container/recruit_btn_one/labelName", this.root_wnd, cc.Label).string = Utils.TI18N("招募1次");
        Utils.getNodeCompByPath("container/recruit_btn_one/l_free_recruit", this.root_wnd, cc.Label).string = Utils.TI18N("免费招募");
        //Utils.getNodeCompByPath("container/recruit_btn_ten/labelName", this.root_wnd, cc.Label).string = Utils.TI18N("招募10次");
    },

    updateWidgets: function() {

        // var item_bg_res = this.summon_data.config_data.card_bg_res;
        // var item_bg_path = PathTool.getBigBg(item_bg_res, null, "partnersummon");
        // this.loadRes(item_bg_path, function(sp_obj) {
        //     this.item_bg_sp.spriteFrame = sp_obj;
        // }.bind(this));
        this.guarantee_tip.active = false;
        if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Normal) {
            this.desc_lb.string = Utils.TI18N("随机召唤1个或10个1~5星英雄");
            this.desc_lo.color = new cc.Color(26, 36, 124, 255);
            if (this.five_nd.active == true)
            {
                this.five_nd.active = false;
                this.guarantee_tip.active = false;
            }
        } else if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Advanced) {
            var five_data = this.ctrl.getFiveStarData();
            if (five_data && five_data.need_times > 0) {
                if (PLATFORM_TYPR == "QQ_SDK" || PLATFORM_TYPR == "SH_SDK" || PLATFORM_TYPR == "WX_SDK") {
                    this.desc_lb.string = Utils.TI18N("         回の召喚以内に★        英雄を必ず獲得");
                } else {
                    this.desc_lb.string = Utils.TI18N("         回の召喚以内に★        英雄を必ず獲得");
                }
                this.updateFiveStarSp(five_data.need_times);
                this.guarantee_tip.active = true;
                //this.desc_lb.node.y = -89;
            } else {
                this.desc_lb.string = Utils.TI18N("随机召唤1个或10个3~5星英雄");
                if (this.five_nd.active == true)
                {
                    this.five_nd.active = false;
                    this.guarantee_tip.active = false;
                }
                //this.desc_lb.node.y = -84;
            }
            this.desc_lo.color = new cc.Color(0, 0, 0, 255);
        } else if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Friend) {
            this.desc_lb.string = Utils.TI18N("随机召唤1个或10个2~5星英雄");
            this.desc_lo.color = new cc.Color(0, 0, 0, 255);
            if (this.five_nd.active == true)
            {
                this.five_nd.active = false;
                this.guarantee_tip.active = false;
            }
        }

        // 道具相关
        this.l_item_icon_nd.scale = 0.35;
        this.r_item_icon_nd.scale = 0.35;
        this.once_good_id = this.summon_data.config_data.item_once[0][0]; // 当前材料所需的item_id
        var goods_need = this.summon_data.config_data.item_once[0][1]
        var good_res_config = Utils.getItemConfig(this.once_good_id);
        var good_res_path = PathTool.getItemRes(good_res_config.icon)
            // if (!this.item_sf) {        
        this.loadRes(good_res_path, function(res_object) {
                this.good_sp.spriteFrame = res_object;
                //         this.l_item_icon_sp.spriteFrame = res_object;
                //         this.r_item_icon_sp.spriteFrame = res_object;
                //         this.item_sf = res_object;
            }.bind(this))
            // } else {
            //     this.l_item_icon_sp.spriteFrame = this.item_sf;
            //     this.r_item_icon_sp.spriteFrame = this.item_sf;
            // }
            // 引导标记tag
        if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Normal) {
            this.recruit_btn_one_nd.ui_tag = "recruit_btn_one_1";
        } else if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Advanced) {
            this.recruit_btn_one_nd.ui_tag = "recruit_btn_one_3";
        }

        // 道具数量
        var goods_num = 0;
        if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Friend) {
            goods_num = this.role_vo.friend_point;
        } else {
            goods_num = this.backpack_model.getBackPackItemNumByBid(this.once_good_id);
        }
        this.good_num_lb.string = goods_num;

        this.stopTimer();//清除一次timer防止重复添加
        // 单次召募设置
        var free_info = this.getFreeInfo(1);
        if (free_info.free_times > 0) {
            this.stopTimer();
            this.l_free_recruit_nd.active = true;
            this.l_item_recruit_nd.active = false;
            this.recruit_once_staus = PartnersummonConst.Status.Free;
        } else {
            this.startTimer(free_info);
            this.l_free_recruit_nd.active = false;
            this.l_item_recruit_nd.active = true;
            // 道具召唤
            this.l_item_num_lb.string = goods_need;
            if (goods_num >= goods_need) {
                this.recruit_once_staus = PartnersummonConst.Status.Item;
                this.item_enough = true;
                this.loadRes(good_res_path, function(res_object) {
                    this.l_item_icon_sp.spriteFrame = res_object;
                }.bind(this))
            } else {
                // 钻石召唤
                this.l_item_icon_nd.scale = 0.3;
                if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Advanced) {
                    var exchange_info = this.summon_data.config_data.exchange_once[0][0];
                    var exchange_num = this.summon_data.config_data.exchange_once[0][1];
                    this.l_item_num_lb.string = exchange_num;
                    var good_res_config = Utils.getItemConfig(exchange_info);
                    var good_res_path = PathTool.getItemRes(good_res_config.icon)
                    this.loadRes(good_res_path, function(res_object) {
                        this.l_item_icon_sp.spriteFrame = res_object;
                    }.bind(this))
                    this.recruit_once_staus = PartnersummonConst.Status.Gold;
                } else {
                    this.recruit_once_staus = PartnersummonConst.Status.Item;
                    this.item_enough = false;
                    this.loadRes(good_res_path, function(res_object) {
                        this.l_item_icon_sp.spriteFrame = res_object;
                    }.bind(this))
                }
            }
        }

        // 多次召唤
        var more_good_info = this.summon_data.config_data.item_five[0][0];
        var more_goods_need = this.summon_data.config_data.item_five[0][1];
        this.r_item_num_lb.string = more_goods_need;
        this.discount_nd.active = false;
        if (goods_num >= more_goods_need) {
            this.recruit_more_staus = PartnersummonConst.Status.Item;
            this.item_more_enough = true;
            this.loadRes(good_res_path, function(res_object) {
                this.r_item_icon_sp.spriteFrame = res_object;
            }.bind(this))
        } else {
            // 多次钻石召唤
            this.r_item_icon_nd.scale = 0.3;
            if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Advanced) {
                var exchange_info = this.summon_data.config_data.exchange_five[0][0];
                var exchange_num = this.summon_data.config_data.exchange_five[0][1];
                var good_res_config = Utils.getItemConfig(exchange_info);
                var good_res_path = PathTool.getItemRes(good_res_config.icon)
                this.loadRes(good_res_path, function(res_object) {
                    this.r_item_icon_sp.spriteFrame = res_object;
                }.bind(this))
                this.r_item_num_lb.string = exchange_num;
                this.recruit_more_staus = PartnersummonConst.Status.Gold;

                // 折扣
                this.discount_nd.active = true;
                CommonAction.breatheShineAction3(this.discount_nd);
            } else {
                this.recruit_more_staus = PartnersummonConst.Status.Item;
                this.item_more_enough = false;
                this.loadRes(good_res_path, function(res_object) {
                    this.r_item_icon_sp.spriteFrame = res_object;
                }.bind(this))
            }
        }

        // 其他纹理相关
        // if (!this.sprite_frmas) {
        //     var sprite_path = PathTool.getResFrame("partnersummon", "partnersummon");
        //     this.loadRes(sprite_path, function(sp_obj){
        //         this.sprite_frmas = sp_obj;
        //         this.updateSprites();
        //     }.bind(this))
        // } else {
        this.updateSprites();
        // }
    },


    startTimer: function(free_info) {
        if (!free_info && free_info.surplus_time > 0) return

        this.time_interval = Utils.getTimeInterval(free_info.surplus_time);
        this.surplus_time = Utils.changeIntevalToDate(this.time_interval);
        if (!this.surplus_time)
        {
            this.next_free_time_nd.active = false;
            return;
        }
        this.next_free_time_nd.active = true;
        this.cur_timer = gcore.Timer.set(function() {
            if (this.cur_timer) {
                this.time_interval = Utils.getTimeInterval(free_info.surplus_time);
                this.surplus_time = Utils.changeIntevalToDate(this.time_interval);
                var final_time = this.surplus_time.H + ":" + this.surplus_time.M + ":" + this.surplus_time.S;
                var final_str = cc.js.formatStr(Utils.TI18N("<color=#35ff14><outline=2, color=#000000>%s</outline></color><color=#ffffff><outline=2, color=#000000>后免费</outline></color>"), final_time);
                this.next_free_time_rt.string = final_str;
            }
        }.bind(this), 1000, -1);

    },

    stopTimer: function() {
        this.next_free_time_nd.active = false;
        if(this.cur_timer){
        gcore.Timer.del(this.cur_timer);
        this.cur_timer = null;
        }
    },

    updateSprites: function() {
        // var good_bg_res = PartnersummonConst.Good_Bg[this.summon_data.group_id];
        // var good_bg_path = PathTool.getUIIconPath("partnersummon", good_bg_res);

        // this.loadRes(good_bg_path, function(sf_obj) {
        //     this.good_bg_sp.spriteFrame = sf_obj;
        // }.bind(this))

    },

    updateData: function(summon_data) {
        if (!summon_data) return
        this.summon_data = summon_data;
        if (this.root_wnd) this.updateWidgets();
    },

    onClickOnceBtn: function(event) {
        var times = 1;
        this.sendRecruit(times);
        if (window.TASK_TIPS)
            gcore.GlobalEvent.fire(GuideEvent.TaskNextStep, "recruit_btn_one_3"); //任务引导用到
    },

    onClickMoreBtn: function() {
        var times = 10;
        this.sendRecruit(times);
    },

    sendRecruit: function(times) {
        Utils.playButtonSound(ButtonSound.Normal);
        // 判断英雄背包空间
        var HeroController = require("hero_controller");
        var hero_model = HeroController.getInstance().getModel();
        var hero_bag_info = hero_model.getHeroMaxCount();
        var limit_num = hero_bag_info.max_count - hero_bag_info.have_coutn;

        if (times > limit_num) {
            var str = Utils.TI18N("英雄列表已满，可通过提升贵族等级或购买增加英雄携带数量，是否前往购买？")
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, Utils.TI18N("确定"), function() {
                // var MainuiController = require("mainui_controller")
                // var MainuiConst = require("mainui_const")
                var ActionController = require("action_controller")
                // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner)
                var hero_controller = require("hero_controller").getInstance();
                hero_controller.openHeroBagWindow(true);
                ActionController.getInstance().openActionMainPanel(false)
            }, Utils.TI18N("取消"), function() {});

            return
        }

        var recruit_type = null;
        // if ((this.recruit_more_staus == PartnersummonConst.Status.Free && times == 10) || (this.recruit_once_staus == PartnersummonConst.Status.Free && times == 1)) {
        //     recruit_type = 1;
        // } else if (this.recruit_more_staus == PartnersummonConst.Status.Item || this.recruit_once_staus == PartnersummonConst.Status.Item) {
        //     recruit_type = 4;
        //     if ((!this.item_more_enough && times === 10) || (!this.item_enough && times === 1)) {
        //         this.showGetPath();
        //         return
        //     }
        // } else if ((this.recruit_more_staus == PartnersummonConst.Status.Gold && times === 10) || (this.recruit_once_staus == PartnersummonConst.Status.Gold && times === 1)) {
        //     recruit_type = 3;
        //     this.showGoldTips(times);
        //     return
        // }

        if (times == 1) {
            if (this.recruit_once_staus == PartnersummonConst.Status.Free) {
                recruit_type = 1;
            } else if (this.recruit_once_staus == PartnersummonConst.Status.Item) {
                recruit_type = 4;
                if (!this.item_enough) {
                    this.showGetPath();
                    return;
                }
            } else if (this.recruit_once_staus == PartnersummonConst.Status.Gold) {
                recruit_type = 3;
                this.showGoldTips(times);
                return
            }
        } else if (times == 10) {
            if (this.recruit_more_staus == PartnersummonConst.Status.Free) {
                recruit_type = 1;
            } else if (this.recruit_more_staus == PartnersummonConst.Status.Item) {
                recruit_type = 4;
                if (!this.item_more_enough) {
                    this.showGetPath();
                    return;
                }
            } else if (this.recruit_more_staus == PartnersummonConst.Status.Gold) {
                recruit_type = 3;
                this.showGoldTips(times);
                return;
            }
        }

        if (!recruit_type) return
        if (this.recruit_cb) this.recruit_cb(this.summon_data.group_id, times, recruit_type);
    },

    showGoldTips: function(times) {
        var good_res_config = Utils.getItemConfig(this.summon_data.config_data.exchange_once[0][0]);
        var good_res_path = "3";
        var need_num = this.summon_data.config_data.exchange_once[0][1];
        var hvae_num = this.role_vo.getTotalGold();
        var val_str = Utils.getItemConfig(this.summon_data.config_data.exchange_once_gain[0][0]).name
        var val_num = this.summon_data.config_data.exchange_once_gain[0][1];
        var call_num = this.summon_data.recruit_data.draw_list[1].times || 1;

        if (times === 10) {
            need_num = this.summon_data.config_data.exchange_five[0][1];
            val_str = Utils.getItemConfig(this.summon_data.config_data.exchange_five_gain[0][0]).name
            val_num = this.summon_data.config_data.exchange_five_gain[0][1];
            call_num = this.summon_data.recruit_data.draw_list[0].times || 10;
        }

        var buy_ori = cc.js.formatStr(Utils.TI18N("是否使用<img src='%s' /><color=#289b14>%s</color><color=#764519>(拥有:</color><color=#289b14>%s</color><color=#764519>)</color>"), good_res_path, need_num, hvae_num);
        // var get_ori = cc.js.formatStr(Utils.TI18N("<color=#764519>购买</color><color=#289b14>%s</color><color=#764519></color><color=#d95014>%s</color><color=#764519>(同时附赠</color><color=#289b14>%s</color><color=#764519>次招募)</color>"), val_num, val_str, call_num);
        var des_str = buy_ori;

        var frame_arrays = [];
        var good_path = PathTool.getIconPath("item", "3");
        frame_arrays.push(good_path);
        var CommonAlert = require("commonalert");
        var common_aler_view = CommonAlert.show(des_str, Utils.TI18N("确定"), this.configUseGold.bind(this, times), Utils.TI18N("取消"), null, null, null, { resArr: frame_arrays, maxWidth: 500, align: cc.macro.TextAlignment.LEFT });
    },

    configUseGold: function(times, event) {
        var group_id = this.summon_data.group_id;
        var times = times;
        var recruit_type = 3;

        if (this.recruit_cb) this.recruit_cb(group_id, times, recruit_type);
    },

    // 显示获取途径
    showGetPath: function() {
        this.backpack_ctrl.openTipsSource(true, this.once_good_id);
        // this.once_good_id
    },

    // 获取免费召唤次数
    getFreeInfo: function(times,data) {
        if (times === null) return;

        var draw_list = this.summon_data.recruit_data.draw_list
        if(data){
          draw_list = data.draw_list;
        }
        if (!draw_list) return

        var times_list = null;
        var times_info = {};
        for (var draw_i in draw_list) {
            if (draw_list[draw_i].times == times)
                times_list = draw_list[draw_i];
        }

        if (times_list) {
            for (var key_i in times_list.kv_list) {
                if (times_list.kv_list[key_i].key === PartnersummonConst.Recruit_Key.Free_Count) {
                    times_info.free_times = times_list.kv_list[key_i].val;
                }
                if (times_list.kv_list[key_i].key === PartnersummonConst.Recruit_Key.Free_Time) {
                    times_info.surplus_time = times_list.kv_list[key_i].val;
                }
            }
        }

        return times_info
    },

    deleteMe: function() {
        this._super();
        this.stopTimer();
        if (this.five_star_event) {
            gcore.GlobalEvent.unbind(this.five_star_event);
            this.five_star_event = null;
        }
    },

    getSummonItemRoot: function(name, get_cb) {
        if (this.root_wnd) {
            var tar_root = this.seekChild(this.root_wnd, name);
            get_cb(tar_root)
        } else {
            this.get_root_name = name;
            this.get_root_cb = get_cb;
        }
    },

    regainRecruit: function() {
        var goods_num = this.backpack_model.getBackPackItemNumByBid(this.once_good_id);
        if (goods_num > 0) {
            if (this.recruit_cb) this.recruit_cb(this.summon_data.group_id, 1, 4);
        } else {
            if (this.summon_data.group_id == PartnersummonConst.Summon_Type.Advanced) {
                this.showGoldTips(1);
            } else {
                this.showGetPath();
            }
        }
    },

    //更新5星必出
    updateFiveStarSp: function(num) {
        if (num <= 0) return
        if (this.five_nd == null) return
        this.five_nd.active = true;
        // if (this.five_bg_sp == null) {
        //     this.five_bg_sp = Utils.createImage(this.five_nd, null, 0, 0, cc.v2(0.5, 0.5), null, 0, true);
        //     this.five_bg_sp.node.setContentSize(330, 40);
        //     this.loadRes(PathTool.getUIIconPath("partnersummon", "bg_1"), function (sp) {
        //         this.five_bg_sp.spriteFrame = sp;
        //     }.bind(this))
        this.five_sp_2.setNum(5);
        // }
        this.five_sp_1.setNum(num);
    },
})