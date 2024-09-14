// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-30 14:42:55
// --------------------------------------------------------------------
var PathTool           = require("pathtool");
var BackPackConst      = require("backpack_const");
var ChatItemController = require("chat_item_controller");

var ItemEnum = {
    "1":{source: "face_item", width: 60, height:60, col: 8},
    "2":{source: "goods_item", width: 100, height:100, col: 5},
    "3":{source: "equip_item", width: 100, height:100, col: 5}
}

var Chat_input_listPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.ctrl = arguments[0];
        this.prefabPath = PathTool.getPrefabPath("chat", "chat_input_list");

        this.chat_item_ctrl = ChatItemController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.cur_tab = null;
        this.item_lists = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container_nd = this.seekChild("container");

        var tab_bnts = this.tab_bnts = {};
        for (var tab_i = 1; tab_i <= 3; tab_i++) {
            var tab_info = this.tab_bnts[tab_i] = {};
            var tab_btn_nd = this.seekChild("tab_btn_" + tab_i);
            tab_btn_nd.tab_tag = tab_i;
            tab_info["select_nd"] = tab_btn_nd.getChildByName("select");
            tab_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTabBtns, this);
        }

        Utils.getNodeCompByPath("main_panel/tab_btn_1/label", this.root_wnd, cc.Label).string = Utils.TI18N("表情");
        Utils.getNodeCompByPath("main_panel/tab_btn_2/label", this.root_wnd, cc.Label).string = Utils.TI18N("道具");
        Utils.getNodeCompByPath("main_panel/tab_btn_3/label", this.root_wnd, cc.Label).string = Utils.TI18N("装备");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.selectTab(1);
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },

    setSelectCB: function(select_cb) {
        this.select_cb = select_cb;
    },

    onClickTabBtns: function(event) {
        if (event && this.cur_tab !== event.target.tab_tag)
            this.selectTab(event.target.tab_tag);
    },

    selectTab: function(tab_index) {
        if (this.cur_tab)
            this.tab_bnts[this.cur_tab]["select_nd"].active = false;

        this.tab_bnts[tab_index]["select_nd"].active = true;
        this.updateCurPanel(tab_index);
        this.cur_tab = tab_index;
    },

    updateCurPanel: function(list_index) {
        if (this.cur_tab && this.item_lists[this.cur_tab]) {
            this.item_lists[this.cur_tab].setRootVisible(false);
        }

        if (list_index && this.item_lists[list_index]) {
            this.item_lists[list_index].setRootVisible(true);
        } else {
            this.createItemList(list_index);
        }
    },

    createItemList: function(list_index) {
        var item_info = ItemEnum[list_index];

        var CommonScrollView = require("common_scrollview");
        var ItemSource = require(item_info.source);
        var scroll_view_size = cc.size(this.container_nd.width, this.container_nd.height)
        var setting = {
            item_class: ItemSource,                    // 单元类
            start_x: 0,                                // 第一个单元的X起点
            space_x: 0,                                // x方向的间隔
            start_y: 0,                                // 第一个单元的Y起点
            space_y: 0,                                // y方向的间隔
            item_width: item_info.width,               // 单元的尺寸width
            item_height: item_info.height,             // 单元的尺寸height
            col: item_info.col,                        // 列数，作用于垂直滚动类型
            once_num: 1,
            need_dynamic: true
        }
        this.item_lists[list_index] = new CommonScrollView();
        this.item_lists[list_index].createScroll(this.container_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5));

        var list_data = [];
        var select_cb = null;
        if (list_index === 1) {
            var face_cfgs = Config.face_data.data_biaoqing;
            for (var face_i in face_cfgs) {
                list_data.push(face_cfgs[face_i]);           
            }
            select_cb = this.selectFaceCB.bind(this);
        } else if (list_index === 2) {
            var BackpackController = require("backpack_controller");
            var bag_model = BackpackController.getInstance().getModel();
            list_data = bag_model.getItemListForShare();           
            select_cb = this.selectItemCB.bind(this);            
        } else if (list_index === 3) {
            var HeroController = require("hero_controller");
            var hero_mode = HeroController.getInstance().getModel();
            var hero_list = hero_mode.getHeroList();
            for (var hero_i in hero_list) {
                var hero_info = hero_list[hero_i];
                for (var equip_i in hero_info.eqm_list) {
                    hero_info.partner_data = hero_info;
                    list_data.push({item_data:hero_info.eqm_list[equip_i], hero_info:hero_info});
                }
            }            
            select_cb = this.selectEquipCB.bind(this);            
        }
        this.item_lists[list_index].setData(list_data, select_cb);
    },

    selectFaceCB: function(face_text) {
        if (face_text && this.select_cb) {
            this.select_cb(face_text);
        }
    },

    selectItemCB: function(item_data) {
        if (item_data && item_data.config) {
            this.chat_item_ctrl.send10535(1, item_data.id, 0, 1);
        };     
    },

    selectEquipCB: function(data) {
        var equip_data = data.item_data;
        var hero_info = data.hero_info;
        // 区分装备和符文
        if (equip_data && equip_data.config) {
            if (BackPackConst.checkIsEquip(equip_data.config.type)) {
                this.chat_item_ctrl.send10535(4, equip_data.id, hero_info.partner_id, 2);
            } else if (BackPackConst.checkIsArtifact(equip_data.config.type)) {
                this.chat_item_ctrl.send10535(2, equip_data.id, hero_info.partner_id, 2);                
            }
        }
    },

})