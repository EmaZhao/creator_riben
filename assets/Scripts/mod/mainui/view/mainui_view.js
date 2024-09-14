// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      主界面控制
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var LoaderManager = require("loadermanager");
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var MainUiConst = require("mainui_const");
var BattleConst = require("battle_const");
var RoleController = require("role_controller");
var ExchangeController = require("exchange_controller");
var FunctionIconVo = require("function_icon_vo");
var ChatController = require("chat_controller");
var ExchangeEvent = require("exchange_event")
var LoginController = require("login_controller");
var MainuiEvent = require("mainui_event");
var PromptEvent = require("prompt_event")
var PromptController = require("prompt_controller");
var sceneConst = require("scene_const");
const MainUiController = require("../mainui_controller");
const HeroController = require("hero_controller")
var ActivityEvent = require("activity_event");
var MainUIView = cc.Class({
    extends: BaseClass,
    ctor: function() {
        this.rleasePrefab = false;
        this.initConfig();
        this.createRootWnd();
    },
    // cc.sys.getSafeAreaRect()
    initConfig: function() {
        this.bottom_btn_list = []; // 下面7个标签页
        this.cur_select_index = 0;
        this.render_list = [] // 待添加的实例对象
        this.render_list_dic = {} // 但添加实例字典
        this.function_list = {}; //显示的实例对象
        this.icon_container_list = {}; //根据方位保存需要储存的图标的父节点
        this.icon_widget_list = {}; //根据方位保存需要储存的图标的widget节点

        this.btn_cache_tips = {} //红点缓存

        this.left_off = 20
        this.right_off = 20
        this.left_max_sum = 7;
        this.is_in_shrink = false;
        this.is_shrink = false;
        this.layout_list = {}

        this.menuListBtn = []; //新按钮
        this.menuListBtnState = {};
        this.cardUIList = [];
        this.activityPointList = [];
        this.curActivityIndex = 0;
        this.function_icon_index = 0;
        this.pageItemList = [];
    },

    createRootWnd: function() {
        // this.node = new cc.Node("base_root");
        // this.node.setAnchorPoint(0, 0);
        // this.node.setContentSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        // this.node.setPosition(-SCREEN_WIDTH * 0.5, -SCREEN_HEIGHT * 0.5);
        // ViewManager.getInstance().addToSceneNode(this.node, SCENE_TAG.top)
        this.changeBackgroundMusic();

        // 获取一些需要使用的单例
        this.mainui_controller = require("mainui_controller").getInstance();
        this.battle_controller = require("battle_controller").getInstance();

        var prefabPath = PathTool.getPrefabPath("mainui", "mainui_view");
        LoaderManager.getInstance().loadRes(prefabPath, function(res_object) {
            this.initMainUI(res_object);
            // setTimeout(()=>{
            //   var controller = require("mainui_controller");
            //   if(controller.activityPopupCachesStatus){
            //     return;
            //   }
            //   controller.getInstance().checkActivityPopup(true);
            // },500)
        }.bind(this));
    },

    initMainUI: function(res_object) {
        this.root_wnd = res_object;
        this.role_vo = RoleController.getInstance().getRoleVo();

        if (!window.isMobile) {
            this.root_wnd.getComponent(cc.Widget).enabled = false;
        }

        this.root_wnd.setPosition(-SCREEN_WIDTH * 0.5, -SCREEN_HEIGHT * 0.5)
            // this.node.addChild(this.root_wnd);
        ViewManager.getInstance().addToSceneNode(this.root_wnd, SCENE_TAG.top)

        if (this.root_wnd_cb)
            this.root_wnd_cb(this.root_wnd);

        // 下部分的7个按钮
        this.bottom_container = this.root_wnd.getChildByName("bottom_container");
        this.btn_con = this.bottom_container.getChildByName("bnt_con");

        // gcore.Timer.set(function(){        
        //     var btn_lo =  this.btn_con.getComponent(cc.Layout);
        //     var spcingX = (this.btn_con.width - btn_lo.paddingLeft - btn_lo.paddingRight - (93 * 6 + 105))/6;
        //     btn_lo.spacingX = spcingX;
        //     cc.log(spcingX);
        // }.bind(this), 0.2)
        // if (window.isMobile && window.FIT_HEIDGHT) {
        //     var btn_lo = this.btn_con.getComponent(cc.Layout);
        //     var spcingX = (SCREEN_WIDTH * FIT_SCALE - btn_lo.paddingLeft - btn_lo.paddingRight - (93 * 6 + 105)) / 6;
        //     btn_lo.spacingX = spcingX;
        // }

        for (let index = 0; index < 7; index++) {
            var btn = this.btn_con.getChildByName("mainui_tab_" + (index + 1));

            if (btn) {
                var tips_point = btn.getChildByName("tips_point");
                var normal = btn.getChildByName("normal");
                var selected = btn.getChildByName("selected");
                var icon = btn.getChildByName("icon");
                var notice = btn.getChildByName("notice")
                var init_x = btn.getPosition().x
                var init_y = btn.getPosition().y

                this.bottom_btn_list[index] = { btn: btn, index: index, tips_point: tips_point, normal: normal, selected: selected, icon: icon, notice: notice, tips_status: false, init_x: init_x, init_y: init_y }
                let config = Config.function_data.data_base[index + 1]
                if (config && config.activate) {
                    this.bottom_btn_list[index].config = config
                    if (this.bottom_btn_list[index].notice) {
                        this.bottom_btn_list[index].notice.getComponent(cc.Label).string = config.label;
                    }
                }
                btn.on(cc.Node.EventType.TOUCH_END, (function(event) {
                    if (index == MainUiConst.new_btn_index.drama_scene) {
                        Utils.playButtonSound("c_guajijiemian");

                    } else {
                        Utils.playButtonSound("c_mainselect");
                    }
                    this.changeMainUiStatus(index);
                }).bind(this))

                if (index == MainUiConst.new_btn_index.main_scene) {
                    this.setMaiuiBtnStatus(index)
                } else if (index == MainUiConst.new_btn_index.drama_scene) {
                    this.bottom_btn_list[index].skeleton = icon.getComponent(sp.Skeleton);
                }
                if (index == 0) {
                    this.cur_select_index = index
                    this.cur_select_btn = this.bottom_btn_list[index]
                    this.cur_select_btn.normal.active = false;
                    this.cur_select_btn.selected.active = true
                        // btn.y = this.bottom_btn_list[index].init_y + 10
                }
            }
        }
        // 上部分的显示
        this.top_container = this.root_wnd.getChildByName("top_container");
        this.exp_bar = this.top_container.getChildByName("exp_bar")
        this.notice_1 = this.top_container.getChildByName("notice_1");
        this.notice_1.active = false;
        var exp_nd = this.top_container.getChildByName("exp_bar");

        gcore.Timer.set(function() {
            var exp_wdg = exp_nd.getComponent(cc.Widget);
            this.exp_bar.width = this.root_wnd.width - exp_wdg.left;
        }.bind(this), 0.1)

        //新界面
        this.new_hide_container = this.root_wnd.getChildByName("new_hide_container");
        this.bnt_limited_card = this.new_hide_container.getChildByName("bnt_limited_card");
        this.bnt_resident_card = this.new_hide_container.getChildByName("bnt_resident_card");
        this.small_container = this.new_hide_container.getChildByName("small_container");
        this.task_container = this.new_hide_container.getChildByName("task_container");
        this.new_activity = this.new_hide_container.getChildByName("new_activity");
        this.new_activity.active = false;
        this.activity_scrollview = this.new_activity.getChildByName("scrollview");
        this.activity_point_content = this.new_activity.getChildByName("select_point_content");
        this.activity_point_content.active = true;
        var addList = function(node, type, tabel) {
            node.mask = node.getChildByName("mask");
            node.label = node.getChildByName("label");
            node.lock = node.getChildByName("lock");
            node.red_point = node.getChildByName("red_point");
            node.index = type;
            node.is_lock = false;
            node.is_bRed = false;
            node.mask.active = false;
            node.lock.active = false;
            node.label.active = false;
            tabel[node.index] = node;
        }

        addList(this.bnt_limited_card, 0, this.cardUIList);
        addList(this.bnt_resident_card, 1, this.cardUIList);
        //小功能按钮
        for (let index in this.small_container.children) {
            let child = this.small_container.children[index];
            child.label = child.getChildByName("label");
            child.red_point = child.getChildByName("red_point");
            child.red_point.active = false;
            child.index = index;
            child.on(cc.Node.EventType.TOUCH_END, this.onMenuButton, this);
            this.menuListBtn[index] = child;
            let Tab = {
                is_lock: false,
                is_bRed: false,
            }
            this.menuListBtnState[index] = Tab;
        }

        this.updateMenuData();
        this.refreshCardUI();
        this.refreshMenuUI();

        this.fight_con = this.top_container.getChildByName("fight_con");
        this.coin_touch = this.top_container.getChildByName("coin_touch"); // 金币点击区域
        this.gold_touch = this.top_container.getChildByName("gold_touch"); // 钻石点击区域
        this.Sprite_8 = this.coin_touch.getChildByName("Sprite_8"); // 金币加号
        this.Sprite_10 = this.gold_touch.getChildByName("Sprite_10"); // 钻石加号
        this.coin_redpoint = this.coin_touch.getChildByName("Sprite_8").getChildByName("redPoint") //点金红点
        this.coin_redpoint.active = ExchangeController.getInstance().getModel().getRedStatus();

        this.head_container = this.top_container.getChildByName("head_container"); // 头像部分
        this.player_head = new PlayerHead();
        this.player_head.setParent(this.head_container);
        this.player_head.show()

        this.info_container = this.top_container.getChildByName("info_container");
        this.lev_label = this.info_container.getChildByName("lev_label").getComponent(cc.Label); // 角色等级
        this.name_label = this.info_container.getChildByName("name_label").getComponent(cc.Label); // 角色名字
        this.coin_label_nd = this.coin_touch.getChildByName("wealth_label_1"); // 金币数量
        this.gold_label_nd = this.gold_touch.getChildByName("wealth_label_2"); // 钻石数量
        this.coin_label = this.coin_label_nd.getComponent(cc.Label); // 金币数量
        this.gold_label = this.gold_label_nd.getComponent(cc.Label); // 钻石数量
        this.fight_label = this.fight_con.getChildByName("fight_label").getComponent(cc.Label); // 战力
        this.coin_nd = this.coin_touch.getChildByName("Sprite_2"); // 金币node
        this.gold_nd = this.gold_touch.getChildByName("Sprite_4"); // 钻石node
        this.coin_sp = this.coin_nd.getComponent(cc.Sprite); // 金币图标
        this.gold_sp = this.gold_nd.getComponent(cc.Sprite); // 钻石图标

        this.hide_container = this.root_wnd.getChildByName("hide_container")
        this.handle_btn = this.hide_container.getChildByName("handle_btn")
            //系统提示
        this.prompt_container = this.hide_container.getChildByName("prompt_container")
        this.prompt_tips_layout = this.prompt_container.getChildByName("tips_layout")
        this.prompt_bubble_layout = this.prompt_container.getChildByName("bubble_layout")
        this.prompt_tips_btn = this.prompt_container.getChildByName("tips_btn")
        this.prompt_desc = this.prompt_bubble_layout.getChildByName("desc").getComponent(cc.Label)
        this.prompt_bubble = this.prompt_bubble_layout.getChildByName("bubble")
        this.prompt_bubble_size = this.prompt_bubble.getContentSize()

        this.prompt_tips_scroll = this.prompt_tips_layout.getChildByName("tips_scroll")
        this.prompt_tips_scroll_size = this.prompt_tips_scroll.getContentSize()
        this.count_size_label = this.prompt_tips_layout.getChildByName("count_size_label").getComponent(cc.Label)

        this.prompt_tips_bg = this.prompt_tips_layout.getChildByName("tips_bg")
        this.prompt_tips_bg_size = this.prompt_tips_bg.getContentSize()
        this.prompt_tips_btn.active = false;
        this.prompt_tips_layout.active = false;

        //banner
        this.pageview = this.new_activity.getChildByName("pageView");
        this.indicator = this.pageview.getChildByName("indicator");
        this.indicator.active = false;
        this.pageviewComponent = this.pageview.getComponent(cc.PageView);
        this.pageviewContent = this.pageview.getChildByName("view").getChildByName("content");
        this.pageItem = this.pageviewContent.getChildByName("activity_pc_item");
        this.pageviewContent.removeAllChildren();
        this.initNewActivity(); //初始化活动banner

        this.prompt_mask = this.hide_container.getChildByName("prompt_mask")
            // 可控部分,需要隐藏或者显示
        this.hide_container = this.root_wnd.getChildByName("hide_container") // 可隐藏部分
        this.handle_btn = this.hide_container.getChildByName("handle_btn") // 下面控制按钮
            //创建聊天按钮
        if (!window.IS_PC) {
            this.creatorChatBtn()
        }

        // this.chat_btn_nd = this.hide_container.getChildByName("chat_btn");
        RedMgr.getInstance().addCalHandler(this.updateChatMsgNum.bind(this));
        // 战力相关
        // this.power_show_nd = this.root_wnd.getChildByName("power_show");
        // this.power_sk = this.power_show_nd.getChildByName("ani_con").getComponent(sp.Skeleton);
        // var tex_con_nd = this.power_show_nd.getChildByName("txt_con");
        // this.old_power_rb = tex_con_nd.getChildByName("old_power").getComponent(cc.RichText);
        // this.add_power_lb = tex_con_nd.getChildByName("add_power").getComponent(cc.Label);

        // this.updateHandleBtnShowStatus()
        // this.chat_red_bg = this.chat_btn_nd.getChildByName("chat_red_bg");
        // this.chat_red_num = this.chat_red_bg.getChildByName("chat_red_num").getComponent(cc.Label);
        if (USE_SDK == true && PLATFORM_TYPR == "SH_SDK") {
            //创建深海小程序客服浮标 
            this.creatorCustomerServiceBtn();
        }

        this.image_2 = this.top_container.getChildByName("Image_2")
        this.vip_label = this.image_2.getChildByName("vip_label").getComponent("CusRichText")



        for (var k in FunctionIconVo.type) {
            var v = FunctionIconVo.type[k];
            var icon_container = this.hide_container.getChildByName("icon_container_" + v);
            if (icon_container) {
                this.icon_container_list[v] = icon_container;
                var _x = 0;
                var _y = 0;
                if (v == FunctionIconVo.type.right_top_1) {
                    _x = -8;
                    _y = this.top_container.getContentSize().height + 15;
                } else if (v == FunctionIconVo.type.right_top_2) {
                    _x = -8;
                    _y = this.top_container.getContentSize().height - 100;
                }
                var icon_widget = icon_container.getComponent(cc.Widget);
                if (icon_widget) {
                    this.icon_widget_list[v] = icon_widget;
                }
            }

        }

        LoaderManager.getInstance().loadRes(PathTool.getItemRes("1"), function(res) {
            this.coin_sp.spriteFrame = res
        }.bind(this))
        LoaderManager.getInstance().loadRes(PathTool.getItemRes("3"), function(res) {
                this.gold_sp.spriteFrame = res
            }.bind(this))
            // 加载完成之后注册监听
        this.registerEvent();

        // 创建挑战按钮
        this.createChallengeEffect();
        this.updateRoleData();
        this.max_dun_id = this.mainui_controller.max_dun_id
        if (this.max_dun_id != null) {
            this.checkUnLockStatus(this.max_dun_id);
        }
        // -- 判断等级解锁主按钮
        this.checkUnLockStatusByLev()
            // -- 所有活动的时间倒计时,统一用一个定时器在这里做处理
        if (this.function_time_ticket == null) {
            this.action_list = require("action_controller").getInstance().getAllActionList()
            this.function_time_ticket = gcore.Timer.set(function() {
                this.functionTimeTicketList();
            }.bind(this), 1000, -1)
        }

        if (USE_SDK == true && NEED_ADAPTIVE_SDK[window.PLATFORM_TYPR]) {
            this.coin_nd.x = -28;
            // this.gold_nd.x = -28;
            this.coin_label_nd.x = 29;
            // this.gold_label_nd.x = 29;
            this.Sprite_8.x = -60;
            // this.Sprite_10.x = -60;
            this.Sprite_10.active = false;
        }


        // 小游戏需要调整顶部栏
        if (window.PLATFORM_TYPR == "WX_SDK" || window.PLATFORM_TYPR == "SH_SDK" || PLATFORM_TYPR == "QQ_SDK") {
            if (window.WX_FIT) {
                var add_val = this.root_wnd.height * window.WX_FIT;
                cc.log("微信小游戏适配菜单栏");
                console.log("add_val");
                var top_wdg = this.top_container.getComponent(cc.Widget);
                var con1_wdg = this.icon_container_list[1].getComponent(cc.Widget);
                top_wdg.top += add_val;
                con1_wdg.top += add_val;

            }
        }

        // 关闭loading界面
        LoginController.getInstance().updateLoading(1);
        this.close_login_ticket = gcore.Timer.set(function() {
            LoginController.getInstance().openLoginWindow(false);
            gcore.Timer.del(this.close_login_ticket);
            IS_LOADING = false;
            if (PLATFORM_TYPR == "SH_RH" || PLATFORM_TYPR == "SH_SDK") {
                SDK.submitLogin();
                if (USE_SDK == true && PLATFORM_TYPR == "SH_SDK") {
                    SDK.dataPlacement(90500);
                }
            } else if (USE_SDK == true && PLATFORM_TYPR == "WX_SDK") {
                SDK.loginLog();
            }
            gcore.GlobalEvent.fire(MainuiEvent.LOADING_ENTER_SCENE);
        }.bind(this), 200, 1)

        //背包红点
        let BackpackController = require("backpack_controller")
        BackpackController.getInstance().getModel().getHeroChipRedPoint()

        //红点
        let ctrlCachesRed = this.mainui_controller.getCachesBtnRed()
        if (ctrlCachesRed) {
            for (let i = 0; i < ctrlCachesRed.length; ++i) {
                this.updateBtnTipsPoint(ctrlCachesRed[i][0], ctrlCachesRed[i][1]);
            }
            this.mainui_controller.resetCachesRetData()
        }

        this.updateShenqi();
        // let Widget = this.prompt_container.getComponent(cc.Widget)
        // if (this.task_tips_panel == null) {
        //     Widget.bottom = 144
        // } else {
        //     Widget.bottom = 334.28;
        // }
        // Widget.updateAlignment()
    },

    refreshPageItem: function(item) {
        var ActivityController = require("activity_controller");
        item.itemBG = item.getChildByName("main_container").getChildByName("itemBG");
        var data = Config.holiday_role_data.data_sub_activity;
        var data1 = Config.holiday_role_data.data_sub_personal_activity;
        var key = item.data.bid + "_" + item.data.camp_id;
        var info = data[key];
        if (!info) {
            info = data1[key];
        }
        if (!info) {
            return;
        }
        var res = info.res_bg + "_" + "small";
        LoaderManager.getInstance().loadRes("ui_res/bannerui/" + res + ".png", function(res) {
            if (res) {
                item.itemBG.getComponent(cc.Sprite).spriteFrame = res;
            }
        }.bind(this));
        item.on(cc.Node.EventType.TOUCH_END, (event) => {
            var controller = require("action_controller");
            controller.getInstance().openActionMainPanel(true, null, item.data.bid);
            ActivityController.getInstance().openActivityPopup(false);
        })
    },

    //初始化活动banner
    initNewActivity: function() {
        if (this.activity_scrollview_list) {
            this.activity_scrollview_list.deleteMe();
        }
        this.activity_scrollview_list = null;
        var ActivityController = require("activity_controller");
        var model = ActivityController.getInstance().getModel();
        this.dataList = model.getActivityList();
        if (this.dataList.length == 0 || this.role_vo.lev < 5) {
            return;
        }

        this.new_activity.active = true;
        this.pageview.on('touchmove', this.updateActivityPoint, this);
        this.pageview.on('touchend', this.updateActivityPoint, this);
        this.pageview.on('page-turning', this.updateActivityPoint, this);
        this.pageviewComponent.removePageAtIndex();
        this.pageviewComponent.removeAllPages();
        for (let index in this.dataList) {
            let infoData = this.dataList[index];
            var item = cc.instantiate(this.pageItem);
            if (item) {
                item.data = infoData;
                item.index = index;
                this.pageItemList[index] = item;
            }
            this.pageviewComponent.addPage(item);
            this.refreshPageItem(item);
        }
        this.initActivityPoint(this.dataList);
        this.scheduleActivity();

        return;
        this.click_nd = this.new_activity.getChildByName("click");
        this.click_nd.width = cc.winSize.width;
        this.click_nd.height = cc.winSize.height;
        var scroll_view_size = this.activity_scrollview.getContentSize();
        var ActivityItem = require("activity_item_panel");
        var setting = {
            item_class: ActivityItem, // 单元类
            start_x: 0, // 第一个单元的X起点
            space_x: 10, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: 0, // y方向的间隔
            item_width: 408, // 单元的尺寸width
            item_height: 128, // 单元的尺寸height
            row: 1, // 行数，作用于水平滚动类型
            col: 0, // 列数，作用于垂直滚动类型
            delay: 2,
            item_obj: { width: 408, height: 128 },
        }
        var CommonScrollView = require("common_scrollview");
        this.activity_scrollview_list = new CommonScrollView();
        this.activity_scrollview_list.createScroll(this.activity_scrollview, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);
        let extend = { iType: 1 };
        let callBack = function(activity) {
            var controller = require("action_controller");
            controller.getInstance().openActionMainPanel(true, null, activity.bid);
        };
        this.activity_scrollview_list.setData(this.dataList, callBack, extend);
        this.activity_scrollview_list.setInertiaEnabled(false);
        this.initActivityPoint(this.dataList);

        this.scheduleActivity();
    },

    initActivityPoint: function(activityList) {
        let len = activityList.length;
        if (!this.point_nd) {
            this.point_nd = this.activity_point_content.getChildByName("point");
        }

        // point_nd.index = 0;
        // this.activityPointList[point_nd.index] = point_nd;
        this.activity_point_content.removeAllChildren();
        for (let i = 0; i < len; i++) {
            let node = cc.instantiate(this.point_nd);
            node.index = i;
            this.activityPointList[i] = node;
            this.activity_point_content.addChild(node);
        }
        this.updateActivityPoint();
    },

    scheduleActivity: function() {
        if (this.key) {
            clearTimeout(this.key);
            this.key = null;
        }
        this.key = setTimeout(() => {
            this.curActivityIndex = this.pageviewComponent.getCurrentPageIndex();
            this.curActivityIndex = (this.curActivityIndex + 1) % this.dataList.length;
            this.pageviewComponent.scrollToPage(this.curActivityIndex);
            this.updateActivityPoint();
            this.scheduleActivity();
        }, 5000)
    },

    updateActivityPoint: function() {
        this.curActivityIndex = this.pageviewComponent.getCurrentPageIndex();
        for (let index in this.activityPointList) {
            var point = this.activityPointList[index];
            if (index == this.curActivityIndex) {
                point.getChildByName("mask").active = false;
                point.getChildByName("selected").active = true;
            } else {
                point.getChildByName("mask").active = true;
                point.getChildByName("selected").active = false;
            }
        }
    },



    //功能按钮的响应
    onMenuButton: function(event) {
        let sender = event.target;
        let index = sender.index;
        if (this.menuListBtnState[index].is_lock) {
            return;
        }
        if (index == 0) {
            this.mainui_controller.iconClickHandle(MainUiConst.icon.daily); //任务
        } else if (index == 1) {
            this.mainui_controller.iconClickHandle(MainUiConst.icon.friend); //好友
        } else if (index == 2) {
            require("hero_controller").getInstance().openHeroLibraryMainWindow(true) //图鉴
        } else if (index == 3) {
            this.mainui_controller.iconClickHandle(MainUiConst.icon.rank); //排行榜
        } else if (index == 4) {
            this.mainui_controller.iconClickHandle(MainUiConst.icon.mail); //邮件
        } else if (index == 5) {
            require("notice_controller").getInstance().openNocticeWindow(true); //公告
        } else if (index == 6) {
            RoleController.getInstance().openRoleInfoView(true); //头像设置
        }
    },

    updateMenuData: function() { //更新一下按钮是基本信息
        var controller = null;
        for (let index in this.menuListBtnState) {
            let infoData = this.menuListBtnState[index];
            if (index == 0) {
                controller = require("task_controller").getInstance();
                var TaskConst = require("task_const");
                var model = controller.getModel();
                var taskList = model.getTaskList();
                infoData.is_bRed = false;
                for (let index in taskList) {
                    if (taskList[index].finish == TaskConst.task_status.finish) {
                        infoData.is_bRed = true;
                    }
                }
                infoData.is_lock = false;
            } else if (index == 1) {
                controller = require("friend_controller").getInstance();
                var award_num = controller.getModel().getAwardNum() || 0;
                var appl_num = controller.getModel().getApplyNum() || 0;
                if (appl_num > 0 || award_num > 0) {
                    infoData.is_bRed = true;
                } else {
                    infoData.is_bRed = false;
                }
                infoData.is_lock = false;
            } else if (index == 2) {
                var data = Config.city_data.data_base[sceneConst.CenterSceneBuild.library];
                var role_vo = RoleController.getInstance().getRoleVo();
                if (role_vo.lev >= data.activate[0][1]) {
                    infoData.is_lock = false;
                } else {
                    infoData.is_lock = true;
                }
                infoData.is_bRed = false;
            } else if (index == 3) {
                var data = Config.function_data.data_info[MainUiConst.icon.rank];
                if (data.activate[0][0] == "dun") {
                    if ((this.max_dun_id >= data.activate[0][1])) {
                        infoData.is_lock = false;
                    } else {
                        infoData.is_lock = true;
                    }
                }
                infoData.is_bRed = false;
            } else if (index == 4) {
                controller = require("mail_controller").getInstance();
                var model = controller.getModel();
                var value = model.red_status_list[1];
                infoData.is_bRed = false;
                if (value > 0) {
                    infoData.is_bRed = true;
                    infoData.label = value > 99 ? "99+" : value;
                }
                infoData.is_lock = false;
            } else if (index == 5) {
                //公告原先不做处理
                infoData.is_bRed = false;
                infoData.is_lock = false;
            } else if (index == 6) {
                //头像原先设置不做处理
                infoData.is_bRed = false;
                infoData.is_lock = false;
            }
        }
    },

    refreshCardUI: function() {
        for (let index in this.cardUIList) {
            let node = this.cardUIList[index];
            if (index == 0) { //限时召唤（暂时无界面）
                // var data = MainUiController.getInstance().getFucntionIconVoById(require("mainui_const").icon.festival);
                var hassummon = require("action_controller").getInstance().checkHasActionSummonOpen();
                if (hassummon) {
                    node.mask.active = false;
                    node.label.active = false;
                    node.is_lock = false;
                    node.lock.active = false;
                    node.active = true;
                    let rpstatus = require("action_controller").getInstance().getHasSummonRedPoint();
                    node.red_point.active = rpstatus;
                } else {
                    node.active = false;
                }
            } else if (index == 1) { //常驻
                var data = Config.city_data.data_base[sceneConst.CenterSceneBuild.summon];
                var role_vo = RoleController.getInstance().getRoleVo();
                if (role_vo.lev < data.activate[0][1]) {
                    node.is_lock = true;
                    node.mask.active = true;
                    node.lock.active = true;
                    node.label.active = true;
                    node.red_point.active = false;
                    node.label.getComponent(cc.Label).string = data.desc;
                } else {
                    node.mask.active = false;
                    node.label.active = false;
                    node.is_lock = false;
                    node.lock.active = false;
                    var controller = require("partnersummon_controller").getInstance();
                    var model = controller.getModel();
                    model.updateMainSceneRedPoint();
                    if (model.getIsShowRed()) {
                        node.is_bRed = true;
                        node.red_point.active = true;
                    } else {
                        node.is_bRed = false;
                        node.red_point.active = false;
                    }
                }
            }
        }
    },

    refreshMenuUI: function() { //刷新按钮状态
        for (let index in this.menuListBtn) {
            let infoData = this.menuListBtnState[index];
            let child = this.menuListBtn[index];
            if (infoData.is_lock) {
                child.active = false;
            } else {
                child.active = true;
                if (infoData.is_bRed) {
                    child.red_point.active = true;
                    if (index == 4) { //邮件特殊
                        child.red_point.getChildByName("label").getComponent(cc.Label).string = infoData.label;
                    }
                } else {
                    child.red_point.active = false;
                }
            }
        }
    },

    //神器任务
    updateShenqi: function() {
        // let task_container = this.hide_container.getChildByName("task_container");
        // let shop_status = require("shop_controller").getInstance().getModel().checkIsHaveAllHallows();
        // let limit_dun = Config.function_data.data_base[7].activate[0][1];
        let limit_lev = 6;
        if (Config.quest_data.data_const) {
            limit_lev = Config.quest_data.data_const.task_open.val[1];
        }
        let role_vo = RoleController.getInstance().getRoleVo();
        if (this.task_tips_panel == null && role_vo.lev >= limit_lev) {
            let TaskTipsPanel = require("task_tips_panel");
            this.task_tips_panel = new TaskTipsPanel(this);
            this.task_container.active = true;
            this.task_tips_panel.setParent(this.task_container);
            this.task_tips_panel.show();
            // let Widget = this.prompt_container.getComponent(cc.Widget)
            // Widget.bottom = 334.28;
            // Widget.updateAlignment()
        }
    },
    deleteTaskTip() {
        if (this.task_tips_panel) {
            this.task_tips_panel.deleteMe()
            this.task_tips_panel = null;
        }
        let Widget = this.prompt_container.getComponent(cc.Widget)
        Widget.bottom = 144
        Widget.updateAlignment()
    },
    getTaskTipsPanel: function() {
        return this.task_tips_panel.root_wnd;
    },

    // 创建挑战动画
    createChallengeEffect: function() {
        var btn_object = this.bottom_btn_list[MainUiConst.new_btn_index.drama_scene];
        if (btn_object == null) {
            return;
        }
        LoaderManager.getInstance().loadRes("spine/E51130/action.atlas", (function(res) {
            btn_object.skeleton.skeletonData = res;
            btn_object.skeleton.setAnimation(0, "action1", true);
        }).bind(this))
    },

    checkActivtiyItem: function() {
        var posx = this.activity_scrollview_list.getCurContainerPosX();
        var list = this.activity_scrollview_list.getItemList();
        for (let index in list) {
            if (index == this.curActivityIndex) {
                continue;
            }
            let item = list[index];
            if (item && item.params) {
                // cc.log(posx,item.x,item.params.width,Math.abs((posx+item.params.width/2) + item.x))
                if (Math.abs(-(posx - item.params.width / 2) - item.x) < item.params.width / 2 || Math.abs((posx + item.params.width / 2) + item.x) < item.params.width / 2) {
                    this.curActivityIndex = Number(index);
                    this.activity_scrollview_list.scrollTo(index, 0.5);
                    this.updateActivityPoint();
                }
            }
        }
    },

    registerEvent: function() {

        gcore.GlobalEvent.bind(ActivityEvent.RefreshActivityData, (function() {
            this.initNewActivity();
        }.bind(this)));

        gcore.GlobalEvent.bind(ActivityEvent.RefreshMainUIData, (function() {
            this.initNewActivity();
        }.bind(this)));

        //活动banner监听
        // this.new_activity.on(cc.Node.EventType.MOUSE_UP,(event)=>{
        //   if(this.activity_scrollview_list)
        //       this.checkActivtiyItem();
        // });
        // if(this.click_nd){
        //   this.click_nd.on(cc.Node.EventType.MOUSE_UP,(event)=>{
        //     if(this.activity_scrollview_list)
        //         this.checkActivtiyItem();
        //   });
        // }
        this.notice_1.on(cc.Node.EventType.TOUCH_END, function(event) {
            require("notice_controller").getInstance().openNocticeWindow(true);
        }, this);
        //更新邮件
        if (this.update_mail == null) {
            var MailEvent = require("mail_event");
            this.update_mail = gcore.GlobalEvent.bind(MailEvent.UPDATE_ITEM, (function() {
                this.updateMenuData();
                this.refreshMenuUI();
            }).bind(this))
        }
        //召唤
        this.bnt_limited_card.on(cc.Node.EventType.TOUCH_END, (event) => {
            require("action_controller").getInstance().openActionSummonView(true);
        });
        this.bnt_resident_card.on(cc.Node.EventType.TOUCH_END, (event) => {
            var PartnersummonController = require("partnersummon_controller");
            PartnersummonController.getInstance().openPartnerSummonWindow(true);
        });
        this.prompt_tips_btn.on('click', function() {
            this._onClickPromptTips()
        }, this)
        this.head_container.on(cc.Node.EventType.TOUCH_END, function(event) {
            RoleController.getInstance().openRoleInfoView(true);
        }, this);
        this.coin_touch.on(cc.Node.EventType.TOUCH_END, function(event) {
            ExchangeController.getInstance().openExchangeMainView(true);
        }, this);
        this.gold_touch.on(cc.Node.EventType.TOUCH_END, function(event) {
            if (!this.is_hero_panel) {
                require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE)
            } else {
                var BackpackController = require("backpack_controller");
                BackpackController.getInstance().openTipsSource(true, Utils.getItemConfig(22));
            }
        }, this);
        // this.handle_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
        //     this.shrinkBtnContainer();
        // }.bind(this));

        // 聊天
        this.chat_newmsg_event = gcore.GlobalEvent.bind(EventId.CHAT_NEWMSG_FLAG, function() {
            RedMgr.getInstance().addCalHandler(this.updateChatMsgNum.bind(this));
        }.bind(this));

        //点金红点
        this.coin_touch_redpoint = gcore.GlobalEvent.bind(ExchangeEvent.Extra_Reward, function(data) {
            this.coin_redpoint.active = ExchangeController.getInstance().getModel().getRedStatus();
        }.bind(this))
        this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function(key, val) {
            switch (key) {
                case "power":
                    this.updateRolePower();
                    break;
                case "lev":
                    this.updateRoleLev();
                    this.checkUnLockStatusByLev(val)
                    this.initNewActivity();
                    break;
                case "name":
                    this.updateRoleName();
                    break;
                case "coin":
                    this.updateRoleCoin();
                    break;
                case "gold":
                case "gold_hard":
                    this.updateRoleGold();
                    break;
                case "face_id":
                    this.player_head.setHeadRes(val);
                    break;
                case "avatar_base_id":
                    this.player_head.setFrameRes(val);
                    break;
                case "vip_lev":
                    this.updateRoleVip();
                    break;
                case "exp":
                    this.updateRoleExp();
                    break;
                case "exp_max":
                    this.updateRoleExp();
                    break;
                case "hero_exp":
                    this.updateHeroExp();
                    break;
                default:
                    break;
            }
            this.updateMenuData(); //刷新一下状态
            this.refreshMenuUI();
            this.refreshCardUI();
        }), this);

        //系统提示增加
        if (!this.update_prompt_tips) {
            this.update_prompt_tips = gcore.GlobalEvent.bind(PromptEvent.ADD_PROMPT_DATA, function(data) {
                // -- 主城正在显示且不在聊天界面才显示气泡
                if (this.is_open && !ChatController.getInstance().isChatOpen()) {
                    this.showPromptBubble(data)
                    let model = PromptController.getInstance().getModel()
                    let list = model.getPromptList()
                    if (Utils.getArrLen(list) > 0) {
                        this.showPromptTips(true, list)
                    }
                }
            }.bind(this))
        }
        //系统提示移除
        if (!this.remove_prompt_tips) {
            this.remove_prompt_tips = gcore.GlobalEvent.bind(PromptEvent.REMOVE_PROMPT_DATA, function() {
                let model = PromptController.getInstance().getModel()
                let list = model.getPromptList()
                if (Utils.getArrLen(list) > 0) {
                    this.showPromptTips(true, list)
                } else {
                    this.showPromptTips(false)
                }
            }.bind(this))
        }
        this.prompt_mask.on('touchend', function() {
            this.prompt_mask.active = false;
            this.prompt_tips_layout.active = false;
        }, this)
    },

    open: function() {
        if (this.root_wnd) {
            this.handleHideContainer(true)
            this.checkShowNewPromptBubble()
            this.updateMenuData();
            this.refreshCardUI()
            this.refreshMenuUI()
        }
    },

    // 打开显示的时候不需要马上显示出来,因为可能从一个界面切换到另外一个界面 这个时候不需要显示
    handleHideContainer: function(status) {
        this.hide_container_status = status
        if (this.wait_update == null) {
            this.wait_update = gcore.Timer.set((function() {
                if (this.hide_container_status == true) {
                    this.is_open = this.hide_container_status
                    this.hide_container.active = this.is_open;
                    this.new_hide_container.active = this.is_open;
                    this.notice_1.active = this.is_open;
                    this.functionUpdateList();
                    gcore.Timer.del(this.wait_update);
                    this.wait_update = null;
                }
            }).bind(this), 200, -1);
        }
    },

    getHideContainerStatus: function() {
        return this.hide_container_status;
    },

    close: function() {
        if (this.hide_container) {
            this.is_open = false
            this.hide_container_status = false
            this.hide_container.active = false
            this.new_hide_container.active = false;
            this.notice_1.active = false;
        }
        // if(this.function_time_ticket){
        // gcore.Timer.del(this.function_time_ticket);
        // this.function_time_ticket = null;
        // }
    },

    // 切换主ui的状态
    changeMainUiStatus: function(index, sub_type, extend_data, iType, callback) {
        // message(Utils.getPayItemsText(Config.charge_data.data_charge_data,3));
        var btn_object = this.bottom_btn_list[index];
        if (btn_object == null || !btn_object.is_unlock) {
            message(btn_object.config.desc)
            return
        }
        // 切磋中的时候,不需要切换
        if (this.checkFightClickStatus()) {
            return;
        }
        // 如果待选中的是同一个
        if ((this.cur_select_index == index) && (index != MainUiConst.new_btn_index.main_scene)) {
            if (index == MainUiConst.new_btn_index.drama_scene) {
                Utils.closeAllWindow();
            }
            return;
        }
        if (this.cur_select_index == index) {
            return;
        }
        this.setMaiuiBtnStatus(index);

        // 关闭所有窗体
        Utils.closeAllWindow();

        // 只要不是剧情副本,都切出战斗
        if (index != MainUiConst.new_btn_index.drama_scene) {
            this.battle_controller.requestCutOutBattle()
            this.battle_controller.getModel().clearBattleScene();
            // clearBattleScene
            this.changeBackgroundMusic();
        }

        if (index == MainUiConst.new_btn_index.main_scene) {
            var mainSceneCtrl = require("mainscene_controller").getInstance();
            mainSceneCtrl.enterMainScene(true);
            this.open();
            this.handleHideContainer(true)
        } else if (index == MainUiConst.new_btn_index.partner) {
            var hero_controller = require("hero_controller").getInstance();
            //hero_controller.openHeroBagWindow(true, sub_type)
            hero_controller.openHeroMainWindow(true, sub_type);
        } else if (index == MainUiConst.new_btn_index.backpack) {
            var controller = require("backpack_controller").getInstance()
            controller.openMainWindow(true, sub_type)
        } else if (index == MainUiConst.new_btn_index.drama_scene) {
            this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Darma)
            if (iType == 1) {
                var controller = require("battle_drama_controller");
                controller.getInstance().requestGetHookTimeAwards(callback);
            }
        } else if (index == MainUiConst.new_btn_index.esecsice) {
            //require("esecsice_controller").getInstance().openEsecsiceView(true);
            require("esecsice_controller").getInstance().openEsecsiceMainView(true);
        } else if (index == MainUiConst.new_btn_index.guild) {
            require("guild_controller").getInstance().checkOpenGuildWindow()
                //  清楚主界面上面的红点
            var GuildskillController = require("guildskill_controller");
            GuildskillController.getInstance().getModel().clearGuildSkillIconRed();
        } else if (index == MainUiConst.new_btn_index.shop) {
            var controller = require("mall_controller").getInstance();
            controller.openMallMainWindow(true);
            // var controller = require("shop_controller").getInstance();
            // if (extend_data) {
            //     var shop_id = extend_data[0];
            //     var index = extend_data[1];
            //     var magic_id = extend_data[2];
            //     controller.openHallowsMainWindow(true, shop_id, index, magic_id);
            // } else {
            //     controller.openHallowsMainWindow(true);
            // }

        }
        this.doChangeBySubType(index, sub_type, extend_data);
        this.updateMenuData();
        this.refreshMenuUI();
        this.refreshCardUI();
        HeroController.getInstance().stopPlayHeroVoice();
    },

    // 只要不是剧情战斗,都切刀指定音乐
    changeBackgroundMusic: function() {
        Utils.playMusic(AUDIO_TYPE.SCENE, "s_002", true);
    },

    //跳转处理
    doChangeBySubType: function(main_type, sub_type, extend_data) {
        if (main_type == null || sub_type == null) return
        this.sub_type = sub_type;
        gcore.Timer.set(function() {
            if (this.sub_type && this.sub_type != sub_type) return
            if (main_type == MainUiConst.new_btn_index.main_scene) {
                if (sub_type == MainUiConst.sub_type.arena_call) {
                    var SceneConst = require("scene_const");
                    var ArenaConst = require("arena_const");
                    require("mainscene_controller").getInstance().openBuild(SceneConst.CenterSceneBuild.arena, ArenaConst.arena_type.loop)
                } else if (sub_type == MainUiConst.sub_type.champion_call) {
                    var SceneConst = require("scene_const");
                    var ArenaConst = require("arena_const");
                    require("mainscene_controller").getInstance().openBuild(SceneConst.CenterSceneBuild.arena, ArenaConst.arena_type.rank)
                } else if (sub_type == MainUiConst.sub_type.guild_boss) {
                    if (this.role_vo && this.role_vo.gid == 0) {
                        message(Utils.TI18N("您暂时还没有加入公会"))
                    } else {
                        this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.GuildDun)
                    }
                } else if (sub_type == MainUiConst.sub_type.startower) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.StarTower)
                } else if (sub_type == MainUiConst.sub_type.partnersummon) {
                    require("partnersummon_controller").getInstance().openPartnerSummonWindow(true)
                } else if (sub_type == MainUiConst.sub_type.escort) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Escort, extend_data)
                } else if (sub_type == MainUiConst.sub_type.wonderful) {
                    if (typeof(extend_data) == "number") {
                        var ActionConst = require("action_const");
                        require("action_controller").getInstance().openActionMainPanel(true, ActionConst.ActionType.Wonderful, extend_data)
                    }
                } else if (sub_type == MainUiConst.sub_type.godbattle) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Godbattle)
                } else if (sub_type == MainUiConst.sub_type.world_boss) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.WorldBoss)
                } else if (sub_type == MainUiConst.sub_type.function_icon) {
                    this.mainui_controller.iconClickHandle(extend_data)
                } else if (sub_type == MainUiConst.sub_type.guildwar) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.GuildWar)
                } else if (sub_type == MainUiConst.sub_type.ladderwar) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.LadderWar)
                } else if (sub_type == MainUiConst.sub_type.primuswar) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.PrimusWar)
                } else if (sub_type == MainUiConst.sub_type.expedit_fight) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.ExpeditFight)
                } else if (sub_type == MainUiConst.sub_type.endless) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Endless)
                } else if (sub_type == MainUiConst.sub_type.dungeonstone) {
                    this.mainui_controller.requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.DungeonStone, extend_data)
                } else if (sub_type == MainUiConst.sub_type.seerpalace) { // -- 先知殿
                    if (extend_data && typeof(extend_data) == "number") {
                        require("seerpalace_controller").getInstance().openSeerpalaceMainWindow(true, extend_data)
                    } else {
                        require("seerpalace_controller").getInstance().openSeerpalaceMainWindow(true)
                    }
                } else if (sub_type == MainUiConst.sub_type.adventure) { // -- 跳转神界冒险
                    require("adventure_controller").getInstance().requestEnterAdventure();
                } else if (sub_type == MainUiConst.sub_type.forge_house) { //锻造屋
                    if (extend_data && typeof(extend_data) == "number") {
                        require("forgehouse_controller").getInstance().openForgeHouseView(true, extend_data);
                    } else {
                        require("forgehouse_controller").getInstance().openForgeHouseView(true);
                    }
                }
            } else if (main_type == MainUiConst.new_btn_index.drama_scene) {
                if (sub_type == MainUiConst.sub_type.dungeon_auto) {
                    var battle_drama_model = BattleDramaController.getInstance().getModel()
                    var drama_data = battle_drama_model.getDramaData()
                    if (battle_drama_model && drama_data) {
                        var data = battle_drama_model.getSingleBossData(drama_data.max_dun_id)
                        BattleDramaController.getInstance().openDramBossInfoView(true, data)
                    }
                }
            }
        }.bind(this), 200, 1)
    },

    // 是否在观战或者切磋,这个时候出二级提示,退出
    checkFightClickStatus: function() {
        var BattleController = require("battle_controller");
        var is_click_status = BattleController.getInstance().getIsClickStatus();
        var combat_type = BattleController.getInstance().getModel().getCombatType();
        if (is_click_status) {
            var BattleConst = require("battle_const");
            var str = Utils.TI18N("正在观看录像或切磋中，是否退出?")
            if (combat_type == BattleConst.Fight_Type.HeroTestWar) {
                str = Utils.TI18N("正在观看战斗演示，是否切换界面?")
            }
            var comfire_fun = function() {
                BattleController.getInstance().csFightExit();
            }.bind(this);
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, "決定", comfire_fun, "取り消し");
        } else {

        }
        return is_click_status;
    },

    // 改变按钮状态
    setMaiuiBtnStatus: function(index) {
        if (this.cur_select_index == index) {
            return;
        }
        if (this.cur_select_btn) {
            // if (this.cur_select_index == MainUiConst.new_btn_index.drama_scene) {
            //     if (this.cur_select_btn.skeleton && this.cur_select_btn.skeleton.skeletonData) {
            //         this.cur_select_btn.skeleton.setAnimation(0, "action1", true);
            //     }
            // } else {
            this.cur_select_btn.normal.active = true
            this.cur_select_btn.selected.active = false
                // this.cur_select_btn.btn.setPosition(this.cur_select_btn.init_x, this.cur_select_btn.init_y)
                // }
        }
        this.cur_select_index = index;
        var btn_object = this.bottom_btn_list[index];
        this.cur_select_btn = btn_object
        if (btn_object) {
            // if (this.cur_select_index == MainUiConst.new_btn_index.drama_scene) {
            //     if (this.cur_select_btn.skeleton && this.cur_select_btn.skeleton.skeletonData) {
            //         this.cur_select_btn.skeleton.setAnimation(0, "action2", true);
            //     }
            // } else {
            btn_object.normal.active = false
            btn_object.selected.active = true
                // btn_object.btn.setPosition(btn_object.init_x, btn_object.init_y + 10)
                // }
        }

        // 设置选中的ui战斗类型,这里是需要记录的.要不然可能战斗和ui对不上
        var fight_type = this.getUIFightByIndex(index);
        this.mainui_controller.setUIFightType(fight_type);
    },

    // 根据主ui下面的标识,设置当前ui的战斗类型
    getUIFightByIndex: function(index) {
        switch (index) {
            case MainUiConst.new_btn_index.main_scene:
                return MainUiConst.ui_fight_type.main_scene;
            case MainUiConst.new_btn_index.partner:
                return MainUiConst.ui_fight_type.partner;
            case MainUiConst.new_btn_index.backpack:
                return MainUiConst.ui_fight_type.backpack;
            case MainUiConst.new_btn_index.drama_scene:
                return MainUiConst.ui_fight_type.drama_scene;
            case MainUiConst.new_btn_index.esecsice:
                return MainUiConst.ui_fight_type.esecsice;
            case MainUiConst.new_btn_index.guild:
                return MainUiConst.ui_fight_type.guild;
            case MainUiConst.new_btn_index.shop:
                return MainUiConst.ui_fight_type.shop;
            default:
                return MainUiConst.ui_fight_type.main_scene;
        }
    },

    // 当前所处的主城主按钮标签
    getMainUIIndex: function() {
        return this.cur_select_index;
    },

    // 更新聊天num
    updateChatMsgNum: function() {
        if (window.IS_PC) {
            return;
        }
        var chat_model = ChatController.getInstance().getModel();
        var red_num = chat_model.getUnreadNum();
        if (red_num > 0) {
            this.chat_red_bg.active = true;
            if (red_num > 99)
                red_num = "+99";
            this.chat_red_num.string = red_num;
        } else {
            this.chat_red_bg.active = false;
        }
    },

    // 更新角色数据
    updateRoleData: function() {
        this.updateRoleName();
        this.updateRoleLev();
        this.updateRoleCoin();
        this.updateRoleGold();
        this.updateRolePower();
        this.updateRoleHead();
        this.updateRoleVip();
        this.updateRoleExp();
        this.updateRoleHeadFrame();
    },

    updateRoleName: function() {
        this.name_label.string = this.role_vo.name;
    },

    updateRoleLev: function() {
        this.lev_label.string = this.role_vo.lev;
    },

    updateRoleCoin: function() {
        this.coin_label.string = Utils.getMoneyString(this.role_vo.coin);
    },

    updateRoleGold: function() {
        if (!this.is_hero_panel)
            this.gold_label.string = Utils.getMoneyString(this.role_vo.getTotalGold());
    },

    updateRolePower: function() {
        this.fight_label.string = this.role_vo.power;
    },

    updateRoleHead: function() {
        this.player_head.setHeadRes(this.role_vo.face_id);
    },

    updateRoleHeadFrame: function() {
        this.player_head.setFrameRes(this.role_vo.avatar_base_id);
    },

    updateRoleExp: function() {
        if (this.role_vo == null || this.role_vo.exp == null || this.role_vo.exp_max == null) return
        var pro = this.role_vo.exp / this.role_vo.exp_max;
        this.exp_bar.scaleX = pro;
    },

    // 剧情章节变化的时候,开启下面图标
    checkUnLockStatus: function(max_dun_id) {
        if (max_dun_id == null) return;
        this.max_dun_id = max_dun_id;
        let is_unlock = false
        for (let k = 0; k < this.bottom_btn_list.length; ++k) {
            let btn = this.bottom_btn_list[k]
            if (btn.config && btn.config.activate) {
                let activate = btn.config.activate[0]
                if (activate[0] == "dun") {
                    is_unlock = (max_dun_id >= activate[1])
                    if (is_unlock != btn.is_unlock) {
                        btn.is_unlock = is_unlock
                        if (btn.notice) {
                            btn.notice.active = (!is_unlock)
                        }
                        // if(is_unlock == false){
                        //     setChildUnEnabled(true, btn)
                        // }else{
                        //     setChildUnEnabled(false, btn)
                        // }
                    }
                }
            }
        }
        this.updateShenqi();
        this.updateMenuData();
        this.refreshMenuUI();
        this.refreshCardUI();
    },
    //升级的时候判断等级开启
    checkUnLockStatusByLev(lev) {
        if (this.role_vo == null) return;
        let is_unlock = false
        for (let k = 0; k < this.bottom_btn_list.length; ++k) {
            let btn = this.bottom_btn_list[k]
            if (btn.config && btn.config.activate) {
                let activate = btn.config.activate[0]
                if (activate[0] == "lev") {
                    is_unlock = (this.role_vo.lev >= activate[1])
                    if (is_unlock != btn.is_unlock) {
                        btn.is_unlock = is_unlock
                        if (btn.notice) {
                            btn.notice.active = (!is_unlock)
                        }
                        // if(is_unlock == false){
                        //     setChildUnEnabled(true, btn)
                        // }else{
                        //     setChildUnEnabled(false, btn)
                        // }
                    }
                }
            }
        }
        if (this.task_tips_panel == null) {
            this.updateShenqi()
        }
        this.updateMenuData();
        this.refreshMenuUI();;
        this.refreshCardUI();
    },
    // ---------------------- 图标部分 start---------------------- --
    //初始化技能图标列表
    addIconList: function(list) {
        if (list == null || Utils.next(list) == null) return;
        for (var k in list) {
            var vo = list[k];
            if (vo != null && vo.config != null) {
                if (!this.checkIconIn(vo.config.id)) {

                    this.render_list_dic[vo.config.id] = vo;
                    this.render_list.push(vo);
                }
            }
        }
        //这里先做一个排序
        if (this.render_list != null && Utils.next(this.render_list != null)) {
            this.render_list.sort(Utils.tableLowerSorter(["pos", "sort"]));
        }

        //开启计时器，准备创建图表f
        if (this.add_function_timer == null) {
            this.add_function_timer = gcore.Timer.set(function() {
                this.createFunctionIcon();
            }.bind(this), 2 / 60, -1)
        }
    },

    //动态添加一个图标
    addIcon: function(vo) {
        if (vo == null || vo.config == null || this.checkIconIn(vo.config.id)) return
        this.render_list_dic[vo.config.id] = vo;
        this.render_list.push(vo);
        this.render_list.sort(Utils.tableLowerSorter(["pos", "sort"]));

        //开启计时器,准备创建图标
        if (this.add_function_timer == null) {
            this.add_function_timer = gcore.Timer.set(function() {
                this.createFunctionIcon();
            }.bind(this), 2 / 60, -1)
        }
    },

    //监测一个图标是否存在
    checkIconIn: function(id) {
        if (this.function_list[id] != null || this.render_list_dic[id] != null) {
            return true
        }
        return false
    },

    //动态移除一个图标
    removeIcon: function(id) {
        var config = gdata("function_data", "data_info", [id]);
        if (config == null) return
        if (this.function_list[id] != null) {
            if (this.function_list[id].deleteMe) {
                this.function_list[id].deleteMe();
                this.function_list[id] = null;
            }
        }
        for (var i in this.render_list) {
            if (this.render_list[i].config.id == id) {
                this.render_list.splice(i, 1);
                break
            }
        }
        this.render_list_dic[id] = null;
        if (this.layout_list == null || this.layout_list[config.type] == null) return
        for (var i in this.layout_list[config.type]) {
            var v = this.layout_list[config.type][i];
            if (v && v.config.id == id) {
                this.layout_list[config.type].splice(i, 1);
                break
            }
        }
        this.refreshIconLayout();
        // this.updateIconLayout(config.type);
    },

    refreshIconLayout: function() { //刷新布局
        this.function_icon_index = 0;
        for (let index in this.function_list) {
            let info = this.function_list[index];
            if (info && info.data) {
                info.data.is_new = true;
            }
        }
        for (let index = 1; index <= 2; index++) {
            this.updateIconLayout(index)
        }
    },

    //创建一个图标
    createFunctionIcon: function() {
        if (!this.root_wnd) return;
        if (this.render_list == null || Utils.next(this.render_list) == null) {
            if (this.add_function_timer != null) {
                gcore.Timer.del(this.add_function_timer);
                this.add_function_timer = null;
            }
            return
        }
        // var data = this.render_list.shift();
        var data = this.render_list.splice(0, 1)[0];
        if (data == null) return
        this.render_list_dic[data.config.id] = null;
        //这类图标不需要在主界面显示
        if (data.config && data.config.is_show == 0) return
        this.addItemToTabArray(data);
    },

    //将图标添加到父节点容器
    addItemToTabArray: function(data) {
        if (data == null || data.config == null) return
        if (this.layout_list == null) {
            this.layout_list = {};
        }
        if (this.layout_list[data.config.type] == null) {
            this.layout_list[data.config.type] = [];
        }
        var is_new = true;
        for (var k in this.layout_list[data.config.type]) {
            var v = this.layout_list[data.config.type][k];
            if (v.config.id == data.config.id) {
                v = data;
                is_new = false;
                break
            }
        }
        data.is_new = is_new;
        this.layout_list[data.config.type].push(data);
        this.layout_list[data.config.type].sort(Utils.tableLowerSorter(["sort"]));
        this.updateIconLayout(data.config.type);
    },

    //更新图标位置
    updateIconLayout: function(type) {
        if (type == 3 || type == 4) {
            return;
        }
        if (this.layout_list == null || this.layout_list[type] == null || Utils.next(this.layout_list[type]) == null) return
        var layout = this.getContainerByType(2);
        if (layout == null) return
        var len = Utils.getArrLen(this.layout_list[type]);
        var icon = null;
        var index = 0;
        for (let i = 0; i < len; i++) {
            let data = this.layout_list[type][i];
            if (data && data.config) {
                if (this.function_list[data.config.id] == null) {
                    if (data.is_new == true) {
                        var FunctionIcon = require("function_icon_panel");
                        icon = new FunctionIcon(data);
                        this.function_list[data.config.id] = icon;
                        if (data.config.id == 505 || data.config.id == 0) {
                            continue;
                        }
                        icon.show();
                        icon.setParent(layout);
                    }
                }
                icon = this.function_list[data.config.id];
                if (data.config.id == 505 || data.config.id == 0) {
                    continue;
                }
                if (icon != null && data.is_new == true) {
                    data.is_new = false;

                    if (type == 1 && data.config.id == 503) { //七日目标特殊处理
                        icon.setPosition(-670, -45);
                        continue;
                    }
                    if (type == 3 || type == 4) {
                        return;
                    }
                    this.function_icon_index++;
                    this.setIconPosition(icon, this.function_icon_index, layout, type);
                    index++;
                }
            }
        }
    },

    //根据位置获取图标父节点信息
    getContainerByType: function(type) {
        if (this.icon_container_list != null) {
            return this.icon_container_list[type];
        }
    },

    //设置图标的位置
    setIconPosition: function(icon, index, layout, type) {

        var size = layout.getContentSize();
        var _x = 0;
        var _y = 0;
        var off_height = 10;
        // if (type == FunctionIconVo.type.right_top_1) {                          // 右上,从右往左
        //     _x = -icon.width * 0.5 - (index % this.left_max_sum) * (this.left_off + icon.width);
        //     _y = -icon.height * 0.5 - Math.floor(index / this.left_max_sum) * (off_height + icon.height);
        // } else if (type == FunctionIconVo.type.right_bottom_1) {                // 右下,从右往左
        //     _x = -icon.width * 0.5 - (index % this.left_max_sum) * (this.left_off + icon.width);
        // } else if (type == FunctionIconVo.type.right_bottom_2) {                // 右下,从下往上
        //     _y = icon.height * 0.5 + index * (icon.height + this.right_off);
        // } else if (type == FunctionIconVo.type.right_top_2) {                   // 右上,从上往下
        // Math.floor(this.function_icon_index/6)*(icon.width + off_height)
        // _x = -icon.width * 0.5;
        // _y = -icon.height * 0.5 - ((this.function_icon_index-1)%6) * (icon.height + off_height);
        // }
        if (icon.original == null || Utils.getNorKey(icon.original.x, icon.original.y) != Utils.getNorKey(_x, _y)) {
            _x = -icon.width * 0.5 - Math.floor((this.function_icon_index - 1) / 6) * (icon.width + off_height);
            _y = -icon.height * 0.5 - ((this.function_icon_index - 1) % 6) * (icon.height + off_height);
            // console.error(icon);
            icon.setPosition(_x, _y);
            icon.original = cc.v2(_x, _y);
        }

        // //动态调整 right_top_2 的位置
        // var off_y = 0;
        // if (type == FunctionIconVo.type.right_top_1) {
        //     off_y = Math.abs(_y - off_height - icon.height * 0.5);             // 算出总高度
        // } else if (type == FunctionIconVo.type.right_top_2) {
        //     var layout_list = this.layout_list[FunctionIconVo.type.right_top_1];
        //     if (layout_list) {
        //         var len = Utils.getArrLen(layout_list);
        //         var temp_y = icon.height * 0.5 - Math.ceil(len / this.left_max_sum) * (off_height + icon.height);
        //         off_y = Math.abs(temp_y - off_height - icon.height * 0.5);
        //     }
        // }
        // if (off_y != 0 && this.top_2_off_y != off_y) {
        //     this.top_2_off_y = off_y;
        //     var top_1 = this.icon_container_list[FunctionIconVo.type.right_top_1];
        //     var top_2 = this.icon_container_list[FunctionIconVo.type.right_top_2];
        //     if (top_1 && top_2) {
        //         top_2.y = top_1.y - off_y;
        //     }
        // }
    },

    //定时器的统一倒计时
    functionTimeTicketList: function() {
        if (this.function_list && Utils.next(this.function_list) != null) {
            for (var k in this.function_list) {
                var icon = this.function_list[k];
                if (icon && icon.data && icon.data.end_time && icon.data.end_time > 0) {
                    if (icon.updateTime) {
                        icon.updateTime();
                    }
                }
            }
        }
        if (this.action_list && Utils.next(this.action_list) != null) {
            for (let i in this.action_list) {
                let icon = this.action_list[i]
                if (icon && icon.updateTime && icon.remain_sec && icon.remain_sec > 0) {
                    icon.updateTime()
                }
            }
        }
    },

    //更新icon列表
    functionUpdateList: function() {
        if (this.function_list && Utils.next(this.function_list) != null) {
            for (var k in this.function_list) {
                var icon = this.function_list[k];
                if (icon && icon.updateIconRes) {
                    icon.updateIconRes();
                }
            }
        }
    },

    setBottomStatus: function(status) {
        if (this.bottom_container)
            this.bottom_container.active = status;
    },

    setTopStatus: function(status) {
        if (this.top_container)
            this.top_container.active = status;
    },

    updateRoleVip: function() {
        this.vip_label.setNum(this.role_vo.vip_lev);
    },

    // --==============================--
    // --@id:下面按钮序号
    // --@data:data 可以是单纯bool值，或者是table形式{[1]={id=xxx,status=false}}
    // --@return 
    // --==============================--
    updateBtnTipsPoint: function(id, data) {
        if (!this.bottom_btn_list[id]) return;
        if (data == null) {
            this.btn_cache_tips[id] = null;
        } else {
            if (typeof(data) != "object") {
                this.btn_cache_tips[id] = data;
            } else {
                if (this.btn_cache_tips[id] == null) {
                    this.btn_cache_tips[id] = {};
                }
                if (data.bid != null) {
                    this.btn_cache_tips[id][data.bid] = data.status;
                } else {
                    for (var i in data) {
                        if (data[i].bid != null) {
                            this.btn_cache_tips[id][data[i].bid] = data[i].status;
                        }
                    }
                }
            }
        }

        var bool = false;
        if (this.btn_cache_tips[id]) {
            if (typeof(this.btn_cache_tips[id]) == "object") {
                for (var i in this.btn_cache_tips[id]) {
                    if (this.btn_cache_tips[id][i] == true) {
                        bool = true;
                        break;
                    }
                }
            } else {
                bool = this.btn_cache_tips[id];
            }
        }
        var btn_object = this.bottom_btn_list[id];
        if (btn_object && btn_object.tips_status != bool) {
            btn_object.tips_status = bool;
            if (btn_object.tips_point) {
                btn_object.tips_point.active = bool;
            }
        }
    },

    getRootWnd: function(cb) {
        this.root_wnd_cb = cb;
        if (this.root_wnd)
            this.root_wnd_cb(this.root_wnd);
    },

    // ---------------------- 图标部分 end---------------------- --
    //收缩右下角的图标
    shrinkBtnContainer: function() {
        if (this.is_in_shrink == true) return
        this.is_in_shrink = true;

        var layout_1 = this.icon_container_list[FunctionIconVo.type.right_bottom_1];
        var layout_2 = this.icon_container_list[FunctionIconVo.type.right_bottom_2];
        this.is_shrink = !this.is_shrink;

        layout_1.active = true;
        layout_2.active = true;

        var len = 100;
        var move_by_1 = null;
        var move_by_2 = null;
        var fade_1 = null;
        var fade_2 = null;

        if (this.is_shrink == true) {
            move_by_1 = cc.moveBy(0.1, cc.v2(len, 0));
            move_by_2 = cc.moveBy(0.1, cc.v2(0, -len));
            fade_1 = cc.fadeOut(0.1);
            fade_2 = cc.fadeOut(0.1);
        } else {
            move_by_1 = cc.moveBy(0.1, cc.v2(-len, 0));
            move_by_2 = cc.moveBy(0.1, cc.v2(0, len));
            fade_1 = cc.fadeIn(0.1);
            fade_2 = cc.fadeIn(0.1);
        }

        var call_fun_1 = cc.callFunc(function() {
            this.is_in_shrink = false;
            if (this.is_shrink == true) {
                layout_1.active = false;
            }
        }.bind(this))
        var call_fun_2 = cc.callFunc(function() {
            if (this.is_shrink == true) {
                layout_2.active = false;
            }
        }.bind(this))
        layout_1.runAction(cc.sequence(cc.spawn(move_by_1, fade_1), call_fun_1));
        layout_2.runAction(cc.sequence(cc.spawn(move_by_2, fade_2), call_fun_2));
    },


    showPower: function(power_add, last_power) {
        if (!power_add || !last_power) return;
        if (this.power_show_nd == null) {
            LoaderManager.getInstance().loadRes(PathTool.getPrefabPath("mainui", "power_show"), function(Prefab) {
                if (this.power_show_nd) {
                    this.runPowerAction(power_add, last_power);
                    return
                }
                this.power_show_nd = Prefab;
                ViewManager.getInstance().addToSceneNode(this.power_show_nd, SCENE_TAG.dialogue)
                this.power_show_nd.setPosition(-SCREEN_WIDTH * 0.5, -SCREEN_HEIGHT * 0.5)
                let power_show_nd = this.power_show_nd.getChildByName("container")
                this.power_show_nd.power_sk = power_show_nd.getChildByName("ani_con").getComponent(sp.Skeleton)
                let tex_con_nd = power_show_nd.getChildByName("txt_con");
                this.power_show_nd.old_power_rb = tex_con_nd.getChildByName("old_power").getComponent(cc.RichText);
                if (cc.sys.browserType == cc.sys.BROWSER_TYPE_IE) {
                    this.power_show_nd.old_power_rb.lineHeight = 60;
                }
                this.power_show_nd.add_power_lb = tex_con_nd.getChildByName("add_power").getComponent(cc.Label);
                var anima_res = PathTool.getEffectRes(179);
                var anima_path = PathTool.getSpinePath(anima_res);
                LoaderManager.getInstance().loadRes(anima_path, function(power_sd) {
                    this.power_show_nd.power_sk.skeletonData = power_sd;
                    this.runPowerAction(power_add, last_power);
                }.bind(this))
            }.bind(this))
        } else {
            this.runPowerAction(power_add, last_power);
        }

        // this.power_show_nd = this.root_wnd.getChildByName("power_show");
        // this.power_sk = this.power_show_nd.getChildByName("ani_con").getComponent(sp.Skeleton);
        // var tex_con_nd = this.power_show_nd.getChildByName("txt_con");
        // this.old_power_rb = tex_con_nd.getChildByName("old_power").getComponent(cc.RichText);
        // this.add_power_lb = tex_con_nd.getChildByName("add_power").getComponent(cc.Label);
        // if (this.power_sk.skeletonData) {
        //     this.runPowerAction(power_add, last_power);
        // } else {
        //     var anima_res = PathTool.getEffectRes(179);
        //     var anima_path = PathTool.getSpinePath(anima_res);
        //     LoaderManager.getInstance().loadRes(anima_path, function(power_sd) {
        //         this.power_sk.skeletonData = power_sd;
        //         this.runPowerAction(power_add, last_power);
        //     }.bind(this))
        // }
    },

    runPowerAction: function(power_add, last_power) {
        this.power_show_nd.power_sk.setAnimation(0, "action", false);

        if (this.add_timer) {
            gcore.Timer.del(this.add_timer);
            this.add_timer = null;
        }
        this.power_show_nd.stopAllActions();

        var last_power_str = last_power + "";
        var last_power_ds = "";
        if (cc.sys.browserType == cc.sys.BROWSER_TYPE_IE) {
            last_power_ds = last_power_str;
        } else {
            for (var item_i in last_power_str) {
                last_power_ds += "<img src='type23_" + last_power_str[item_i] + "'/>"
            }
        }
        this.calcu_num = 0;
        this.add_timer = gcore.Timer.set(function(power_add) {
            this.calcu_num += 1;
            if (this.calcu_num < 5) {
                this.power_show_nd.add_power_lb.string = "+" + Math.ceil(this.calcu_num * 0.2 * power_add);
            } else {
                this.power_show_nd.add_power_lb.string = "+" + power_add;
            }
        }.bind(this, power_add), 200, 5)


        this.power_show_nd.old_power_rb.string = last_power_ds;
        this.power_show_nd.opacity = 255;

        console.log("输出字符串", this.power_show_nd.old_power_rb.string);
        console.log("输出字符串", last_power_ds);

        var delay_time = new cc.delayTime(1);
        var action = new cc.fadeOut(1);
        var finish_cb = new cc.callFunc(function() {
            if (this.add_timer) {
                gcore.Timer.del(this.add_timer);
                this.add_timer = null;
            }
            if (this.power_show_nd) {
                this.power_show_nd.destroy()
                this.power_show_nd = null;
            }
        }.bind(this));
        var power_act = cc.sequence(delay_time, action, finish_cb);
        this.power_show_nd.runAction(power_act);
    },

    updateHeroExp: function() {
        if (this.is_hero_panel)
            this.gold_label.string = Utils.getMoneyString(this.role_vo.hero_exp);
    },

    changeHeroStatus: function(is_hero) {
        this.is_hero_panel = is_hero;
        if (is_hero) {
            LoaderManager.getInstance().loadRes(PathTool.getItemRes("22"), function(res) {
                this.gold_sp.spriteFrame = res;
            }.bind(this))
            this.gold_label.string = Utils.getMoneyString(this.role_vo.hero_exp);
        } else {
            LoaderManager.getInstance().loadRes(PathTool.getItemRes("3"), function(res) {
                this.gold_sp.spriteFrame = res
            }.bind(this))
            this.gold_label.string = Utils.getMoneyString(this.role_vo.getTotalGold());
        }
    },
    creatorChatBtn() {
        this.chat_btn_nd = new cc.Node("chat_btn");
        let widget = this.chat_btn_nd.addComponent(cc.Widget)
        widget.isAlignBottom = true
        widget.bottom = 367;
        this.chat_btn_nd.x = 317
        ViewManager.getInstance().addToSceneNode(this.chat_btn_nd, SCENE_TAG.top);
        let btn = this.chat_btn_nd.addComponent(cc.Button);
        btn.transition = cc.Button.Transition.SCALE;
        btn.zoomScale = 0.9;
        btn.duration = 0.1;
        LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("mainui", "mainui_chat_main_icon"), (function(res_object) {
            this.chat_btn_nd.addComponent(cc.Sprite).spriteFrame = res_object;
        }).bind(this));
        this.chat_red_bg = new cc.Node("chat_red_bg");
        LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("mainui", "mainui_1034"), (function(res_object) {
            this.chat_red_bg.addComponent(cc.Sprite).spriteFrame = res_object;
        }).bind(this));
        this.chat_btn_nd.addChild(this.chat_red_bg);
        this.chat_red_bg.setPosition(23, 25);
        this.chat_red_bg.active = false;
        this.chat_red_num = new cc.Node("chat_red_num").addComponent(cc.Label);
        this.chat_red_num.fontSize = 18;
        this.chat_red_num.lineHeight = 18;
        this.chat_red_num.horizontalAlign = cc.macro.TextAlignment.CENTER;
        this.chat_red_num.verticalAlign = cc.macro.TextAlignment.CENTER;
        this.chat_red_num.node.color = new cc.Color(164, 0, 0);
        this.chat_red_bg.addChild(this.chat_red_num.node)
        let touch_began = cc.v2()
        let is_move = false;
        this.chat_btn_nd.on("touchstart", function(event) {
            is_move = false
            touch_began = event.getLocation()
        }, this)
        this.chat_btn_nd.on("touchmove", function(event) {
            let pos = event.getLocation()
            if (!is_move) {
                let is_click = Math.abs(pos.x - touch_began.x) <= 30 && Math.abs(pos.y - touch_began.y) <= 30
                if (is_click == false) {
                    is_move = true;
                }
            }
            if (is_move) {
                pos = ViewManager.getInstance().getSceneNode(SCENE_TAG.top).convertToNodeSpaceAR(pos)
                if (!this.checkPosInRect(pos)) return
                this.chat_btn_nd.setPosition(pos)
            }
        }, this)
        this.chat_btn_nd.on("touchend", function(event) {
            if (is_move == false) {
                Utils.playButtonSound(1)
                var ChatCtrl = require("chat_controller");
                ChatCtrl.getInstance().openChatPanel();
                this.showChatBtn(false)
            }
        }, this)
        let GuideController = require("guide_controller")
        if (GuideController.getInstance().isInGuide()) {
            this.setMainUIChatBubbleStatus(false)
        }
    },
    setMainUIChatBubbleStatus(status) {
        this.chat_bubble_status = status
        if (this.chat_btn_nd) {
            this.chat_btn_nd.stopAllActions()
        }
        if (status) {
            this.root_wnd.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function() {
                if (this.chat_bubble_status == true) {
                    this.showChatBtn(this.chat_bubble_status)
                }
            }, this)))
        } else {
            this.showChatBtn(this.chat_bubble_status)
        }
    },
    checkPosInRect(pos) {
        // let width = cc.winSize.width > SCREEN_WIDTH ? SCREEN_WIDTH : cc.winSize.width;
        // let size = cc.size(width,cc.winSize.height)
        let size = this.root_wnd.getContentSize()
        let left_x = -(size.width / 2) + 40
        let right_x = size.width / 2 - 40
        let top_y = size.height / 2 - (this.top_container.height + 60)
        let bottom_y = -(size.height / 2) + (this.bottom_container.height + 60)
        if (pos.x < left_x) return false
        if (pos.y < bottom_y) return false
        if (pos.x > right_x) return false
        if (pos.y > top_y) return false
        return true
    },
    showChatBtn(status) {
        if (this.chat_btn_nd) {
            this.chat_btn_nd.active = status
        }
    },
    // 检测是否有新的气泡提示
    checkShowNewPromptBubble() {
        let model = PromptController.getInstance().getModel()
        let data = model.getNotBubblePrompt()
        if (data) {
            this.showPromptBubble(data)
        }
        let list = model.getPromptList()
        if (Utils.getArrLen(list) > 0) {
            this.showPromptTips(true, list)
        }
    },
    // -- 显示系统提示气泡
    showPromptBubble(data) {
        if (data) {
            data.setShowBubbleStatus(true)
            this.prompt_bubble_layout.stopAllActions()
            this.prompt_tips_btn.active = (true)
            this.prompt_bubble_layout.active = (true)
            this.prompt_desc.string = (data.name)
            this.prompt_desc._forceUpdateRenderData(true)
            let size = this.prompt_desc.node.getContentSize()
            this.prompt_bubble.setContentSize(cc.size(size.width + 60, this.prompt_bubble_size.height))

            let fadein = cc.fadeIn(0.7)
            let fadeout = cc.fadeOut(0.7)
            this.prompt_bubble_layout.runAction(cc.sequence(fadein, fadeout))
        }
    },
    // -- 显示系统提示
    showPromptTips(status, list) {
        cc.log(status, list, "showPromptTips")
        if (status == true && list && Utils.next(list) != null) {
            this.prompt_tips_btn.active = (true)
            this.prompt_tips_scroll.destroyAllChildren()
            let max_width = 0
            for (let k = 0; k < list.length; ++k) {
                let v = list[k]
                this.count_size_label.string = (v.name)
                this.count_size_label._forceUpdateRenderData(true)
                let size = this.count_size_label.node.getContentSize()
                if (max_width < size.width) {
                    max_width = size.width
                }
            }
            if (max_width < 168) {
                max_width = 168 //原本的大小
            }
            // --字的宽度和按钮的宽度相差20
            max_width = max_width + 20

            let len = Utils.getArrLen(list)
            let button_height = 49
            let button_height_space = 12
            let res = PathTool.getUIIconPath("mainui", "mainui_tips_bg1")
            let max_height = Math.max(this.prompt_tips_scroll_size.height, len * (button_height_space + button_height))
            let scroll_height = Math.min(len * (button_height_space + button_height), 160)

            // --根据大小调整下scroll和背景大小
            let tips_scroll_width = max_width + 4
            let tips_bg_width = tips_scroll_width + (this.prompt_tips_bg_size.width - this.prompt_tips_scroll_size.width)
            this.prompt_tips_scroll.setContentSize(cc.size(tips_scroll_width, scroll_height))
                // this.prompt_tips_scroll:setInnerContainerSize(cc.size(tips_scroll_width, scroll_height))
            this.prompt_tips_bg.setContentSize(cc.size(tips_bg_width, scroll_height + 60))

            if (scroll_height > 160) {
                this.prompt_tips_scroll.setContentSize(cc.size(tips_scroll_width, max_height))
            }
            for (let i = 0; i < list.length; ++i) {
                let v = list[i]
                let item = new cc.Node()
                let image = item.addComponent(cc.Sprite)
                image.type = cc.Sprite.Type.SLICED;
                image.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                item.setPosition(tips_scroll_width / 2, 5 + (button_height_space + button_height) * i)
                item.setContentSize(cc.size(max_width, button_height))
                item.setAnchorPoint(0.5, 0)
                LoaderManager.getInstance().loadRes(res, function(SpriteFrame) {
                    image.spriteFrame = SpriteFrame;
                }.bind(this))
                this.prompt_tips_scroll.addChild(item)
                let label = new cc.Node().addComponent(cc.Label)
                label.node.color = new cc.Color().fromHEX(Config.color_data.data_color16[175])
                label.string = v.name;
                label.fontSize = 22;
                label.lineHeight = 26;
                label.node.y = button_height / 2
                item.addChild(label.node)
                let btn = item.addComponent(cc.Button)
                btn.transition = cc.Button.Transition.SCALE;
                btn.duration = 0.1;
                btn.zoomScale = 0.9;
                item.on('touchend', function() {
                    this.prompt_mask.active = false;
                    this.mainui_controller.onClickPromptTipsItem(v)
                    this.prompt_tips_layout.active = (false)
                }, this)
            }

        } else {
            this.prompt_tips_btn.active = (false)
            this.prompt_tips_layout.active = (false)
            if (this.prompt_mask) {
                this.prompt_mask.active = (false)
            }
        }
    },
    _onClickPromptTips() {
        if (this.prompt_tips_layout.active) {
            this.prompt_tips_layout.active = false;
            if (this.prompt_mask) {
                this.prompt_mask.active = false;
            }
        } else {
            this.prompt_tips_layout.active = (true)
            if (this.prompt_mask) {
                this.prompt_mask.active = true;
            }
        }
    },
    //创建深海小程序客服浮标
    creatorCustomerServiceBtn: function() {
        if (this.customer_service) {
            this.customer_service.deleteMe();
            this.customer_service = null;
        }
        this.customer_service = Utils.createClass("customer_service_window");
        var container = require("viewmanager").getInstance().getSceneNode(SCENE_TAG.loading);

        this.customer_service.setParent(container);
        this.customer_service.show();
    },


});

module.exports = MainUIView;