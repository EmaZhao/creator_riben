// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     英雄查看皮肤立绘界面
// <br/>Create: 2019-09-11 20:22:43
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var CommonScrollViewSingleLayout = require("common_scrollview_single");
var BackPackConst = require("backpack_const");
var BackpackController = require("backpack_controller");
var CommonAlert = require("commonalert");
var ActionController = require("action_controller");
var MallConst = require("mall_const");
var MallController = require("mall_controller");
var BaseRole = require("baserole");
var HeroEvent = require("hero_event");
var MainUIController = require("mainui_controller");
var MainuiConst = require("mainui_const");


var Hero_skinWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_skin_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        //能否点击头像
        this.can_click_btn = true
        this.ctrl = HeroController.getInstance();
        this.model = this.ctrl.getModel();
        this.color_1 = new cc.Color(0x64, 0x32, 0x23, 0xff)
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background", cc.Sprite);
        this.background.node.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("hero_draw_bg", null, "hero"), function (sp) {
            this.background.spriteFrame = sp;
        }.bind(this))

        this.main_container = this.seekChild("main_container");

        //英雄名字
        this.hero_name_lb = this.seekChild("hero_name", cc.Label);
        this.hero_name_lb.string = "";
        this.title_name_lb = this.seekChild("title_name", cc.Label);
        this.title_name_lb.string = "";
        //英雄立绘
        this.hero_draw_icon_nd = this.seekChild(this.main_container, "hero_draw_icon");
        this.hero_draw_icon_sp = this.seekChild(this.main_container, "hero_draw_icon", cc.Sprite);
        this.hero_draw_icon_x = this.hero_draw_icon_nd.x;
        this.hero_draw_icon_y = this.hero_draw_icon_nd.y;

        //底部面板
        this.bottom_panel = this.seekChild(this.main_container, "bottom_panel");

        //英雄信息面板
        this.hero_panel = this.seekChild(this.bottom_panel, "hero_panel");
        this.hero_panel_x = this.hero_panel.x;
        this.hero_panel.x += cc.winSize.width * 2;
        this.hero_panel.active = true;

        this.mode_node = this.seekChild(this.hero_panel, "model_node");
        this.hero_panel_bg_nd = this.seekChild(this.hero_panel, "bg");
        this.line_nd = this.seekChild(this.hero_panel, "line");
        this.name_lb = this.seekChild(this.hero_panel, "name", cc.Label);


        //属性面板
        this.attr_panel = this.seekChild(this.bottom_panel, "attr_panel");
        this.attr_panel_x = this.attr_panel.x;
        this.attr_panel.x += cc.winSize.width * 2;
        this.attr_panel.active = true;

        let time_key = this.seekChild(this.attr_panel, "time_key", cc.Label);
        time_key.string = Utils.TI18N("有效时间:");
        let attr_key = this.seekChild(this.attr_panel, "attr_key", cc.Label);
        attr_key.string = Utils.TI18N("属性加成:");

        //时间
        this.time_val_lb = this.seekChild(this.attr_panel, "time_val", cc.Label);
        this.attr_item_list = {};

        this.show_btn = this.seekChild(this.bottom_panel, "show_btn");
        this.show_btn_icon_nd = this.seekChild(this.show_btn, "icon");
        this.left_btn = this.seekChild(this.bottom_panel, "left_btn");
        this.right_btn = this.seekChild(this.bottom_panel, "right_btn");

        this.lay_scrollview = this.seekChild(this.bottom_panel, "lay_scrollview");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.left_btn, function () {
            this.ctrl.openHeroSkinWindow(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.right_btn, function () { //确定选择当前皮肤做作为显示皮肤
            if (!this.hero_vo) return
            if (!this.skin_data_list) return
            let skin_data = this.skin_data_list[this.select_skin_index];
            if (skin_data && skin_data.is_skin_data) {
                //换成其他皮肤
                if (this.hero_vo.use_skin != skin_data.skin_id) {
                    this.ctrl.sender11019(this.hero_vo.partner_id, skin_data.skin_id)
                }
            } else {
                if (this.hero_vo.use_skin != 0) {
                    //换回原来皮肤
                    this.ctrl.sender11019(this.hero_vo.partner_id, 0);
                }
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.show_btn, function () {   //显示
            if (!this.hero_vo) return
            if (!this.skin_data_list) return

            if (this.is_show_attr) {
                this.is_show_attr = false;
                this.attr_panel.x += cc.winSize.width * 2;
                this.hero_panel.x = this.hero_panel_x;
                this.updateHeroInfo(1);
                if (this.show_btn_icon_nd) {
                    this.show_btn_icon_nd.setScale(-1);
                }
            } else {
                this.is_show_attr = true;
                let skin_data = this.skin_data_list[this.select_skin_index];
                this.hero_panel.x += cc.winSize.width * 2;
                if (skin_data && skin_data.is_skin_data) {
                    this.attr_panel.x = this.attr_panel_x;
                    this.updateAttrInfo();
                } else {
                    this.attr_panel.x += cc.winSize.width * 2;
                }
                if (this.show_btn_icon_nd) {
                    this.show_btn_icon_nd.setScale(1);
                }
            }
        }.bind(this), 2)

        this.addGlobalEvent(HeroEvent.Hero_Skin_Info_Event, function () {
            if (this.select_skin_index == null) return
            if (!this.skin_data_list) return
            for (let i in this.skin_data_list) {
                let v = this.skin_data_list[i];
                if (this.model.isUnlockHeroSkin(v.skin_id)) {
                    v.is_lock = false;
                } else {
                    v.is_lock = true;
                }
            }
            if (this.use_skin_index != null) {
                this.updateSkinList(this.use_skin_index);
                this.use_skin_index = null;
            } else {
                this.updateSkinList(this.select_skin_index);
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (hero_vo) {
        if (!hero_vo) return
        this.hero_vo = hero_vo;

        let bid_config = Config.partner_skin_data.data_partner_bid_info[this.hero_vo.bid];
        if (!bid_config) return

        let partner_config = Config.partner_data.data_partner_base[this.hero_vo.bid];
        if (partner_config) {
            this.hero_name_lb.string = partner_config.name;
        }
        //皮肤数据
        this.skin_data_list = [];

        for (let skin_id in bid_config) {
            let v = bid_config[skin_id];
            let data = {};
            data.is_skin_data = true;   //表示是皮肤数据

            if (this.model.isUnlockHeroSkin(v.skin_id)) {
                data.is_lock = false;
            } else {
                data.is_lock = true;
            }
            data.skin_id = skin_id;
            data.config = Config.partner_skin_data.data_skin_info[v.skin_id];
            this.skin_data_list.push(data);
        }
        this.skin_data_list.sort(Utils.tableLowerSorter(["skin_id"]));
        //第一个肯定是本体
        this.skin_data_list.unshift(this.hero_vo);

        let select_index = 0;
        let use_skin = this.hero_vo.use_skin || 0;
        if (use_skin != 0) {
            for (let i in this.skin_data_list) {
                let v = this.skin_data_list[i];
                if (v.skin_id == use_skin) {
                    select_index = i;
                }
            }
        }
        this.is_show_attr = true;
        this.updateSkinList(select_index);
    },

    updateSkinList: function (select_index) {

        if (this.scroll_view == null) {
            let scroll_view_size = this.lay_scrollview.getContentSize();
            let list_setting = {
                start_x: 0,
                space_x: 0,
                start_y: 0,
                space_y: 0,
                item_width: 120,
                item_height: 120,
                row: 1,
                col: 1,
                need_dynamic: true
            }
            this.scroll_view = new CommonScrollViewSingleLayout();
            this.scroll_view.createScroll(this.lay_scrollview, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, list_setting, cc.v2(0.5, 0.5))

            this.scroll_view.registerScriptHandlerSingle(this.createNewCell.bind(this), ScrollViewFuncType.CreateNewCell)
            this.scroll_view.registerScriptHandlerSingle(this.numberOfCells.bind(this), ScrollViewFuncType.NumberOfCells)
            this.scroll_view.registerScriptHandlerSingle(this.updateCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex)
            this.scroll_view.registerScriptHandlerSingle(this.onCellTouched.bind(this), ScrollViewFuncType.OnCellTouched)
            let max_count = Math.floor(scroll_view_size.width / list_setting.item_width);
            if (this.skin_data_list.length <= max_count) {
                this.scroll_view.setClickEnabled(false);
            }
        }
        var select_index = select_index || 0;
        this.scroll_view.reloadData(select_index);
    },

    //     --创建cell 
    // --@width 是setting.item_width
    // --@height 是setting.item_height
    createNewCell: function (width, height) {
        let cell = ItemsPool.getInstance().getItem("backpack_item");
        cell.initConfig(false, 1, false, true);
        cell.show();
        cell.setDefaultTip();
        cell.setQualityBG(BackPackConst.quality.orange);
        cell.addCallBack(function () {
            this.onCellTouched(cell)
        }.bind(this))
        return cell
    },

    //获取数据数量
    numberOfCells: function () {
        if (!this.skin_data_list) return 0
        return this.skin_data_list.length
    },

    // --更新cell(拖动的时候.刷新数据时候会执行次方法)
    // --cell :createNewCell的返回的对象
    // --index :数据的索引
    updateCellByIndex: function (cell, index) {
        this.startUpdate(100, function () {
            cell.index = index;
            let skin_data = this.skin_data_list[index];
            if (!skin_data) return
            let icon_res = null;
            if (skin_data.is_skin_data) {
                icon_res = PathTool.getHeadRes(skin_data.config.head_id);
                cell.setItemIcon(icon_res);
                if (skin_data.is_lock) {
                    cell.setItemIconUnEnabled(true);
                } else {
                    cell.setItemIconUnEnabled(false);
                }
            } else {
                let key = Utils.getNorKey(skin_data.bid, skin_data.star);
                let star_config = gdata("partner_data", "data_partner_star", [key]);
                if (star_config) {
                    icon_res = PathTool.getHeadRes(star_config.head_id);
                    cell.setItemIcon(icon_res);
                }

                cell.setItemIconUnEnabled(false);
            }

            if (this.select_skin_index != null && this.select_skin_index == index) {
                cell.setSelected(true);
            } else {
                cell.setSelected(false);
            }
        }.bind(this), 1);
    },

    //点击cell .需要在 createNewCell 设置点击事件
    onCellTouched: function (cell) {
        if (!this.can_click_btn) return
        if (cell.index == null) return
        let index = cell.index;
        let skin_data = this.skin_data_list[index];
        if (!skin_data) return
        if (skin_data.is_skin_data) {
            if (skin_data.is_lock) {
                this.setLockInfo(skin_data, index);
                return
            }
        }

        if (this.select_cell != null) {
            this.select_cell.setSelected(false);
        }
        this.select_cell = cell;
        this.select_cell.setSelected(true);
        this.updateSelectSkinInfo(index)
    },

    //更新选中的皮肤信息
    updateSelectSkinInfo: function (index) {
        if (!this.select_skin_index && this.select_skin_index == index) return
        this.select_skin_index = index;
        let skin_data = this.skin_data_list[this.select_skin_index];

        let name_str = "";

        if (skin_data.config) {
            name_str = skin_data.config.skin_name;
        } else {
            let config = gdata("partner_data", "data_partner_library", [skin_data.bid]);
            if (config) {
                name_str = config.title;
            }
        }
        this.title_name_lb.string = name_str;

        if (skin_data.is_skin_data) {
            this.skin_config = skin_data.config;
            if (this.is_show_attr) {
                this.attr_panel.x = this.attr_panel_x;
                this.updateAttrInfo();
            } else {
                this.attr_panel.x += cc.winSize.width * 2;
            }
        } else {
            //英雄对象
            this.skin_config = gdata("partner_data", "data_partner_library", [skin_data.bid]);
            this.attr_panel.x += cc.winSize.width * 2;
        }

        this.updateDrawInfo();
        if (!this.is_show_attr) {
            this.updateHeroInfo(2);
        }
    },

    setLockInfo: function (skin_data, index) {
        let dic_item_id = {};
        for (let i in skin_data.config.item_id_list) {
            let id = skin_data.config.item_id_list[i];
            dic_item_id[id] = true;
        }

        let have_item = null;
        let have_list = [];
        let list = BackpackController.getInstance().getModel().getBagItemList(BackPackConst.Bag_Code.BACKPACK) || {};
        for (let i in list) {
            let item = list[i];
            if (item && item.config && dic_item_id[item.config.id]) {
                //背包上有道具
                let data = {};
                if (item.config.client_effect[0] && item.config.client_effect[0][1]) {
                    data.time = item.config.client_effect[0][1];
                } else {
                    data.time = 1;
                }
                if (data.time == 0) {
                    //表示有永久的皮肤
                    have_item = item;
                    break
                }
                data.item_info = item;
                have_list.push(data);
            }
        }
        if (have_item) {
            //表示有永久的皮肤
            this.useSkinItemByID(have_item, index);
            return
        }

        if (have_list.length > 0) {
            have_list.sort(Utils.tableUpperSorter(["time"]));
            this.useSkinItemByID(have_list[0].item_info, index);
        } else {
            //说明该皮肤不能同商城获取
            // if (skin_data.config.is_shop == 0) {
            //     message(Utils.TI18N("暂未获取此皮肤，请前往相关活动或玩法中获取！"));
            // } else {
            this.gotoSkinAction(skin_data.config);
            // }
        }
    },

    //使用皮肤道具
    useSkinItemByID: function (have_item, index) {
        if (have_item.config) {
            let color = BackPackConst.getWhiteQualityColorStr(have_item.config.quality);
            let str = cc.js.formatStr(Utils.TI18N("已拥有解锁道具,是否消耗<color=#%s>%s</color>解锁该皮肤？"), color, have_item.config.name);
            let callback = function () {
                this.use_skin_index = index;
                BackpackController.getInstance().sender10515(have_item.id, 1);
            }.bind(this)
            CommonAlert.show(str, Utils.TI18N("确定"), callback, Utils.TI18N("取消"), null, 2, null, { title: Utils.TI18N("解锁皮肤") })
        }
    },

    //跳转活动id
    gotoSkinAction: function (config) {
        let callback = function () {
            //优先找皮肤活动
            if (config.action_bid != 0) {
                //是否存在
                let is_exist = ActionController.getInstance().checkActionExistByActionBid(config.action_bid);
                if (is_exist) {
                    Utils.closeAllWindow();
                    this.startUpdate(100, function () { ActionController.getInstance().openActionMainPanel(true, null, config.action_bid); }.bind(this), 1)
                    return
                }
            }

            if (config.main_id != null) {
                var is_has = MainUIController.getInstance().getFucntionIconVoById(config.main_id);
                if (is_has) {
                    Utils.closeAllWindow();
                    this.startUpdate(100, function () { ActionController.getInstance().openBuySkinWindow(true); }.bind(this), 1)
                    return
                }
            }

            //没有皮肤活动 找活动商城
            let shop_config = Config.exchange_data.data_shop_list[MallConst.MallType.HeroSkin];
            if (config.is_shop == 1 && shop_config && shop_config.sort != 0) {
                MallController.getInstance().openMallPanel(true, MallConst.MallType.HeroSkin)
                return
            }

            //没有活动商城 提示:
            message(Utils.TI18N("暂无该皮肤获取途径"));
        }.bind(this)

        let str = Utils.TI18N("当前暂未拥有该皮肤,是否前往获取？");
        CommonAlert.show(str, Utils.TI18N("确定"), callback, Utils.TI18N("取消"), null, null, null, { title: Utils.TI18N("解锁皮肤") });
    },

    //更新立绘信息
    updateDrawInfo: function () {
        if (!this.skin_config) return
        let draw_res_id = this.skin_config.draw_res;
        if (draw_res_id == null || draw_res_id == "") {
            draw_res_id = this.getDefaultDrawRes();
        }
        if (draw_res_id) {
            let bg_res = PathTool.getIconPath("herodraw/herodrawres", draw_res_id);
            if (this.hero_draw_icon_sp) {
                this.loadRes(bg_res, function (sp) {
                    this.hero_draw_icon_sp.spriteFrame = sp;
                }.bind(this))
            }
            if (this.skin_config.scale == 0) {
                this.hero_draw_icon_nd.scale = 1;
            } else {
                this.hero_draw_icon_nd.scale = this.skin_config.scale / 100;
            }

            if (this.skin_config.draw_offset && Utils.next(this.skin_config.draw_offset) != null) {
                var offset_x = this.skin_config.draw_offset[0][0] || 0;
                var offset_y = this.skin_config.draw_offset[0][1] || 0;
                this.hero_draw_icon_nd.setPosition(this.hero_draw_icon_x + offset_x, this.hero_draw_icon_y + offset_y);
            }
        }
    },

    //显示属性
    updateAttrInfo: function () {
        if (!this.skin_config) return
        let end_time = this.model.getHeroSkinInfoBySkinID(this.skin_config.skin_id);
        if (end_time != null) {
            if (end_time == 0) {
                this.time_val_lb.string = Utils.TI18N("永久");
                this.time_val_lb.node.stopAllActions();
            } else {
                let time = end_time - gcore.SmartSocket.getTime();
                if (time <= 0) {
                    this.time_val_lb.string = Utils.TI18N("00:00:00");
                } else {
                    Utils.commonCountDownTime(this.time_val_lb, time);
                }
            }
        }
        let y = 27;
        let width_item = 150;
        let offset_x = 150;
        let size = cc.size(width_item, 35);

        for (let i in this.attr_item_list) {
            let v = this.attr_item_list[i];
            v.bg_sp.node.active = false;
            v.key_rt.node.active = false;
        }

        for (let i in this.skin_config.skin_attr) {
            let v = this.skin_config.skin_attr[i];
            let x = 200 + (i - 1) * width_item + offset_x;
            if (this.attr_item_list[i] == null) {
                this.attr_item_list[i] = this.createAttrItem(x, y, size);
            } else {
                this.attr_item_list[i].bg_sp.node.active = true;
                this.attr_item_list[i].key_rt.node.active = true;
            }

            let arr = Utils.commonGetAttrInfoByKeyValue(v[0], v[1]);
            let str = cc.js.formatStr("<img src='%s'/> %s + %s", arr.icon, arr.attr_name, arr.attr_val);
            this.attr_item_list[i].key_rt.string = str;
            this.loadRes(arr.res, (function (resObject) {
                this.attr_item_list[i].key_rt.addSpriteFrame(resObject);
            }).bind(this));
        }
    },

    //创建属性item
    createAttrItem: function (x, y, size) {
        let item = {};
        let res = PathTool.getUIIconPath("hero", "partner_skin_03");
        item.bg_sp = Utils.createImage(this.attr_panel, null, x, y, cc.v2(0, 0.5), null, 0, true);
        this.loadRes(res, function (sp) {
            item.bg_sp.spriteFrame = sp;
        })
        item.bg_sp.node.setContentSize(size);
        item.key_rt = Utils.createRichLabel(22, this.color_1, cc.v2(0, 0.5), cc.v2(x + 10, y), 24, 380, this.attr_panel, "left");
        return item
    },

    //更新英雄信息
    //来源位置 1 表示 按show_btn 的   2 表示 按皮肤头像的
    updateHeroInfo: function (form_type) {
        let skin_data = this.skin_data_list[this.select_skin_index];
        let hero_config = null;
        let skin_id = 0;
        let hero_vo = this.skin_data_list[0];
        if (skin_data.is_skin_data) {
            hero_config = gdata("partner_skin_data", "data_hero_info", [skin_data.skin_id]);
            skin_id = skin_data.config.skin_id;
        }
        this.updateSpine(hero_vo, skin_id, form_type);

        //说明有传记
        if (hero_config) {
            // this.line_nd.active = true;
            // this.name_lb.node.active = true;
        }
    },

    //更新模型,也是初始化模型
    //@is_refresh  是否需要检测
    updateSpine: function (hero_vo, skin_id, form_type) {
        if (this.record_skin_id != null && this.record_skin_id == skin_id) return
        this.record_skin_id = skin_id;

        let fun = function () {
            if (!this.spine) {
                this.spine = new BaseRole();
                this.spine.setParent(this.mode_node);
                this.spine.setPosition(0, 104);
                this.spine.setData(BaseRole.type.partner, hero_vo, PlayerAction.show, true, 0.45, { skin_id: skin_id });
                this.spine.showShadowUI(true);
                let action = cc.fadeIn(0.2);
                this.spine.node.runAction(action);
            }
        }.bind(this)
        let callback = function () {
            this.spine.node.stopAllActions();
            this.spine.node.removeFromParent();
            this.spine = null;
            this.can_click_btn = true;
            fun();
        }.bind(this)
        if (this.spine) {
            this.can_click_btn = false;
            if (form_type == 2) {
                let action = cc.fadeOut(0.2);
                this.spine.node.runAction(cc.sequence(action, cc.callFunc(callback)))
            } else {
                callback();
            }
        } else {
            fun();
        }
    },

    //获取缺省的模型id
    getDefaultModeRes: function () {
        let partner_config = this.getPartnerConfig()[0];
        let star_config = this.getPartnerConfig()[1];
        if (partner_config && star_config) {
            return star_config.res_id
        }
    },

    //获取缺省的模型立绘
    getDefaultDrawRes: function () {
        let partner_config = this.getPartnerConfig()[0];
        let star_config = this.getPartnerConfig()[1];
        if (partner_config && star_config) {
            return partner_config.draw_res
        }
    },

    //获取英雄对应配置
    getPartnerConfig: function () {
        if (!this.hero_vo) return
        if (this.partner_config == null) {
            this.partner_config = Config.partner_data.data_partner_base[this.hero_vo.bid];
        }
        if (this.partner_config && this.star_config == null) {
            let key = Utils.getNorKey(this.partner_config.bid, this.partner_config.init_star);
            this.star_config = gdata("partner_data", "data_partner_star", [key]);
        }
        return [this.partner_config, this.star_config]
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.scroll_view) {
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
        this.time_val_lb.node.stopAllActions();
        this.ctrl.openHeroSkinWindow();
    },
})