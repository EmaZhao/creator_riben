// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      竖版排行榜排行界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RankController = require("rank_controller");
var RankEvent = require("rank_event");
var CommonScrollView = require("common_scrollview");
var RankMainItem = require("rank_main_item")

var RankMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("rank", "rank_main");
        this.win_type = WinType.Full;
        // this.view_tag = SCENE_TAG.dialogue;
        this.ctrl = RankController.getInstance();
        this.cur_type = 0;
        this.res_list = {};
        this.tab_info_list = {};
        this.view_list = {};
        this.tab_list = {};
        this.is_init = {};
        this.select_tyep = 1;//伙伴类型选择,默认全部为1
        this.is_cluster = false;
        this.rank_first_list = {};  //排行配置表
        this.is_send = false;//是否发送协议
    },


    openCallBack: function () {
        this.contaienr = this.seekChild("container");
        this.main_panel = this.seekChild("main_panel");
        this.close_btn = this.seekChild("close_btn");
        this.bg_nd = this.seekChild("bg");

        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("bigbg_2"),function(res){
            this.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))

        Utils.getNodeCompByPath("main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("排行榜");
        //Utils.getNodeCompByPath("main_panel/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },



    registerEvent: function () {
        this.addGlobalEvent(RankEvent.RankEvent_Get_First_data, function (data) {
            if (!data) return
            var index = 1;
            if (data.is_cluster == 0) {
                index = 2;
            }
            if (this.select_type != index) return
            if (data.is_cluster == 1) {
                this.rank_first_list[1] = data.rank_list;
            } else {
                this.rank_first_list[2] = data.rank_list;
            }
            this.updateRankList();
        }, this)
        if (this.is_send) {
            this.ctrl.send_12902(this.is_cluster)
        } else {
            this.is_send = true;
        }
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openMainView(false)
        }.bind(this), 2)
    },

    openRootWnd: function (type) {
        type = type || 2;
        this.select_tyep = type;
        this.changeTabIndex(type)
    },

    changeTabIndex: function (index) {
        this.select_type = index;
        var first_data = this.rank_first_list[index];
        if (first_data != null) {
            this.updateRankList()
        } else {
            this.is_cluster = this.select_type == 1;
            if (this.is_send == false) {
                this.is_send = true;
            } else {
                this.ctrl.send_12902(this.is_cluster)
            }
        }
    },

    updateRankList: function () {
        if (this.select_type == null) return
        var first_data = this.rank_first_list[this.select_tyep];
        if (first_data == null) return
        var tab_size = cc.size(610, 830)
        if (this.list_view == null) {
            var setting = {
                item_class: RankMainItem,      // 单元类
                start_x: 5,                    // 第一个单元的X起点
                space_x: 0,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 602,               // 单元的尺寸width
                item_height: 162,              // 单元的尺寸height
                row: 0,                        // 行数，作用于水平滚动类型
                col: 1,                        // 列数，作用于垂直滚动类型
                need_dynamic: true
            }
            this.list_view = new CommonScrollView()
            this.list_view.createScroll(this.bg_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        }

        var is_cluster = this.select_type == 1;
        first_data.sort(Utils.tableLowerSorter(["type"]))
        var callback = function (item, vo) {
            if (vo && Utils.next(vo) != null) {
                var index = item.getRankIndex() || 1;
                this.ctrl.openRankView(true, index, is_cluster);
            }
        }.bind(this)
        this.list_view.setData(first_data, callback, is_cluster)
    },

    closeCallBack: function () {
        this.ctrl.openMainView(false)
        if (this.list_view) {
            this.list_view.deleteMe();
            this.list_view = null;
        }
    }

});

module.exports = RankMainWindow;