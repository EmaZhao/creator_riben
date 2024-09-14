// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-30 15:53:22
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var HeroController = require("hero_controller");
var HeroEvent = require("hero_event");
var BackpackController = require("backpack_controller");
var BackPackConst = require("backpack_const");
var PartnerConst = require("partner_const");
var GoodsVo = require("goods_vo");

var Artifact_choseWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "artifact_chose_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.chose_num = 0;
        this.ctrl = HeroController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.main_container = this.seekChild("main_container");

        this.chose_lb = this.seekChild("chose_label", cc.Label);
        this.chose_lb.string = cc.js.formatStr(Utils.TI18N("(已选择:%d)"), this.chose_num);
        this.ok_btn = this.seekChild("ok_btn");
        this.close_btn = this.seekChild("close_btn");
        this.empty_bg_sp = this.seekChild("empty_bg", cc.Sprite);
        this.empty_bg_sp.node.active = false;

        var goods_con = this.seekChild(this.main_container, "goods_con");
        var size = goods_con.getContentSize();
        var tab_size = cc.size(size.width, size.height - 10);
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 15,                    // 第一个单元的X起点
            space_x: 20,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: BackPackItem.Width,               // 单元的尺寸width
            item_height: BackPackItem.Height,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 4,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(goods_con, cc.v2(0, 0), ScrollViewDir.vertical,
            ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5));

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openArtifactChoseWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openArtifactChoseWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.ok_btn, function () {
            this._onClickBtnOk();
        }.bind(this), 1)
    },

    _onClickBtnOk: function () {
        var is_have_special = false;
        var item_list = [];
        for (var k in this.item_data) {
            var v = this.item_data[k];
            if (v.showSellStatus != null && v.showSellStatus.select == true) {
                if (v.enchant >= 3) {//所选材料中有三星以上的符文
                    is_have_special = true;
                }
                item_list.push(v.id)
            }
        }
        var sureToChoseFunc = function () {
            gcore.GlobalEvent.fire(HeroEvent.Artifact_Chose_Event, item_list);
            this.ctrl.openArtifactChoseWindow(false);
        }.bind(this)
        if (is_have_special) {
            var str = Utils.TI18N("您选择了高星级的符文作为升星材料，是否继续？");
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, Utils.TI18N("确定"), sureToChoseFunc, Utils.TI18N("取消"))
        } else {
            sureToChoseFunc();
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        this.setData(data);
    },

    setData: function (data) {
        this.artifact_bid = data.bid //合成的目标符文bid（0表示暂无）
        this.max_num = data.max_num || 0;
        this.chose_list = data.chose_list || [];
        this.chose_num = Utils.getArrLen(this.chose_list);
        this.chose_lb.string = cc.js.formatStr(Utils.TI18N("(已选择:%s/%s)"), this.chose_num, this.max_num);

        var tmp_data = BackpackController.getInstance().getModel().getAllBackPackArray(BackPackConst.item_tab_type.SPECIAL)
        var item_data = [];
        for (var i in tmp_data) {
            var vo = new GoodsVo();
            vo.initAttrData(tmp_data[i]);
            item_data.push(vo)
        }

        var list = [];
        for (var i in item_data) {
            var v = item_data[i];
            if (v && v.config && v.config.type == BackPackConst.item_type.ARTIFACTCHIPS) {
                var artifact_cfg = Config.partner_artifact_data.data_artifact_data[v.config.id];
                if (artifact_cfg && artifact_cfg.com_artifact != 0) {
                    var is_select = false;
                    for (var k in this.chose_list) {
                        if (this.chose_list[k] == v.id) {
                            is_select = true;
                            break
                        }
                    }
                    v.setGoodsAttr("showSellStatus", { status: true, select: is_select });
                    list.push(v)
                }
            }
        }
        list.sort(Utils.tableLowerSorter(["quality", "id"]));
        this.item_data = list;
        var onClickItemCallBack = function (cell) {
            var item_vo = cell.getData();
            this.ctrl.openArtifactTipsWindow(true, item_vo, PartnerConst.ArtifactTips.normal)
        }.bind(this)
        this.item_scrollview.setData(list, onClickItemCallBack, { showCheckBox: true, checkBoxClickCallBack: this._onCheckBoxCallBack.bind(this), adjustCheckBoxPos: cc.v2(BackPackItem.Width - 25, BackPackItem.Height - 25) })
        if (list.length == 0) {
            this.empty_bg_sp.node.active = true;
            this.loadRes(PathTool.getUIIconPath("bigbg", "bigbg_3"), function (sp) {
                this.empty_bg_sp.spriteFrame = sp;
            }.bind(this))
        } else {
            this.empty_bg_sp.node.active = false;
        }
    },

    _onCheckBoxCallBack: function (flag, itemnode) {
        var item_vo = itemnode.getData();
        if (flag == true) {
            if (!this.checkItemIsCanChose(item_vo.config.id)) {
                item_vo.setGoodsAttr("showSellStatus", { status: true, select: false });
                itemnode.setCheckBoxStatus(true, false)
                message(Utils.TI18N("请选择同类型符文"))
                return
            } else if (this.chose_num >= this.max_num) {
                item_vo.setGoodsAttr("showSellStatus", { status: true, select: false });
                itemnode.setCheckBoxStatus(true, false)
                message(Utils.TI18N("已达最大选择数量"))
                return
            }
        }
        if (flag == true) {
            this.chose_num = this.chose_num + 1;
            var artifact_cfg = Config.partner_artifact_data.data_artifact_data[item_vo.config.id];
            if (artifact_cfg && artifact_cfg.com_artifact) {
                this.artifact_bid = artifact_cfg.com_artifact;
            }
        } else {
            this.chose_num = this.chose_num - 1;
            if (this.chose_num <= 0) {
                this.artifact_bid = 0;
            }
        }
        this.chose_lb.string = cc.js.formatStr(Utils.TI18N("(已选择:%s/%s)"), this.chose_num, this.max_num)
    },

    //检测是否可以选择
    checkItemIsCanChose: function (bid) {
        var is_can_chose = false;
        if (this.artifact_bid && this.artifact_bid != 0) {
            var artifact_cfg = Config.partner_artifact_data.data_artifact_data[bid];
            if (artifact_cfg && artifact_cfg.com_artifact == this.artifact_bid) {
                is_can_chose = true;
            }
        } else {
            is_can_chose = true;
        }
        return is_can_chose
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        for (var k in this.item_data) {
            var v = this.item_data[k];
            v.setGoodsAttr("showSellStatus", { status: true, select: false })
        }
        this.ctrl.openArtifactChoseWindow(false)
    },
})