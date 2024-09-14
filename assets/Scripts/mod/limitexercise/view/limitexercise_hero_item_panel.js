// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-16 16:45:14
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Limitexercise_hero_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("limitexercise", "hero_exhibition_item");
        this.scale = arguments[0] || 1;
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.root_wnd.scale = this.scale;
        this.head_icon_sp       = this.seekChild("head_icon", cc.Sprite);
        this.background_sp      = this.seekChild("background", cc.Sprite);
        this.level_lb           = this.seekChild("level", cc.Label);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function(){
            Utils.playButtonSound(1)
            if(this.click_cb){
                this.click_cb()
            }
        }, this);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    //头像
    setHeadImg(head_icon){
        var head_res_path = PathTool.getHeadRes(head_icon);
        this.loadRes(head_res_path, function(head_sf) {
            this.head_icon_sp.spriteFrame = head_sf;
        }.bind(this));
    },
    //品质框
    setQualityImg(quality){
        var background_res = PathTool.getItemQualityBG(quality);
        var common_res_path = PathTool.getCommonIcomPath(background_res);
        this.loadRes(common_res_path, function(sf_obj){
            this.background_sp.spriteFrame = sf_obj;
        }.bind(this));
    },
    //等级
    setLev(lev){
        this.level_lb.string = lev.toString();
    },
    addCallBack(click_cb){
        this.click_cb = click_cb
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },
})