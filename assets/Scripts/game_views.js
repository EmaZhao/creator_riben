var StoryController = require("story_controller");
var GuideController = require("guide_controller");

window.WaitingStaus = {
    "CONNECT": 1,
    "LOADING": 2
}

cc.Class({
    extends: cc.Component,

    properties: {
        // scene_tag: { default: null, type: cc.Node },
        // battle_tag: { default: null, type: cc.Node },
        // effect_tag: { default: null, type: cc.Node },
        // ui_tag: { default: null, type: cc.Node },
        // win_tag: { default: null, type: cc.Node },
        // top_tag: { default: null, type: cc.Node },
        // dialogue_tag: { default: null, type: cc.Node },
        // msg_tag: { default: null, type: cc.Node },
        // reconnect_tag: { default: null, type: cc.Node },
        // loading_tag: { default: null, type: cc.Node },
        // left_fill_bg: { default: null, type: cc.Node },
        // right_gill_bg: { default: null, type: cc.Node },
        // _waiting_status: null,
    },

    onLoad () {
        this.scene_tag     = this.node.getChildByName("scene_tag");
        this.battle_tag    = this.node.getChildByName("battle_tag");
        this.effect_tag    = this.node.getChildByName("effect_tag");
        this.ui_tag        = this.node.getChildByName("ui_tag");
        this.win_tag       = this.node.getChildByName("win_tag");
        this.top_tag       = this.node.getChildByName("top_tag");
        this.dialogue_tag  = this.node.getChildByName("dialogue_tag");
        this.msg_tag       = this.node.getChildByName("msg_tag");
        this.reconnect_tag = this.node.getChildByName("reconnect_tag");
        this.loading_tag   = this.node.getChildByName("loading_tag");
        this.fille_nd      = this.node.getChildByName("fille_node");
        this.left_fill_bg  = this.fille_nd.getChildByName("left_bg");
        this.right_gill_bg = this.fille_nd.getChildByName("right_bg");
        this.top_fill_bg   = this.fille_nd.getChildByName("top_bg");
        this.bottom_fill_bg     = this.fille_nd.getChildByName("bottom_bg");
        this.pc_left_tag   = this.node.getChildByName("pc_left_tag");
        this.pc_right_tag  = this.node.getChildByName("pc_right_tag");
        this.left_Sprite   = this.node.getChildByName("left_Sprite");
        this.right_Sprite   = this.node.getChildByName("right_Sprite");

        this.pc_left_tag.setPosition(-732,0);
        this.pc_right_tag.setPosition(732,0);
        var fille_bg_width;
        var fille_bg_height;
        if(cc.winSize.width < cc.view.getFrameSize().width){
          fille_bg_width = (cc.view.getFrameSize().width) * 0.5;
        }else{
          fille_bg_width = (cc.winSize.width) * 0.5;
        }
        if(cc.winSize.height < cc.view.getFrameSize().height){
          fille_bg_height = (cc.view.getFrameSize().height);
        }else{
          fille_bg_height = (cc.winSize.height);
        }
        if(window.IS_PC){
          var widgetLeft =  this.left_fill_bg.getComponent(cc.Widget);
          var widgetRight =  this.right_gill_bg.getComponent(cc.Widget);
          widgetLeft.right = widgetLeft.right + 732;
          widgetRight.left = widgetRight.left + 732;
          var leftBg = this.pc_left_tag.getChildByName("bg");
          var rightBg = this.pc_right_tag.getChildByName("bg");
          LoaderManager.getInstance().loadRes("ui_res/pcui/Pc_Beijin_1_2.jpg", function(res) {
            leftBg.getComponent(cc.Sprite).spriteFrame = res;
          }.bind(this));
          LoaderManager.getInstance().loadRes("ui_res/pcui/Pc_Beijin_1_3.jpg", function(res) {
            rightBg.getComponent(cc.Sprite).spriteFrame = res;
          }.bind(this));
        }
        // var fille_bg_width = (cc.view.getFrameSize().width) * 0.5;
        this.left_fill_bg.width = fille_bg_width;
        this.right_gill_bg.width = fille_bg_width;
        this.top_fill_bg.width  = fille_bg_height;
        this.bottom_fill_bg.width     =  fille_bg_height;
        this.bottom_fill_bg.height = 2*fille_bg_width;
        this.top_fill_bg.height = 2*fille_bg_width;

        this.touch_cp = this.msg_tag.addComponent(cc.BlockInputEvents);  
        this.touch_cp.enabled = false;

        this.upateLayout();
    },

    start () {
        // this.initWaitingView();
    },

    upateLayout:function(){
      if(!window.isMobile){
        return;
      }
      for(let index in this.node.children){
        let child = this.node.children[index];
        if(child){
          var widget = child.getComponent(cc.Widget);
          if(widget){
            widget.right = 0;
            widget.left = 0;
            widget.top = 0;
            widget.bottom = 0;
          }
        }
      }
    },

    initMsgView: function() {
        var effect_path = "spine/" + "E51110" + "/" + "action" + ".atlas";
        LoaderManager.getInstance().loadRes(effect_path, function(effect_sd) {
            this.touch_effect_nd = new cc.Node();
            this.loading_tag.addChild(this.touch_effect_nd);
            this.touch_efftct_sk = this.touch_effect_nd.addComponent(sp.Skeleton);
            this.touch_efftct_sk.skeletonData = effect_sd;
        }.bind(this));

        this.loading_tag.on(cc.Node.EventType.TOUCH_END, function(event) {
            // 判断是否在新手引导和剧情中
            if (GuideController.getInstance().isInGuide() || StoryController.getInstance().isInStory()) return;
            
            if (this.touch_efftct_sk && this.touch_effect_nd) {
                var pos = event.touch.getLocation();
                var tar_pos = this.loading_tag.convertToNodeSpaceAR(pos);
                this.touch_effect_nd.position = tar_pos;
                this.touch_efftct_sk.setAnimation(0, "action", false);
            }
        }, this);

        if (this.loading_tag._touchListener)
            this.loading_tag._touchListener.setSwallowTouches(false);
    },

    initWaitingView: function() {
        var mask_nd = this.mask_nd = new cc.Node();
        mask_nd.setContentSize(this.loading_tag.getContentSize());

        if (window.isMobile && window.FIT_HEIDGHT) {
            mask_nd.scale = FIT_SCALE;
        }

        this.loading_tag.addChild(mask_nd);

        this.touch_block = mask_nd.addComponent(cc.BlockInputEvents);

        var graphics_cp = this.waitint_mask = mask_nd.addComponent(cc.Graphics);
        graphics_cp.clear();
        graphics_cp.fillColor = cc.color(0, 0, 0, 168);
        graphics_cp.rect(-0.5 * mask_nd.width, -0.5 * (mask_nd.height * FIT_SCALE), mask_nd.width, mask_nd.height * FIT_SCALE);
        graphics_cp.fill();

        var skeleton_nd = this.skeleton_nd  = new cc.Node();
        this.mask_nd.addChild(skeleton_nd);
        var waiting_sk = this.waiting_sk = skeleton_nd.addComponent(sp.Skeleton);
        LoaderManager.getInstance().loadRes("spine/E51006/action" + ".atlas", function(waiting_sd) {
            this.waiting_sk.skeletonData = waiting_sd;
        }.bind(this));

        mask_nd.active = false;
        this.touch_block.enabled = false;
        skeleton_nd.active = false;
    },

    // 更新等待界面状态
    updateWaitingStatus: function(status) {
        if (this._waiting_status === status) return;
        if (status && this.waiting_sk.skeletonData) {
            this.mask_nd.active = true;
            this.skeleton_nd.active = true;
            this.touch_block.enabled = true;
            if (status == WaitingStaus.CONNECT) {
                this.waiting_sk.setAnimation(0, "action", true);
            } else if (status == WaitingStaus.LOADING) {
                this.waiting_sk.setAnimation(0, "action1", true);
                this.cancle_timer = gcore.Timer.set(function() {
                    if (this._waiting_status == WaitingStaus.LOADING) {
                        this.updateWaitingStatus(false);
                    }
                }.bind(this), 6000, 1)
            }
        } else {
            this.mask_nd.active = false;
            this.skeleton_nd.active = false;
            if (this.cancle_timer) {
                gcore.Timer.del(this.cancle_timer);
                this.cancle_timer = null;
            }
        }
        this._waiting_status = status;
    },

    showFrame: function() {
        this.fille_nd.active = true;
        this.setTagShowStatus(true);
    },

    forBidTouch: function() {
        this.touch_cp.enabled = true;
    },

    cancelTouch: function() {
        this.touch_cp.enabled = false;        
    },

    setTagShowStatus(isShow) {
        this.pc_left_tag.active = isShow;
        this.pc_right_tag.active = isShow;
        this.left_Sprite.active = isShow;
        this.right_Sprite.active = isShow;
    }

});
