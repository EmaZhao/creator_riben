// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-27 17:31:58
// --------------------------------------------------------------------
var WorldmapController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var WorldmapModel = require("worldmap_model");

        this.model = new WorldmapModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
    },

    // 打开世界地图主界面
    openWorldMapMainWindow:function(status,data){
        if(status == false){
            if(this.worldmap_window!=null){
                this.worldmap_window.close();
                this.worldmap_window = null;
            }
        }else{
            if(this.worldmap_window == null){
                this.worldmap_window = Utils.createClass("worldmap_main_window",this);
            }
            if(this.worldmap_window && this.worldmap_window.isOpen() == false){
                this.worldmap_window.open(data);
            }
            
        }
    },

    
    __delete:function(){
        if(this.model != null){
            this.model.DeleteMe();
            this.model = null;
        }
    },
});


module.exports = WorldmapController;