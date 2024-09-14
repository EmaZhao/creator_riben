// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-26 10:00:54
// --------------------------------------------------------------------
var PathTool           = require("pathtool");
var EquipClothItem     = require("equip_cloth_item");
var BackpackController = require("backpack_controller");
var BackPackConst      = require("backpack_const");
var CommonScrollView   = require("common_scrollview");

var ListHeight = {
    "NORMAL": 690,
    "CHANGE": 550,
}

var EquipClothWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "equip_cloth_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.mask_nd        = this.seekChild("mask");
        this.close_btn_nd   = this.seekChild("close_btn");
        this.list_view_nd   = this.seekChild("list_view");
        this.empty_tips_nd  = this.seekChild("empty_tips");
        
        this.cur_equip_nd   = this.seekChild("cur_equip");
        this.item_con_nd    = this.seekChild("item_con");
        this.unequip_btn_nd   = this.seekChild("unequip_btn");

        this.equip_name_lb  = this.seekChild("equip_name", cc.Label);
        this.equip_lev_lb   = this.seekChild("equip_lev", cc.Label);
        this.equip_score_lb = this.seekChild("equip_score", cc.Label);

        this.backpack_item = ItemsPool.getInstance().getItem("backpack_item");
        this.backpack_item.setParent(this.item_con_nd);
        this.backpack_item.setExtendData({effect: false, scale: 0.9});
        this.backpack_item.show();

        this.mask_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.unequip_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickUnEquipBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if (!params) return;
        this.equip_type = params.equip_type;
        this.partner_id = params.partner_id;
        if (params.data) {             // 更换
            this.cur_equip_nd.active = true;
            this.list_view_nd.height = ListHeight.CHANGE;
            this.cur_equip_data = params.data;
            this.updateCurEquip(params.data);
        } else {                       // 添加
            this.cur_equip_nd.active = false;            
            this.list_view_nd.height = ListHeight.NORMAL;
        }
        this.initRankList();
        this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.item_list)
            this.item_list.deleteMe();
        if(this.backpack_item){
            this.backpack_item.deleteMe()
        }
        this.ctrl.openEquipPanel(false);
    },

    updateWidgets: function() {
        this.updateItemList();
    },

    onClickCloseBtn: function() {
        this.ctrl.openEquipPanel(false);
    },

    initRankList: function() {
        var scorll_size = cc.size(this.list_view_nd.width, this.list_view_nd.height) //this.list_view_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: EquipClothItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 5,
            item_width: 620,
            item_height: 150,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.item_list = new CommonScrollView();
        this.item_list.createScroll(this.list_view_nd, cc.v2(0, 10), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0));
    },

    updateItemList: function() {
        var cur_eqips = [];
        var equip_list = BackpackController.getInstance().getModel().getBagItemList(BackPackConst.Bag_Code.EQUIPS) || {};

        for (var equip_i in equip_list) {
            var equip_info = equip_list[equip_i];
            if (equip_info && equip_info.config) {
                if (equip_info.config.type == this.equip_type)
                    cur_eqips.push(equip_info);
            }
        }

        if (cur_eqips.length > 0) {
            this.empty_tips_nd.active = false;
            cur_eqips.sort(Utils.tableUpperSorter(["all_score"]))
        } else {
            this.empty_tips_nd.active = true;            
        }

        this.item_list.setData(cur_eqips, this.selectItemEquip.bind(this));
    },

    selectItemEquip: function(good_vo) {
        if (good_vo && this.partner_id) {
            this.ctrl.sender11010(this.partner_id, good_vo.id);
        }
        this.ctrl.openEquipPanel(false);
    },

    updateCurEquip: function(equip_data) {
        this.equip_name_lb.string = equip_data.config.name;
        this.equip_lev_lb.string = equip_data.lev;
        this.equip_score_lb.string = equip_data.score;  
        this.backpack_item.setData(equip_data);
    },

    onClickUnEquipBtn: function() {
        if(this.partner_id && this.cur_equip_data) {
            this.ctrl.sender11011(this.partner_id, this.cur_equip_data.id);
        }
        this.ctrl.openEquipPanel(false);
    },

})