/**
 * Created by MengLei on 2015/7/25.
 */

var m = '2';

test(m);

function test(m) {
    switch (m) {
        case '1':
            console.log('case 1, m = ' + m);
            break;
        case '2':
            console.log('case 2, m = ' + m);
            break;
        case '3':
            console.log('case 3, m = ' + m);
            break;
        default:
            console.log('default, m = ' + m);
            break;
    }
}