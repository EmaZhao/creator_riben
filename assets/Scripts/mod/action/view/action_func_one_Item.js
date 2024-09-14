var PathTool = require("pathtool");
var ActionFuncOneItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_fund_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container = this.root_wnd.getChildByName("container");
        this.txt_time_lb = this.container.getChildByName("txt_time").getComponent(cc.Label);
        if (this.data) {
            this.setData(this.data);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setData(data){
        if(!data) return;
        this.data = data;
        if(this.root_wnd){
            this.txt_time_lb.string ="合計"+ (data.day || 1) +"日" ;
            let bid = data.award[0][0];
            let num = data.award[0][1];
            if(!this.item_node){
                this.item_node = ItemsPool.getInstance().getItem("backpack_item");
                this.item_node.setDefaultTip(true,false);
                this.item_node.setPosition(0,15);
                this.item_node.setParent(this.container);
                this.item_node.initConfig(false, 0.8, false, true);
                this.item_node.show();
            }
            this.item_node.setData({bid:bid, num:num});
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_node){
            this.item_node.deleteMe()
        }
    },
})