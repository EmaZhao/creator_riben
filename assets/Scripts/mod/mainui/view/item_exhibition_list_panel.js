// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-01 16:07:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MainUIConst = require("mainui_const");
var ItemExhibitionListPanel = cc.Class({
    extends: BaseClass,
    ctor: function () {

    },

    // 设置父节点
    setParent:function(parent){
        this.parent = parent;
        this.createItemName();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    show:function(data){
        if(data){
            this.data = data;
            var show_type = data.show_type || MainUIConst.item_exhibition_type.item_type;
            if (show_type == MainUIConst.item_exhibition_type.item_type){
                this.showItemUI(data);
            }else if(show_type == MainUIConst.item_exhibition_type.partner_type){
                this.showPartnerUI(data);
            }else{
                console.log(Utils.TI18N("ItemExhibitionList类型出错:%s"), show_type.toString());
            }
        }
    },

    //创建道具名文本
    createItemName:function(){
        if(this.parent){
            this.item_name_label = Utils.createLabel(20,new cc.Color(0xff,0xe8,0xff,0xff),null,0, 0,"",this.parent,null,cc.v2(0.5,0.5));
        }
    },

    // 显示物品的
    showItemUI:function(data){
        var item_bid = data.bid || data.base_id;
        if(data == null || item_bid == null)return;

        var item_config = Utils.getItemConfig(item_bid) || {};
        if(item_config == null)return;

        if (this.item == null) {
            this.item = Utils.createClass("backpack_item");
            var BackpackController = require("backpack_controller");
            var BackPackConst = require("backpack_const");
            var item_vo = BackpackController.getInstance().getModel().getBackPackItemById(data.id);
            if(item_config.type == BackPackConst.item_type.ARTIFACTCHIPS && item_vo){
                this.item.initConfig(true);
                //获取符文特殊处理，点击显示符文详细信息
                this.item.addCallBack(function (  ){
                    var HeroController = require("hero_controller");
                    var PartnerConst = require("partner_const");
                    HeroController.getInstance().openArtifactTipsWindow(true, item_vo, PartnerConst.ArtifactTips.normal)
                }.bind(this));
            }else{
                this.item.initConfig(true, 1, false, true);    
            }

            this.item.setParent(this.parent);
            this.item.show();
        }
        this.item.setData({bid:data.bid, num:data.num});

        var quality = null;
        var name = null;
        
        quality = item_config.quality;
        name = item_config.name;

        if(quality != null && name != null && this.item_name_label){
            var BackPackConst = require("backpack_const");
            var hex = BackPackConst.quality_color(quality);
            var color = this.item_name_label.node.color;
            color.fromHEX(hex);
            this.item_name_label.node.color = color;
            this.item_name_label.string = name;
            this.item_name_label.node.active = true;
        }
    },

    // 显示伙伴的
    showPartnerUI:function(data){
        if(!data.bid)return;
        var config = Config.partner_data.data_partner_base[data.bid];
        if(!config)return;

        var quality = null;
        if(this.item == null){
            this.item = ItemsPool.getInstance().getItem("hero_exhibition_item");
            this.item.addCallBack(function(){
                var HeroController = require("hero_controller");
                HeroController.getInstance().openHeroTipsPanelByBid(data.bid);
            });
            this.item.setParent(this.parent);
            this.item.show();
            this.item.setData(data);
        }

        var quality = data.star || config.init_star;
        quality = quality - 1;
        if(quality > 5){
            quality = 5;
        }

        if(this.item_name_label){
            var BackPackConst = require("backpack_const");
            var hex = BackPackConst.quality_color(quality);
            var color = this.item_name_label.node.color;
            color.fromHEX(hex);
            this.item_name_label.node.color = color;
            this.item_name_label.string = config.name;
            this.item_name_label.node.active = true;
        }
    },

    // 设置不可见
    hide:function(){

    },

    // 设置点击回调
    addCallBack:function(callback){

    },

    // 设置位置
    setPosition:function(x, y){
        if(this.item)
            this.item.setPosition(x, y);
        if(this.item_name_label){
            this.item_name_label.node.setPosition(x, y-80);
        }
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    deleteMe:function(){
        if (this.item) {
            this.item.deleteMe();
        }
        if(this.item_name_label){
            this.item_name_label.node.destroy()
        }
        this.item = null;
    },
})
