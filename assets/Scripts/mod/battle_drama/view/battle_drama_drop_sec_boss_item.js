// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-25 20:31:15
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");

var BattleDramaDropSecBossItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_drop_sec_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("root");
        this.name_lb = this.seekChild("name_label", cc.Label);

        this.scroll_con_nd = this.seekChild(this.container, "item_scrollview");
        var tab_size = this.scroll_con_nd.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BackPackItem.Width * 0.8,               // 单元的尺寸width
            item_height: BackPackItem.Height * 0.8,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true,
            scale: 0.8
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.scroll_con_nd, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setBossData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    setData: function (data, is_single) {
        this.is_single = is_single || false;
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // setExtendData:function(value){
    //     this.is_single = value;
    // },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        if (this.is_single != null) {
            if (this.is_single == true) {
                this.name_lb.string = Utils.TI18N("当前关卡");
                this.updateItem(this.data);
            } else {
                this.name_lb.string = this.data.name;
                this.updateItem(this.data.items);
            }
        } else {
            var config = gdata("dungeon_data", "data_drama_dungeon_info", [this.data.dungeon_id]);
            if (config) {
                this.name_lb.string = config.name;
            }
            this.updateItem(this.data.items);
        }
    },

    updateItem: function (data) {
        if (data == null) return
        var list = [];
        for (var i in data) {
            var v = data[i];
            var tab = {};
            tab.bid = v[0];
            tab.num = v[1];
            list.push(tab);
        }
        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function () {
            var list = this.item_scrollview.getItemList();
            for (var k in list) {
                if (list[k])
                    list[k].setDefaultTip();
            }
        }.bind(this))
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

BattleDramaDropSecBossItem.WIDTH = 600
BattleDramaDropSecBossItem.HEIGHT = 168