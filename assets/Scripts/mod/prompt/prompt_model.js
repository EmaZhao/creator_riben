// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-16 15:45:17
// --------------------------------------------------------------------
var PromptEvent = require("prompt_event")
var PromptModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.prompt_list = [];
        this.auto_id = 0;
    },
    addPromptData(data){
        let config = Config.notice_data.data_get[data.type]
        if(config == null){
            cc.log("==============> 添加小图标失败, 未配置该小图标数据, 类型为 ", data.type)
            return 
        }
        let prompt_vo = null
        let obj = this.getSridByData(data)
        let cur_rid = obj.rid 
        let cur_srv_id = obj.srv_id
        if(this.checkIsInList(data.type, cur_rid, cur_srv_id) == true) return;
        this.auto_id = this.auto_id + 1
        let PromptVo = require("prompt_vo")
        if(config.can_overly == 1){
            prompt_vo = this.getPromptVoByType(data.type)
            if(prompt_vo == null){
                prompt_vo = new PromptVo(data.type, this.auto_id)
                this.prompt_list.push(prompt_vo)
            }
            prompt_vo.update(data)
        }else{
            prompt_vo = new PromptVo(data.type, this.auto_id)
            prompt_vo.update(data)
            this.prompt_list.push(prompt_vo)
        }
        gcore.GlobalEvent.fire(PromptEvent.ADD_PROMPT_DATA, prompt_vo);
    },
    getPromptVoByType(type){
        for(let i=0;i<this.prompt_list.length;++i){
            let v = this.prompt_list[i]
            if(v.type == type){
                return v
            }
        }
    },
    checkIsInList(type, rid, srv_id){
        for(let i=0;i<this.prompt_list.length;++i){
            let vo = this.prompt_list[i]
            if(vo.type == type){
                for(let k=0;k<vo.list.length;++k){
                    let v = vo.list[k]
                    let obj = vo.getSridByData(v.data)
                    let _rid = obj.rid
                    let _srv_id = obj.srv_id
                    let _rolename = obj.role_name
                    if(Utils.getNorKey(_rid, _srv_id) == Utils.getNorKey(rid, srv_id)){
                        return true
                    }
                }
            }
        }
        return false
    },
    getSridByData(data){
        let rid = 0, srv_id = "", role_name = "";
        let bbs_id = 0
        if(data && data.arg_uint32 && data.arg_uint32.length > 0){
            for(let i=0;i<data.arg_uint32.length;++i){
                let temp = data.arg_uint32[i]
                if(temp){
                    if(temp.key == 1){
                        rid = temp.value
                    }else if(temp.key == 2){
                        bbs_id = temp.value //留言板那边的..表示留言id
                    }
                }
            }    
        }

        if(data && data.arg_str && data.arg_str.length > 0){
            for(let i=0;i<data.arg_str.length;++i){
                let temp = data.arg_str[i]
                if(temp){
                    if(temp.key == 1){
                        srv_id = temp.value
                    }else if(temp.key == 2){
                        role_name = temp.value
                    }
                }
            }
        }
        return {rid:rid, srv_id:srv_id, role_name:role_name, bbs_id:bbs_id}
    },
    getPromptList(){
        return this.prompt_list
    },
    // -- 获取列表中是否有未气泡提示的消息
    getNotBubblePrompt(  ){
        for(let k=0;k<this.prompt_list.length;++k){
            let data = this.prompt_list[k]
            if(data.is_show_bubble == false){
                return data
            }
        }
    },
    //移除一个提示数据,根据类型和id移除
    removePromptData(type, id){
        if(this.prompt_list.length > 0){
            for(let i=0;i<this.prompt_list.length;++i){
                if(vo.type == type && vo.id == id){
                    this.prompt_list.splice(i,1)
                    break
                }
            }
            gcore.GlobalEvent.fire(PromptEvent.REMOVE_PROMPT_DATA)
        }
    },
    //根据类型去删除提示数据【例如通过好友图标打开好友界面时候去清理提示数据】
    removePromptDataByTpye(_type){
        if(this.prompt_list.length > 0){
            for(let i=0;i<this.prompt_list.length;++i){
                let vo = this.prompt_list[i]
                if(vo.type == _type){
                    this.prompt_list.splice(i,1)
                    break
                }
            }
            gcore.GlobalEvent.fire(PromptEvent.REMOVE_PROMPT_DATA)
        }
    },

    //检测类型是有灯泡
    checkPromptDataByTpye(_type){
        if(this.prompt_list.length > 0){
            for(let i=0;i<this.prompt_list.length;++i){
                let vo = this.prompt_list[i]
                if(vo.type == _type){
                    return true
                }
            }
        }
        return false
    },
});