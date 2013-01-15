define('sub/c', function () {
    console.log('executing c');
    return {
        name: 'c'
    };
});

require(['sub/asdf'], function (){
    console.log('executing require');
});

console.log('importing c');
