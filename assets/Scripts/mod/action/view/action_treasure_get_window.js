// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     探宝获得物品
// <br/>Create: 2019-04-25 11:40:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Action_treasure_getWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("augury", "augury_get_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.data = arguments[1] || {};
        this.index = arguments[2] || 1; // 抽奖次数
        this.touchTreasure_type = arguments[3] || 2; // 抽奖类型(3为转盘活动)
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.cache_list = [];
        this.can_click = false
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.size = this.main_panel.getContentSize();
        this.title_model = this.root_wnd.getChildByName("titlepanel");
    
        this.close_sp = this.main_panel.getChildByName("close_sp");

        this.scroll_view = this.main_panel.getChildByName("scroll_view");
        this.scroll_view_compend = this.scroll_view.getComponent(cc.ScrollView)
        this.content = this.scroll_view.getChildByName("content");
        if(this.touchTreasure_type == 1 || this.touchTreasure_type == 2){
            this.btn_left = Utils.createImage(this.main_panel,null,-178, -304,cc.v2(0.5,0.5),true,10,true);
            this.btn_left.node.setContentSize(cc.size(180,64));
            this.loadRes(PathTool.getCommonIcomPath("Btn_2_1"), function (sf_obj) {
                this.btn_left.spriteFrame = sf_obj;
            }.bind(this))
            
            var text_left = Utils.createLabel(24,new cc.Color(0xff,0xff,0xff, 0xff),new cc.Color(0x00,0x00,0x00, 0xff),0,4,Utils.TI18N("确定"),this.btn_left.node,2,cc.v2(0.5,0.5));
            var str = cc.js.formatStr(Utils.TI18N("再来%d次"),Config.dial_data.data_const.treasure_num.val[this.index-1][this.touchTreasure_type-1]);
            
            this.btn_right = Utils.createImage(this.main_panel,null,178, -304,cc.v2(0.5,0.5),true,0,true);
            this.loadRes(PathTool.getCommonIcomPath("Btn_2_1"), function (sf_obj) {
                this.btn_right.spriteFrame = sf_obj;
            }.bind(this))
            
            var text_right = Utils.createLabel(24,new cc.Color(0xff,0xff,0xff, 0xff),new cc.Color(0x00,0x00,0x00, 0xff),0,4,"",this.btn_right.node,2,cc.v2(0.5,0.5));
            this.btn_right.node.setContentSize(cc.size(180,64));
            text_right.string = str;
            this.close_sp.active = false;
        }else if(this.touchTreasure_type == 3){
            this.close_sp.active = true;
        }

        this.title_effect = this.title_model.getChildByName("title_container").getComponent(sp.Skeleton);
        this.handleEffect(true);
        this.updatData();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        if(this.btn_left){
            Utils.onTouchEnd(this.btn_left.node, function () {
                this.ctrl.openTreasureGetItemWindow(false);
            }.bind(this), 2);
        }

        if(this.btn_right){
            Utils.onTouchEnd(this.btn_right.node, function () {
                if(this.touchTreasure_type == 1 || this.touchTreasure_type == 2){
                    this.ctrl.send16643(this.index, this.touchTreasure_type);
                }else if(this.touchTreasure_type == 3){
                    // DialActionController.getInstance().sender16671(this.index, 1);
                }
                this.ctrl.openTreasureGetItemWindow(false);
            }.bind(this), 2);
        }

        if(this.touchTreasure_type == 3){
            Utils.onTouchEnd(this.background, function () {
                this.ctrl.openTreasureGetItemWindow(false);
            }.bind(this), 2);
        }
    },

    handleEffect:function(status){
        if(status == false){
            if(this.title_effect){
                this.title_effect.setToSetupPose();
                this.title_effect.clearTracks();
            }
        }else{
            Utils.playButtonSound("c_get");
            if(this.title_effect){
                let effectPath = PathTool.getSpinePath(Config.effect_data.data_effect_info[103],"action")
                this.loadRes(effectPath, function (res_object) {
                    this.title_effect.skeletonData = res_object;
                    this.title_effect.setAnimation(0, PlayerAction.action_1, false)
                }.bind(this))
            }
        }
    },

    updatData:function(){
        if(!this.data || Utils.next(this.data) == null)return;
        var award = this.data;

        var num = 0;
        var list = [];
        this.space = 20;
        this.ref_height = 119;
        this.ref_width = 119;

        for(var i in award){
            num = num +1;
            list[num] = {bid:award[i].bid,num: award[i].num};
        }
        this.row = Math.ceil(num/5);

        this.scroll_height =this.scroll_view.getContentSize().height;
        this.scroll_width = this.scroll_view.getContentSize().width;
        var max_height = this.space + (this.space + this.ref_height+45) * this.row;
        var changeY = max_height - this.scroll_height;
        this.max_height = Math.max(max_height, this.scroll_height);
        this.content.setContentSize(cc.size(this.scroll_width, this.max_height));
        if(changeY>0){
          this.content.y = this.content.y-changeY;
        }
        var sum = num;
        if(sum >= 5){
            sum = 5;
        }

        var total_width = sum * this.ref_width + (sum - 1)*this.space;
        var start_x = (this.scroll_width - total_width) * 0.5;

        this.action_effect = [];

        for(var i in list){
            Utils.delayRun(this.main_panel, i*10/60, function(i,list){
                var one_fun = function(i){
                    if(this.action_effect[i]){
                        this.action_effect[i].node.runAction(cc.removeSelf(true));
                        this.action_effect[i] = null;
                    }
                }.bind(this,i);
                var _x = start_x + this.ref_width * 0.5 + ((i - 1) % 5) * (this.ref_width + this.space);
                var _y = this.max_height - Math.floor((i - 1) / 5) * (this.ref_height + this.space+45)-this.ref_height/2-40;
                if(this.row <= 1){
                    _y = _y - 100;
                }

                var effect_id = Config.effect_data.data_effect_info[156];
                var action = PlayerAction.action_3;

                
                var node = new cc.Node();
                node.setAnchorPoint(0.5,0.5)
                node.setPosition(_x, _y);
                this.content.addChild(node,90);
                this.action_effect[i] = node.addComponent(sp.Skeleton);
                
                this.action_effect[i].setCompleteListener(one_fun);

                var animationEventFunc = function(list,i){
                    var v= list[i];
                    var item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, 1, false, true,true);
                    item.show();
                    item.setData(v);
                    var item_config = Utils.getItemConfig(v.bid);
                    if(item_config && item_config.quality >=3){
                        var action = PlayerAction.action_2;
                        if(item_config.quality >=4){
                            action = PlayerAction.action_1;
                        }
                        item.showItemEffect(true,156,action,true)
                    }

                    if(item_config){
                        var BackPackConst = require("backpack_const");
                        var color = BackPackConst.quality_color(item_config.quality);
                        item.setExtendLabel(item_config.name,color,22);
                    }

                    var _x = start_x + this.ref_width * 0.5 + ((i - 1) % 5) * (this.ref_width + this.space);
                    var _y = this.max_height - Math.floor((i - 1) / 5) * (this.ref_height + this.space+45)-this.ref_height/2-40;
                    if(this.row <= 1){
                        _y = _y - 100;
                    }

                    item.setPosition(_x, _y);
                    item.setParent(this.content)
                    this.cache_list.push(item);
                    
                    var cur_row = Math.ceil(i/5);
                    if(cur_row > 2){
                        var percent = cur_row/this.row;
                        this.scroll_view_compend.scrollToPercentVertical(1-percent, 0.5, true);
                    }
                }.bind(this,list,i);
                this.action_effect[i].setStartListener(animationEventFunc);

                var anima_path = PathTool.getSpinePath(effect_id, "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.action_effect[i].skeletonData = ske_data;
                    this.action_effect[i].setAnimation(0, action, false);
                }.bind(this));

            }.bind(this,i,list));
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.can_click = false;
        Utils.delayRun(this.background, 2, function(){
            this.can_click = true;
        }.bind(this));
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openTreasureGetItemWindow(false);
        this.handleEffect(false);
        for(var i in this.cache_list){
            if(this.cache_list[i] && this.cache_list[i].deleteMe){
                this.cache_list[i].deleteMe();
            }
        }
        this.cache_list = null;
    },
})