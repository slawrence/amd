/*global window, document */
var modules = [];
/**
 * Module lifecycle:
 *  init - created, not executed - waiting on dependencies or a require
 *  defined - executed
 */
(function (global) {
    'use strict';

    var require, define;

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }

    function exists(id) {
        var i;
        if (id) {
            for (i = 0; i < modules.length; i += 1) {
                if (modules[i].id === id) {
                    return true;
                }
            }
        }
        return false;
    }

    //return a module with the specified id
    function get(id) {
        var i;
        if (id) {
            for (i = 0; i < modules.length; i += 1) {
                if (modules[i].id === id) {
                    return modules[i];
                }
            }
        }
    }

    //returns an array of results for a set of module ids
    function getResults(ids) {
        var module, results = [];
        ids.forEach(function (id) {
            module = get(id);
            results.push(module.result);
        });
        return results;
    }

    function check(depend) {
        var i, module;
        for (i = 0; i < depend.length; i += 1) {
            module = get(depend[i]);
            if (!module) {
                return false;
            }
            if (module.status !== 'defined') {
                return false;
            }
        }
        return true;
    }

    //check any modules that might need to be executed now that their dependencies have loaded
    //remove required modules that have executed
    function checkAll() {
        var i, module;
        for (i = 0; i < modules.length; i += 1) {
            module = modules[i];
            if (check(module) && module.status === 'init') {
                loadModule(module);
            }
            if (module.require && check(module) && module.status === 'defined') {
                modules.splice(i, 1);
                i -= 1;
            }
        }
    }

    //execute a module (assumes all dependencies have been loaded)
    function executeModule(module) {
        if (module.status === 'init') {
            if (isFunction(module.callback)) {
                module.result = module.callback.apply({}, getResults(module.depend));
            } else {
                module.result = module.callback;
            }
            module.status = 'defined';
        }
    }

    function inject(id) {
        var head, script;

        head = document.getElementsByTagName('head')[0];
        script = document.createElement("script");

        script.async = true;
        script.type = 'text/javascript';
        script.src = id + ".js";
        script.setAttribute('data-id', id);

        script.onload = function (evt) {
            var module = get(id);
            loadModule(module);
            checkAll();
        };

        head.insertBefore(script, head.firstChild);
    }
    //load a module and all its dependencies
    function loadModule(module) {
        var i, dep_module;
        //load dependencies first
        if (module.depend.length) {
            for (i = 0; i < module.depend.length; i += 1) {
                dep_module = get(module.depend[i]);
                if (!dep_module) {
                    //need to inject the thing
                    inject(module.depend[i]);
                } else {
                    if (dep_module.status === 'defined') {
                        break;
                    }
                    loadModule(dep_module);
                }
            }
        }
        if (check(module.depend)) {
            executeModule(module);
        }
    }

    global.define = function (id, depend, callback) {
        var module;

        //check for anonymous module
        if (typeof id !== 'string') {
            callback = depend;
            depend = id;
            id = null;
        }

        //dependencies not provided
        if (!isArray(depend)) {
            callback = depend;
            depend = [];
        }

        //define module object
        module = {
            id: id,
            depend: depend,
            callback: callback,
            status: 'init'
        };

        if (!exists(module.id)) {
            modules.push(module);
        }
    };

    global.require = function (depend, callback) {
        var i, req;

        //dependencies not provided
        if (!isArray(depend)) {
            callback = depend;
            depend = [];
        }

        req = {
            callback: callback,
            depend: depend,
            require: true,
            status: 'init'
        };

        modules.push(req);

        loadModule(req);
    };

}(this));
