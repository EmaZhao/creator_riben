// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     另外一种npcd对话的
// <br/>Create: 2019-05-13 19:52:45
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");

var Adventure_evt_other_npcWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_other_npc_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.config = null;
        this.btn_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var container = this.root_wnd.getChildByName("container");
        this.title_label = container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("神秘事件");
        this.close_btn = container.getChildByName("close_btn");
        
        this.swap_desc_label = Utils.createRichLabel(24, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0.5, 1), cc.v2(0, -container.height/2+320),30,610);
        container.addChild(this.swap_desc_label.node);
    
        this.item_bg = container.getChildByName("item_bg");
    
        this.container = container;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEvtViewByType(false);
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.Update_Evt_Npc_Info,function(data){
            this.updateAnswerData(data);
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.config = data.config;

        this.updatedata();
        if(this.data){
            this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.requst, {});
        }
    },

    updateAnswerData:function(data){
        if(this.config && data){
            var npc_answer_config = Config.adventure_data.data_adventure_npc_data[data.evt_id][data.id];
            if(npc_answer_config == null || Utils.next(npc_answer_config) == null)return;
            
            var temp_list = [];
            for(var i in npc_answer_config){
                temp_list.push(npc_answer_config[i]);
            }
            var btn_size = cc.size(604, 87);
            var count = 0;
            temp_list.sort(function(a, b){
                return a.num - b.num;
            });

            for(var i in temp_list){
                var v = temp_list[i];
                if(i == 0){
                    this.swap_desc_label.string = v.lable_desc;
                }
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
                    
                    var title = Utils.createRichLabel(24, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(0, 0),30,600);
                    node.addChild(title.node);
                    btn.title = title;

                    var tag = Utils.createImage(node,null, 250,0,null,null,3);
                    tag.node.active = false;
                    this.loadRes(PathTool.getUIIconPath("adventure", "adventure_54"), (function(tag,resObject){
                        tag.spriteFrame = resObject;
                    }).bind(this,tag));

                    btn.i = parseInt(i)+1;
                    btn.tag = tag;
                    this.btn_list[i] = btn;
                }
                var btn = this.btn_list[i];
                if(btn){
                    btn.node.active = true;
                    var extend_str = "";
                    if(v.lose){
                        for(var j in v.lose){
                            var item = v.lose[j];
                            if(extend_str!=""){
                                extend_str = extend_str+",";
                            }
                            var bid = item[0];
                            var num = item[1];
                            var _config = Utils.getItemConfig(bid);
                            if(_config){
                                extend_str = extend_str+cc.js.formatStr("<img src='%s'/>  ", _config.icon)+num;
                                this.loadRes(PathTool.getItemRes(_config.icon), (function(title,resObject){
                                    title.addSpriteFrame(resObject);
                                }).bind(this,btn.title));
                            }
                        }
                        if(extend_str!=""){
                            extend_str = cc.js.formatStr(Utils.TI18N("<color=#a95f0f>(消耗 %s)</color>"), extend_str);
                        }
                    }
                    btn.title.string = v.msg+"  "+extend_str;
                    btn.node.setPosition(0,-this.item_bg.getContentSize().height / 2 + 140 -(btn_size.height + 5) * i);
                    if(btn){
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

    updatedata:function(){
        if(this.config){
            this.swap_desc_label.string = this.config.desc;
            this.createEffect(this.config.effect_str);
        }
    },

    createEffect:function(bid){
        if(bid!=""){
            if(this.container && this.box_effect == null){
                var top_node = new cc.Node();
                top_node.setAnchorPoint(0.5,0.5)
                top_node.setPosition(0, -this.container.height/2 + 433);
                top_node.setScale(1.5);
                this.container.addChild(top_node);

                this.box_effect = top_node.addComponent(sp.Skeleton);
                var anima_path = PathTool.getSpinePath(bid, "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.box_effect.skeletonData = ske_data;
                    this.box_effect.setAnimation(0, PlayerAction.action, true);
                }.bind(this));
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openEvtViewByType(false);
    },
})