// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-12 15:43:29
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WelfareEvent = require("welfare_event")
var WelfareConst = require("welfare_const")
var SureveyquestWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "surveyquest_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.topic_length = 10 //题目数
        this.index_count = -1 //做题数量
        this.answer_ret_temp = null;
        this.topic_layout = {} //点击区域
        this.answer_list = [] //答案
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background")
    
        this.main_container = this.root_wnd.getChildByName("main_container")
        this.btn_start = this.main_container.getChildByName("btn_start")
        this.btn_start.label = this.btn_start.getChildByName("Text_9").getComponent(cc.Label)
        this.btn_close = this.main_container.getChildByName("btn_close")
        this.answer_content = this.main_container.getChildByName("answer_content")
        this.answer_content.active = false;
        this.titleTopic = this.main_container.getChildByName("titleTopic").getComponent(cc.Label)
        this.topic_layout_nd = this.answer_content.getChildByName("topic_layout")
        this.scroll = this.answer_content.getChildByName("answer_scroll")
        this.content = this.answer_content.getChildByName("answer_scroll").getChildByName("content")
        this.main_container.getChildByName("Text_10").getComponent(cc.Label).string = Utils.TI18N("小助手的冒险调查")
        // --调查开始的框
        this.text_prompt = this.main_container.getChildByName("text_prompt")
        this.start_title = this.text_prompt.getChildByName("Text_8").getComponent(cc.Label)
        this.start_title.string = "";
        this.start_memo = this.text_prompt.getChildByName("Text_8_0").getComponent(cc.Label)
        this.start_memo.string = "";

        // --填空框
        this.suggest_panel = this.main_container.getChildByName("suggest_panel")
        this.text_field_eb = this.suggest_panel.getChildByName("text_Field").getComponent(cc.EditBox)
        this.suggest_panel.active = false;

        // --奖励框
        this.reward_panel = this.main_container.getChildByName("reward_panel")
        this.reward_panel.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.btn_start.on('click',function(){
            Utils.playButtonSound(1)
            let open_data = this.ctrl.getModel().getQuestOpenData()
            if(open_data && open_data.flag != 0){
                this.ctrl.sender24604()
                return
            }
            if(this.index_count > this.topic_length) return;
            if(this.questNaire_list){
                let last_data = this.questNaire_list[this.index_count]
                //有题目
                let tab = {}
                tab.id = last_data.id;
                tab.topic_type = last_data.topic_type;
                if(last_data.specific_type !=  WelfareConst.QuestConst.fill_blank){
                    let status_return = false;
                    for(let i in this.topic_layout){
                        if(this.topic_layout[i].active && this.topic_layout[i].getChildByName("checkmark").active){
                            status_return = true;
                            break
                        }
                    }
                    if(!status_return && last_data.must == 1){
                        message(Utils.TI18N("必须选择一个答案"))
                        return
                    }
                    // [{id:"题目ID",topic_type:"类型",ret:"ret"},{id:"题目ID",topic_type:"类型",ret:"ret"},{id:"题目ID",topic_type:"类型",ret:"ret"}]
                    let str = ""
                    for(let i in this.topic_layout){
                        if(this.topic_layout[i].active && this.topic_layout[i].getChildByName("checkmark").active){
                            str += i
                        }
                    }
                    tab.ret = str;
                }else{
                    //意见
                    if(last_data.must == 1 && this.text_field_eb.string == ""){
                        message(Utils.TI18N("当前题必填"))
                        return
                    }
                    tab.ret = this.text_field_eb.string
                }
                this.answer_list.push(tab)
            }
            this.index_count = this.index_count + 1
            if(this.index_count == 0){
                this.ctrl.sender24602()
            }
            if(this.questNaire_list){
                if(this.index_count == this.questNaire_list.length){
                    this.ctrl.sender24603(this.answer_list)
                }else{
                    this.startTopicAnswer(this.questNaire_list)
                }
            }
        },this)
        this.btn_close.on('click',function(){
            Utils.playButtonSound(2)
            this.ctrl.openSureveyQuestView(false)
        },this)
        this.addGlobalEvent(WelfareEvent.Get_SureveyQuest_Basic,function(data){
            if(!data || Utils.next(data) == null) return;
            let open = this.ctrl.getModel().getQuestOpenData()
            if(open && open.status == 0){
                return
            }
            this.answer_reward_list = data.rewards
            let open_data = this.ctrl.getModel().getQuestOpenData()
            if(open_data){
                if(open_data.flag == 0){
                    this.start_title.string = Utils.TI18N("亲爱的冒险者大人：")
                    this.start_memo.string = Utils.TI18N("辛苦您参加小助手的冒险调查，小助手为大人\n\n准备了小小谢礼，放在了问卷的最后哦~")
                }else{
                    this.getRewardList(open_data.flag)
                }
            }
        }.bind(this))
        this.addGlobalEvent(WelfareEvent.Get_SureveyQuest_Topic_Content,function(data){
            if(!data || Utils.next(data) == null) return;
            let open = this.ctrl.getModel().getQuestOpenData()
            if(open && open.status == 0){
                return
            }
            this.topic_length = data.questionnaire_list.length
            data.questionnaire_list.sort(function(a,b){
                return a.sort - b.sort 
            })
            this.questNaire_list = data.questionnaire_list
            this.startTopicAnswer(this.questNaire_list)
        }.bind(this))
        this.addGlobalEvent(WelfareEvent.SureveyQuest_Submit,function(){
            this.answer_content.active = false;
            this.suggest_panel.active = false
            this.titleTopic.node.active = false;
            this.getRewardList()
        },this)
        this.addGlobalEvent(WelfareEvent.Get_SureveyQuest_Get_Reward,function(data){
            if(!data || Utils.next(data) == null) return;
            let open = this.ctrl.getModel().getQuestOpenData()
            if(open && open.status == 0){
                return
            }
            this.btn_start.label.string = Utils.TI18N("已完成")
            this.btn_start.label.node.getComponent(cc.LabelOutline).enabled = false;
            this.btn_start.getComponent(cc.Button).interactable = false
            this.btn_start.getComponent(cc.Button).enableAutoGrayEffect = true
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        let open_data = this.ctrl.getModel().getQuestOpenData()
        if(open_data.flag == 1){
            this.ctrl.setWelfareStatus(WelfareConst.WelfareIcon.quest, true)
        }else{
            this.ctrl.setWelfareStatus(WelfareConst.WelfareIcon.quest, false)
        }
        this.ctrl.sender24601()
    },
    //题目
    startTopicAnswer(data){
        this.scroll.getComponent(cc.ScrollView).scrollToTop(0)
        this.text_prompt.active = false;
        if(!data || Utils.next(data) == null) return;
        if(!data[this.index_count]){
            return
        }
        let answer = data[this.index_count].specific_type
        if(answer == WelfareConst.QuestConst.single){
            this.selectNum = WelfareConst.QuestConst.single
        }else if(answer == WelfareConst.QuestConst.multiple){
            this.selectNum = WelfareConst.QuestConst.multiple
        }
        this.titleTopic.string = data[this.index_count].title
        if(answer == WelfareConst.QuestConst.fill_blank){
            this.answer_content.active = false;
            this.suggest_panel.active = true;
            this.text_field_eb.string = ""
            return
        }else{
            this.answer_content.active = true;
            this.suggest_panel.active = false;
        }
        let str = data[this.index_count].option.replace(/\\r/g,"")
        let strArr = []
        for(let i=0;i<str.length;++i){
            if(str[i] == '"'){
                strArr.push(i)
            }
        }
        let topic = {}
        for(let i=0;i<strArr.length/4;++i){
            let index = i*4
            let p = /[a-z]/i; 
            let string = str.slice(strArr[index]+1,strArr[index+1])
            let string1 = str.slice(strArr[index+2]+1,strArr[index+3])
            let b = p.test(string);
            if(b){
                topic[string] = string1
            }
        }
        for(let i in this.topic_layout){
            if(this.topic_layout[i]){
                this.topic_layout[i].active = false;
                this.topic_layout[i].getChildByName("checkmark").active = false;
            }
        }
        let spacingY = 30;
        let count = 0
        let itemHeight = 40
        let height = 5
        for(let i in topic){
            let node = this.topic_layout[i]
            if(node == null){
                node = cc.instantiate(this.topic_layout_nd)
                this.content.addChild(node)
                node.background_sp = node.getChildByName("Background").getComponent(cc.Sprite);
                node.label = node.getChildByName("Background").getChildByName("label").getComponent("cc.Label");
                node.getChildByName("checkmark").active = false;
                this.topic_layout[i] = node;
                node.on('touchend',function(event){
                    this.setButtonState(i)
                },this)
            }
            node.active = true;
            count++
            let path
            if(answer == WelfareConst.QuestConst.single){
                path = PathTool.getUIIconPath("common","common_1030")
            }else{
                path = PathTool.getUIIconPath("common","common_1044")
            }
            node.label.string = topic[i]
            node.label._forceUpdateRenderData(true)
            40 + 30 * (2-1)
            let y = height
            if(node.label.node.height > itemHeight){
                height = (y + node.label.node.height) + spacingY
            }else{
                height = (y + itemHeight) + spacingY
            }
            
            node.setPosition(-243,-y)
            this.loadRes(path,function(res){
                node.background_sp.spriteFrame = res;
            }.bind(this))
        }
        this.content.height = height - spacingY
        if(this.index_count != this.topic_length){
            this.btn_start.label.string  = Utils.TI18N("下一页")
        }
    },
    setButtonState(index){
        if(this.selectNum == WelfareConst.QuestConst.single){
            for(let i in this.topic_layout){
                if(this.topic_layout[i].active){
                    this.topic_layout[i].getChildByName("checkmark").active = false;
                }
            }
            this.topic_layout[index].getChildByName("checkmark").active = true;
        }else if(this.selectNum == WelfareConst.QuestConst.multiple){
            this.topic_layout[index].getChildByName("checkmark").active = !this.topic_layout[index].getChildByName("checkmark").active;
            let count = 0;
            for(let i in this.topic_layout){
                if(this.topic_layout[i].active && this.topic_layout[i].getChildByName("checkmark").active){
                    count++
                }
            }
            if(count > this.selectNum){
                if(count == this.selectNum + 1){
                    this.topic_layout[index].getChildByName("checkmark").active = false
                }
                message(Utils.TI18N("最多选择三个选项"))
            }
        }
    },
    getRewardList(flag){
        flag = flag || 1
        this.reward_panel.active = true
        this.end_memo = this.reward_panel.getChildByName("Text_1").getComponent(cc.Label)
        this.end_memo.string = Utils.TI18N("亲爱的冒险者大人~\n\n请收下小助手的一点心意");
        if(flag == 2){
            this.btn_start.label.string = Utils.TI18N("已完成")
            this.btn_start.label.node.getComponent(cc.LabelOutline).enabled = false;
            this.btn_start.getComponent(cc.Button).interactable = false
            this.btn_start.getComponent(cc.Button).enableAutoGrayEffect = true
        }else{
            this.btn_start.label.string = Utils.TI18N("领取奖励")
        }
        if(this.answer_reward_list){
            let content = this.reward_panel.getChildByName("good_cons").getChildByName("content")
            let space_x = 10
            this.award_item = []
            for(let i=0;i<this.answer_reward_list.length;++i){
                let bid = this.answer_reward_list[i].bid
                let num = this.answer_reward_list[i].num
                let item  = ItemsPool.getInstance().getItem("backpack_item")
                item.setParent(content);
                let x = 60 + i*120 + i * space_x
                item.setPosition(x, 60)
                item.show()
                item.setData({bid:bid,num:num})
                this.award_item.push(item)
            }
            content.width = this.answer_reward_list.length * 120 + (this.answer_reward_list.length-1) * space_x
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.award_item){
            for(let i=0;i<this.award_item.length;++i){
                if(this.award_item[i]){
                    this.award_item[i].deleteMe()
                    this.award_item[i] = null
                }
            }
            this.award_item = null;
        }

        this.ctrl.openSureveyQuestView(false)
    },
})