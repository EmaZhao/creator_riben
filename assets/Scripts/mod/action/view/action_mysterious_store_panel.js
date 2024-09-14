// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     神秘杂货铺,zys
// <br/>Create: 2019-07-03 19:40:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller");
var CommonScrollView = require("common_scrollview");
var ActionStoreItem = require("action_mysterious_store_item");
var ActionConst = require("action_const");
var ActionEvent = require("action_event");

var Action_mysterious_storePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_hero_expedit_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = ActionController.getInstance();
        this.model = this.ctrl.getModel();
        this.first_come_in = false;
        this.is_change_id = null;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        this.title_con_nd = this.seekChild("title_con");
        this.time_txt_lb = this.seekChild(this.title_con_nd, "label_time", cc.Label);
        this.time_txt_lb.node.color = new cc.Color(0x80, 0xf7, 0x31, 0xff);

        this.rank_btn = this.seekChild(this.title_con_nd, "rank_btn");
        this.reward_btn = this.seekChild(this.title_con_nd, "reward_btn");

        this.btn_rule = this.seekChild(this.title_con_nd, "btn_rule");
        this.btn_rule.x = 318;

        var order_list_nd = this.seekChild(this.main_container, "charge_con")
        var tab_size = order_list_nd.getContentSize();
        var setting = {
            item_class: ActionStoreItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 688,               // 单元的尺寸width
            item_height: 150,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.child_scrollview = new CommonScrollView()
        this.child_scrollview.createScroll(order_list_nd, cc.v2(tab_size.width/2, tab_size.height/2), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("main_container/title_con/label_time_key", this.root_wnd, cc.Label).string = Utils.TI18N("剩余时间:");
        Utils.getNodeCompByPath("main_container/title_con/rank_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("详细排行");
        Utils.getNodeCompByPath("main_container/title_con/reward_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("奖励预览");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(ActionEvent.UPDATE_STORE_DATA_EVENT, function () {
            if (this.setItemData && this.first_come_in == false) {
                this.first_come_in = true;
                this.setItemData();
            }
        }, this)

        this.addGlobalEvent(ActionEvent.UPDATE_STORE_DATA_SUCCESS_EVENT, function (data) {
            this.changeSuccessData(data.id);
        }, this)

        Utils.onTouchEnd(this.reward_btn, function () {
            if (this.holiday_bid != null)
                require("rank_controller").getInstance().openRankRewardPanel(true, this.holiday_bid);
        }.bind(this), 1)

        this.btn_rule.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            var config = Config.holiday_client_data.data_constant.expedit_rules
            if (this.holiday_bid == ActionConst.ActionRankCommonType.mysterious_store) {
                config = Config.holiday_client_data.data_constant.mysterious_store_rules
            }
            require("tips_controller").getInstance().showCommonTips(config.desc, pos, null, null, 500);
        },this);
    },

    //加载banner图片
    loadBannerImage: function () {
        var title_img = this.seekChild(this.title_con_nd, "title_img", cc.Sprite);
        var str_banner = "";
        if (this.holiday_bid == ActionConst.ActionRankCommonType.mysterious_store) {
            str_banner = "txt_cn_welfare_banner24";
            this.reward_btn.active = false;
            this.rank_btn.active = false;
        }
        var res = PathTool.getWelfareBannerRes(str_banner);
        this.loadRes(res, function (sp) {
            title_img.spriteFrame = sp;
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (param) {
        this.holiday_bid = param.bid;

        this.setPanelData();
        this.ctrl.sender16688();
        this.loadBannerImage();
        this.model.setGiftRedStatus({ bid: ActionConst.ActionRankCommonType.mysterious_store, status: false });
    },

    setPanelData: function () {
        var tab_vo = this.ctrl.getActionSubTabVo(this.holiday_bid);
        var time = tab_vo.remain_sec || 0;
        this.model.setCountDownTime(this.time_txt_lb, time);
    },

    setItemData: function () {
        if (this.child_scrollview) {
            var list = this.setConfigData();
            this.child_scrollview.setData(list);
        }
    },

    setConfigData: function () {
        var list = [];
        var config = Config.holiday_exchange_data.data_get_config_const;

        for (var i in config) {
            var v = config[i];
            var buy_data = this.model.getStoneShopData(v.id);
            if (buy_data) {
                var day_count = buy_data.day_num || 0;      //个人天购买次数
                var totle_count = buy_data.all_num || 0;    //个人总购买次数
                var remian_count = 0;
                if (v.sub_type == ActionConst.ActonExchangeType.Perday) {     //每日限兑
                    remian_count = v.r_limit_day - day_count;
                } else if (v.sub_type == ActionConst.ActonExchangeType.AllServer) {       //全服限兑
                    //暂时不开放
                } else if (v.sub_type == ActionConst.ActonExchangeType.Activity) {        //活动限兑
                    remian_count = v.r_limit_all - totle_count;
                }
                v.count = remian_count;
                if (v.count <= 0) {
                    v.sort = 100000;
                } else {
                    v.sort = remian_count;
                }
                var name_str;
                for (var k in v.expend) {
                    var item = v.expend[k];
                    var bid = item[0];
                    var item_cfg = Utils.getItemConfig(bid);
                    if (item_cfg && k == 0) {
                        name_str = item_cfg.name;
                    } else {
                        name_str = name_str + "、" + item_cfg.name;
                    }
                }
                v.name_str = name_str;
                list.push(v);
            }
        }

        list.sort(Utils.tableCommonSorter([["sort", false], ["id", false]]));
        return list
    },

    changeSuccessData: function (change_id) {
        var config = Config.holiday_exchange_data.data_get_config_const;
        var buy_data = this.model.getStoneShopData(change_id);
        if (buy_data && config && config[change_id]) {
            var day_count = buy_data.day_num || 0;      //个人天购买次数
            var totle_count = buy_data.all_num || 0;    //个人总购买次数
            var remian_count = 0;
            if (config[change_id].sub_type == ActionConst.ActonExchangeType.Perday) {     //每日限兑
                remian_count = config[change_id].r_limit_day - day_count;
            } else if (config[change_id].sub_type == ActionConst.ActonExchangeType.AllServer) {       //全服限兑

            } else if (config[change_id].sub_type == ActionConst.ActonExchangeType.Activity) {        //活动限兑
                remian_count = config[change_id].r_limit_all - totle_count;
            }
            if (this.child_scrollview) {
                if (remian_count <= 0) {
                    var list = this.setConfigData();
                    this.child_scrollview.setData(list);
                } else {
                    var list = this.setConfigData();
                    this.child_scrollview.setData(list);
                }
            }
        }
    },

    setVisibleStatus: function (bool) {
        bool = bool || false;
        this.setVisible(bool);
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.child_scrollview) {
            this.child_scrollview.deleteMe();
            this.child_scrollview = null;
        }
    },
})