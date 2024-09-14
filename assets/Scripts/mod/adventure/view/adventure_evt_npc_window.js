// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     npc对话框
// <br/>Create: 2019-05-13 16:43:43
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller")
var AdventureEvent = require("adventure_event");

var Adventure_evt_npcWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_npc_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.btn_list =[];
        this.data = null;
        this.config = null;
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("root");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.title_label = this.main_container.getChildByName("title_label");
        this.role_bg_node = this.main_container.getChildByName("role_bg");
        this.role_bg_node.scale = 1;
        this.role_bg = this.role_bg_node.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_45"), function (sf_obj) {
            this.role_bg.spriteFrame = sf_obj;
        }.bind(this));
        this.bg = this.main_container.getChildByName("bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_18"), function (sf_obj) {
            this.bg.spriteFrame = sf_obj;
        }.bind(this));
        
        this.tips_desc_label = Utils.createRichLabel(26, new cc.Color(0x29,0x27,0x34,0xff), cc.v2(0.5, 1), cc.v2(0, -this.main_container.getContentSize().height / 2+680),30,610);
        this.tips_desc_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.main_container.addChild(this.tips_desc_label.node);
        this.tips_desc_label.node.active = true;
        this.item_bg = this.main_container.getChildByName("item_bg");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.Update_Evt_Npc_Info,function(data){
            this.updateData(data);
        }.bind(this))
    },

    updateData:function(data){
        if(this.config && data){
            var npc_answer_config = Config.adventure_data.data_adventure_npc_data[data.evt_id][data.id];
            var temp_arr = [];
            for(var i in npc_answer_config){
                temp_arr.push(npc_answer_config[i]);
            }

            var btn_size = cc.size(604,87);
            var count = 0;

            temp_arr.sort(function(a,b){
                return  a.num - b.num;
            })

            if(temp_arr){
                this.tips_desc_label.string = temp_arr[0].lable_desc;
                var answer_abcd = {[0]: "", [1]: "", [2]: "", [3]: "",}

                for(var i=0;i<temp_arr.length;i++){
                    if(!this.btn_list[i]){
                        var node = new cc.Node();
                        node.setAnchorPoint(0.5, 0.5);
                        node.setContentSize(btn_size);
                        this.item_bg.addChild(node);

                        var btn_img = node.addComponent(cc.Sprite);
                        btn_img.type = cc.Sprite.Type.SLICED;
                        btn_img.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                        
                        var btn = node.addComponent(cc.Button);
                        btn.transition = cc.Button.Transition.SPRITE;
                        
                        this.loadRes(PathTool.getCommonIcomPath("Currency_7_1"), function (btn,btn_img,sf_obj) {
                            btn.normalSprite = sf_obj;
                            btn_img.spriteFrame = sf_obj;
                        }.bind(this,btn,btn_img));

                        this.loadRes(PathTool.getCommonIcomPath("Currency_7_1"), function (btn,sf_obj) {
                            btn.pressedSprite = sf_obj;
                        }.bind(this,btn));

                        node.active = false;

                        var title = Utils.createLabel(26,new cc.Color(0xff,0xff,0xff,0xff),null,0, 0,"",node,null, cc.v2(0.5,0.5));
                        btn.title = title;

                        var tag = Utils.createImage(node,null, 250,0,null,null,3);
                        tag.node.active = false;
                        this.loadRes(PathTool.getUIIconPath("adventure", "adventure_54"), (function(tag,resObject){
                            tag.spriteFrame = resObject;
                        }).bind(this,tag));

                        btn.i = i+1;
                        btn.tag = tag;
                        this.btn_list[i] = btn;
                    }
                    var btn = this.btn_list[i];
                    if(btn){
                        btn.node.active = true;
                        if(btn.title){
                            btn.title.string = answer_abcd[i] + temp_arr[i].msg;
                        }
                        btn.node.setPosition(0 ,-this.item_bg.getContentSize().height / 2+ 230 - (btn_size.height + 5) * i);
                       
                        btn.node.on(cc.Node.EventType.TOUCH_START, function(event){
                            if(this.btn_list){
                                for(var i in this.btn_list){
                                    if(this.btn_list[i]){
                                        this.btn_list[i].tag.node.active = false;
                                    }
                                }
                            }
                        },this);

                        btn.node.on(cc.Node.EventType.TOUCH_CANCEL, function(btn){
                            btn.tag.node.active = false;
                        }.bind(this,btn),this);

                        btn.node.on(cc.Node.EventType.TOUCH_END, function(btn){
                            if(this.data){               
                                var ext_list = [{ type: 1, val: btn.i }]
                                btn.tag.node.active = true;
                                this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.handle, ext_list);
                            }
                        }.bind(this,btn),this);
                        
                    }
                }
            }

        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.config = data.config;
        if(this.data){
            this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.requst, {});
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openEvtViewByType(false);
    },
})