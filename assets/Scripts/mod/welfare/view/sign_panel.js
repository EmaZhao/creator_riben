// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 11:27:30
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var WelfareController = require("welfare_controller");
var CommonScrollView = require("common_scrollview");
var Timetool = require("timetool");
var SignItem = require("sign_item");
var WelfareEvent = require("welfare_event");

var SignPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "sign_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = WelfareController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container_nd = this.seekChild("main_container");
        this.title_con_nd = this.seekChild("title_con");
        this.tips_btn_nd = this.seekChild("tips_btn");

        this.goods_con_nd = this.seekChild("goods_con");

        let img = this.title_con_nd.getChildByName("title_img").getComponent(cc.Sprite)
        this.loadRes(PathTool.getIconPath("welfare/welfare_banner","txt_cn_welfare_banner2"),function(res){
            img.spriteFrame = res
        }.bind(this))
        var tab_size = this.goods_con_nd.getContentSize();
        var setting = {
            item_class: SignItem,      // 单元类
            start_x: 25,                    // 第一个单元的X起点
            space_x: 28,                    // x方向的间隔
            start_y: 20,                    // 第一个单元的Y起点
            space_y: 30,                   // y方向的间隔
            item_width: 107,               // 单元的尺寸width
            item_height: 107,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 5,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.goods_con_nd, cc.v2(0, 0), ScrollViewDir.vertical,
            ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5));

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(WelfareEvent.Update_Sign_Info, function (data) {
            this.createList(data)
        }, this)

        this.addGlobalEvent(WelfareEvent.Sign_Success, function (data) {
            this.createList(data);
        }, this)


        this.tips_btn_nd.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            var desc = StringUtil.parse(Config.checkin_data.data_const.checkin_rules.desc)
            require("tips_controller").getInstance().showCommonTips(desc, pos);
        });

        this.ctrl.sender14100();

    },

    createList: function (data) {
        var config = Config.checkin_data.data_award;
        var now_time = gcore.SmartSocket.getTime();
        var month = Number(Timetool.dateFtt("MM", now_time));
        var data_list = Utils.deepCopy(config[month]);
        var has_day = data.day;
        var now_day = 0;
        var list = [];
        for (var k in data_list) {
            var v = data_list[k];
            if (data.status > 0) {
                if (k < has_day) {        //累计的
                    v.status = 2;       //已领取全部奖励
                } else if (k == has_day) {    //今天
                    v.status = data.status;
                } else {    //之后的
                    v.status = 0
                }
                v.now_day = has_day
                now_day = has_day;
            } else if (data.status == 0) {
                if (k <= has_day) {       //累计的
                    v.status = 2;       //已领取全部奖励
                } else if (k == has_day + 1) {    //今天
                    v.status = data.status;
                } else {      //之后的
                    v.status = 0;
                }
                v.now_day = has_day + 1;
                now_day = has_day + 1;
            }
            list.push(v);
        }
        
        list.sort(Utils.tableLowerSorter(["day"]))


        this.item_scrollview.setData(list, function (cell) {
            var data = cell.getData();
            if (data.status == 1 && data.now_day == data.day && this.model.getRechargeCount() == 0) {
                var str = Utils.TI18N("当天充值<color=#289b14>任意金额</c>可<color=#289b14>额外</c>获得一次奖励");
                var fun = function () {
                    require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE);
                }
                var CommonAlert = require("commonalert");
                CommonAlert.show(str, Utils.TI18N("确认"), fun, Utils.TI18N("取り消し"), null, 2);
            } else if (data.day > data.now_day) {
                message(Utils.TI18N("未达到签到天数"))
            } else {
                this.ctrl.sender14101();
            }
        }.bind(this))

        this.item_scrollview.addEndCallBack(function () {
            var list = this.item_scrollview.getItemList();
            var pos = null;
            for (var k in list) {
                var vo = list[k].getData();
                if (vo.day == 26) {
                    pos = list[k].getItemPosition();
                }
            }
            if (now_day >= 25) {
                this.item_scrollview.jumpToMove(cc.v2(pos.x, pos.y + this.item_scrollview.getContentSize().height / 2), 0.1);
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },
})