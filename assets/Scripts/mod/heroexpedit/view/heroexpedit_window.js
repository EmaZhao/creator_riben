// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 14:16:46
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MallController = require("mall_controller");
var MallConst = require("mall_const");
var HeroExpeditEvent = require("heroexpedit_event");

var HeroexpeditWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("heroexpedit", "hero_expedit_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.map_center = 360  //地图移动的中心点
        this.sign_info = Config.expedition_data.data_sign_info
        this.point_num = Config.expedition_data.data_sign_info_length //个数(宝箱和点)
        this.box_num = 5 //宝箱个数

        this.box_index = 0
        this.box_list = {} //宝箱
        this.point_list = {} //点
        this.facial_list = {} //表情包
        this.point_img_list = {} //点图片
        this.play_effect = {}
        this.mouseDown = false;//添加变量判断用户当前鼠标是不是处于按下状态
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.bigBg = this.root_wnd.getChildByName("bigBg");
        this.bigBg.scale = FIT_SCALE;
        this.expedit_bg = this.bigBg.getChildByName("bg");
        this.expedit_bg_sp = this.bigBg.getChildByName("bg").getComponent(cc.Sprite);
    
        this.close_btn = this.main_container.getChildByName("btn_return");
        this.map_layer = this.bigBg.getChildByName("map_layer");
        
        this.btn_employ = this.main_container.getChildByName("btn_employ");
        var text_1 = this.btn_employ.getChildByName("Text_1").getComponent(cc.Label);
        text_1.string = Utils.TI18N("好友助阵");
        
        this.btn_shop = this.main_container.getChildByName("btn_shop");
        var text_1_0 = this.btn_shop.getChildByName("Text_1_0").getComponent(cc.Label);
        text_1_0.string = Utils.TI18N("远征商店");
        
        this.btn_rule = this.main_container.getChildByName("btn_rule")
    
        this.get_reward_bg = this.main_container.getChildByName("get_reward_bg");
        var text_2 = this.get_reward_bg.getChildByName("Image_2").getChildByName("Text_2").getComponent(cc.Label);
        text_2.string = Utils.TI18N("今日已获取奖励：");
        this.expedit_img_1 = this.get_reward_bg.getChildByName("expedit_img_1").getComponent(cc.Sprite);
        this.expedit_img_2 = this.get_reward_bg.getChildByName("expedit_img_2").getComponent(cc.Sprite);

        
        this.expedit_reward = [];
        var pos = [72,33];
        for(var i = 0;i<2;i++){
            this.expedit_reward[i] = Utils.createRichLabel(24, new cc.Color(0xff,0xf6,0xc7,0xff), cc.v2(0, 0.5), cc.v2(0,0), 30, 250);
            this.expedit_reward[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
            this.get_reward_bg.addChild(this.expedit_reward[i].node);
            this.expedit_reward[i].node.setPosition(60,pos[i]);
        }
        //Utils.getNodeCompByPath("main_container/btn_return/Text_3", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        // 我的支援成功返回
        this.addGlobalEvent(HeroExpeditEvent.HeroExpeditViewEvent, function(data) {
            if(!data)return;
            for(var i in data.rewards){
                var item_config = Utils.getItemConfig(data.rewards[i].bid);
                var res = PathTool.getItemRes(item_config.icon);
                var str = cc.js.formatStr("%d",data.rewards[i].num)
                this.expedit_reward[i].string = str;
                if(i==0 && this.expedit_img_1){
                    this.loadRes(res, function (sf_obj) {
                        this.expedit_img_1.spriteFrame = sf_obj;
                    }.bind(this))
                }else if(i==1 && this.expedit_img_2){
                    this.loadRes(res, function (sf_obj) {
                        this.expedit_img_2.spriteFrame = sf_obj;
                    }.bind(this))
                }
                
            }
            if(this.point_list[data.guard_id]){
                this.point_img_list[data.guard_id].setState(cc.Sprite.State.NORMAL);
                var num = data.guard_id;
                var box = this.model.getExpeditBoxData();
                var status = false;
                // 胜利关卡的下一关是否是宝箱的位置
                for(var j in box){
                    if(box[j] == (data.guard_id-1)){
                        status = true
					    break
                    }
                }
                if(status == true){
                    num = num - 2;
                }else{
                    num = num - 1; 
                }
                if(num <= 0){
                    num = 1;
                }
                if(!this.facial_list[data.guard_id]){
                    this.point_list[data.guard_id].setContentSize(cc.size(38,100));
                    this.facial_list[data.guard_id] = Utils.createImage(this.point_list[data.guard_id], null, -19, 40, cc.v2(0, 0), false);
                    var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_8");
                    this.loadRes(res, function (sf_obj) {
                        this.facial_list[data.guard_id].spriteFrame = sf_obj;
                    }.bind(this))
                }else{
                    var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_8");
                    this.loadRes(res, function (sf_obj) {
                        this.facial_list[data.guard_id].spriteFrame = sf_obj;
                    }.bind(this))
                }

                if(this.facial_list[num]){
                    var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_7");
                    this.loadRes(res, function (sf_obj) {
                        this.facial_list[num].spriteFrame = sf_obj;
                    }.bind(this))
                }
                // 最后一关时
                if(data.guard_id == (this.point_num-1)){
                    var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_8");
                    this.loadRes(res, function (sf_obj) {
                        this.facial_list[data.guard_id].spriteFrame = sf_obj;
                    }.bind(this))
                }
            }

            if(data.guard_id > this.point_num){
                if(this.facial_list[this.point_num-1]){
                    var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_7");
                    this.loadRes(res, function (sf_obj) {
                        this.facial_list[this.point_num-1].spriteFrame = sf_obj;
                    }.bind(this))
                }
            }
            var box_data = this.model.getExpeditBoxData();
            var pos_status = 0;
            for(var i in box_data){
                if(box_data[i] == data.guard_id-1){
                    pos_status = 1;
                    for(var j in data.reward){
                        if(data.reward[j].reward_id == data.guard_id-1){
                            pos_status = 2
                            break
                        }
                    }
                }
            }
            this.boxInfo = {pos_status:pos_status,guard_id:data.guard_id-1}
            this.checkBoxStatus(pos_status, data.guard_id-1);
        }.bind(this)) 
    
        this.addGlobalEvent(HeroExpeditEvent.Get_Box_Event, function(box_id) {
            this.checkBoxStatus(2, box_id);
        }.bind(this))

        this.addGlobalEvent(HeroExpeditEvent.EmploySendEvent, function(data) {
            var status = this.model.getHeroSendRedPoint();
		    Utils.addRedPointToNodeByStatus(this.btn_employ, status)
        }.bind(this))
    
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openHeroExpeditView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_employ, function () {
            this.ctrl.openEmpolyPanelView(true)
        }.bind(this), 1);
        
        Utils.onTouchEnd(this.btn_shop, function () {
            MallController.getInstance().openMallPanel(true, MallConst.MallType.ScoreShop);
        }.bind(this), 1);

        this.btn_rule.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var config = Config.expedition_data.data_const.game_rule;
            var pos = event.touch.getLocation();
            pos.y -= 780;
            require("tips_controller").getInstance().showCommonTips(config.desc, pos,null,null,500);            
        }, this)
 
    },

    // 宝箱的状态
    checkBoxStatus:function(status,box_num){
        if(box_num <= 0)return;
        var box_data = this.model.getExpeditBoxData();
        var num = 0;
        for(var i in box_data){
            if(box_data[i] == box_num){
                num = parseInt(i)+1;
			    break;
            }
        }
        this.updateTaskList(status, num);
    },

    setBorder:function(x){
        var pos_x = this.expedit_bg.x + x;
        if(pos_x >= this.move_pos){
            pos_x = this.move_pos;
        }
        if(pos_x <= -this.expedit_bg.width*FIT_SCALE+this.map_center*2*FIT_SCALE){
            pos_x = -this.expedit_bg.width*FIT_SCALE+this.map_center*2*FIT_SCALE;
        }
        return pos_x;
    },

    setVisible:function(status){
        this._super(status);
        
        if(status){
            if(this.boxInfo && this.boxInfo.pos_status != null && this.boxInfo.guard_id!=null){
                this.checkBoxStatus(this.boxInfo.pos_status,this.boxInfo.guard_id);
                this.boxInfo = null;
            }  
        }
    },


    updateTaskList:function(box_data, box_num){

        var action = PlayerAction.action_2;
        if(box_data == 0){
            action = PlayerAction.action_1;
        }else if(box_data == 1){
            action = PlayerAction.action_2
        }else if(box_data == 2){
            action = PlayerAction.action_3
        }
        if(this.play_effect[box_num]){
            this.play_effect[box_num].setToSetupPose();
            this.play_effect[box_num].clearTracks();
            this.play_effect[box_num] = null;
        }

        if(this.box_list[box_num] && this.play_effect[box_num] == null){
            var node = new cc.Node();
            node.setContentSize(cc.size(62,44))
            node.setAnchorPoint(0.5,0.5)
            node.setPosition(this.box_list[box_num].x, this.box_list[box_num].y);
            this.expedit_bg.addChild(node,0);
            this.play_effect[box_num] = node.addComponent(sp.Skeleton);
            

            var anima_path = PathTool.getSpinePath("E51087", "action");
            this.loadRes(anima_path, function(ske_data) {
                this.play_effect[box_num].skeletonData = ske_data;
                this.play_effect[box_num].setAnimation(0, action, true);
            }.bind(this));
            this.model.status ++;
        }
    },
    
    register_event:function(){

        //当用户点击的时候记录鼠标点击状态
        this.map_layer.on(cc.Node.EventType.TOUCH_START, function(event){
            this.touch_point = null;
            this.expedit_bg.stopAllActions();
            this.mouseDown = true;
        },this);

        //只有当用户鼠标按下才能拖拽
        this.map_layer.on(cc.Node.EventType.TOUCH_MOVE, function(event){
            if(!this.mouseDown) return;
            var touches = event.getTouches();
            this.touch_point = touches[0].getDelta();
            var pos_x = this.setBorder(this.touch_point.x);
            this.expedit_bg.x = pos_x;
        },this);


        //当鼠标抬起的时候恢复状态
        this.map_layer.on(cc.Node.EventType.TOUCH_END, function(event){
            this.mouseDown = false;
        },this);

    
    },	

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        var expeditData = this.model.getExpeditData();
        if(expeditData || Utils.next(expeditData)!=null){
            this.loadRes(PathTool.getBigBg("heroexpedit_bg",null,"heroexpedit"), (function(resObject){
                this.expedit_bg_sp.spriteFrame = resObject;
                this.move_pos = 0
                
                expeditData.guard_id = expeditData.guard_id || 1;
                if(expeditData.guard_id <= 3){
                    this.expedit_bg.x = this.move_pos;
                }
            }).bind(this));
            
        }
    
        var status = this.model.getHeroSendRedPoint();
        Utils.addRedPointToNodeByStatus(this.btn_employ, status)
    
        this.register_event()
        this.createBoxOrPoint()
    },

    // 创建宝箱和点
    createBoxOrPoint:function(){
        this.model.status = 0;
        var data = [0,0,0,0,0,0,0];
        var box_data = this.model.getExpeditBoxData();
        var expeditData = this.model.getExpeditData();
        if(!expeditData || Utils.next(expeditData) == null)return;
        if(Utils.next(expeditData)!=null){
            for(var i in box_data){
                if(expeditData.guard_id >= box_data[i]){
                    data[i] = 1;
                }
                for(var j in expeditData.reward){
                    if(box_data[i] == expeditData.reward[j].reward_id){
                        data[i] = 2;
                    }
                }
            }
        }
        for(var k = 1;k<=this.point_num;k++){
            gcore.Timer.set(function (k) {
                if(this.sign_info[k].type == 1){
                    this.point_list[k] = new cc.Node();
                    this.point_list[k].setAnchorPoint(0.5,0);
                    this.point_list[k].setPosition(this.sign_info[k].pos[0][0], this.sign_info[k].pos[0][1])
                    this.expedit_bg.addChild(this.point_list[k]);

                    var btn = this.point_list[k].addComponent(cc.Button);
                    btn.transition = cc.Button.Transition.SCALE;
                    btn.zoomScale = 0.9;

                    this.point_img_list[k] = Utils.createImage(this.point_list[k], null, -19, 0, cc.v2(0, 0), false)
                    var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_6");
                    this.loadRes(res, function (sf_obj) {
                        this.point_img_list[k].spriteFrame = sf_obj;
                    }.bind(this))

                    if(k == expeditData.guard_id){
                        if(!this.facial_list[k]){
                            this.point_list[k].setContentSize(cc.size(38,100));
                            this.facial_list[k] = Utils.createImage(this.point_list[k], null, -19, 40, cc.v2(0, 0), false);
                            var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_8");
                            this.loadRes(res, function (sf_obj) {
                                this.facial_list[k].spriteFrame = sf_obj;
                            }.bind(this))
                        }
                    }else if(k < expeditData.guard_id){
                        if(!this.facial_list[k]){
                            this.point_list[k].setContentSize(cc.size(38,100))
                            this.facial_list[k] = Utils.createImage(this.point_list[k], null, -19, 40, cc.v2(0, 0), false);
                            var res = PathTool.getUIIconPath("heroexpedit","heroexpedit_7");
                            this.loadRes(res, function (sf_obj) {
                                this.facial_list[k].spriteFrame = sf_obj;
                            }.bind(this))
                        }
                    }else{
                        this.point_img_list[k].setState(cc.Sprite.State.GRAY);
                        this.point_list[k].setContentSize(cc.size(38,40));
                    }
                    Utils.onTouchEnd(this.point_list[k], function (k) {
                        this.ctrl.sender24401(k);
                    }.bind(this,k), 1);
                 
                }else if(this.sign_info[k].type == 2){
                    this.box_index = this.box_index + 1;
                    this.box_list[this.box_index] = new cc.Node();
                    Utils.onTouchEnd(this.box_list[this.box_index], function (k) {
                        if(this.ctrl.getGrardID() >= k){
                            this.ctrl.sender24402(k);
                        }else{
                            this.ctrl.sender24401(k);
                        }
                    }.bind(this,k), 1);

                    this.box_list[this.box_index].setContentSize(cc.size(100,100))
                    this.box_list[this.box_index].setAnchorPoint(0.5,0.5)
                    this.box_list[this.box_index].setPosition(this.sign_info[k].pos[0][0], this.sign_info[k].pos[0][1])
                    
                    this.expedit_bg.addChild(this.box_list[this.box_index])
                    
                    this.updateTaskList(data[this.box_index-1], this.box_index)
                }

            }.bind(this,k),k*2 / 60, 1);

        }
        this.ctrl.sender24400();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.play_effect && Utils.next(this.play_effect ||[])!=null){
            for(var i = 1;i<=this.box_num;i++){
                if(this.play_effect[i]){
                    this.play_effect[i].setToSetupPose();
                    this.play_effect[i].clearTracks();
                    this.play_effect[i] = null;
                }
            }
        }
        
        this.map_center = null;
        this.sign_info = null;
        this.point_num = null;
        this.box_num = null;

        this.box_index = null;
        this.box_list = null;
        this.point_list = null;
        this.facial_list = null;
        this.point_img_list = null;
        this.play_effect = null;
        this.mouseDown = null;
        
        this.ctrl.openHeroExpeditView(false);
    },
})