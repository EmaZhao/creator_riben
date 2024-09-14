// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-16 10:25:16
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var BaseRole = require("baserole");
 
var Primus_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("primus", "primus_main_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        // 站台数据
        this.station_list = [];
    
        // tips描述
        this.tips_list = [];
        // 是否已有称号
        this.is_have_title = false;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.background_bg = this.root_wnd.getChildByName("background").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("primus_bigbg_1","jpg","primus"), (function(resObject){
            if(this.background_bg){
                this.background_bg.spriteFrame = resObject;
            }
        }).bind(this));
    
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.primus_bigbg_2_node = this.main_container.getChildByName("primus_bigbg_2");
        this.primus_bigbg_2_node.scale = 1;
        this.primus_bigbg_2 = this.primus_bigbg_2_node.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("primus_bigbg_2",null,"primus"), (function(resObject){
            if(this.primus_bigbg_2){
                this.primus_bigbg_2.spriteFrame = resObject;
            }
        }).bind(this));

        this.main_panel = this.main_container.getChildByName("main_panel");
        this.main_panel.zIndex = 2;
        this.explain_btn = this.main_panel.getChildByName("explain_btn");
    
        this.title_bg = this.main_panel.getChildByName("title_bg");
        var title_lab = this.title_bg.getChildByName("title_lab").getComponent(cc.Label);
        title_lab.string = Utils.TI18N("星河神殿");
        
        this.exit_btn = this.title_bg.getChildByName("exit_btn");
        var text = this.exit_btn.getChildByName("text").getComponent(cc.Label);
        text.string = Utils.TI18N("退出");
        this.tips_panel = this.main_panel.getChildByName("tips_panel");

        for(var i = 1;i<=6;i++){
            var station_lay = this.main_panel.getChildByName("station_lay_"+i);
            var station_item = {};
            station_item.station_lay = station_lay;
            station_item.title_img = station_lay.getChildByName("title_img").getComponent(cc.Sprite);
            station_item.mode_node = station_lay.getChildByName("mode_node");
            station_item.name = station_lay.getChildByName("name").getComponent(cc.Label);
            this.station_list[i] = station_item;
        }

        for(var j = 1;j<=3;j++){
            this.tips_list[j] = this.tips_panel.getChildByName("tips_node_"+j);
        }
    
        var title = this.tips_panel.getChildByName("title").getComponent(cc.Label);
        title.string = Utils.TI18N("挑战条件:");
        // 说明
        this.initTipsInfo();
        this.addEffect();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.exit_btn, function () {
            this._onClickBtnClose();
        }.bind(this), 2);

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(ButtonSound.Normal);
            var config = Config.primus_data.data_const.game_rule;
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos,null,null,500);
        });
    },

    _onClickBtnClose:function(){
        this.ctrl.openPrimusMainWindow(false);
    },

    _onClickByPosIndex:function(pos_index){
        if(this.station_list && this.station_list[pos_index] && this.station_list[pos_index].sever_data){
            this.ctrl.openPrimusChallengePanel(true, this.station_list[pos_index].sever_data, this.is_have_title);   
        }
    },

    addEffect:function(){
        this.size = this.main_container.getContentSize();
        // 流星
        if(this.scene_effect_1 == null){
            var node = new cc.Node();
            node.setAnchorPoint(0.5,0.5)
            node.setPosition(0,0);
            this.background.addChild(node,0);
    
            this.scene_effect_1 = node.addComponent(sp.Skeleton);
            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(305), "action");
            this.loadRes(anima_path, function(ske_data) {
                if(this.scene_effect_1){
                    this.scene_effect_1.skeletonData = ske_data;
                    this.scene_effect_1.setAnimation(0, PlayerAction.action, true);
                }
            }.bind(this));
        }

        // 星星
        if(this.scene_effect_2 == null){
            var node2 = new cc.Node();
            node2.setAnchorPoint(0.5,0.5)
            node2.setPosition(0,0);
            this.background.addChild(node2,0);
    
            this.scene_effect_2 = node2.addComponent(sp.Skeleton);
            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(306), "action");
            this.loadRes(anima_path, function(ske_data) {
                if(this.scene_effect_2){
                    this.scene_effect_2.skeletonData = ske_data;
                    this.scene_effect_2.setAnimation(0, PlayerAction.action, true);
                }
            }.bind(this));
        }

        // 流水
        //if(this.scene_effect_3 == null){
            //var node3 = new cc.Node();
            //node3.setAnchorPoint(0.5,0.5)
            //node3.setPosition(0,0);
            //this.main_container.addChild(node3,0);
    
            //this.scene_effect_3 = node3.addComponent(sp.Skeleton);
            //var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(307), "action");
            //this.loadRes(anima_path, function(ske_data) {
                //if(this.scene_effect_3){
                   // this.scene_effect_3.skeletonData = ske_data;
                    //this.scene_effect_3.setAnimation(0, PlayerAction.action, true);
               // }
           // }.bind(this));
        //}
                
        // -- this.fight_effect = createEffectSpine( PathTool.getEffectRes(186), cc.p(48,106), cc.p(0,0), true, PlayerAction.action)
        // --         this.fight_effect:setScale(1.5)
        // --         this.item_icon:addChild(this.fight_effect, 10)  
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.requestPrimusChallengeCount();
        this.ctrl.sender20701();
        //var MainuiController = require("mainui_controller");
        //var MainUiConst = require("mainui_const");
        //var SceneConst = require("scene_const");
        //MainuiController.getInstance().setBtnRedPoint(MainUiConst.new_btn_index.esecsice, {bid:SceneConst.RedPointType.primus, status:false}) 
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.honourfane, false); 
    },

    setData:function(data){
        this.is_have_title = false    
        data.list.sort(function(a, b){
            return a.pos - b.pos;
        });

        if(!this.station_list)return;
        for(var i in data.list){
            if(this.station_list[data.list[i].pos]){
                this.station_list[data.list[i].pos].sever_data = data.list[i];
                this.station_list[data.list[i].pos].var_data = Config.primus_data.data_upgrade[data.list[i].pos];

                this.updateStationInfoByPos(data.list[i].pos);
                // 有数据才有监听
                var pos = data.list[i].pos;
                if(this.station_list[pos].station_lay){
                    Utils.onTouchEnd(this.station_list[pos].station_lay, function (pos) {
                        this._onClickByPosIndex(pos);
                    }.bind(this,pos), 2);
                }
            }
        }
    },

    updateStationInfoByPos:function(pos_index){
        var station_item = this.station_list[pos_index];
        if(!station_item)return;
        var sever_data = station_item.sever_data;
        if(!sever_data)return;
        // 称号
        if(station_item.var_data){
            var honor_data = Config.honor_data.data_title[station_item.var_data.honor_id];
            if(honor_data){
                this.loadRes(PathTool.getHonorRes(honor_data.res_id), (function(resObject){
                    if(station_item && station_item.title_img){
                        station_item.title_img.spriteFrame = resObject;
                    }
                }).bind(this));
            }
        }

        // 名字
        if(sever_data.name == null || sever_data.name == ""){
            station_item.name.string = Utils.TI18N("虚位以待");
            station_item.name.node.color = new cc.Color(0xff,0xff,0xff,0xff);
            // 模型
            this.updateSpine(station_item.var_data.look_id, pos_index);
        }else{
            station_item.name.string = sever_data.name;
            var roleVo = RoleController.getInstance().getRoleVo();
            if(roleVo && sever_data.rid == roleVo.rid && sever_data.srv_id == roleVo.srv_id){
                this.is_have_title = true;
                station_item.name.node.color = new cc.Color(0x14,0xff,0x32,0xff);
            }else{
                station_item.name.node.color = new cc.Color(0xff,0xe2,0x40,0xff);
            }
            // 模型 
            this.updateSpine(sever_data.look_id, pos_index);
        }

    },

    // 更新模型,也是初始化模型
    updateSpine:function(look_id, pos_index){
        var station_item = this.station_list[pos_index];
        if(!station_item)return;

        if(!station_item.spine){
            station_item.spine = new BaseRole();
            // station_item.spine:setCascade(true)
            station_item.spine.setParent(station_item.mode_node);
            station_item.spine.node.setPosition(0,-60);  // 原本是45
            station_item.spine.node.setAnchorPoint(cc.v2(0.5,0.5));
            var effect_nd = station_item.mode_node.getChildByName("effect");
            if(effect_nd){
              effect_nd.setPosition(0,-60);
            }
            // station_item.spine:setOpacity(0)
            // var action = cc.fadeIn(0.2);
            // station_item.spine.runAction(action);
        }
        
        if(station_item.spine){
            station_item.spine.setData(BaseRole.type.role, look_id, PlayerAction.show, true,0.6,{scale:0.72})//原生0.8倍
            // station_item.spine:setCascade(true)
            // var action = cc.fadeOut(0.2);
            // station_item.spine.node.runAction(cc.sequence(action, cc.CallFunc(function(){
                // station_item.spine.node.stopAllActions();    
            // })))
        }
    },

    initTipsInfo:function(){
        if(!this.tips_list)return;
        // 默认写死 对应
        var id_list = [1,2,4];
        for(var i in id_list){
            var var_data = Config.primus_data.data_upgrade[id_list[i]];
            if(this.tips_list[parseInt(i)+1] && var_data){
                var str = cc.js.formatStr("%s：競技場ランキング<color=#14ff32>上位%s名</color>", var_data.name, var_data.arena_rank);
                var label = Utils.createRichLabel(22, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0, 0), cc.v2(0,0),30,500);
                label.horizontalAlign = cc.macro.TextAlignment.LEFT;
                label.string = str;
                this.tips_list[parseInt(i)+1].addChild(label.node);
            }
        }
    },
    

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.station_list){
            if(this.station_list[i]){
                if(this.station_list[i].spine){
                    this.station_list[i].spine.deleteMe();
                    this.station_list[i].spine = null;
                }
                this.station_list[i] = null;
            }
        }
        
        this.station_list = null;
        this.ctrl.openPrimusMainWindow(false);
    },
})