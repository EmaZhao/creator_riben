// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     收益物品展示
// <br/>Create: 2019-03-16 10:28:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PartnerCalculate = require("partner_calculate");

var Primus_challenge_result_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("primus", "primus_challenge_result_item ");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.is_completed = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){

        this.init_pos_y = this.root_wnd.y;
        this.item_name = this.root_wnd.getChildByName("item_name").getComponent(cc.Label);
        this.item_num = this.root_wnd.getChildByName("item_num").getComponent(cc.Label);

        if(this.data){
            this.updateInfo();
        }
    },

    updateInfo:function(){
        if(!this.root_wnd)return;

        if(this.data){
            var atrr_name = Config.attr_data.data_key_to_name[this.data[0]];
            this.item_name.string = atrr_name;
            if(PartnerCalculate.isShowPerByStr(this.data[0])){
                var value = this.data[1]/10;
                this.item_num.string = value+"%";
            }else{
                this.item_num.string = this.data[1];
            }
        }
    },

    setData:function(data){
        this.data = data;
        this.updateInfo();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        // self:removeAllChildren()
        // self:removeFromParent()
    },
})