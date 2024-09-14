var PathTool = require("pathtool");
var CommonTabBtn = cc.Class({
    extends: ViewClass,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("common", "common_tab_btn");
    },
    initRootWnd(){
        this.size = cc.size(147, 64);
        this.root_wnd = new cc.Node();
        this.parent.addChild(this.root_wnd);
        this.root_wnd.setContentSize(this.size);
        this.toggle = this.root_wnd.addComponent(cc.Toggle);
        this.toggle.isChecked = false;
        this.toggle.transition = cc.Button.Transition.NONE;
        let unselect_bg = new cc.Node();
        this.root_wnd.addChild(unselect_bg);
        this.toggle.target = unselect_bg
        this.loadRes(PathTool.getUIIconPath("common","common_1012"),function(res){
            let Sprite = unselect_bg.addComponent(cc.Sprite)
            Sprite.type = cc.Sprite.Type.SLICED;
            Sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            Sprite.spriteFrame = res;
            unselect_bg.setContentSize(this.size)
        }.bind(this))
        let select_bg = new cc.Node();
        this.root_wnd.addChild(select_bg);
        let Sprite1 = select_bg.addComponent(cc.Sprite)
        this.toggle.checkMark = Sprite1
        Sprite1.type = cc.Sprite.Type.SLICED;
        Sprite1.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.loadRes(PathTool.getUIIconPath("common","common_1011"),function(res){
            Sprite1.spriteFrame = res;
            select_bg.setContentSize(this.size);
        }.bind(this))
        //标签名字
        let title = new cc.Node();
        title.color = new cc.Color(245,224,185,255);
        this.title_lb = title.addComponent(cc.Label);
        this.title_lb.fontSize = 24;
        this.title_lb.lineHeight = 28;
        title.setPosition(0,-5);
        this.root_wnd.addChild(title);
        let line = this.title_lb.addComponent(cc.LabelOutline);
        line.color = new cc.Color(42,22,14,255);
        line.width = 2;
        //红点
        this.tab_tips = new cc.Node();
        this.root_wnd.addChild(this.tab_tips)
        this.tab_tips.setPosition(65.5,26)
        this.loadRes(PathTool.getUIIconPath("common","common_1014"),function(res){
            let Sprite = this.tab_tips.addComponent(cc.Sprite)
            Sprite.type = cc.Sprite.Type.SIMPLE;
            Sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            Sprite.spriteFrame = res;
            this.tab_tips.setContentSize(35,35);
        }.bind(this))
        let red = new cc.Node()
        this.red_lb = red.addComponent(cc.Label)
        this.red_lb.fontSize = 20;
        this.red_lb.lineHeight = 22;
        this.tab_tips.active = false;
        this.registerEvent()
    },
    registerEvent(){
        this.root_wnd.on("toggle",function(){
            if(this.callback){
                this.callback()
            }
        },this)
    },
    setTitle(text){
        this.title_lb.string = text;
    },
    addCallBack(callback){
		this.callback = callback;
    },
    setParent(node){
        this.parent = node;
        if(this.parent){
            this.initRootWnd();
        }
    },
    getToggle(){
        return this.toggle
    }
})
module.exports = CommonTabBtn;