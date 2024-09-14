// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-02 15:13:30
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const");
var HeroEvent = require("hero_event");
var MallController = require("mall_controller");
var MallConst = require("mall_const");
var BackpackController = require("backpack_controller")
var BackPackConst = require("backpack_const")
var BackpackEvent = require("backpack_event")
var HeroResetWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_reset_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.cur_camp = 0;
        this.select_heros = [];
        //最多选择10个
        this.select_max_count = 10
        this.is_send_proto = false;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/img_box/no_vedio_image/no_vedio_label", this.root_wnd, cc.Label).string = Utils.TI18N("挑戦記録なし");
        Utils.getNodeCompByPath("main_container/hero_xianji/putin_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("快速放入");
        Utils.getNodeCompByPath("main_container/hero_xianji/disband_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("献 祭");
        Utils.getNodeCompByPath("main_container/debris_xianji/debris_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("碎片献祭");
        Utils.getNodeCompByPath("main_container/partner_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("英雄商店");
        this.main_panel_nd = this.seekChild("main_container")
        this.close_btn_nd = this.seekChild("close_btn");
        this.camp_node_nd = this.seekChild("camp_node");
        this.img_select_nd = this.seekChild("img_select");
        this.hero_list_nd = this.seekChild("hero_list");
        this.no_vedio_image_nd = this.seekChild("no_vedio_image");
        this.tips_lb = this.seekChild(this.no_vedio_image_nd, "no_vedio_label", cc.Label);
        this.putin_btn_nd = this.seekChild("putin_btn");
        this.disband_btn_nd = this.seekChild("disband_btn");
        this.partner_btn_nd = this.seekChild("partner_btn");
        this.tip_btn_nd = this.seekChild("tip_btn");
        this.look_btn_nd = this.seekChild("look_btn");

        this.hero_count_lb = this.seekChild("hero_count", cc.Label);
        this.input_count_lb = this.seekChild("input_count", cc.Label);
        this.tab_container_nd = this.seekChild("tab_container");
        this.hero_tab = this.seekChild("hero_xianji")
        this.debris_tab = this.seekChild("debris_xianji")
        this.resolve_count_lb = this.seekChild(this.debris_tab, "resolve_count", cc.EditBox)
        this.redu_btn = this.seekChild(this.debris_tab, "redu_btn", cc.Button);
        this.add_btn = this.seekChild(this.debris_tab, "add_btn", cc.Button);
        this.max_btn = this.seekChild(this.debris_tab, "max_btn", cc.Button);
        this.debris_btn = this.seekChild(this.debris_tab, "debris_btn", cc.Button)
        this.redu_lb = this.redu_btn.node.getChildByName("Label").getComponent(cc.LabelOutline)
        this.add_lb = this.add_btn.node.getChildByName("Label").getComponent(cc.LabelOutline)
        this.max_lb = this.max_btn.node.getChildByName("Label").getComponent(cc.LabelOutline)
        this.resolve_count_lb.node.on('text-changed', function(editbox) {
            if (!this.selectChipIndex || this.selectChipIndex == -1) {
                editbox.string = "0";
                return
            }
            if (editbox.string.length > 1 && editbox.string[0] == "0") {
                editbox.string = editbox.string.slice(1, editbox.string.length);
                return
            }
            let num = Number(editbox.string)
            if (num > this.chipMaxNum) {
                editbox.string = this.chipMaxNum
            }
            this.checkBtnState()
        }, this);
        this.redu_btn.node.on("click", this.onClickBtnRedu, this)
        this.add_btn.node.on("click", this.onClickBtnAdd, this)
        this.max_btn.node.on("click", this.onClickBtnMax, this)
        this.debris_btn.node.on("click", this.onDisbandChip, this)
        let tab_name_list = {
            [1]: Utils.TI18N("英雄献祭"),
            [2]: Utils.TI18N("碎片献祭")
        }
        this.tab_list = {};
        for (let i = 1; i <= 2; ++i) {
            let object = {};
            object.tab_btn = this.tab_container_nd.getChildByName("toggle" + i);
            object.index = i;
            object.toggle = object.tab_btn.getComponent(cc.Toggle);
            object.tab_btn.getChildByName("title").getComponent(cc.Label).string = tab_name_list[i];
            object.tab_btn.on("toggle", function() {
                Utils.playButtonSound(1)
                this.changeSelectedTab(i)
            }, this)
            this.tab_list[i] = object
        }
        this.input_count_lb.string = Utils.TI18N("已放入英雄:") + "0/" + this.select_max_count;
        // this.anima_sk          = this.seekChild("anima", sp.Skeleton);
        // this.anima_sk.setCompleteListener(this.onAnimaFinish.bind(this));
        let bg = this.seekChild("bg", cc.Sprite);
        bg.node.scale = FIT_SCALE * 2
        this.loadRes(PathTool.getBigBg("hero/hero_reset_bg"), function(res) {
            bg.spriteFrame = res
        }.bind(this))
        this.reset_effect = this.seekChild("play_effect1", sp.Skeleton);
        this.reset_effect.setCompleteListener(this.onAnimaFinish.bind(this));
        let sketon_path = "spine/E24121/action.atlas";
        this.loadRes(sketon_path, function(skeleton_data) {
            this.reset_effect.skeletonData = skeleton_data;
            this.reset_effect.setAnimation(1, PlayerAction.action, true);
        }.bind(this))
        this.camp_btns = {};
        for (var camp_i = 0; camp_i < 6; camp_i++) {
            this.camp_btns[camp_i] = this.camp_node_nd.getChildByName("camp_btn" + camp_i);
            this.camp_btns[camp_i].camp_tag = camp_i;
            var camp_sp = this.camp_btns[camp_i].getComponent(cc.Sprite);
            this.camp_btns[camp_i].on(cc.Node.EventType.TOUCH_END, this.didClickCamp, this);
        }

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.putin_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickPutinBtn, this);
        this.disband_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickDisbandBtn, this);
        this.partner_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickPartnerBtn, this);
        this.tip_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTipBtn, this);
        this.look_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLookBtn, this);

        // this.bigbg_56_1 = this.seekChild("bigbg_56_1",cc.Sprite);
        // this.loadRes(PathTool.getBigBg("bigbg_62"),function(sp){
        //     this.bigbg_56_1.spriteFrame = sp;
        // }.bind(this))

        this.initHeroList();
    },


    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        // 删除英雄
        this.addGlobalEvent(HeroEvent.Del_Hero_Event, function(hero_list) {
            this.select_heros = [];
            this.updateCamp();
            this.input_count_lb.string = Utils.TI18N("已放入英雄:") + "0/" + this.select_max_count;
            this.is_send_proto = false;
        }.bind(this))
        this.addGlobalEvent(BackpackEvent.ADD_GOODS, function(bag_code, add_list) {
            if (bag_code != BackPackConst.Bag_Code.BACKPACK) {
                return
            }
            if (!add_list || Utils.next(add_list) == null || this.select_index != HeroConst.SacrificeType.eChipSacrifice) return
            let need_update = false
            for (let i in add_list) {
                let v = add_list[i];
                if (v.config && v.config.sub_type == BackPackConst.item_tab_type.HERO) {
                    need_update = true
                    break
                }
            }
            if (need_update) {
                this.chipListCamp()
            }
        }.bind(this))
        this.addGlobalEvent(BackpackEvent.DELETE_GOODS, function(bag_code, del_list) {
            this.is_send_proto = false
            if (bag_code != BackPackConst.Bag_Code.BACKPACK) {
                return
            }
            if (!del_list || Utils.next(del_list) == null || this.select_index != HeroConst.SacrificeType.eChipSacrifice) return
            let need_update = false
            for (let i in del_list) {
                let v = del_list[i];
                if (BackPackConst.item_tab_type.HERO == v.config.sub_type) {
                    need_update = true
                    break
                }
            }
            if (need_update) {
                this.chipListCamp()
            }
        }.bind(this))
        this.addGlobalEvent(BackpackEvent.MODIFY_GOODS_NUM, function(bag_code, change_list) {
            this.is_send_proto = false
            if (bag_code != BackPackConst.Bag_Code.BACKPACK) {
                return
            }
            if (!change_list || Utils.next(change_list) == null || this.select_index != HeroConst.SacrificeType.eChipSacrifice) return
            let need_update = false
            for (let i in change_list) {
                let v = change_list[i];
                if (v.config && BackPackConst.item_tab_type.HERO == v.config.sub_type) {
                    need_update = true
                    break
                }
            }
            if (need_update) {
                this.chipListCamp()
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(index) {
        this.select_index = index || HeroConst.SacrificeType.eHeroSacrifice;
        this.tab_list[this.select_index].toggle.check()
        if (this.select_index == HeroConst.SacrificeType.eHeroSacrifice) {
            this.changeSelectedTab(this.select_index)
        }
        // this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        if (this.item_scrollview)
            this.item_scrollview.deleteMe();
        this.ctrl.openHeroResetWindow(false);
    },

    updateWidgets: function() {
        // var effect_name = PathTool.getEffectRes(548);
        // var effect_path = PathTool.getSpinePath(effect_name);
        // this.loadRes(effect_path, function(anima_sd) {
        //     this.anima_sk.skeletonData = anima_sd;
        //     this.anima_sk.setAnimation(0, "action1", true);
        // }.bind(this));

        this.updateCamp();
    },

    didClickCamp: function(event) {
        var cur_camp = event.target.camp_tag;
        if (cur_camp === this.cur_camp) return;
        this.cur_camp = cur_camp;
        this.img_select_nd.parent = this.camp_btns[cur_camp];
        if (this.select_index == HeroConst.SacrificeType.eHeroSacrifice) {
            this.updateCamp();
        } else if (this.select_index == HeroConst.SacrificeType.eChipSacrifice) {
            this.chipListCamp()
        }

    },

    onClickCloseBtn: function(event) {
        Utils.playButtonSound(2)
        this.ctrl.openHeroResetWindow(false);
    },

    initHeroList: function() {
        var CommonScrollView = require("common_scrollview");
        var scroll_view_size = cc.size(this.hero_list_nd.width, this.hero_list_nd.height)
        var setting = {
            item_class: "hero_exhibition_item", // 单元类
            start_x: 0, // 第一个单元的X起点
            space_x: 0, // x方向的间隔
            start_y: 4, // 第一个单元的Y起点
            space_y: 0, // y方向的间隔
            item_width: 125, // 单元的尺寸width
            item_height: 122, // 单元的尺寸height
            col: 5, // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.hero_list_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5));
    },

    updateCamp: function() {
        this.cur_role_list = Utils.deepCopy(this.model.getRestHeroListByCamp(this.cur_camp));
        this.hero_count_lb.string = Utils.TI18N("可献祭英雄:") + this.cur_role_list.length;

        if (this.cur_role_list.length > 0) {
            this.no_vedio_image_nd.active = false;
        } else {
            this.no_vedio_image_nd.active = true;
            this.tips_lb.string = Utils.TI18N("暂无可献祭英雄");
        }

        // 检查是否选中
        for (var hero_i = 0; hero_i < this.cur_role_list.length; ++hero_i) {
            for (var selec_hero_i = 0; selec_hero_i < this.select_heros.length; ++selec_hero_i) {
                if (this.select_heros[selec_hero_i].partner_id === this.cur_role_list[hero_i].partner_id) {
                    this.cur_role_list[hero_i].is_ui_select = true;
                    break;
                }
            }
        }
        this.item_scrollview.addEndCallBack(function() {
            let list = this.item_scrollview.getItemList();
            for (let i = 0; i < list.length; ++i) {
                let v = list[i]
                v.showChipIcon(false)
            }
        }.bind(this))
        this.item_scrollview.space_y = 0;
        this.item_scrollview.setData(this.cur_role_list, this.onClickHeroExhibiton.bind(this), { scale: 0.9, can_click: true, from_type: HeroConst.ExhibitionItemType.eHeroReset });
        this.input_count_lb.string = Utils.TI18N("已放入英雄:") + "0/" + this.select_max_count;
    },

    onClickHeroExhibiton: function(hero_item) {
        if (this.is_send_proto) return
        var hero_vo = hero_item.data;
        // if (hero_vo.star > 6) {
        //     message(Utils.TI18N("7星及以上英雄无法献祭"))
        //     return
        // } else {
        var result = hero_vo.checkHeroLockTips(true);
        if (result) return;
        // }

        this.selectHero(hero_item.data);
    },

    selectHero: function(hero_vo) {
        if (!hero_vo) return;

        var select_index = -1;
        for (var hero_i in this.select_heros) {
            if (this.select_heros[hero_i].partner_id == hero_vo.partner_id) {
                select_index = hero_i;
                break;
            }
        }

        if (select_index > -1) {
            var hero_index = this.getListIndex(hero_vo.partner_id);
            if (this.cur_role_list[hero_index]) {
                this.cur_role_list[hero_index].is_ui_select = false;
                this.item_scrollview.updateItemData(hero_index, this.cur_role_list[hero_index]);
            }
            this.select_heros.splice(select_index, 1);
        } else {
            if (this.select_heros.length < this.select_max_count) {
                this.select_heros.push(hero_vo);
                var hero_index = this.getListIndex(hero_vo.partner_id);
                if (this.cur_role_list[hero_index]) {
                    this.cur_role_list[hero_index].is_ui_select = true;
                    this.item_scrollview.updateItemData(hero_index, this.cur_role_list[hero_index]);
                }
            } else {
                message(cc.js.formatStr(Utils.TI18N("每次最多可献祭%d个英雄"), this.select_max_count));
            }
        }

        this.input_count_lb.string = Utils.TI18N("已放入英雄:") + this.select_heros.length + "/" + this.select_max_count;
    },

    getListIndex: function(partner_id) {
        for (var role_i in this.cur_role_list) {
            if (this.cur_role_list[role_i].partner_id === partner_id)
                return role_i;
        }
        return -1;
    },

    onClickPutinBtn: function() {
        Utils.playButtonSound(1)
        if (this.select_heros.length >= this.select_max_count) {
            message(cc.js.formatStr(Utils.TI18N("每次最多可献祭%d个英雄"), this.select_max_count));
            return
        }
        var select_index = 0;
        var cur_select = [];
        while (this.select_heros.length < this.select_max_count) {
            if (select_index == this.cur_role_list.length)
                break;
            var hero_vo = this.checkHero(select_index);

            if (hero_vo) {
                this.select_heros.push(hero_vo);
                cur_select.push(hero_vo);
            }

            select_index++;
        }

        for (var hero_i in cur_select) {
            var list_index = this.getListIndex(cur_select[hero_i].partner_id);
            if (this.cur_role_list[list_index]) {
                this.cur_role_list[list_index].is_ui_select = true;
                this.item_scrollview.updateItemData(list_index, this.cur_role_list[list_index]);
            }
        }
        this.input_count_lb.string = Utils.TI18N("已放入英雄:") + this.select_heros.length + "/" + this.select_max_count;

        if (this.select_heros.length == 0) {
            message(Utils.TI18N("暂无可放入的英雄"));
        }
    },

    checkHero: function(index) {
        if (this.cur_role_list[index]) {
            var have_select = false;
            for (var heor_i in this.select_heros) {
                if (this.cur_role_list[index].partner_id === this.select_heros[heor_i].partner_id) {
                    have_select = true;
                    break
                }
            }
            if (!have_select && 　this.cur_role_list[index].star　 < 4 && this.cur_role_list[index].is_in_form <= 0)
                return this.cur_role_list[index];
        }
        return null;
    },

    onClickDisbandBtn: function(event) {
        Utils.playButtonSound(1)
        if (this.is_send_proto) return
        if (this.select_heros.length > 0) {
            this.hero_list_info = [];
            let is_show_tip = false
            for (var hero_i = 0; hero_i < this.select_heros.length; ++hero_i) {
                var partner_data = {};
                let v = this.select_heros[hero_i]
                partner_data.partner_id = v.partner_id;
                if (v.star >= 5) {
                    is_show_tip = true
                }
                this.hero_list_info.push(partner_data);
            }

            if (this.hero_list_info.length > 0) {
                this.ctrl.openHeroResetOfferPanel(true, this.hero_list_info, is_show_tip, this.onCloseOfferPanel.bind(this), HeroConst.ResetType.eHeroReset);
            }
        } else {
            message(Utils.TI18N("没有选中英雄"));
        }
    },

    onCloseOfferPanel: function() {
        // this.anima_sk.setAnimation(0, "action2", false);
        if (this.is_send_proto) return
        this.reset_effect.setAnimation(0, PlayerAction.action_2, false)
        this.playEffect()
        this.is_send_proto = true;
        Utils.delayRun(this.main_panel_nd, 1.2, function() {
            this.ctrl.sender11076(this.hero_list_info);
        }.bind(this))

    },

    onAnimaFinish: function(track_data) {
        if (track_data && track_data.animation) {
            if (track_data.animation.name == PlayerAction.action_2) {
                this.reset_effect.setAnimation(0, PlayerAction.action_1, true);
            }
        }
    },

    requestReset: function() {
        this.ctrl.sender11076(this.hero_list_info);
    },

    onClickPartnerBtn: function() {
        Utils.playButtonSound(1)
        MallController.getInstance().openMallPanel(true, MallConst.MallType.Recovery);
    },

    onClickTipBtn: function(event) {
        Utils.playButtonSound(1)
        var tip_des = Config.partner_data.data_partner_const.game_rule1.desc;
        require("tips_controller").getInstance().showCommonTips(tip_des, event.touch.getLocation());
    },

    onClickLookBtn: function() {
        Utils.playButtonSound(1)
        if (this.select_heros.length > 0) {
            var hero_list_info = [];
            for (var hero_i = 0; hero_i < this.select_heros.length; ++hero_i) {
                var partner_data = {};
                partner_data.partner_id = this.select_heros[hero_i].partner_id;
                hero_list_info.push(partner_data);
            }

            if (hero_list_info.length > 0) {
                this.ctrl.openHeroResetReturnPanel(true, hero_list_info);
            }
        } else {
            message(Utils.TI18N("没有选中英雄"));
        }
    },
    changeSelectedTab(index) {
        this.select_index = index
        this.cur_camp = 0;
        this.img_select_nd.parent = this.camp_btns[0];
        this.show_list = [];
        this.select_heros = [];
        if (index == HeroConst.SacrificeType.eHeroSacrifice) {
            this.hero_tab.active = true;
            this.debris_tab.active = false;
            this.look_btn_nd.active = true;
            this.updateCamp();
        } else if (index == HeroConst.SacrificeType.eChipSacrifice) {
            this.hero_tab.active = false;
            this.debris_tab.active = true;
            this.hero_count_lb.string = Utils.TI18N("选择一种碎片后,请再选择数量")
            this.look_btn_nd.active = false;
            this.selectChipIndex = -1;
            this.chipListCamp()
            this.buttonReset()
        }
    },
    buttonReset() {
        this.resolve_count_lb.string = "0";
        this.checkBtnState()
    },
    chipListCamp() {
        let chipID
        if (this.selectChipIndex != -1) {
            // 只是刷新
            let index = this.selectChipIndex
            chipID = this.show_list[index].id
            this.selectChipIndex = -1
        }
        let data = this.getChipListByCamp(this.cur_camp)
        this.show_list = Utils.deepCopy(data);
        if (this.show_list.length > 0) {
            this.no_vedio_image_nd.active = false;
        } else {
            this.no_vedio_image_nd.active = true;
            this.tips_lb.string = Utils.TI18N("暂无可献祭碎片")
        }
        if (chipID != null) {
            for (let i = 0; i < this.show_list.length; ++i) {
                if (this.show_list[i].id == chipID) {
                    this.selectChipIndex = i;
                    this.show_list[i].is_ui_select = true;
                    this.chipMaxNum = this.show_list[i].total_count
                    break
                }
            }
            // if(this.selectChipIndex == -1){
            //     this.chipMaxNum = 0;
            // }
            this.buttonReset()
        }
        this.item_scrollview.addEndCallBack(function() {
            let list = this.item_scrollview.getItemList();
            for (let i = 0; i < list.length; ++i) {
                let v = list[i]
                v.showChipIcon(true)
            }
        }.bind(this))
        this.item_scrollview.space_y = 10;
        this.item_scrollview.setData(this.show_list, this.selectChip.bind(this), { scale: 0.9, can_click: true, from_type: HeroConst.ExhibitionItemType.eHeroFuse })

    },
    //获取碎片信息
    getChipListByCamp(select_camp) {
        // --碎片获取以后优化
        let hero_chip_list = BackpackController.getInstance().getModel().getAllBackPackArray(BackPackConst.item_tab_type.HERO) || []
        let show_list = []
        let cur_select_chip_data = null
        let partner_config = Config.partner_data.data_get_compound_info
        for (let i = 0; i < hero_chip_list.length; ++i) {
            let v = hero_chip_list[i]
            let config = v.config
            if (config && (select_camp == 0 || select_camp == config.lev)) {
                let data = {}
                data.id = v.id
                data.bid = 0
                data.need_count = partner_config[v.base_id].num
                data.base_id = config.id
                data.star = config.eqm_jie //--星级
                data.camp_type = config.lev //--阵营
                data.icon = config.icon //--图片
                data.total_count = v.quantity
                data.quality = v.quality
                data.config = config
                let status = BackpackController.getInstance().getModel().checkHeroChipRedPoint(v)
                if (status) { //可以合成
                    data.sort_order = 1
                } else {
                    data.sort_order = 0
                }
                if (v.quantity > 0) {
                    show_list.push(data)
                }
                // --查找已经选中
                if (this.select_chip_data && this.select_chip_data.id == data.id) {
                    cur_select_chip_data = data
                }
            }
        }

        let sort_func = Utils.tableCommonSorter([
            ["sort_order", true],
            ["quality", true],
            ["base_id", false]
        ])
        show_list.sort(sort_func)
        return show_list
    },
    selectChip(hero_vo) {
        if (this.is_send_proto) return;
        if (!hero_vo) return;
        if (this.selectChipIndex != null && this.selectChipIndex > -1 && this.show_list[this.selectChipIndex].base_id != hero_vo.getData().base_id) {
            this.show_list[this.selectChipIndex].is_ui_select = !this.show_list[this.selectChipIndex].is_ui_select;
            this.item_scrollview.updateItemData(this.selectChipIndex, this.show_list[this.selectChipIndex]);
        }
        let select_index = -1;
        for (var hero_i = 0; hero_i < this.show_list.length; ++hero_i) {
            if (this.show_list[hero_i].base_id == hero_vo.getData().base_id) {
                this.show_list[hero_i].is_ui_select = !this.show_list[hero_i].is_ui_select;
                this.item_scrollview.updateItemData(hero_i, this.show_list[hero_i]);
                if (this.show_list[hero_i].is_ui_select) {
                    select_index = hero_i;
                }
                break;
            }
        }
        this.selectChipIndex = select_index;
        if (select_index == -1) {
            this.buttonReset()
        } else {
            let max = hero_vo.getData().total_count
            this.setChipCount(max)
        }

    },
    setChipCount(num) {
        this.chipMaxNum = num;
        this.resolve_count_lb.string = "1";
        this.max_btn.interactable = true;
        this.max_btn.enableAutoGrayEffect = false;
        this.max_lb.enabled = true;
        this.checkBtnState()
    },
    onClickBtnMax() {
        this.resolve_count_lb.string = this.chipMaxNum;
        this.checkBtnState()
    },
    onClickBtnAdd() {
        let num = Number(this.resolve_count_lb.string);
        num += 1
        this.resolve_count_lb.string = num;
        this.checkBtnState()
    },
    onClickBtnRedu() {
        let num = Number(this.resolve_count_lb.string);
        num -= 1
        this.resolve_count_lb.string = num;
        this.checkBtnState()
    },
    checkBtnState() {
        let num = Number(this.resolve_count_lb.string)
        if (this.selectChipIndex == -1) {
            this.redu_btn.interactable = false;
            this.redu_btn.enableAutoGrayEffect = true;
            this.add_btn.interactable = false;
            this.add_btn.enableAutoGrayEffect = true;
            this.max_btn.interactable = false;
            this.max_btn.enableAutoGrayEffect = true;
            this.redu_lb.enabled = false;
            this.add_lb.enabled = false;
            this.max_lb.enabled = false;
        } else if (num <= 0) {
            this.redu_btn.interactable = false;
            this.redu_btn.enableAutoGrayEffect = true;
            this.redu_lb.enabled = false;
            this.add_btn.interactable = true;
            this.add_btn.enableAutoGrayEffect = false;
            this.add_lb.enabled = true
        } else if (num >= this.chipMaxNum) {
            this.redu_btn.interactable = true;
            this.redu_btn.enableAutoGrayEffect = false;
            this.redu_lb.enabled = false;
            this.add_btn.interactable = false;
            this.add_btn.enableAutoGrayEffect = true;
            this.add_lb.enabled = false;
        } else {
            this.redu_btn.interactable = true;
            this.redu_btn.enableAutoGrayEffect = false;
            this.redu_lb.enabled = true;
            this.add_btn.interactable = true;
            this.add_btn.enableAutoGrayEffect = false;
            this.add_lb.enabled = true;
        }
    },
    onDisbandChip() {
        Utils.playButtonSound(1)
        if (this.is_send_proto) return
        if (this.selectChipIndex == -1) {
            message(Utils.TI18N("没有选中英雄碎片"))
            return
        }
        let count = Number(this.resolve_count_lb.string)
        if (count <= 0) {
            message(Utils.TI18N("没有放入英雄碎片"))
            return
        }
        if (count > this.chipMaxNum) {
            message(Utils.TI18N("超过已拥有碎片上限"))
            return
        }
        let data = this.show_list[this.selectChipIndex]
        let config = data.config
        let is_show_tip = data.sort_order == 1;
        let color = BackPackConst.getWhiteQualityColorStr(config.quality)
        let item_list = []
        for (let i = 0; i < config.value.length; ++i) {
            let v = config.value[i];
            let id = v[0]
            let num = v[1] || 0
            num = num * count
            if (id != null) {
                item_list.push({ id: id, num: num })
            }
        }
        let sell_data = { id: data.id, bid: data.base_id, num: count }
        if (item_list.length) {
            let str = cc.js.formatStr(Utils.TI18N("本次分解 <color=#289b14>%s</color> 个<color=%s>【%s】</color>可获得以下资源:"), count, color, config.name)
            this.ctrl.openHeroResetOfferPanel(true, item_list, is_show_tip, function() {
                this.reset_effect.setAnimation(0, PlayerAction.action_2, false)
                this.playEffect()
                this.is_send_proto = true;
                Utils.delayRun(this.main_panel_nd, 1.2, function() {
                    BackpackController.getInstance().sender10522(BackPackConst.Bag_Code.BACKPACK, [sell_data]);
                }.bind(this))
            }.bind(this), HeroConst.ResetType.eChipReset, str);
        }
    },
    // --播放火花的效果
    playEffect() {
        Utils.playButtonSound("c_sacrifice");
        if (this.play_effect2 == null) {
            this.play_effect2 = this.seekChild("play_effect2", sp.Skeleton);
            let sketon_path = PathTool.getSpinePath("E24122", "action");
            this.loadRes(sketon_path, function(skeleton_data) {
                this.play_effect2.skeletonData = skeleton_data;
                this.play_effect2.setAnimation(0, PlayerAction.action, false);
            }.bind(this))
        } else {
            this.play_effect2.setAnimation(0, PlayerAction.action, false);
        }
    }
})