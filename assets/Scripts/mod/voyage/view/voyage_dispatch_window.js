// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     远航派遣界面
// <br/>Create: 2019-03-07 20:23:27
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const");
var HeroController = require("hero_controller");
var RoleController = require("role_controller");
var CommonScrollView = require("common_scrollview");
var TimeTool = require("timetool");
var VoyageConst = require("voyage_const");
var VoyageEvent = require("voyage_event");
var VoyageController = require("voyage_controller");
var GuideEvent = require("guide_event");

var Voyage_dispatchWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("voyage", "voyage_order_info");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.ctrl = VoyageController.getInstance();
        this.model = this.ctrl.getModel();
        this.camp_btns = {}
        this.cur_camp = HeroConst.CampType.eNone
        this.need_hero_num = 0  // 可选英雄最大数
        this.chose_heros = []   // 选中的英雄列表
        this.hero_boxs = {} 	// 英雄头像框(最大英雄数量)
        this.hero_icons = [] 	// 选中的英雄头像
        this.camp_icons = [] 	// 阵营条件图标
        this.conditions = [] 	// 条件
        this.con_status = false // 条件满足状态
        this.con_tips = Utils.TI18N("不满足派遣条件") // 派遣提示
        this.node_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.seekChild("main_container");

        var camp_nd = this.seekChild(this.main_container, "camp_node");
        this.img_select_nd = this.seekChild(camp_nd, "img_select");
        for (var i = 0; i <= 5; i++) {
            var camp_btn = camp_nd.getChildByName("camp_btn" + i);
            this.camp_btns[i] = camp_btn;
            if (i == 0) {
                var pos = camp_btn.getPosition();
                this.img_select_nd.setPosition(pos);
            }
        }

        this.no_hero_image_nd = this.seekChild(this.main_container, "no_hero_image");
        this.quick_btn_nd = this.seekChild(this.main_container, "quick_btn");
        this.dispatch_btn_nd = this.seekChild(this.main_container, "dispatch_btn");

        var num_bg_1 = this.seekChild(this.main_container, "num_bg_1");
        this.item_num_lb = this.seekChild(num_bg_1, "item_num_label", cc.Label);
        var num_bg_2 = this.seekChild(this.main_container, "num_bg_2");
        this.time_lb = this.seekChild(num_bg_2, "time_label", cc.Label);
        var num_image_sp = this.seekChild(num_bg_1, "image_res", cc.Sprite);
        this.loadRes(PathTool.getItemRes(7), function (sf_obj) {
            num_image_sp.spriteFrame = sf_obj;
        }.bind(this))

        this.status_label_nd = this.seekChild(this.main_container, "status_label");
        this.move_item_nd = this.seekChild(this.main_container, "move_item");
        this.move_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.move_item.setParent(this.move_item_nd);
        this.move_item.setData(null);
        this.move_item.show();
        this.move_item_nd.active = false;

        //条件满足图标
        this.condition_layout = this.seekChild(this.main_container, "condition_layout");
        //选择的英雄
        this.hero_layout = this.seekChild(this.main_container, "hero_layout");

        var lay_scrollview = this.seekChild(this.main_container, "lay_scrollview");
        var bgSize = lay_scrollview.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height);
        var setting = {
            item_class: "hero_exhibition_item",      // 单元类
            start_x: 10,                    // 第一个单元的X起点
            space_x: 20,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120 * 0.9,               // 单元的尺寸width
            item_height: 120 * 0.9,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 5,                        // 列数，作用于垂直滚动类型
            scale: 0.9
        }
        this.hero_scrollview = new CommonScrollView()
        this.hero_scrollview.createScroll(lay_scrollview, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("main_container/quick_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("一键调遣");
        Utils.getNodeCompByPath("main_container/dispatch_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("派出");
        Utils.getNodeCompByPath("main_container/no_hero_image/label", this.root_wnd, cc.Label).string = Utils.TI18N("暂无该阵营英雄");
        Utils.getNodeCompByPath("main_container/status_label", this.root_wnd, cc.Label).string = Utils.TI18N("达成条件");
        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("任务详情");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this._onClickCloseBtn();
        }.bind(this), 1)
        Utils.onTouchEnd(this.quick_btn_nd, function () {
            this._onClickQuickChoseBtn();
        }.bind(this), 1)
        Utils.onTouchEnd(this.dispatch_btn_nd, function () {
            this._onClickDispatchBtn();
        }.bind(this), 1)

        var func = function (index, btn) {
            Utils.onTouchEnd(btn, function () {
                this._onClickCampBtn(index, btn)
            }.bind(this), 1)
        }.bind(this)
        for (var i = 0; i <= 5; i++) {
            func(i, this.camp_btns[i])
        }
        //情报值更新
        if (this.role_assets_event == null) {
            if (this.role_vo == null) {
                this.role_vo = RoleController.getInstance().getRoleVo();
            }
            this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                if (key == "energy") {
                    this.refreshItemNum()
                }
            }, this)
        }

        //消耗情报值变化（活动期间）
        this.addGlobalEvent(VoyageEvent.UpdateActivityStatusEvent, function () {
            this.refreshItemNum();
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        this.refreshCampHeroList()
        this.showBaseInfo(data)
    },

    //刷新英雄列表
    refreshCampHeroList: function () {
        var hero_array = [];
        var all_hero_arry = HeroController.getInstance().getModel().getAllHeroArray();
        for (var i = 0; i < all_hero_arry.length; i++) {
            var hero_vo = all_hero_arry[i];
            if (this.cur_camp == HeroConst.CampType.eNone || (this.cur_camp == hero_vo.camp_type)) {
                //避免每次切换阵营都走这个循环判断是否在任务中
                if (hero_vo.in_task == null) {
                    hero_vo.in_task = this.model.checkHeroIsInTaskById(hero_vo.partner_id);
                }
                hero_array.push(hero_vo)
            }
        }
        var hero_num = hero_array.length;
        if (hero_num <= 0) {
            this.no_hero_image_nd.active = true;
            if (this.no_hero_image_sp == null) {
                this.no_hero_image_sp = this.no_hero_image_nd.getComponent(cc.Sprite);
                this.loadRes(PathTool.getBigBg("bigbg_3"), function (sp) {
                    this.no_hero_image_sp.spriteFrame = sp;
                }.bind(this))
            }
            this.hero_scrollview.setData([]);
            return
        } else {
            this.no_hero_image_nd.active = false;
        }
        var hero_list = hero_array;
        var sortFunc = function (objA, objB) {
            if (objA.in_task && !objB.in_task) {
                return false
            } else if (!objA.in_task && objB.in_task) {
                return true
            } else {
                if (objA.camp_type != objB.camp_type) {
                    return objA.camp_type < objB.camp_type
                } else {
                    if (objA.star != objB.star) {
                        return objA.star > objB.star
                    } else {
                        return objA.lev > objB.lev
                    }
                }
            }
        }
        hero_list.sort(sortFunc);
        var extendData = { scale: 0.9, can_click: true, click_delay: 0.5, from_type: HeroConst.ExhibitionItemType.eVoyage };
        this.hero_scrollview.setData(hero_list, function (item, hero_vo) {
            this._onClickHero(item, hero_vo);
        }.bind(this), extendData)
    },

    //刷新情报值
    refreshItemNum: function () {
        if (this.role_vo && this.config) {
            var cur_energy = this.role_vo.energy;
            var need_energy = 0;
            if (this.config.expend[0]) {
                need_energy = this.config.expend[0][1] || 0;
                if (this.model.getActivityStatus() == 1) {
                    var discount_cfg = Config.shipping_data.data_const["discount"];
                    if (discount_cfg) {
                        need_energy = need_energy * discount_cfg.val / 1000
                    }
                }
            }
            this.item_num_lb.string = cur_energy + "/" + need_energy
        }
    },

    //基础信息显示
    showBaseInfo: function (data) {
        this.data = data || {};
        var config = this.data.config || {};
        this.config = config;
        //情报值
        this.refreshItemNum();
        //时间
        this.time_lb.string = TimeTool.getTimeFormat(config.need_time);
        //需要英雄数量的头像框
        for (var k in this.hero_boxs) {
            this.hero_boxs[k].node.active = false;
        }
        var limit_num = config.limit_num;
        this.need_hero_num = limit_num;
        var box_pos = VoyageConst.Chose_Hero_PosX[limit_num];
        var func = function (i) {
            var hero_box = this.hero_boxs[i];
            if (hero_box == null) {
                hero_box = Utils.createImage(this.hero_layout, null, 0, 0, cc.v2(0.5, 0.5), true);
                this.loadRes(PathTool.getCommonIcomPath("common_1005"), function (sf_obj) {
                    hero_box.spriteFrame = sf_obj;
                }.bind(this))
                this.hero_boxs[i] = hero_box;
            }
            hero_box.node.active = true;
            var pos_x = box_pos[i - 1];
            if (pos_x) {
                hero_box.node.setPosition(cc.v2(pos_x - 319, 0));
            }
        }.bind(this)
        for (var i = 1; i <= limit_num; i++) {
            func(i)
        }
        //条件图标
        this.initConditionData();
        var temp_icons = []
        var need_star = 0
        var star_num = 1
        var need_camps = [];
        for (var k in this.conditions) {
            var v = this.conditions[k];
            if (v.star_num) {
                need_star = v.need_num;
                star_num = v.star_num;
            } else if (v.camp_type) {
                need_camps.push(v.camp_type);
            }
        }
        if (need_star > 0) {
            this.star_icon = Utils.createImage(this.condition_layout, null, 0, 0, cc.v2(0.5, 0.5), true);
            this.loadRes(PathTool.getUIIconPath("voyage", "voyage_1009"), function (sf_obj) {
                this.star_icon.spriteFrame = sf_obj;
            }.bind(this))
            this.star_icon.setState(cc.Sprite.State.GRAY)
            var star_text = Utils.createLabel(22, 1, new cc.Color(0x84, 0x10, 0, 0xff), 0, 0, star_num, this.star_icon.node, null, cc.v2(0.5, 0.5))
            this.star_icon.node.on(cc.Node.EventType.TOUCH_END, function () {
                message(cc.js.formatStr(Utils.TI18N("需要一个%d星英雄"), star_num));
            }, this)
            temp_icons.push(this.star_icon);
        }
        for (var k in this.camp_icons) {
            this.camp_icons[k].node.active = false;
        }
        var func = function (camp_icon, i) {
            if (camp_icon == null) {
                camp_icon = Utils.createImage(this.condition_layout, null, 0, 0, cc.v2(0.5, 0.5), true)
                var res = PathTool.getHeroCampRes(camp_type)
                this.loadRes(PathTool.getCommonIcomPath(res), function (sf_obj) {
                    camp_icon.spriteFrame = sf_obj;
                }.bind(this))
                camp_icon.node.scale = 0.8;
                camp_icon.node.on(cc.Node.EventType.TOUCH_END, function (camp_type) {
                    message(cc.js.formatStr(Utils.TI18N("需要一个%s英雄"), HeroConst.CampAttrName[camp_type]));
                }.bind(this, camp_type), this)
                camp_icon.setState(cc.Sprite.State.GRAY)
                this.camp_icons.push(camp_icon);
            }
            camp_icon.camp_type = camp_type;
            camp_icon.node.active = true;
            temp_icons.push(camp_icon);
        }.bind(this)
        for (var i in need_camps) {
            var camp_type = need_camps[i];
            var camp_icon = this.camp_icons[i];
            func(camp_icon, i)
        }
        var icon_pos = VoyageConst.Condition_Icon_PosX[temp_icons.length];
        for (var i in temp_icons) {
            var pos_x = icon_pos[i];
            if (pos_x != null) {
                // temp_icons[i].node.setPosition(cc.v2(pos_x, 0));
                temp_icons[i].node.x = pos_x;
            }
        }
    },

    //根据阵营类型获取阵营图标
    getCampIconByCampType: function (camp_type) {
        for (var k in this.camp_icons) {
            var camp_icon = this.camp_icons[k];
            if (camp_icon.camp_type == camp_type) {
                return camp_icon
            }
        }
    },

    //初始化派遣条件
    initConditionData: function () {
        this.conditions = [];
        if (this.config) {
            var conditions = this.config.condition || {};
            for (var k in conditions) {
                var con_id = conditions[k];
                var con_config = Config.shipping_data.data_condition[con_id] || {};
                var condition = con_config.conition || {};
                if (condition[0]) {
                    var con_data = {};
                    if (condition[0][0] == "partner_star") {
                        con_data.star_num = condition[0][1] //星数要求
                        con_data.need_num = condition[0][2];
                    } else if (condition[0][0] == "partner_camp_type") {
                        con_data.camp_type = condition[0][1] //阵营要求
                        con_data.need_num = condition[0][2];
                    }
                    if (Utils.next(con_data) != null) {
                        this.conditions.push(con_data);
                    }
                }
            }
        }
    },

    //刷新条件满足状态
    refreshConditionStatus: function () {
        this.con_status = true;
        for (var k in this.conditions) {
            var is_meet = false;
            var v = this.conditions[k];
            if (v.star_num) {
                is_meet = this.checkIsMeetCondition(1, v.star_num, v.need_num);
                this.star_icon.setState(is_meet ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
            } else if (v.camp_type) {
                is_meet = this.checkIsMeetCondition(2, v.camp_type, v.need_num);
                var camp_icon = this.getCampIconByCampType(v.camp_type);
                camp_icon.setState(is_meet ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
            }
            if (is_meet == false && this.con_status) {
                if (v.star_num) {
                    this.con_tips = cc.js.formatStr(Utils.TI18N("需要一个%s星英雄"), v.star_num);
                } else if (v.camp_type) {
                    this.con_tips = cc.js.formatStr(Utils.TI18N("需要一个%s英雄"), HeroConst.CampName[v.camp_type])
                }
                this.con_status = false;
            }
        }
        if (this.con_status) {
            this.status_label_nd.color = new cc.Color(36, 144, 3, 255);
        } else {
            this.status_label_nd.color = new cc.Color(201, 38, 6, 255);
        }
    },

    //判断所选英雄是否满足该条件 ttype:1星级 2阵营
    checkIsMeetCondition: function (ttype, value, num) {
        var have_num = 0;
        for (var k in this.chose_heros) {
            var hero_vo = this.chose_heros[k];
            if (ttype == 1 && hero_vo.star >= value) {
                have_num = have_num + 1;
            } else if (ttype == 2 && hero_vo.camp_type == value) {
                have_num = have_num + 1
            }
        }
        return have_num >= num
    },

    //判断当前所选的英雄是否满足所有条件
    checkIsMeetAllCondition: function () {
        var con_status = true;
        for (var k in this.conditions) {
            var v = this.conditions[k];
            var is_meet = false;
            if (v.star_num) {
                is_meet = this.checkIsMeetCondition(1, v.star_num, v.need_num)
            } else if (v.camp_type) {
                is_meet = this.checkIsMeetCondition(2, v.star_num, v.need_num)
            }
            if (is_meet == false) {
                con_status = false;
                break
            }
        }
        return con_status
    },

    _onClickHero: function (item, hero_vo) {
        hero_vo = item.data;
        if (hero_vo.in_task) return
        if (hero_vo.is_ui_select) {
            for (var k in this.hero_icons) {
                var hero_icon = this.hero_icons[k];
                var data = hero_icon.getData();
                if (data.partner_id == hero_vo.partner_id) {
                    var hero_box = hero_icon.parent;
                    // var pos = hero_box.convertToWorldSpaceAR(cc.v2(0, 0))
                    // var start_pos = this.main_container.convertToNodeSpaceAR(pos);
                    // var end_pos = this.main_container.convertToNodeSpaceAR(item.getWorldPos());
                    // this.move_item_nd.setPosition(start_pos)
                    this.move_item_nd.active = false;
                    hero_icon.deleteMe();
                    hero_icon = null;
                    hero_box.box_index = null;
                    this.hero_icons.splice(k, 1);
                    this.move_item_nd.active = false;
                    // var move_act = cc.moveTo(0.07, end_pos)
                    // var callback = function () {
                    //     hero_icon.deleteMe();
                    //     hero_icon = null;
                    //     hero_box.box_index = null;
                    //     this.hero_icons.splice(k, 1);
                    //     this.move_item_nd.active = false;
                    // }.bind(this)
                    // this.move_item_nd.runAction(cc.sequence(move_act, cc.callFunc(callback)));
                    break
                }
            }
            hero_vo.is_ui_select = false;
            item.setSelected(false);
            this.updateChoseHeroList(hero_vo, 2);
        } else {
            //判断当前是否还有空位
            if (this.need_hero_num <= this.chose_heros.length) {
                message(Utils.TI18N("已达英雄数量上限"));
                return
            }
            this.createChoseHeroIcon(hero_vo, item);
            hero_vo.is_ui_select = true;
            item.setSelected(true);
            this.updateChoseHeroList(hero_vo, 1);
        }
        this.refreshConditionStatus();
    },

    //创建一个选中的英雄图标
    createChoseHeroIcon: function (hero_vo, item) {
        this.checkDeleteSameHeroIcon(hero_vo.partner_id);
        var hero_icon = ItemsPool.getInstance().getItem("hero_exhibition_item");
        hero_icon.show();
        hero_icon.setData(hero_vo);
        hero_icon.setVisible(false);
        this.move_item.setData(hero_vo);
        hero_icon.addCallBack(function () {
            var vo = hero_icon.getData();
            var list = this.hero_scrollview.getItemList();
            var item_node = null;
            //当英雄列表滑动了，对应的英雄item可能已经不存在
            for (var k in list) {
                var h_vo = list[k].getData();
                if (h_vo.partner_id == vo.partner_id) {
                    item_node = list[k];
                }
            }
            if (item_node) {
                this._onClickHero(item_node, item_node.getData());
            } else {
                for (var k in this.hero_icons) {
                    var icon = this.hero_icons[k];
                    var data = icon.getData();
                    if (data.partner_id == vo.partner_id) {
                        icon.deleteMe();
                        // icon.stopAllActions();
                        this.hero_icons.splice(k, 1);
                        break
                    }
                }
                vo.is_ui_select = false;
                this.updateChoseHeroList(vo, 2);
                this.refreshConditionStatus();
            }
        }.bind(this))

        var hero_box = this.getMastLeftEmptyBox();
        if (hero_box) {
            // hero_icon.name = "hero_exhibition_item";
            hero_icon.setParent(hero_box.node);
            this.hero_icons.push(hero_icon);
            if (item) {
                var start_pos = this.main_container.convertToNodeSpaceAR(item.getWorldPos());
                var pos = hero_box.node.convertToWorldSpaceAR(cc.v2(0, 0))
                var end_pos = this.main_container.convertToNodeSpaceAR(pos);
                this.move_item_nd.setPosition(start_pos);
                this.move_item_nd.active = true;
                this.move_item_nd.runAction(cc.sequence(cc.moveTo(0.07, end_pos), cc.callFunc(function () {
                    this.move_item_nd.active = false;
                    hero_icon.setVisible(true);
                }.bind(this))));
            } else {
                hero_icon.setVisible(true);
            }
        }
    },
    //删除已经创建的一致的头像(点太快可能会出现)
    checkDeleteSameHeroIcon: function (id) {
        for (var k in this.hero_icons) {
            var hero_icon = this.hero_icons[k];
            var data = hero_icon.getData();
            if (data.partner_id == id) {
                // hero_icon.stopAllActions();
                hero_icon.deleteMe();
                this.hero_icons.splice(k, 1);
                break
            }
        }
    },

    //获取最靠前的一个空的头像box
    getMastLeftEmptyBox: function () {
        var hero_box
        for (var i in this.hero_boxs) {
            var box = this.hero_boxs[i];
            if (!box.node.getChildByName("hero_exhibition_item") && box.node.box_index == null) {
                hero_box = box
                box.node.box_index = i;
                break
            }
        }
        return hero_box
    },

    //更新选中的英雄列表 ttype:1为增 2为减
    updateChoseHeroList: function (hero_vo, ttype) {
        if (ttype == 1) {
            this.chose_heros.push(hero_vo);
        } else if (ttype == 2) {
            for (var k in this.chose_heros) {
                var v = this.chose_heros[k];
                if (v.partner_id == hero_vo.partner_id) {
                    this.chose_heros.splice(k, 1);
                    break
                }
            }
        }
    },

    _onClickCampBtn: function (index, sender) {
        if (this.cur_camp == index) return
        this.cur_camp = index;
        var pos_x = sender.x;
        var pos_y = sender.y;
        this.img_select_nd.setPosition(cc.v2(pos_x, pos_y));
        this.refreshCampHeroList();
    },

    //一键出战
    _onClickQuickChoseBtn: function () {
        //先清掉所有选择的数据
        for (var k in this.hero_icons) {
            if (this.hero_icons[k]) {
                // this.hero_icons[k].stopAllActions();
                this.hero_icons[k].deleteMe();
                this.hero_icons[k] = null;
            }
        }
        for (var k in this.hero_boxs) {
            if (this.hero_boxs[k]) {
                this.hero_boxs[k].node.box_index = null;
            }
        }

        if (window.TASK_TIPS)
            gcore.GlobalEvent.fire(GuideEvent.TaskNextStep, "quick_btn");//任务引导用到
        
        
        gcore.Timer.set(function () {
            this.oneCallBack();
        }.bind(this), 100, 1)
    },

    oneCallBack: function () {
        this.hero_icons = [];
        for (var k in this.chose_heros) {
            this.chose_heros[k].is_ui_select = false;
        }
        this.chose_heros = [];
        var item_list = this.hero_scrollview.getItemList();
        for (var k in item_list) {
            item_list[k].setSelected(false)
        }
        var all_hero = HeroController.getInstance().getModel().getHeroList();

        var star_num = 0;
        var star_need = 0;
        var need_camps = {};
        for (var k in this.conditions) {
            var con_data = this.conditions[k];
            if (con_data.star_num) {
                star_num = con_data.star_num;
                star_need = con_data.need_num;
            } else if (con_data.camp_type) {
                need_camps[con_data.camp_type] = con_data.need_num;
            }
        }

        var star_hero = [];         //满足星级条件的英雄
        var all_camp_hero = {}      //满足阵营条件的英雄
        var both_hero = []          //同时满足星级和阵营的英雄
        for (var k in all_hero) {
            var hero_vo = all_hero[k];
            var star_is_meet = false;
            if (hero_vo.star >= star_num && !this.model.checkHeroIsInTaskById(hero_vo.partner_id)) {
                star_is_meet = true;
                star_hero.push(hero_vo);
            }
            for (var i in this.conditions) {
                var con_data = this.conditions[i];
                if (con_data.camp_type && con_data.camp_type == hero_vo.camp_type && !this.model.checkHeroIsInTaskById(hero_vo.partner_id)) {
                    if (!all_camp_hero[con_data.camp_type]) {
                        all_camp_hero[con_data.camp_type] = [];
                    }
                    all_camp_hero[con_data.camp_type].push(hero_vo);
                    if (star_is_meet) {
                        both_hero.push(hero_vo);
                    }
                }
            }
        }

        var sortFunc = Utils.tableLowerSorter(["star", "lev", "camp_type"])
        //按星级、等级、阵营从低到高排列
        star_hero.sort(sortFunc)
        both_hero.sort(sortFunc);

        for (var k in all_camp_hero) {
            all_camp_hero[k].sort(sortFunc)
        }
        for (var i in both_hero) {
            var hero_vo = both_hero[i];
            if (this.chose_heros.length < star_need) {
                this.chose_heros.push(hero_vo);
            } else if (this.checkIsMeetAllCondition()) {
                for (var camp in need_camps) {
                    var need_num = need_camps[camp];
                    if (hero_vo.camp_type == camp && this.checkChoseHeroNumByCamp(camp) < need_num) {
                        this.chose_heros.push(hero_vo)
                    }
                }
            } else {
                break
            }
        }

        if (this.checkIsMeetAllCondition()) {
            this.afterQuickChoseHero();
            return
        }

        var star_dif_num = star_need - this.chose_heros.length;     //满足星级条件的英雄，还差的个数
        if (star_dif_num > 0) {
            var temp_num = 0;
            for (var i in star_hero) {
                var vo = star_hero[i];
                if (!this.checkIsChoseHeroById(vo.partner_id)) {
                    this.chose_heros.push(vo);
                    temp_num = temp_num + 1;
                }
                if (temp_num >= star_dif_num) {
                    break
                }
            }
        }

        //满足条件或者星级条件都无法满足，则无需选择其他英雄
        if (this.checkIsMeetAllCondition()) {
            this.afterQuickChoseHero();
            return
        }

        for (var camp_type in all_camp_hero) {
            var hero_list = all_camp_hero[camp_type];
            var need_num = need_camps[camp_type];
            var cur_num = this.checkChoseHeroNumByCamp(camp_type);
            var diff_num = need_num - cur_num;
            if (diff_num > 0) {
                var temp_num = 0;
                for (var i in hero_list) {
                    var vo = hero_list[i];
                    if (!this.checkIsChoseHeroById(vo.partner_id)) {
                        this.chose_heros.push(vo);
                        temp_num = temp_num + 1
                    }
                    if (temp_num >= diff_num) {
                        break
                    }
                }
            }
        }

        this.afterQuickChoseHero();
    },

    checkIsChoseHeroById: function (id) {
        var is_have = false;
        for (var k in this.chose_heros) {
            if (this.chose_heros[k].partner_id == id) {
                is_have = true;
                break
            }
        }
        return is_have
    },

    checkChoseHeroNumByCamp: function (camp_type) {
        var have_num = 0;
        for (var k in this.chose_heros) {
            if (this.chose_heros[k].camp_type == camp_type) {
                have_num = have_num + 1;
            }
        }
        return have_num
    },

    //一键出战选择合适英雄之后界面刷新
    afterQuickChoseHero: function () {
        for (var i in this.chose_heros) {
            var hero_vo = this.chose_heros[i];
            hero_vo.is_ui_select = true;
            var item_list = this.hero_scrollview.getItemList();
            for (var k in item_list) {
                var item = item_list[k]
                var item_data = item.getData();
                if (item_data.partner_id == hero_vo.partner_id) {
                    item.setSelected(true)
                }
            }
            this.createChoseHeroIcon(hero_vo);
        }
        this.refreshConditionStatus();
    },

    //派遣
    _onClickDispatchBtn: function () {
        if (this.con_status == true) {
            var assign_ids = [];
            for (var k in this.chose_heros) {
                var v = this.chose_heros[k];
                var assign = {};
                assign.partner_id = v.partner_id;
                assign_ids.push(assign)
            }
            if (this.data) {
                this.ctrl.requestReceiveOrder(this.data.order_id, assign_ids);
            }
            if (window.TASK_TIPS)
                gcore.GlobalEvent.fire(GuideEvent.TaskNextStep, "dispatch_btn");//任务引导用到
        } else {
            this.con_tips = this.con_tips || Utils.TI18N("不满足派遣条件");
            message(this.con_tips)
        }
    },

    _onClickCloseBtn: function () {
        this.ctrl.openVoyageDispatchWindow(false)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.hero_scrollview) {
            this.hero_scrollview.deleteMe();
            this.hero_scrollview = null;
        }
        //清空选中状态
        var hero_list = HeroController.getInstance().getModel().getHeroList();
        for (var k in hero_list) {
            hero_list[k].is_ui_select = false;
            hero_list[k].in_task = null;
        }
        if (this.role_assets_event) {
            if (this.role_vo) {
                this.role_vo.unbind(this.role_assets_event)
            }
            this.role_assets_event = null;
            this.role_vo = null;
        }
        for (var k in this.hero_icons) {
            if (this.hero_icons[k]) {
                // this.hero_icons[k].stopAllActions();
                this.hero_icons[k].deleteMe();
                this.hero_icons[k] = null;
            }
        }
        if (this.move_item) {
            this.move_item.deleteMe();
            this.move_item = null;
        }
        if (this.camp_icons) {
            for (var k in this.camp_icons) {
                var v = this.camp_icons[k];
                if (v) {
                    v.node.destroy();
                    v = null;
                }
            }
            this.camp_icons = null;
        }

        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        this.ctrl.openVoyageDispatchWindow(false)
    },
})