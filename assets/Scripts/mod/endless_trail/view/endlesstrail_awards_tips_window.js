// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 14:02:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Endlesstrail_awards_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_awards_tips");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.main_container = this.main_panel.getChildByName("main_container");
        this.desc_label = this.main_panel.getChildByName("desc_label").getComponent(cc.Label);;
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.ok_btn = this.main_panel.getChildByName("ok_btn");
        this.ok_btn.btn = this.main_panel.getChildByName("ok_btn").getComponent(cc.Button);
        this.ok_btn.label = this.ok_btn.getChildByName("label").getComponent(cc.Label);
        this.ok_btn.label.string = Utils.TI18N("领取");
        this.ok_btn.line = this.ok_btn.getChildByName("label").getComponent(cc.LabelOutline);

        this.title_container = this.main_panel.getChildByName("title_container");
        this.title_label = this.title_container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("奖励");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEndlessRewardTips(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEndlessRewardTips(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.ok_btn, function () {
            if(this.data){
                this.ctrl.send23904(this.data.id)
            }
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        if(data){
            if(Config.endless_data.data_first_data && Config.endless_data.data_first_data[this.data.id]){
                var config = Config.endless_data.data_first_data[this.data.id]
                this.updateItemData(config);
            }
        }
    },

    updateItemData:function(config){
        if(config){
            var str  = cc.js.formatStr(Utils.TI18N("第%s关首通奖励"),config.limit_id);
            this.desc_label.string = str;
            var sum = config.items.length;
            this.space = 30
            var total_width = sum * 120 + (sum - 1) * this.space
            this.start_x = (this.main_container.getContentSize().width - total_width) * 0.5

            for(var i in config.items){
                if(!this.item_list[i]){
                    var item = ItemsPool.getInstance().getItem("backpack_item");
                    item.setParent(this.main_container);
                    item.initConfig(true);
                    item.setData({ bid: config.items[i][0], num: config.items[i][1] });
                    var _x = this.start_x + 120 * 0.5 + parseInt(i) * (120 + this.space)
                    item.setPosition(_x, this.main_container.getContentSize().height/2)
                    item.show();
                    item.setDefaultTip()
                    
                    this.item_list[i] = item;
                }
            }
        }
        if(this.data){
            if(this.data.status == 1){
                if(this.ok_btn.label){
                    if(this.ok_btn.btn){
                        this.ok_btn.btn.interactable = true;
                        this.ok_btn.btn.enableAutoGrayEffect = false;    
                    }
                    // this.ok_btn.line.width = 2;
                    this.ok_btn.line.enabled = true;
                    this.ok_btn.label.string = Utils.TI18N("领取");
                }
            }else{
                if(this.ok_btn.label){
                    if(this.ok_btn.btn){
                        this.ok_btn.btn.interactable = false;
                        this.ok_btn.btn.enableAutoGrayEffect = true;    
                    }
                    // this.ok_btn.line.width = 0;
                    this.ok_btn.line.enabled = false;
                    this.ok_btn.label.string = Utils.TI18N("不可领取");
                }
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.item_list){
            this.item_list[i].deleteMe();
        }
        this.item_list = [];
        this.ctrl.openEndlessRewardTips(false);
    },
})