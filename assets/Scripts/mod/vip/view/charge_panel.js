// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-22 11:09:17
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ChargeItem = require("charge_item");
var VipEvent = require("vip_event")

var ChargePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "charge_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("vip_controller").getInstance();
        this.role_vo = require("role_controller").getInstance().getRoleVo();
        this.item_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.scroll_con = this.seekChild("scrollCon")
        this.scroll_sv = this.seekChild("scrollCon", cc.ScrollView)
        this.content_nd = this.seekChild(this.scroll_con, "con");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(VipEvent.UPDATE_CHARGE_LIST, function (list) {
            for (var k in list) {
                var v = list[k];
                if (Config.charge_data.data_charge_data[v.id]) {
                    v.sort = Config.charge_data.data_charge_data[v.id].sort
                }
            }
            list.sort(Utils.tableUpperSorter(["sort"]))
            this.createItemList(list);
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        this.ctrl.sender16700();
        this.ctrl.sender21005();
        require("welfare_controller").getInstance().sender16705();
    },

    createItemList: function (list) {
        // return
        if (list == null) return
        var height = Math.max(this.content_nd.getContentSize().height, (Math.ceil(list.length / 3)) * 235 + 20);
        this.content_nd.setContentSize(660, height);
        list.sort(Utils.tableLowerSorter(["get_gold"]))
        this.scroll_sv.scrollToTop(0)
        for (let k in list) {
            const v = list[k];
            Utils.delayRun(this.content_nd, 0.05 * (Number(k) + 1), function () {
                if (this.item_list[k] == null) {
                    const item = new ChargeItem();
                    let index = Number(k);
                    item.setPosition(219 * ((index) % 3) - 325, height / 2 - (Math.ceil((index + 1) / 3)) * 235);
                    item.show();
                    item.addCallBack(function (item) {
                        if (this.select_item != null && this.select_item.getData().id != item.getData().id) {
                            this.select_item.setSelect(false);
                        }
                        this.select_item = item;
                    }.bind(this))
                    item.setParent(this.content_nd);
                    this.item_list[k] = item;
                }
                this.item_list[k].setData(v)
            }.bind(this))
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