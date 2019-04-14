'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}
Rectangle.prototype.getArea = function() {
    return this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    console.log(Object.assign(proto, JSON.parse(json)));
    return Object.setPrototypeOf(JSON.parse(json),proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class cssSelectorBuilder {
    constructor(result = '') {
        this.result = result;
        this.selectors = [];
        this.allowedPrevSelectors = {
            'element': {
                '': 1,
                'id': 0,
                'element': 0,
                'class': 0,
                'attribute': 0,
                'pseudoClass': 0,
                'pseudoElement': 0
            },
            'id': {
                '': 1,
                'id': 0,
                'element': 1,
                'class': 0,
                'attribute': 0,
                'pseudoClass': 0,
                'pseudoElement': 0
            },
            'class': {
                '': 1,
                'id': 1,
                'element': 1,
                'class': Infinity,
                'attribute': 0,
                'pseudoClass': 0,
                'pseudoElement': 0
            },
            'attribute': {
                '': 1,
                'id': 1,
                'element': 1,
                'class': Infinity,
                'attribute': Infinity,
                'pseudoClass': 0,
                'pseudoElement': 0
            },
            'pseudoClass': {
                '': 1,
                'id': 1,
                'element': 1,
                'class': Infinity,
                'attribute': Infinity,
                'pseudoClass': Infinity,
                'pseudoElement': 0
            },
            'pseudoElement': {
                '': 1,
                'element': 1,
                'id': 1,
                'class': Infinity,
                'attribute': Infinity,
                'pseudoClass': Infinity,
                'pseudoElement': 0
            },

        }
    }
    
    canInsert(selector) {
        const counts = {};
        this.selectors.forEach(elem => {
            if (counts[elem] == undefined) {
                counts[elem] = 0;
            }
            counts[elem]++;
            if (this.allowedPrevSelectors[selector][elem] < counts[elem]) {
                throw 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';
            }
        })
    }

    static element(value) {
        return new cssSelectorBuilder().element(value); 
    }

    element(value){
        if (this.hasElement) {
            throw 'Element, id and pseudo-element should not occur more then one time inside the selector';
        }
        this.canInsert('element');
        this.selectors.push('element');
        this.hasElement = true;
        this.result += value;
        return this;
    }

    static id(value) {
        return new cssSelectorBuilder().id(value); 
    }

    id(value) {
        if (this.hasId) {
            throw 'Element, id and pseudo-element should not occur more then one time inside the selector';
        }
        this.canInsert('id');
        this.selectors.push('id');
        this.hasId = true;
        this.result += `#${value}`;
        return this;
    }

    static class(value) {
        return new cssSelectorBuilder().class(value);
    }

    class(value) {
        this.canInsert('class');
        this.selectors.push('class');
        this.result += `.${value}`;
        return this;
    }

    static attr(value) {
        return new cssSelectorBuilder().attr(value);
    }

    attr(value) {
        this.canInsert('attribute');
        this.selectors.push('attribute');
        this.result += `[${value}]`;
        return this;
    }

    static pseudoClass(value) {
        return new cssSelectorBuilder().pseudoClass(value);
    }

    pseudoClass(value) {
        this.canInsert('pseudoClass');
        this.selectors.push('pseudoClass');
        this.result += `:${value}`;
        return this;
    }

    static pseudoElement(value) {
        return new cssSelectorBuilder().pseudoElement(value);
    }

    pseudoElement(value) {
        if (this.hasPseudoElement) {
            throw 'Element, id and pseudo-element should not occur more then one time inside the selector';
        }
        this.canInsert('pseudoElement');
        this.selectors.push('pseudoElement');
        this.hasPseudoElement = true;
        this.result += `::${value}`;
        return this;
    }

    static combine(selector1, combinator, selector2) {
        combinator = ' ' + combinator + ' ';
        return new cssSelectorBuilder(selector1.stringify() + combinator + selector2.stringify());
    }

    stringify() {
        return this.result;
    }
}


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
