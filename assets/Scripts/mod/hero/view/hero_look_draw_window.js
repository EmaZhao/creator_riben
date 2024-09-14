// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-26 09:50:04
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var HeroConst = require("hero_const");

var Hero_look_draw_windowWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_look_draw_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("hero_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.max_scale = 1.3;
        this.min_scale = 0.7;
        var config = Config.partner_data.data_partner_const.vertical_zoom
        if (config) {
            if (config.val[0]) {
                this.min_scale = config.val[0];
            }
            if (config.val[1]) {
                this.max_scale = config.val[1];
            }
        }
        //初始化比例
        this.slider_percent = 0.5;
        //缩放大小 为 1 时 slider_percent 的比例值
        this.scale_percent = 0.5;
        //必须缩放的协议
        this.must_scale = 1;
        //点击个数
        this.touch_count = 0;
        this.original_y = 0;
        this.shard_preview_status = false;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {

        this.background_nd = this.seekChild("background");
        this.background_nd.scale   = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("hero/hero_draw_bg"),function(res){
            this.background_nd.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))
        this.main_container = this.seekChild("main_container");
        this.hero_draw_icon_sp = this.seekChild(this.main_container, "hero_draw_icon", cc.Sprite);
        this.hero_draw_icon_pos = this.hero_draw_icon_sp.node.getPosition();

        this.slider_sl = this.seekChild("slider", cc.Slider);
        this.slider_img_nd = this.seekChild("slider_img");

        //名字
        this.name_lb = this.seekChild("name", cc.Label);
        //按钮
        this.delete_btn = this.seekChild("delete_btn");
        this.add_btn = this.seekChild("add_btn");
        this.close_btn = this.seekChild("close_btn");

        this.bottom_lay = this.seekChild("bottom_lay");
        this.top_lay = this.seekChild("top_lay");

        this.story_btn = this.seekChild("story_btn");
        this.shard_preview_btn = this.seekChild("shard_preview_btn");

        this.shard_handle_panel = this.seekChild("shard_handle_panel");
        this.confirm_btn = this.seekChild(this.shard_handle_panel, "confirm_btn");
        this.cancel_btn = this.seekChild(this.shard_handle_panel, "cancel_btn");
        this.erweima_container = this.seekChild(this.shard_handle_panel, "erweima_container");
        this.erweima_img_sp = this.seekChild(this.erweima_container, "img", cc.Sprite);

        this.logo_container = this.seekChild(this.shard_handle_panel, "logo_container");
        this.logo_img_sp = this.seekChild(this.logo_container, "logo_img", cc.Sprite);

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openHeroLookDrawWindow(false);
        }.bind(this), 1)

        Utils.onTouchEnd(this.delete_btn, function () {
            this.onDeleteBtn();
        }.bind(this), 1)

        Utils.onTouchEnd(this.add_btn, function () {
            this.onAddBtn();
        }.bind(this), 1)

        Utils.onTouchEnd(this.story_btn, function () {
            this.onClickStoryBtn();
        }.bind(this), 1)

        Utils.onTouchEnd(this.shard_preview_btn, function () {
            this.enterShardStatus(true);
        }.bind(this), 1)

        Utils.onTouchEnd(this.cancel_btn, function () {
            if (this.share_type == HeroConst.ShareType.eHeroInfoShare) {  //默认英雄信息分享返回
                this.enterShardStatus(false);
            } else if (this.share_type == HeroConst.ShareType.eLibraryInfoShare) {    //图书馆英雄分享返回
                this.ctrl.openHeroLookDrawWindow(false)
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.confirm_btn, function () {
            this.shardErweimaImg();
        }.bind(this), 1)

        this.slider_sl.node.on("slide", function () {
            this.slider_percent = this.slider_sl.progress;
            this.setIconScale();
        }, this)

        this.background_nd.on(cc.Node.EventType.TOUCH_START, function (event) {

        }, this);

        this.background_nd.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var touches = event.getTouches();
            if (touches.length == 1) {
                var touch_pos = touches[0].getLocation();
                this.onMovePos(touch_pos);
                if (this.touch_count < 1) {
                    this.touch_count = 1;
                }
            } else {
                if (this.touch_count < 2) {
                    this.touch_count = 2;
                }
            }
        }, this);

        this.background_nd.on(cc.Node.EventType.TOUCH_END, function (event) {
            var touches = event.getTouches();
            if (this.touch_count == 1) {
                var touch_pos = touches[0].getLocation();
                this.onEndPos(touch_pos);
            }
        }, this);
    },

    //@draw_res_id 对应立绘的id
    //@name 立绘对应的英雄名字
    openRootWnd: function (params) {
        var share_type = params.share_type || HeroConst.ShareType.eHeroInfoShare
        var partner_config = Config.partner_data.data_partner_base[params.bid];
        var library_config = gdata("partner_data", "data_partner_library", [params.bid]);
        this.must_scale = 1;
        if (library_config) {
            if (library_config.scale != 0) {
                this.must_scale = library_config.scale / 100;
            }
        }
        //传记需要
        this.partner_config = partner_config;
        this.library_config = library_config;
        var draw_res_id = params.draw_res_id || "jinglingwangzi";
        var bg_res = PathTool.getIconPath("herodraw/herodrawres", draw_res_id);
        if (this.hero_draw_icon_sp) {
            this.loadRes(bg_res, function (sp) {
                this.hero_draw_icon_sp.spriteFrame = sp;
            }.bind(this))
        }
        this.slider_sl.progress = this.slider_percent;
        this.hero_draw_icon_sp.node.scale = this.must_scale;

        var name = params.name || "";
        this.name_lb.string = name;
        //绘图分享来源类型
        if (share_type == HeroConst.ShareType.eHeroInfoShare) {
            this.enterShardStatus(false);
        } else if (share_type == HeroConst.ShareType.eLibraryInfoShare) {
            this.enterShardStatus(true)
        }
        this.share_type = share_type;
    },

    //切换分享状态
    enterShardStatus: function (status) {
        return
        this.shard_preview_status = status;
        this.story_btn.active = !status;
        this.close_btn.active = !status;
        this.shard_preview_btn.active = !status;
        this.shard_handle_panel.active = status;
        if (status == true) {
            this.downErweimaImg();
            if(this.logo_img_sp.spriteFrame == null){
                var logo_path = PathTool.getLogoRes();
                this.loadRes(logo_path, function (sp) {
                    this.logo_img_sp.spriteFrame = sp;
                }.bind(this))
            }
        }
    },

    //下载二维码
    downErweimaImg: function () {
        // var apk_data = RoleController.getInstance().getApkData();
        // if(apk_data){
        //     SDK.download_qrcode_png(apk_data.message.qrcode_url,function(img){
        //         var spriteFrame = new cc.SpriteFrame();
        //         cc.log(spriteFrame)
        //         spriteFrame.setTexture(img);
        //         this.erweima_img_sp.spriteFrame = spriteFrame;
        //     }.bind(this))
        // }
        if (USE_SDK) {
            SDK.download_qrcode_png(function(qrcod_sf) {
                if (qrcod_sf)
                    this.erweima_img_sp.spriteFrame = spriteFrame;                 
            }.bind(this))
        }
    },

    //执行分享操作
    shardErweimaImg: function () {
        this.changeShardStatus(false);
        var save_name = "sy_gameshard_image";
        if (Utils.getRandomSaveName) {
            save_name = Utils.getRandomSaveName();
        }
        if(RoleController.getInstance().getApkData()){
            SDK.CaptureScreenSaveImg(save_name,function(bool){
                if(bool==true){
                    this.changeShardStatus(true);
                }else{
                    message(Utils.TI18N("保存失败"));
                    this.changeShardStatus(true);
                }
            }.bind(this));
        }else{
            gcore.Timer.set(function(){
                this.changeShardStatus(true);
            }.bind(this),1000,1)
        }
    },

    changeShardStatus: function (status) {
        this.cancel_btn.active = status;
        this.confirm_btn.active = status;
        this.add_btn.active = status;
        this.delete_btn.active = status;
        this.slider_sl.node.active = status;
        this.slider_img_nd.active = status;
        if (status == false) {
            this.erweima_container.y = -610;
            this.name_lb.node.y = -590
        } else {
            this.erweima_container.y = -515;
            this.name_lb.node.y = -490;
        }
    },

    onMovePos: function (touch_pos) {
        if (!touch_pos) return
        if (this.start_x && this.start_y) {
            var target_pos = this.main_container.convertToNodeSpaceAR(touch_pos);
            var x = target_pos.x - this.start_x;
            var y = target_pos.y - this.start_y;
            this.hero_draw_icon_sp.node.setPosition(this.hero_draw_icon_pos.x + x, this.hero_draw_icon_pos.y + y);
        } else {
            var target_pos = this.main_container.convertToNodeSpaceAR(touch_pos);
            this.start_x = target_pos.x;
            this.start_y = target_pos.y;
        }
    },

    onEndPos: function (touch_pos) {
        if (!touch_pos) return
        if (this.start_x == null || this.start_y == null) return
        var target_pos = this.main_container.convertToNodeSpaceAR(touch_pos);
        var x = target_pos.x - this.start_x;
        var y = target_pos.y - this.start_y;
        this.hero_draw_icon_pos = cc.v2(this.hero_draw_icon_pos.x + x, this.hero_draw_icon_pos.y + y);
        this.start_x = null;
        this.start_y = null;
    },

    //减
    onDeleteBtn: function () {
        this.slider_percent = this.slider_percent - 0.01;
        if (this.slider_percent <= 0) {
            this.slider_percent = 0;
        }
        this.slider_sl.progress = this.slider_percent;
        this.setIconScale();
    },

    //加
    onAddBtn: function () {
        this.slider_percent = this.slider_percent + 0.01;
        if (this.slider_percent >= 1) {
            this.slider_percent = 1;
        }
        this.slider_sl.progress = this.slider_percent;
        this.setIconScale();
    },

    //查看英雄传记
    onClickStoryBtn: function () {
        if (!this.partner_config || !this.library_config) return
        if (this.library_config.story == null || this.library_config.story == "") {
            message(Utils.TI18N("该英雄暂无传记"));
            return
        }
        var name = cc.js.formatStr("%s %s", this.library_config.title, this.partner_config.name);
        var content = this.library_config.story;
        this.ctrl.openHeroLibraryStoryPanel(true, name, content)
    },

    setIconScale: function () {
        var cur_scale = null;
        if (this.slider_percent > this.scale_percent) {
            var scale = this.max_scale - 1;
            cur_scale = 1 + (this.slider_percent - this.scale_percent) * scale * 2;
        } else if (this.slider_percent < this.scale_percent) {
            var scale = 1 - this.min_scale;
            cur_scale = this.min_scale + this.slider_percent * scale * 2;
        } else {
            cur_scale = 1;
        }
        this.hero_draw_icon_sp.node.scale = cur_scale * this.must_scale;
    },


    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openHeroLookDrawWindow(false)
    },
})