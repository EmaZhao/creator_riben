// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-10 11:44:13
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LimitexerciseController = require("limitexercise_controller")
var ExhibitionItem = require("limitexercise_hero_item_panel")
var LimitExerciseChangeItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("limitexercise", "limitexercise_change_item");
        this.HeightItem = 568;
        this.model = LimitexerciseController.getInstance().getModel()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.btn_master = {}
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let main_container = this.root_wnd.getChildByName("main_container")

        this.touch_kuang = main_container.getChildByName("touch_kuang")
    
        for(let i=1;i<=5;++i){
            let tab = {}
            tab.btn = main_container.getChildByName("btn_master_"+i)
            tab.hero_item = new ExhibitionItem(0.9)//ItemsPool.getInstance().getItem("hero_exhibition_item")
            // tab.hero_item.effect = false
            // tab.hero_item.setExtendData({scale:0.9,can_click:true})
            tab.hero_item.addCallBack(function(){
                this.onClickHeroItem(i)
            }.bind(this))
            tab.hero_item.setParent(tab.btn)
            tab.hero_item.setPosition(-26, -4.5)
            tab.hero_item.show()
            
            tab.name = tab.btn.getChildByName("name").getComponent(cc.Label)
            tab.name.string = ("")
            tab.bar = tab.btn.getChildByName("bar").getComponent(cc.ProgressBar)
            tab.bar_num = tab.btn.getChildByName("bar_num").getComponent(cc.Label)	
            tab.bar_num.string = ("")
    
            tab.kill_spr = tab.btn.getChildByName("kill_spr")
            tab.kill_spr.zIndex = (10)
            tab.kill_spr.active = (false)
            tab.lock_spr = tab.btn.getChildByName("lock_spr")
            tab.lock_spr.zIndex = (10)
            tab.lock_spr.active = (false)
            if(i == 5){
                let boss_spr = tab.btn.getChildByName("boss_spr")
                boss_spr.zIndex = (10)
            }
            tab.index = i
            this.btn_master[i] = tab
        }
        if(this.data){
            this.setData(this.data)
            this.setItemIndex()
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setData(data){
        this.data = data
        if(!data || !this.root_wnd) return;

        this.setGuardData(data)
    },
    setGuardData(data){
        let list = []
        for(let i in data){
            list.push(data[i])
        }
        list.sort(function(a,b){
            return a.sort_id - b.sort_id
        })
        this.data = data

        for(let i=0;i<list.length;++i){
            if(this.btn_master[i+1]){
                let boss = this.getHeroHp(list[i].order_id)
                let hp = boss[0]
                let level_status = boss[1]
                if(this.btn_master[i+1].hero_item.root_wnd){
                    this.btn_master[i+1].hero_item.setHeadImg(list[i].head_id)
                    this.btn_master[i+1].hero_item.setQualityImg(list[i].star)
                    this.btn_master[i+1].hero_item.setLev(list[i].master_lev)
                    // this.btn_master[i+1].hero_item.setRootScale(0.9)
                    Utils.setChildUnEnabled(this.btn_master[i+1].hero_item.root_wnd,hp==0)
                }else{
                    this.btn_master[i+1].hero_item.getRootWnd(function(){
                        this.btn_master[i+1].hero_item.setHeadImg(list[i].head_id)
                        this.btn_master[i+1].hero_item.setQualityImg(list[i].star)
                        this.btn_master[i+1].hero_item.setLev(list[i].master_lev)
                        // this.btn_master[i+1].hero_item.setRootScale(0.9)
                        Utils.setChildUnEnabled(this.btn_master[i+1].hero_item.root_wnd,hp==0)
                    }.bind(this))
                }

                this.btn_master[i+1].name.string = (list[i].name)
                this.btn_master[i+1].bar_num.string = hp + "%";
                this.btn_master[i+1].bar.progress = (hp)

                if(level_status == true){
                    this.btn_master[i+1].lock_spr.active = (false)
                }else{
                    this.btn_master[i+1].lock_spr.active = (hp==100)
                }
                this.btn_master[i+1].kill_spr.active = (hp==0)

                // setChildUnEnabled(hp==0, this.btn_master[i].hero_item)
            }
        }
    },
    getHeroHp(order_id){
        let cur_level = this.model.getCurrentChangeID()
        let cur_hp = this.model.getCurrentBossHp()
        if(!cur_level || !cur_hp) return 0;
    
        let hp_num = 0
        let level_status = false
        if(order_id < cur_level){
            hp_num = 0
        }else if(order_id == cur_level){
            hp_num = cur_hp*0.001
            level_status = true
        }else if(order_id > cur_level){
            hp_num = 100
        }
        return [hp_num,level_status]
    },
    addCallBack(callback){
        this.callback = callback
    },
    onClickHeroItem(pos){
        this.funcCallBack(this.data,pos)
    },
    funcCallBack(data,index){
        if(!data) return;

        if(this.callback){
            let order_type,order_id
            for(let i in data){
                let item = data[i]
                if(item.sort_id == index){
                    order_type = item.order_type
                    order_id = item.order_id
                    break
                }
            }
            if(order_type && order_id){
                this.item_index = index
                this.callback(this,order_type,order_id,index)
            }
        }
    },
    getBtnMaster(index){
        if(this.btn_master[index]){
            return this.btn_master[index].btn
        }
    },
    setItemIndex(){
        if(!this.data)return
        let cur_change = this.model.getCurrentChangeID()
        let init_index
        let data = this.model.getLimitExerciseData()
        if(data.order > data.round * 15){
            cur_change =  data.round_boss
        }
        for(let i in this.data){
            let v = this.data[i]
            if(v.order_id == cur_change){
                init_index = v.sort_id
                break
            }
        }
        if(init_index){
            this.onClickHeroItem(init_index)
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        for(let i in this.btn_master){
            if(this.btn_master[i].hero_item){
                this.btn_master[i].hero_item.deleteMe()
                this.btn_master[i].hero_item = null;
            }
        }
    },
})