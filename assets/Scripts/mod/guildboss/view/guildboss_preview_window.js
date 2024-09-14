// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-20 19:12:47
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollViewSingle = require("common_scrollview_single")
var GuildbossController = require("guildboss_controller");
var GuildBossConst = require("guildboss_const");
var GuildBossEvent = require("guildboss_event");
var GuildBossPreviewItem = require("guildboss_preview_item_panel");

var Guildboss_preview_Window = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildboss", "guildboss_preview_window");
        // this.viewTag = SCENE_TAG.win;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.is_first_enter = true;
        this.monster_list = {};
        this.cell_data_list = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    initPanel: function () {
        this.scroll_container = this.seekChild("scroll_container");
        if(this.is_show){
            this.updateScrollViewList();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    onShow: function (params) {
    },

    updateScrollViewList: function () {
        if(this.root_wnd==null){
            this.is_show = true;
            return
        }
        this.cell_data_list = this.getCellData()[0];
        if (this.scroll_view == null) {
            this.scroll_size = cc.size(625, 100)
            var list_setting = {
                start_x: 7,
                space_x: 2,
                start_y: 4,
                space_y: 0,
                item_width: 100,
                item_height: 90,
                row: 1,
                col: 1,
                delay: 5
            }
            this.scroll_view = new CommonScrollViewSingle();
            this.scroll_view.createScroll(this.scroll_container, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, this.scroll_size, list_setting, cc.v2(0.5, 0.5))

            this.scroll_view.registerScriptHandlerSingle(this.createNewCell.bind(this), ScrollViewFuncType.CreateNewCell)
            this.scroll_view.registerScriptHandlerSingle(this.numberOfCells.bind(this), ScrollViewFuncType.NumberOfCells)
            this.scroll_view.registerScriptHandlerSingle(this.updateCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex)
            this.scroll_view.registerScriptHandlerSingle(this.onCellTouched.bind(this), ScrollViewFuncType.OnCellTouched)
        }

        this.scroll_view.reloadData(Number(this.getCellData()[1]));
    },

    //创建cell 
    //@width 是setting.item_width
    //@height 是setting.item_height
    createNewCell: function (width, height) {
        var cell = new GuildBossPreviewItem();
        cell.show();
        cell.addCallBack(function () {
            this.onCellTouched(cell)
        }.bind(this))
        return cell
    },

    //获取数据数量
    numberOfCells: function () {
        if (!this.cell_data_list) return 0
        return this.cell_data_list.length
    },

    //更新cell(拖动的时候.刷新数据时候会执行次方法)
    //cell :createNewCell的返回的对象
    //inde :数据的索引
    updateCellByIndex: function (cell, index) {
        cell.index = index;
        var cell_data = this.cell_data_list[index];
        if (!cell_data) return
        cell.setData(cell_data, index);
        if (this.cur_index == index) {
            cell.setSelect(true)
        } else {
            cell.setSelect(false)
        }
    },

    //点击cell .需要在 createNewCell 设置点击事件
    onCellTouched: function (cell) {
        var index = cell.index;
        var data = this.cell_data_list[index];
        if (data) {
            if (data.status == 2 || data.status == 3) {
                message(Utils.TI18N("通关上一章开启"));
            } else {
                this.clickOpen(cell, index, true);
                var protocal = {
                    boss_id: cell.data.show_id,
                    start_num: 1,
                    end_num: 3
                }
                GuildbossController.getInstance().requestGuildDunRank(GuildBossConst.rank.role, protocal);
            }
        }
    },

    getCellData: function () {
        var base_info = GuildbossController.getInstance().getModel().getBaseInfo();
        var item_list = [];
        var select_index = null;
        if (base_info && Utils.next(base_info || {} != null)) {
            var is_first_lock = false;
            for (var i in Config.guild_dun_data.data_chapter_reward) {
                var v = gdata("guild_dun_data", "data_chapter_reward", [i]);
                var object = {};
                object.desc = v.chapter_name;
                object.show_id = v.show_id;
                if (base_info.fid && base_info.fid == v.id) { //进行中
                    select_index = i;
                    object.status = 0;
                } else if (base_info.fid > v.id) {    //已通关
                    object.status = 1;
                } else {
                    if (is_first_lock == false) { ////第一个未通关的，做文本显示
                        object.status = 3;
                        is_first_lock = true;
                    } else {
                        object.status = 2;
                    }
                }
                item_list[i - 1] = object;
            }
        }
        return [item_list, select_index - 1]
    },

    clickOpen: function (cell, k, is_change) {
        if ((this.cur_index && this.cur_index == k) && is_change == true) return
        if (this.cur_select != null) {
            this.cur_select.setSelect(false);
        }
        this.cur_select = cell;
        this.cur_index = k;
        this.cur_select.setSelect(true);

        if (!this.is_first_enter) {
            var data = this.cell_data_list[this.cur_index];
            gcore.GlobalEvent.fire(GuildBossEvent.UpdateChangeStatus, data);
        }
        this.is_first_enter = false;
    },

    getCurSelect: function () {
        if (this.cur_select)
            return this.cur_select
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    onDelete: function () {
        if (this.scroll_view) {
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
    },
})