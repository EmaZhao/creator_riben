// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-26 19:39:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var EquipClothItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "equip_cloth_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.icon_list = {"atk":21, "hp_max":22, "def":23, "speed":37, "atk_per":21};
        this.attr_data_key = Config.attr_data.data_id_to_key;
        this.attr_data_name = Config.attr_data.data_id_to_name;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.item_con_nd    = this.seekChild("item_con");
        this.equip_btn_nd   = this.seekChild("equip_btn");
        
        this.equip_name_lb  = this.seekChild("equip_name", cc.Label);
        this.equip_lev_lb   = this.seekChild("equip_lev", cc.Label);
        this.equip_score_lb = this.seekChild("equip_score", cc.Label);
        
        this.attr_icon_sp   = this.seekChild("attr_icon", cc.Sprite);
        this.attr_name_lb   = this.seekChild("attr_name", cc.Label);
        this.attr_val_lb    = this.seekChild("attr_val", cc.Label);


        this.backpack_item = ItemsPool.getInstance().getItem("backpack_item");
        this.backpack_item.setParent(this.item_con_nd);
        this.backpack_item.setExtendData({effect: false, scale: 0.9});
        this.backpack_item.show();

        this.equip_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickEquipBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.backpack_item){
            this.backpack_item.deleteMe()
            this.backpack_item = null;
        }
    },

    setData: function(data) {
        this.equip_data = data;
        if (this.root_wnd)
            this.updateWidgets();
    },

    updateWidgets: function() {
        this.equip_name_lb.string = this.equip_data.config.name;
        this.equip_lev_lb.string = this.equip_data.lev;
        this.equip_score_lb.string = this.equip_data.score;  

        // main_attr
        var main_attr = this.equip_data.main_attr[0];
        if (main_attr) {
            var attr_key = this.attr_data_key[main_attr.attr_id];
            var attr_res = this.icon_list[attr_key];
            var attr_icon_path = PathTool.getUIIconPath("common", "common_900" + attr_res);
            this.loadRes(attr_icon_path, function(attr_sf) {
                this.attr_icon_sp.spriteFrame = attr_sf;
            }.bind(this));

            var attr_name = this.attr_data_name[main_attr.attr_id];
            this.attr_name_lb.string = attr_name + "：";
            this.attr_val_lb.string = main_attr.attr_val;
        }

        this.backpack_item.setData(this.equip_data);
        // this.backpack_item.setItemNum();

    },

    addCallBack: function(callback) {
        this.select_cb = callback;
    },

    onClickEquipBtn: function() {
        if (this.select_cb)
            this.select_cb(this.equip_data);
    },
})