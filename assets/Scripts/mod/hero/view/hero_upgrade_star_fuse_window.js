// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-01 17:30:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const");
var BaseRole = require("baserole");
var HeroEvent = require("hero_event");
var HeroController = require("hero_controller");
var HeroCalculate = require("hero_calculate");

var Hero_upgrade_star_fuseWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_upgrade_star_fuse_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.attr_list = { "1": "atk", "2": "hp", "3": "def", "4": "speed" };
        this.cur_camp = 0;
        this.dic_other_selected = {}; // 记录已选id
        this.heroBid = 0; //跳转过来 
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/main_panel/lab_hero_tips", this.root_wnd, cc.Label).string = Utils.TI18N("可合成的英雄");
        Utils.getNodeCompByPath("main_container/main_panel/synthesis_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("合 成");
        Utils.getNodeCompByPath("main_container/main_panel/no_vedio_image/no_vedio_label", this.root_wnd, cc.Label).string = Utils.TI18N("挑戦記録なし");
        this.camp_node_nd = this.seekChild("camp_node");
        this.img_select_nd = this.seekChild("img_select");
        this.hero_list_nd = this.seekChild("hero_list");
        this.no_vedio_image_nd = this.seekChild("no_vedio_image");
        this.synthesis_btn_nd = this.seekChild("synthesis_btn");
        this.explain_btn_nd = this.seekChild("explain_btn");

        // star
        this.star_containder_nd = this.seekChild("star_containder");
        this.star_item_nd = this.seekChild("star_item");

        // info
        this.camp_icon_sp = this.seekChild("camp_icon", cc.Sprite);
        this.name_lb = this.seekChild("name", cc.Label);
        this.hero_camp_bg_sp = this.seekChild("hero_camp_bg", cc.Sprite);
        this.hero_background_sp = this.seekChild("hero_background", cc.Sprite);
        this.mode_node_nd = this.seekChild("mode_node");
        this.level_txt_lb = this.seekChild("level_txt", cc.Label);
        this.look_btn_nd = this.seekChild("look_btn");

        this.btn_red_nd = this.seekChild("btn_red");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.hero_model = new BaseRole();
        this.hero_model.setParent(this.mode_node_nd);

        this.close_btn_nd       = this.seekChild("close_btn");
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, function(event){
          Utils.playButtonSound(ButtonSound.Close);
          this.ctrl.openHeroUpgradeStarFuseWindow(false);
        }.bind(this));

        this.camp_btns = {};
        for (var camp_i = 0; camp_i < 6; camp_i++) {
            this.camp_btns[camp_i] = this.camp_node_nd.getChildByName("camp_btn" + camp_i);
            this.camp_btns[camp_i].camp_tag = camp_i;
            var camp_sp = this.camp_btns[camp_i].getComponent(cc.Sprite);
            this.camp_btns[camp_i].on(cc.Node.EventType.TOUCH_END, this.didClickCamp, this);
        }

        this.attr_lbs = {};
        for (var attr_i = 1; attr_i <= 4; attr_i++) {
            this.attr_lbs[attr_i] = this.seekChild("attr_label" + attr_i, cc.Label);
        }

        this.hero_items = {};
        for (let hero_i = 1; hero_i <= 4; hero_i++) {
            var item_scale = 1;
            if (hero_i > 1)
                item_scale = 0.8;
            var hero_root = this.seekChild("hero_root_" + hero_i);
            var hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
            hero_item.setParent(hero_root);
            hero_item.setScale(item_scale);
            hero_item.setExtendData({ from_type: HeroConst.ExhibitionItemType.eUpStar, scale: item_scale });
            hero_item.show();
            hero_item.addCallBack(function(item) {
                this.onClickHeroItem(item, hero_i)
            }.bind(this));
            // hero_item.addCallBack(this.onClickHeroItem.bind(this));
            this.hero_items[hero_i] = hero_item;
        }

        this.synthesis_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickSynBtn.bind(this), this);
        this.look_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLookBtn, this);
        this.explain_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickExplainBtn, this);
        this.initHeroList();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        // 新增英雄
        this.addGlobalEvent(HeroEvent.Hero_Data_Add, function() {
            this.updateWidgets();
            this.updateCamp(true);
        }.bind(this));

        // 删除英雄
        this.addGlobalEvent(HeroEvent.Del_Hero_Event, function(hero_list) {
            this.updateWidgets();
            this.updateCamp(true);
        }.bind(this))

        // 升星成功
        this.addGlobalEvent(HeroEvent.Hero_Data_Update, function(hero_vo) {
            this.updateWidgets();
        }.bind(this))


    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.hero_vo = params;
        if (params) {
            this.heroBid = params.bid
        }
        this.updateCamp();
        this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        this.cleanSelects();

        if (this.item_scrollview)
            this.item_scrollview.deleteMe();
        this.item_scrollview = null;
        if (this.hero_model) {
            this.hero_model.deleteMe()
            this.hero_model = null;
        }
        if (this.hero_items) {
            for (let i in this.hero_items) {
                if (this.hero_items[i]) {
                    this.hero_items[i].deleteMe()
                    this.hero_items[i] = null;
                }
            }
            this.hero_items = null;
        }
        this.ctrl.openHeroUpgradeStarFuseWindow(false);
    },

    cleanSelects: function() {
        for (var select_i in this.dic_other_selected) {
            var heros = this.dic_other_selected[select_i];
            for (var hero_i in heros) {
                heros[hero_i].is_ui_select = false;
                heros[hero_i].is_ui_lock = false;
            }
        }
    },

    updateWidgets: function() {
        if (!this.hero_vo)
            this.hero_vo = this.fuse_list[0];
        if (!this.hero_vo) return;
        this.hero_cfg = this.hero_vo.base_config;

        // 背景
        var camp_type = this.hero_vo.camp_type || HeroConst.CampType.eWater;
        var bg_res = PathTool.getUIIconPath("bigbg/hero", HeroConst.CampBgRes[camp_type]);
        if (!this.bg_res || this.bg_res !== bg_res) {
            this.loadRes(bg_res, function(bg_sf) {
                this.hero_background_sp.spriteFrame = bg_sf;
            }.bind(this));
            this.bg_res = bg_res;
        }

        // 阵容背景
        var camp_bg_path = PathTool.getUIIconPath("bigbg/hero", HeroConst.CampBottomBgRes[camp_type]);
        this.loadRes(camp_bg_path, function(camp_bg_sf) {
            this.hero_camp_bg_sp.spriteFrame = camp_bg_sf;
        }.bind(this));

        // 动画
        this.hero_model.setData(BaseRole.type.partner, this.hero_vo, PlayerAction.show, true);
        this.updateStars(this.hero_vo.star);
        this.name_lb.string = this.hero_cfg.name;

        // fuse_data.camp_type
        // cc.log("HHHHHHHHHHHHHHHHHHHHH");
        // cc.log(this.hero_cfg);

        var camp_res = PathTool.getHeroCampRes(this.hero_cfg.camp_type);
        var common_res_path = PathTool.getUIIconPath("common", camp_res);
        this.loadRes(common_res_path, function(sf_obj) {
            this.camp_icon_sp.spriteFrame = sf_obj;
        }.bind(this))

        // 属性
        var attr_key = this.hero_vo.bid + "_" + this.hero_vo.star;
        var show_list = this.model.getHerofuseByBid(attr_key);
        if (show_list) {
            this.level_txt_lb.string = Utils.TI18N("Lv：" + show_list.lev);
            for (var attr_i in this.attr_list) {
                this.attr_lbs[attr_i].string = show_list[this.attr_list[attr_i]];
            }
        }

        // 合成材料
        this.updateHeroItems();
        this.show_hero_vo = this.model.getHerofuseByBid(this.hero_vo.bid + "_" + this.hero_vo.star);

        // this.updateCamp();
        this.updateCampRedpoint();
    },

    updateHeroItems: function() {
        this.dic_other_selected = {};
        this.hero_item_data_list = {};
        // 指定的 {10402,4,1} : 10402: 表示bid, 4: 表示星级 1:表示数量
        var expend1 = this.hero_vo.star_config.expend1;
        // 指定的 {10402,4,1} : 10402: 表示bid, 4: 表示星级 1:表示数量
        var expend2 = this.hero_vo.star_config.expend2;
        // 随机的 {1,4,2} : 1 表示阵营  4: 表示星级 2表示数量
        var expend3 = this.hero_vo.star_config.expend3;

        var conditions_list = this.conditions_list = {};
        var expend_index = 1;
        for (var expend_i in expend1) {
            this.dic_other_selected[expend_index] = [];
            this.hero_item_data_list[expend_index] = this.getHeroData(expend1[expend_i][0], expend1[expend_i][1], expend1[expend_i][2], null, expend_index);
            conditions_list[expend_index] = {};
            conditions_list[expend_index][expend1[expend_i][0]] = {};
            conditions_list[expend_index][expend1[expend_i][0]][expend1[expend_i][1]] = expend1[expend_i][2];
            expend_index++;
        }

        for (var expend_i in expend2) {
            this.dic_other_selected[expend_index] = [];
            this.hero_item_data_list[expend_index] = this.getHeroData(expend2[expend_i][0], expend2[expend_i][1], expend2[expend_i][2], null, expend_index);
            conditions_list[expend_index] = {};
            conditions_list[expend_index][expend2[expend_i][0]] = {};
            conditions_list[expend_index][expend2[expend_i][0]][expend2[expend_i][1]] = expend2[expend_i][2];
            expend_index++;
        }

        for (var expend_i in expend3) {
            this.dic_other_selected[expend_index] = [];
            this.hero_item_data_list[expend_index] = this.getHeroData(null, expend3[expend_i][1], expend3[expend_i][2], expend3[expend_i][0], expend_index);
            conditions_list[expend_index] = {};
            conditions_list[expend_index][expend3[expend_i][0]] = {};
            conditions_list[expend_index][expend3[expend_i][0]][expend3[expend_i][1]] = expend3[expend_i][2];
            expend_index++;
        }

        for (var hero_item_i in this.hero_items) {
            var hero_vo = this.hero_item_data_list[hero_item_i];
            if (hero_vo) {
                this.hero_items[hero_item_i].setVisible(true);
                this.hero_items[hero_item_i].setData(hero_vo);
                if (hero_vo.bid === 0) {
                    // 随机卡头像
                    var default_head_id = this.model.getRandomHeroHeadByQuality(hero_vo.star);
                    var default_head_path = PathTool.getIconPath("item", default_head_id);
                    this.hero_items[hero_item_i].setDefaultHead(default_head_path);
                }
            } else {
                this.hero_items[hero_item_i].setVisible(false);
            }
        }

        this.initHeroListByMatchInfo(conditions_list);
        this.updateCentreHeroItemRedPoint();
    },

    getHeroData: function(bid, star, count, camp_type, need_index) {
        // 模拟 hero_vo 需要的数据
        var data = {};
        data.star = star || 0;
        data.count = count || 0;
        data.need_index = need_index;
        data.select_count = this.dic_other_selected[need_index].length;
        data.lev = cc.js.formatStr("%s/%s", data.select_count, count);
        data.head_gray = true;
        if (!bid) {
            data.bid = 0; //表示随机卡
            data.camp_type = camp_type;
        } else {
            var base_config = Config.partner_data.data_partner_base[bid]
            if (base_config) {
                data.bid = bid;
                data.camp_type = base_config.camp_type;
            } else {
                return null;
            }
        }

        // 当前选中的英雄列表 [id] == hero_vo 模式
        data.dic_select_list = {}
        return data
    },

    didClickCamp: function(event) {
        var cur_camp = event.target.camp_tag;
        if (cur_camp === this.cur_camp) return;
        this.cur_camp = cur_camp;
        this.img_select_nd.parent = this.camp_btns[cur_camp];
        this.updateCamp();
    },

    initHeroList: function() {
        var CommonScrollView = require("common_scrollview");
        var scroll_view_size = cc.size(this.hero_list_nd.width, this.hero_list_nd.height)
        var setting = {
            item_class: "hero_exhibition_item", // 单元类
            start_x: 0, // 第一个单元的X起点
            space_x: 0, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: 0, // y方向的间隔
            item_width: 125, // 单元的尺寸width
            item_height: 150, // 单元的尺寸height
            col: 5, // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.hero_list_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5));
    },

    onClickHeroExhibiton: function(hero_item) {
        if (hero_item && hero_item.data) {
            if (!this.hero_vo || this.hero_vo.bid != hero_item.data.bid) {
                this.cleanSelects();
                this.hero_vo = hero_item.data;
                this.updateWidgets();
            }
        }
    },

    updateCamp: function(is_select) {
        this.fuse_list = this.model.getStarFuseList(this.cur_camp);

        if (this.fuse_list.length > 0) {
            this.no_vedio_image_nd.active = false;
        } else {
            this.no_vedio_image_nd.active = true;
        }

        for (var hero_i = 0; hero_i < this.fuse_list.length; ++hero_i) {
            HeroCalculate.getInstance().checkSingleStarFuseRedPoint(this.fuse_list[hero_i]);
        }

        // 排序
        var hero_sort = function(role_vo1, role_vo2) {
            var proportion1 = role_vo2.total_count / role_vo2.need_count;
            var proportion2 = role_vo1.total_count / role_vo1.need_count;
            if (proportion1 === proportion2) {
                if (role_vo2.camp_type === role_vo1.camp_type) {
                    if (role_vo2.star == role_vo1.star) {
                        return role_vo1.bid - role_vo2.bid
                    } else {
                        return role_vo1.star - role_vo2.star
                    }
                } else {
                    return role_vo1.camp_type - role_vo2.camp_type
                }
            } else {
                return proportion1 - proportion2;
            }
        }

        this.fuse_list.sort(hero_sort);

        // 设置第一英雄为选中
        if (!is_select) {
            if (this.heroBid) {
                for (let i = 0; i < this.fuse_list.length; ++i) {
                    if (this.fuse_list[i].bid == this.heroBid) {
                        this.hero_vo = this.fuse_list[i];
                        break
                    }
                }
                this.heroBid = 0;
            } else {
                var cur_hero = this.fuse_list[0];
                if (!this.hero_vo || this.hero_vo.bid != cur_hero.bid) {
                    this.hero_vo = cur_hero;
                }
            }
            this.updateWidgets();
        }
        this.item_scrollview.setData(this.fuse_list, this.onClickHeroExhibiton.bind(this), { can_click: true, from_type: HeroConst.ExhibitionItemType.eHeroFuse });
    },

    updateStars: function(star_num) {
        var star_res = "";
        var star_scal = 1;
        this.star_containder_nd.removeAllChildren();
        this.star_containder_nd.width = 0;
        if (star_num > 0 && star_num <= 5) {
            star_res = "common_90074";
        } else if (star_num > 5 && star_num <= 9) {
            star_num = star_num - 5;
            star_res = "common_90075";
        } else if (star_num > 9) {
            star_num = 1;
            star_res = "common_90073";
            star_scal = 1.2;
        }

        for (var star_i = 0; star_i < star_num; star_i++) {
            var star_nd = cc.instantiate(this.star_item_nd);
            star_nd.scale = star_scal;
            var star_sp = star_nd.getComponent(cc.Sprite);
            var common_res_path = PathTool.getUIIconPath("common", star_res);
            this.loadRes(common_res_path, function(star_sp, sf_obj) {
                star_sp.spriteFrame = sf_obj;
            }.bind(this, star_sp))

            this.star_containder_nd.addChild(star_nd);
        }
    },

    onClickHeroItem: function(hero_item, index) {
        cc.log(index)
        this.ctrl.openHeroUpgradeStarSelectPanel(true, hero_item.data, this.dic_other_selected, 1, index == 1, this.updateNeedHero.bind(this));
    },

    // 更新英雄材料
    updateNeedHero: function(select_info) {
        this.dic_other_selected = select_info;
        this.updateSelectInfo();
        this.updateCentreHeroItemRedPoint();
    },

    updateSelectInfo: function(select_info) {
        for (var dic_i in this.dic_other_selected) {
            var cur_item_data = this.hero_item_data_list[dic_i];
            cur_item_data.select_count = this.dic_other_selected[dic_i].length;
            cur_item_data.lev = cc.js.formatStr("%s/%s", cur_item_data.select_count, cur_item_data.count);

            if (this.dic_other_selected[dic_i].length > 0) {
                cur_item_data.head_gray = false;
            } else {
                cur_item_data.head_gray = true;
            }
            this.hero_items[dic_i].setData(cur_item_data);
        }
    },

    // 英雄材料
    isHeroEnough: function() {
        for (var need_i in this.hero_item_data_list) {
            if (this.hero_item_data_list[need_i].select_count < this.hero_item_data_list[need_i].count)
                return false
        }

        return true;
    },

    // 整理合成数据
    getNeedHeroInfo: function() {
        var hero_list = [];
        var random_list = [];

        for (var need_i in this.hero_item_data_list) {
            if (need_i > 1) {
                var need_data = this.hero_item_data_list[need_i];
                var select_vos = this.dic_other_selected[need_i];

                for (var hero_i in select_vos) {
                    var hero_data = {};
                    hero_data.partner_id = select_vos[hero_i].partner_id;
                    if (need_data.bid === 0) {
                        random_list.push(hero_data);
                    } else {
                        hero_list.push(hero_data);
                    }
                }
            }
        }

        return { hero_list: hero_list, random_list: random_list };
    },

    onClickSynBtn: function() {
        // var request_data = this.getNeedHeroInfo();
        // var syn_partner_id = this.dic_other_selected[1][0].partner_id;

        if (!this.isHeroEnough()) {
            message(Utils.TI18N("所需材料不足"));
        } else {
            var request_data = this.getNeedHeroInfo();
            var syn_partner_id = this.dic_other_selected[1][0].partner_id;
            if (syn_partner_id) {
                this.ctrl.sender11005(syn_partner_id, request_data.hero_list, request_data.random_list);
            }
        }
    },

    onClickLookBtn: function() {
        cc.log(this.hero_vo);
        HeroController.getInstance().openHeroTipsPanel(true, this.show_hero_vo, true);
    },

    onClickExplainBtn: function(event) {
        var tip_des = Config.partner_data.data_partner_const.game_rule2.desc;
        require("tips_controller").getInstance().showCommonTips(tip_des, event.touch.getLocation());
    },

    initHeroListByMatchInfo: function(conditions_list) {

        this.dic_other_selected
        this.hero_item_data_list

        // var hero_list = this.model.getHeroList();
        // this.conditions_hero_list = {};

        // for (var hero_i in hero_list) {
        //     var hero = hero_list[hero_i];
        //     for (var conditions_i in conditions_list) {
        //         var conditions = conditions_list[conditions_i];
        //         if (!this.conditions_hero_list[conditions_i])
        //             this.conditions_hero_list[conditions_i] = []

        //         if (this.hero_item_data_list[conditions_i].bid == 0) {
        //             // 表示随机卡 0表示全部阵营
        //             if (conditions[0]) {
        //                 if (conditions[0][hero.star]) {
        //                     this.conditions_hero_list[conditions_i].push(hero);
        //                 }
        //             } else {
        //                 if (conditions[hero.camp_type] && conditions[hero.camp_type][hero.star])
        //                     this.conditions_hero_list[conditions_i].push(hero);
        //             }
        //         } else {
        //             // 指定卡
        //             if (conditions[hero.bid] && conditions[hero.bid][hero.star])
        //                 this.conditions_hero_list[conditions_i].push(hero);
        //         }
        //     }
        // }

        // cc.log(this.conditions_hero_list);
    },

    // 更新阵容红点
    updateCampRedpoint: function() {

    },

    // 计算
    updateCentreHeroItemRedPoint: function() {
        // 中间合成按钮红点
        // addRedPointToNodeByStatus(this.synthesis_btn, is_btn_redpoint, 6, 6)
        var can_compose = true;
        for (var item_i in this.hero_item_data_list) {
            var is_red = false;
            var item_info = this.hero_item_data_list[item_i];
            if (item_info.count != item_info.select_count) {
                can_compose = false;
                is_red = this.haveCanSelect(this.hero_item_data_list[item_i])
            }
            this.hero_items[item_i].showRedPoint(is_red);
        }

        if (can_compose) {
            this.btn_red_nd.active = true;
        } else {
            this.btn_red_nd.active = false;
        }
    },

    haveCanSelect: function(select_hero) {
        var all_hero_list = this.model.getAllHeroArray();
        this.hero_list = [];
        if (select_hero.bid === 0) { // 不是指定英雄
            for (var hero_i = 0; hero_i < all_hero_list.length; ++hero_i) {
                if (all_hero_list[hero_i].camp_type === select_hero.camp_type || select_hero.camp_type === 0) {
                    if (all_hero_list[hero_i].star === select_hero.star && (!this.cur_hero_vo || all_hero_list[hero_i].partner_id !== this.cur_hero_vo.partner_id)) {
                        if (!this.isOtherSelect(all_hero_list[hero_i]))
                            this.hero_list.push(all_hero_list[hero_i]);
                    }
                }
            }
        } else { // 指定英雄
            for (var hero_i = 0; hero_i < all_hero_list.length; ++hero_i) {
                if (all_hero_list[hero_i].bid === select_hero.bid && (!this.cur_hero_vo || all_hero_list[hero_i].partner_id !== this.cur_hero_vo.partner_id)) {
                    if (all_hero_list[hero_i].star === select_hero.star) {
                        if (!this.isOtherSelect(all_hero_list[hero_i]))
                            this.hero_list.push(all_hero_list[hero_i]);
                    }
                }
            }
        }

        // 是否已经选择
        for (var hero_i = 0; hero_i < this.hero_list.length; ++hero_i) {
            for (var select_i in this.dic_other_selected) {
                for (var select_hero_i in this.dic_other_selected[select_i]) {
                    if (this.dic_other_selected[select_i][select_hero_i].partner_id == this.hero_list[hero_i].partner_id) {
                        // this.hero_list.shift(hero_i, 1);
                        this.hero_list[hero_i].is_ui_select = true;
                        continue;
                    }
                }
            }
        }

        var num = 0;
        for (var hero_i = 0; hero_i < this.hero_list.length; ++hero_i) {
            if (!this.hero_list[hero_i].is_ui_select)
                num++;
        }

        if (num >= select_hero.count)
            return true

        return false;

        // 是否已经上阵或者已经锁定
        // for (var hero_i in this.hero_list) {
        //     if (this.hero_list[hero_i].is_in_form || this.hero_list[hero_i].is_lock) {
        //         this.hero_list[hero_i].is_ui_lock = true;
        //     }
        // }

    },

    isOtherSelect: function(hero_vo) {
        for (var select_i in this.dic_other_selected) {
            for (var hero_i in this.dic_other_selected[select_i]) {
                var cur_hero_vo = this.dic_other_selected[select_i][hero_i];
                if (hero_vo.partner_id === cur_hero_vo.partner_id) {
                    return true;
                }
            }
        }

        return false;
    },


})