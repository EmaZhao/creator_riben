// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-10 17:14:38
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimesummonConst = require("timesummon_const")
var TimeTool = require("timetool")
var Time_summon_awardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_time_summon_award");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.up_item_list = []
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
        let container = self.root_wnd.getChildByName("container")
        self.container = container
    
        let win_title = container.getChildByName("win_title").getComponent(cc.Label)
        win_title.string = Utils.TI18N("奖励详情")
    
        self.time_label = container.getChildByName("time_label").getComponent(cc.Label)
    
        self.close_btn = container.getChildByName("close_btn")
    
        let list_panel = container.getChildByName("list_panel")
        self.scroll_size = list_panel.getContentSize()

        this.view_content = this.seekChild("content")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on("click",function(){
            Utils.playButtonSound(2)
            this.ctrl.openTimeSummonAwardView(false)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.text_elite = params.text_elite || null
        this.group_id = params.group_id
        this.data = params.data
        this.setData()
    },
    setData(){
        if(this.group_id == null) return;

        let container_height = 0
    
        let pro_config = Config.recruit_holiday_data.data_probability[this.group_id]
        if(this.text_elite == true){
            pro_config = Config.recruit_holiday_elite_data.data_probability[this.group_id]
        }
        let up_con_height = 0
        if(pro_config){
            let up_item_data = []
            for(let i in pro_config){
                let v = pro_config[i]
                if(v.is_up == 1){
                    up_item_data.push(v)
                }
            }

            // -- 本期UP英雄
            if(!this.title_bg_1){
                this.title_bg_1 = Utils.createImage(this.view_content,null, 0 , 0, cc.v2(0.5, 1), null, null, true)
                this.title_bg_1.node.setContentSize(cc.size(610, 44))
            }

            let offset_x = 20
            let num = up_item_data.length
            let start_x = this.view_content.width * 0.5 - num * (119 * 0.5 + offset_x*0.5) + (119 * 0.5 + offset_x*0.5)
            for(let i=0;i<up_item_data.length;++i){
                let v = up_item_data[i]
                let item = this.up_item_list[i]
                if(item == null){
                    item = ItemsPool.getInstance().getItem("backpack_item")
                    item.setDefaultTip(true)
                    item.setParent(this.view_content);
                    this.up_item_list[i] = item
                    let x = -305 + start_x + i * (119 + offset_x)
                    item.setPosition(x, -25)
                }
                item.show()
                item.setData({bid:v.id,num:v.num})
            }

            up_con_height = 54 + 119 + 16

            container_height = up_con_height
        }
        //描述内容
        let desc_height = 0
        if(this.data){
            let summon_cfg = Config.recruit_holiday_data.data_action[this.data.camp_id]
            if(this.text_elite == true){
                summon_cfg = Config.recruit_holiday_elite_data.data_action[this.data.camp_id]
            }
            if(summon_cfg){
                if(!this.title_bg_2){
                    this.title_bg_2 = Utils.createImage(this.view_content,null, 0 , 0, cc.v2(0.5, 1), null, null, true)
                    this.title_bg_2.node.setContentSize(cc.size(610, 44))
                    
                }
                if(!this.award_desc){
                    this.award_desc = Utils.createRichLabel(24, new cc.Color(255,255,255), cc.v2(0.5, 1), cc.v2(0,-184), 34, 580,this.view_content)
                    this.award_desc.horizontalAlign = cc.macro.TextAlignment.LEFT
                }
                this.award_desc.string = summon_cfg.desc || ""
                let desc_size = this.award_desc.node.getContentSize()
                desc_height = desc_size.height + 54 + 10
                container_height = container_height + desc_height
            }
        }
        // let max_height = Math.max(this.scroll_size.height, container_height)
        let begin_pro_y = - up_con_height - desc_height - 54//max_height - up_con_height - desc_height - 54
        // -- 概率展示
        let pro_height = 0
        if(pro_config){
            if(!this.title_bg_3){
                this.title_bg_3 = Utils.createImage(this.view_content,null, 0 , 0, cc.v2(0.5, 1), null, null, true)
                this.title_bg_3.node.setContentSize(cc.size(610, 44))
            }
            pro_height = 54
            container_height = container_height + 54

            for(let i in pro_config){
                let cfg = pro_config[i]
                // delayRun(self.desc_scrollview, i*2/60, function()
                //     if not pro_txt then
                let pro_txt = this.createTimeSummonAwardItem()
                this.view_content.addChild(pro_txt)
                pro_txt.name_text.string = cfg.name;
                if(cfg.is_chip == 1){
                    pro_txt.type_text.string = Utils.TI18N("碎片")
                }else{
                    pro_txt.type_text.string = Utils.TI18N("英雄")
                }
                pro_txt.num_text.string = cfg.probability + "%";
                if(cfg.is_up == 1){
                    pro_txt.star_text.string = cfg.star + " UP!";
                    pro_txt.star_text.node.color = TimesummonConst.Up_Text_Color
                    pro_txt.name_text.node.color = TimesummonConst.Up_Text_Color
                    pro_txt.type_text.node.color = TimesummonConst.Up_Text_Color
                    pro_txt.num_text.node.color = TimesummonConst.Up_Text_Color
                }else{
                    pro_txt.star_text.string = cfg.star
                    pro_txt.star_text.node.color = TimesummonConst.Not_Up_Text_Color
                    pro_txt.name_text.node.color = TimesummonConst.Not_Up_Text_Color
                    pro_txt.type_text.node.color = TimesummonConst.Not_Up_Text_Color
                    pro_txt.num_text.node.color = TimesummonConst.Not_Up_Text_Color
                }

                pro_height = pro_height + 30 + 10
                container_height = container_height + 30 + 10
                //     -- local begin_pro_y = max_height - up_con_height - desc_height - 54
                //     -- for i,txt in ipairs(self.probability_list) do
                let txt_pos_y = begin_pro_y - (i-1)*(30+10)
                //-Utils.getArrLen(pro_config) * 41
                pro_txt.setPosition(cc.v2(0, txt_pos_y))
                //     -- end
                // end)
                if(!this.image_content){
                this.image_content = this.lookHeroInfo()
                this.view_content.addChild(this.image_content)
                this.image_content.on('touchend',function(){
                    this.ctrl.openTimeSummonpreviewWindow(true,this.group_id,this.text_elite ? require("partnersummon_const").Recruit_type.Elite:require("partnersummon_const").Recruit_type.Time)
                },this)
            }
            }
        }
        // max_height = max_height + Utils.getArrLen(pro_config) * 41
        this.view_content.height = container_height
        if(this.title_bg_1){
            this.title_bg_1.node.y = 0;
        }
        let up_item_pos_y =  - 54 - 119*0.5 - 4
        for(let k=0;k<this.up_item_list.length;++k){
            let item = this.up_item_list[k]
            item.setPosition(item.getPositionX(),up_item_pos_y)
        }
        if(this.title_bg_2){
            this.title_bg_2.node.y = - up_con_height
        }
        if(this.award_desc){
            this.award_desc.node.y = - up_con_height - 54
        }
        if(this.title_bg_3){
            this.title_bg_3.node.y =  - up_con_height - desc_height
        }
        if(this.image_content){
        this.image_content.setPosition(this.title_bg_3.node.x + 228,this.title_bg_3.node.y-22)
        }
        this.loadRes(PathTool.getUIIconPath("common","Currency_1_1"),function(res){
            let color  = new cc.Color(0, 0, 0)
            if(this.title_bg_1){
                this.title_bg_1.spriteFrame = res
                this.title_bg_1.node.color = color;
                this.title_bg_1.node.opacity = 120;
                Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, -295, -22 + this.title_bg_1.node.y, Utils.TI18N("本期UP内容"), this.view_content, null, cc.v2(0, 0.5))
            }
            if(this.title_bg_2){
                this.title_bg_2.spriteFrame = res
                this.title_bg_2.node.color = color;
                this.title_bg_2.node.opacity = 120;
                Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, -295, -22 +this.title_bg_2.node.y , Utils.TI18N("内容详情"), this.view_content, null, cc.v2(0, 0.5))
            }
            if(this.title_bg_3){
                this.title_bg_3.spriteFrame = res
                this.title_bg_3.node.color = color
                this.title_bg_3.node.opacity = 120;
                Utils.createLabel(24, new cc.Color(255, 255, 255, 255), null, -295, -22 + this.title_bg_3.node.y, Utils.TI18N("概率公示"), this.view_content, null, cc.v2(0, 0.5))
            }
        }.bind(this))
        // -- 活动时间
        if(this.data){
            let start_time = TimeTool.getYMD(this.data.start_time)
            let end_time = TimeTool.getYMD(this.data.end_time)
            this.time_label.string = cc.js.formatStr(Utils.TI18N("概率有效期：%s~%s"), start_time, end_time)
        }
    },
    createTimeSummonAwardItem(){
        let node = new cc.Node()
        let size = cc.size(584, 30)
        node.setAnchorPoint(cc.v2(0.5, 1))
        node.setContentSize(size)   
        let color = new cc.Color(255,255,255)
        node.star_text = Utils.createLabel(24, color, null, -size.width/2, -size.height/2, "",node, null, cc.v2(0, 0.5))
        node.name_text = Utils.createLabel(24, color, null, -size.width/2 + 160, -size.height/2, "", node, null, cc.v2(0, 0.5))
        node.type_text = Utils.createLabel(24, color, null, -size.width/2 + 320, -size.height/2, "", node, null, cc.v2(0, 0.5))
        node.num_text = Utils.createLabel(24, color, null, size.width/2, -size.height/2, "", node, null, cc.v2(1, 0.5))
        return node
    },
    lookHeroInfo(){
        let btn  = new cc.Node();
        this.loadRes(PathTool.getUIIconPath("common", "Ty_Anniu_1_2"),function(res){
            let sp = btn.addComponent(cc.Sprite);
            sp.type = cc.Sprite.Type.SLICED;
            sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sp.spriteFrame = res;
            btn.setContentSize(cc.size(137, 40))
        }.bind(this))
        Utils.createLabel(20, new cc.Color(62, 105, 37, 255), null, 0, 0, "詳細を確認", btn, null, cc.v2(0.5, 0.5));
        return btn
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.up_item_list){
            for(let i=0;i<this.up_item_list.length;++i){
                if(this.up_item_list[i]){
                    this.up_item_list[i].deleteMe()
                    this.up_item_list[i] = null;
                }
            }
            this.up_item_list = null;
        }
        this.ctrl.openTimeSummonAwardView(false)
    },
})