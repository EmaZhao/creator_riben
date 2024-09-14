// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-23 10:20:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionEvent = require("action_event")
var ActionTimeGiftItem = require("action_time_gift_item")
var ActionTimeGiftBigWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_time_gift_big_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.pageItem = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.pageView = this.seekChild("PageView",cc.PageView);
        this.btn_close = this.seekChild("btn_close");
        this.left_btn = this.seekChild("left_btn")
        this.right_btn = this.seekChild("right_btn")
        this.indicator = this.seekChild("indicator",cc.PageViewIndicator)
        this.loadRes(PathTool.getUIIconPath("timegiftbig","time_gift_big_2"),function(res){
            this.left_btn.getComponent(cc.Sprite).spriteFrame = res
            this.right_btn.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))
        this.loadRes(PathTool.getUIIconPath("timegiftbig","time_gift_big_1"),function(res){
            this.indicator.spriteFrame = res
        }.bind(this))
        this.indicator._changedState = function(){
            var indicators = this.indicator._indicators;
            if (indicators.length === 0) return;
            var idx = this.pageView._curPageIdx;
            if (idx >= indicators.length) return;
            let count = 0
            if(indicators.length <= 1) return
            for (let i = 0; i < indicators.length; ++i) {
                let node = indicators[i];
                count = count
                this.loadRes(PathTool.getUIIconPath("timegiftbig","time_gift_big_0"),function(res){
                    count++
                    node.getComponent(cc.Sprite).spriteFrame = res;
                    if(count == indicators.length){
                        //有异步
                        this.loadRes(PathTool.getUIIconPath("timegiftbig","time_gift_big_1"),function(res){
                            indicators[idx].getComponent(cc.Sprite).spriteFrame = res
                        }.bind(this));
                    }
                }.bind(this));
            }
        }.bind(this)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.pageView.node.off("touchstart",this.pageView._onTouchBegan,this.pageView,true)
        this.pageView.node.off("touchmove",this.pageView._onTouchMoved,this.pageView,true)
        this.pageView.node.off("touchend",this.pageView._onTouchEnded,this.pageView,true)
        this.pageView.node.off("touchcancel",this.pageView._onTouchCancelled,this.pageView,true)
        this.pageView.node.on("page-turning",this.scrollEnded,this)
        this.left_btn.on('click',function(){
            Utils.playButtonSound(1)
            let index = this.pageView.getCurrentPageIndex()
            if(index == 0)return
            this.pageView.setCurrentPageIndex(index-1)
        },this)
        this.right_btn.on('click',function(){
            Utils.playButtonSound(1)
            let index = this.pageView.getCurrentPageIndex()
            let max = this.pageView.getPages().length - 1
            if(index == max)return
            this.pageView.setCurrentPageIndex(index+1)
        },this)
        this.btn_close.on('click',function(){
            Utils.playButtonSound(2);
            this.ctrl.openTriggerGiftWindow(false)
        },this)
        this.addGlobalEvent(ActionEvent.TRIGGER_GIFT_EVENT,function(data){
            this.setData(data)
        }.bind(this))
        this.ctrl.sender21220()
    },
    scrollEnded(){
        let index = this.pageView.getCurrentPageIndex()
        let max = this.pageView.getPages().length - 1
        if(index == 0){
            this.left_btn.active = false;
            this.right_btn.active = true
        }else if(index == max){
            this.left_btn.active = true;
            this.right_btn.active = false;
        }else{
            this.left_btn.active = true;
            this.right_btn.active = true;     
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        
    },
    setButtonState(){
        if(this.data.length == 1){
            this.left_btn.active = false;
            this.right_btn.active = false;
            this.indicator.node.active = false;
        }
    },
    setData(data){
        if(this.data == null){
            this.left_btn.active = false;
            this.right_btn.active = true;
        }
        if(this.data){
            for(let i=0;i<this.data.length;++i){
                let v = this.data[i]
                let check = false
                for(let j=0;j<data.gifts.length;++j){
                    if(v.id == data.gifts[j].id){
                        check = true
                        break
                    }
                }
                if(check == false){
                    let config = Config.tri_gift_data.data_limit_gift[v.id];
                    v.num = config.limit_num
                    data.gifts.push(v)
                }
            }
        }
        this.data = data.gifts
        this.setButtonState()
        for(let i=0;i<data.gifts.length;++i){
            let v = data.gifts[i]
            let item = this.pageItem[v.id]
            if(item == null){
                item = new ActionTimeGiftItem()
                item.setParent(this.pageView.content)
                item.show()
                item.addCallFunc(function(cell){
                    this.pageView._pages.push(cell.root_wnd);
                    this.pageView._updatePageView()
                }.bind(this))
                this.pageItem[v.id] = item
            }
            item.setPosition(i * 720,0)
            item.setData(v)
        }
        this.pageView.content.width = data.gifts.length * 720 
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.pageItem){
            for(let i in this.pageItem){
                if(this.pageItem[i]){
                    this.pageItem[i].deleteMe()
                    this.pageItem[i] = null;
                }
            }
            this.pageItem = null;
        }
        this.ctrl.openTriggerGiftWindow(false)
    },
})