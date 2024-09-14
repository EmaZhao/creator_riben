// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-21 19:19:49
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Guildboss_rank_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildboss", "guildboss_rank_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.item_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.rank_sp = this.seekChild("rank_img", cc.Sprite);
        this.rank_lb = this.seekChild("rank_label", cc.Label);
        this.item_nd = this.seekChild("item_container");

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        var data = this.data
        if (data.rank2 <= 3) {
            this.rank_lb.node.active = false;
            if (data.rank2 == 0) {
                this.rank_sp.node.active = false;
            } else {
                var res_id = PathTool.getCommonIcomPath(cc.js.formatStr("common_200%s", data.rank2));
                if (this.rank_res_id != res_id) {
                    this.rank_res_id = res_id;
                    this.loadRes(res_id, function (sf_obj) {
                        this.rank_sp.spriteFrame = sf_obj;
                    }.bind(this))
                }
                this.rank_sp.node.active = true;
            }
        } else {
            this.rank_sp.node.active = false;
            this.rank_lb.node.active = true;
            this.rank_lb.string = cc.js.formatStr("%s~%s", data.rank1, data.rank2);
        }

        for (var k in this.item_list) {
            this.item_list[k].setVisible(false);
        }

        var item_config = null;
        var index = 1;
        var item = null;
        var scale = 0.8;
        var sum = data.award.length;
        for (var i = 0;i<sum;i++) {
            var v = data.award[i];
            item_config = Utils.getItemConfig(v[0]);
            if (item_config) {
                if (this.item_list[index] == null) {
                    item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, scale, false, false)
                    item.setParent(this.item_nd);
                    item.show();
                    item.setPosition(110 * i - 50,0);
                    this.item_list[index] = item;
                }
                item = this.item_list[index];
                item.setData({bid:v[0],num:v[1]});
                item.setVisible(true);
                index = index + 1;
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        for(var i in this.item_list){
            this.item_list[i].deleteMe();
            this.item_list[i] = null;
        }
        this.item_list = null;
    },
})