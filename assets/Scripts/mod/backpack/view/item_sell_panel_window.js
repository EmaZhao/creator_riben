// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-11 10:17:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackPackConst = require("backpack_const");

var Item_sell_panelWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("backpack", "item_sell_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
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
  
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.text_name = this.main_panel.getChildByName("text_name").getComponent(cc.Label);
        this.text_name.string = "";
        this.btn_redu = this.main_panel.getChildByName("btn_redu");
        this.btn_add = this.main_panel.getChildByName("btn_add");
        this.comp_num = this.main_panel.getChildByName("Image_2").getChildByName("comp_num").getComponent(cc.Label);
        this.comp_num.string = "";
        this.btn_comp = this.main_panel.getChildByName("btn_comp");
        var text_1 = this.btn_comp.getChildByName("Text_1").getComponent(cc.Label);
        text_1.string = Utils.TI18N("出售");

        this.goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.goods_item.initConfig(true, 1, false);
        this.goods_item.setParent(this.main_panel)
        this.goods_item.show();
        this.goods_item.setPosition(0,80);
        
    
        var cost_bg = this.main_panel.getChildByName("cost_bg_2014");
        var pos = cost_bg.getPosition();
        this.cost_label = Utils.createRichLabel(26, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(pos.x , pos.y),36);
        this.cost_label.string = "";
        this.main_panel.addChild(this.cost_label.node);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openItemSellPanel(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_redu, function () {
            this.cur_number = this.cur_number - 1;
            if(this.cur_number < this.init_number){
                this.setTouchEnable_Add(false);
                this.setTouchEnable_Redu(false);
            }

            if(this.cur_number<=0){
                this.setTouchEnable_Add(false);
                this.setTouchEnable_Redu(true);
                this.cur_number = 0;
            }
            this.comp_num.string = this.cur_number;
            this.setCostInfo(this.cur_number);
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_add, function () {
            this.cur_number = this.cur_number + 1;
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
            this.setCostInfo(this.cur_number);
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_comp, function () {
            if(!this.goods_vo)return;
            if(this.cur_number <  0)return;
            this.ctrl.sender10522(this.bag_type, [{id:this.goods_vo.id, bid:this.goods_vo.base_id,num:this.cur_number}]);
            this.ctrl.openItemSellPanel(false);
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
    openRootWnd:function(info){
        if(!info)return;
        this.bag_type = info[1] || BackPackConst.Bag_Code.BACKPACK;
        this.goods_vo = info[0];
        this.item_config = info[0].config;
        this.setBaseInfo(this.cur_number);
    },

    setBaseInfo:function(){
        if(!this.item_config)return;
        this.goods_item.setData(this.goods_vo);
        this.text_name.string = this.item_config.name;
        var count = this.model.getPackItemNumByBid(this.bag_type,this.item_config.id);
        this.cur_number = count;
        this.init_number = this.cur_number;
        this.comp_num.string = this.cur_number;
        this.setTouchEnable_Add(true);

        //计算价值
        this.setCostInfo(this.cur_number);
    },

    setCostInfo:function(count){
        if(!this.item_config)return;
        var item_id = this.item_config.value[0][0];
        var price = this.item_config.value[0][1];
         var total_price = this.cur_number * price;
        var res = PathTool.getItemRes(item_id);
        var str = cc.js.formatStr("<img src='%s'/><color=#FFF6DD>%s</color>",item_id, total_price)
        this.cost_label.string = str;

        this.loadRes(res, (function(resObject){
            this.cost_label.addSpriteFrame(resObject);
        }).bind(this));
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.goods_item){
            this.goods_item.deleteMe();
        }
        this.goods_item = null;
        this.ctrl.openItemSellPanel(false);
    },
})