// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-01 15:43:37 
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipController = require("vip_controller");
var RoleController = require("role_controller");
var TimeTool = require("timetool");
var CommonScrollView = require("common_scrollview");

var Privilege_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "privilege_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = VipController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container_nd = this.seekChild("container");
        this.image_title_sp = this.seekChild(this.container_nd, "image_title", cc.Sprite);
        this.title_txt_lb = this.seekChild(this.container_nd, "title_txt", cc.Label);
        this.limit_txt_lb = this.seekChild(this.container_nd, "limit_txt", cc.Label);
        this.iamge_icon_sp = this.seekChild(this.container_nd, "image_icon", cc.Sprite);
        this.image_sell_out_nd = this.seekChild(this.container_nd, "image_sell_out");

        this.buy_btn_nd = this.seekChild(this.container_nd, "buy_btn");
        this.buy_btn_rt = this.seekChild(this.buy_btn_nd, "label", cc.RichText);
        this.buy_btn_sp = this.seekChild(this.buy_btn_nd, "img", cc.Sprite);
        this.desc_txt_rt = this.seekChild(this.container_nd, "desc_txt", cc.RichText);
        this.left_day_txt_rt = this.seekChild(this.container_nd, "left_day_txt", cc.RichText);
        this.img1_nd = this.buy_btn_nd.getChildByName("img1");

        var good_list = this.seekChild(this.container_nd, "good_list");
        var tab_size = good_list.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BackPackItem.Width * 0.7,               // 单元的尺寸width
            item_height: BackPackItem.Height * 0.7,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
            scale: 0.7
        }
        this.tab_scrollview = new CommonScrollView()
        this.tab_scrollview.createScroll(good_list, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

        this.loadRes(PathTool.getItemRes(3), function (bg_sp) {
            this.buy_btn_sp.spriteFrame = bg_sp;
        }.bind(this))
        this.buy_btn_sp.node.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.buy_btn_nd, function () {
            this._onClickBuyBtn();
        }.bind(this), 1)
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
        this.privilege_cfg = data;

        var srv_data = this.model.getPrivilegeDataById(data.id);
        if (!srv_data) {
            srv_data = {};
            srv_data.status = 0;
            srv_data.expire_time = 0;
        }

        //标题
        if (this.privilege_cfg.title_type == 1) {
            this.loadRes(PathTool.getUIIconPath("vip", "vip_image_1"), function (sf_obj) {
                this.image_title_sp.spriteFrame = sf_obj;
            }.bind(this))
        } else if (this.privilege_cfg.title_type == 2) {
            this.loadRes(PathTool.getUIIconPath("vip", "vip_image_3"), function (sf_obj) {
                this.image_title_sp.spriteFrame = sf_obj;
            }.bind(this))
        }
        this.title_txt_lb.string = this.privilege_cfg.name || "";

        //图标
        if (this.privilege_cfg.icon_id) {
            var res_path = PathTool.getUIIconPath("vip", "vip_icon" + this.privilege_cfg.icon_id);
            this.loadRes(res_path, function (sf_obj) {
                this.iamge_icon_sp.spriteFrame = sf_obj;
            }.bind(this))
        }

        //描述
        this.desc_txt_rt.string = this.privilege_cfg.desc || "";

        //奖励物品
        var role_vo = RoleController.getInstance().getRoleVo();
        var privilege_award_cfg = gdata("privilege_data", "data_privilege_award", [data.id]);
        if (privilege_award_cfg) {
            var award_data = {};
            for (var k in privilege_award_cfg) {
                var v = privilege_award_cfg[k];
                if (v.min <= role_vo.lev && v.max >= role_vo.lev) {
                    award_data = Utils.deepCopy(v.reward);
                    break
                }
            }
            var item_list = [];
            for (var k in award_data) {
                var v = award_data[k];
                var vo = Utils.deepCopy(Utils.getItemConfig(v[0]));
                if (vo) {
                    vo.bid = vo.id;
                    vo.num = v[1];
                    vo.quantity = v[1]
                    item_list.push(vo)
                }
            }
            this.tab_scrollview.setData(item_list)
            this.tab_scrollview.addEndCallBack(function () {
                var list = this.tab_scrollview.getItemList();
                for (var k in list) {
                    if (list[k])
                        list[k].setDefaultTip();
                }
            }.bind(this))
        }

        //限购类型
        if (this.privilege_cfg.limit_type == 0) {
            this.limit_txt_lb.string = Utils.TI18N("永久限购");
        } else if (this.privilege_cfg.limit_day < 2) {
            this.limit_txt_lb.string = Utils.TI18N("每日限购");
        } else if (this.privilege_cfg.limit_day < 8) {
            this.limit_txt_lb.string = Utils.TI18N("每周限购");
        } else if (this.privilege_cfg.limit_day < 32) {
            this.limit_txt_lb.string = Utils.TI18N("每月限购");
        }

        //按钮显示状态
        if (srv_data.status == 1) {
            if (this.privilege_cfg.limit_type == 0) {
                this.image_sell_out_nd.active = true;
                this.buy_btn_nd.active = false;
                if (this.left_day_txt_rt) {
                    this.left_day_txt_rt.node.active = false;
                }
            } else {
                this.image_sell_out_nd.active = false;
                this.buy_btn_nd.active = false;
                var cur_time = gcore.SmartSocket.getTime();
                var left_time = (srv_data.expire_time || 0) - cur_time;
                if (left_time < 0) {
                    left_time = 0
                }
                var day = Math.floor(left_time / 86400);
                if (day < 1) {
                    this.left_day_txt_rt.string = cc.js.formatStr(Utils.TI18N("<size=24>还有</size><size=24><color=#249003>%s</c></size>"), TimeTool.GetTimeFormatTwo(left_time));
                } else {
                    this.left_day_txt_rt.string = cc.js.formatStr(Utils.TI18N("还有<color=#249003>%s</c>天"), day)
                }
                this.left_day_txt_rt.node.active = true;
            }
        } else {
            this.image_sell_out_nd.active = false;
            this.buy_btn_nd.active = true;
            if (this.left_day_txt_rt) {
                this.left_day_txt_rt.node.active = false;
            }
            if (this.privilege_cfg.pay_type == 1) {
                this.img1_nd.active = true;
                this.buy_btn_rt.string = cc.js.formatStr(Utils.TI18N("%d"), this.privilege_cfg.loss);
                this.buy_btn_sp.node.active = false;
                this.buy_btn_rt.node.x = 0;
            } else if (this.privilege_cfg.pay_type == 2) {
                this.img1_nd.active = false;
                this.buy_btn_rt.string = cc.js.formatStr("%d", this.privilege_cfg.loss);
                this.buy_btn_sp.node.active = true;
                this.buy_btn_rt.node.x = 10;
            }
        }
    },

    //-- 点击购买
    _onClickBuyBtn: function () {
        if (this.privilege_cfg) {
            if (this.privilege_cfg.pay_type == 1) {   //人民币
                var charge_id = this.privilege_cfg.charge_id;
                var charge_config = gdata("charge_data", "data_charge_data", [charge_id || 0]);
                if (charge_config) {
                    SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image) 
                }
            } else if (this.privilege_cfg.pay_type == 2) {    //钻石
                this.ctrl.sender24501(this.privilege_cfg.id);
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.tab_scrollview) {
            this.tab_scrollview.deleteMe();
            this.tab_scrollview = null;
        }
    },
})