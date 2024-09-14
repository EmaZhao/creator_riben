// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     关注贴吧公众号
// <br/>Create: 2019-04-25 15:10:13
// --------------------------------------------------------------------
var PathTool = require("pathtool")
var WelfareConst = require("welfare_const");

var PastePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "paste_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("welfare_controller").getInstance();
        this.item_list = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.item_cons = this.seekChild("item_cons");

        this.bg_sp = this.seekChild("bg", cc.Sprite);
        this.loadRes(PathTool.getBigBg("welfare/txt_cn_paste"), function (res) {
            this.bg_sp.spriteFrame = res
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.setItemList();
    },

    setItemList: function () {
        var data_list = Config.holiday_client_data.data_info;
        var bind_data = data_list[WelfareConst.WelfareIcon.poste]
        if (bind_data == null || bind_data.items == null) return
        var index = 0;
        for (var i in bind_data.items) {
            const v = bind_data.items[i];
            if (!this.item_list[i]) {
                const item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 1, false, true);
                item.show();
                item.setParent(this.item_cons);
                item.setData({ bid: v[0], num: v[1] });
                item.setPosition(index * 134 + 60, 77);
                this.item_list[i] = item;
                index = index + 1;
            }
        }
    },

    setVisibleStatus: function (status) {
        this.setVisible(status)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_list) {
            for (var k in this.item_list) {
                this.item_list[k].deleteMe();
                this.item_list[k] = null;
            }
            this.item_list = null;
        }
    },
})