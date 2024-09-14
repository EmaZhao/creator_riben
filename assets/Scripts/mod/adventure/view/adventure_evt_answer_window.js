// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     事件答题界面
// <br/>Create: 2019-05-11 11:45:16
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");

var Adventure_evt_answerWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_answer_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.config = null;
        this.item_list = [];
        this.btn_list = [];
        this.str = "";
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("root");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.start_container = this.main_container.getChildByName("start_container");
        this.role_bg = this.main_container.getChildByName("role_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_25"), function (sf_obj) {
            this.role_bg.spriteFrame = sf_obj; 
        }.bind(this));
        
        this.total_desc = this.main_container.getChildByName("total_desc").getComponent(cc.Label);
        this.total_desc.string = Utils.TI18N("全对奖励");
        this.title_label = this.main_container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("智力大乱斗");
        this.this_desc = this.main_container.getChildByName("this_desc").getComponent(cc.Label);
        this.this_desc.string = Utils.TI18N("当前奖励");
        this.item_container = this.main_container.getChildByName('item_container');
        
        this.base_reward_label = Utils.createRichLabel(26, new cc.Color(0xca,0x72,0x24, 0xff), cc.v2(0, 0.5), cc.v2(-this.main_container.width/2+315,-this.main_container.height/2+455),36,500);
        this.main_container.addChild(this.base_reward_label.node);
        this.base_reward_label.node.active = true;
        this.base_reward_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.talk_bg = this.main_container.getChildByName("talk_bg");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAnswerView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openAnswerView(false);
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.Update_Evt_Answer_Info,function(data){
            this.updateAnswerData(data);
        }.bind(this))
    },

    updateBackItem:function(bag_base_items){
        if(bag_base_items){
            var total_width = bag_base_items.length * 120 + bag_base_items.length * 5;
            this.start_x = (this.item_container.getContentSize().width - total_width) * 0.5+60;
            for(var i in bag_base_items){
                if(!this.item_list[i]){
                    var item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(true);
                    item.setAnchorPoint(0, 0.5);
                    item.setParent(this.item_container)
                    item.show();
                    this.item_list[i] = item;
                }
                var temp_item = this.item_list[i];
                if(temp_item){
                    temp_item.setData({bid:bag_base_items[i].bid, num:bag_base_items[i].num});
                    temp_item.setDefaultTip();
                    var _x = this.start_x + i * (120 + 10);
                    temp_item.setPosition(_x,this.item_container.getContentSize().height/2);
                }
            }
        }
    },

    updateAnswerData:function(data){
        this.answer_data = data;
        this.cur_answer_bid = data.bid;
        if(data.now_items && Utils.next(data.now_items || {}) != null){
            this.str = "";
            for(var i in data.now_items){
                var v = data.now_items[i];
                if(Utils.getItemConfig(v.bid)){
                    var icon = Utils.getItemConfig(v.bid).icon
                    var str_ = cc.js.formatStr("<img src='%s'/><color=#ffce0c>%s   </color>",icon , v.num)
                    this.str = this.str + str_;
                    this.loadRes(PathTool.getItemRes(icon), (function (resObject) {
                        this.base_reward_label.addSpriteFrame(resObject);
                    }).bind(this));
                }
            }
        }
        this.base_reward_label.string = this.str;
        

        this.updateBackItem(data.max_items);
        if(data.ret == 0){
            this.updateNext();
        }else{
            // 先展示答案正确再下一题
            this.main_container.runAction(cc.sequence(cc.callFunc(function (data){
                // 展示答案
                if(this.btn_list){
                    for(var i in this.btn_list){
                        var btn = this.btn_list[i];
                        btn.right.node.active = false;
                        btn.fail.node.active = false;
                        if(btn && btn.index == data.sel_val){//自己选择
                            if(data.ret == 1){
                                btn.right.node.active = true;
                            }else{
                                btn.fail.node.active = true;
                            }
                        }else if(btn && btn.index == data.right){//正确答案
                            if(data.ret == 2){
                                btn.right.node.active = true;
                            }
                        }
                    }
                }
            }.bind(this,data)),cc.delayTime(1),cc.callFunc(function (data){
                if(data.bid == 0){//没有题目了
                    this.ctrl.openAnswerView(false);
                    message(data.ret_msg);
                    if(data.ret_items && Utils.next(data.ret_items || {}) != null){
                        this.ctrl.showGetItemTips(data.ret_items);
                    }
                }else{
                    this.updateNext();
                }
            }.bind(this,data))));
        }
    },

    updateNext:function(){
        if(!this.answer_num){
            this.answer_num = Utils.createRichLabel(26, new cc.Color(0x29,0x27,0x34, 0xff), cc.v2(0, 1), cc.v2(-this.main_container.width/2+345, -this.main_container.height/2+960),30);
            this.answer_num.horizontalAlign = cc.macro.TextAlignment.LEFT;
            this.main_container.addChild(this.answer_num.node)
        }

        if(!this.answer_desc){
            this.answer_desc = Utils.createRichLabel(26, new cc.Color(0x29,0x27,0x34, 0xff), cc.v2(0, 1), cc.v2(-this.main_container.width/2+345, -this.main_container.height/2+920),30,325);
            this.answer_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
            this.main_container.addChild(this.answer_desc.node)
        }

        if(this.answer_num){
            this.answer_num.string = Utils.TI18N("第") + this.answer_data.num + "/" + this.answer_data.max + Utils.TI18N("题");
        }

        if(this.answer_data.bid != 0){
            if(this.btn_list){
                for(var i in this.btn_list){
                    if(this.btn_list[i]){
                        this.btn_list[i].node.active = false;
                    }
                }
            }
            var config = Config.adventure_data.data_adventure_answer[this.answer_data.bid];
            this.answer_desc.string = config.desc;
            var answer_config = Config.adventure_data.data_adventure_kind_answer[this.answer_data.bid];
            var btn_size = cc.size(290, 87);
            var count = 0;
            if(answer_config){
                var list = {[1]: "a", [2]: "b", [3]: "c", [4]: "d" };
                var answer_list = [];
                var num = 0;
                for(var i=1;i<=4;i++){
                    if(answer_config[list[i]] && (answer_config[list[i]]).length > 0){
                        answer_list[i] = answer_config[list[i]];
                        num = num + 1;
                    }
                }
                var answer_abcd = {[1]: "A ", [2]: "B ", [3]: "C ", [4]: "D ",};
                for(var i =1;i<=num;i++){
                    if(!this.btn_list[i]){
                        var btn_node = new cc.Node();
                        btn_node.setAnchorPoint(0.5, 0.5);
                        btn_node.setContentSize(btn_size);
                        this.start_container.addChild(btn_node);

                        var btn_img = btn_node.addComponent(cc.Sprite);
                        btn_img.type = cc.Sprite.Type.SLICED;
                        btn_img.sizeMode = cc.Sprite.SizeMode.CUSTOM;

                        var btn = btn_node.addComponent(cc.Button);
                        btn.transition = cc.Button.Transition.SPRITE;
                        
                        
                        this.loadRes(PathTool.getCommonIcomPath("Currency_7_1"), function (btn,btn_img,sf_obj) {
                            btn.normalSprite = sf_obj;
                            btn_img.spriteFrame = sf_obj;
                        }.bind(this,btn,btn_img));

                        this.loadRes(PathTool.getCommonIcomPath("Currency_7_1"), function (btn,sf_obj) {
                            btn.pressedSprite = sf_obj;
                        }.bind(this,btn));

                        btn_node.active = false;

                        var tag = Utils.createImage(btn_node,null, -btn_size.width/2 + 55, 0);
                        tag.node.active = true;
                        this.loadRes(PathTool.getUIIconPath("adventure", "adventure_50"), (function(tag,resObject){
                            tag.spriteFrame = resObject;
                        }).bind(this,tag));
                    
                        var name = Utils.createLabel(33,new cc.Color(0xff,0xff,0xff,0xff),null,-btn_size.width/2 + 89, 0,"",btn_node,null, cc.v2(0,0.5));
                        btn.name = name;
                        
                        var answer = Utils.createLabel(26,new cc.Color(0xff,0xff,0xff,0xff),null,-btn_size.width/2 + 120, 0,"",btn_node,null, cc.v2(0,0.5));
                        btn.answer = answer;

                        var right = Utils.createImage(btn_node,null, -btn_size.width/2 +240, 0);
                        right.node.active = false;
                        this.loadRes(PathTool.getUIIconPath("adventure", "adventure_54"), (function(right,resObject){
                            right.spriteFrame = resObject;
                        }).bind(this,right));

                        var fail = Utils.createImage(btn_node,null, -btn_size.width/2 +240, 0);
                        fail.node.active = false;
                        this.loadRes(PathTool.getUIIconPath("adventure", "adventure_47"), (function(fail,resObject){
                            fail.spriteFrame = resObject;
                        }).bind(this,fail));
                        btn.fail = fail;
                        btn.right = right;
                        btn.index = i;
                        btn.node.index = i;
                        this.btn_list[i] = btn;
                    }
                    var btn = this.btn_list[i];
                    if(btn){
                        btn.node.off(cc.Node.EventType.TOUCH_END, this.onBtnClick,this);
                        btn.node.active = true;
                        btn.fail.node.active = false;
                        btn.right.node.active = false;
                        btn.name.string = answer_abcd[i];
                        btn.answer.string = answer_list[i];
                        btn.node.setPosition(-this.start_container.width/2+155 + (btn_size.width + 20) * ((i - 1) % 2), -this.start_container.height +160 - (btn_size.height + 20) * Math.floor((i - 1) / 2))
                        btn.node.on(cc.Node.EventType.TOUCH_END, this.onBtnClick,this);
                    }
                }
            }
        }
    },

    onBtnClick:function(event){
        if(this.data){
            var index = event.target.index;
            var ext_list = [{ type: 1, val: index }];
            this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.handle, ext_list);
        }
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.config = data.config;

        if(this.data){
            this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.requst, {})
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.item_list){
            this.item_list[i].deleteMe();
        }
        this.item_list = null;

        this.ctrl.openAnswerView(false);
    },
})