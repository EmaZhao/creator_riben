// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     伙伴升星信息面板
// <br/>Create: 2019-02-22 11:23:24
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const");

var Hero_upgrade_star_selectWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_upgrade_star_select_panel");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("请选择材料英雄");
        Utils.getNodeCompByPath("main_container/label_select", this.root_wnd, cc.Label).string = Utils.TI18N("已选择：");
        Utils.getNodeCompByPath("main_container/label_tip", this.root_wnd, cc.Label).string = Utils.TI18N("(材料英雄的养成消耗将会100%返还)");
        Utils.getNodeCompByPath("main_container/select_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("选择");
        Utils.getNodeCompByPath("main_container/no_video/no_vedio_label", this.root_wnd, cc.Label).string = Utils.TI18N("空空如也");

        this.item_container_nd = this.seekChild("item_container");
        this.select_btn_nd = this.seekChild("select_btn");
        this.no_video_nd = this.seekChild("no_video");
        this.select_num_lb = this.seekChild("select_num", cc.Label);
        this.background_nd = this.seekChild("background");
        this.background_nd.scale = FIT_SCALE;

        this.background_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.select_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickSelectBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.select_hero = params.select_data;
        this.dic_other_selected = Utils.deepCopy(params.dic_other_selected);
        this.select_cb = params.select_cb;
        this.cur_hero_vo = params.cur_hero_vo;
        this.form_type = params.from_type;
        this.need_index = this.select_hero.need_index;
        this.is_master = params.is_master || false;

        this.initListView();
        this.updateWidget();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        for (var hero_i = 0; hero_i < this.hero_list.length; ++hero_i) {
            if (this.hero_list[hero_i]) {
                this.hero_list[hero_i] = null;
            }
            // this.hero_list[hero_i].is_ui_select = false;
            // this.hero_list[hero_i].is_ui_lock = false;
        }

        if (this.item_scrollview)
            this.item_scrollview.deleteMe();

        this.ctrl.openHeroUpgradeStarSelectPanel(false);
    },

    updateWidget: function() {
        // cc.log("1111111111111111111111111");

        var all_hero_list = Utils.deepCopy(this.model.getAllHeroArray());
        this.hero_list = [];
        if (this.select_hero.bid === 0) { // 不是指定英雄
            for (var hero_i = 0; hero_i < all_hero_list.length; ++hero_i) {
                if (all_hero_list[hero_i].camp_type === this.select_hero.camp_type || this.select_hero.camp_type === 0) {
                    if (all_hero_list[hero_i].star === this.select_hero.star && (!this.cur_hero_vo || all_hero_list[hero_i].partner_id !== this.cur_hero_vo.partner_id)) {
                        if (!this.isOtherSelect(all_hero_list[hero_i]))
                            this.hero_list.push(all_hero_list[hero_i]);
                    }
                }
            }
        } else { // 指定英雄
            for (var hero_i = 0; hero_i < all_hero_list.length; ++hero_i) {
                if (all_hero_list[hero_i].bid === this.select_hero.bid && (!this.cur_hero_vo || all_hero_list[hero_i].partner_id !== this.cur_hero_vo.partner_id)) {
                    if (all_hero_list[hero_i].star === this.select_hero.star) {
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
                        // cc.log("SSSSSSSSSSSSSSSSSSSSS");
                        this.hero_list[hero_i].is_ui_select = true;
                        continue;
                    }
                }
            }
        }

        // 是否已经上阵或者已经锁定
        for (var hero_i = 0; hero_i < this.hero_list.length; ++hero_i) {
            // cc.log(this.hero_list[hero_i]);
            if (this.is_master && this.hero_list[hero_i].bid == this.select_hero.bid) {
                continue
            }
            if (this.hero_list[hero_i].is_in_form || this.hero_list[hero_i].is_lock) {
                // cc.log("IIIIIIIIIIIIIIIIIIIIIII");
                this.hero_list[hero_i].is_ui_lock = true;
            }
        }
        let arr = []
        if (this.hero_list.length > 0) {
            this.no_video_nd.active = false;
            let arr2 = []
            for (let i = 0; i < this.hero_list.length; ++i) {
                if (this.hero_list[i].is_ui_lock) {
                    arr2.push(this.hero_list[i])
                } else {
                    arr.push(this.hero_list[i])
                }
            }
            arr = arr.concat(arr2)
        } else {
            this.no_video_nd.active = true;
        }

        // 更新数量
        this.udpateSelectNum();
        this.hero_list = arr;
        this.item_scrollview.setData(this.hero_list, this.onClickHeroExhibiton.bind(this), { can_click: true, from_type: HeroConst.ExhibitionItemType.eHeroSelect });
    },

    isOtherSelect: function(hero_vo) {
        for (var select_i in this.dic_other_selected) {
            if (select_i != this.need_index) {
                for (var hero_i in this.dic_other_selected[select_i]) {
                    var cur_hero_vo = this.dic_other_selected[select_i][hero_i];
                    if (hero_vo.partner_id === cur_hero_vo.partner_id) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    initListView: function() {
        var CommonScrollView = require("common_scrollview");
        var scroll_view_size = cc.size(this.item_container_nd.width, this.item_container_nd.height);
        var setting = {
            item_class: "hero_exhibition_item", // 单元类
            start_x: 0, // 第一个单元的X起点
            space_x: 4, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: 0, // y方向的间隔
            item_width: 150, // 单元的尺寸width
            item_height: 136, // 单元的尺寸height
            col: 4, // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.item_container_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
    },

    onClickHeroExhibiton: function(hero_item) {
        if (this.is_master && hero_item.data.bid == this.select_hero.bid) {

        } else if (hero_item.data.checkHeroLockTips(true)) {
            return
        }
        if (this.hero_list[hero_item.tmp_index]) {
            if (this.hero_list[hero_item.tmp_index].is_ui_select) {
                this.hero_list[hero_item.tmp_index].is_ui_select = false;
            } else {
                if (this.dic_other_selected[this.need_index].length >= this.select_hero.count) { // 已满
                    message(Utils.TI18N("选择数量已满"));
                    return;
                } else {
                    this.hero_list[hero_item.tmp_index].is_ui_select = true;
                }
            }
            // this.item_scrollview.updateItemData(hero_item.tmp_index, this.hero_list[hero_item.tmp_index]);
            hero_item.setSelected(this.hero_list[hero_item.tmp_index].is_ui_select);
            this.updateSeletInfo(this.hero_list[hero_item.tmp_index]);
        }
    },

    onClickCloseBtn: function() {
        for (var hero_i in this.hero_list) {
            this.hero_list[hero_i].is_ui_select = false;
            this.hero_list[hero_i].is_ui_lock = false;
        }

        this.ctrl.openHeroUpgradeStarSelectPanel(false);
    },

    updateSeletInfo: function(hero_vo) {
        if (hero_vo.is_ui_select) { // 确保添加
            var is_add = false;
            var dic_other_selected = this.dic_other_selected[this.need_index];
            for (var hero_i in dic_other_selected) {
                if (dic_other_selected[hero_i].partner_id === hero_vo.partner_id) {
                    is_add = true;
                    break;
                }
            }
            if (!is_add)
                this.dic_other_selected[this.need_index].push(hero_vo);
        } else { // 确保移除
            var dic_other_selected = this.dic_other_selected[this.need_index];
            for (var hero_i in dic_other_selected) {
                if (dic_other_selected[hero_i].partner_id === hero_vo.partner_id) {
                    dic_other_selected.splice(hero_i, 1);
                    break;
                }
            }
        }

        // 更新已选数字
        this.udpateSelectNum();
    },

    onClickSelectBtn: function() {
        if (this.select_cb)
            this.select_cb(this.dic_other_selected);
        this.ctrl.openHeroUpgradeStarSelectPanel(false);
    },

    udpateSelectNum: function() {
        var num_str = "";
        if (this.select_hero.count > 1)
            num_str = this.dic_other_selected[this.need_index].length + "/" + this.select_hero.count;
        this.select_num_lb.string = num_str;
    }

})