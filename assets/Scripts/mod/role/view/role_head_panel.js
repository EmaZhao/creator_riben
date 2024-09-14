// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      头像选择
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RoleController = require("role_controller");
var RoleHeadItem = require("role_head_item");
var CommonScrollView = require("common_scrollview");

var RoleHeadPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_head_panel");
        this.data = null;
        this.has_list = {};
        this.select_bid = 0;
    },

    initPanel: function () {
        this.setPosition(0, 0);
        this.scroll_con = this.root_wnd.getChildByName("scroll_con");
        this.ok_btn = this.root_wnd.getChildByName("ok_btn");
        // this.loadRes(PathTool.getResFrame("face"), (function(resObject){
        //     this.face_res_object = resObject;
        //     if(this.cache_has_list){
        //         this.updateList(this.cache_has_list);
        //         this.cache_has_list = null;
        //     }
        // }).bind(this));
        var setting = {
            item_class: RoleHeadItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 4,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: 141,               // 单元的尺寸width
            item_height: 120,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 4,                        // 列数，作用于垂直滚动类型
            once_num: 4,
            need_dynamic: true
        };
        var scroll_view_size = cc.size(604, 514);
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scroll_con, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5));
        RoleController.getInstance().send10325();
        Utils.getNodeCompByPath("ok_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("更 换");
    },

    registerEvent: function () {
        this.ok_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.select_bid) {
                RoleController.getInstance().send10327(this.select_bid);
            }
        }, this);
        this.roleVo = RoleController.getInstance().getRoleVo();
        if (!this.role_update_evt) {
            this.role_update_evt = this.roleVo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function (key, val) {
                if (key == "face_id") {
                    this.updateList();
                } else if (key == "face_list") {
                    this.updateList(val);
                }
            }), this);
        }
    },

    onShow: function () {
    },

    updateList: function (has_list) {
        // if(!this.face_res_object){// 资源未加载
        //     this.cache_has_list = has_list || this.cache_has_list;
        //     return;
        // }
        if (has_list) {
            this.has_list = this.has_list || {};
            for (var k in has_list) {
                this.has_list[has_list[k].face_id] = 1;
            }
        }

        // for (var k in Config.partner_data.data_partner_base) {
        //     var v = Config.partner_data.data_partner_base[k];
        //     if (v.bid == this.roleVo.face_id) {
        //         list.push({ bid: v.bid, face_id: v.bid, use: 1, status: 1, sort: 1100000 - v.bid });
        //     } else if (this.has_list[v.bid]) {
        //         list.push({ bid: v.bid, face_id: v.bid, use: 0, status: 1, sort: 100000 - v.bid });
        //     } else {
        //         list.push({ bid: v.bid, face_id: v.bid, use: 0, status: 0, sort: -v.bid });
        //     }
        // }
        if (this.list == null) {
            this.list = [];
            for (let k in Config.looks_data.data_head_data) {
                let v = Config.looks_data.data_head_data[k];
                let data = {};
                data.tips = v.tips;
                data.bid = v.id;
                data.face_id = v.id;
                if (this.has_list) {
                    if (this.has_list[v.id]) {
                        data.status = 1;    //拥有
                    } else {
                        data.status = 0;    //未拥有
                    }
                } else {
                    data.status = 0;
                }
                if (this.roleVo.face_id == v.id) {
                    data.use = 1;
                } else {
                    data.use = 0;
                }
                this.list.push(data);
            }
        } else {
            for (let i in this.list) {
                let data = this.list[i];
                if (this.roleVo.face_id == data.bid) {
                    data.use = 1;
                } else {
                    data.use = 0;
                }
            }
        }

        // this.list.sort(Utils.tableLowerSorter(["use", "status","bid"]));
        // this.list.sort(Utils.tableUpperSorter(["use", "status"]));
        this.list.sort(Utils.tableCommonSorter([["use",true],["status",true],["bid",false]]));
        

        if (this.select_bid == 0)
            this.select_bid = this.roleVo.face_id;

        this.item_scrollview.setData(this.list, (function (cell) {
            if (cell.data.status == 0) {
                // var config = Config.partner_data.data_partner_base[cell.data.bid];
                // message(cc.js.formatStr(Utils.TI18N("激活%s可解锁"), config.name));
                message(Utils.TI18N(cell.data.tips));
            } else {
                this.select_bid = cell.data.bid;
                if (this.select_item) {
                    this.select_item.setSelected(false);
                }
                this.select_item = cell;
                this.setSelected(cell);
            }
        }).bind(this), { resObject: this.face_res_object, select_func: this.setSelected.bind(this) });
        this.item_scrollview.addEndCallBack(function () {
            cc.log(this.item_scrollview)
        }.bind(this))
    },

    setSelected: function (item) {
        if (item) {
            item.setSelected(this.select_bid == item.data.bid)
            if (this.select_item == null) {
                this.select_item = item;
            }
        }
    },

    onHide: function () {

    },

    onDelete: function () {
        if (this.role_update_evt) {
            this.roleVo.unbind(this.role_update_evt);
        }
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null
    }
});

module.exports = RoleHeadPanel;