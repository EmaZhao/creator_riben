// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      加载资源控制器,到时候直接修改这边就好了
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var FileInfo         = require("fileinfo");
var ZipLoader        = require("ZipLoader");
var PathTool         = require("pathtool");
var DownloadManager  = require("downloadmanager");
var SpineLoadingItem = require("spine_loading_item");

window.LoaderManager = cc.Class({

    properties: {
        // 当前拥有资源管理
        resources_list: {
            default: {}
        },
        //当前已加载数据
        data_list: {
            default: {}
        },
        // 界面资源管理
        reference_key_counter: {    // 界面资源计数
            default: {}
        },
        skeleton_counter: {         // 动画计数
            default: {}
        },
        spine_counter: {
            default: {}
        },
        release_sqe: {
            default: {}
        },
        loading_spines: {
            default: {}
        },
        _sprite_frame_cache: {
            default: {}
        },
        remote_res_cache: {
            default: []
        },
        _prefab_time: 0,
        is_loading: false,
    },

    ctor: function() {
        this.mainloop_timer = gcore.Timer.set(function () {
            this.update(1);
        }.bind(this), 1000, -1);
    },

    statics: {
        instance: null,
    },

    update: function(dt) {
        this._prefab_time += 1;
        if (this._prefab_time % 60 == 0) {
            if (!this.is_loading) {
                this.clearRes();
            }
        }

        if(this._prefab_time % 600 == 0) {
            if(!this.is_loading) {
                this.releaseRemoteRes();
            }
        }

        if(this._prefab_time % 900 == 0) { 
            cc.log("重置资源释放已进行时间为0,避免一直+1");
            this._prefab_time = 0;
        }

        // for (var resi in this.release_sqe) {
        //     this.release_sqe[resi] -= dt;
        //     if (this.release_sqe[resi] < 0) {
        //         this.releseSpienRes(resi);
        //         delete this.release_sqe[resi];
        //     }
        // }
    },

    // 加载资源,比如预制体类的,带上路径后缀,例如:预设体就是.prefab,图集就是.plist,图片就是.png或者.jpg等
    loadRes: function (path, callback) {
        if (path == null) {
            return
        }
        
        var loadInfo = this.getResInfo(path);

        switch (loadInfo.load_type) {
            case cc.Prefab:
                this.loadPrefab(loadInfo.str_key, callback);
            break;

            case cc.SpriteAtlas:
                this.loadAtlas(loadInfo.str_key, callback);
            break;

            case sp.SkeletonData:
                this.loadSpine(loadInfo.str_key, callback);
            break;

            default: {
                this.loadUsuallyRes(loadInfo.str_key, callback, loadInfo.load_type);
            }
        }
    },
    
    loadRemoteRes(remoteUrls, progressCallback, callback) {
        this.is_loading = true;
         cc.loader.load(remoteUrls, (completeCount, totalCount, res)=> {
            const progress = completeCount / totalCount;
            progressCallback && progressCallback(progress);
        }, (errors, textures)=> {
            if(errors) {
                if(Array.isArray(errors)) {
                    for (let i = 0; i < errors.length; i++) {
                        console.error('Error url [' + errors[i] + ']: ' + textures.getError(errors[i]));
                    }
                } else {
                    console.error("Error url", errors);
                }
                return;
            }
            for(let i = 0; i < remoteUrls.length; i++) {
                this.remote_res_cache.push(textures.getContent(remoteUrls[i]).nativeUrl);
            }
            callback && callback(errors, textures);
            this.is_loading = false;
        });
    },
    
    releaseRemoteRes() {
        const len = this.remote_res_cache.length;
        console.error("释放已缓存的远程资源数：", len);
        for(let i = len - 1; i >= 0; i--) {
            const cacheUrl = this.remote_res_cache[i];
            cc.loader.removeItem(cacheUrl);
            this.remote_res_cache.splice(i, 1);
        }
    },
    
    releaseRes: function(path) {
        if (path == null) {
            return
        }
        var loadInfo = this.getResInfo(path);

        switch (loadInfo.load_type) {
            case cc.Prefab:
                this.releasePrefab(loadInfo.str_key);
            break;

            case cc.SpriteAtlas:
                this.releaseAtlas(loadInfo.str_key);
            break;

            case sp.SkeletonData:
                this.releaseSpine(loadInfo.str_key);
            break;

            default: {
                this.releaseUsuallyRes(loadInfo.str_key, loadInfo.load_type);
            }
        }
    },

    loadUsuallyRes: function(path, callback, load_type) {
        // 动态加载界面资源
        // gcore.Timer.set(function(path, callback, load_type) {
            if (path.indexOf("ui_res") > -1) {
                this.is_loading = true;
                cc.loader.loadRes(path, load_type, function (path, errorMessage, resObject) {
                    if (!errorMessage && resObject) {
                        var deps = cc.loader.getDependsRecursively(resObject);
                        for (var dep_i in deps) {
                            this.countReference(deps[dep_i]);
                        }
                        callback(resObject);
                    } else {
                        cc.error(errorMessage, "load usuallyRes faild--->" + path);                          
                    }
                    this.is_loading = false;                    
                }.bind(this, path))

                return
            }

            if (this._sprite_frame_cache[path]) {
                callback(this._sprite_frame_cache[path]);
                return;
            }

            if (this.resources_list[path] && this.resources_list[path]["obj"]) {
                this.resources_list[path]["count"] ++;
                callback(this.resources_list[path]["obj"]);
                return
            }
            cc.loader.loadRes(path, load_type, function (path, errorMessage, resObject) {
                if (!errorMessage) {
                    if (!this.resources_list[path]) {
                        this.resources_list[path] = {};
                        this.resources_list[path]["obj"] = resObject;
                        this.resources_list[path]["count"] = 0;
                    }
                    this.resources_list[path]["count"]++;
                    callback(resObject);
                } else {
                    cc.error(errorMessage, "load usuallyRes faild--->" + path);                          
                }
            }.bind(this, path))
        // }.bind(this, path, callback, load_type), 50, 1)
    },

    releaseUsuallyRes: function(path, res_type) {
        if (this._sprite_frame_cache[path]) {
            return;
        }

        if (path.indexOf("ui_res") > -1) {
            // var res_obj = cc.loader.getRes(path, res_type);

            // if (res_obj) {
            //     var deps = cc.loader.getDependsRecursively(res_obj);
            //     for (var dep_i in deps) {
            //         this.countReference(deps[dep_i], -1);
            //     }
            // }
            return
        }

        if (this.resources_list[path]) {
            -- this.resources_list[path]["count"];
            // if (this.resources_list[path]["count"] <= 0) {
            //     var releay_res = cc.loader.getDependsRecursively(this.resources_list[path]["obj"]);
            //     cc.loader.release(releay_res);
            //     delete this.resources_list[path];
            // }
        }
    },

    // 资源图集可以被加载很多次，但释放只需要一次就可以释放
    loadAtlas: function(path, callback) {
        var atlasObj = cc.loader.getRes(path, cc.SpriteAtlas);
        if (atlasObj) {
            this.countReference(atlasObj);
            callback(atlasObj);
            return
        }
        cc.loader.loadRes(path, cc.SpriteAtlas, function(path, err, atlsObj) {
            if (path) {
                for (var path_i in cacheAtlas) {
                    if (cacheAtlas[path_i] == path) {
                        var spriteFramas = atlsObj.getSpriteFrames()
                        for (var item_i in spriteFramas) {
                            var spriteFrame = spriteFramas[item_i];
                            var itemn_path = "res/item/" + spriteFrame.name;
                            this._sprite_frame_cache[itemn_path] = spriteFrame;
                        }
                        break;
                    }
                }
            }

            if (!err && callback) {
                this.countReference(atlsObj);
                callback(atlsObj);
            } else {
                cc.error(err, "load preafa faild--->" + path);      
            }

        }.bind(this, path));
    },

    releaseAtlas: function(path) {
        var atlasObj = cc.loader.getRes(path);
        if (atlasObj) {
            this.countReference(atlasObj, -1);
        }
    },

    // 加载spine资源
    loadSpine: function(spinePath, callback) {
        if (!spinePath) return;
        if (window.OUT_SPINE) {
            var spine_infos = spinePath.split("/");
            var action = spine_infos.pop();
            var anima_id = spine_infos.pop();
            var loadItem = new SpineLoadingItem(anima_id, action, callback);
        } else {
            if (this.release_sqe[spinePath]) {
                delete this.release_sqe[spinePath];
                this.spine_counter[spinePath] = 0;
            }

            if (!this.loading_spines[spinePath])
                this.loading_spines[spinePath] = true;
            cc.loader.loadRes(spinePath, sp.SkeletonData, function (spinePath, error, resObject) {
                if (!error) {
                    if (this.spine_counter[spinePath] > 0) {
                        this.spine_counter[spinePath] += 1;
                    } else {
                        this.spine_counter[spinePath] = 1;
                    }
                    callback(resObject);

                    if (this.loading_spines[spinePath])
                        delete this.loading_spines[spinePath]
                } else {
                    callback();
                    cc.error(error, "load spine faild--->" + spinePath);
                }
            }.bind(this, spinePath))
        }


    },

    // 释放spine资源
    releaseSpine: function(spinePath) {
        return
        if (!spinePath) return;
        if (this.spine_counter[spinePath] === undefined) {
            return
        }
        if (this.spine_counter[spinePath] > 0)
            -- this.spine_counter[spinePath];

        if (this.spine_counter[spinePath] > 0) return;
        this.releseSpienRes(spinePath);
    },

    delteSpine: function(spinePath) {
        this.releseSpienRes(spinePath)
    },

    releseSpienRes: function(spinePath) {
        if (!this.loading_spines[spinePath]) {
            var skeleton_data = cc.loader.getRes(spinePath, sp.SkeletonData);
            var atlas_data = cc.loader.getRes(spinePath, cc.SpriteAtlas);

            if (skeleton_data) {
                var deps = cc.loader.getDependsRecursively(skeleton_data);
                for (var deps_i in deps) {
                    var depsData  = cc.loader.getRes(deps[deps_i]);
                    cc.loader.release(depsData);
                }
                cc.loader.release(skeleton_data); 
            }
        }
    },

    /**
     * 基于参考key的引用计数
     * @author zhanghuxing 2018-12-20
     * @param  asset 资源对象
     * @param  count 数量
     * @return {[type]}
     */
    countReference: function(assetOrKey, count) {
        if (!assetOrKey) return;
        count = count === undefined ? 1 : count;
        var referenceKey;
        // if (assetOrKey instanceof cc.Asset) {
        //     referenceKey = cc.loader._getReferenceKey(assetOrKey);
        //     if (assetOrKey instanceof cc.SpriteAtlas) {
        //         var dependes = cc.loader.getDependsRecursively(assetOrKey);
        //         for (var keyIndex in dependes) {
        //             this.countReference(dependes[keyIndex], count);
        //         }
        //     }
        // } else {
            referenceKey = assetOrKey;
        // }
        if (!this.reference_key_counter[referenceKey])
            this.reference_key_counter[referenceKey] = 0;
        this.reference_key_counter[referenceKey] += count;

        // if (this.reference_key_counter[referenceKey] <= 0) {
        //     // 释放png资源
        //     cc.loader.release(referenceKey);
        // }
    },

    clearRes: function() {
        cc.log("开始释放没用的预设资源");
        for (var res_key in this.reference_key_counter) {
            if (!this.reference_key_counter[res_key])
                this.reference_key_counter[res_key] = 0;

            if (this.reference_key_counter[res_key] <= 0) {
                // 释放png资源, 注意，这个函数可能会导致资源贴图或资源所依赖的贴图不可用，如果场景中存在节点仍然依赖同样的贴图，它们可能会变黑并报 GL 错误。
                cc.loader.removeItem(res_key);
                delete this.reference_key_counter[res_key]
            }
        }

        for (var res_i in this.resources_list) {
            if (this.resources_list[res_i]["count"] <= 0) {
                var releay_res = cc.loader.getDependsRecursively(this.resources_list[res_i]["obj"]);
                cc.loader.removeItem(releay_res);
                delete this.resources_list[res_i];
            }            
        }
    },

    releaseByReferenceKey: function(referenceKey) {

    },

    // 加载预制资源
    loadPrefab: function(path, callback) {
        if (!window.PREFAB_BUILD) {
            CC_SUPPORT_JIT = false;
            this.is_loading = true;
            cc.loader.loadRes(path, cc.Prefab, function(err, prefab) {
                CC_SUPPORT_JIT = true;
                if (!err) {
                    if ((callback && !game.preload_loading) || path == "prefab/drama/guide_main_view") {
                        var deps = cc.loader.getDependsRecursively(prefab);
                        for (var resIndex in deps) {
                            // var testAsset = cc.loader.getRes(deps[resIndex]);
                            this.countReference(deps[resIndex]);
                        }

                        prefab.data._name=prefab._name+"(clone)";

                        callback(cc.instantiate(prefab));
                    }
                } else {
                    if (callback)
                        callback();
                    cc.error(err, "load preafa faild--->" + path);      
                }
                this.is_loading = false;                
            }.bind(this));
        } else {
            var preafab_info = path.split("/");
            var prefab_name = preafab_info.pop() + "_p";
            var total_name = preafab_info.pop() + "_" + prefab_name;
            cc.loader.loadRes("prefabjs/" + total_name, cc.JsonAsset, function(total_name, err, text_data) {
                var testJS = require(total_name)
                var testObj = new testJS(text_data.json);
                // testObj.node.x = this.rootNd.width * 0.5;
                // testObj.node.y = this.rootNd.height * 0.5;
                callback(testObj.node);
            }.bind(this, total_name))
        }
    },

    // 释放预制资源
    releasePrefab: function(path) {
        var testAsset = cc.loader.getRes(path);
        var deps = cc.loader.getDependsRecursively(testAsset);

        for (var resIndex in deps) {
            var testAsset = cc.loader.getRes(deps[resIndex]);
            this.countReference(deps[resIndex], -1);
        }
    },

    // 释放资源
    deleteRes: function (path) {
        this.releaseRes(path);
        // if (this.resources_list[path]) {
        //     var fileInfo = this.resources_list[path];
        //     fileInfo.decrementLoadNum();
        //     var loadNum = fileInfo.getLoadNum();
        //     if (loadNum <= 0){
        //         cc.loader.releaseRes(fileInfo.url);
        //         fileInfo.deleteMe();
        //         this.resources_list[path] = null;
        //     }
        // }
    },

    getResInfo: function(path) {
        // 资源类型的起始位置下表
        var type_index = path.indexOf(".")
        // 字符串总长度
        var total_num = path.length;
        // 剔除字符串类型的路径
        var str_key = path.substring(0, type_index);
        // 资源纹理格式
        var assets_type = path.substring(type_index, total_num);
        // 需要加载的资源格式
        var load_type = this.getAssetsTypeSuffix(assets_type);
        // 后续这里要加上版本信息以及url路径处理
        
        var resulet = {}
        resulet.str_key = str_key;
        resulet.load_type = load_type;

        return resulet
    },

    getAssetsTypeSuffix: function (suffix){
        switch (suffix) {
            case ".jpg":
            case ".png":
                return cc.SpriteFrame;
            case ".plist":
                return cc.SpriteAtlas;
            case ".mp3":
                return cc.AudioClip;
            case ".atlas":
                return sp.SkeletonData;
            case ".prefab":
                return cc.Prefab;
        }
    },

    initConfigs: function(callback) {
        // var config_zip_url = DATA_URL + "data.zip" + "?" + DATA_VER;
        // 微信小游戏不使用二进制文件
        if (window.DEBUG_Data) {
            var ModuleInfo = require("modulelist");
            var time = gcore.SmartSocket.getTime();
            var data_url = "https://dev-h5-sszg.shiyuegame.com/data/";
            var total_num = 0;
            for (var cfg_i = 0; cfg_i <  ModuleInfo.data_list.length; cfg_i++) {
                var totoal_url = data_url + ModuleInfo.data_list[cfg_i] + ".json" + "?time=" + time;
                cc.loader.load(totoal_url, function(name, err, json_data) {
                    total_num ++
                    if (!err) {
                        Config[name] = json_data;
                    }
                    if (total_num == ModuleInfo.data_list.length) {
                        callback();
                    } else {
                        callback(total_num/ModuleInfo.data_list.length);
                    }
                }.bind(this, ModuleInfo.data_list[cfg_i]))
            }
        } else {
            if (window.IS_LOCAL_TEST) {
                var ModuleInfo = require("modulelist");
                var totalNum = ModuleInfo.data_list.length;
                var finishNum = 0;
                // 是否读日文配置
                let data_id = "data_jp/";
                if(window.Language && window.Language == "chs") {
                    data_id = "data/";
                }
                for (var cfg_i = 0; cfg_i <  ModuleInfo.data_list.length; cfg_i++) {
                    var data_path = data_id + ModuleInfo.data_list[cfg_i];
                    gcore.Timer.set(function(data_path, cfg_i) {
                        cc.loader.loadRes(data_path, cc.JsonAsset, function(name, err, jsonData) {
                            Config[name] = jsonData.json;
                            finishNum ++;

                            // cc.log(Config);

                            if (finishNum == totalNum) {
                                callback();
                            } else {
                                callback(finishNum/totalNum);
                            }
                        }.bind(this, ModuleInfo.data_list[cfg_i]))
                    }.bind(this, data_path, cfg_i), 20 * cfg_i, 1)
                }
            } 
            else {
                // var ModuleInfo = require("modulelist");
                var time = gcore.SmartSocket.getTime();
                // var data_url = window.DATA_JP_URL;
                // var total_num = 0;
                // for (var cfg_i = 0; cfg_i <  ModuleInfo.data_list.length; cfg_i++) {
                //     var totoal_url = data_url + ModuleInfo.data_list[cfg_i] + ".json" + "?time=" + time;
                //     cc.loader.load(totoal_url, function(name, err, json_data) {
                //         total_num ++
                //         if (!err) {
                //             Config[name] = json_data;
                //         }
                //         if (total_num == ModuleInfo.data_list.length) {
                //             callback();
                //         } else {
                //             callback(total_num/ModuleInfo.data_list.length);
                //         }
                //     }.bind(this, ModuleInfo.data_list[cfg_i]))
                // }
                // return;
                ZipLoader.RegisterZipLoader();
                // 是否读日文配置
                var count = 8;
                let path = window.DATA_JP_URL +"data_jp.zip"+ "?time=" + time;
                if(window.Language && window.Language == "chs") {
                    path = "resources/data/data.zip";
                    count = 5;
                }

                var data_path = path
                cc.loader.load(data_path, function(errors, zipData) {
                    var JSZip = require("jszip");
                    if (errors) {
                      console.error("zipData===>error, 远程加载失败，加载本地配置表");
                      return;
                    }
                    zipData = new JSZip(zipData, {checkCRC32:false});
                    if (zipData) {
                        var total_num = 0;
                        var cur_num = 0;
                        for (var data_i in zipData.files) {
                            total_num ++;
                            if(data_i == "data_jp/"||data_i == "data/") continue;
                            gcore.Timer.set(function(data_i, cur_num) {
                                var data =  JSON.parse(zipData.files[data_i].asText());                    
                                var file_name = data_i.substring(count, data_i.length - 5)
                                Config[file_name] = data;

                                var progress = cur_num / 66;
                                callback(progress);
                                if (cur_num >= total_num && cur_num >0) {
                                    if (callback)
                                        callback();
                                }
                            }.bind(this, data_i, total_num), 20 * total_num, 1)
                        }
                    }
                }.bind(this))        
            }
        }
    },

    initConfigScript: function(finish_cb) {
        // 发布版本，需要加载合并后json后的JS文件
        if (window.USE_MERGE_JSON) {
            var data_path ="src/merge_json" + (window.PACKAGE_VERSION || "") +  ".js";
            // var data_path = "src/merge_json" + ".js";            
            console.log("___json==>",data_path)
            cc.loader.load(data_path, function(err, data) {
                if (data) {
                    console.log("加载merge成功");
                    // console.log(window.ImportConfigs)
                }

                if (err) {
                    console.log("加载merge_json失败");
                    console.log(err);
                }

            });
        }
    },
});

LoaderManager.getInstance = function () {
    if (!LoaderManager.instance) {
        LoaderManager.instance = new LoaderManager();
    }
    return LoaderManager.instance;
}

module.exports = LoaderManager;