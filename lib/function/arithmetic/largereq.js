module.exports = function (math, config) {
  var util = require('../../util/index'),

      BigNumber = math.type.BigNumber,
      Complex = require('../../type/Complex'),
      Unit = require('../../type/Unit'),
      collection = require('../../type/collection'),

      isNumber = util.number.isNumber,
      nearlyEqual = util.number.nearlyEqual,
      isBoolean = util['boolean'].isBoolean,
      isString = util.string.isString,
      isComplex = Complex.isComplex,
      isUnit = Unit.isUnit,
      isCollection = collection.isCollection;

  /**
   * Check if value x is larger or equal to y
   *
   *     x >= y
   *     largereq(x, y)
   *
   * For matrices, the function is evaluated element wise.
   *
   * The function returns true when x is larger than y or the relative
   * difference between x and y is smaller than the configured epsilon. The
   * function cannot be used to compare values smaller than approximately 2.22e-16.
   *
   * @param  {Number | BigNumber | Boolean | Unit | String | Array | Matrix} x
   * @param  {Number | BigNumber | Boolean | Unit | String | Array | Matrix} y
   * @return {Boolean | Array | Matrix} res
   */
  math.largereq = function largereq(x, y) {
    if (arguments.length != 2) {
      throw new math.error.ArgumentsError('largereq', arguments.length, 2);
    }

    if (isNumber(x) && isNumber(y)) {
      return nearlyEqual(x, y, config.epsilon) || x > y;
    }

    if (x instanceof BigNumber) {
      // try to convert to big number
      if (isNumber(y)) {
        y = BigNumber.convert(y);
      }
      else if (isBoolean(y)) {
        y = new BigNumber(y ? 1 : 0);
      }

      if (y instanceof BigNumber) {
        return x.gte(y);
      }

      // downgrade to Number
      return largereq(x.toNumber(), y);
    }
    if (y instanceof BigNumber) {
      // try to convert to big number
      if (isNumber(x)) {
        x = BigNumber.convert(x);
      }
      else if (isBoolean(x)) {
        x = new BigNumber(x ? 1 : 0);
      }

      if (x instanceof BigNumber) {
        return x.gte(y)
      }

      // downgrade to Number
      return largereq(x, y.toNumber());
    }

    if ((isUnit(x)) && (isUnit(y))) {
      if (!x.equalBase(y)) {
        throw new Error('Cannot compare units with different base');
      }
      return x.value >= y.value;
    }

    if (isCollection(x) || isCollection(y)) {
      return collection.deepMap2(x, y, largereq);
    }

    // Note: test strings after testing collections,
    // else we can't compare a string with a matrix
    if (isString(x) || isString(y)) {
      return x >= y;
    }

    if (isBoolean(x)) {
      return largereq(+x, y);
    }
    if (isBoolean(y)) {
      return largereq(x, +y);
    }

    if (isComplex(x) || isComplex(y)) {
      throw new TypeError('No ordering relation is defined for complex numbers');
    }

    throw new math.error.UnsupportedTypeError('largereq', math['typeof'](x), math['typeof'](y));
  };
};
