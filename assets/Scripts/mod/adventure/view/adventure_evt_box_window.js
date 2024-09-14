// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     事件宝箱
// <br/>Create: 2019-05-11 15:41:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackController = require("backpack_controller");
var AdventureEvent = require("adventure_event");

var Adventure_evt_boxWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_box_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.config = null;
        this.item_list = [];
        this.need_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("root");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.item_container = this.main_container.getChildByName("item_container");
    
        this.ack_button = this.main_container.getChildByName("ack_button");
        var ack_label = this.ack_button.getChildByName("label").getComponent(cc.Label);
        ack_label.string = Utils.TI18N("打 开");
    
        this.title_label = this.main_container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("宝箱");
        this.reward_label = this.main_container.getChildByName("reward_label").getComponent(cc.Label);
        this.reward_label.string = Utils.TI18N("随机奖励预览");
        
        this.swap_desc_label = Utils.createRichLabel(24, new cc.Color(0x29,0x27,0x34, 0xff), cc.v2(0.5, 1), cc.v2(0, -this.main_container.height/2+760),30,610);
        this.main_container.addChild(this.swap_desc_label.node);
        
        var scroll_view_size = this.item_container.getContentSize();
        
        var setting = {
            item_class: "backpack_item", // 单元类
            start_x: 10, // 第一个单元的X起点
            space_x: 15, // x方向的间隔
            start_y: 5, // 第一个单元的Y起点
            space_y: 10, // y方向的间隔
            item_width: 120 * 0.9, // 单元的尺寸width
            item_height: 120 * 0.9, // 单元的尺寸height
            row: 0, // 行数，作用于水平滚动类型
            col: 5, // 列数，作用于垂直滚动类型
            scale: 0.9
        }
        var CommonScrollView = require("common_scrollview");
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview .createScroll(this.item_container, cc.v2(-scroll_view_size.width/2,-scroll_view_size.height) , ScrollViewDir.vertical, ScrollViewStartPos.top, cc.size(scroll_view_size.width,scroll_view_size.height - 49), setting);

        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.ack_button, function () {
            if(this.data){
                var ext_list = [{ type: 1, val: 0 }];
                this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.handle,ext_list);
            }
        }.bind(this), 1);

        this.addGlobalEvent(AdventureEvent.Update_Evt_Box_Result_Info,function(data){
            if(data){
                this.updateResult(data);
            }
        }.bind(this))
    },

    updatedata:function(){
        if(this.config){
            this.swap_desc_label.string = this.config.desc;
            if(this.config.lose && Utils.next(this.config.lose[0] || {}) != null){
                this.updateItemData(this.config.lose);
            }
            
            this.createEffect(this.config.effect_str);
            if(this.config.box_show_item && Utils.next(this.config.box_show_item || {}) != null){
                this.updateRankItemData(this.config.box_show_item);
            }
        }
    },

    createEffect:function(bid){
        if(bid!=""){
            if(this.main_container && this.box_effect == null){
                var top_node = new cc.Node();
                top_node.setAnchorPoint(0.5,0.5)
                top_node.setPosition(-this.main_container.width/2+375, -this.main_container.height/2+855);
                top_node.setScale(1.5);
                this.main_container.addChild(top_node);

                this.box_effect = top_node.addComponent(sp.Skeleton);
                var anima_path = PathTool.getSpinePath(bid, "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.box_effect.skeletonData = ske_data;
                    this.box_effect.setAnimation(0, PlayerAction.action, true);
                }.bind(this));
            }
        }
    },

    updateItemData:function(data){
        if(data && Utils.next(data || {}) != null){
            this.need_list = data;
            var total_width = data.length * 120 + data.length * 5;
            this.start_x = (this.item_container.getContentSize().width - total_width) * 0.5;
            for(var i in data){
                var v = data[i];
                if(!this.item_list[i]){
                    var item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(true);
                    item.setAnchorPoint(0.5, 0.5);
                    item.setScale(0.8);
                    item.show();
                    item.setData({bid:v[0],num:v[1]});
                    item.setDefaultTip();
                    var num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(v[0]);
                    item.setNeedNum(v[1], num);
                    item.bid = v[0];
                    item.setParent(this.main_container);
                    item.setPosition(-this.main_container.width/2+360,-this.main_container.height/2+408);
                    this.item_list[i] = item;
                }
            }
        }
    },

    updateRankItemData:function(data){
        if(!data)return;
        var list = [];
        for(var i in data){
            var v = data[i];
            var vo = {};
            vo = Utils.deepCopy(Utils.getItemConfig(v[0]));
            vo.num = v[1];
            list.push(vo);
        }
        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function (  ){
            var list = this.item_scrollview.getItemList();
            for(var k in list){
                list[k].setDefaultTip();
                if(list[k].data && list[k].data.num != 1){
                    list[k].setItemNum(list[k].data.num);
                }
            }
        }.bind(this));
    },

    updateResult:function(data){
        this.box_effect.setAnimation(0,PlayerAction.action_1,false);
        gcore.Timer.set(function () {
            this.ctrl.showGetItemTips(data.items);
            this.ctrl.openEvtViewByType(false) ;
        }.bind(this), 1000, 1);
    },

    updateNum:function(base_id){
        if(this.item_list){
            for(var i in this.item_list){
                var item = this.item_list[i];
                if(item && item.num_label){
                    if(item.bid == base_id){
                        var num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(item.bid);
                        item.num_label.string = cc.js.formatStr(Utils.TI18N("拥有<color=#e14737>%s</color>个"), num);
                    }
                }
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.config = data.config;
        this.updatedata();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_list){
            for(var i in this.item_list){
                if(this.item_list[i]){
                    this.item_list[i].deleteMe();
                }
            }
            this.item_list = null;
        }

        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        
        this.ctrl.openEvtViewByType(false);
    },
})