// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     收藏有礼
// <br/>Create: 2019-04-25 16:44:35
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WelfareEvent = require("welfare_event");

var CollectPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "collect_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("welfare_controller").getInstance();
        this.item_list = {};
        this.is_can_get = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");

        this.item_container = this.seekChild(this.main_container, "item_container");
        this.bg_sp_2 = this.seekChild(this.main_container, "bg_2", cc.Sprite);
        this.loadRes(PathTool.getBigBg("welfare/txt_cn_shwx_collect","jpg"), function (res) {
            this.bg_sp_2.spriteFrame = res;
        }.bind(this))
        this.desc  = this.seekChild(this.main_container, "txt_2",cc.Label);
        this.desc.string = Utils.TI18N("1.点击“右上角三个点” •••\n2.点击“添加到我的小程序”\n3.点击“关闭圆圈” ⊙\n4.点击我的小程序“剑魂之光”开启游戏，领取奖励");
        this.go_btn = this.seekChild(this.main_container, "go_btn");
        this.go_btn_lb = this.seekChild(this.go_btn, "label", cc.Label);
        this.go_btn_lb.string = Utils.TI18N("收藏领好礼");
        this.go_btn_lo = this.seekChild(this.go_btn, "label", cc.LabelOutline);
        this.go_btn_btn = this.seekChild(this.main_container, "go_btn", cc.Button);

        if (this.ctrl.getModel().getCollectAwardStatus() == 1) {
            this.go_btn_lb.string = Utils.TI18N("已领取");
            this.go_btn_lo.enabled = false;
            Utils.setGreyButton(this.go_btn_btn)
        }
        

        if(window.wx){
            var options = wx.getLaunchOptionsSync();
            var val = wx.getStorageSync("is_open_scene");
            if(val == 1 || (options && options.scene && (options.scene == 1001 || options.scene == 1089 || options.scene == 1103 || options.scene == 1104))){
                this.is_can_get = true;
                wx.setStorageSync("is_open_scene", 1);
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.go_btn.on("click", function () {
            Utils.playButtonSound(1);
            if(PLATFORM_TYPR == "SH_SDK"){//深海小程序
                this.clickGoBtnBySHWX();
            }
        }.bind(this))

        this.addGlobalEvent(WelfareEvent.Update_get_SHWX_collect_award_status, function (status) {
            // meesage(status)
            if (status == 2) {
                this.go_btn_lb.string = Utils.TI18N("收藏领好礼")
            }
            else if (status == 1) {
                this.go_btn_lb.string = Utils.TI18N("已领取");
                this.go_btn_lo.enabled = false;
                Utils.setGreyButton(this.go_btn_btn)
            }
        }.bind(this))

        this.addGlobalEvent(WelfareEvent.Update_SHWX_show_scene_val, function (scene) {
            if (this.ctrl.getModel().getCollectAwardStatus() == 1 ||this.is_can_get == true) {
                return;
            }
            if(window.wx){
                var val = wx.getStorageSync("is_open_scene");
                if(val == 1 || (scene && (scene == 1001 || scene == 1089 || scene == 1103 || scene == 1104))){
                    this.is_can_get = true;
                    wx.setStorageSync("is_open_scene", 1);
                }
            }
        }.bind(this))
    },

    clickGoBtnBySHWX:function(){
        if(this.is_can_get == true){
            if(this.ctrl.getModel().getCollectAwardStatus() == 0){
                this.ctrl.send16696();
            }
        }else{
            message(Utils.TI18N("请先收藏到我的小程序"));
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.setItemList();
    },

    setItemList: function () {
        if (PLATFORM_TYPR == "SH_SDK") {
            var bind_data = this.ctrl.getModel().getCollectAward();
            if (bind_data == null) return
            var index = 0;
            for (var i in bind_data) {
                const v = bind_data[i];
                if (!this.item_list[i]) {
                    const item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, 0.7, false, true);
                    item.show();
                    item.setParent(this.item_container);
                    item.setData({ bid: v.bid, num: v.num });
                    item.setPosition(index * 110 - 110, 80);
                    this.item_list[i] = item;
                    index = index + 1;
                }
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        this.is_shate = false;

        if (this.item_list) {
            for (var k in this.item_list) {
                this.item_list[k].deleteMe();
                this.item_list[k] = null;
            }
            this.item_list = null;
        }
    },
})