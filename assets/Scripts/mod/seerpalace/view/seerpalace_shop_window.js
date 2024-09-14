// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-21 18:35:21
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackController = require("backpack_controller");
var SeerpalaceConst = require("seerpalace_const")
var CommonScrollView = require("common_scrollview");
var MallItem = require("mall_item");
var MallController = require("mall_controller")
var MallConst = require("mall_const")
var MallEvent = require("mall_event")
var SeerpalaceController = require("seerpalace_controller")
var HeroConst = require("hero_const")
var RoleController = require("role_controller")
var RoleEvent = require("role_event")
var Shopwindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("seerpalace", "seerpalace_shop_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.cur_index = 1
        this.ctrl = SeerpalaceController.getInstance();
        this.role_vo = RoleController.getInstance().getRoleVo()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.cur_camp_type = HeroConst.CampType.eNone
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        Utils.getNodeCompByPath("container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("先知商店");
        this.res_lb = this.seekChild("res_label", cc.Label)
        this.close_nd = this.seekChild("close_btn")
        this.background_nd = this.seekChild("background")
        this.background_nd.scale = FIT_SCALE
        this.res_lb.string = BackpackController.getInstance().getModel().getBackPackItemNumByBid(SeerpalaceConst.Good_JieJing);
        this.list_panel = this.seekChild("list_panel")
        this.camp_list_nd = this.seekChild("btn").children
        let setting = {
            item_class: MallItem,
            start_x: 0, // 第一个单元的X起点
            space_x: 0, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: 2, // y方向的间隔
            item_width: 306, // 单元的尺寸width
            item_height: 143, // 单元的尺寸height
            row: 0, // 行数，作用于水平滚动类型
            col: 2, // 列数，作用于垂直滚动类
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView();
        let scroll_view_size = cc.size(this.list_panel.width-10, this.list_panel.height)
        this.item_scrollview.createScroll(this.list_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0))
        let res_icon_sp = this.seekChild("res_icon", cc.Sprite)
        let item_config = Utils.getItemConfig(SeerpalaceConst.Good_JieJing)
        this.loadRes(PathTool.getItemRes(item_config.icon), function(res) {
            res_icon_sp.spriteFrame = res
        })
        this.res_lb.string = this.role_vo.recruithigh_hero
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        for (let i = 0; i < this.camp_list_nd.length; ++i) {
            this.camp_list_nd[i].on("touchend", function(event) {
                this._onClickCampBtn(i + 1)
                Utils.playButtonSound(3)
            }, this)
        }
        this.background_nd.on("touchend", function() {
            Utils.playButtonSound(2)
            this.ctrl.openShop(false)
        }, this)
        this.close_nd.on("touchend", function() {
            Utils.playButtonSound(2)
            this.ctrl.openShop(false)
        }, this)
        if (!this.update_have_count) {
            this.update_have_count = this.addGlobalEvent(MallEvent.Open_View_Event, function(data) {
                this.srv_data = data || {}
                let list = this.getConfig()
                this.item_scrollview.setData(list, function(cell) {
                    MallController.getInstance().openMallBuyWindow(true, cell)
                })
            }.bind(this))
        }
        // -- 积分资产更新
        if (this.role_vo) {
            if (this.role_assets_event == null) {
                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value) {
                    if (key == "recruithigh_hero") {
                        this.res_lb.string = value;
                    }
                }.bind(this))
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        MallController.getInstance().sender13401(MallConst.MallType.Seerpalace)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe();
            this.item_scrollview = null;
        }
        if (this.role_vo) {
            if (this.role_assets_event) {
                this.role_vo.unbind(this.role_assets_event)
                this.role_assets_event = null
            }
        }
        this.ctrl.openShop(false)
    },
    getConfig() {
        let item_list = []
        let config = Config.exchange_data.data_shop_exchage_seer;
        if (config && this.srv_data) {
            let list = JSON.parse(JSON.stringify(this.srv_data.item_list))
            for (let i in config) {
                let j = config[i]
                let item_config = Utils.getItemConfig(j.item_bid) //Config.item_data.getItemConfig[j.item_bid]
                if (item_config && (this.cur_camp_type == HeroConst.CampType.eNone || item_config.lev == this.cur_camp_type)) { // 碎片阵营限制
                    if (list && Utils.next(list || {}) != null) {
                        for (let k = 0; k < list.length; ++k) { //已经买过的限购物品
                            let v = list[k]
                            if (j.id == v.item_id) {
                                if (v.ext[1].val) { //不管是什么限购 赋值已购买次数就好了。。
                                    j.has_buy = v.ext[1].val
                                    list.splice(k, 1)
                                }
                                break
                            } else {
                                j.has_buy = 0
                            }
                        }
                    } else {
                        j.has_buy = 0
                    }
                    item_list.push(j)
                }
            }
        }
        item_list.sort(function(a, b) {
            if (a.limit_count && a.limit_count > 0 && a.has_buy >= a.limit_count && (!b.limit_count || b.limit_count == 0 || b.has_buy < b.limit_count)) {
                return false
            } else if (b.limit_count && b.limit_count > 0 && b.has_buy >= b.limit_count && (!a.limit_count || a.limit_count == 0 || a.has_buy < a.limit_count)) {
                return true
            } else {
                return a.order < b.order
            }
        })
        return item_list
    },
    _onClickCampBtn(index) {
        if (this.cur_index == index) return
        this.cur_index = index
        switch (index) {
            case 1:
                this.cur_camp_type = HeroConst.CampType.eNone
                break
            case 2:
                this.cur_camp_type = HeroConst.CampType.eWater
                break
            case 3:
                this.cur_camp_type = HeroConst.CampType.eFire
                break
            case 4:
                this.cur_camp_type = HeroConst.CampType.eWind
                break
            case 5:
                this.cur_camp_type = HeroConst.CampType.eLight
                break
            case 6:
                this.cur_camp_type = HeroConst.CampType.eDark
                break
        }
        let list = this.getConfig()
        this.item_scrollview.setData(list, function(cell) {
            MallController.getInstance().openMallBuyWindow(true, cell)
        })
    }
})
module.exports = Shopwindow;