// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     猜拳事件
// <br/>Create: 2019-05-13 10:31:21
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");

var Adventure_evt_fighterguessWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_finger_guessing_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.config = null;
        this.ext_list = [];
        this.btn_list ={};
        this.item_btn = {};
        this.cur_item_index = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("root");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.role_bg = this.main_container.getChildByName("role_bg");
        this.bg_node = this.main_container.getChildByName("bg");
        this.bg_node.scale = 2;
        this.bg = this.bg_node.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_21"), function (sf_obj) {
            this.bg.spriteFrame = sf_obj;
        }.bind(this));
        
        this.role_bg = this.main_container.getChildByName("role_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_22"), function (sf_obj) {
            this.role_bg.spriteFrame = sf_obj;
        }.bind(this));
        
        this.bottom_container = this.main_container.getChildByName("bottom_container");
        this.title = this.main_container.getChildByName("window_title_label").getComponent(cc.Label);
        this.title.string = Utils.TI18N("猜拳");
        
        this.swap_desc_label = Utils.createRichLabel(26, new cc.Color(0x68,0x45,0x2a, 0xff), cc.v2(0.5,0.5), cc.v2(-this.main_container.width/2+227,-this.main_container.height/2+835),30,340);
        this.swap_desc_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.main_container.addChild(this.swap_desc_label.node);
        this.swap_desc_label.node.active = true;
        this.desc_label = this.main_container.getChildByName("desc_label").getComponent(cc.Label);
        this.guide_container = this.main_container.getChildByName("guide_container");
        this.guide_container_pos = cc.v2(this.guide_container.x,this.guide_container.y);
        this.guidel_label = this.guide_container.getChildByName("guide_label").getComponent(cc.Label);
        this.guidel_label.string = Utils.TI18N('请下注');
        if(Config.adventure_data.data_adventure_const["describe_mora"]){
            this.desc_label.string = Config.adventure_data.data_adventure_const["describe_mora"].val;
        }
        for(var i=1;i<=4;i++){
            var item_btn = this.bottom_container.getChildByName(cc.js.formatStr("item_button_%s", i));
            item_btn.label = item_btn.getChildByName("item_label").getComponent(cc.Label); 
            
            item_btn.btn = item_btn.getComponent(cc.Button); 
            item_btn.btn.interactable = false;
            item_btn.btn.enableAutoGrayEffect = true;
            item_btn.index = i;
            this.item_btn[i] = item_btn;
        }
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        

        for(var i in this.item_btn){
            if(this.item_btn[i]){
                Utils.onTouchEnd(this.item_btn[i], function (index) {
                    this.selecItem(index)
                }.bind(this,this.item_btn[i].index), 3);
            }
        }

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.Update_Evt_Guess_Result,function(data){
            if(data){
                this.updateResult(data);
            }
        }.bind(this))
    },

    updatedata:function(){
        if(this.config){
            this.swap_desc_label.string = this.config.desc;
            this.updateItemData(this.config.lose);
            this.updateGuessContainer();
        }
    },

    updateGuessContainer:function(){
        // 左边动作
        if(this.main_container && this.left_effect == null){
            var left_node = new cc.Node();
            left_node.setAnchorPoint(0.5,0.5)
            left_node.setPosition(-this.main_container.width/2+210, -this.main_container.height/2+640);
            this.main_container.addChild(left_node);
    
            this.left_effect = left_node.addComponent(sp.Skeleton);
            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(134), "action");
            this.loadRes(anima_path, function(ske_data) {
                if(this.left_effect){
                    this.left_effect.skeletonData = ske_data;
                    this.left_effect.setAnimation(0, PlayerAction.action_4, true);
                }
            }.bind(this));
        }

        if(this.main_container && this.right_effect == null){
            var right_node = new cc.Node();
            right_node.color = new cc.Color(115, 115, 115, 255);
            right_node.setAnchorPoint(0.5,0.5)
            right_node.setPosition(-this.main_container.width/2+510, -this.main_container.height/2+640);
            right_node.scaleX = -1;
            this.main_container.addChild(right_node);
    
            this.right_effect = right_node.addComponent(sp.Skeleton);
            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(134), "action");
            this.loadRes(anima_path, function(ske_data) {
                if(this.right_effect){
                    this.right_effect.skeletonData = ske_data;
                    this.right_effect.setAnimation(0, PlayerAction.action_4, true);
                }
            }.bind(this));
            
        }
        
        // right
        for(var i=1;i<=3;i++){
            var tab_btn = this.main_container.getChildByName(cc.js.formatStr("Button_%s", i));
            
            tab_btn.btn = tab_btn.getComponent(cc.Button); 
            tab_btn.btn.interactable = false;
            tab_btn.btn.enableAutoGrayEffect = true;
            tab_btn.index = i;
            this.btn_list[i] = tab_btn;
        }

        for(var i in this.btn_list){
            if(this.btn_list[i]){
                Utils.onTouchEnd(this.btn_list[i], function (index) {
                    this.selectBtn(index)
                }.bind(this,this.btn_list[i].index), 3);
            }
        }
    },

    selectBtn:function(index){
        this.deleteExtlist(1);
        if(this.cur_select_index == index){
            if(this.cur_tab != null){
                this.cur_tab.interactable = false;
                this.cur_tab.enableAutoGrayEffect = true;
                this.cur_tab = null;
                this.cur_select_index = null;
            }
            return;
        }

        if(this.cur_tab != null){
            this.cur_tab.interactable = false;
            this.cur_tab.enableAutoGrayEffect = true;
        }
        this.cur_select_index = index;
        this.cur_tab = this.btn_list[index].btn;
        if(this.cur_tab!=null){
            this.cur_tab.interactable = true;
            this.cur_tab.enableAutoGrayEffect = false;
        }
        this.ext_list.push({ type: 1, val: index });
        this.checkAsk();
    },

    deleteExtlist:function(type){
        if(this.ext_list){
            for(var i in this.ext_list){
                if(this.ext_list[i].type == type){
                    this.ext_list.splice(i,1);
                }
            }
        }
    },

    updateItemData:function(data){
        if(data){
            for(var i in data){
                var label = this.item_btn[parseInt(i)+1].label;
                if(label){
                    label.string = data[i][1];
                }
            }
        }
    },

    selecItem:function(index){
        this.deleteExtlist(2);
        if(this.cur_item_index == index){
            if(this.cur_item_tab != null){
                this.cur_item_tab.interactable = false;
                this.cur_item_tab.enableAutoGrayEffect = true;
                this.cur_item_tab = null;
                this.cur_item_index = null;
            }
            this.guide_container.active = true;
            this.guide_container.runAction(cc.sequence(cc.moveTo(0.4,cc.v2(this.guide_container_pos)),cc.callFunc(function (){
                this.guidel_label.string = Utils.TI18N("请下注");
            }.bind(this))));
            return;
        }
        if(this.cur_item_tab != null){
            this.cur_item_tab.interactable = false;
            this.cur_item_tab.enableAutoGrayEffect = true;
        }
        this.cur_item_index = index;
        this.cur_item_tab = this.item_btn[index].btn;
        if(this.cur_item_tab != null){
            this.cur_item_tab.interactable = true;
            this.cur_item_tab.enableAutoGrayEffect = false;
        }
        this.guide_container.active = true;
        this.guide_container.runAction(cc.sequence(cc.moveTo(0.4,cc.v2(-this.main_container.width/2+123,-this.main_container.height/2+425)),cc.callFunc(function (){
            this.guidel_label.string = Utils.TI18N("请出拳");
        }.bind(this))));
        this.ext_list.push({ type: 2, val: index });
        this.checkAsk();
    },

    
    checkAsk:function(){
        if(this.data == null)return;
        var count = 0;
        for(var i in this.ext_list){
            count = count + 1;
        }
        if(count >= 2){
            this.guide_container.active =false;
            this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.handle,this.ext_list);
        }
    },

    updateResult:function(data){
        if(this.left_effect){
            var action_name = "action"+data.sel_val;
            this.left_effect.setAnimation(0, action_name, false);
        }

        if(this.right_effect){
            var action_name = "action" + data.ret_val;
            this.right_effect.setAnimation(0, action_name, false);
        }

        var str = "";
        if(data.ret == 0){
            str = Utils.TI18N("趁你没输，赶紧回去吧");
        }else if(data.ret == 1){
            str = Utils.TI18N("愿赌服输，你赢了");
        }else{
            str = Utils.TI18N("小子，回去练练再来");
        }

        gcore.Timer.set(function () {
            this.showStr(str);
        }.bind(this), 800);

        gcore.Timer.set(function () {
            this.ctrl.openEvtViewByType(false) ;
            this.ctrl.showGetItemTips(data.items, true, data.ret);
        }.bind(this), 3000);
    },

    // 打字机效果
    showStr:function(str){
        var list,len = StringUtil.splitStr(str);
        var temp_str = "";
        for(var i in list){
            Utils.delayRun(this.root_wnd,0.1 * i,function (v){
                temp_str = temp_str + v.char;
                this.swap_desc_label.string = temp_str;
            }.bind(this,list[i]));
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
        this.ext_list = [];
        this.ctrl.openEvtViewByType(false);
    },
})