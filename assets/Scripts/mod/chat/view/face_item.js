// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-30 10:37:28
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var FaceItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("chat", "face_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.fack_sk = this.seekChild("face_sk", sp.Skeleton);
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, this.onClitemItem, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params) {
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function() {

    },

    setData: function(data) {
        this.data = data;
        if (this.root_wnd)
            this.updateWidgets();
    },

    updateWidgets: function() {
        if (this.data) {
            var face_path = PathTool.getSpinePath(this.data.name, "action");
            this.loadRes(face_path, function(face_sd) {
                this.fack_sk.skeletonData = face_sd;
                this.fack_sk.setAnimation(0, face_sd.name, true);
            }.bind(this));
        }
    },

    addCallBack: function(select_cb) {
        this.select_cb = select_cb;
    },

    onClitemItem: function() {
        if (this.select_cb) {
            var input_str = "#" + this.data.id;
            this.select_cb(input_str);
        }
    }
})