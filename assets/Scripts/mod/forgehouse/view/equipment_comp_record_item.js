// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-02 14:57:05
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var TimeTool = require("timetool");

var Equipment_comp_recordPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "forgehouse_comp_record_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function() {},

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("main_container/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("合成物品：");
        Utils.getNodeCompByPath("main_container/Text_1_0", this.root_wnd, cc.Label).string = Utils.TI18N("材料消耗：");
        this.time_text_lb = this.seekChild("time_text", cc.Label);
        this.consume_text_lb = this.seekChild("consume_text", cc.Label);
        var consume_sp = this.seekChild("consume_item", cc.Sprite);
        var item_config = Utils.getItemConfig(1);
        var res = PathTool.getItemRes(item_config.icon);
        this.loadRes(res, function(sp) {
            consume_sp.spriteFrame = sp;
        }.bind(this))

        var good_cons = this.seekChild("good_cons");
        var size = good_cons.getContentSize();
        var setting = {
            item_class: "backpack_item", // 单元类
            start_x: 10, // 第一个单元的X起点
            space_x: 0, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: 0, // y方向的间隔
            item_width: 120 * 0.8, // 单元的尺寸width
            item_height: 120 * 0.8, // 单元的尺寸height
            row: 1, // 行数，作用于水平滚动类型
            col: 0, // 列数，作用于垂直滚动类型
            // need_dynamic: true
            scale: 0.8
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(good_cons, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    setData: function(data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function() {
        if (this.data == null) return
        var data = this.data;
        this.time_text_lb.string = TimeTool.getYMDHMS(data.time);
        this.consume_text_lb.string = data.coin;

        var list = [];
        for (var k in data.items) {
            var v = data.items[k];
            var vo = Utils.deepCopy(Utils.getItemConfig(v.bid));
            if (vo) {
                vo.num = v.num;
                vo.bid = v.bid;
                list.push(vo);
            }
        }
        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function() {
            var list = this.item_scrollview.getItemList();
            for (var k in list) {
                if (list[k])
                    list[k].setDefaultTip();
            }
        }.bind(this))
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },
})