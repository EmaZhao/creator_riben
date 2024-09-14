// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     冒险宝箱奖励item
// <br/>Create: 2019-05-11 10:41:48
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureController = require("adventure_controller");

var Adventure_box_reward_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_box_reward_item");
        this.ctrl = AdventureController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var main_container = this.root_wnd.getChildByName("main_container");
        this.name_text = main_container.getChildByName("name_text").getComponent(cc.Label);
    
        this.btn_goto = main_container.getChildByName("btn_goto");
        this.btn_goto.active = false;
        var goText = this.btn_goto.getChildByName("Text_2").getComponent(cc.Label);
        goText.string = Utils.TI18N("前往");
        
        this.btn_get = main_container.getChildByName("btn_get");
        this.btn_get.active = false;
        var getText = this.btn_get.getChildByName("Text_2").getComponent(cc.Label);
        getText.string = Utils.TI18N("受取");
        
        this.spr_has = main_container.getChildByName("spr_has");
        this.spr_has.active = false;

        var good_cons = main_container.getChildByName("good_cons");
        var scroll_view_size = good_cons.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 10,                    // x方向的间隔
            start_y: 5,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120*0.80,               // 单元的尺寸width
            item_height: 120*0.80,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                         // 列数，作用于垂直滚动类型
            scale: 0.80                     // 缩放
        }
        var CommonScrollView = require("common_scrollview");
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview .createScroll(good_cons, cc.v2(0,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);
        this.item_scrollview.setClickEnabled(false);
        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_goto, function () {
            this.ctrl.openAdventureBoxRewardView(false);
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_get, function () {
            if(this.data && this.data.id){
                this.ctrl.send20635(this.data.id);
            }
        }.bind(this), 1);
    },

    setData:function(data){
        if(!data)return;
        this.data = data;
        if(!this.root_wnd)return;
        this.updateInfo();
    },

    updateInfo:function(){
        this.btn_goto.active = this.data.status == 0;
        this.btn_get.active = this.data.status == 1;
        this.spr_has.active = this.data.status == 2;

        var str = cc.js.formatStr(Utils.TI18N("击杀%d个守卫  (%d/%d)"),this.data.count,this.kill_index,this.data.count);
        this.name_text.string = str;
        var list = [];
        for(var i in this.data.items){
            var vo = {};
            if(vo){
                vo.bid = this.data.items[i][0];
                vo.num = this.data.items[i][1];
                list.push(vo);
            }
        }

        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function(){
            var list = this.item_scrollview.getItemList();
            for(var i in list){
                list[i].setDefaultTip();
                // list[i].setSwallowTouches(false);
            }

        }.bind(this));
    },

    setExtendData:function(index){
        this.kill_index = index;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
        }
        this.item_scrollview = null;
    },
})