var PromptTypeConst = require("prompt_type_const")
var PromptVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function() {
        this.list = []
        this.type = arguments[0]
        this.id = arguments[1]
        this.auto_id = 0;
        this.name = ""
        this.is_show_bubble = false //是否弹出过气泡提示
    },
    update(data){
        this.auto_id = this.auto_id + 1
        if(this.type == PromptTypeConst.BBS_message_reply){
            let obj = this.getSridByData(data)
            let role_name = obj.role_name
            // let rid, srv_id, role_name, _ ,bbs_id = 
            let name = role_name || Utils.TI18N("名字")
            this.name = name + Utils.TI18N("回复了你")
        }else{
            this.name = Config.notice_data.data_get[this.type].name    
        }
        this.list.push({id : this.auto_id, data : data,time : gcore.SmartSocket.getTime()})
        this.fire(PromptVo.UPDATE_SELF_EVENT)
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
        var guild_name = ""
        if(data && data.arg_str && data.arg_str.length > 0){
            for(let i=0;i<data.arg_str.length;++i){
                let temp = data.arg_str[i]
                if(temp){
                    if(temp.key == 1){
                        srv_id = temp.value
                    }else if(temp.key == 2){
                        role_name = temp.value
                    }else if(temp.key == 3){
                        guild_name = temp.value
                    }
                }
            }
        }
        return {rid:rid, srv_id:srv_id, role_name:role_name, guild_name:guild_name, bbs_id:bbs_id}
    },
    removeDataById(id){
        for(let i=0;i<this.list.length;++i){
            let v = this.list[i]
            if(v.id == id){
                this.list.splice(i,1)
            }
        }
    },
    getNum(){
        return this.list.length
    },
    setShowBubbleStatus( status ){
        this.is_show_bubble = status
    },
})
PromptVo.UPDATE_SELF_EVENT = "PromptVo.UPDATE_SELF_EVENT"
module.exports = PromptVo;