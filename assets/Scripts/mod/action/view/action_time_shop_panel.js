// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     限时商城,zys
// <br/>Create: 2019-07-05 14:35:11
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller");
var ActionTimeShopItem = require("action_time_shop_item");
var CommonScrollView = require("common_scrollview");
var ActionEvent = require("action_event");

var Action_time_shopPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "week_month_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = ActionController.getInstance();

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.btn_rule = this.seekChild("btn_rule");
        this.btn_rule.active = false;

        this.remain_time_lb = this.seekChild("remain_time", cc.Label);
        this.remain_time_lb.string = "";

        var order_list_nd = this.seekChild("good_cons");
        var tab_size = order_list_nd.getContentSize();
        var setting = {
            item_class: ActionTimeShopItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 688,               // 单元的尺寸width
            item_height: 136,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.child_scrollview = new CommonScrollView()
        this.child_scrollview.createScroll(order_list_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("main_container/title_con/time_panel/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("剩余时间:");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE, function (data) {
            if (data.bid == this.holiday_bid) {
                this.ctrl.getModel().setCountDownTime(this.remain_time_lb, data.remain_sec);
                this.setLimitShopData(data);
            }
        }, this)
    },

    setLimitShopData: function (data) {
        let shop_data = []
        for(let i=0;i<data.aim_list.length;++i){
            let v = data.aim_list[i]
            let sort_data = Utils.keyfind('aim_args_key', 39, v.aim_args) || null;
            if(sort_data){
                let sort_id = sort_data.aim_args_val
                if(v.status == 2){
                    sort_id = 5
                }
                v.sort_id = sort_id
                shop_data.push(v)
            }
        }
        if(Utils.next(shop_data) == null){
            var sortFunc = function (objA, objB) {
                if (objA.status == objB.status) {
                    var price_a = 0;
                    var price_b = 0;
                    for (var k in objA.aim_args) {
                        var v = objA.aim_args[k];
                        if (v.aim_args_key == 27) {
                            price_a = v.aim_args_val;
                        }
                    }
                    for (var k in objB.aim_args) {
                        var v = objB.aim_args[k];
                        if (v.aim_args_key == 27) {
                            price_b = v.aim_args_val;
                        }
                    }
                    //贵的放后面
                    return price_a - price_b
                } else {
                    if (objA.status < objB.status) {
                        return -1
                    }
                    return 1
                }
            }.bind(this)
            data.aim_list.sort(sortFunc);
            this.child_scrollview.setData(data.aim_list);
        }else{
            shop_data.sort(function(a,b){
                return a.sort_id - b.sort_id
            })   
            this.child_scrollview.setData(shop_data);
        }

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.holiday_bid = params.bid;

        this.ctrl.cs16603(this.holiday_bid);
        this.loadBannerImage();
    },

    //加载banner图片
    loadBannerImage: function () {
        var title_img = this.seekChild("sprite_title", cc.Sprite);
        var str_banner = "txt_cn_welfare_banner22";
        var tab_vo = this.ctrl.getActionSubTabVo(this.holiday_bid);
        if (tab_vo && tab_vo.reward_title != "" && tab_vo.reward_title) {
            str_banner = tab_vo.reward_title;
        }
        var res = PathTool.getWelfareBannerRes(str_banner);
        this.loadRes(res, function (sp) {
            title_img.spriteFrame = sp;
        }.bind(this))
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