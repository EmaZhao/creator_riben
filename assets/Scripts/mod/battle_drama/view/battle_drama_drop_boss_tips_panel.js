// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     掉落信息查看面板
// <br/>Create: 2019-03-25 16:39:29
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaController = require("battle_drama_controller");
var BattleDramaDropBossItem = require("battle_drama_drop_boss_item");
var Battle_dramaEvent = require("battle_drama_event");
var BackPackConst = require("backpack_const");

var Battle_drama_drop_boss_tipsPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_drop_boss_tips_panel");
        this.ctrl = BattleDramaController.getInstance();
        this.model = this.ctrl.getModel();
        this.drama_data = this.model.getDramaData();
        this.max_dun_id = arguments[0] || this.drama_data.max_dun_id;
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.item_list = {};
    },


    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.scroll = this.seekChild("scroll");
        this.scroll_sv = this.seekChild("scroll", cc.ScrollView);
        this.scroll_content = this.seekChild("content");

        var list = this.model.getBossShowData();
        if (list && Utils.next(list || {}) != null) {
            this.sum_num = Utils.getArrLen(list);
            this.max_height = Math.max(57*this.sum_num, this.scroll.getContentSize().height)
            this.scroll_content.setContentSize(this.scroll.getContentSize().width, this.max_height);
            
            for (var k in list) {
                this.delayRun(list[k], k)
            }
        }
    },

    delayRun: function (v, index) {
        index = Number(index)
        Utils.delayRun(this.scroll, 0.05 * (index + 1), function () {
            var item = new BattleDramaDropBossItem();
            item.setAnchorPoint(0, 1);
            item.setData(v);
            item.show();
            item.setParent(this.scroll_content);
            item.setPosition(0, -(57) * index - 3);
            this.item_list[index + 1] = item;
            item.addCallBack(function (cell) {
                this.clickOpen(cell, index + 1);
            }.bind(this))
            if (v.chapter_id == this.drama_data.chapter_id) {
                this.clickOpen(item, index + 1);
            }
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(Battle_dramaEvent.BattleDrama_Boss_Update_Data, function () {
            if (this.cur_select != null) {
                this.cur_select.updateItemList();
            }
        }, this)

        this.addGlobalEvent(EventId.ADD_GOODS, function (bag_code, data_list) {
            if (bag_code == BackPackConst.Bag_Code.BACKPACK) {
                for (var i in data_list) {
                    var v = data_list[i];
                    if (v && v.base_id && v.base_id == Config.dungeon_data.data_drama_const["swap_item"].val) {
                        if (this.cur_select != null) {
                            this.cur_select.updateItemList();
                        }
                    }
                }
            }
        }, this)
    },

    clickOpen: function (cell, k) {
        if (this.cur_select != null && (this.cur_index && this.cur_index != k)) {
            this.cur_select.setSelect(false);
            this.cur_select.showMessagePanel(false);
        }
        this.cur_select = cell;
        this.cur_index = k;
        var status = this.cur_select.getIsShow();
        if (status) {
            //位置缩回去
            this.scroll_content.setContentSize(this.scroll.getContentSize().width, this.max_height);
            for (var k in this.item_list) {
                this.item_list[k].setPosition(0, - 3 - (57) * (k - 1));
            }
            this.cur_select.setSelect(false);
            this.cur_select.showMessagePanel(false);
        } else {
            this.cur_select.setSelect(true);
            this.cur_select.showMessagePanel(true);
            this.height = this.cur_select.getMsgPanleSize().height;
            this.adjustPos();
        }
        //调整一下scrollview位置
        var temp_percent = 0;
        var scroll_height = this.max_height;
        if (this.height) {
            scroll_height = this.max_height + this.height;
        }
        if (this.cur_select) {
            var offset_height = (this.cur_index - 1) * 57;
            var temp_percent = offset_height / this.max_height;
            if (this.height) {
                offset_height = (this.cur_index - 1) * (57 + 13);
                temp_percent = offset_height / scroll_height;
            }
            this.scroll_sv.scrollToPercentVertical(1 - temp_percent, 0.1, true);
        }
    },

    adjustPos: function () {
        if (this.cur_select != null) {
            this.scroll_content.setContentSize(this.scroll.getContentSize().width, this.max_height + this.height);
            var height = 0;
            for (var k in this.item_list) {
                var v = this.item_list[k];
                if (k <= this.cur_index) {
                    v.setPosition(0, height - 3 - (57) * (k - 1))
                } else {
                    v.setPosition(0, height - this.height - 3 - (57) * (k - 1))
                }
            }
        }
    },

    setVisibleStatus: function (bool) {
        bool = bool || false;
        this.setVisible(bool);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_list) {
            for (var i in this.item_list) {
                if (this.item_list[i]) {
                    this.item_list[i].deleteMe();
                    this.item_list[i] = null;
                }
            }
            this.item_list = null;
        }
        this.scroll.stopAllActions();
    },
})