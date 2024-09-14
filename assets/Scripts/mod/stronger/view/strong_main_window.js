// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-29 11:44:54
// --------------------------------------------------------------------
var StrongerController = require("stronger_controller")
var PathTool = require("pathtool");
var HeroController = require("hero_controller")
var Strong_main_window = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("stronger", "stronger_main_window");
        // this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = StrongerController.getInstance();
        this.partner_id = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.view_list = {}
        this.getZiyuanIndex = null;
        this.zhenrongIndex = null;
        this.wentiIndex = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.bianqiangScrollView = this.seekChild("bianqiangScrollView",cc.ScrollView)
        this.container = this.seekChild("container")
        this.communal_nd = this.seekChild("communal")
        this.background_nd = this.seekChild("background")
        this.background_nd.scale = FIT_SCALE
        this.tab_container_nd = this.seekChild("tab_container")
        this.ziyuan_sv = this.seekChild("ziyuan_ScrollView",cc.ScrollView)
        this.zhenrong_sv = this.seekChild("zhenrong_ScrollView",cc.ScrollView)
        this.wenti_sv = this.seekChild("wenti_ScrollView",cc.ScrollView)
        this.back_nd= this.seekChild("close_btn")
        //this.back_nd.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("返回")
        this.seekChild("win_title", cc.Label).string = Utils.TI18N("我要变强")
        var titleNameArr = ["より強く", "資源を獲得", "推奨布陣", "よくある質問"];
        for(let i=1;i<=4;++i){
            this.tab_container_nd.getChildByName("tab_btn_"+i).
                getChildByName("title").getComponent(cc.Label).string = titleNameArr[i-1];
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        for(let i=1;i<=4;++i){
            this.tab_container_nd.getChildByName("tab_btn_"+i).on("touchend",function(){
                Utils.playButtonSound(ButtonSound.Tab);
                this.createSubPanel(i)  
            },this)
        }
        this.back_nd.on("touchend",function(){
            this.ctrl.openMainWin(false)
            Utils.playButtonSound(2)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(index){
        index = index || 1
        this.ctrl.setIsFirst(false)
        this.createSubPanel(index)
    },
    createSubPanel(index){
        let panel = this.view_list[index]
        if(!panel){
            switch(index){
                case 1:
                    var StrongerPanel = require("stronger_panel")
                    panel = new StrongerPanel(this.partner_id)
                    panel.setPosition(0,15)
                    panel.setParent(this.container)
                    this.view_list[index] = panel
                break
                case 2:
                    this.view_list[index] = this.ziyuan_sv.content
                    this.resourcePanel()
                break   
                case 3:
                    this.view_list[index] = this.zhenrong_sv.content
                    this.recommandPanel()
                break
                case 4:
                    this.view_list[index] = this.wenti_sv.content
                    this.problemPanel()
                break
            }
        }
        if(index == 1){
            panel.show()
            this.communal_nd.active = false;
        }else{
            this.view_list[1].hide()
            this.communal_nd.active = true;
            this.ziyuan_sv.node.active = false
            this.zhenrong_sv.node.active = false
            this.wenti_sv.node.active = false
            if(index == 2){
                this.ziyuan_sv.node.active = true
            }else if(index == 3){
                this.zhenrong_sv.node.active = true
            }else if(index == 4){
                this.wenti_sv.node.active = true
            }
        }
    },
    //获取资源
    resourcePanel(){
        let path = PathTool.getPrefabPath("stronger","stronger_item")
        var self = this
        let list = []
        for(let i in Config.stronger_data.data_resource_one){
            list.push(Config.stronger_data.data_resource_one[i])
        }
        this.startUpdate(list.length,function(index){
            let i = index
        // for(let i in list){
            let node = new cc.Node()
            node.setAnchorPoint(0.5,1)
            // Utils.delayRun(this.ziyuan_sv.content,Number(i)/30,function(){
                this.ziyuan_sv.content.addChild(node)
                let a = node
                this.loadRes(path,function(prefabPath){
                    let data = list[i]
                    let prefab = prefabPath;
                    a.addChild(prefab);
                    a.setContentSize(prefab.getContentSize()) 
                    let node = prefab.getChildByName("top").getChildByName("main_container")
                    node.getChildByName("name").getComponent(cc.Label).string = list[i].name;
                    node.getChildByName("title").getComponent(cc.Label).string = list[i].desc;
                    node.getChildByName("btn").getChildByName("btn_name").getComponent(cc.Label).string = Utils.TI18N("展开")
                    let res = PathTool.getIconPath("item",data.icon)
                    let path1 = PathTool.getUIIconPath("common","common_1078")
                    this.loadRes(res,function(SpriteFrame){
                        node.getChildByName("goods_icon").getComponent(cc.Sprite).spriteFrame = SpriteFrame
                    }.bind(this))
                    this.ziyuan_sv.content.getComponent(cc.Layout).updateLayout()
                    //创建展开列表
                    let arr = []
                    let path2 = PathTool.getPrefabPath("stronger","stronger_sec_item")
                    for(let j=0;j<data.sub_list.length;++j){
                        let b = new cc.Node()
                        prefab.getChildByName("bottom").addChild(b)
                        this.loadRes(path2,function(item){
                            let pre = item;
                            b.addChild(pre)
                            b.setContentSize(pre.getContentSize()) 
                            let list1 = Config.stronger_data.data_resource_two[data.sub_list[j]]
                            pre.getChildByName("main_container").getChildByName("title").getComponent(cc.Label).string = list1.desc
                            pre.getChildByName("main_container").getChildByName("name").getComponent(cc.Label).string = list1.name
                            pre.getChildByName("main_container").getChildByName("btn").getChildByName("Label").getComponent(cc.Label).string = Utils.TI18N("前往")
                            pre.getChildByName("main_container").getChildByName("btn").on('click',function(){
                                Utils.playButtonSound(1)
                                this.ctrl.clickCallBack(list1);
                            }.bind(this)) 
                            // arr.push(pre)
                            this.loadRes(path1,function(res){
                                pre.getChildByName("main_container").getChildByName("background").getComponent(cc.Sprite).spriteFrame = res
                            }.bind(this))
                            this.loadRes(res,function(SpriteFrame){
                                pre.getChildByName("main_container").getChildByName("goods_icon").getComponent(cc.Sprite).spriteFrame = SpriteFrame
                            }.bind(this))
                        }.bind(this))
                    }
                    
                    node.getChildByName("btn").on('toggle',function(event){
                        let res
                        if(event.isChecked){
                            node.getChildByName("btn").getChildByName("btn_name").getComponent(cc.Label).string = Utils.TI18N("收起")
                            res = PathTool.getUIIconPath("common","common_1020")
                        }else{
                            node.getChildByName("btn").getChildByName("btn_name").getComponent(cc.Label).string = Utils.TI18N("展开")
                            res = PathTool.getUIIconPath("common","common_1029")
                        }
                        this.loadRes(res,function(SpriteFrame){
                            node.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = SpriteFrame
                        }.bind(this))
                        if(this.getZiyuanIndex == i){
                            this.getZiyuanIndex = null 
                        }else{
                            if(this.getZiyuanIndex && this.getZiyuanIndex != i){
                                let toggle = this.view_list[2].children[this.getZiyuanIndex-1].children[0].getChildByName("top").getChildByName("main_container").getChildByName("btn").getComponent(cc.Toggle)
                                toggle.isChecked = false
                            }
                            this.getZiyuanIndex = i
                        }
                        Utils.playButtonSound(1)
                        if(self.getZiyuanIndex){
                            // this.ziyuan_sv.content.getComponent(cc.Layout).updateLayout()
                            // ScrollView里content高度没同步 所以延迟0.1秒滚动
                            this.ziyuan_sv.content.getComponent(cc.Layout).scheduleOnce(function(){
                                self.ziyuan_sv.scrollToOffset(cc.v2(0,Math.abs(self.view_list[2].children[self.getZiyuanIndex-1].y)))
                            },0.1)
                        }
                        prefab.getChildByName("bottom").getComponent(cc.Layout).updateLayout()
                        prefab.getComponent(cc.Layout).updateLayout()
                        a.setContentSize(prefab.getContentSize()) 
                    }.bind(this));
                // }.bind(this))
            // }.bind(this))
            }.bind(this));
        }.bind(this))
    },
    recommandPanel(){
        let path2 = PathTool.getPrefabPath("stronger","recommand_item")
        let list = []; //Utils.deepCopy(Config.stronger_data.data_recommand) 
        for(let i in Config.stronger_data.data_recommand){
            list.push(Config.stronger_data.data_recommand[i])
        }
        this.startUpdate(list.length,function(index){
        // for(let i in list){
            let i = index
            let node = new cc.Node()
            node.setAnchorPoint(0.5,1)
            // Utils.delayRun(this.zhenrong_sv.content,Number(i)/30,function(){
                this.zhenrong_sv.content.addChild(node)
                let a = node
                this.loadRes(path2,function(prefabPath){
                    let prefab = prefabPath;
                    a.addChild(prefab)
                    a.setContentSize(prefab.getContentSize()) 
                    let main = prefab.getChildByName("main_container") 
                    main.getChildByName("title").getComponent(cc.Label).string = list[i].name
                    let desc = StringUtil.parse(list[i].desc)
                    prefab.getChildByName("messagePanel").getChildByName("desc").getComponent(cc.RichText).string = desc
                    prefab.getChildByName("messagePanel").getChildByName("Label").getComponent(cc.Label).string = Utils.TI18N("收起")
                    main.getChildByName("btn").on('toggle',function(event){
                        let res 
                        if(event.isChecked){
                            res = PathTool.getUIIconPath("common","common_1020")
                        }else{
                            res = PathTool.getUIIconPath("common","common_1029")
                        }
                        this.loadRes(res,function(SpriteFrame){
                            main.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = SpriteFrame
                        }.bind(this))
                        if(i == this.zhenrongIndex){
                            this.zhenrongIndex = null
                        }else{
                            if(this.zhenrongIndex && i!=this.zhenrongIndex){
                                this.view_list[3].children[this.zhenrongIndex-1].children[0].getChildByName("main_container").getChildByName("btn").getComponent(cc.Toggle).isChecked = false
                            }
                            this.zhenrongIndex = i
                        }
                        Utils.playButtonSound(1)
                        prefab.getComponent(cc.Layout).updateLayout()
                        a.setContentSize(prefab.getContentSize()) 
                    },this)
                    prefab.getChildByName("messagePanel").on("touchend",function(){
                        main.getChildByName("btn").getComponent(cc.Toggle).isChecked = false        
                    },this)
                    for(let j=0;j<list[i].hero_list[0].length;++j){
                        let id = list[i].hero_list[0][j]
                        let config = Utils.deepCopy(Config.partner_data.data_partner_base[id])
                        if(config){
                            let hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
                            hero_item.setData(config)
                            hero_item.setParent(prefab.getChildByName("main_container").getChildByName("scroll_con"));
                            hero_item.show();
                            hero_item.setScale(0.73)
                            hero_item.setPosition(60+j*95,0)
                            hero_item.addCallBack(function(){
                            if(config.bid){
                                    HeroController.getInstance().openHeroTipsPanelByBid(config.bid)
                            }
                            }.bind(this))
                        }
                    
                    }
                }.bind(this))
            // }.bind(this))
        // }
        }.bind(this))
    },
    problemPanel(){
        let list = []//Utils.deepCopy(Config.stronger_data.data_problem) 
        for(let i in Config.stronger_data.data_problem){
            list.push(Config.stronger_data.data_problem[i])
        }
        this.startUpdate(list.length,function(index){
            let i = index
        // for(let i in list){
        //     Utils.delayRun(this.wenti_sv.content,Number(i)/30,function(){
                let path = PathTool.getPrefabPath("stronger","problem_item")
                this.loadRes(path,function(prefabPath){
                    let prefab = prefabPath;
                    this.wenti_sv.content.addChild(prefab) 
                    let main = prefab.getChildByName("main_container")
                    main.getChildByName("name").getComponent(cc.Label).string = list[i].name
                    main.getChildByName("btn").getChildByName("Label").getComponent(cc.Label).string = Utils.TI18N("查看")
                    prefab.getChildByName("msgBottom").getChildByName("desc").getComponent(cc.RichText).string = StringUtil.parse(list[i].desc)
                    let height = prefab.getChildByName("msgBottom").getChildByName("desc").height 
                    prefab.getChildByName("msgBottom").height = height + 25
                    main.getChildByName("btn").on('toggle',function(event){
                        let res,name
                        if(event.isChecked){
                            res = PathTool.getUIIconPath("common","common_1020")
                            name = Utils.TI18N("收起")
                        }else{
                            res = PathTool.getUIIconPath("common","common_1029")
                            name = Utils.TI18N("查看")
                        }
                        main.getChildByName("btn").getChildByName("Label").getComponent(cc.Label).string = name;
                        this.loadRes(res,function(SpriteFrame){
                            main.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = SpriteFrame
                        }.bind(this))
                        if(i == this.wentiIndex){
                            this.wentiIndex = null
                        }else{
                            if(this.wentiIndex && this.wentiIndex != i){
                                this.view_list[4].children[this.wentiIndex-1].getChildByName("main_container").getChildByName("btn").getComponent(cc.Toggle).isChecked = false
                            }
                            this.wentiIndex = i
                        }
                        Utils.playButtonSound(1)
                    },this)
                }.bind(this))
        //     }.bind(this))
        // }
        }.bind(this))
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.view_list[1]){
            this.view_list[1].deleteMe()
        }
        this.ctrl.openMainWin(false)
    },
})
module.exports = Strong_main_window;