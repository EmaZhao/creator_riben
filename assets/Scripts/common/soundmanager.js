// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      按钮播放音效的
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LoaderManager = require("loadermanager");

window.AUDIO_TYPE = {
    COMMON: "common",
    SCENE: "scene",
    BATTLE: "battle",
    DUBBING: "dubbing",
    Recruit: "recruit",
    // Drama: "drama"
}

window.SoundManager = cc.Class({
    extends: cc.Component,

    properties: {
        effects: {
            default: {}
        },
        _cur_bg_music: {
            default: {}
        },
        hero_effects: {
            default: {}
        }
    },

    statics: {
        instance: null,
    },

    ctor: function () {
        this.registerEvent();
        this.initSoundSetting();
    },

    initSoundSetting: function () {
        this.music_status = gcore.SysEnv.get("music_status", "1") == "1"; // 音乐
        this.sound_status = gcore.SysEnv.get("sound_status", "1") == "1"; // 音效
        this.voice_status = gcore.SysEnv.get("voice_status", "1") == "1";
    },


    registerEvent: function () {
        gcore.GlobalEvent.bind(EventId.VOICE_SETTING, function (type) {
            if (type)
                this.upateSetting(type);
        }.bind(this));
    },

    upateSetting: function (type) {
        if (type == "music_status") {
            var new_status = gcore.SysEnv.get("music_status", "1") == "1";
            if (new_status != this.music_status) {
                this.music_status = new_status;
                if (new_status) {
                    // if(window.AudioSourceUi){
                    //     window.AudioSourceUi.enabled = true;
                    // }
                    if (this.music_info)
                        this.playMusic(this.music_info.type, this.music_info.name, this.music_info.loop);
                } else {
                    if (this._cur_bg_music) {
                        // cc.audioEngine.stop(this._cur_bg_music.audio_id);
                        if (this._audio) {
                            this._audio.stop();
                        }
                        LoaderManager.getInstance().releaseRes(this._cur_bg_music.res_path);
                        this._cur_bg_music = null;
                        // if(window.AudioSourceUi){
                        //     window.AudioSourceUi.enabled = false;
                        // }
                    }
                }
            }
        } else if (type == "sound_status") {
            var new_status = gcore.SysEnv.get("sound_status", "1") == "1";
            if (new_status != this.sound_status) {
                this.sound_status = new_status;
            }
        } else if (type == "voice_status") {
            var new_status = gcore.SysEnv.get("voice_status", "1") == "1";
            if (new_status != this.voice_status) {
              this.voice_status = new_status;
            }
        }
    },

    // 这里可以处理播放音效
    play: function (event, customEventData) {
        if (event.type == cc.Node.EventType.TOUCH_END) {
            customEventData = customEventData || "c_button1";
            if (customEventData)
                this.playEffect(AUDIO_TYPE.COMMON, customEventData);
        }
    },

    playEffect: function (res_type, res_id) {                    // cache不释放
        if (!this.sound_status) return;
        if (this.effects[res_id]) {
            cc.audioEngine.playEffect(this.effects[res_id], false);
            return;
        }
        var sound_path = PathTool.getSoundRes(res_type, res_id);
        // 这里有一个问题.第一次不播放
        LoaderManager.getInstance().loadRes(sound_path, function (res_id, res_object) {
            if (res_object) {
                if (res_object.name == res_id) {
                    this.effects[res_id] = res_object;
                }
                cc.audioEngine.playEffect(res_object, false);
            }
        }.bind(this, res_id))
    },

    playEffectOnce: function (res_type, res_id) {                // 
        if (!this.sound_status) return;
        var sound_path = PathTool.getSoundRes(res_type, res_id);
        LoaderManager.getInstance().loadRes(sound_path, function (sound_path, res_object) {
            if (res_object) {
                var audio_id = cc.audioEngine.playEffect(res_object, false);
                cc.audioEngine.setFinishCallback(audio_id, this.finishPlayMusic.bind(this, sound_path, audio_id, res_object));
            }
        }.bind(this, sound_path));
    },

    finishPlayMusic: function (sound_path, audio_id, res_object) {
        cc.audioEngine.stop(audio_id);
        cc.audioEngine.uncache(res_object);
        LoaderManager.getInstance().releaseRes(sound_path);
    },

    //英雄语音
    playHeroEffectOnce: function (res_type, res_id, iType) {
        console.log("英雄语音",res_type,res_id);
        if (!this.voice_status) return;
        if(this.hero_id){
          cc.audioEngine.stopEffect(this.hero_id);
        }
        if (this.hero_effects[res_id]) {
            let id = cc.audioEngine.playEffect(this.hero_effects[res_id], false);
            return id;
        }
        var sound_path = PathTool.getSoundRes(res_type, res_id);
        LoaderManager.getInstance().loadRes(sound_path, function (sound_path, res_object) {
            if (res_object) {
                if (res_object.name == res_id) {
                    this.hero_effects[res_id] = res_object;
                }
                var audio_id = cc.audioEngine.playEffect(res_object, false);
                this.hero_id = audio_id;
                if(iType)return;
                cc.audioEngine.setFinishCallback(audio_id, this.finishHeroPlayMusic.bind(this, sound_path, audio_id, res_object));
            }
        }.bind(this, sound_path));
    },

    playEffectNew(res_type, res_id){
      // if(!res_type ||res_id){
        
      // }
    },
    
    // 播放成人剧情英雄语音
    playPlotHeroVoiceOnce(res, isMute) {
        if(!this.voice_status) return;
        this.stopPlotHeroVoice();
        if(window.IS_PLOT_LOCAL) {
            if(res){
                var tem = res
                var id = tem.substring(0,tem.indexOf("_"));
                var path = id + "/" + "Voice/" + id
                // const sound_path = PathTool.getSoundRes("plot", path);
                const sound_path = cc.js.formatStr("res/plot/%s/Voice/%s.mp3", id,res);
                LoaderManager.getInstance().loadRes(sound_path, function (sound_path, res_object) {
                    if (res_object) {
                        this.plot_audio_id = cc.audioEngine.playEffect(res_object, false);
                        this.mutePlotHeroVoice(this.isMute);
                        //console.error(`音乐播放: ${this.plot_audio_id}`);
                        cc.audioEngine.setFinishCallback(this.plot_audio_id, this.finishPlotHeroPlayMusic.bind(this, sound_path, res_object));
                    }
                }.bind(this, sound_path));
            }
            
        } else {
            if(res) {
                this.plot_audio_id = cc.audioEngine.playEffect(res, false);
                this.mutePlotHeroVoice(this.isMute);
                cc.audioEngine.setFinishCallback(this.plot_audio_id, this.finishPlotHeroPlayMusic.bind(this, res,this.plot_audio_id));
            }
        }
    },

    removeEffectSound: function (obj) {
        obj = obj || this.hero_id;
        if(obj == null){
            cc.audioEngine.stopAll();
        }else{
            cc.audioEngine.stop(obj);
        }
    },
    
    finishHeroPlayMusic: function (sound_path, audio_id, res_object) {
        gcore.Timer.set(function(){
            cc.audioEngine.stop(audio_id);
            cc.audioEngine.uncache(res_object);
            LoaderManager.getInstance().releaseRes(sound_path);
            this.hero_effects[res_object.name]= null;
        }.bind(this),10* 1000,1)
    },

    mutePlotHeroVoice(isMute) {
        this.isMute = isMute == null ? false : isMute;
        if(!this.plot_audio_id){
            return;
        }
        // console.error(this.isMute,this.plot_audio_id,"//////////////////",cc.audioEngine.getVolume(this.plot_audio_id))
        if(isMute) {
            cc.audioEngine.setVolume(this.plot_audio_id, 0);
        } else {
            cc.audioEngine.setVolume(this.plot_audio_id, 1);
        }
        // console.error(this.isMute,this.plot_audio_id,"222222222222222222",cc.audioEngine.getVolume(this.plot_audio_id))
    },

    stopPlotHeroVoice() {
        if(this.plot_audio_id){
            cc.audioEngine.stopEffect(this.plot_audio_id);
        }
    },
    
    finishPlotHeroPlayMusic: function (res_object,id) {
        // cc.audioEngine.stop(id);
        // cc.audioEngine.uncache(res_object);
        var HeroEvent = require("hero_event");
        gcore.GlobalEvent.fire(HeroEvent.Herp_Plot_Voice);
        // console.error("****************",id)
    },

    stopEffectAll:function(){
      cc.audioEngine.stopAllEffects();
    },

    unCacheEffectAll:function(){
      cc.audioEngine.uncacheAll();
    },

    // 播放背景乐
    // playMusic: function(type, name, loop) {
    //     var sound_path = PathTool.getSoundRes(type, name);
    //     if (!sound_path) return;
    //     if (this._cur_bg_music && this._cur_bg_music.res_path == sound_path) return;
    //     this.music_info = {type: type, name: name, loop: loop}
    //     if (!this.music_status) return;

    //     if (this.is_loading) {
    //         if (this.is_loading == sound_path) {
    //             this.wating = null;
    //             return;
    //         } else {
    //             this.wating = sound_path;
    //             return
    //         }
    //     }

    //     cc.log(sound_path);

    //     this.is_loading = sound_path;
    //     LoaderManager.getInstance().loadRes(sound_path, function (sound_path, loop, res_object) {
    //         this.is_loading = null;
    //         cc.log(sound_path,this.music_info.name, "sound_path")
    //         if (res_object) {
    //             if (this._cur_bg_music) {
    //                  // if (this._cur_bg_music.res_path == sound_path) return;
    //                  cc.audioEngine.stop(this._cur_bg_music.audio_id);
    //                  cc.audioEngine.uncache(this._cur_bg_music.res_obj);
    //                  LoaderManager.getInstance().releaseRes(this._cur_bg_music.res_path);
    //             }

    //             // let audio = AudioSourceUi
    //             // audio.clip = res_object
    //             // audio.loop = loop;
    //             // audio.play();
    //              cc.audioEngine.stopAll();
    //             var audio_id =  cc.audioEngine.playEffect(res_object, loop);
    //             var cur_data = {};
    //             cur_data.audio_id = audio_id;
    //             cur_data.res_path = sound_path;
    //             cur_data.res_obj = res_object;
    //             this._cur_bg_music = cur_data;
    //         }

    //         if (this.wating) {
    //             this.playMusic(this.music_info.type, this.music_info.name, this.music_info.loop);
    //             this.wating = null;
    //         }

    //     }.bind(this, sound_path, loop));        
    // },
    stopMusic:function(){
      cc.audioEngine.stopMusic();
    },
    
    pauseMusic:function(){
      cc.audioEngine.pauseMusic();
    },
    // 播放背景乐
    playMusic: function (type, name, loop) {
        var sound_path = PathTool.getSoundRes(type, name);
        if (this._cur_bg_music && this._cur_bg_music.res_path == sound_path) return;
        this.music_info = { type: type, name: name, loop: loop }
        if (!this.music_status) return;

        LoaderManager.getInstance().loadRes(sound_path, function (sound_path, loop, res_object) {
            if (this._cur_bg_music && sound_path == this._cur_bg_music.res_path) return;
            cc.log(sound_path, this.music_info.name, "sound_path")
            if (res_object) {
                if (this._cur_bg_music && window.AudioSourceUi) {
                    AudioSourceUi.stop();
                    LoaderManager.getInstance().releaseRes(this._cur_bg_music.res_path);
                }
                if (!window.AudioSourceUi) {
                    window.AudioSourceUi = cc.find("Canvas/game_views(clone)").addComponent(cc.AudioSource)
                }
                let audio = AudioSourceUi
                audio.clip = res_object
                audio.loop = loop;
                audio.play();
                this._audio = audio;
                // var audio_id =  cc.audioEngine.playEffect(res_object, loop);
                var cur_data = {};
                // cur_data.audio_id = audio;
                cur_data.res_path = sound_path;
                cur_data.res_obj = res_object;
                this._cur_bg_music = cur_data;
            }
        }.bind(this, sound_path, loop));
    },

    getBackgroundVolume: function () {
        if (this._audio) {
            return this._audio.volume
        }
    },

    setBackgroundVolume: function (value) {
        if (this._audio) {
            this._audio.volume = value;
        }
    },
});

SoundManager.getInstance = function () {
    if (!SoundManager.instance) {
        SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
}

module.exports = SoundManager;