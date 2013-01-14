/*global window, document */
var define = define || {};
var modules = modules || [];
(function (global) {
    'use strict';

    //module properties
    //id - id of the module - anon modules will be 'null'
    //fn - callback that defines the module
    //result - result of the callback that defines the module
    //context - the context of the module
    //status:
    //  'wait' - module is waiting for its dependencies to be defined
    //  'defined' - module has been defined and executed

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }

    function isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    //add a module
    function add(module) {
        modules.push(module);
    }

    //check if a module exists in the modules array - anon functions are not checked
    //will return the module if found
    //else will return undefined
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

    function inject(id) {
        var head = document.getElementsByTagName('head')[0],
            script = document.createElement("script");

        //so script must be executed before module is
        script.async = true;
        script.type = 'text/javascript';
        script.src = id + ".js";

        script.onerror = function (e) {
            //may need to implement 404, timeout error
        };

        head.insertBefore(script, head.firstChild);
    }

    //check to see if module exists
    function exists(id) {
        var ret = false;
        if (id) {
            modules.forEach(function (mod) {
                if (mod.id === id) {
                    ret = true;
                }
            });
        }
        return ret;
    }

    //returns an array of results for a set of module ids
    //execute results if it hasn't already been calculated
    function getResults(ids) {
        var module, result, results = [];
        ids.forEach(function (id) {
            module = get(id);
            if (module && module.result === undefined) {
                execute(module);
            }

            if (module) {
                result = module.result;
            } else {
                result = undefined;
            }

            results.push(result);
        });
        return results;
    }

    //execute a module - usually only done with modules with no dependencies
    function execute(module) {
        if (module.status === 'wait') {
            if (isFunction(module.callback)) {
                module.result = module.callback.apply(module.context, getResults(module.depend));
            } else {
                module.result = module.callback;
            }
            module.status = 'defined';
        }
    }

    //load dependencies - checking modules to see if there are results already
    //if not, load a script tag
    function load(depend) {
        var module, i;
        for (i = 0; i < depend.length; i += 1) {
            module = get(depend[i]);
            if (!module) {
                inject(depend[i]);
            }
        }
    }

    define = function (id, depend, callback) {
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
            context: {},
            status: 'wait',
            callback: callback
        };

        // Add to list of modules if the module doesn't already exist
        if (!exists(module.id)) {
            console.log('adding module: ', module.id);
            add(module);
        }

        //if no dependencies, execute
        if (module.depend.length > 0) {
            execute(module);
        }
    };


    if (!global.req) {
        global.req = function (depend, callback) {
            var id = null, module;
            //dependencies not provided
            if (!isArray(depend)) {
                callback = depend;
                depend = [];
            }

            //load dependencies into modules where appropriate
            load(depend);

            //apply this callback, loading results or 'exports' from dependency array
            //callback.apply({}, getResults(depend));
        };

        global.req.config = function (config) {
        
        };
    }

    //required for the spec
    define.amd = {};

}(window));
