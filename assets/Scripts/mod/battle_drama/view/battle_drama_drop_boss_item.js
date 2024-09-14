// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-25 17:51:13
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaController = require("battle_drama_controller");
var StringUtil = require("string_util");
var BattleDramaDropSecBossItem = require("battle_drama_drop_sec_boss_item");

var Battle_drama_drop_boss_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_drop_boss_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.size = cc.size(602, 57);
        this.item_list = {};
        this.is_lock = true;
        this.ctrl = BattleDramaController.getInstance();
        this.model = this.ctrl.getModel();
        this.drama_data = this.model.getDramaData();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("root");

        this.name_label_lb = this.seekChild('name_label', cc.Label);
        this.arrow_nd = this.seekChild("arrow");
        this.lock_panel_nd = this.container.getChildByName("lock_panel")
        this.lock_panel_nd.active = false;
        this.unlock_label_lb = this.seekChild(this.lock_panel_nd, "unlock_label", cc.Label);
        this.msg_panel = this.seekChild("layout");

        if (this.is_show != null) {
            this.showMessagePanel(this.is_show)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.root_wnd, function () {
            if (this.callback) {
                if (this.is_lock == false) {
                    this.callback(this)
                } else {
                    message(Utils.TI18N("通关本章后开启"))
                }
            }
        }.bind(this), 2)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        this.chapter_id = data.chapter_id;
        if (this.drama_data) {
            var sum_chapter = this.model.getOpenSumChapter(this.drama_data.mode);
            if (data.chapter_id <= sum_chapter) {
                this.is_lock = false;
                this.lock_panel_nd.active = false;
                this.arrow_nd.active = true;
            } else {
                this.lock_panel_nd.active = true;
                this.arrow_nd.active = false;
            }
        }
        this.name_label_lb.string = `第${StringUtil.numToChinese(data.chapter_id)}章 ${data.name}`
    },

    addCallBack: function (value) {
        this.callback = value;
    },

    getIsShow: function () {
        return this.is_show;
    },

    setSelect: function (bool) {

    },

    showMessagePanel: function (bool) {
        this.is_show = bool;
        if (this.root_wnd == null) {
            return
        }
        if (bool) {
            this.createMessagePanel();
            this.arrow_nd.scale = 1;
        } else {
            this.arrow_nd.scale = -1;
        }
        if (this.msg_panel) {
            this.msg_panel.active = bool;
        }
    },

    createMessagePanel: function () {

        var list = [];
        var final_list = [];
        var config = Config.dungeon_data.data_drama_boss_show_reward;
        if (config) {
            var max_dun_id = this.drama_data.max_dun_id;
            if (this.chapter_id != null && config[this.chapter_id]) {
                var cfg = config[this.chapter_id];
                var sum = this.model.getHasCurChapterPassListBossNum(this.drama_data.mode, this.chapter_id);
                var count = 0;
                if (cfg) {
                    for (var i in cfg) {
                        list.push(cfg[i]);
                    }
                }
                list.sort(Utils.tableLowerSorter(["dungeon_id"]));
                if (list) {
                    for (var i in list) {
                        var v = list[i];
                        if (v.dungeon_id <= max_dun_id || count < sum) {
                            final_list.push(v);
                        }
                        count = count + 1;
                    }
                }
            }
        }
        if (final_list && Utils.next(final_list) != null) {
            var len = final_list.length;
            this.msg_panel.setContentSize(585, len * (BattleDramaDropSecBossItem.HEIGHT));

            for (var i in final_list) {
                this.delayRun(final_list[i], i)
            }
        }
    },

    delayRun: function (v, i) {
        i = Number(i)
        // Utils.delayRun(this.msg_panel, 0.05 * (i + 1), function () {
            if (!this.item_list[i]) {
                var item = new BattleDramaDropSecBossItem();
                item.setAnchorPoint(0, 1);
                this.item_list[i] = item;
                item.setParent(this.msg_panel);
                item.show();
            }
            var item = this.item_list[i];
            if (item) {
                item.setBossData(v);
            }
        // }.bind(this))
    },

    updateItemList: function () {
        if (this.item_list && Utils.next(this.item_list || {}) != null) {
            for (var i in this.item_list) {
                var v = this.item_list[i];
                if (v) {
                    v.updateBtnStatus();
                }
            }
        }
    },

    getMsgPanleSize: function () {
        if (this.msg_panel) {
            return this.msg_panel.getContentSize();
        } else {
            return cc.size(0, 0)
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_list) {
            for (var k in this.item_list) {
                if (this.item_list[k]) {

                }
            }
        }
    },
})

Battle_drama_drop_boss_itemPanel.WIDTH = 602
Battle_drama_drop_boss_itemPanel.HEIGHT = 57

