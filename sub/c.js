define('sub/c', function () {
    return {
        name: 'c'
    };
});

//need to support relative refs
require(['sub/asdf'], function (){
    console.log('executing require');
});

