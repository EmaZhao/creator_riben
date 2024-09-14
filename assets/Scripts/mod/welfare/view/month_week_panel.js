// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-26 14:35:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var MonthItem = require("month_item");
var WelfareEvent = require("welfare_event");
var TimeTool = require("timetool");
var ActionEvent = require("action_event");
var WelfareConst = require("welfare_const");

var Month_weekPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "week_month_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("welfare_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.gift_info = Config.misc_data.data_cycle_gift_info
        this.reward_list = Config.misc_data.data_cycle_gift_reward
        this.cur_charge_id = 0;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        var title_con = this.seekChild("title_con");
        this.btn_rule = this.seekChild(title_con, "btn_rule");
        this.btn_rule.active = false;
        this.sprite_title = this.seekChild(title_con, "sprite_title", cc.Sprite);

        this.model.setWeekMonthSortData();

        this.ramain_time_lb = this.seekChild("remain_time", cc.Label);

        this.good_cons = this.seekChild(this.main_container, "good_cons");
        var bgSize = this.good_cons.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height);
        var setting = {
            item_class: MonthItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 688,               // 单元的尺寸width
            item_height: 136,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.order_scrollview = new CommonScrollView()
        this.order_scrollview.createScroll(this.good_cons, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("main_container/title_con/time_panel/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("剩余时间:");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(WelfareEvent.Updata_Week_Month_Data, function (data) {
            this.getMonthWeekItemInfo(data)
        }, this)

        this.addGlobalEvent(ActionEvent.Is_Charge_Event, function (data) {
            if (data && data.status && data.charge_id) {
                var charge_config = Config.charge_data.data_charge_data[data.charge_id];
                if (charge_config && data.status == 1 && data.charge_id == this.cur_charge_id) {
                    SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name,charge_config.product_desc,null,null,charge_config.pay_image)  
                }
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.holiday_id = params;
        var str = "txt_cn_welfare_banner6";
        this.send_holiday_id = 1;
        if (this.holiday_id == WelfareConst.WelfareIcon.month) {
            str = "txt_cn_welfare_banner7";
            this.send_holiday_id = 2;
        }
        var res_id = PathTool.getIconPath("welfare/welfare_banner", str);
        this.loadRes(res_id, function (res_object) {
            this.sprite_title.spriteFrame = res_object;
        }.bind(this))
        if (this.send_holiday_id) {
            this.ctrl.sender21007(this.send_holiday_id)
        }
    },

    getMonthWeekItemInfo: function (data) {
        this.setLessTime(data.ref_time - gcore.SmartSocket.getTime());
        if (this.gift_info[data.type]) {
            this.setBuyCount(data.first_gift);
            var list = [];
            for (var i in this.gift_info[data.type]) {
                var v = this.gift_info[data.type][i];
                v.count = v.limit_count - this.getBuyCount(v.charge_id);
                if (v.count <= 0) {
                    v.count = 0;
                }
                v.reward = this.getRegisteDayReward(v.charge_id, data.reg_day);
                list.push(v);
            }
            this.sortList(list);
            this.order_scrollview.setData(list, function (cell) {
                this.cur_charge_id = cell.getData().charge_id || 0;
            }.bind(this))
        }
    },

    getRegisteDayReward: function (id, day) {
        if (this.reward_list[id]) {
            var num = 1;
            for (var i in this.reward_list[id]) {
                var v = this.reward_list[id][i]
                if (day >= v.min && day <= v.max) {
                    num = v.sort_id;
                    break
                }
            }
            return this.reward_list[id][num].reward
        }
        return []
    },

    sortList: function (list) {
        var sort_func = function (objA, objB) {
            if (objA.count <= 0 && objB.count > 0) {
                return 1 //换位置
            } else if (objA.count > 0 && objB.count <= 0) {
                return -1 //不换位置
            } else {
                return objA.charge_id - objB.charge_id //排序
            }
        }
        list.sort(sort_func)
    },

    setBuyCount: function (data) {
        if (!data || Utils.next(data) == null) return
        this.buyCountData = {};
        for (var i in data) {
            this.buyCountData[data[i].id] = data[i].count;
        }
    },

    getBuyCount: function (id) {
        if (this.buyCountData && this.buyCountData[id]) {
            return this.buyCountData[id]
        }
        return 0
    },

    //设置倒计时
    setLessTime: function (less_time) {
        if (this.ramain_time_lb == null) return
        this.ramain_time_lb.node.stopAllActions();
        if (less_time > 0) {
            this.setTimeFormatString(less_time);
            var func = function () {
                less_time = less_time - 1;
                if (less_time < 0) {
                    this.ramain_time_lb.node.stopAllActions();
                    this.ramain_time_lb.string = "00:00:00";
                } else {
                    this.setTimeFormatString(less_time)
                }
            }.bind(this)
            this.ramain_time_lb.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1), cc.callFunc(func))))
        } else {
            this.setTimeFormatString(less_time);
        }
    },

    setTimeFormatString: function (time) {
        if (time > 0) {
            this.ramain_time_lb.string = TimeTool.getTimeForFunction(time);
        } else {
            this.ramain_time_lb.node.stopAllActions();
            this.ramain_time_lb.string = "00:00:00";
        }
    },

    setVisibleStatus: function (bool) {
        bool = bool || false;
        this.setVisible(bool);
        if (bool == true && this.send_holiday_id) {
            this.ctrl.sender21007(this.send_holiday_id)
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.order_scrollview) {
            this.order_scrollview.deleteMe();
            this.order_scrollview = null;
        }
    },
})