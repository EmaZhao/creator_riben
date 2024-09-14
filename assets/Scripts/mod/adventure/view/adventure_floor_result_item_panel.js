// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     收益物品展示
// <br/>Create: 2019-05-14 11:11:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Adventure_floor_result_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_floor_result_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.is_completed = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.init_pos_y = this.root_wnd.y;

        this.container = this.root_wnd.getChildByName("container");

		this.item_name = this.container.getChildByName("item_name").getComponent(cc.Label);

		this.item_num = this.container.getChildByName("item_num").getComponent(cc.Label);

        this.playEnterActions();
        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    playEnterActions:function(){
        this.root_wnd.x = 200;
        this.root_wnd.opacity = 0;
        
        var move_to = cc.moveTo(0.2, cc.v2(460, this.init_pos_y));
        var fade_in = cc.fadeIn(0.2);
        var move_to_1 = cc.moveTo(0.1, cc.v2(360, this.init_pos_y));
        this.root_wnd.runAction(cc.sequence(cc.spawn(move_to,fade_in), move_to_1));
    },
	

    setData:function(data){
        this.data = data;
        if(this.root_wnd){
            this.updateInfo();
        }
    },

    updateInfo:function(){
        if(this.data){
            var item_config = Utils.getItemConfig(this.data.bid);
            if(item_config){
                if(this.item_icon == null){
                    this.item_icon = Utils.createImage(this.container,null,-this.container.width/2+164, 0,cc.v2(0.5,0.5));
                    this.item_icon.node.setScale(0.4);
                }
                if(this.item_icon_res != item_config.icon){
                    this.item_icon_res = item_config.icon;
                    this.loadRes(PathTool.getItemRes(item_config.icon), function (sf_obj) {
                        this.item_icon.spriteFrame = sf_obj;
                    }.bind(this))
                }
                this.item_name.string = item_config.name;
			    this.item_num.string = this.data.num;
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },
})