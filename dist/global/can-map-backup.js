/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can-map-backup@3.0.0-pre.2#can-map-backup*/
define('can-map-backup', function (require, exports, module) {
    var compute = require('can-compute');
    var CanMap = require('can-map');
    var compare = require('can-set/src/compare');
    var assign = require('can-util/js/assign/assign');
    var flatProps = function (a, cur) {
        var obj = {};
        for (var prop in a) {
            if (typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date) {
                obj[prop] = a[prop];
            } else {
                obj[prop] = cur.attr(prop);
            }
        }
        return obj;
    };
    var oldSetup = CanMap.prototype.setup;
    assign(CanMap.prototype, {
        setup: function () {
            this._backupStore = compute();
            return oldSetup.apply(this, arguments);
        },
        backup: function () {
            this._backupStore(this.attr());
            return this;
        },
        isDirty: function (checkAssociations) {
            var backupStore = this._backupStore();
            if (!backupStore) {
                return false;
            }
            var currentValue = this.attr();
            var aParent, bParent, parentProp;
            var compares = {};
            var options = { deep: !!checkAssociations };
            return !compare.equal(currentValue, backupStore, aParent, bParent, parentProp, compares, options);
        },
        restore: function (restoreAssociations) {
            var props = restoreAssociations ? this._backupStore() : flatProps(this._backupStore(), this);
            if (this.isDirty(restoreAssociations)) {
                this.attr(props, true);
            }
            return this;
        }
    });
    module.exports = exports = CanMap;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();