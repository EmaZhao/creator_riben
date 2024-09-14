// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      通用的规则说明面板,只需要传固定格式的就行了
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");

var CommonExplainWindow = cc.Class({
    extends: BaseView,

    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("common", "common_explain_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.max_height = 0;
        this.cache_list = [];
        this.title_str = Utils.TI18N("規則");
        this.color_1 = new cc.Color(0x68,0x45,0x2a, 0xff);
        this.color_2 = new cc.Color(255,255,255, 255);
    },

    openCallBack: function () {
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.container = this.root_wnd.getChildByName("container");
        this.close_btn = this.container.getChildByName("close_btn");
        this.scroll_view = this.container.getChildByName("scroll_view");
        this.scroll_content = this.scroll_view.getChildByName("content");
        this.scroll_view_compend = this.scroll_view.getComponent(cc.ScrollView)

        this.scroll_width = this.scroll_view.getContentSize().width;
        this.scroll_height = this.scroll_view.getContentSize().height;
        this.win_title = this.container.getChildByName("win_title").getComponent(cc.Label);
        this.win_title.string = this.title_str;
        this.detail_btn = this.container.getChildByName("detail_btn");
    },

    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openCommonExplainView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openCommonExplainView(false);
        }.bind(this), 2);
    },

    openRootWnd: function(tmpInfo) {
        if(tmpInfo && tmpInfo.length>=2){
            this.title_str = tmpInfo[1];
            this.setDataList(tmpInfo[0])
        }
    },

    setDataList:function(list){
        this.render_list = list;
        for(var i in this.render_list){
            gcore.Timer.set(function (v) {
                this.createList(v);
            }.bind(this,this.render_list[i]), i / 60, 1,"render_list"+i);
        }
    },

    createList:function(data){
        var info = this.createTitleContent(data);
        this.scroll_content.addChild(info.container);

        this.cache_list.push(info.container);
        this.max_height = this.max_height + info.height + 30;

        var max_height = Math.max(this.max_height, this.scroll_height)
        this.scroll_content.setContentSize(cc.size(this.scroll_width, max_height));
        var off_y = 0;
        for(var i in this.cache_list){
            this.cache_list[i].setPosition(0, max_height-off_y);
            off_y = off_y + this.cache_list[i].getContentSize().height + 30
        }
        this.scroll_view_compend.scrollToTop(0);
    },

    createTitleContent:function(data){
        if(data == null)return;
        var container = new cc.Node();
        container.setAnchorPoint(cc.v2(0, 1));

        var _height = 0;
        if(data.title == " " || data.title == ""){
            var content = Utils.createRichLabel(24, this.color_2, cc.v2(0, 1), cc.v2(0, 0),30,595);
            content.horizontalAlign = cc.macro.TextAlignment.LEFT;
            content.string = Utils.splitDataStr(data.desc);
            container.addChild(content.node);
            var _width = this.scroll_width - 8;
            _height = content.node.getContentSize().height
            container.node.setContentSize(cc.size(_width, _height))
            content.node.y = _height - 8;
            content.node.x = 10;
        }else{
            //  重新矫正一下位置坐标
            var title_bg = Utils.createImage(container, null, 0, 0, cc.v2(0,1), true, 0, true);
            title_bg.type = cc.Sprite.Type.SLICED;
            title_bg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            title_bg.node.setContentSize(cc.size(617, 44));
            title_bg.node.color = new cc.Color(0, 0, 0);
            title_bg.node.opacity = 120;
            var title = Utils.createLabel(26,this.color_2,null,5 + title_bg.node.x,-title_bg.node.height * 0.5 + title_bg.node.y,data.title,container,0,cc.v2(0,0.5));
            this.loadRes(PathTool.getCommonIcomPath("Currency_1_1"), (function(resObject){
                title_bg.spriteFrame = resObject;
            }).bind(this));

            var content = Utils.createRichLabel(24, this.color_2, cc.v2(0, 1), cc.v2(0, 0),30,595);
            content.horizontalAlign = cc.macro.TextAlignment.LEFT;
            content.string = Utils.splitDataStr(data.desc)
            container.addChild(content.node);

            var _width = this.scroll_width - 8;
            _height = title_bg.node.height + content.node.height;
            container.setContentSize(cc.size(_width, _height))


            title_bg.node.y = 0;
            content.node.y = title_bg.node.y - title_bg.node.height - 8;
            content.node.x = 10;
            if(data.btnstatus && data.btnstatus==1){
                this.setSummondetailBtn(title_bg.node,container,data);
            }
        }
        return {container:container, height:_height};
    },
    //召唤提示时走
    setSummondetailBtn(site,parent,data){
        let showbtn = false;
        let groupId = 100;
        switch(data.id){
            case 2:
                showbtn = true;
                groupId = 100;
                break;
            case 3:
                showbtn = true;
                groupId = 200;
                break;
            case 4:
                showbtn = true;
                groupId = 300;
                break;
            case 5:
                showbtn = true;
                groupId = 400;
                break;
        }
        if(showbtn){
            let image_content = this.lookHeroInfo()
            parent.addChild(image_content)
            image_content.setPosition(528+site.x,-22+site.y)
            image_content.on('touchend',function(){
                require("timesummon_controller").getInstance().openTimeSummonpreviewWindow(true,groupId,require("partnersummon_const").Recruit_type.Normal);
            },this)
        }
    },
    lookHeroInfo(){
        let btn  = new cc.Node();
        this.loadRes(PathTool.getUIIconPath("common", "Ty_Anniu_1_2"),function(res){
            let sp = btn.addComponent(cc.Sprite);
            sp.type = cc.Sprite.Type.SLICED;
            sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sp.spriteFrame = res;
            btn.setContentSize(cc.size(137, 40))
        }.bind(this))
        Utils.createLabel(20, new cc.Color(62, 105, 37, 255), null, 0, 0, "詳細を確認", btn, null, cc.v2(0.5, 0.5));
        return btn
    },
    closeCallBack: function () {
        if(this.render_list){
            for(var i in this.render_list){
                gcore.Timer.del("render_list"+i);
            }
        }
        this.cache_list= null;
        this.title_str = null;
        this.max_height = null;
        this.ctrl.openCommonExplainView(false);
    },
});

module.exports = CommonExplainWindow;
