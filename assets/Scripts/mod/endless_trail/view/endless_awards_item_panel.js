// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-07 11:00:13
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Endless_awards_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_awards_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.item_list = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.rank_img = this.root_wnd.getChildByName("rank_img").getComponent(cc.Sprite);
        this.rank_label = this.root_wnd.getChildByName("rank_label").getComponent(cc.Label);
        this.item_container = this.root_wnd.getChildByName("item_container")
    
        this.total_width = this.item_container.getContentSize().width;
        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    setData:function(data){
        this.data = data;
        this.updateInfo();
    },

    updateInfo:function(){
        if(!this.root_wnd)return
        if(this.data!=null){
            if(this.data.index != null){
                if(this.data.index <= 3)   {
                    this.rank_label.node.active = false;
                    if(this.data.rank == 0){
                        this.rank_img.node.active = false;
                    }else{
                        var res_id = PathTool.getCommonIcomPath(cc.js.formatStr("common_200%s", this.data.index));
                        if(this.rank_res_id != res_id){
                            this.rank_res_id  = res_id;
                            this.loadRes(res_id, (function(resObject){
                                this.rank_img.spriteFrame = resObject;
                            }).bind(this));
                        }
                        this.rank_img.node.active = true;
                    }
                }else{
                    this.rank_img.node.active = false;
                    this.rank_label.node.active = true;
                    this.rank_label.string = cc.js.formatStr("%s~%s", this.data.min, this.data.max);
                }
            }
            var item_config = null;
            var index = 1
            var item = null
            var scale = 0.8
            var off = 10
            var _x = 0
            var _y = 0
            var sum = this.data.items.length;
            for(var i = sum-1;i>=0;i--){
                var v = this.data.items[i];
                
                item_config = Utils.getItemConfig(v[0]);
                if(item_config){
                    if(this.item_list[index] == null){
                        var item = ItemsPool.getInstance().getItem("backpack_item");
                        item.setParent(this.item_container);
                        item.initConfig(false,scale,false, true);
                        var _x = this.total_width - ((index-1)*(120*scale+off) + 120*0.5*scale )
                        item.setPosition(_x, _y)
                        item.show();
                        this.item_list[index] = item;
                    }
                    item = this.item_list[index]
                    item.setData({ bid: v[0], num: v[1]});
                    index = index + 1;
                }
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
        for(var i in this.item_list){
            this.item_list[i].deleteMe();
            this.item_list[i] = null;
        }
        this.item_list = null;
        // this.removeAllChildren();
        // this.removeFromParent();
    },
})