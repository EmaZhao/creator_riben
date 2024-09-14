import { Use_Form_Success } from "../../partner/partner_event";

// -- --------------------------------------------------------------------
// -- 
// -- 
// -- @author: mengjiabin@syg.com(必填, 创建模块的人员)
// -- @editor: mengjiabin@syg.com(必填, 后续维护以及修改的人员)
// -- @description:
// --      世界地图大陆板块
// -- <br/>Create: 2018-xx-xx
// -- --------------------------------------------------------------------

var WorldMapLand = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.config = arguments[0];
        this.land_id = arguments[1];
        this.click_callback = arguments[2];
        this.size = cc.size(100, 38)
        this.scale = 2
        this.item_list = {}
        this.had_unlock = false
        this.open_chapter_data = arguments[3];
        this.createRootWnd();
    },

    // 初始化UI
    createRootWnd:function(){
        this.root_wnd = new cc.Node("lang_item");
        this.root_wnd.setAnchorPoint(0.5, 0);
        this.root_wnd.setContentSize(this.size)
        
        if(this.land_id >= this.config.bid){
            this.name_container = Utils.createImage(this.root_wnd, null, this.config.name_x-50, this.config.name_y, cc.v2(0.5, 0.5), false)
            LoaderManager.getInstance().loadRes(PathTool.getUIIconPath("worldmap","worldmap_1007"), function(res_object){
                this.name_container.spriteFrame = res_object;
            }.bind(this));            
            this.name_label = Utils.createLabel(20,new cc.Color(0xff,0xff,0xff,0xff),new cc.Color(0x0a,0x0f,0x0f,0xff),0,10,this.config.name,this.name_container.node,1,cc.v2(0.5,0.5));
            // this.name_label:setLocalZOrder(9)
            this.had_unlock = true;
        }else{
            if(this.config.bid > 1){
                LoaderManager.getInstance().loadRes(PathTool.getBigBg(cc.js.formatStr("worldmap_100%s", this.config.bid),null,"worldmap"), function(res_object){
                    this.mainland = Utils.createImage(this.root_wnd, null, this.size.width * 0.5-50, this.size.height * 0.5, cc.v2(0.5, 0.5), false)
                    this.mainland.node.setScale(this.scale)
                    this.mainland.spriteFrame = res_object;
                }.bind(this)); 
            }
        }
        
        //  绘制点击区域，不做像素监测了，直接做一个不相互压住的做点击判断,只有解锁的才做点击响应
        if(this.had_unlock == true){
            this.click_layout = new cc.Node();
            this.click_layout.setAnchorPoint(0.5, 0.5)
               
            this.root_wnd.addChild(this.click_layout, 10);
            if(this.config.bid == 1){
                this.click_layout.setPosition(4, -14);
                this.click_layout.setContentSize(cc.size(440, 300));
            }else if(this.config.bid == 2){
                this.click_layout.setPosition(-7, 17); 
                this.click_layout.setContentSize(cc.size(600, 200)) ;
            }else if(this.config.bid == 3){
                this.click_layout.setPosition(81, -5) 
                this.click_layout.setContentSize(cc.size(500, 300)) 
            }else if(this.config.bid == 4){
                this.click_layout.setPosition(-28, 49);
                this.click_layout.setContentSize(cc.size(200, 380));
            }else if(this.config.bid == 5){
                this.click_layout.setPosition(44, 14);
                this.click_layout.setContentSize(cc.size(200, 380));
            }  
        }

        this.registerEvent();
    },

    registerEvent:function(){
        //当用户点击的时候记录鼠标点击状态
        if(this.click_layout){
            this.click_layout.on(cc.Node.EventType.TOUCH_START, function(event){
                var touches = event.getTouches();
                this.touch_began = touches[0].getLocation();
            },this);
        }
        
        if(this.click_layout){
            //当鼠标抬起的时候恢复状态
            this.click_layout.on(cc.Node.EventType.TOUCH_END, function(event){
                var touches = event.getTouches();
                this.touch_end =  touches[0].getLocation();
                var is_click = true;
                if(this.touch_began!=null){
                    is_click = Math.abs(this.touch_end.x - this.touch_began.x) <= 20 && Math.abs(this.touch_end.y - this.touch_began.y) <= 20
                }
                if(is_click == true){
                    this.clickHandler();
                }
            },this);
        }
        
    },

    // 点击大陆板块的回调处理，这个时候就选中当前的
    clickHandler:function(){
        if(this.click_callback){
            this.click_callback(this)
        }
    },

    addToParent:function(parent){
        if(parent && this.config && this.root_wnd){
            parent.addChild(this.root_wnd)
            this.root_wnd.setPosition(this.config.x, this.config.y-640)   
        }
    },

    // 设置选中大陆，这个时候会创建大陆板块上面的据点或者隐藏
    setSelectedLand:function(status){
        if(status == true){
            if(this.item_list){
                for(var i in this.item_list){
                    this.item_list[i].clearEffect();
                }
            }
            if(this.name_container){
                this.name_container.node.active = false;
            }
            if(this.click_layout){
                this.click_layout.active =false;
            }

            if(this.item_container == null){
                this.item_container = new cc.Node();
                this.item_container.setContentSize(this.size);
                this.item_container.setAnchorPoint(cc.v2(0, 0));
                this.item_container.setPosition(cc.v2(-70, -30));
                this.root_wnd.addChild(this.item_container);
            }
            this.item_container.active = true;
            this.createItemList();
        }else{
            if(this.click_layout){
                this.click_layout.active =true;
            }
            if(this.name_container){
                this.name_container.node.active = true;
            }
            if(this.item_container){
                this.item_container.active = false;
            }
        }
    },

    createItemList:function(){
        if(this.config != null && this.config.dungeon_list != null){
            var call_back = function(){
                if(this.item_list){
                    for(var i in this.item_list){
                        this.item_list[i].clearEffect();
                    }
                }
            }.bind(this);
            for(var i in this.config.dungeon_list){
                var v = this.config.dungeon_list[i];
                if(this.item_list[v.bid] == null){
                    var WorldMapItem = require("worldmap_item");
                    this.item_list[v.bid] = new WorldMapItem(v,this.open_chapter_data)
                    this.item_list[v.bid].addToParent(this.item_container,call_back)
                }
            }
        }
    },
    
    // 删掉的时候关闭
    DeleteMe:function(){
        if(this.item_container){
            this.item_container.stopAllActions();
        }
        for(var i in this.item_list){
            this.item_list[i].DeleteMe();
        }
        this.item_list = null;
    },
})