// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-19 10:49:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PartnerConst = require("partner_const")
var BaseRole = require("baserole")
var BackPackConst = require("backpack_const")
var BackpackController = require("backpack_controller")
var Hero_skin_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_skin_tips_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
        this.model = this.ctrl.getModel()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        //属性item
        this.attr_item_list = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background")
        this.main_panel = this.root_wnd.getChildByName("main_panel")
        this.main_panel_size = this.main_panel.getContentSize()
        this.bg = this.main_panel.getChildByName("bg")
        this.bg_size = this.bg.getContentSize()
        this.container = this.main_panel.getChildByName("container")
        this.station_img = this.container.getChildByName("station_img").getComponent(cc.Sprite)
        this.model_nodel = this.container.getChildByName("model_nodel")
    
        //属性
        this.attr_panel = this.container.getChildByName("attr_panel")
        this.attr_panel.getChildByName("label").getComponent(cc.Label).string = (Utils.TI18N("特殊属性"))
    
        this.name = this.container.getChildByName("name").getComponent(cc.Label)
        this.close_btn = this.container.getChildByName("close_btn")
        
        this.desc_label = this.container.getChildByName("scroll_view").getChildByName("mask").getChildByName("content").getComponent(cc.RichText)

        this.scroll_view = this.container.getChildByName("scroll_view")
        this.scroll_size = this.scroll_view.getContentSize()
        //按钮部分
        this.btn_list = {}
        this.tab_panel = this.container.getChildByName("tab_panel")
        for(let i=1;i<4;++i){
            let btn = this.tab_panel.getChildByName("tab_btn_"+i)
            if(btn){
                let object = {}
                object.btn = btn
                object.label = btn.getChildByName("Label").getComponent(cc.Label)
                this.btn_list[i] = object
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",this.onClickCloseBtn,this)
        this.close_btn.on("click",this.onClickCloseBtn,this)
    },
    onClickCloseBtn(){
        Utils.playButtonSound(2)
        this.ctrl.openHeroSkinTipsPanel(false)
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        let data = params.data
        let cloth_type = params.open_type
        let partner = params.partner
        this.cloth_type = cloth_type || PartnerConst.EqmTips.normal
        this.data = data
        this.partner = partner
        if(this.partner){
            this.partner_id = this.partner.partner_id
        }
    
        // 因为传参不同,这边需要获取不同的配置数据
        let item_config = null
        if(typeof(data) == "number"){
            item_config = Utils.getItemConfig(data)
        }else{
            if(data.config){
                item_config = data.config
            }else{
                item_config = data
            }
        }
        this.item_config = item_config
        if(this.item_config == null) return;
    
        this.initData()
    
        if(this.cloth_type == PartnerConst.EqmTips.backpack){
            this.updateBtnList()
        }
    },
    initData(){
        this.name.string = (this.item_config.name)
        //底座
        let station_res = PathTool.getUIIconPath("bigbg/hero","hero_skin_tips")
        if(this.record_station_res == null || this.record_station_res != station_res){
            this.record_station_res = station_res
            this.loadRes(station_res,function(res){
                this.station_img.spriteFrame = res
            }.bind(this))
        }
        let skin_id = 101 
        if(this.item_config.client_effect[0]){
            skin_id = this.item_config.client_effect[0][0] || 101
        }
        this.skin_id = skin_id
        this.updateSpine(skin_id)

        let reduce_height = this.updateAttrInfo(skin_id)

        //描述
        this.desc_label.string = this.item_config.desc
        let label_siez = this.desc_label.node.getContentSize()
        let max_height = Math.max(label_siez.height, this.scroll_size.height)
        this.scroll_view.setContentSize(cc.size(this.scroll_size.width, max_height))
        // this.desc_label:setPositionY(max_height-10)

        let height
        if(this.cloth_type == PartnerConst.EqmTips.normal){
            //普通不显示按钮
            this.tab_panel.active = (false)
            height = this.main_panel_size.height - (reduce_height + 54)
            this.container.y =  -(730/2) + (height + (reduce_height + 54) * 0.5)
        }else{
            this.tab_panel.active = (true)
            height = this.main_panel_size.height - reduce_height
            this.container.y = -(730/2) + (height + reduce_height  * 0.5)
        }

        this.scroll_view.y = this.scroll_view.y - reduce_height
        this.tab_panel.y = this.tab_panel.y - reduce_height
        this.bg.setContentSize(cc.size(this.main_panel_size.width, height))
        this.main_panel.setContentSize(cc.size(this.main_panel_size.width, height))
    },
    updateSpine(skin_id){
        if(this.record_spine_skin_id && this.record_spine_skin_id == skin_id){
            return
        }
        this.record_spine_skin_id = skin_id
        if(!this.spine){
            this.spine = new BaseRole()
            this.spine.setParent(this.model_nodel)
            this.spine.setPosition(0, 166)
            this.spine.node.opacity = 0;
            this.spine.showShadowUI(true)
            let action = cc.fadeIn(0.2)
            this.spine.node.runAction(action)
        }
        this.spine.setData(BaseRole.type.skin,skin_id,PlayerAction.show,true,0.72,{scale:1/0.7})
    },
    updateAttrInfo(skin_id){
        let skin_config = Config.partner_skin_data.data_skin_info[skin_id];
        let reduce_height = 0
        if(skin_config){
            let item_height = 40
            let size  = this.attr_panel.getContentSize()
            let x1 = -size.width * 0.25//size.width * 0.25
            let x2 = size.width * 0.25//size.width * 0.75
            if(skin_config.skin_attr.length <= 2){
                reduce_height = 40
            }
            for(let i=0;i<skin_config.skin_attr.length;++i){
                let v = skin_config.skin_attr[i]
                let row = Math.floor((i)/2)
                let col = (i) % 2
                let _x = 0
                let _y =  - (item_height * 0.5 + row * item_height)
                if(col == 0){
                    _x = x1
                }else{
                    _x = x2
                }
                if(this.attr_item_list[i] == null){
                    this.attr_item_list[i] = this.createAttrItem(_x, _y)
                }else{
                    this.attr_item_list[i].bg.active = (true)
                    this.attr_item_list[i].key_label.node.active = (true)
                }      
                let value = Utils.commonGetAttrInfoByKeyValue(v[0], v[1])
                let res = value.res
                let attr_name = value.attr_name
                let attr_val = value.attr_val
                this.loadRes(res,function(sp){
                    this.attr_item_list[i].attr.spriteFrame = sp
                }.bind(this))
                this.attr_item_list[i].key_label.string = attr_name + " + " + attr_val 
                // let attr_str = string.format("<img src='%s' scale=1 /> %s + %s", res, attr_name, attr_val)
                // this.attr_item_list[i].key_label:setString(attr_str)
            }
        }
        return reduce_height
    },
    createAttrItem(x, y){
        let item = {}
        let size = cc.size(230, 35)
        let Path = PathTool.getUIIconPath("common","common_90058")
        let node = new cc.Node()
        node.setPosition(x,y)
        let image = node.addComponent(cc.Sprite)
        image.type = cc.Sprite.Type.SLICED;
        image.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(size)
        this.loadRes(Path,function(res){
            image.spriteFrame = res
        }.bind(this))
        this.attr_panel.addChild(node)
        node.opacity = 128;
        item.bg = node;
        item.key_label = new cc.Node().addComponent(cc.Label);
        item.key_label.fontSize = 22;
        item.key_label.lineHeight = 26;
        item.key_label.node.color = new cc.Color(224,191,152)
        item.key_label.node.setAnchorPoint(0,0.5)
        item.key_label.node.setPosition(x-size.width/2 + 40 , y-2)
        this.attr_panel.addChild(item.key_label.node)
        let attr = new cc.Node().addComponent(cc.Sprite);
        attr.node.setAnchorPoint(0,0.5)
        attr.node.setPosition(x-size.width/2 + 10 , y)
        item.attr = attr
        this.attr_panel.addChild(attr.node)
        return item
    },
    updateBtnList(){
        //按钮
        if(!this.item_config) return;
        for(let k in this.btn_list){
            let object = this.btn_list[k] 
            if(object.btn){
                object.btn.active = (false)
            }
        }
        let tips_btn = this.item_config.tips_btn || []
        let btn_sum = Utils.getArrLen(tips_btn)
        if(btn_sum == 1){        // 如果只有1个按钮,按钮1移到按钮3的位置
            let object_1 = this.btn_list[1]
            let object_3 = this.btn_list[3] 
            if(object_1.btn && object_3.btn){
                object_1.btn.x = object_3.btn.x
            }
        }

        for(let i=0;i<tips_btn.length;++i){
            let v = tips_btn[i]
            if(i > 2) break;
            let object = this.btn_list[i + 1]
            if(object && object.btn){
                let title = BackPackConst.tips_btn_title[v] || ""
                object.label.string = (title)
                object.btn.active = (true)
                object.btn.on("click",function(){
                    this.clickBtn(v)
                },this)
            }
        }
    },
    clickBtn(index){
        if(!this.item_config) return;
        if(!this.skin_id) return;
        if(index == BackPackConst.tips_btn_type.source){ //--来源
            if(this.item_config.source.length > 0){
                BackpackController.getInstance().openTipsSource(true,this.data)
            }else{
                message(Utils.TI18N("暂时没有来源"))
            }
        }else if(index == BackPackConst.tips_btn_type.goods_use){ //普通物品使用
            let time = this.model.getHeroSkinInfoBySkinID(this.skin_id)
            if(time != null && time == 0){
                //说明拥有该皮肤 并且是永久的
                let skin_info = Config.partner_skin_data.data_skin_info
                if(skin_info && skin_info[this.skin_id]){
                    if(this.item_config.client_effect[0]){
                        let item_id = this.item_config.client_effect[0][2] || Config.item_data.data_assets_label2id.skin_debris
                        let item_config = Utils.getItemConfig(item_id)
                        let icon_src = PathTool.getIconPath("item",item_config.icon)
                        let count = this.item_config.client_effect[0][3] || 0
                        var CommonAlert = require("commonalert");
                        let str = cc.js.formatStr(Utils.TI18N("当前您已永久拥有该皮肤，重复激活使用，将转化为 <img src='%s'/><color=#289b14> %s </color>，是否继续使用？"),item_config.icon, count)
                        let callback = function(){
                            BackpackController.getInstance().sender10515(this.data.id || 0,1)
                        }.bind(this)
                        let other_args = {}
                        other_args.title = Utils.TI18N("使用皮肤");
                        other_args.align = cc.macro.TextAlignment.LEFT;
                        other_args.resArr = [icon_src]
                        CommonAlert.show(str, Utils.TI18N("使用"), callback, Utils.TI18N("取消"),null, null, null,other_args) 
                    }
                }
            }else{
                BackpackController.getInstance().sender10515(this.data.id || 0,1)
            }
        }
    
        this.onClickCloseBtn()
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.spine){
            this.spine.deleteMe()
            this.spine = null
        }
        this.ctrl.openHeroSkinTipsPanel(false)
    },
})