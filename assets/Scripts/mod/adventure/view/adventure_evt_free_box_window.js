// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     神界冒险免费宝箱
// <br/>Create: 2019-05-13 14:38:04
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var AdventureEvent = require("adventure_event");

var Adventure_evt_free_boxWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_free_box_view");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.config = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.container = this.root_wnd.getChildByName("container");
    
        this.close_btn = this.container.getChildByName("close_btn");
        this.item_container = this.container.getChildByName("item_container");
        
        this.ack_button = this.container.getChildByName("ack_button");
        var label = this.ack_button.getChildByName("Label").getComponent(cc.Label);
        label.string = Utils.TI18N("打开");
    
        this.title_label = this.container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("宝箱");
        this.reward_label = this.container.getChildByName("reward_label").getComponent(cc.Label);
        this.reward_label.string = Utils.TI18N("随机奖励预览");
    
        var scroll_view_size = this.item_container.getContentSize();
        var setting = {
            item_class: BackPackItem, // 单元类
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
        this.is_select = false;
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.item_container, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, cc.size(scroll_view_size.width, scroll_view_size.height - 49), setting);

        this.open_desc = this.container.getChildByName("open_desc").getComponent(cc.Label);
        this.open_desc.string = "";

        this.desc = this.container.getChildByName("desc").getComponent(cc.Label);
        this.desc.node.setContentSize(cc.size(556, 80));

        this.updatedata();
    },

    updatedata:function(){
        if(this.config){
            this.desc.string = this.config.desc;
            if(this.config.lose && Utils.next(this.config.lose[1] || {}) != null){
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
            if(this.container && this.box_effect == null){
                var box_node = new cc.Node();
                box_node.setAnchorPoint(0.5,0.5)
                box_node.setPosition(360, 608);
                box_node.setScale(1.5);
                this.container.addChild(box_node);
        
                this.box_effect = box_node.addComponent(sp.Skeleton);
                this.loadRes(bid, function(ske_data) {
                    if(this.box_effect){
                        this.box_effect.skeletonData = ske_data;
                        this.box_effect.setAnimation(0, PlayerAction.action, true);
                    }
                }.bind(this));
            }
        }
    },

    updateRankItemData:function(data){
        if(!data)return;
        var list = [];
        for(var i in data){
            var vo = {}
            vo = Utils.deepCopy(Utils.getItemConfig(v[1]));
            vo.num = v[2];
            list.push(vo);
        }
        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function(){
            var list = this.item_scrollview.getItemList();
            for(var i in list){
                list[i].setDefaultTip();
                if(list[i].data && list[i].data.num != 1){
                    list[i].setNum(list[i].data.num);
                }
            }
        }.bind(this));
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
                var ext_list = [{type: 1, val: 0}];
                if(this.is_select == true){
                    ext_list = [{type: 1, val: 1}]
                }
                this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.handle, ext_list);
            }
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.Update_Evt_Box_Result_Info,function(data){
            if(data){
                this.updateResult(data);
            }
        }.bind(this))
    },

    updateResult:function(data){
        if(this.box_effect){
            this.box_effect.setAnimation(0, PlayerAction.action_1, false);
        }

        gcore.Timer.set(function () {
            this.ctrl.showGetItemTips(data.items);
		    this.ctrl.openEvtViewByType(false)
        }.bind(this), 1000);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.config = data.config;
        this.updatedata();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }

        this.ctrl.openEvtViewByType(false);
    },
})