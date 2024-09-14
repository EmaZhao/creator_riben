// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-24 14:39:24
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleController = require("battle_controller");
var BattleConst = require("battle_const");
var BattleBuffInfoItem = require("battle_buff_info_item_panel")
var BattleEvent = require("battle_event")
var Dir_Type = {
	Left : 1,  // 左边英雄
	Right : 2  // 右边英雄
}
var BattleBuffInfoView = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle","battle_buff_info_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = BattleController.getInstance();
        this.model = this.ctrl.getModel()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.left_item_list = []
        this.right_item_list = []
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background")
    
        let container = this.root_wnd.getChildByName("container")
    
        this.left_name_label = container.getChildByName("left_name_label").getComponent(cc.Label)
        this.right_name_label = container.getChildByName("right_name_label").getComponent(cc.Label)
        this.left_role_panel = container.getChildByName("left_role_panel")
        this.right_role_panel = container.getChildByName("right_role_panel")
    
        this.close_btn = container.getChildByName("close_btn")
        let close_btn_label = this.close_btn.getChildByName("label").getComponent(cc.Label)
        close_btn_label.string = Utils.TI18N("确  定")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on('click',this._onClickCloseBtn,this)
        this.background.on('touchend',this._onClickCloseBtn,this)
        // -- 每回合更新一次
        this.addGlobalEvent(BattleEvent.UPDATE_ROUND_NUM, function (  ){
            this.setData()
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.left_name = params.left_name || ""
        this.right_name = params.right_name || ""
        this.setData(true)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.left_item_list){
            for(let i=0;i<this.left_item_list.length;++i){
                if(this.left_item_list[i]){
                    this.left_item_list[i].deleteMe()
                    this.left_item_list[i] = null;
                }
            }
            this.left_item_list = null
        }
        if(this.right_item_list){
            for(let i=0;i<this.right_item_list.length;++i){
                if(this.right_item_list[i]){
                    this.right_item_list[i].deleteMe()
                    this.right_item_list[i] = null;
                }
            }
            this.right_item_list = null
        }
        this.ctrl.openBattleBuffInfoView(false)
    },
    setData(is_init){
        let all_object = this.ctrl.getModel().getAllObject()
        if(!all_object || Utils.next(all_object) == null) return;
        // 取出左右两侧数据
        let left_data = []
        let right_data = []
        for(let k in all_object){
            let bRole = all_object[k]
            // -- 筛选掉神器
            if(bRole.role_data.object_type == BattleConst.BattleObjectType.Pet || bRole.role_data.object_type == BattleConst.BattleObjectType.Unit){
                if(bRole.group == 1){
                    left_data.push(bRole)
                }else if(bRole.group == 2){
                    right_data.push(bRole)
                }
            }
        }
        let start_y = this.left_role_panel.getContentSize().height
        // -- 左侧
        this.left_name_label.string = this.left_name
        for(let k=0;k<this.left_item_list.length;++k){
            let item = this.left_item_list[k]
            item.setVisible(false)
        }
        for(let i=0;i<left_data.length;++i){
            let l_data = left_data[i]
            if(is_init){
                Utils.delayRun(this.left_role_panel, i*4 /40, function(){
                    let role_item = this.left_item_list[i]
                    if(role_item == null){
                        role_item = new BattleBuffInfoItem(Dir_Type.Left)
                        this.left_item_list[i] = role_item
                        role_item.setParent(this.left_role_panel)
                    }
                    role_item.setVisible(true)
                    let item_size = cc.size(300,100)
                    role_item.setPosition(0, start_y-(i+1)*(item_size.height))
                    role_item.setData(l_data)
                    role_item.show()
                }.bind(this))        
            }else{
                let role_item = this.left_item_list[i]
                if(role_item == null){
                    role_item = new BattleBuffInfoItem(Dir_Type.Left)
                    this.left_item_list[i] = role_item
                    role_item.setParent(this.left_role_panel)
                }
                role_item.setVisible(true)
                let item_size = cc.size(300,100)
                role_item.setPosition(0, start_y-(i+1)*(item_size.height))
                role_item.setData(l_data)
                role_item.show()
            }
        }
        // -- 右侧
        this.right_name_label.string = this.right_name
        for(let k=0;k<this.right_item_list.length;++k){
            let item = this.right_item_list[k]
            item.setVisible(false)
        }
        for(let i=0;i<right_data.length;++i){
            let r_data = right_data[i]
            if(is_init){
                Utils.delayRun(this.right_role_panel, i*4 /40, function(){
                    let role_item = this.right_item_list[i]
                    if(role_item == null){
                        role_item = new BattleBuffInfoItem(Dir_Type.Right)
                        this.right_item_list[i] = role_item
                        role_item.setParent(this.right_role_panel)
                    }
                    role_item.setVisible(true)
                    let item_size = cc.size(300,100)
                    role_item.setPosition(0, start_y-(i+1)*(item_size.height))
                    role_item.setData(r_data)
                    role_item.show()
                    }.bind(this))        
            }else{
                let role_item = this.right_item_list[i]
                if(role_item == null){
                    role_item = new BattleBuffInfoItem(Dir_Type.Right)
                    this.right_item_list[i] = role_item
                    role_item.setParent(this.right_role_panel)
                }
                role_item.setVisible(true)
                let item_size = cc.size(300,100)
                role_item.setPosition(0, start_y-(i+1)*(item_size.height))
                role_item.setData(r_data)
                role_item.show()
            }
        }
    },
    _onClickCloseBtn(){
        Utils.playButtonSound(2)
        this.ctrl.openBattleBuffInfoView(false)
    },
})