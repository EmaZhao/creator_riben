// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 19:20:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaPassVedioItemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_vedio_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.controller = require("battle_controller").getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.container = this.seekChild("container");           // 容器

        this.type_label = this.seekChild("type_label", cc.Label);       // 最低 最快 最近
        this.name_label = this.seekChild("name_label", cc.Label);       // 玩家名字
        this.desc_label = this.seekChild("desc_label", cc.Label);       // 通关时间
        this.empty_label = this.seekChild("empty_label");               // 虚位以待

        this.check_btn = this.seekChild("check_btn")
        this.check_btn_label = this.seekChild(this.check_btn, "Label", cc.Label);

        this.player_head = Utils.createClass("playerhead");
        this.player_head.setParent(this.container);
        this.player_head.setPosition(-205, 0);
        this.player_head.show();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.check_btn, function(){
            if(this.data && this.data.repaly_id && this.data.sid){
                this.controller.sender_20036(this.data.repaly_id, this.data.sid);
            }
        }.bind(this), 1)
    },
    
    // 设置数据
    setData: function (data) {
        this.data = data;
        if (this.root_wnd) {
            this.updateData();
        }
    },

    updateData: function () {
        var data = this.data;
        if(data){
            var head_desc = "";
            if(data.type == 1){
                this.type_label.string = Utils.TI18N("最快");
                head_desc = Utils.TI18N("通关时间:");
            }else if(data.type == 2){
                this.type_label.string = Utils.TI18N("最低");
                head_desc = Utils.TI18N("最低战力:");
            }else{
                this.type_label.string = Utils.TI18N("最近");
                head_desc = Utils.TI18N("通关时间:");
            }
            if(data.rid == null){
                this.player_head.hide();
                this.empty_label.active = true;
                this.name_label.string = "";
                this.desc_label.string = "";
                this.check_btn.active = false;
            }else{
                this.player_head.show();
                this.player_head.setHeadRes(data.face_id);
                this.empty_label.active = false;
                this.name_label.string = data.name;
                this.check_btn.active = true;
                if(data.type == 1 || data.type == 3){
                    this.desc_label.string = head_desc + require("timetool").getTimeFormat(this.data.time);
                }else{
                    this.desc_label.string = head_desc + data.power
                }

            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.updateData()
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if (this.player_head){
            this.player_head.deleteMe();
            this.player_head = null;
        }
    },
})
