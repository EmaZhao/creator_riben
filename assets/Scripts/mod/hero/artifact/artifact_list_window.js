// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     符文列表
// <br/>Create: 2019-04-15 11:39:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var ArtifactListItem = require("artifact_list_item");
var BackPackConst = require("backpack_const");
var HeroController = require("hero_controller");
var BackpackController = require("backpack_controller");
var HeroEvent = require("hero_event");

var Artifact_listWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "artifact_list_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.main_panel = this.seekChild("main_panel");
        this.bg = this.seekChild(this.main_panel, "bg");
        this.close_btn = this.seekChild("close_btn");
        this.source_btn = this.seekChild("source_btn");

        var bgSize = this.bg.getContentSize();
        var tab_size = cc.size(bgSize.width - 10, bgSize.height - 10);
        var setting = {
            item_class: ArtifactListItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 600,               // 单元的尺寸width
            item_height: 135,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.order_scrollview = new CommonScrollView()
        this.order_scrollview.createScroll(this.bg, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openArtifactListWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openArtifactListWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.source_btn, function () {
            var bid = 0;
            if (Config.partner_artifact_data.data_artifact_const["main_shenqi"] != null) {
                bid = Config.partner_artifact_data.data_artifact_const["main_shenqi"].val;
            }
            var config = Utils.getItemConfig(bid);
            if (config) {
                BackpackController.getInstance().openTipsSource(true, config);
            }
        }.bind(this), 1)
        this.addGlobalEvent(EventId.ADD_GOODS, function (bag_code, data_list) {
            if (bag_code == BackPackConst.Bag_Code.BACKPACK) {
                this.createArtifactList()
            }
        }, this)
        this.addGlobalEvent(EventId.MODIFY_GOODS_NUM, function (bag_code, data_list) {
            if (bag_code == BackPackConst.Bag_Code.BACKPACK) {
                this.createArtifactList()
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.artifact_type = params.artifact_type;
        if (params.artifact_type == null) {
            this.artifact_type = 1;
        }
        this.partner_id = params.partner_id || 0;
        this.select_vo = params.select_vo;

        this.createArtifactList();
    },

    createArtifactList: function () {
        var tmp_data = BackpackController.getInstance().getModel().getAllBackPackArray(BackPackConst.item_tab_type.SPECIAL);
        var data = Utils.deepCopy(tmp_data);

        var list = [];
        var index = 1;
        this.select_id = 0;
        if (this.select_vo && this.select_vo.id != null) {
            this.select_id = this.select_vo.id || 0;
        }
        for (var i in data) {
            var v = data[i];
            if (v && v.config && v.config.type == BackPackConst.item_type.ARTIFACTCHIPS) {
                if (this.select_id != v.id) {
                    if (this.artifact_type == 0) {
                        list[index] = v;
                        index = index + 1;
                    } else {
                        list[index] = v;
                        index = index + 1;
                    }
                }
            }
        }

        this.showEmptyIcon(false);
        if (!list || Utils.next(list) == null) {
            this.showEmptyIcon(true)
        }

        //判断该位置是否已穿戴了神器
        var partner_vo = this.ctrl.getModel().getHeroById(this.partner_id)
        this.is_cloth = false;
        if (partner_vo && Utils.next(partner_vo) != null) {
            var artifact_list = partner_vo.artifact_list || {};
            for (var i in artifact_list) {
                var v = artifact_list[i];
                if (v && v.id && v.artifact_pos != null && v.artifact_pos == this.artifact_type) {
                    this.is_cloth = true;
                }
            }
        }
        var callback = function (vo) {
            if (vo && Utils.next(vo) != null) {
                if (this.partner_id && this.partner_id != 0) {
                    this.ctrl.sender11030(this.partner_id, this.artifact_type, vo.id, 1);
                } else {
                    gcore.GlobalEvent.fire(HeroEvent.Artifact_Select_Event, vo)
                }
                this.ctrl.openArtifactListWindow(false)
            }
        }.bind(this)
        var sortFunc = function (objA, objB) {
            if (objA.enchant != objB.enchant) {
                return objB.enchant - objA.enchant
            } else if (objA.config && objB.config) {
                return objB.config.quality - objA.config.quality
            } else {
                return -1
            }
        }
        list.sort(sortFunc);
        this.order_scrollview.setData(list, callback, this.partner_id)
    },

    showEmptyIcon: function (bool) {
        if (!this.empty_con && bool == false) return
        if (!this.empty_con) {
            var size = cc.size(200, 200);
            this.empty_con = new cc.Node();
            this.empty_con.setContentSize(size);
            this.empty_con.setAnchorPoint(cc.v2(0.5, 0.5));
            this.empty_con.setPosition(cc.v2(0, 0));
            this.main_panel.addChild(this.empty_con);
            var res = PathTool.getBigBg("bigbg_3");
            this.empty_bg = Utils.createImage(this.empty_con, null, 0, 0, cc.v2(0.5, 0.5), false)
            this.loadRes(res, function (sf_obj) {
                this.empty_bg.spriteFrame = sf_obj;
            }.bind(this))
            this.empty_label = Utils.createLabel(26, new cc.Color(0x68, 0x45, 0x2a, 0xff), null, 0, -100, "", this.empty_con, 0, cc.v2(0.5, 0.5));
        }
        var str = Utils.TI18N("背包中暂无该类型符文");
        this.empty_label.string = str;
        this.empty_con.active = bool;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openArtifactListWindow(false);
        if (this.order_scrollview) {
            this.order_scrollview.deleteMe();
            this.order_scrollview = null;
        }
        if (this.empty_con) {
            this.empty_con.destroy();
            this.empty_label.destroy();
            this.empty_bg.destroy();
            this.empty_con = null;
            this.empty_bg = null;
            this.empty_label = null;
        }
    },
})