////------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     跨服时空 主界面 
// <br/>Create: 2019-07-29 10:53:49
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CrossshowController = require("crossshow_controller");
var RankController = require("rank_controller");
var RankConstant = require("rank_constant");
var CrossshowEvent = require("crossshow_event");
var RoleController = require("role_controller");
var CommonScrollViewSingle = require("common_scrollview_single");
var BackpackController = require("backpack_controller");

var Crossshow_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("crossshow", "crossshow_main_window");
        // this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.cross_name_list = {};//跨服名字
        this.ctrl = CrossshowController.getIntance();
        this.role_ctrl = RoleController.getInstance();
        this.black_color = new cc.Color(0x00, 0x00, 0x00, 0xff);
        this.color_1 = new cc.Color(0x7c, 0xd7, 0x5d, 0xff);
        this.color_2 = new cc.Color(0xff, 0xe6, 0xce, 0xff);
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.backgound = this.seekChild("background");
        this.backgound.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("crossshow/crhosshow_bg"), function (sp) {
            this.backgound.getComponent(cc.Sprite).spriteFrame = sp;
        }.bind(this))

        this.main_container = this.seekChild("main_container");
        this.container_size = this.main_container.getContentSize();
        this.clost_btn = this.seekChild("close_btn");

        this.top_panel = this.seekChild("top_panel");
        this.title_name_lb = this.seekChild("title_name", cc.Label);
        this.title_name_lb.string = Utils.TI18N("跨服时空");

        this.lay_scrollview = this.seekChild(this.main_container, "lay_scrollview");

        this.bottom_panel = this.seekChild("bottom_panel");
        this.icon_scrollview = this.seekChild("icon_scrollview");

        let label_cross = this.seekChild(this.bottom_panel, "label_cross", cc.Label);
        label_cross.string = Utils.TI18N("当前跨服玩法");

        let label_tips = this.seekChild(this.bottom_panel, "label_tips", cc.Label);
        label_tips.string = Utils.TI18N("跨服时空每隔一段时间会重组");

        this.rule_btn = this.seekChild("rule_btn");
        this.rule_btn_lb = this.seekChild(this.rule_btn, "label", cc.Label);
        this.rule_btn_lb.string = Utils.TI18N("排行榜");

        this.adaptationScreen();
    },

    //设置适配屏幕
    adaptationScreen: function () {

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.clost_btn, function () {
            this.ctrl.openCrossshowMainWindow(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.rank_btn, function () {
            RankController.getIntance().openMainView(true, RankConstant.MainTabType.CrossRank);
        }.bind(this), 1)


        this.rule_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            let config = Config.cross_show_data.data_const.game_rule;
            var pos = event.touch.getLocation();
            if (config) {
                require("tips_controller").getInstance().showCommonTips(config.desc, pos);
            }
        });

        this.addGlobalEvent(CrossshowEvent.Get_Cross_Show_Info_Event, function (scdata) {
            if (!scdata) return
            this.setData(scdata);
        })
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        //世界等级
        this.world_lev = this.role_ctrl.getModel().getWorldLev() || 0;
        //个人等级
        this.role_vo = this.role_ctrl.getRoleVo();
        if (this.role_vo) {
            this.role_lev = this.role_vo.lev || 0;
        } else {
            this.role_lev = 0;
        }
        this.ctrl.sender22150();
        this.addEffect();
    },

    setData: function (data) {
        if (!data) return
        let list = [];
        for (let i in data.srv_list) {
            let v = data.srv_list[i];
            let srv_arr = Utils.getServerIndex(v.srv_id);
            let srv_index = srv_arr[0];
            let is_local = srv_arr[1];
            let s_data = {};
            if (srv_index == 0) {
                s_data.sort_index = 1;
                s_data.srv_name = Utils.TI18N("异域");
            } else {
                if (is_local) {
                    s_data.sort_index = 0;//本服
                    s_data.srv_name = cc.js.formatStr(Utils.TI18N("本服%s服"), srv_index);
                } else {
                    s_data.sort_index = 1;
                    s_data.srv_name = cc.js.formatStr(Utils.TI18N("%s服"), srv_index);
                }
            }
            s_data.srv_index = Number(srv_index);
            if (s_data.srv_index == null) {
                s_data.srv_index = 0;
            }
            s_data.world_name = cc.js.formatStr(Utils.TI18N("世界等级%s级"), v.world_lev);
            list[i] = s_data;
        }

        list.sort(Utils.tableLowerSorter(["sort_index", "srv_index"]));

        this.show_list = [];
        let count = Math.ceil(list.length / 2);
        for (let i = 1; i <= count; i++) {
            let left_data = list[i * 2 - 1];
            let right_data = list[i * 2];
            let data = {};
            data.left_data = left_data;
            data.right_data = right_data;
            this.show_list.push(data);
        }
        if (this.show_list.length == 0) {
            this.showNoInfo();
        } else {
            this.updateNameList();
        }
        this.initCrossInfo();
    },

    addEffect: function () {
        this.size = this.main_container.getSize();
        //流星
        if (this.scene_effect_1 == null) {
            this.scene_effect_1 = Utils.createEffectSpine(PathTool.getEffectRes(305), cc.v2(self.size.width * 0.5, self.size.height * 0.5), cc.v2(0.5, 0.5), true, PlayerAction.action)
            this.scene_effect_1.setParent(this.backgound);
        }

        //星星
        if (this.scene_effect_2 == null) {
            this.scene_effect_2 = Utils.createEffectSpine(PathTool.getEffectRes(306), cc.v2(self.size.width * 0.5, self.size.height * 0.5), cc.v2(0.5, 0.5), true, PlayerAction.action)
            this.scene_effect_2.setParent(this.backgound);
        }
    },

    showNoInfo: function () {
        if (!this.role_vo) return
        if (this.cross_icon != null) return
        let lay_scrollview_size = this.lay_scrollview.getContentSize();
        let x = lay_scrollview_size.width * 0.5;
        let y = lay_scrollview_size.height * 0.5 + 200;
        let icon_res = PathTool.getUIIconPath("crossshow", "crossshow_06");
        let cell = this.lay_scrollview;
        this.cross_icon = Utils.createImage(cell, icon_res, x, y, cc.v2(0.5, 0.5));
        // this.loadRes(icon_res,function(sp){
        //     this.cross_icon.spriteFrame = sp;
        // }.bind(this))

        this.cross_effect = Utils.createEffectSpine(PathTool.getEffectRes(376), cc.v2(x, y), cc.v2(0.5, 0.5), true, PlayerAction.action)
        this.cross_effect.setParent(cell);

        let res = PathTool.getUIIconPath("crossshow", "crossshow_02");
        this.left_level_bg = Utils.createImage(cell, res, x, y - 120, cc.v2(0.5, 0.5), null, null, true);
        this.left_level_bg.setContentSize(cc.size(156, 40));

        let arr = Utils.getServerIndex(this.role_vo.srv_id);
        let srv_index = arr[0];
        let is_local = arr[1];
        //左边名字
        let srv_name = cc.js.formatStr(Utils.TI18N("本服%s服"), srv_index);
        this.left_name = Utils.createLabel(22, this.color_1, this.black_color, x, y - 120, srv_name, cell, 2, cc.v2(0.5, 0.5))

        let world_name = cc.js.formatStr(Utils.TI18N("世界等级%s级"), this.world_lev);
        this.left_world_lev = Utils.createLabel(22, this.color_2, this.black_color, x, y - 156, world_name, cell, 2, cc.v2(0.5, 0.5));

        let tips = Utils.TI18N("该服尚未进行跨服分组(πvπ)");
        this.cross_show_tips = Utils.createLabel(24, this.color_2, this.black_color, x, y - 200, tips, cell, 2, cc.v2(0.5, 0.5));
    },

    updateNameList: function () {
        if (!this.show_list) return
        if (!this.scrollview_y) return
        if (!this.scrollview_height) return
        if (this.list_view == null) {
            let lay_scrollview_size = this.lay_scrollview.getContentSize();
            let scroll_view_size = cc.size(lay_scrollview_size.width, this.scrollview_height);

            let start_y = 135;
            let space_y = -10;
            let item_height = 250;
            let content_height = this.scrollview_height - start_y;

            let position_data_list = null;
            let max_count = Math.floor(content_height / (item_height + space_y));
            let count = this.numberOfCellsName();
            if (max_count >= count) {
                //如果数量不够单屏显示数量..居中显示
                position_data_list = [];
                let s_y = (content_height - (item_height + space_y) * count) * 0.5;
                let x = scroll_view_size.width * 0.5;
                for (let i = 0; i < count; i++) {
                    let y = content_height - s_y - ((item_height + space_y) * 0.5 + (i - 1) * (item_height + space_y));
                    position_data_list[i] = cc.v2(x, y);
                }
            }

            let setting = {
                start_x: 0,                  // 第一个单元的X起点
                space_x: 0,                    // x方向的间隔
                start_y: start_y,                    // 第一个单元的Y起点
                end_y: 0,
                space_y: space_y,                   // y方向的间隔
                item_width: scroll_view_size.width,               // 单元的尺寸width
                item_height: item_height,              // 单元的尺寸height
                delay: 1,
                col: 1,                         // 列数，作用于垂直滚动类型
                need_dynamic: true,
                position_data_list: position_data_list
            }

            this.list_view = new CommonScrollViewSingle();
            this.list_view.createScroll(this.lay_scrollview, cc.v2(scroll_view_size.width * 0.5, this.scrollview_y), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0))

            this.list_view.registerScriptHandlerSingle(this.createNewCellName.bind(this), ScrollViewFuncType.CreateNewCell)
            this.list_view.registerScriptHandlerSingle(this.numberOfCellsName.bind(this), ScrollViewFuncType.NumberOfCells)
            this.list_view.registerScriptHandlerSingle(this.updateCellByIndexName.bind(this), ScrollViewFuncType.UpdateCellByIndex)

            if (max_count >= count) {
                this.list_view.setClickEnabled(false);
            }
        }
        this.list_view.reloadData();
    },

    //创建cell
    //@width 是setting.item_width
    //@height 是setting.item_height
    createNewCellName: function (width, height) {
        let cell = new cc.Node();
        cell.setAnchorPoint(0, 0);
        cell.setContentSize(cc.size(width, height));

        cell.left_item = {};
        cell.right_item = {};

        //left_icon
        let icon_res = PathTool.getUIIconPath("crossshow", "crossshow_06");
        cell.left_item.icon = Utils.createImage(cell, icon_res, 146, 164, cc.v2(0.5, 0.5));
        cell.left_item.icon.node.scale = 0.66;

        //right_icon
        cell.right_item.icon = Utils.createImage(cell, icon_res, 463, 133, cc.v2(0.5, 0.5));
        cell.right_item.icon.node.scale = 0.66;

        let res = PathTool.getUIIconPath("crossshow", "crossshow_02");
        cell.left_item.level_bg = Utils.createImage(cell, res, 146, 76, cc.v2(0.5, 0.5), null, null, true);
        cell.left_item.level_bg.setContentSize(cc.size(156, 40));
        // cell.left_item.level_bg.set
        //右边背景
        cell.right_item.level_bg = Utils.createImage(cell, res, 463, 47, cc.v2(0.5, 0.5), null, null, true);
        cell.right_item.level_bg.setContentSize(cc.size(156, 40));

        //左边特效
        let effect_id = Utils.getEffectRes(377);
        cell.left_item.cross_effect = Utils.createEffectSpine(effect_id, cc.v2(146, 164), cc.v2(0.5, 0.5), true, PlayerAction.action);
        cell.left_item.cross_effect.node.scale = 0.66;
        cell.addChild(cell.left_item.cross_effect.node, 1);

        //右边特效
        effect_id = Utils.getEffectRes(376);
        cell.right_item.cross_effect = Utils.createEffectSpine(effect_id, cc.v2(463, 133), cc.v2(0.5, 0.5), true, PlayerAction.action);
        cell.right_item.cross_effect.node.scale = 0.66;
        cell.addChild(cell.right_item.cross_effect.node, 1);

        //线
        effect_id = Utils.getEffectRes(378);
        cell.line_effect1 = Utils.createEffectSpine(effect_id, cc.v2(width * 0.5, 150), cc.v2(0.5, 0.5), true, PlayerAction.action);
        cell.line_effect1.node.scale = 0.66;
        cell.line_effect1.node.setRotation(10);
        cell.addChild(cell.line_effect1.node, 1);

        //线2
        effect_id = Utils.getEffectRes(378);
        cell.line_effect2 = Utils.createEffectSpine(effect_id, cc.v2(width * 0.5, 150), cc.v2(0.5, 0.5), true, PlayerAction.action);
        cell.line_effect2.node.scale = 0.66;
        cell.line_effect2.node.setRotation(130);
        cell.line_effect2.node.setScale(1.3, 1);
        cell.addChild(cell.line_effect2.node, 1);

        //左边名字
        cell.left_item.name = Utils.createLabel(22, this.color_2, this.black_color, 146, 76, "", cell, 2, cc.v2(0.5, 0.5))
        cell.left_item.world_lev = Utils.createLabel(22, this.color_2, this.black_color, 146, 40, "", cell, 2, cc.v2(0.5, 0.5))

        //右边名字
        cell.right_item.name = Utils.createLabel(22, this.color_2, this.black_color, 463, 47, "", cell, 2, cc.v2(0.5, 0.5))
        cell.right_item.world_lev = Utils.createLabel(22, this.color_2, this.black_color, 463, 11, "", cell, 2, cc.v2(0.5, 0.5))

        cell.deleteMe = function () {
            if (cell.left_item.cross_effect) {
                cell.left_item.cross_effect.setToSetupPose();
                cell.left_item.cross_effect.clearTracks();
                cell.left_item.cross_effect.node.removeFromParent();
                cell.left_item.cross_effect.node.destroy();
                cell.left_item.cross_effect = null;
            }

            if (cell.right_item.cross_effect) {
                cell.right_item.cross_effect.setToSetupPose();
                cell.right_item.cross_effect.clearTracks();
                cell.right_item.cross_effect.node.removeFromParent();
                cell.right_item.cross_effect.node.destroy();
                cell.right_item.cross_effect = null;
            }

            if (cell.line_effect1) {
                cell.line_effect1.setToSetupPose();
                cell.line_effect1.clearTracks();
                cell.line_effect1.node.removeFromParent();
                cell.line_effect1.node.destroy();
                cell.line_effect1 = null;
            }

            if (cell.line_effect2) {
                cell.line_effect2.setToSetupPose();
                cell.line_effect2.clearTracks();
                cell.line_effect2.node.removeFromParent();
                cell.line_effect2.node.destroy();
                cell.line_effect2 = null;
            }
        }.bind(this)

        cell.DeleteMe = cell.deleteMe;

        return cell
    },

    //获取数据数量
    numberOfCellsName: function () {
        if (!this.show_list) return 0
        return this.show_list.length
    },

    //更新cell
    //cell :createNewCell的返回的对象
    //inde :数据的索引
    updateCellByIndexName: function (cell, index) {
        let data = this.show_list[index];
        if (data) {
            if (data.left_data) {
                if (data.left_data.sort_index == 0) {
                    cell.left_item.name.node.color = this.color_1;
                } else {
                    cell.left_item.name.node.color = this.color_2;
                }
                cell.left_item.name.string = data.left_data.srv_name;
                cell.left_item.world_lev.string = data.left_data.world_name;
            }

            if (data.right_data) {
                if (data.right_data.sort_index == 0) {
                    cell.right_item.name.node.color = this.color_1;
                } else {
                    cell.right_item.name.node.color = this.color_2;
                }
                cell.right_item.name.string = data.right_data.srv_name;
                cell.right_item.world_lev.string = data.right_data.world_name;

                for (let k in cell.right_item) {
                    cell.right_item[k].node.active = true;
                }
                cell.line_effect1.node.active = true;
            } else {
                for (let k in cell.right_item) {
                    cell.right_item[k].node.active = false;
                }
                cell.line_effect1.node.active = false;
            }

            if (index == this.numberOfCellsName()) {
                //最后一个了..最后一条线不显示
                cell.line_effect2.node.active = false;
            } else {
                cell.line_effect2.node.active = true;
            }
        }
    },

    //初始化 icon信息
    initCrossInfo: function () {
        let config = Config.cross_show_data.data_base;
        this.cross_list = [];
        if (config) {
            for (let k in config) {
                this.cross_list.push(config[k]);
            }
        }
        this.cross_list.sort(Utils.tableLowerSorter(["id"]));
        this.updateCrossList();
    },

    updateCrossList: function () {
        if (!this.cross_list) return
        if (this.cross_list_view == null) {
            let scroll_view_size = this.icon_scrollview.getContentSize();
            let item_width = 150;
            let item_height = 120;
            let position_data_list = null;
            let max_count = Math.floor(scroll_view_size.width / item_width);
            let count = this.numberOfCells();

            if (max_count >= count) {
                position_data_list = [];
                let s_x = 50;
                let y = item_height * 0.5;
                for (let i = 0; i < count; i++) {
                    let x = s_x + item_width * 0.5 + (i - 1) * item_width;
                    position_data_list[i] = cc.v2(x, y);
                }
            }

            let setting = {
                start_x: 0,                  // 第一个单元的X起点
                space_x: 0,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 150,               // 单元的尺寸width
                item_height: item_height,              // 单元的尺寸height
                delay: 1,
                col: 1,                         // 列数，作用于垂直滚动类型
                need_dynamic: true,
                position_data_list: position_data_list
            }

            this.cross_list_view = new CommonScrollViewSingle();
            this.cross_list_view.createScroll(this.icon_scrollview, cc.v2(scroll_view_size.width * 0.5, scroll_view_size.height * 0.5), ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0))

            this.cross_list_view.registerScriptHandlerSingle(this.createNewCell.bind(this), ScrollViewFuncType.CreateNewCell)
            this.cross_list_view.registerScriptHandlerSingle(this.numberOfCells.bind(this), ScrollViewFuncType.NumberOfCells)
            this.cross_list_view.registerScriptHandlerSingle(this.updateCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex)
            this.cross_list_view.registerScriptHandlerSingle(this.onCellTouched.bind(this), ScrollViewFuncType.OnCellTouched)

            if (max_count >= count) {
                this.cross_list_view.setClickEnabled(false);
            }
        }
        this.cross_list_view.reloadData();
    },

    //创建cell
    createNewCell: function (width, height) {
        let cell = new cc.Node();
        cell.setAnchorPoint(0, 0);
        cell.setContentSize(cc.size(width, height));
        let res = PathTool.getUIIconPath("common", "common_90083");
        cell.icon = Utils.createImage(cell, res, width * 0.5, height * 0.5, cc.v2(0.5, 0.5));
        cell.goto_info = Utils.createLabel(18, this.color_1, this.black_color, width * 0.5 - 2, 36, "", cell, 2, cc.v2(0.5, 0.5));
        cell.goto_info_lo = cell.goto_info.node.getComponent(cc.LabelOutline);
        cell.btn = cell.addComponet(cc.Button);
        cell.btn.transition = cc.Button.Transition.SCALE;

        //点击事件
        cell.on("click", function () {
            if (cell.is_lock) return
            Utils.playButtonSound(1);
            this.onCellTouched(cell);
        }, this)

        //回收用
        cell.deleteMe = function () {
            if (cell.item_load != null) {
                // cell.item_load.deleteMe();
                // cell.item_load = null
            }
        }

        return cell
    },

    //获取数据数量
    numberOfCells: function () {
        return this.cross_list.length
    },

    //更新cell
    updateCellByIndex: function (cell, index) {
        cell.index = index;
        let data = this.cross_list[index];
        if (data) {
            let arr = this.checkIconLockInfo(data.open_limit);
            let is_lock = arr[0];
            let lock_str = arr[1];
            if (is_lock) {
                cell.goto_info_lo.enabled = false;
                cell.btn.interactable = false;
                cell.goto_info.string = lock_str;
            } else {
                cell.goto_info_lo.enabled = true;
                cell.btn.interactable = true;
                cell.goto_info.string = Utils.TI18N("点击前往");
            }
            cell.is_lock = is_lock;

            let icon_name = cc.js.formatStr("txt_cn_cross_icon_%s", data.icon);
            let bg_res = PathTool.getUIIconPath("crossshow/cross_icon", icon_name);

            if (cell.record_icon_res != bg_res) {
                cell.record_icon_res = bg_res;
                if (!cell.item_load) {
                    cell.item_load = this.loadRes(bg_res, function (sp) {
                        cell.icon.spriteFrame = sp;
                        if (is_lock) {
                            cell.btn.interactable = false;
                        }
                    }.bind(this))
                }
            }
        }
    },

    //点击cell .需要在 createNewCell 设置点击事件
    onCellTouched: function (cell) {
        let index = cell.index;
        let data = this.cross_list[index];

        let arr = this.checkIconLockInfo(data.open_limit);
        let is_lock = arr[0];
        let lock_str = arr[1];
        if (is_lock) {
            message(lock_str)
            return
        }

        let config = Config.source_data.data_source_data[data.source_id];
        if (config) {
            BackpackController.getInstance().gotoItemSources(config.evt_type, config.extend);
        }
    },

    checkIconLockInfo: function (open_limit) {
        if (!open_limit) return
        let is_lock = false;
        let lock_str = "";
        for (let i in open_limit) {
            let v = open_limit[i];
            if (v[0] == "world_lev") {
                if (this.world_lev < v[1]) {
                    is_lock = true;
                    lock_str = cc.js.formatStr(Utils.TI18N("%s世界等级解锁"), v[1]);
                    break
                }
            } else if (v[0] == "lev") {
                if (this.role_lev < v[1]) {
                    is_lock = true;
                    lock_str = cc.js.formatStr(Utils.TI18N("%s级解锁"), v[1]);
                    break
                }
            } else if (v[0] == "guild_war") {
            }
        }
        return [is_lock, lock_str]
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.list_view) {
            this.list_view.deleteMe();
            this.list_view = null;
        }
        if (this.cross_list_view) {
            this.cross_list_view.deleteMe();
            this.cross_list_view = null;
        }
        if (this.cross_effect) {
            this.cross_effect.clearTracks();
            this.cross_effect.node.removeFromParent();
            this.cross_effect.node.destroy();
            this.cross_effect = null;
        }
        if (this.scene_effect_1) {
            this.scene_effect_1.clearTracks();
            this.scene_effect_1.node.removeFromParent();
            this.scene_effect_1.node.destroy();
            this.scene_effect_1 = null;
        }
        if (this.scene_effect_2) {
            this.scene_effect_2.clearTracks();
            this.scene_effect_2.node.removeFromParent();
            this.scene_effect_2.node.destroy();
            this.scene_effect_2 = null;
        }
        this.ctrl.openCrossshowMainWindow(false)
    },
})