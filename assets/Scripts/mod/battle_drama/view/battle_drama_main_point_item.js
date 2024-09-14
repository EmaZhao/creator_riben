// -- --------------------------------------------------------------------
// -- 
// -- 
// -- @author: mengjiabin@syg.com(必填, 创建模块的人员)
// -- @editor: mengjiabin@syg.com(必填, 后续维护以及修改的人员)
// -- @description:
// --      剧情副本关卡点item
// -- <br/>Create: 2018-xx-xx
// -- --------------------------------------------------------------------
var BattleDramaController    = require("battle_drama_controller");

var BattleDramaMainPointItem = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = BattleDramaController.getInstance();
        this.model = this.ctrl.getModel();
        this.initConfig();
        this.initUi();
    },

    initConfig: function () {
        this.is_big_point = false //是否为大关
        
    },

    // 初始化UI
    initUi:function(){
        this.size = cc.size(50,50)
        this.root_wnd = new cc.Node("point_item");
        this.root_wnd.setAnchorPoint(0.5, 0.5);
        this.root_wnd.setContentSize(this.size)
        this.button = this.root_wnd.addComponent(cc.Button);
        this.normal_img = this.root_wnd.addComponent(cc.Sprite);
        LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("battle","battle_normal_point"), function(res_object){
            this.normal_img.spriteFrame = res_object;
        }.bind(this));

        this.setRootVisible(false);
        this.registerEvent();
    },

    registerEvent:function(){
        Utils.onTouchEnd(this.root_wnd, function () {
            if(this.is_big_point == 1){
                if(this.data){
                    this.ctrl.openDramBossInfoView(true,this.data);
                }
            }
        }.bind(this), 1);
    },

    // 设置数据
    setData:function(data){
        if(!data)return;
        this.data = data;
        // --this.swap_boss_max_data = swap_boss_max_data
        // var drama_data = this.model.getDramaData();
        this.is_big_point = data.info_data.is_big;
        this.dun_id = data.info_data.id;
        this.chapter_id = data.info_data.chapter_id;
        this.next_id = data.info_data.next_id;
        this.v_data = data.v_data;
        this.updateStatus(this.v_data.status, this.is_big_point)  
    },

    setPosition:function(x,y){
        if(this.root_wnd){
            this.root_wnd.setPosition(x,y);
        }
    },

    updateStatus:function(status,is_big_point){
        this.setRootVisible(false);
        if(!this.normal_img)return;
        if(status == 1 || status == 2 || status == 3){//制作中,有倒计时
            this.setRootVisible(true);
            if(status == 3 && is_big_point == 1){
                LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("battle","battle_drama_has_ack"), function(res_object){
                    this.normal_img.spriteFrame = res_object;
                }.bind(this));
                if(this.button){
                    this.button.transition = cc.Button.Transition.SCALE;
                    this.button.duration = 0.1;
                    this.button.zoomScale = 0.9;
                }
            }else{
                if(is_big_point == 1){
                    LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("battle","battle_drama_no_ack"), function(res_object){
                        this.normal_img.spriteFrame = res_object;
                    }.bind(this));
                }
                if(this.button){
                    this.button.transition = cc.Button.Transition.NONE;
                }
            }
        }else{
            if(is_big_point == 1){
                LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("battle","battle_drama_no_ack"), function(res_object){
                    this.normal_img.spriteFrame = res_object;
                }.bind(this));
                if(this.button){
                    this.button.transition = cc.Button.Transition.NONE;
                }
            }
        }
    },

    setRootVisible:function(bool){
        if(this.root_wnd){
            this.root_wnd.active = bool;
        }
    },    

    getPositionX:function(){
        if(this.root_wnd){
            return this.root_wnd.x;
        }
        return 0;
    },

    // 清除数据
    clearInfo:function(){
        if(this.root_wnd){
            this.root_wnd.stopAllActions();
            this.root_wnd.removeFromParent();
        }
    },

    
    // 删掉的时候关闭
    DeleteMe:function(){
        if(this.root_wnd){
            this.root_wnd.stopAllActions();
            this.root_wnd.removeFromParent();
            this.root_wnd.removeAllChildren();
        }
    },
})