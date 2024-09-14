// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     背包物品合成
// <br/>Create: 2019-04-12 16:27:52
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackController = require("backpack_controller");

var Comp_choose_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "comp_choose_tips");
        this.viewTag = SCENE_TAG.msg;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.cur_number = 1;
        this.init_number = 1; //初始化是最大合成的个数
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.text_name = this.main_panel.getChildByName("text_name").getComponent(cc.Label);
        this.text_name.string = "";
        this.btn_redu = this.main_panel.getChildByName("btn_redu");
        this.btn_add = this.main_panel.getChildByName("btn_add");
        this.comp_num = this.main_panel.getChildByName("Image_2").getChildByName("comp_num").getComponent(cc.Label);
        this.comp_num.string = "";
        this.btn_comp = this.main_panel.getChildByName("btn_comp");
        var btn_comp_label = this.btn_comp.getChildByName("Text_1").getComponent(cc.Label);
        btn_comp_label.string = Utils.TI18N("合成");
    
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.goods_item.initConfig(true, 1, false);
        this.goods_item.setParent(this.main_panel)
        this.goods_item.show();
        this.goods_item.setPosition(0,60);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.showCompChooseTips(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_redu, function () {
            this.cur_number = this.cur_number - 1;
            if(this.cur_number < this.init_number){
                this.setTouchEnable_Add(false);
                this.setTouchEnable_Redu(false);
            }
            if(this.cur_number <= 0){
                this.setTouchEnable_Add(false);
                this.setTouchEnable_Redu(true);
            }

            if(this.cur_number<=0){
                this.cur_number = 0;
            }
            this.comp_num.string = this.cur_number;
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_add, function () {
            this.cur_number = this.cur_number + 1
            if(this.cur_number > 0){
                this.setTouchEnable_Add(false);
                this.setTouchEnable_Redu(false);
            }
            if(this.cur_number >= this.init_number){
                this.setTouchEnable_Add(true);
                this.setTouchEnable_Redu(false);
            }

            if(this.cur_number>this.init_number){
                this.cur_number = this.init_number;
            }
            this.comp_num.string = this.cur_number;
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_comp, function () {
            if(this.item_config){
                if(Config.partner_data.data_get_compound_info[this.item_config.id]){
                    BackpackController.getInstance().sender11008(this.item_config.id, this.cur_number);
                }else{
                    // -- BackpackController:getInstance():sender10523(this.item_config.icon, this.cur_number)  
                }
            }
        }.bind(this), 1);
    },

    setTouchEnable_Add:function(bool){
        this.btn_add.getComponent(cc.Button).interactable = !bool;
        this.btn_add.getComponent(cc.Button).enableAutoGrayEffect = bool;
    },
    
    setTouchEnable_Redu:function(bool){
        this.btn_redu.getComponent(cc.Button).interactable = !bool;
        this.btn_redu.getComponent(cc.Button).enableAutoGrayEffect = bool;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(item_bid){
        if(!item_bid)return;
        var config = Utils.getItemConfig(item_bid);
        this.item_config = config
        this.setBaseInfo();
    },

    setBaseInfo:function(){
        if(this.item_config == null)return;
        this.goods_item.setData(this.item_config.id);
        this.text_name.string = this.item_config.name;

        var item_data = BackpackController.getInstance().getModel().getBackPackItemNumByBid(this.item_config.id);
        var comp_num = 1;
        if(Config.partner_data.data_get_compound_info[this.item_config.id]) {
            comp_num = Config.partner_data.data_get_compound_info[this.item_config.id].num;
        }else{
            var hallows_data = BackpackController.getInstance().getModel().getHallowsCompData(this.item_config.id)
            comp_num = hallows_data.num;
        }
        this.cur_number = Math.floor(item_data/comp_num);
        this.init_number = this.cur_number;
        this.comp_num.string = this.cur_number;
        this.setTouchEnable_Add(true);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.goods_item){
            this.goods_item.deleteMe();
        }
        this.goods_item = null;

        this.ctrl.showCompChooseTips(false);
    },
})