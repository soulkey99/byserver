/**
 * Created by MengLei on 2015/3/18.
 */

var _ = require('lodash');

var user = {'a': 'a', 'b': 'b', 'c':'c', 'd':'d', 'e':'e', 'f':'f'};
console.log(_.pick(user, ['a','c','f', 'g']));