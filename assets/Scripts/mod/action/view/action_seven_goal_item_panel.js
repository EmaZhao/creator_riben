// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     七天目标子项
// <br/>Create: 2019-04-18 15:16:30
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller");
var StrongerController = require("stronger_controller")

var Action_seven_goal_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_seven_goal_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.goods_list = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");

        this.goods_con = this.main_container.getChildByName("goods_con");
        this.has_bg = this.main_container.getChildByName("has_bg");
        this.has_bg.active = false;
    
        this.textGet = this.main_container.getChildByName("textGet").getComponent(cc.Label);
        this.btn_get = this.main_container.getChildByName("btn_get");
        this.btn_get_lab = this.btn_get.getChildByName("Label").getComponent(cc.Label);
        this.btn_get_lab.string = Utils.TI18N("受取");
        this.btn_get.active = false;
    
        this.btn_goto = this.main_container.getChildByName("btn_goto");
        this.btn_goto_lab = this.btn_goto.getChildByName("Label").getComponent(cc.Label);
        this.btn_goto_lab.string = Utils.TI18N("前往");
        this.btn_goto.active = false;
    
        this.half_panel = this.main_container.getChildByName("half_panel");
        this.image_2 = this.half_panel.getChildByName("Image_2").getComponent(cc.Sprite);
        this.price_1 = this.half_panel.getChildByName("price_1").getComponent(cc.Label);
        this.btn_buy = this.half_panel.getChildByName("btn_buy")
        
        this.price_2 = this.btn_buy.getChildByName("price_2").getComponent(cc.Label);
        this.image_2_0 = this.btn_buy.getChildByName("Image_2_0").getComponent(cc.Sprite);
        this.half_panel.active = false;

        var icon_path = PathTool.getItemRes(3);
        this.loadRes(icon_path, function(res_object){
            this.image_2.spriteFrame = res_object;
            this.image_2_0.spriteFrame = res_object;
        }.bind(this));
    
        this.title_txt = this.main_container.getChildByName("title_txt").getComponent(cc.Label);

        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_get, function () {
            ActionController.getInstance().cs13602(this.type, this.cur_day, this.serve_list[this.data._index].goal_id, this.data._index);
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_goto, function () {
            ActionController.getInstance().openSevenGoalView(false);
            StrongerController.getInstance().clickCallBack(this.data.show_icon);
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_buy, function () {
            ActionController.getInstance().cs13602(this.type, this.cur_day, this.data.id, this.data._index);
        }.bind(this), 1);
    },

    setExtendData:function(tab){
        this.serve_list = tab.list;
        this.type = tab.type;
        this.cur_day = tab.day;
    },

    setData:function( data ){
        this.data = data;
        this.updateInfo();
    },

    updateInfo:function(){
        if(!this.root_wnd)return;

        if(this.data.desc){
            this.title_txt.string = this.data.desc;
        }

        for(var i in this.goods_list){
            this.goods_list[i].setVisible(false);
        }

        for(var i=0;i<this.data.award1.length;i++){
            if(!this.goods_list[i]){
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.setAnchorPoint(0, 0.5);
                item.initConfig(false, 0.7, false,true);
                item.setParent(this.goods_con);
                item.show();
                this.goods_list[i] = item;
            }
            item = this.goods_list[i];
            if(item){
                item.setVisible(true);
                item.setPosition(i*(120*0.7+25)+120*0.7/2, 45);
                item.setData({bid:this.data.award1[i][0], num:this.data.award1[i][1]});
            }
        }

        if(this.type == 1){
            var val = this.serve_list[this.data._index];
            var str = cc.js.formatStr("%d/%d",val.value,val.target_val);
            this.textGet.string = str;
        }else if(this.type == 2 || this.type == 3){
            if(this.serve_list[this.data._index].progress && this.serve_list[this.data._index].progress[0]){
                var val = this.serve_list[this.data._index].progress[0];
                var str = cc.js.formatStr("%d/%d",val.value,val.target_val);
                this.textGet.string = str;
            }
        }else if(this.type == 4){
            this.btn_goto.active = false;
            this.btn_get.active = false;
            this.has_bg.active = false;
    
            this.price_1.string = this.data.price1;
            this.price_2.string = this.data.price2;

            if(this.serve_list[this.data._index].status == 0){
                this.half_panel.active = true;
                this.has_bg.active = false;
                this.textGet.string = Utils.TI18N("残り: 1");
            }else{
                this.half_panel.active = false;
                this.has_bg.active = true;
                this.textGet.string = Utils.TI18N("残り: 0");
            }
        }

        if(this.type != 4){
            this.half_panel.active = false;
            this.btn_goto.active = this.serve_list[this.data._index].status == 0;
            this.btn_get.active = this.serve_list[this.data._index].status == 1;
            this.has_bg.active = this.serve_list[this.data._index].status == 2;
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.goods_list && Utils.next(this.goods_list || {})!=null){
            for(var i in this.goods_list){
                if(this.goods_list[i].deleteMe){
                    this.goods_list[i].deleteMe();
                }
            }
        }
    },
})