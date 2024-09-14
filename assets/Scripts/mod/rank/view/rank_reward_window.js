// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-23 20:35:06 
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var RankRewardItem = require("rank_reward_item");
var ActionEvent = require("action_event");

var Rank_rewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("rank", "rank_reward_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("rank_controller").getInstance();
        this.item_list = [];

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.seekChild("main_container");
        this.rank_panel = this.seekChild("rank_panel");
        this.my_rank_nd = this.seekChild("my_rank");

        this.rank_index_lb = this.seekChild(this.my_rank_nd, "rank_id", cc.Label);
        this.label_tips_lb = this.seekChild(this.my_rank_nd, "label_tips", cc.Label);

        this.item_scrollview_nd = this.seekChild(this.my_rank_nd, "item_scrollview");
        this.item_scrollview_size = this.item_scrollview_nd.getContentSize();
        this.item_scrollview_sv = this.item_scrollview_nd.getComponent(cc.ScrollView);
        this.item_content_nd = this.seekChild(this.item_scrollview_nd, "content");

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openRankRewardPanel(false)
        }.bind(this), 2)

        this.addGlobalEvent(ActionEvent.RANK_REWARD_LIST, function (data) {
            if (!data) return
            this.cell_data_list = data.rank_award;
            this.cell_data_list.sort(function(a,b){
                if(a.rank1 < b.rank2)   {
                    return -1
                }else{
                    return 1
                }
            })
            if (this.cell_data_list == 0) {
                this.showEmptyIcon();
            } else {
                this.updateRankList();
            }
            this.updateMyRankInfo(data.rank);
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.rank_reward_type = params || 1;
        require("action_controller").getInstance().send16650(this.rank_reward_type)
    },

    //更新我的排行信息
    updateMyRankInfo: function (my_rank) {
        if (!this.cell_data_list) return
        if (my_rank == null || my_rank == 0) {
            this.rank_index_lb.string = "";
            this.label_tips_lb.string = Utils.TI18N("未上榜");
            return
        }
        this.rank_index_lb.string = my_rank;
        var cell_data = null;
        for (var i in this.cell_data_list) {
            var data = this.cell_data_list[i]
            if (data.rank1 && data.rank2) {
                if (my_rank >= data.rank1 && my_rank <= data.rank2) {
                    cell_data = data;
                }
            } else if (data.rank1) {
                if (my_rank <= data.rank1) {
                    cell_data = data
                }
            }
        }
        if (!cell_data) return

        var scale = 0.8;
        var offsetX = 10;
        var item_count = Utils.getArrLen(cell_data.award);
        var item_width = BackPackItem.Width * scale;
        var total_width = (item_width + offsetX) * item_count;
        var max_width = Math.max(this.item_scrollview_size.width, total_width);
        this.item_content_nd.setContentSize(max_width, this.item_scrollview_size.height);

        this.item_content_nd.x = 0;

        var index = 0;
        for (var i in cell_data.award) {
            const v = cell_data.award[i];
            if (!this.item_list[i]) {
                const item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, scale, false, true);
                item.show();
                item.setParent(this.item_content_nd);
                item.setData({ bid: v.bid, num: v.num });
                item.setPosition(index * (item_width + offsetX) + 60, 0);
                this.item_list[i] = item;
                index = index + 1;
            }
        }
    },

    updateRankList: function () {
        if (this.common_scrollview) {
            this.common_scrollview.setData(this.cell_data_list)
            return
        }
        var lay_scrollview = this.seekChild(this.main_container, "lay_scrollview")
        var bgSize = lay_scrollview.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height);
        var setting = {
            item_class: RankRewardItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 634,               // 单元的尺寸width
            item_height: 142,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.common_scrollview = new CommonScrollView()
        this.common_scrollview.createScroll(lay_scrollview, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        this.common_scrollview.setData(this.cell_data_list)
    },

    showEmptyIcon: function (bool) {
        if (!this.empty_con && bool == false) return
        if (!this.empty_con) {
            var size = cc.size(200, 200);
            this.empty_con = new cc.Node();
            this.empty_con.setContentSize(size);
            this.empty_con.setAnchorPoint(cc.v2(0.5, 0.5));
            this.empty_con.setPosition(cc.v2(0, 0));
            this.main_panel.addChild(this.empty_con);
            var res = PathTool.getBigBg("bigbg_3");
            this.empty_bg = Utils.createImage(this.empty_con, null, 0, 0, cc.v2(0.5, 0.5), false)
            this.loadRes(res, function (sf_obj) {
                this.empty_bg.spriteFrame = sf_obj;
            }.bind(this))
            this.empty_label = Utils.createLabel(26, new cc.Color(0x68, 0x45, 0x2a, 0xff), null, 0, -100, "", this.empty_con, 0, cc.v2(0.5, 0.5));
        }
        var str = Utils.TI18N("暂无奖励数据");
        this.empty_label.string = str;
        this.empty_con.active = bool;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.common_scrollview) {
            this.common_scrollview.deleteMe();
            this.common_scrollview = null;
        }
        if (this.item_list) {
            for (var k in this.item_list) {
                this.item_list[k].deleteMe();
                this.item_list[k] = null;
            }
            this.item_list = null;
        }
        if (this.empty_con) {
            this.empty_con.destroy();
            this.empty_label.destroy();
            this.empty_bg.destroy();
            this.empty_con = null;
            this.empty_bg = null;
            this.empty_label = null;
        }
        this.ctrl.openRankRewardPanel(false)
    },
})