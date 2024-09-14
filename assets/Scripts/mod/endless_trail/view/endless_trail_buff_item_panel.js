// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 10:13:47
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Endless_trailController = require("endless_trail_controller");

var Endless_trail_buff_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_buff_item");
        this.ctrl = Endless_trailController.getInstance();
        this.model = Endless_trailController.getInstance().getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.root = this.root_wnd.getChildByName("root")
        this.buff_icon = this.root.getChildByName("buff_icon").getComponent(cc.Sprite);
        
        this.desc_label = Utils.createRichLabel(24, null, cc.v2(0, 0.5), cc.v2(130, this.root.getContentSize().height / 2),30,220);
        this.desc_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.root.addChild(this.desc_label.node);

        this.select_btn = this.root.getChildByName("select_btn");
        this.select_label = this.select_btn.getChildByName("select_label").getComponent(cc.Label);
        this.select_label.string = Utils.TI18N("选择并挑战");
        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.select_btn, function () {
            if(this.data){
                this.ctrl.send23911(this.data.buff_id);
            }
        }.bind(this), 1);
    },

    updateInfo:function(){
        if(!this.root_wnd)return;
        if(this.data){
            if(Config.endless_data.data_buff_data){
                if(Config.endless_data.data_buff_data[this.data.group_id]){
                    if(Config.endless_data.data_buff_data[this.data.group_id][this.data.buff_id]){
                        var config = Config.endless_data.data_buff_data[this.data.group_id][this.data.buff_id];
                        if(config){
                            this.desc_label.string = config.desc;
                            if(config.icon != ""){
                                this.loadRes(PathTool.getIconPath("bufficon",config.icon), function (res_object) {
                                    this.buff_icon.spriteFrame = res_object;
                                }.bind(this))
                            }
                        }
                    }
                }
            }
        }
    },
    
    setData:function(data){
        this.data = data;
        this.updateInfo();
    },

    getData:function(){
        return this.data;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        // this:removeAllChildren()
        // this:removeFromParent()
    },
})