import { Use_Form_Success } from "../../partner/partner_event";

// -- --------------------------------------------------------------------
// -- 
// -- 
// -- @author: mengjiabin@syg.com(必填, 创建模块的人员)
// -- @editor: mengjiabin@syg.com(必填, 后续维护以及修改的人员)
// -- @description:
// --      世界地图的单个剧情副本
// -- <br/>Create: 2018-xx-xx
// -- --------------------------------------------------------------------
// 119 特效 1、选中未通过 2、选中通过 3、未选中通过 4、未选中未通过
var BattleDramaController    = require("battle_drama_controller");
var WorldmapController    = require("worldmap_controller");
var Battle_dramaEvent = require("battle_drama_event");
var BattleController = require("battle_controller");

var WorldMapItem = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = BattleDramaController.getInstance();
        this.model = this.ctrl.getModel();

        this.config = arguments[0];
        this.size = cc.size(50, 50)
        this.scale = 4;
        this.open_data = arguments[1];
        this.createRootWnd();
    },

    // 初始化UI
    createRootWnd:function(){
        this.root_wnd = new cc.Node("map_item");
        this.root_wnd.setAnchorPoint(0.5, 0.5);
        this.root_wnd.setContentSize(this.size)

        var button = this.root_wnd.addComponent(cc.Button);
        
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 0.9;

        var node = new cc.Node();
        node.setAnchorPoint(0.5,0.5)
        node.setPosition(this.size.width*0.5, this.size.height*0.5);
        this.root_wnd.addChild(node);

        this.effect = node.addComponent(sp.Skeleton);
        var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(119), "action");
        LoaderManager.getInstance().loadRes(anima_path, function(ske_data) {
            if(this.effect){
                this.effect.skeletonData = ske_data;
                this.effect.setAnimation(0, PlayerAction.action_4, true);
                this.fillData()
            }
        }.bind(this));

        this.progress_bg = Utils.createImage(this.root_wnd,null,this.size.width * 0.5,80,cc.v2(0.5, 0.5));
        LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("worldmap","worldmap_1008"), function(res_object){
            this.progress_bg.spriteFrame = res_object;
        }.bind(this));  
        this.progress_label = Utils.createLabel(18, new cc.Color(0xff,0xff,0xff,0xff), null, 0, 0, "", this.progress_bg.node, null, cc.v2(0.5, 0.5));
        this.name_bg = Utils.createImage(this.root_wnd,null,this.size.width * 0.5,-20,cc.v2(0.5, 0.5));
        LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("worldmap","worldmap_1006"), function(res_object){
            this.name_bg.spriteFrame = res_object;
        }.bind(this));  
        this.name_label = Utils.createLabel(18, new cc.Color(0x68,0x45,0x2a,0xff), null, this.size.width * 0.5, -15, this.config.name, this.root_wnd, null, cc.v2(0.5, 0.5));
        
        this.click_layout = new cc.Node();
        this.click_layout.setContentSize(cc.size(100,100))
        this.click_layout.setAnchorPoint(0.5, 0.5)
        this.click_layout.setPosition(25, 25)
        this.root_wnd.addChild(this.click_layout,90);
        
        this.registerEvent();
        // this.fillData()
    },

    registerEvent:function(){
        Utils.onTouchEnd(this.click_layout, function () {
            if(this.call_back){
                this.call_back();
            }
            
            // -- var max_chapter_id = model:getCurMaxChapterId(this.drama_data.mode)
            // -- -- var open_num = math.min(chapter_pass_sum + 1, tableLen(this.config))
            // -- if max_chapter_id ~= 1 then
            // --     max_chapter_id = max_chapter_id + 1
            // -- end
            var max_sum_chapter = this.model.getOpenSumChapter(this.drama_data.mode);
            if(this.drama_data){
                if(this.config.bid <=  (max_sum_chapter)  && this.config.bid != this.drama_data.chapter_id){
                    var chapter_list = this.model.getChapterListByID(this.drama_data.mode, this.config.bid);
                    var max_dun_id = this.model.getHasPassChapterMaxDunId(this.drama_data.mode, this.config.bid);
                    if(chapter_list && max_dun_id != 0){//直接切换
                        var cur_drama_data = this.model.getDramaData();
                        cur_drama_data.mode = this.drama_data.mode
                        cur_drama_data.chapter_id = this.config.bid
                        cur_drama_data.dun_id = max_dun_id
                        this.model.setDramaData(cur_drama_data);
                    }else{
                        this.ctrl.send13002();
                    }
                    WorldmapController.getInstance().openWorldMapMainWindow(false);
                }else{
                    if(this.config.bid == this.drama_data.chapter_id){
                        if(this.open_data){
                            WorldmapController.getInstance().openWorldMapMainWindow(false);
                        }else{
                            message(Utils.TI18N("已在当前章节"))
                        }
                    }else{
                        message(Utils.TI18N("前面章节暂没通关"))
                    }
                }
            }
        }.bind(this), 1);

        if(!this.battle_event){
            this.battle_event = gcore.GlobalEvent.getInstance().bind(Battle_dramaEvent.BattleDrama_Drama_Unlock_View, function(data){
                if(this.config && this.config.bid == data.bid){
                    WorldmapController.getInstance().openWorldMapMainWindow(false);
                }
            }.bind(this));
        }
    },

    // showAfterEffect:function(){
    //     if(this.after_effect){
    //         this.after_effect.setToSetupPose();
    //         this.after_effect.clearTracks();
    //         this.after_effect = null;
    //     }

    //     if(!this.after_effect){
    //         return;
    //         // var parent_wnd = ViewManager:getInstance():getLayerByTag(ViewMgrTag.MSG_TAG)
    //         var world_pos = this.root_wnd.convertToWorldSpace(cc.v2(this.root_wnd.getContentSize().width / 2, this.root_wnd.getContentSize().height / 2))
    //         var node = new cc.Node();
    //         node.setAnchorPoint(0.5,0.5)
    //         node.setPosition(SCREEN_WIDTH / 2,SCREEN_HEIGHT / 2);
    //         parent_wnd.addChild(node);

    //         this.after_effect = node.addComponent(sp.Skeleton);
    //         var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(146), "action");
    //         LoaderManager.getInstance().loadRes(anima_path, function(ske_data) {
    //             if(this.after_effect){
    //                 this.after_effect.skeletonData = ske_data;
    //                 this.after_effect.setAnimation(0, PlayerAction.action, true);
    //             }
    //         }.bind(this));

    //         this.after_effect.node.runAction(cc.sequence(cc.moveTo(0.5,cc.v2(world_pos.x,world_pos.y))));
    //         var animationCompleteFunc = function(){
    //             if(this.after_effect){
    //                 this.after_effect.setToSetupPose();
    //                 this.after_effect.clearTracks();
    //                 this.after_effect = null;
    //             }
    //             this.showFingerEffect()
    //         }
    //         this.after_effect.setCompleteListener(animationCompleteFunc);
    //     }
    // },

    // showFingerEffect:function(){
    //     if(this.finger_effect){
    //         this.finger_effect.setToSetupPose();
    //         this.finger_effect.clearTracks();
    //         this.finger_effect = null;
    //     }
    //     if(!this.finger_effect){
    //         var node = new cc.Node();
    //         node.setAnchorPoint(0.5,0.5)
    //         node.setPosition(this.root_wnd.getContentSize().width / 2, this.root_wnd.getContentSize().height / 2);
    //         this.root_wnd.addChild(node);

    //         this.finger_effect = node.addComponent(sp.Skeleton);
    //         var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(240), "action");
    //         LoaderManager.getInstance().loadRes(anima_path, function(ske_data) {
    //             if(this.finger_effect){
    //                 this.finger_effect.skeletonData = ske_data;
    //                 this.finger_effect.setAnimation(0, PlayerAction.action, true);
    //             }
    //         }.bind(this));

    //         var animationCompleteFunc = function(){
    //             BattleController.getInstance().setUnlockChapterStatus(false)
    //             // WorldmapController.getInstance().addLockContainer(false)
    //             this.effect.setAnimation(0, PlayerAction.action_1, true)
    //         }
    //         this.after_effect.setCompleteListener(animationCompleteFunc);
    //     }

    // },

    addToParent:function(parent,call_back){
        if(parent && this.config){
            parent.addChild(this.root_wnd);
            if(call_back){
                this.call_back  = call_back
            }
            this.root_wnd.setPosition(this.config.x, this.config.y)
        }
    },

    openEffect:function(){
        if(this.effect){
            var self = this
            var animationCompleteFunc = function(){
                self.ctrl.openBattleDramaUnlockChapterView(true, self.config)
                BattleController.getInstance().setUnlockChapterStatus(false)
                // WorldmapController.getInstance().addLockContainer(false)
            }
            this.effect.setCompleteListener(animationCompleteFunc);
            this.effect.setAnimation(0, PlayerAction.action_6, false);
        }
    },

    // 填充数据
    fillData:function(){
        this.drama_data = this.model.getDramaData();
        if(this.config != null && this.drama_data != null){
            this.progress_bg.node.active = this.config.bid <= this.drama_data.chapter_id;
            this.progress_label.string = cc.js.formatStr("%s/%s", this.model.getHasCurChapterPassListNum(Battle_dramaEvent.BattleDramaConst.Normal, this.config.bid), this.model.getChapterLength(Battle_dramaEvent.BattleDramaConst.Normal, this.config.bid));
            var max_sum_chapter = this.model.getOpenSumChapter(this.drama_data.mode)
            if(this.config.bid == this.drama_data.chapter_id){
                if(this.open_data){
                    this.openEffect();
                }else{
                    // --this.progress_label:setString(cc.js.formatStr("%s/%s", model:getHasCurChapterPassListNum(Battle_dramaEvent.BattleDramaConst.Normal,this.config.bid), model:getChapterLength(Battle_dramaEvent.BattleDramaConst.Normal, this.config.bid)))
                    this.effect.setAnimation(0, PlayerAction.action_1, true);
                }
            }else if(this.config.bid < max_sum_chapter){
                this.effect.setAnimation(0, PlayerAction.action_3, true);
            }else if(this.config.bid > max_sum_chapter){
                this.effect.setAnimation(0, PlayerAction.action_5, true);
            }
        }
    },

    
    clearEffect:function(){
        if(this.finger_effect){
            this.finger_effect.setToSetupPose();
            this.finger_effect.clearTracks();
            this.finger_effect = null;
        }
        if(this.after_effect){
            this.after_effect.setToSetupPose();
            this.after_effect.clearTracks();
            this.after_effect = null;
        }
        if(this.open_effect){
            this.open_effect.setToSetupPose();
            this.open_effect.clearTracks();
            this.open_effect = null;
        }
    },
    
    // 删掉的时候关闭
    DeleteMe:function(){
        if(this.item_container){
            this.item_container.stopAllActions();
        }
        for(var i in this.item_list){
            this.item_list[i].DeleteMe();
        }
        this.item_list = null;

        if(this.battle_event){
            gcore.GlobalEvent.getInstance().unbind(this.battle_event);
            this.battle_event = null;
        }
    },
})