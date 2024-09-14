// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-14 17:45:48
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Friend_glory_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("friend", "friend_glory_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.seekChild("main_container");
        this.my_title_lb = this.seekChild("my_title",cc.Label);
        this.my_val_lb = this.seekChild("my_val",cc.Label);

        this.rank_cr = this.seekChild("rank_cr").getComponent("CusRichText");

        this.no_rank_nd = this.seekChild("no_rank");
        this.no_rank_nd.active = false;
        this.power_nd = this.seekChild("power");
        this.power_nd.active = false;
        this.power_label_cr = this.power_nd.getChildByName("power_label").getComponent("CusRichText");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, (function () {
            Utils.playButtonSound(1)
            if(this.callback){
                this.callback(this);
            }
        }).bind(this));
    },

    setData:function(data){
        this.data = data;
        if(this.root_wnd){
            this.onShow();
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(){
        if(this.data == null)return
        var data = this.data;
        if(data.type == 1){
            this.my_title_lb.string = Utils.TI18N("玩家战斗力：");
            this.power_label_cr.setNum(data.val);
            this.power_nd.active = true;
            this.my_val_lb.string = "";
        }else if (data.type == 2){
            this.my_title_lb.string = Utils.TI18N("玩家推图进度：");
            // this.my_title_lb.node.x = this.my_title_lb.node.x + 15;
            var config = gdata("dungeon_data","data_drama_dungeon_info",[data.val]);
            if(config){
                this.my_val_lb.string = config.name;
            }else{
                this.my_val_lb.string = Utils.TI18N("暂无");
            }
        }else if (data.type == 3){
            this.my_title_lb.string = Utils.TI18N("玩家天梯杯数：");
            this.my_val_lb.string = data.val;
            // this.my_title_lb.node.x = this.my_title_lb.node.x + 15;
        }else if (data.type == 4){
            this.my_title_lb.string = Utils.TI18N("玩家伙伴数量：");
            // this.my_title_lb.node.x = this.my_title_lb.node.x + 15;
            this.my_val_lb.string = data.val;
        }else if (data.type == 5){
            this.my_title_lb.string = Utils.TI18N("试练塔排行：");
            // this.my_title_lb.node.x = this.my_title_lb.node.x + 15;
            this.my_val_lb.string = data.val;
        }

        if(data.rank != 0){
            this.no_rank_nd.active = false;
            this.rank_cr.node.active = true;
            this.rank_cr.setNum(data.rank);
        }else{
            this.no_rank_nd.active = true;
            this.rank_cr.node.active = false;
        }
    },

    addCallBack:function(value){
        this.callback = value;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
    },
})