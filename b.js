define('b', ['sub/c'], function (c) {
    console.log('executing b');
    return {
        name: 'b',
        cName: c.name
    };
});
console.log('importing b');
