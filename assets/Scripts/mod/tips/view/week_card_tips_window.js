// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-05 19:48:16
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WeekCardTips = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "week_card_tips");
        this.viewTag = SCENE_TAG.msg;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background")
        if(window.IS_PC){
		  if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        this.main_panel = this.root_wnd.getChildByName("main_panel")
        let week_card_spr = this.main_panel.getChildByName("week_card_spr")
        week_card_spr.zIndex = 10;
        this.text_name = this.main_panel.getChildByName("text_name").getComponent(cc.Label)
        this.text_name.string = "";
        this.main_panel.getChildByName("name_0").getComponent(cc.Label).string = Utils.TI18N("类型：")
        this.text_type = this.main_panel.getChildByName("text_type").getComponent(cc.Label)
        this.text_type.string = "";
    
        this.main_panel.getChildByName("Text_1").getComponent(cc.Label).string = Utils.TI18N("立即获取")
        this.main_panel.getChildByName("Text_1_0").getComponent(cc.Label).string = Utils.TI18N("持续七天，每天登录领取")
        this.btn_close = this.main_panel.getChildByName("btn_close")
        

        // --标题说明
        this.tips_desc = this.main_panel.getChildByName("tips_desc").getComponent(cc.Label)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            this.ctrl.showWeekCardTips(false)
            Utils.playButtonSound(2)
        },this)
        this.btn_close.on("touchend",function(){
            this.ctrl.showWeekCardTips(false)
            Utils.playButtonSound(2)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(!data) return;
        this.setData(data)
    },
    setData(data){
        let name = data.name || ""
        let type_desc = data.type_desc || ""
        this.text_name.string = (name)
        this.text_type.string = (type_desc)
        
        this.setShowItem(data)
    },
    setShowItem(data){
        // --主物品
        if(data.id){
            this.goods_tips = ItemsPool.getInstance().getItem("backpack_item")
            this.goods_tips.setParent(this.main_panel)
            this.goods_tips.initConfig(false, 1, false, false)
            this.goods_tips.setPosition(-132.5, 205.5)
            this.goods_tips.show()
            this.goods_tips.setData(data.id)
        
            let weekcard_data = Config.gift_data.data_week_card_data
            if(!weekcard_data) return;
            let temp_data = weekcard_data[data.id]
            if(temp_data){
                this.tips_desc.string = (temp_data.weekcard_desc)
                // --立即获取
                if(temp_data.reward && temp_data.reward[0] && temp_data.reward[0][0]){
                    let num = temp_data.reward[0][1] || 1
                    this.setGoodsData(1,temp_data.reward[0][0], num, cc.v2(-82.5,-48.5), [-22.5,-49.5])
                }
                // --邮件获取
                if(temp_data.mail_reward && temp_data.mail_reward[0] && temp_data.mail_reward[0][0]){
                    let num = temp_data.mail_reward[0][1] || 1
                    this.setGoodsData(2,temp_data.mail_reward[0][0], num, cc.v2(-82.5,-211.5), [-22.5,-215.5])
                }
            }
        }
    },
    setGoodsData(index, bid, num, pos, text_pos){
        if(!this.item_list[index]){
            this.item_list[index] = ItemsPool.getInstance().getItem("backpack_item")
            this.item_list[index].initConfig(false, 0.8, false, false)
            this.item_list[index].setPosition(pos.x, pos.y)
            this.item_list[index].setParent(this.main_panel)
            this.item_list[index].show()
        }
        this.item_list[index].setData({bid:bid,num:num})

        let name_text = Utils.createLabel(22,new cc.Color(0xff,0xee,0xdd,0xff),null,text_pos[0],text_pos[1],"",this.main_panel,null, cc.v2(0,0.5))
        let item_config = Utils.getItemConfig(bid)
        name_text.string = Utils.TI18N(item_config.name+" x "+num)
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.goods_tips){
            this.goods_tips.deleteMe()
            this.goods_tips = null;
        }
        if(this.item_list){
            for(let i in this.item_list){
                if(this.item_list[i]){
                    this.item_list[i].deleteMe()
                    this.item_list[i] = null
                }
            }
            this.item_list = null;
        }
        this.ctrl.showWeekCardTips(false)
    },
})