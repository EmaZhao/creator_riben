// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-27 16:24:30
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackPackConst = require("backpack_const");
var HallowsController = require("hallows_controller")

var Form_hallows_selectPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "form_hallows_select_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.select_cb = null;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.look_btn_nd    = this.seekChild("look_btn");
        this.comfirm_btn_nd = this.seekChild("comfirm_btn");
        this.cancel_btn_nd  = this.seekChild("cancel_btn");
        this.btn_title_lb   = this.seekChild("btn_title", cc.Label);
        
        // icon
        this.hallow_icon_nd = this.seekChild("hallow_icon");
        this.hallow_lock_nd = this.seekChild("hallow_lock");

        
        this.item_icon = ItemsPool.getInstance().getItem("backpack_item");
        this.item_icon.initConfig(false,1,false,false);
        this.item_icon.setParent(this.hallow_icon_nd);
        this.item_icon.show();
        

        this.hallow_name_lb = this.seekChild("hallow_name", cc.Label);
        this.hallow_name_nd = this.seekChild("hallow_name");
        this.hallow_des_lb  = this.seekChild("hallow_des", cc.Label);
        this.open_txt_nd    = this.seekChild("open_txt");

        this.look_btn_nd.active    = false;
        this.hallow_lock_nd.active = false;

        this.comfirm_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickComfirmBtn, this);
        this.cancel_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCancelBtn, this);
        this.look_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLookBtn, this);
        Utils.getNodeCompByPath("main_container/cancel_btn/btn_title", this.root_wnd, cc.Label).string = Utils.TI18N("取消配置");
        Utils.getNodeCompByPath("main_container/comfirm_btn/btn_title", this.root_wnd, cc.Label).string = Utils.TI18N("装 配");
        Utils.getNodeCompByPath("main_container/open_txt", this.root_wnd, cc.Label).string = Utils.TI18N("未开启");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.look_btn_nd.on("click",function(){
            Utils.playButtonSound(1)
            HallowsController.getInstance().openHallowsTips(true, this.hallow_cfg.id)
        },this)
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
        if(this.item_icon){
            this.item_icon.deleteMe();
        }
        this.item_icon = null;
    },

    setData: function(data) {        
        this.hallow_vo = data.hallow_vo;
        this.hallow_cfg = data.hallow_cfg;
    },

    addCallBack: function(select_cb) {
        this.select_cb = select_cb;
    },

    updateWidgets: function() {
        var item_cfg = gdata("item_data", "data_unit1", this.hallow_cfg.item_id, false);

        // if(this.hallow_vo && this.hallow_vo.look_id != 0){//幻化功能--暂时屏蔽
        //     // var magic_cfg = Config.HallowsData.data_magic[data.hallows_vo.look_id]
        //     if(magic_cfg){
        //         this.item_icon.setData(magic_cfg.item_id);
        //     }else{
        //         this.item_icon.setData(this.hallow_cfg.item_id);
        //     }
        // }else{
        //     this.item_icon.setData(this.hallow_cfg.item_id);    
        // }

        this.item_icon.setData(this.hallow_cfg.item_id);

        // 名字
        var lev, key = null;
        if (!!this.hallow_vo) {
            key = this.hallow_cfg.id + "_" + this.hallow_vo.skill_lev;
            lev = this.hallow_vo.step;
        } else {
            key = this.hallow_cfg.id + "_" + 1;
            lev = 1;
        }

        var name_str = cc.js.formatStr("%s (%s%s)", this.hallow_cfg.name, lev, Utils.TI18N("级"));
        this.hallow_name_lb.string = name_str;
        // var name_color_hex = BackPackConst.quality_color(item_cfg.quality)
        // var color = this.hallow_name_nd.color;
        // cc.log(name_color_hex);
        // color.fromHEX(name_color_hex);
        // this.hallow_name_nd.color = color;

        // 详细信息
        var skill_up_cfg = gdata("hallows_data", "data_skill_up", key);

        var skill_cfg = gdata("skill_data","data_get_skill", skill_up_cfg.skill_bid);
        if (skill_cfg) {
            this.hallow_des_lb.string = skill_cfg.des;
        } else {
            this.hallow_des_lb.string = Utils.TI18N("该神器没有技能");
        }

        // 按钮
        this.item_icon.setItemIconUnEnabled(!this.hallow_vo ?true:false);

        if (!!this.hallow_vo) {
            this.look_btn_nd.active = true;
            this.hallow_lock_nd.active = false;
            this.open_txt_nd.active = false;
            if (this.hallow_vo.is_equip) {
                this.comfirm_btn_nd.active = false;
                this.cancel_btn_nd.active = true;
            } else {
                this.comfirm_btn_nd.active = true;                
                this.cancel_btn_nd.active = false;                
            }
        } else {
            this.hallow_lock_nd.active = true;
            this.comfirm_btn_nd.active = false;                
            this.cancel_btn_nd.active = false;                            
            this.look_btn_nd.active = false;
        }
    },

    onClickComfirmBtn: function() {
        Utils.playButtonSound(1)
        if (this.select_cb)
            this.select_cb(this.hallow_vo);
    },

    onClickCancelBtn: function() {
        Utils.playButtonSound(1)
        if (this.select_cb)
            this.select_cb(null);
    },

    onClickLookBtn: function() {
        if(this.hallow_vo){
            var HallowsController = require("hallows_controller");
            var max_vo = HallowsController.getInstance().getModel().makeHighestHallowVo(this.hallow_vo.id);
            HallowsController.getInstance().openHallowsTips(true, max_vo);
        }
    },

})