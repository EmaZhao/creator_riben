// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     物品（圆形的）
// <br/>Create: 2019-04-25 19:50:35
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Round_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("backpack", "round_item");

        if(arguments && arguments.length > 0){
            this.click = arguments[0];
            this.scale = arguments[1] || 1;
            this.scale1 = arguments[2] || 1;
        }
        
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.isUnEnabled = false;
        this.redpointVisible = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        if(this.scale!=1){
            this.root_wnd.setScale(this.scale);
        }

        this.main_container = this.root_wnd.getChildByName("main_container");
        this.background = this.main_container.getChildByName("background");
        this.round_bg = this.background.getChildByName("round_bg");
        
        this.item_icon = this.main_container.getChildByName("icon");
        this.item_icon.setScale(this.scale1);
        this.num_label = this.main_container.getChildByName("num").getComponent(cc.Label);
        this.num_label.string = "";
        this.num_bg = this.main_container.getChildByName("num_bg");
        this.num_bg_size = this.num_bg.getContentSize();

        this.redpoint = this.main_container.getChildByName("redpoint");
        this.redpoint.active = false;

        this.round_res_id = PathTool.getRoundQualityBg(1);

        if(this.tmepData){
            this.updateData(this.tmepData);
        }

        this.setItemUnEnabled(this.isUnEnabled);
        this.setVisibleRedPoint(this.redpointVisible);
    },

    // 红点
    setVisibleRedPoint:function(visible){
        visible = visible || false;
        this.redpointVisible = visible;
        if(this.redpoint){
            this.redpoint.active = visible;
        }
    },

    // 物品
    setVisibleIcon:function(visible){
        visible = visible || false;
        if(this.item_icon){
            this.item_icon.active = visible;
        }
    },

    // 物品框颜色
    setSelfBackground:function(quality){
        quality = quality || 1;
        var res_id = PathTool.getRoundQualityBg(quality);
        this.round_res_id = res_id;
        this.loadRes(this.round_res_id,function(res){
            this.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this));
    },

    // 光圈
    setVisibleRoundBG:function(visible){
        visible = visible || false;
        if(this.round_bg){
            this.round_bg.active = visible;
        }
    },

    getData:function(){
        return this.data
    },

    // 点击回调
    addCallBack:function(callback){
        this.callback = callback;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        //当用户点击的时候记录鼠标点击状态
        this.root_wnd.on(cc.Node.EventType.TOUCH_START, function(event){
            var touches = event.getTouches();
            this.touch_began = touches[0].getDelta();

        },this);

        //当鼠标抬起的时候恢复状态
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function(event){
            var touches = event.getTouches();
            this.touch_end = touches[0].getDelta();

            var is_click = true;
            if(this.touch_began != null){
                is_click = Math.abs(this.touch_end.x - this.touch_began.x) <= 20 && Math.abs(this.touch_end.y - this.touch_began.y) <= 20;
            }
            if(is_click == true){
                Utils.playButtonSound(ButtonSound.Normal);
                if(this.btn_call_fun){
                    this.btn_call_fun();
                }else{
                    if(this.is_show_tips && this.data != null){
                        var bid = this.data.bid || this.data.base_id || this.data.id;
                        var type = 0;
                        if(this.data){
                            if(this.data.config && this.data.config.type){
                                type = this.data.config.type;
                            }else if(this.data.type){
                                type = this.data.type;
                            }
                        }
                        var BackPackConst = require("backpack_const");
                        if(BackPackConst.checkIsEquip(type) && (!this.is_spec)){
                            var HeroController = require("hero_controller")
                            HeroController.getInstance().openEquipTips(true, this.data);
                        }else{
                            var config;
                            if(this.data.config){
                                config = this.data.config;
                            }else{
                                config = Utils.getItemConfig(bid);
                            }
                            // 虽然显示物品来源,但是如果没有配置也不需要显示
                            if(this.is_show_source == true && config.source && Utils.next(config.source)){
                                var BackpackController = require("backpack_controller");
                                BackpackController.getInstance().openTipsSource(true, config);
                            }else{
                                var TipsController = require("tips_controller");
                                TipsController.getInstance().showGoodsTips(config);
                            }
                        }
                        return;
                    }
                }
                if(this.callback){
                    this.callback();
                }
            }
        },this);
    },

    // 显示tips的开关
    setDefaultTip:function(is_show_tips){
        if(is_show_tips == null){
            is_show_tips = true;    
        }
        this.is_show_tips = is_show_tips;
    },

    // 物品数据
    setBaseData:function(data){
        this.tmepData = data;
        if(this.root_wnd){
            this.updateData(data);
        }
    },
    
    updateData:function(data){
        var config = Utils.getItemConfig(data.bid);
        if(config == null)return;
        this.data = config;

        this.item_icon.active = true;
        var head_icon = PathTool.getItemRes(config.icon);
        this.loadRes(head_icon,function(res){
            this.item_icon.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this));

        //  设置数量显示
	    this.setSelfNum(data.num);

	    //  设置背景
	    this.setSelfBackground(config.quality);
    },

    setSelfNum:function(num){
        num = num || 0;
        this.num_label.node.active = num >1;
        this.num_bg.active = num > 1;
        if(num > 1){
            this.num_label.string = num;
            this.updateNumBGSize();
        }
    },

    updateNumBGSize:function(){
        var size = this.num_label.node.getContentSize();
        var width = size.width;
        if(width < 50){
            width = 50;    
        }
        this.num_bg.setContentSize(cc.size(width+6, this.num_bg_size.height));
    },

    //置灰
    setItemUnEnabled: function (bool) {
        this.isUnEnabled = bool;
        if (this.background) {
            this.background.getComponent(cc.Sprite).setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        }

        if (this.round_bg) {
            this.round_bg.getComponent(cc.Sprite).setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        }

        if (this.item_icon) {
            this.item_icon.getComponent(cc.Sprite).setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        }

        if (this.num_bg) {
            this.num_bg.getChildByName("background").getComponent(cc.Sprite).setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        }

        if (this.redpoint) {
            this.redpoint.getComponent(cc.Sprite).setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
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

    },
})