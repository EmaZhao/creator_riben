// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-30 14:24:56
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Artifact_skill_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "artifact_skill_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("container")
        this.skill_name = this.seekChild("skill_name", cc.Label);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (skill_config) {
        this.data = skill_config;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        this.skill_name.string = this.data.name;
        if (!this.skill_item) {
            var SkillItem = require("skill_item");
            this.skill_item = new SkillItem();
            this.skill_item.setPosition(cc.v2(60, 90));
            this.skill_item.setLeveStatus(false);
            this.skill_item.setShowTips(true);
            this.skill_item.setParent(this.container);
        }
        this.skill_item.setData(this.data.bid)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.skill_item) {
            this.skill_item.deleteMe();
            this.skill_item = null;
        }
    },
})