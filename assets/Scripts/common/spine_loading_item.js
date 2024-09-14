var SpineItem = function(anima_id, anima_name, callback) {
	this.anima_id = anima_id;
	this.anima_name = anima_name;
	this.finish_cb = [];
	this.finish_cb.push(callback);
	this.load_finish = false;
	this.startUpdate()
}

var proto = SpineItem.prototype

proto.startUpdate = function() {
	if (H5_RES) {
		var root_url  = this.root_url  = H5_RES + "spine/" + this.anima_id + "/";
		var text_url  = this.text_url  = root_url + this.anima_name + ".text";
		var ske_url   = this.ske_url   = root_url + this.anima_name + ".json";
		var atlas_url = this.atlas_url = root_url + this.anima_name + ".atlas";
		cc.loader.load({ url: text_url, type: 'txt'}, function(err, text_data) {
			if (!err) {
				var texture_names = this.texture_names = this.texture_names = JSON.parse(text_data).testures;
				var textures = [];
				for (var text_i in texture_names) {
					var finish_nb = 0;
					var texture_url = root_url + texture_names[text_i];
					cc.loader.load(texture_url, function(text_i, err, texture_data) {
						if (!err) {
							textures.splice(text_i, 0, texture_data);
							if (textures.length == texture_names.length) {
								cc.loader.load({ url: atlas_url, type: 'txt' }, function(error, atlasJson) {
							        cc.loader.load({ url: ske_url, type: 'txt' }, function(error, spineJson) {
							            var asset = this.asset = new sp.SkeletonData();
							            asset.skeletonJson = spineJson;
							            asset.atlasText = atlasJson;
							            asset.textures = textures;
							            asset.textureNames = texture_names;
							            this.load_finish = true;
							            if (this.finish_cb) {
							            	for (var cb_i in this.finish_cb) {
							            		this.finish_cb[cb_i](asset);
							            	}
							            }
							        }.bind(this));
							    }.bind(this));
							}
						}
					}.bind(this, text_i))
				}
			}
		}.bind(this));		
	}
},

proto.release = function() {
	for (var name_i in this.texture_names) {
		var texture_url = this.root_url + this.texture_names[name_i];
		cc.loader.release(texture_url);
	}

	cc.loader.release(this.text_url);
	cc.loader.release(this.ske_url);
	cc.loader.release(this.atlas_url);

	delete this.asset
},

proto.addCallback = function(callback) {
	if (this.load_finish) {
		callback(this.asset);
		return;
	}
	this.finish_cb.push(callback)
},

module.exports = SpineItem;