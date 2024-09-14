var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")
var PartnerCalculate = require("partner_calculate");

//神界冒险的bufftips
var AdventureBuffTips = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "adventure_buff_tips")
        this.delay = 10;
        this.buff_list = arguments[0] || [];
        this.holiday_buff_list = arguments[1] || {};
        this.initConfig()
    },

    initConfig: function () {
        this.label_list = {};
        this.holiday_label_list = {};
        LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
            var view = res_object;
            this.createRootWnd(view);
        }).bind(this))
    },

    createRootWnd: function (view) {
        this.root_wnd = view;
        this.root_wnd.setAnchorPoint(cc.v2(0.5, 0.5));
        // this.root_wnd.setContentSize(cc.size(SCREEN_WIDTH, display.height))
        this.root_wnd.setContentSize(cc.size(SCREEN_WIDTH, 1280));
        // this.root_wnd.setPosition(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5);
        this.root_wnd.setPosition(0, 0);

        ViewManager.getInstance().addToSceneNode(this.root_wnd, SCENE_TAG.msg);


        this.main_nd = this.root_wnd.getChildByName("main");
        this.bg_nd = this.main_nd.getChildByName("bg");

        this.registerEvent()

        this.showTips();
    },

    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            require("tips_controller").getInstance().closeAllTips();
        }, this)
    },

    setPosition: function (x, y) {
        // this.main_nd.setAnchorPoint(cc.v2(1, 0));
        this.main_nd.setPosition(cc.v2(x, y));
    },

    addToParent: function (parent, zindex) {
        cc.log("common_tips")
    },

    setPos: function (x, y) {
        this.main_nd.setPosition(cc.v2(x, y));
    },

    getBgContentSize: function () {
        if (this.root_wnd) {
            return this.main_nd.getContentSize();
        }
    },

    getScreenBg: function () {
        return this.root_wnd
    },

    addCallBack: function (fun) {
        this.callback = fun;
        if (this.root_wnd) {
            this.callback();
        }
    },

    showTips: function () {
        if (this.root_wnd == null)return;

        this.buff_list = this.buff_list || [];
        this.holiday_buff_list = this.holiday_buff_list || [];

        var count = this.buff_list.length;
        var width = 510;
        if(count == 1){//线板宽度确定
            width = 255;
        }
        var col = Math.ceil(count * 0.5);
        var height = col * 40 + 55;
        //  活动buff
        var add_height = 0;
        if(Utils.next(this.holiday_buff_list) !=null){
            var add_count = this.holiday_buff_list.length;
            var add_col = Math.ceil(add_count * 0.5);
            add_height = add_col * 40 + 10;
            width = 510;
        }
        
        var widthFactor = 1.2;
        width *= widthFactor;
        var _width = 0;
        if(width<360){
          _width = 60
        }
        this.main_nd.setContentSize(cc.size(width, height + add_height));
        this.bg_nd.setContentSize(cc.size(width +_width, height + add_height));

        if(this.desc_label==null){
            this.desc_label = Utils.createLabel(18,new cc.Color(0xb4,0xa9,0x9a,0xff),null,0, -(height + add_height)/2+8,Utils.TI18N("该属性仅本轮冒险生效"),this.main_nd,null,cc.v2(0.5,0));
        }
        if(add_height>0){
            if(this.line_image == null){
                this.line_image = Utils.createImage(this.main_nd,null,0, height-10,cc.v2(0.5,0.5),true, null, true);
                LoaderManager.getInstance().loadRes(PathTool.getCommonIcomPath("common_1097"), function (sf_obj) {
                    this.line_image.spriteFrame = sf_obj;
                }.bind(this));
            }
            if(this.holiday_label == null){
                this.holiday_label = Utils.createLabel(18,new cc.Color(0xe0,0xbf,0x99,0xff),null,30, height + add_height - 20,Utils.TI18N("活动加成:"),this.main_nd,null,cc.v2(0, 1));
            }
        }
        this.createBuffList(width, height, add_height);

        if (this.callback) {
            this.callback()
        }
    },

    //  创建列表
    createBuffList:function(width, height, add_height){
        var color = new cc.Color(0xe0,0xbf,0x99,0xff);
        var base_config = Config.buff_data.data_get_buff_data;
        // 活动buff
        for(var i in this.holiday_buff_list || {}){
            if(this.holiday_label_list[i] == null){
                this.holiday_label_list[i] = Utils.createRichLabel(20, color, cc.v2(0, 1));
                this.holiday_label_list[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
                this.main_nd.addChild(this.holiday_label_list[i].node);
                var _x = -width/2 + 30 + ((i) % 2) * width/2;
                var _y = (height + add_height)/2 - Math.floor( (i) / 2 ) * 40 - 20;
                this.holiday_label_list[i].node.setPosition(cc.v2(_x, _y));
                
            }
            var label = this.holiday_label_list[i];
            var config = base_config[this.holiday_buff_list[i].bid];
            var time = this.holiday_buff_list[i].time || 1;
            this.setBuffLabelData(label, config, time);
        }

        // 冒险buff
        for(var i in this.buff_list){
            if(this.label_list[i] == null){
                this.label_list[i] = Utils.createRichLabel(20, color, cc.v2(0, 1));
                this.label_list[i].horizontalAlign = cc.macro.TextAlignment.LEFT;
                this.main_nd.addChild(this.label_list[i].node);
                var _x = -width/2 + 30 + ((i) % 2) * width/2;
                var _y = -(height + add_height)/2 + height - Math.floor( (i) / 2 ) * 40 - 20;
                this.label_list[i].node.setPosition(cc.v2(_x, _y));
            }
            var label = this.label_list[i];
            var config = base_config[this.buff_list[i].bid];
            var time = this.buff_list[i].time || 1;
            this.setBuffLabelData(label, config, time);
        }
    },

    setBuffLabelData:function( label, config, time ){
        if(label && config && time){
            var buff_desc = "";
            for(var i in config.effect){
                var attr_key = config.effect[i][0];
                var attr_val = config.effect[i][1] * time;
                if(buff_desc != ""){
                    buff_desc = buff_desc+",";
                }
                var attr_name = Config.attr_data.data_key_to_name[attr_key] || "";
                if(PartnerCalculate.isShowPerByStr(attr_key)){
                    buff_desc = cc.js.formatStr(Utils.TI18N("%s提升%s%s"), attr_name, attr_val*0.1, "%");
                }else{
                    buff_desc = cc.js.formatStr(Utils.TI18N("%s提升%s"), attr_name, attr_val);
                }
            }
            var str = cc.js.formatStr("<img src='%s'/>%s", config.icon, buff_desc)
            LoaderManager.getInstance().loadRes(PathTool.getBuffRes(config.icon), (function(label,resObject){
                label.addSpriteFrame(resObject);
            }).bind(this,label));
		    label.string = str;
        }
    },

    setAnchorPoint: function (pos) {
        if (this.root_wnd) {
            this.root_wnd.setAnchorPoint(pos);
        }
    },

    open: function () {
        gcore.Timer.set(function () {
            require("tips_controller").getInstance().closeAllTips();
        }, this.delay * 1000, 1, "close")
    },

    close: function () {
        if (this.root_wnd) {
            this.root_wnd.destroy();
            this.root_wnd = null;
        }
        LoaderManager.getInstance().releasePrefab(this.prefabPath);
        gcore.Timer.del("close")
    }
});