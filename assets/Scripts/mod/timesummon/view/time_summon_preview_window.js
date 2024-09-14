// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-08 19:40:21
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var TimeSummonPreviewWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("seerpalace", "seerpalace_preview_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.is_full_screen = false;
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = this.root_wnd.getChildByName("background")

        let container = self.root_wnd.getChildByName("container")
        self.container = container

        let win_title = container.getChildByName("win_title").getComponent(cc.Label)
        win_title.string = Utils.TI18N("奖励预览")
        let list_panel = container.getChildByName("list_panel")
        self.viewContent = this.seekChild("content")
        self.list_panel = list_panel;
        this.scroll_view_size = list_panel.getContentSize()
        this.star_node_nd       = this.seekChild("star_node");
        this.star_item_nd       = this.seekChild("star_item");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",this._onClickBtnClose,this)
    },
    setData(data){
        var self = this
        let index = data.index;
        let type = data.type;
        let show_data = {}
        var types = require("partnersummon_const").Recruit_type;
        switch(type)
        {
            case types.Normal:
                show_data = Config.recruit_data.data_hero_show[index]
                break;
            case types.Time:
                show_data = Config.recruit_holiday_data.data_hero_show[index]
                break;
            case types.Elite:
                show_data = Config.recruit_holiday_elite_data.data_hero_show[index]
                break;
        }
        if(show_data){
            //参数
            let scale = 0.9
            let desc_height = 40 //--概率描述的高度
            let row = 4 //-- 5列英雄
            let start_x = 22
            let space_x = 35
            let space_y = 20
            let offset_y = 20 //-- 两种星级之间的间隔
            let content_h = 0
            let cellheight = 135;
            //数据初始化
            this.backpackItem = [];
            let tempshowdata = {};
            for(let i=0;i<show_data.length;++i){
                if(tempshowdata[show_data[i].star]){
                    tempshowdata[show_data[i].star].push(show_data[i]);
                }else{
                    tempshowdata[show_data[i].star] = [show_data[i]];
                }
            }
            let showdata = [];
            for (let i in tempshowdata) {
                tempshowdata[i].sort(function(a,b){
                    return b.pickup - a.pickup
                });
                showdata.push({star:i,datas:tempshowdata[i]});
                let item_num = tempshowdata[i].length // -- 数量
                let item_col = Math.ceil(item_num / row) //-- 行数
                content_h = content_h + cellheight * scale * item_col + (item_col - 1) * space_y + offset_y+desc_height;
            }
            showdata.sort(function(a,b){
                return b.star - a.star
            });
            let y = 568 / 2 - content_h
            self.viewContent.height = content_h
            self.viewContent.y = y
            let max_height = content_h
            let start_y = max_height;
            for (let key in showdata) {
                //-- 5星 -4 -3
                let startnode = cc.instantiate(this.star_node_nd);
                startnode.setParent(self.viewContent);
                startnode.setPosition(-122, start_y - desc_height / 2);
                this.updateStars(startnode,showdata[key].star);
                //Utils.createLabel(22, new cc.Color(234, 181, 80, 255), null, start_x, start_y - desc_height / 2, 5+"星概率", self.viewContent, null, cc.v2(0, 0.5))
                let count = showdata[key].datas.length;
                for (let i = 0; i < count; ++i) {
                    let v = showdata[key].datas[i]
                    let cury = start_y;
                    Utils.delayRun(self.list_panel, i / 60, function() {
                        let item_node = ItemsPool.getInstance().getItem("backpack_item")
                        item_node.show();
                        item_node.setParent(self.viewContent)
                        item_node.setExtendData({scale:0.9,isSummonNumber:true,isPickUp:true})
                        item_node.setData(v)
                        item_node.addCallBack(function(item){
                          var TipsController = require("tips_controller")
                          var BackPackConst = require("backpack_const");
                          var config = Utils.getItemConfig(item.data.id);
                          if(BackPackConst.checkIsHero(config)){
                            var HeroController = require("hero_controller");
                            var HeroModel = HeroController.getInstance().getModel();
                            var key = config.effect[0].val[0]+"_"+config.effect[0].val[1];
                            var show_hero_vo = HeroModel.getHeroPokedexByBid(key)
                            if(!show_hero_vo){
                              TipsController.getInstance().showGoodsTips(config);
                            }else{
                              HeroController.getInstance().openHeroTipsPanel(true,show_hero_vo, true, true);
                            }
                          }else{
                            TipsController.getInstance().showGoodsTips(config);
                          }
                        });

                        let index = i + 1
                        let row_index = index % row
                        if (row_index == 0) {
                            row_index = row
                        }
                        let col_index = Math.ceil(index / row)
                        let pos_x = start_x + (row_index - 1) * (119 * scale + space_x) + 60 * 0.9
                        let pos_y = cury - desc_height - (col_index - 1) * (cellheight * scale + space_y) - 60 * 0.9
                        item_node.setPosition(pos_x, pos_y)
                        self.backpackItem.push(item_node)
                    })
                }
                start_y = start_y - desc_height - (Math.ceil(showdata[key].datas.length / row)) * (cellheight * scale + space_y) + space_y - offset_y;
            }
        }
    },

    updateStars: function(star_node_nd,star_num) {
        var star_res = "";
        var star_scal = 1.2;
        var star_rotate = -14;
        star_node_nd.destroyAllChildren();
        star_node_nd.width = 0;
        let star
        if (star_num > 0 && star_num <= 5) {
            star_res = "common_90074";
        } else if (star_num > 5 && star_num <= 9) {
            star_num = star_num - 5;
            star_res = "common_90075";
        } else if (star_num > 9) {
            star = star_num - 10
            star_num = 1;
            star_res = "common_90073";
            star_scal = 1.2;
        }

        for (var star_i = 0; star_i < star_num; star_i++) {
            var star_nd = cc.instantiate(this.star_item_nd);
            star_nd.scale = star_scal;
            star_nd.rotation  = star_rotate;
            var star_sp = star_nd.getComponent(cc.Sprite);
            var common_res_path = PathTool.getUIIconPath("common", star_res);
            this.loadRes(common_res_path, function(star_sp, sf_obj){
                star_sp.spriteFrame = sf_obj;
            }.bind(this, star_sp)) 
            star_node_nd.addChild(star_nd);
            if(star){
                let node = new cc.Node() 
                node.y = -1
                let lab = node.addComponent(cc.Label)
                lab.string = star 
                lab.fontSize = 15;
                lab.lineHeight = 16;
                lab.horizontalAlign = cc.macro.TextAlignment.CENTER;
                lab.verticalAlign = cc.macro.TextAlignment.CENTER;
                node.addComponent(cc.LabelOutline).color = new cc.color(0,0,0);
                star_nd.addChild(node)
            }
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.setData(params) 
    },
    _onClickBtnClose(){
        Utils.playButtonSound(2)
        this.ctrl.openTimeSummonpreviewWindow(false)
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.list_panel.stopAllActions()
        if(this.backpackItem){
            for (let i = 0; i < this.backpackItem.length; ++i) {
                if (this.backpackItem[i]) {
                    this.backpackItem[i].deleteMe()
                    this.backpackItem[i] = null;
                }
            }
        }
        this.ctrl.openTimeSummonpreviewWindow(false)
    },
})