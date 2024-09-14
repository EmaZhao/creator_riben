// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     天梯奖励
// <br/>Create: 2019-07-24 16:51:25
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
// var LadderAwardItem = require("ladder_award_item");
var LadderController = require("ladder_controller");

var Ladder_awardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_award_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
        this.color_1 = new cc.Color(169, 95, 15, 255);
        this.color_2 = new cc.Color(336, 144, 3, 255);
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.main_container = this.seekChild("main_container");

        let win_title = this.seekChild("win_title", cc.Label);
        win_title.string = Utils.TI18N("排名奖励");
        let range_label = this.seekChild("range_label", cc.Label);
        range_label.string = Utils.TI18N("名次");
        let reward_label = this.seekChild("reward_label", cc.Label);
        reward_label.string = Utils.TI18N("奖励");

        this.close_btn = this.seekChild("close_btn");

        let my_rank_nd = this.seekChild("my_rank");
        let award_title = this.seekChild(my_rank_nd, "award_title", cc.Label);
        award_title.string = Utils.TI18N("保持排名可获得奖励:");
        let rank_title = this.seekChild(my_rank_nd, "rank_title", cc.Label);
        rank_title.string = Utils.TI18N("我的排名:");
        this.rank_label_lb = this.seekChild(my_rank_nd, "rank_label", cc.Label);
        let tips_label = this.seekChild(my_rank_nd, "tips_label", cc.Label);
        tips_label.string = Utils.TI18N("奖励将在周日23:00通过邮件发放");
        this.good_con = this.seekChild("good_con");

        this.item_list = this.seekChild(this.main_container, "item_list")
        let bgSize = this.item_list.getContentSize();
        let tab_size = cc.size(bgSize.width, bgSize.height - 8);
        let setting = {
            item_class: LadderAwardItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 600,               // 单元的尺寸width
            item_height: 124,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.award_scrollview = new CommonScrollView()
        this.award_scrollview.createScroll(this.item_list, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openLadderAwardWindow(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLadderAwardWindow(false);
        }.bind(this), 2)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.setData();
    },

    setData: function () {
        let award_config = Config.sky_ladder_data.data_award;
        if (award_config) {
            let award_data = [];
            for (let k in award_config) {
                let v = award_config[k];
                let award = Utils.deepCopy(v);
                award_data.push(award);
            }

            award_data.sort(Utils.tableLowerSorter(["min"]));
            this.award_scrollview.setData(award_data);

            //我的排名
            let myBaseData = this.model.getLadderMyBaseInfo();
            if (!myBaseData.rank || myBaseData.rank <= 0) {
                this.rank_label_lb.string = Utils.TI18N("未上榜");
                this.rank_label_lb.node.color = this.color_1;
            } else {
                this.rank_label_lb.string = myBaseData.rank;
                this.rank_label_lb.node.color = this.color_2;
            }

            let my_award = {};
            for (let i in my_award) {
                let v = my_award[i];
                if (myBaseData.rank != null && myBaseData.rank >= v.min && myBaseData.rank <= v.max) {
                    my_award = v.reward;
                }
            }


        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openLadderAwardWindow(false);
        if (this.award_scrollview) {
            this.award_scrollview.deleteMe();
            this.award_scrollview = null;
        }
    },
})