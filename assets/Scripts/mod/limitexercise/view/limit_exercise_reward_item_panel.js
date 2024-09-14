// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-11 16:08:46
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Limit_exercise_reward_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("limitexercise", "reward_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let main_container = this.root_wnd.getChildByName("main_container")
        this.settle_text = main_container.getChildByName("Image_1_0").getChildByName("Text_2").getComponent(cc.Label)
        this.settle_text.string = ("")
        main_container.getChildByName("Image_1").getChildByName("Text_1").getComponent(cc.Label).string = (Utils.TI18N("额外可能掉落"))
        this.item_1 = main_container.getChildByName("item_1")
        this.item_1_content = this.item_1.getChildByName("content")
        // this.item_1:setScrollBarEnabled(false)
        this.item_2 = main_container.getChildByName("item_2")
        this.item_2_content = this.item_2.getChildByName("content")
        // this.item_2:setScrollBarEnabled(false)
        this.box_spr = main_container.getChildByName("box_spr").getComponent(cc.Sprite)
        if(this.data){
            this.setData(this.data)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },
    setData(data){
        if(!data) return;
        this.data = data
        if(!this.root_wnd)return
        let sort_id = data.sort_id || 1;
        this.loadRes(PathTool.getUIIconPath("limitexercise","limitexercise_box"+sort_id),function(res){
            this.box_spr.spriteFrame = res
        }.bind(this))
        this.settle_text.string = cc.js.formatStr(Utils.TI18N("通关第%d关后结算奖励"),data.order_id)
        this.settleItem(data.reward)
        this.extraItem(data.show_reward)
    },
    settleItem(settle){
        let setting = {}
        setting.scale = 0.6
        setting.max_count = 3
        setting.is_center = true
        setting.show_effect_id = 263
        this.item_settle_list = Utils.commonShowSingleRowItemList(this.item_1, this.item_settle_list, settle, setting,this.item_1_content)
    },
    extraItem(extra){
        let setting = {}
        setting.scale = 0.6
        setting.max_count = 2
        setting.is_center = true
        setting.show_effect_id = 263
        this.item_extra_list = Utils.commonShowSingleRowItemList(this.item_2, this.item_extra_list, extra, setting,this.item_2_content)
    },
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_settle_list){
            for(let i=0;i<this.item_settle_list.length;++i){
                if(this.item_settle_list[i]){
                    this.item_settle_list[i].deleteMe()
                    this.item_settle_list[i] = null
                }
            }
            this.item_settle_list = null
        }
        if(this.item_extra_list){
            for(let i=0;i<this.item_extra_list.length;++i){
                if(this.item_extra_list[i]){
                    this.item_extra_list[i].deleteMe()
                    this.item_extra_list[i] = null
                }
            }
            this.item_extra_list = null
        }
    },
})