// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-25 14:24:16
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleBuffListItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_buff_list_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this
        self.container = self.root_wnd.getChildByName("container")

        self.line = self.container.getChildByName("line")
        self.buff_icon = self.container.getChildByName("buff_icon").getComponent(cc.Sprite)
        self.name_label = self.container.getChildByName("name_label").getComponent(cc.Label)
        self.round_label = self.container.getChildByName("round_label").getComponent(cc.Label)
        self.buff_desc_lb = self.container.getChildByName("buff_desc").getComponent(cc.Label)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if(this.data){
            this.setData(this.data)
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },
    setData(data){
        var self = this
        self.data = data || {}
        if(!this.root_wnd)return
        // -- 图标
        let buff_path = PathTool.getBigBuffRes(data.res_id)
        if(buff_path){
            this.loadRes(buff_path,function(res){
                self.buff_icon.spriteFrame = res
            })
        }
    
        // -- 名称
        let name_str = "【" + (data.name || "") + "】" + "*" + (data.num || 1)
        self.name_label.string = name_str
    
        // -- 失效回合(大于30回合表示永久，则不显示)
        if(!data.remain_round || data.remain_round > 30){
            self.round_label.node.active = false;
        }else{
            self.round_label.node.active = true;
            self.round_label.string = cc.js.formatStr(Utils.TI18N("%d回合后失效"), data.remain_round)
        }
    
        // -- 描述
        self.buff_desc_lb.string = data.desc || ""

        if(data.index){
            self.line.active = true
        }else{
            self.line.active = false
        }
    },
})