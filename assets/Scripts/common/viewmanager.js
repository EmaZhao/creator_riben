// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      层级控制器
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
window.ViewManager = cc.Class({
    cotr:function(){
    },

    properties: {
        node_list: [],
        self: null,
    },

    statics: {
        instance: null,
    },

    // 储存节点
    addSceneNode: function (tag, node) {
        this.node_list[tag] = node;
    },

    // 将节点add到指定的层
    addToSceneNode: function(node, tag) {
        if (node) {
            var scene_node = this.node_list[tag]
            if (scene_node) {
                scene_node.addChild(node);
            }
        }
    },

    // 获取指定节点
    getSceneNode: function(tag){
        if (tag == null){
            tag = SCENE_TAG.win;
        }
        var node = this.node_list[tag];
        return node;
    },
});


ViewManager.getInstance = function () {
    if (!ViewManager.instance) {
        ViewManager.instance = new ViewManager();
    }
    return ViewManager.instance;
}

module.exports = ViewManager;