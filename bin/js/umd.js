(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.listComponent = f()
    }
})(function() {
        var define, module, exports;
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BSTreeKV_1 = require("./BSTreeKV");
/**
 * Special-case of the binary search tree in which the search key is equal to the element type.
 * This definition is suitable when the element type can not be split between what defines its order
 * and what does not (eg. primitive types as opposed to indexed records).
 *
 * The table below shows some use-case examples for both interfaces:
 *
 *           element type              |  most suitable interface
 * ------------------------------------|----------------------------
 *    number                           |  BSTree<number>
 *    string                           |  BSTree<string>
 * { order: number, data: string }     |  BSTreeKV<{order: number}, {order: number, data: string}>
 *
 * @see BSTreeKV
 */
var BSTree = /** @class */ (function (_super) {
    __extends(BSTree, _super);
    function BSTree() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BSTree;
}(BSTreeKV_1.default));
exports.default = BSTree;

},{"./BSTreeKV":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var Queue_1 = require("./Queue");
/**
 * General binary search tree implementation.
 *
 * This interface allows one to search elements using a subset of their attributes (thus the
 * tree can be used as an index for complex objects).
 * The attributes required to define an ordering in the tree must be defined in the type K.
 * Any additional attribute must be defined in the type V.
 *
 * @see BSTree
 */
var BSTreeKV = /** @class */ (function () {
    /**
     * Creates an empty binary search tree.
     * @class <p>A binary search tree is a binary tree in which each
     * internal node stores an element such that the elements stored in the
     * left subtree are less than it and the elements
     * stored in the right subtree are greater.</p>
     * <p>Formally, a binary search tree is a node-based binary tree data structure which
     * has the following properties:</p>
     * <ul>
     * <li>The left subtree of a node contains only nodes with elements less
     * than the node's element</li>
     * <li>The right subtree of a node contains only nodes with elements greater
     * than the node's element</li>
     * <li>Both the left and right subtrees must also be binary search trees.</li>
     * </ul>
     * <p>If the inserted elements are custom objects a compare function must
     * be provided at construction time, otherwise the <=, === and >= operators are
     * used to compare elements. Example:</p>
     * <pre>
     * function compare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return -1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return 1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     * @constructor
     * @param {function(Object,Object):number=} compareFunction optional
     * function used to compare two elements. Must return a negative integer,
     * zero, or a positive integer as the first argument is less than, equal to,
     * or greater than the second.
     */
    function BSTreeKV(compareFunction) {
        this.root = null;
        this.compare = compareFunction || util.defaultCompare;
        this.nElements = 0;
    }
    /**
     * Adds the specified element to this tree if it is not already present.
     * @param {Object} element the element to insert.
     * @return {boolean} true if this tree did not already contain the specified element.
     */
    BSTreeKV.prototype.add = function (element) {
        if (util.isUndefined(element)) {
            return false;
        }
        if (this.insertNode(this.createNode(element)) !== null) {
            this.nElements++;
            return true;
        }
        return false;
    };
    /**
     * Removes all of the elements from this tree.
     */
    BSTreeKV.prototype.clear = function () {
        this.root = null;
        this.nElements = 0;
    };
    /**
     * Returns true if this tree contains no elements.
     * @return {boolean} true if this tree contains no elements.
     */
    BSTreeKV.prototype.isEmpty = function () {
        return this.nElements === 0;
    };
    /**
     * Returns the number of elements in this tree.
     * @return {number} the number of elements in this tree.
     */
    BSTreeKV.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this tree contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this tree contains the specified element,
     * false otherwise.
     */
    BSTreeKV.prototype.contains = function (element) {
        if (util.isUndefined(element)) {
            return false;
        }
        return this.searchNode(this.root, element) !== null;
    };
    /**
     * Looks for the value with the provided search key.
     * @param {Object} element The key to look for
     * @return {Object} The value found or undefined if it was not found.
     */
    BSTreeKV.prototype.search = function (element) {
        var ret = this.searchNode(this.root, element);
        if (ret === null) {
            return undefined;
        }
        return ret.element;
    };
    /**
     * Removes the specified element from this tree if it is present.
     * @return {boolean} true if this tree contained the specified element.
     */
    BSTreeKV.prototype.remove = function (element) {
        var node = this.searchNode(this.root, element);
        if (node === null) {
            return false;
        }
        this.removeNode(node);
        this.nElements--;
        return true;
    };
    /**
     * Executes the provided function once for each element present in this tree in
     * in-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.inorderTraversal = function (callback) {
        this.inorderTraversalAux(this.root, callback, {
            stop: false
        });
    };
    /**
     * Executes the provided function once for each element present in this tree in pre-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.preorderTraversal = function (callback) {
        this.preorderTraversalAux(this.root, callback, {
            stop: false
        });
    };
    /**
     * Executes the provided function once for each element present in this tree in post-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.postorderTraversal = function (callback) {
        this.postorderTraversalAux(this.root, callback, {
            stop: false
        });
    };
    /**
     * Executes the provided function once for each element present in this tree in
     * level-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.levelTraversal = function (callback) {
        this.levelTraversalAux(this.root, callback);
    };
    /**
     * Returns the minimum element of this tree.
     * @return {*} the minimum element of this tree or undefined if this tree is
     * is empty.
     */
    BSTreeKV.prototype.minimum = function () {
        if (this.isEmpty() || this.root === null) {
            return undefined;
        }
        return this.minimumAux(this.root).element;
    };
    /**
     * Returns the maximum element of this tree.
     * @return {*} the maximum element of this tree or undefined if this tree is
     * is empty.
     */
    BSTreeKV.prototype.maximum = function () {
        if (this.isEmpty() || this.root === null) {
            return undefined;
        }
        return this.maximumAux(this.root).element;
    };
    /**
     * Executes the provided function once for each element present in this tree in inorder.
     * Equivalent to inorderTraversal.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    BSTreeKV.prototype.forEach = function (callback) {
        this.inorderTraversal(callback);
    };
    /**
     * Returns an array containing all of the elements in this tree in in-order.
     * @return {Array} an array containing all of the elements in this tree in in-order.
     */
    BSTreeKV.prototype.toArray = function () {
        var array = [];
        this.inorderTraversal(function (element) {
            array.push(element);
            return true;
        });
        return array;
    };
    /**
     * Returns the height of this tree.
     * @return {number} the height of this tree or -1 if is empty.
     */
    BSTreeKV.prototype.height = function () {
        return this.heightAux(this.root);
    };
    /**
    * @private
    */
    BSTreeKV.prototype.searchNode = function (node, element) {
        var cmp = 1;
        while (node !== null && cmp !== 0) {
            cmp = this.compare(element, node.element);
            if (cmp < 0) {
                node = node.leftCh;
            }
            else if (cmp > 0) {
                node = node.rightCh;
            }
        }
        return node;
    };
    /**
    * @private
    */
    BSTreeKV.prototype.transplant = function (n1, n2) {
        if (n1.parent === null) {
            this.root = n2;
        }
        else if (n1 === n1.parent.leftCh) {
            n1.parent.leftCh = n2;
        }
        else {
            n1.parent.rightCh = n2;
        }
        if (n2 !== null) {
            n2.parent = n1.parent;
        }
    };
    /**
    * @private
    */
    BSTreeKV.prototype.removeNode = function (node) {
        if (node.leftCh === null) {
            this.transplant(node, node.rightCh);
        }
        else if (node.rightCh === null) {
            this.transplant(node, node.leftCh);
        }
        else {
            var y = this.minimumAux(node.rightCh);
            if (y.parent !== node) {
                this.transplant(y, y.rightCh);
                y.rightCh = node.rightCh;
                y.rightCh.parent = y;
            }
            this.transplant(node, y);
            y.leftCh = node.leftCh;
            y.leftCh.parent = y;
        }
    };
    /**
    * @private
    */
    BSTreeKV.prototype.inorderTraversalAux = function (node, callback, signal) {
        if (node === null || signal.stop) {
            return;
        }
        this.inorderTraversalAux(node.leftCh, callback, signal);
        if (signal.stop) {
            return;
        }
        signal.stop = callback(node.element) === false;
        if (signal.stop) {
            return;
        }
        this.inorderTraversalAux(node.rightCh, callback, signal);
    };
    /**
    * @private
    */
    BSTreeKV.prototype.levelTraversalAux = function (node, callback) {
        var queue = new Queue_1.default();
        if (node !== null) {
            queue.enqueue(node);
        }
        node = queue.dequeue() || null;
        while (node != null) {
            if (callback(node.element) === false) {
                return;
            }
            if (node.leftCh !== null) {
                queue.enqueue(node.leftCh);
            }
            if (node.rightCh !== null) {
                queue.enqueue(node.rightCh);
            }
            node = queue.dequeue() || null;
        }
    };
    /**
    * @private
    */
    BSTreeKV.prototype.preorderTraversalAux = function (node, callback, signal) {
        if (node === null || signal.stop) {
            return;
        }
        signal.stop = callback(node.element) === false;
        if (signal.stop) {
            return;
        }
        this.preorderTraversalAux(node.leftCh, callback, signal);
        if (signal.stop) {
            return;
        }
        this.preorderTraversalAux(node.rightCh, callback, signal);
    };
    /**
    * @private
    */
    BSTreeKV.prototype.postorderTraversalAux = function (node, callback, signal) {
        if (node === null || signal.stop) {
            return;
        }
        this.postorderTraversalAux(node.leftCh, callback, signal);
        if (signal.stop) {
            return;
        }
        this.postorderTraversalAux(node.rightCh, callback, signal);
        if (signal.stop) {
            return;
        }
        signal.stop = callback(node.element) === false;
    };
    BSTreeKV.prototype.minimumAux = function (node) {
        while (node != null && node.leftCh !== null) {
            node = node.leftCh;
        }
        return node;
    };
    BSTreeKV.prototype.maximumAux = function (node) {
        while (node != null && node.rightCh !== null) {
            node = node.rightCh;
        }
        return node;
    };
    /**
      * @private
      */
    BSTreeKV.prototype.heightAux = function (node) {
        if (node === null) {
            return -1;
        }
        return Math.max(this.heightAux(node.leftCh), this.heightAux(node.rightCh)) + 1;
    };
    /*
    * @private
    */
    BSTreeKV.prototype.insertNode = function (node) {
        var parent = null;
        var position = this.root;
        while (position !== null) {
            var cmp = this.compare(node.element, position.element);
            if (cmp === 0) {
                return null;
            }
            else if (cmp < 0) {
                parent = position;
                position = position.leftCh;
            }
            else {
                parent = position;
                position = position.rightCh;
            }
        }
        node.parent = parent;
        if (parent === null) {
            // tree is empty
            this.root = node;
        }
        else if (this.compare(node.element, parent.element) < 0) {
            parent.leftCh = node;
        }
        else {
            parent.rightCh = node;
        }
        return node;
    };
    /**
    * @private
    */
    BSTreeKV.prototype.createNode = function (element) {
        return {
            element: element,
            leftCh: null,
            rightCh: null,
            parent: null
        };
    };
    return BSTreeKV;
}());
exports.default = BSTreeKV;

},{"./Queue":12,"./util":16}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var Dictionary_1 = require("./Dictionary");
var Set_1 = require("./Set");
var Bag = /** @class */ (function () {
    /**
     * Creates an empty bag.
     * @class <p>A bag is a special kind of set in which members are
     * allowed to appear more than once.</p>
     * <p>If the inserted elements are custom objects a function
     * which converts elements to unique strings must be provided. Example:</p>
     *
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     *
     * @constructor
     * @param {function(Object):string=} toStrFunction optional function used
     * to convert elements to strings. If the elements aren't strings or if toString()
     * is not appropriate, a custom function which receives an object and returns a
     * unique string must be provided.
     */
    function Bag(toStrFunction) {
        this.toStrF = toStrFunction || util.defaultToString;
        this.dictionary = new Dictionary_1.default(this.toStrF);
        this.nElements = 0;
    }
    /**
    * Adds nCopies of the specified object to this bag.
    * @param {Object} element element to add.
    * @param {number=} nCopies the number of copies to add, if this argument is
    * undefined 1 copy is added.
    * @return {boolean} true unless element is undefined.
    */
    Bag.prototype.add = function (element, nCopies) {
        if (nCopies === void 0) { nCopies = 1; }
        if (util.isUndefined(element) || nCopies <= 0) {
            return false;
        }
        if (!this.contains(element)) {
            var node = {
                value: element,
                copies: nCopies
            };
            this.dictionary.setValue(element, node);
        }
        else {
            this.dictionary.getValue(element).copies += nCopies;
        }
        this.nElements += nCopies;
        return true;
    };
    /**
    * Counts the number of copies of the specified object in this bag.
    * @param {Object} element the object to search for..
    * @return {number} the number of copies of the object, 0 if not found
    */
    Bag.prototype.count = function (element) {
        if (!this.contains(element)) {
            return 0;
        }
        else {
            return this.dictionary.getValue(element).copies;
        }
    };
    /**
     * Returns true if this bag contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this bag contains the specified element,
     * false otherwise.
     */
    Bag.prototype.contains = function (element) {
        return this.dictionary.containsKey(element);
    };
    /**
    * Removes nCopies of the specified object to this bag.
    * If the number of copies to remove is greater than the actual number
    * of copies in the Bag, all copies are removed.
    * @param {Object} element element to remove.
    * @param {number=} nCopies the number of copies to remove, if this argument is
    * undefined 1 copy is removed.
    * @return {boolean} true if at least 1 element was removed.
    */
    Bag.prototype.remove = function (element, nCopies) {
        if (nCopies === void 0) { nCopies = 1; }
        if (util.isUndefined(element) || nCopies <= 0) {
            return false;
        }
        if (!this.contains(element)) {
            return false;
        }
        else {
            var node = this.dictionary.getValue(element);
            if (nCopies > node.copies) {
                this.nElements -= node.copies;
            }
            else {
                this.nElements -= nCopies;
            }
            node.copies -= nCopies;
            if (node.copies <= 0) {
                this.dictionary.remove(element);
            }
            return true;
        }
    };
    /**
     * Returns an array containing all of the elements in this big in arbitrary order,
     * including multiple copies.
     * @return {Array} an array containing all of the elements in this bag.
     */
    Bag.prototype.toArray = function () {
        var a = [];
        var values = this.dictionary.values();
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var node = values_1[_i];
            var element = node.value;
            var copies = node.copies;
            for (var j = 0; j < copies; j++) {
                a.push(element);
            }
        }
        return a;
    };
    /**
     * Returns a set of unique elements in this bag.
     * @return {collections.Set<T>} a set of unique elements in this bag.
     */
    Bag.prototype.toSet = function () {
        var toret = new Set_1.default(this.toStrF);
        var elements = this.dictionary.values();
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var ele = elements_1[_i];
            var value = ele.value;
            toret.add(value);
        }
        return toret;
    };
    /**
     * Executes the provided function once for each element
     * present in this bag, including multiple copies.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element. To break the iteration you can
     * optionally return false.
     */
    Bag.prototype.forEach = function (callback) {
        this.dictionary.forEach(function (k, v) {
            var value = v.value;
            var copies = v.copies;
            for (var i = 0; i < copies; i++) {
                if (callback(value) === false) {
                    return false;
                }
            }
            return true;
        });
    };
    /**
     * Returns the number of elements in this bag.
     * @return {number} the number of elements in this bag.
     */
    Bag.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this bag contains no elements.
     * @return {boolean} true if this bag contains no elements.
     */
    Bag.prototype.isEmpty = function () {
        return this.nElements === 0;
    };
    /**
     * Removes all of the elements from this bag.
     */
    Bag.prototype.clear = function () {
        this.nElements = 0;
        this.dictionary.clear();
    };
    return Bag;
}()); // End of bag
exports.default = Bag;

},{"./Dictionary":4,"./Set":13,"./util":16}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var Dictionary = /** @class */ (function () {
    /**
     * Creates an empty dictionary.
     * @class <p>Dictionaries map keys to values; each key can map to at most one value.
     * This implementation accepts any kind of objects as keys.</p>
     *
     * <p>If the keys are custom objects a function which converts keys to unique
     * strings must be provided. Example:</p>
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     * @constructor
     * @param {function(Object):string=} toStrFunction optional function used
     * to convert keys to strings. If the keys aren't strings or if toString()
     * is not appropriate, a custom function which receives a key and returns a
     * unique string must be provided.
     */
    function Dictionary(toStrFunction) {
        this.table = {};
        this.nElements = 0;
        this.toStr = toStrFunction || util.defaultToString;
    }
    /**
     * Returns the value to which this dictionary maps the specified key.
     * Returns undefined if this dictionary contains no mapping for this key.
     * @param {Object} key key whose associated value is to be returned.
     * @return {*} the value to which this dictionary maps the specified key or
     * undefined if the map contains no mapping for this key.
     */
    Dictionary.prototype.getValue = function (key) {
        var pair = this.table['$' + this.toStr(key)];
        if (util.isUndefined(pair)) {
            return undefined;
        }
        return pair.value;
    };
    /**
     * Associates the specified value with the specified key in this dictionary.
     * If the dictionary previously contained a mapping for this key, the old
     * value is replaced by the specified value.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} value value to be associated with the specified key.
     * @return {*} previous value associated with the specified key, or undefined if
     * there was no mapping for the key or if the key/value are undefined.
     */
    Dictionary.prototype.setValue = function (key, value) {
        if (util.isUndefined(key) || util.isUndefined(value)) {
            return undefined;
        }
        var ret;
        var k = '$' + this.toStr(key);
        var previousElement = this.table[k];
        if (util.isUndefined(previousElement)) {
            this.nElements++;
            ret = undefined;
        }
        else {
            ret = previousElement.value;
        }
        this.table[k] = {
            key: key,
            value: value
        };
        return ret;
    };
    /**
     * Removes the mapping for this key from this dictionary if it is present.
     * @param {Object} key key whose mapping is to be removed from the
     * dictionary.
     * @return {*} previous value associated with specified key, or undefined if
     * there was no mapping for key.
     */
    Dictionary.prototype.remove = function (key) {
        var k = '$' + this.toStr(key);
        var previousElement = this.table[k];
        if (!util.isUndefined(previousElement)) {
            delete this.table[k];
            this.nElements--;
            return previousElement.value;
        }
        return undefined;
    };
    /**
     * Returns an array containing all of the keys in this dictionary.
     * @return {Array} an array containing all of the keys in this dictionary.
     */
    Dictionary.prototype.keys = function () {
        var array = [];
        for (var name_1 in this.table) {
            if (util.has(this.table, name_1)) {
                var pair = this.table[name_1];
                array.push(pair.key);
            }
        }
        return array;
    };
    /**
     * Returns an array containing all of the values in this dictionary.
     * @return {Array} an array containing all of the values in this dictionary.
     */
    Dictionary.prototype.values = function () {
        var array = [];
        for (var name_2 in this.table) {
            if (util.has(this.table, name_2)) {
                var pair = this.table[name_2];
                array.push(pair.value);
            }
        }
        return array;
    };
    /**
    * Executes the provided function once for each key-value pair
    * present in this dictionary.
    * @param {function(Object,Object):*} callback function to execute, it is
    * invoked with two arguments: key and value. To break the iteration you can
    * optionally return false.
    */
    Dictionary.prototype.forEach = function (callback) {
        for (var name_3 in this.table) {
            if (util.has(this.table, name_3)) {
                var pair = this.table[name_3];
                var ret = callback(pair.key, pair.value);
                if (ret === false) {
                    return;
                }
            }
        }
    };
    /**
     * Returns true if this dictionary contains a mapping for the specified key.
     * @param {Object} key key whose presence in this dictionary is to be
     * tested.
     * @return {boolean} true if this dictionary contains a mapping for the
     * specified key.
     */
    Dictionary.prototype.containsKey = function (key) {
        return !util.isUndefined(this.getValue(key));
    };
    /**
    * Removes all mappings from this dictionary.
    * @this {collections.Dictionary}
    */
    Dictionary.prototype.clear = function () {
        this.table = {};
        this.nElements = 0;
    };
    /**
     * Returns the number of keys in this dictionary.
     * @return {number} the number of key-value mappings in this dictionary.
     */
    Dictionary.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this dictionary contains no mappings.
     * @return {boolean} true if this dictionary contains no mappings.
     */
    Dictionary.prototype.isEmpty = function () {
        return this.nElements <= 0;
    };
    Dictionary.prototype.toString = function () {
        var toret = '{';
        this.forEach(function (k, v) {
            toret += "\n\t" + k + " : " + v;
        });
        return toret + '\n}';
    };
    return Dictionary;
}()); // End of dictionary
exports.default = Dictionary;

},{"./util":16}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Dictionary_1 = require("./Dictionary");
var util = require("./util");
var FactoryDictionary = /** @class */ (function (_super) {
    __extends(FactoryDictionary, _super);
    /**
     * Creates an empty dictionary.
     * @class <p>Dictionaries map keys to values; each key can map to at most one value.
     * This implementation accepts any kind of objects as keys.</p>
     *
     * <p>The default factory function should return a new object of the provided
     * type. Example:</p>
     * <pre>
     * function petFactory() {
     *  return new Pet();
     * }
     * </pre>
     *
     * <p>If the keys are custom objects a function which converts keys to unique
     * strings must be provided. Example:</p>
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     * @constructor
     * @param {function():V=} defaultFactoryFunction function used to create a
     * default object.
     * @param {function(Object):string=} toStrFunction optional function used
     * to convert keys to strings. If the keys aren't strings or if toString()
     * is not appropriate, a custom function which receives a key and returns a
     * unique string must be provided.
     */
    function FactoryDictionary(defaultFactoryFunction, toStrFunction) {
        var _this = _super.call(this, toStrFunction) || this;
        _this.defaultFactoryFunction = defaultFactoryFunction;
        return _this;
    }
    /**
     * Associates the specified default value with the specified key in this dictionary,
     * if it didn't contain the key yet. If the key existed, the existing value will be used.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} defaultValue default value to be associated with the specified key.
     * @return {*} previous value associated with the specified key, or the default value,
     * if the key didn't exist yet.
     */
    FactoryDictionary.prototype.setDefault = function (key, defaultValue) {
        var currentValue = _super.prototype.getValue.call(this, key);
        if (util.isUndefined(currentValue)) {
            this.setValue(key, defaultValue);
            return defaultValue;
        }
        return currentValue;
    };
    /**
     * Returns the value to which this dictionary maps the specified key.
     * Returns a default value created by the factory passed in the constructor,
     * if this dictionary contains no mapping for this key. The missing key will
     * automatically be added to the dictionary.
     * @param {Object} key key whose associated value is to be returned.
     * @return {*} the value to which this dictionary maps the specified key or
     * a default value if the map contains no mapping for this key.
     */
    FactoryDictionary.prototype.getValue = function (key) {
        return this.setDefault(key, this.defaultFactoryFunction());
    };
    return FactoryDictionary;
}(Dictionary_1.default));
exports.default = FactoryDictionary;

},{"./Dictionary":4,"./util":16}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collections = require("./util");
var arrays = require("./arrays");
var Heap = /** @class */ (function () {
    /**
     * Creates an empty Heap.
     * @class
     * <p>A heap is a binary tree, where the nodes maintain the heap property:
     * each node is smaller than each of its children and therefore a MinHeap
     * This implementation uses an array to store elements.</p>
     * <p>If the inserted elements are custom objects a compare function must be provided,
     *  at construction time, otherwise the <=, === and >= operators are
     * used to compare elements. Example:</p>
     *
     * <pre>
     * function compare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return -1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return 1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     *
     * <p>If a Max-Heap is wanted (greater elements on top) you can a provide a
     * reverse compare function to accomplish that behavior. Example:</p>
     *
     * <pre>
     * function reverseCompare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return 1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return -1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     *
     * @constructor
     * @param {function(Object,Object):number=} compareFunction optional
     * function used to compare two elements. Must return a negative integer,
     * zero, or a positive integer as the first argument is less than, equal to,
     * or greater than the second.
     */
    function Heap(compareFunction) {
        /**
         * Array used to store the elements of the heap.
         * @type {Array.<Object>}
         * @private
         */
        this.data = [];
        this.compare = compareFunction || collections.defaultCompare;
    }
    /**
     * Returns the index of the left child of the node at the given index.
     * @param {number} nodeIndex The index of the node to get the left child
     * for.
     * @return {number} The index of the left child.
     * @private
     */
    Heap.prototype.leftChildIndex = function (nodeIndex) {
        return (2 * nodeIndex) + 1;
    };
    /**
     * Returns the index of the right child of the node at the given index.
     * @param {number} nodeIndex The index of the node to get the right child
     * for.
     * @return {number} The index of the right child.
     * @private
     */
    Heap.prototype.rightChildIndex = function (nodeIndex) {
        return (2 * nodeIndex) + 2;
    };
    /**
     * Returns the index of the parent of the node at the given index.
     * @param {number} nodeIndex The index of the node to get the parent for.
     * @return {number} The index of the parent.
     * @private
     */
    Heap.prototype.parentIndex = function (nodeIndex) {
        return Math.floor((nodeIndex - 1) / 2);
    };
    /**
     * Returns the index of the smaller child node (if it exists).
     * @param {number} leftChild left child index.
     * @param {number} rightChild right child index.
     * @return {number} the index with the minimum value or -1 if it doesn't
     * exists.
     * @private
     */
    Heap.prototype.minIndex = function (leftChild, rightChild) {
        if (rightChild >= this.data.length) {
            if (leftChild >= this.data.length) {
                return -1;
            }
            else {
                return leftChild;
            }
        }
        else {
            if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                return leftChild;
            }
            else {
                return rightChild;
            }
        }
    };
    /**
     * Moves the node at the given index up to its proper place in the heap.
     * @param {number} index The index of the node to move up.
     * @private
     */
    Heap.prototype.siftUp = function (index) {
        var parent = this.parentIndex(index);
        while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
            arrays.swap(this.data, parent, index);
            index = parent;
            parent = this.parentIndex(index);
        }
    };
    /**
     * Moves the node at the given index down to its proper place in the heap.
     * @param {number} nodeIndex The index of the node to move down.
     * @private
     */
    Heap.prototype.siftDown = function (nodeIndex) {
        //smaller child index
        var min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
        while (min >= 0 && this.compare(this.data[nodeIndex], this.data[min]) > 0) {
            arrays.swap(this.data, min, nodeIndex);
            nodeIndex = min;
            min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
        }
    };
    /**
     * Retrieves but does not remove the root element of this heap.
     * @return {*} The value at the root of the heap. Returns undefined if the
     * heap is empty.
     */
    Heap.prototype.peek = function () {
        if (this.data.length > 0) {
            return this.data[0];
        }
        else {
            return undefined;
        }
    };
    /**
     * Adds the given element into the heap.
     * @param {*} element the element.
     * @return true if the element was added or fals if it is undefined.
     */
    Heap.prototype.add = function (element) {
        if (collections.isUndefined(element)) {
            return false;
        }
        this.data.push(element);
        this.siftUp(this.data.length - 1);
        return true;
    };
    /**
     * Retrieves and removes the root element of this heap.
     * @return {*} The value removed from the root of the heap. Returns
     * undefined if the heap is empty.
     */
    Heap.prototype.removeRoot = function () {
        if (this.data.length > 0) {
            var obj = this.data[0];
            this.data[0] = this.data[this.data.length - 1];
            this.data.splice(this.data.length - 1, 1);
            if (this.data.length > 0) {
                this.siftDown(0);
            }
            return obj;
        }
        return undefined;
    };
    /**
     * Returns true if this heap contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this Heap contains the specified element, false
     * otherwise.
     */
    Heap.prototype.contains = function (element) {
        var equF = collections.compareToEquals(this.compare);
        return arrays.contains(this.data, element, equF);
    };
    /**
     * Returns the number of elements in this heap.
     * @return {number} the number of elements in this heap.
     */
    Heap.prototype.size = function () {
        return this.data.length;
    };
    /**
     * Checks if this heap is empty.
     * @return {boolean} true if and only if this heap contains no items; false
     * otherwise.
     */
    Heap.prototype.isEmpty = function () {
        return this.data.length <= 0;
    };
    /**
     * Removes all of the elements from this heap.
     */
    Heap.prototype.clear = function () {
        this.data.length = 0;
    };
    /**
     * Executes the provided function once for each element present in this heap in
     * no particular order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    Heap.prototype.forEach = function (callback) {
        arrays.forEach(this.data, callback);
    };
    return Heap;
}());
exports.default = Heap;

},{"./arrays":15,"./util":16}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Dictionary_1 = require("./Dictionary");
var util = require("./util");
/**
 * This class is used by the LinkedDictionary Internally
 * Has to be a class, not an interface, because it needs to have
 * the 'unlink' function defined.
 */
var LinkedDictionaryPair = /** @class */ (function () {
    function LinkedDictionaryPair(key, value) {
        this.key = key;
        this.value = value;
    }
    LinkedDictionaryPair.prototype.unlink = function () {
        this.prev.next = this.next;
        this.next.prev = this.prev;
    };
    return LinkedDictionaryPair;
}());
/**
 * The head and tail elements of the list have null key and value properties but they
 * usually link to normal nodes.
 */
var HeadOrTailLinkedDictionaryPair = /** @class */ (function () {
    function HeadOrTailLinkedDictionaryPair() {
        this.key = null;
        this.value = null;
        this.next = null;
        this.prev = null;
    }
    HeadOrTailLinkedDictionaryPair.prototype.unlink = function () {
        this.prev.next = this.next;
        this.next.prev = this.prev;
    };
    return HeadOrTailLinkedDictionaryPair;
}());
function isHeadOrTailLinkedDictionaryPair(p) {
    return p.next === null;
}
var LinkedDictionary = /** @class */ (function (_super) {
    __extends(LinkedDictionary, _super);
    function LinkedDictionary(toStrFunction) {
        var _this = _super.call(this, toStrFunction) || this;
        _this.head = new HeadOrTailLinkedDictionaryPair();
        _this.tail = new HeadOrTailLinkedDictionaryPair();
        _this.head.next = _this.tail;
        _this.tail.prev = _this.head;
        return _this;
    }
    /**
     * Inserts the new node to the 'tail' of the list, updating the
     * neighbors, and moving 'this.tail' (the End of List indicator) that
     * to the end.
     */
    LinkedDictionary.prototype.appendToTail = function (entry) {
        var lastNode = this.tail.prev;
        lastNode.next = entry;
        entry.prev = lastNode;
        entry.next = this.tail;
        this.tail.prev = entry;
    };
    /**
     * Retrieves a linked dictionary from the table internally
     */
    LinkedDictionary.prototype.getLinkedDictionaryPair = function (key) {
        if (util.isUndefined(key)) {
            return undefined;
        }
        var k = '$' + this.toStr(key);
        var pair = (this.table[k]);
        return pair;
    };
    /**
     * Returns the value to which this dictionary maps the specified key.
     * Returns undefined if this dictionary contains no mapping for this key.
     * @param {Object} key key whose associated value is to be returned.
     * @return {*} the value to which this dictionary maps the specified key or
     * undefined if the map contains no mapping for this key.
     */
    LinkedDictionary.prototype.getValue = function (key) {
        var pair = this.getLinkedDictionaryPair(key);
        if (!util.isUndefined(pair)) {
            return pair.value;
        }
        return undefined;
    };
    /**
     * Removes the mapping for this key from this dictionary if it is present.
     * Also, if a value is present for this key, the entry is removed from the
     * insertion ordering.
     * @param {Object} key key whose mapping is to be removed from the
     * dictionary.
     * @return {*} previous value associated with specified key, or undefined if
     * there was no mapping for key.
     */
    LinkedDictionary.prototype.remove = function (key) {
        var pair = this.getLinkedDictionaryPair(key);
        if (!util.isUndefined(pair)) {
            _super.prototype.remove.call(this, key); // This will remove it from the table
            pair.unlink(); // This will unlink it from the chain
            return pair.value;
        }
        return undefined;
    };
    /**
    * Removes all mappings from this LinkedDictionary.
    * @this {collections.LinkedDictionary}
    */
    LinkedDictionary.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    };
    /**
     * Internal function used when updating an existing KeyValue pair.
     * It places the new value indexed by key into the table, but maintains
     * its place in the linked ordering.
     */
    LinkedDictionary.prototype.replace = function (oldPair, newPair) {
        var k = '$' + this.toStr(newPair.key);
        // set the new Pair's links to existingPair's links
        newPair.next = oldPair.next;
        newPair.prev = oldPair.prev;
        // Delete Existing Pair from the table, unlink it from chain.
        // As a result, the nElements gets decremented by this operation
        this.remove(oldPair.key);
        // Link new Pair in place of where oldPair was,
        // by pointing the old pair's neighbors to it.
        newPair.prev.next = newPair;
        newPair.next.prev = newPair;
        this.table[k] = newPair;
        // To make up for the fact that the number of elements was decremented,
        // We need to increase it by one.
        ++this.nElements;
    };
    /**
     * Associates the specified value with the specified key in this dictionary.
     * If the dictionary previously contained a mapping for this key, the old
     * value is replaced by the specified value.
     * Updating of a key that already exists maintains its place in the
     * insertion order into the map.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} value value to be associated with the specified key.
     * @return {*} previous value associated with the specified key, or undefined if
     * there was no mapping for the key or if the key/value are undefined.
     */
    LinkedDictionary.prototype.setValue = function (key, value) {
        if (util.isUndefined(key) || util.isUndefined(value)) {
            return undefined;
        }
        var existingPair = this.getLinkedDictionaryPair(key);
        var newPair = new LinkedDictionaryPair(key, value);
        var k = '$' + this.toStr(key);
        // If there is already an element for that key, we
        // keep it's place in the LinkedList
        if (!util.isUndefined(existingPair)) {
            this.replace(existingPair, newPair);
            return existingPair.value;
        }
        else {
            this.appendToTail(newPair);
            this.table[k] = newPair;
            ++this.nElements;
            return undefined;
        }
    };
    /**
     * Returns an array containing all of the keys in this LinkedDictionary, ordered
     * by insertion order.
     * @return {Array} an array containing all of the keys in this LinkedDictionary,
     * ordered by insertion order.
     */
    LinkedDictionary.prototype.keys = function () {
        var array = [];
        this.forEach(function (key, value) {
            array.push(key);
        });
        return array;
    };
    /**
     * Returns an array containing all of the values in this LinkedDictionary, ordered by
     * insertion order.
     * @return {Array} an array containing all of the values in this LinkedDictionary,
     * ordered by insertion order.
     */
    LinkedDictionary.prototype.values = function () {
        var array = [];
        this.forEach(function (key, value) {
            array.push(value);
        });
        return array;
    };
    /**
    * Executes the provided function once for each key-value pair
    * present in this LinkedDictionary. It is done in the order of insertion
    * into the LinkedDictionary
    * @param {function(Object,Object):*} callback function to execute, it is
    * invoked with two arguments: key and value. To break the iteration you can
    * optionally return false.
    */
    LinkedDictionary.prototype.forEach = function (callback) {
        var crawlNode = this.head.next;
        while (!isHeadOrTailLinkedDictionaryPair(crawlNode)) {
            var ret = callback(crawlNode.key, crawlNode.value);
            if (ret === false) {
                return;
            }
            crawlNode = crawlNode.next;
        }
    };
    return LinkedDictionary;
}(Dictionary_1.default)); // End of LinkedDictionary
exports.default = LinkedDictionary;
// /**
//  * Returns true if this dictionary is equal to the given dictionary.
//  * Two dictionaries are equal if they contain the same mappings.
//  * @param {collections.Dictionary} other the other dictionary.
//  * @param {function(Object,Object):boolean=} valuesEqualFunction optional
//  * function used to check if two values are equal.
//  * @return {boolean} true if this dictionary is equal to the given dictionary.
//  */
// collections.Dictionary.prototype.equals = function(other,valuesEqualFunction) {
// 	const eqF = valuesEqualFunction || collections.defaultEquals;
// 	if(!(other instanceof collections.Dictionary)){
// 		return false;
// 	}
// 	if(this.size() !== other.size()){
// 		return false;
// 	}
// 	return this.equalsAux(this.firstNode,other.firstNode,eqF);
// }

},{"./Dictionary":4,"./util":16}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var arrays = require("./arrays");
var LinkedList = /** @class */ (function () {
    /**
    * Creates an empty Linked List.
    * @class A linked list is a data structure consisting of a group of nodes
    * which together represent a sequence.
    * @constructor
    */
    function LinkedList() {
        /**
        * First node in the list
        * @type {Object}
        * @private
        */
        this.firstNode = null;
        /**
        * Last node in the list
        * @type {Object}
        * @private
        */
        this.lastNode = null;
        /**
        * Number of elements in the list
        * @type {number}
        * @private
        */
        this.nElements = 0;
    }
    /**
    * Adds an element to this list.
    * @param {Object} item element to be added.
    * @param {number=} index optional index to add the element. If no index is specified
    * the element is added to the end of this list.
    * @return {boolean} true if the element was added or false if the index is invalid
    * or if the element is undefined.
    */
    LinkedList.prototype.add = function (item, index) {
        if (util.isUndefined(index)) {
            index = this.nElements;
        }
        if (index < 0 || index > this.nElements || util.isUndefined(item)) {
            return false;
        }
        var newNode = this.createNode(item);
        if (this.nElements === 0 || this.lastNode === null) {
            // First node in the list.
            this.firstNode = newNode;
            this.lastNode = newNode;
        }
        else if (index === this.nElements) {
            // Insert at the end.
            this.lastNode.next = newNode;
            this.lastNode = newNode;
        }
        else if (index === 0) {
            // Change first node.
            newNode.next = this.firstNode;
            this.firstNode = newNode;
        }
        else {
            var prev = this.nodeAtIndex(index - 1);
            if (prev == null) {
                return false;
            }
            newNode.next = prev.next;
            prev.next = newNode;
        }
        this.nElements++;
        return true;
    };
    /**
    * Returns the first element in this list.
    * @return {*} the first element of the list or undefined if the list is
    * empty.
    */
    LinkedList.prototype.first = function () {
        if (this.firstNode !== null) {
            return this.firstNode.element;
        }
        return undefined;
    };
    /**
    * Returns the last element in this list.
    * @return {*} the last element in the list or undefined if the list is
    * empty.
    */
    LinkedList.prototype.last = function () {
        if (this.lastNode !== null) {
            return this.lastNode.element;
        }
        return undefined;
    };
    /**
     * Returns the element at the specified position in this list.
     * @param {number} index desired index.
     * @return {*} the element at the given index or undefined if the index is
     * out of bounds.
     */
    LinkedList.prototype.elementAtIndex = function (index) {
        var node = this.nodeAtIndex(index);
        if (node === null) {
            return undefined;
        }
        return node.element;
    };
    /**
     * Returns the index in this list of the first occurrence of the
     * specified element, or -1 if the List does not contain this element.
     * <p>If the elements inside this list are
     * not comparable with the === operator a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName = function(pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} item element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction Optional
     * function used to check if two elements are equal.
     * @return {number} the index in this list of the first occurrence
     * of the specified element, or -1 if this list does not contain the
     * element.
     */
    LinkedList.prototype.indexOf = function (item, equalsFunction) {
        var equalsF = equalsFunction || util.defaultEquals;
        if (util.isUndefined(item)) {
            return -1;
        }
        var currentNode = this.firstNode;
        var index = 0;
        while (currentNode !== null) {
            if (equalsF(currentNode.element, item)) {
                return index;
            }
            index++;
            currentNode = currentNode.next;
        }
        return -1;
    };
    /**
       * Returns true if this list contains the specified element.
       * <p>If the elements inside the list are
       * not comparable with the === operator a custom equals function should be
       * provided to perform searches, the function must receive two arguments and
       * return true if they are equal, false otherwise. Example:</p>
       *
       * <pre>
       * const petsAreEqualByName = function(pet1, pet2) {
       *  return pet1.name === pet2.name;
       * }
       * </pre>
       * @param {Object} item element to search for.
       * @param {function(Object,Object):boolean=} equalsFunction Optional
       * function used to check if two elements are equal.
       * @return {boolean} true if this list contains the specified element, false
       * otherwise.
       */
    LinkedList.prototype.contains = function (item, equalsFunction) {
        return (this.indexOf(item, equalsFunction) >= 0);
    };
    /**
     * Removes the first occurrence of the specified element in this list.
     * <p>If the elements inside the list are
     * not comparable with the === operator a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName = function(pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} item element to be removed from this list, if present.
     * @return {boolean} true if the list contained the specified element.
     */
    LinkedList.prototype.remove = function (item, equalsFunction) {
        var equalsF = equalsFunction || util.defaultEquals;
        if (this.nElements < 1 || util.isUndefined(item)) {
            return false;
        }
        var previous = null;
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            if (equalsF(currentNode.element, item)) {
                if (previous == null) {
                    this.firstNode = currentNode.next;
                    if (currentNode === this.lastNode) {
                        this.lastNode = null;
                    }
                }
                else if (currentNode === this.lastNode) {
                    this.lastNode = previous;
                    previous.next = currentNode.next;
                    currentNode.next = null;
                }
                else {
                    previous.next = currentNode.next;
                    currentNode.next = null;
                }
                this.nElements--;
                return true;
            }
            previous = currentNode;
            currentNode = currentNode.next;
        }
        return false;
    };
    /**
     * Removes all of the elements from this list.
     */
    LinkedList.prototype.clear = function () {
        this.firstNode = null;
        this.lastNode = null;
        this.nElements = 0;
    };
    /**
     * Returns true if this list is equal to the given list.
     * Two lists are equal if they have the same elements in the same order.
     * @param {LinkedList} other the other list.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function used to check if two elements are equal. If the elements in the lists
     * are custom objects you should provide a function, otherwise
     * the === operator is used to check equality between elements.
     * @return {boolean} true if this list is equal to the given list.
     */
    LinkedList.prototype.equals = function (other, equalsFunction) {
        var eqF = equalsFunction || util.defaultEquals;
        if (!(other instanceof LinkedList)) {
            return false;
        }
        if (this.size() !== other.size()) {
            return false;
        }
        return this.equalsAux(this.firstNode, other.firstNode, eqF);
    };
    /**
    * @private
    */
    LinkedList.prototype.equalsAux = function (n1, n2, eqF) {
        while (n1 !== null && n2 !== null) {
            if (!eqF(n1.element, n2.element)) {
                return false;
            }
            n1 = n1.next;
            n2 = n2.next;
        }
        return true;
    };
    /**
     * Removes the element at the specified position in this list.
     * @param {number} index given index.
     * @return {*} removed element or undefined if the index is out of bounds.
     */
    LinkedList.prototype.removeElementAtIndex = function (index) {
        if (index < 0 || index >= this.nElements || this.firstNode === null || this.lastNode === null) {
            return undefined;
        }
        var element;
        if (this.nElements === 1) {
            //First node in the list.
            element = this.firstNode.element;
            this.firstNode = null;
            this.lastNode = null;
        }
        else {
            var previous = this.nodeAtIndex(index - 1);
            if (previous === null) {
                element = this.firstNode.element;
                this.firstNode = this.firstNode.next;
            }
            else if (previous.next === this.lastNode) {
                element = this.lastNode.element;
                this.lastNode = previous;
            }
            if (previous !== null && previous.next !== null) {
                element = previous.next.element;
                previous.next = previous.next.next;
            }
        }
        this.nElements--;
        return element;
    };
    /**
     * Executes the provided function once for each element present in this list in order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    LinkedList.prototype.forEach = function (callback) {
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            if (callback(currentNode.element) === false) {
                break;
            }
            currentNode = currentNode.next;
        }
    };
    /**
     * Reverses the order of the elements in this linked list (makes the last
     * element first, and the first element last).
     */
    LinkedList.prototype.reverse = function () {
        var previous = null;
        var current = this.firstNode;
        var temp = null;
        while (current !== null) {
            temp = current.next;
            current.next = previous;
            previous = current;
            current = temp;
        }
        temp = this.firstNode;
        this.firstNode = this.lastNode;
        this.lastNode = temp;
    };
    /**
     * Returns an array containing all of the elements in this list in proper
     * sequence.
     * @return {Array.<*>} an array containing all of the elements in this list,
     * in proper sequence.
     */
    LinkedList.prototype.toArray = function () {
        var array = [];
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            array.push(currentNode.element);
            currentNode = currentNode.next;
        }
        return array;
    };
    /**
     * Returns the number of elements in this list.
     * @return {number} the number of elements in this list.
     */
    LinkedList.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this list contains no elements.
     * @return {boolean} true if this list contains no elements.
     */
    LinkedList.prototype.isEmpty = function () {
        return this.nElements <= 0;
    };
    LinkedList.prototype.toString = function () {
        return arrays.toString(this.toArray());
    };
    /**
     * @private
     */
    LinkedList.prototype.nodeAtIndex = function (index) {
        if (index < 0 || index >= this.nElements) {
            return null;
        }
        if (index === (this.nElements - 1)) {
            return this.lastNode;
        }
        var node = this.firstNode;
        for (var i = 0; i < index && node != null; i++) {
            node = node.next;
        }
        return node;
    };
    /**
     * @private
     */
    LinkedList.prototype.createNode = function (item) {
        return {
            element: item,
            next: null
        };
    };
    return LinkedList;
}()); // End of linked list
exports.default = LinkedList;

},{"./arrays":15,"./util":16}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var Dictionary_1 = require("./Dictionary");
var arrays = require("./arrays");
var MultiDictionary = /** @class */ (function () {
    /**
     * Creates an empty multi dictionary.
     * @class <p>A multi dictionary is a special kind of dictionary that holds
     * multiple values against each key. Setting a value into the dictionary will
     * add the value to an array at that key. Getting a key will return an array,
     * holding all the values set to that key.
     * You can configure to allow duplicates in the values.
     * This implementation accepts any kind of objects as keys.</p>
     *
     * <p>If the keys are custom objects a function which converts keys to strings must be
     * provided. Example:</p>
     *
     * <pre>
     * function petToString(pet) {
       *  return pet.name;
       * }
     * </pre>
     * <p>If the values are custom objects a function to check equality between values
     * must be provided. Example:</p>
     *
     * <pre>
     * function petsAreEqualByAge(pet1,pet2) {
       *  return pet1.age===pet2.age;
       * }
     * </pre>
     * @constructor
     * @param {function(Object):string=} toStrFunction optional function
     * to convert keys to strings. If the keys aren't strings or if toString()
     * is not appropriate, a custom function which receives a key and returns a
     * unique string must be provided.
     * @param {function(Object,Object):boolean=} valuesEqualsFunction optional
     * function to check if two values are equal.
     *
     * @param allowDuplicateValues
     */
    function MultiDictionary(toStrFunction, valuesEqualsFunction, allowDuplicateValues) {
        if (allowDuplicateValues === void 0) { allowDuplicateValues = false; }
        this.dict = new Dictionary_1.default(toStrFunction);
        this.equalsF = valuesEqualsFunction || util.defaultEquals;
        this.allowDuplicate = allowDuplicateValues;
    }
    /**
    * Returns an array holding the values to which this dictionary maps
    * the specified key.
    * Returns an empty array if this dictionary contains no mappings for this key.
    * @param {Object} key key whose associated values are to be returned.
    * @return {Array} an array holding the values to which this dictionary maps
    * the specified key.
    */
    MultiDictionary.prototype.getValue = function (key) {
        var values = this.dict.getValue(key);
        if (util.isUndefined(values)) {
            return [];
        }
        return arrays.copy(values);
    };
    /**
     * Adds the value to the array associated with the specified key, if
     * it is not already present.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} value the value to add to the array at the key
     * @return {boolean} true if the value was not already associated with that key.
     */
    MultiDictionary.prototype.setValue = function (key, value) {
        if (util.isUndefined(key) || util.isUndefined(value)) {
            return false;
        }
        var array = this.dict.getValue(key);
        if (util.isUndefined(array)) {
            this.dict.setValue(key, [value]);
            return true;
        }
        if (!this.allowDuplicate) {
            if (arrays.contains(array, value, this.equalsF)) {
                return false;
            }
        }
        array.push(value);
        return true;
    };
    /**
     * Removes the specified values from the array of values associated with the
     * specified key. If a value isn't given, all values associated with the specified
     * key are removed.
     * @param {Object} key key whose mapping is to be removed from the
     * dictionary.
     * @param {Object=} value optional argument to specify the value to remove
     * from the array associated with the specified key.
     * @return {*} true if the dictionary changed, false if the key doesn't exist or
     * if the specified value isn't associated with the specified key.
     */
    MultiDictionary.prototype.remove = function (key, value) {
        if (util.isUndefined(value)) {
            var v = this.dict.remove(key);
            return !util.isUndefined(v);
        }
        var array = this.dict.getValue(key);
        if (!util.isUndefined(array) && arrays.remove(array, value, this.equalsF)) {
            if (array.length === 0) {
                this.dict.remove(key);
            }
            return true;
        }
        return false;
    };
    /**
     * Returns an array containing all of the keys in this dictionary.
     * @return {Array} an array containing all of the keys in this dictionary.
     */
    MultiDictionary.prototype.keys = function () {
        return this.dict.keys();
    };
    /**
     * Returns an array containing all of the values in this dictionary.
     * @return {Array} an array containing all of the values in this dictionary.
     */
    MultiDictionary.prototype.values = function () {
        var values = this.dict.values();
        var array = [];
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var v = values_1[_i];
            for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
                var w = v_1[_a];
                array.push(w);
            }
        }
        return array;
    };
    /**
     * Returns true if this dictionary at least one value associatted the specified key.
     * @param {Object} key key whose presence in this dictionary is to be
     * tested.
     * @return {boolean} true if this dictionary at least one value associatted
     * the specified key.
     */
    MultiDictionary.prototype.containsKey = function (key) {
        return this.dict.containsKey(key);
    };
    /**
     * Removes all mappings from this dictionary.
     */
    MultiDictionary.prototype.clear = function () {
        this.dict.clear();
    };
    /**
     * Returns the number of keys in this dictionary.
     * @return {number} the number of key-value mappings in this dictionary.
     */
    MultiDictionary.prototype.size = function () {
        return this.dict.size();
    };
    /**
     * Returns true if this dictionary contains no mappings.
     * @return {boolean} true if this dictionary contains no mappings.
     */
    MultiDictionary.prototype.isEmpty = function () {
        return this.dict.isEmpty();
    };
    return MultiDictionary;
}()); // end of multi dictionary
exports.default = MultiDictionary;

},{"./Dictionary":4,"./arrays":15,"./util":16}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Direction;
(function (Direction) {
    Direction[Direction["BEFORE"] = 0] = "BEFORE";
    Direction[Direction["AFTER"] = 1] = "AFTER";
    Direction[Direction["INSIDE_AT_END"] = 2] = "INSIDE_AT_END";
    Direction[Direction["INSIDE_AT_START"] = 3] = "INSIDE_AT_START";
})(Direction || (Direction = {}));
var MultiRootTree = /** @class */ (function () {
    function MultiRootTree(rootIds, nodes) {
        if (rootIds === void 0) { rootIds = []; }
        if (nodes === void 0) { nodes = {}; }
        this.rootIds = rootIds;
        this.nodes = nodes;
        this.initRootIds();
        this.initNodes();
    }
    MultiRootTree.prototype.initRootIds = function () {
        for (var _i = 0, _a = this.rootIds; _i < _a.length; _i++) {
            var rootId = _a[_i];
            this.createEmptyNodeIfNotExist(rootId);
        }
    };
    MultiRootTree.prototype.initNodes = function () {
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                for (var _i = 0, _a = this.nodes[nodeKey]; _i < _a.length; _i++) {
                    var nodeListItem = _a[_i];
                    this.createEmptyNodeIfNotExist(nodeListItem);
                }
            }
        }
    };
    MultiRootTree.prototype.createEmptyNodeIfNotExist = function (nodeKey) {
        if (!this.nodes[nodeKey]) {
            this.nodes[nodeKey] = [];
        }
    };
    MultiRootTree.prototype.getRootIds = function () {
        var clone = this.rootIds.slice();
        return clone;
    };
    MultiRootTree.prototype.getNodes = function () {
        var clone = {};
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                clone[nodeKey] = this.nodes[nodeKey].slice();
            }
        }
        return clone;
    };
    MultiRootTree.prototype.getObject = function () {
        return {
            rootIds: this.getRootIds(),
            nodes: this.getNodes(),
        };
    };
    MultiRootTree.prototype.toObject = function () {
        return this.getObject();
    };
    MultiRootTree.prototype.flatten = function () {
        var _this = this;
        var extraPropsObject = [];
        for (var i = 0; i < this.rootIds.length; i++) {
            var rootId = this.rootIds[i];
            extraPropsObject.push({
                id: rootId,
                level: 0,
                hasParent: false,
                childrenCount: 0,
            });
            traverse(rootId, this.nodes, extraPropsObject, 0);
        }
        for (var _i = 0, extraPropsObject_1 = extraPropsObject; _i < extraPropsObject_1.length; _i++) {
            var o = extraPropsObject_1[_i];
            o.childrenCount = countChildren(o.id);
        }
        return extraPropsObject;
        function countChildren(id) {
            if (!_this.nodes[id]) {
                return 0;
            }
            else {
                var childrenCount = _this.nodes[id].length;
                return childrenCount;
            }
        }
        function traverse(startId, nodes, returnArray, level) {
            if (level === void 0) { level = 0; }
            if (!startId || !nodes || !returnArray || !nodes[startId]) {
                return;
            }
            level++;
            var idsList = nodes[startId];
            for (var i = 0; i < idsList.length; i++) {
                var id = idsList[i];
                returnArray.push({ id: id, level: level, hasParent: true });
                traverse(id, nodes, returnArray, level);
            }
            level--;
        }
    };
    MultiRootTree.prototype.moveIdBeforeId = function (moveId, beforeId) {
        return this.moveId(moveId, beforeId, Direction.BEFORE);
    };
    MultiRootTree.prototype.moveIdAfterId = function (moveId, afterId) {
        return this.moveId(moveId, afterId, Direction.AFTER);
    };
    MultiRootTree.prototype.moveIdIntoId = function (moveId, insideId, atStart) {
        if (atStart === void 0) { atStart = true; }
        if (atStart) {
            return this.moveId(moveId, insideId, Direction.INSIDE_AT_START);
        }
        else {
            return this.moveId(moveId, insideId, Direction.INSIDE_AT_END);
        }
    };
    MultiRootTree.prototype.swapRootIdWithRootId = function (rootId, withRootId) {
        var leftIndex = this.findRootId(rootId);
        var rightIndex = this.findRootId(withRootId);
        this.swapRootPositionWithRootPosition(leftIndex, rightIndex);
    };
    MultiRootTree.prototype.swapRootPositionWithRootPosition = function (swapRootPosition, withRootPosition) {
        var temp = this.rootIds[withRootPosition];
        this.rootIds[withRootPosition] = this.rootIds[swapRootPosition];
        this.rootIds[swapRootPosition] = temp;
    };
    MultiRootTree.prototype.deleteId = function (id) {
        this.rootDeleteId(id);
        this.nodeAndSubNodesDelete(id);
        this.nodeRefrencesDelete(id);
    };
    MultiRootTree.prototype.insertIdBeforeId = function (beforeId, insertId) {
        var foundRootIdIndex = this.findRootId(beforeId);
        if (foundRootIdIndex > -1) {
            this.insertIdIntoRoot(insertId, foundRootIdIndex);
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                var foundNodeIdIndex = this.findNodeId(nodeKey, beforeId);
                if (foundNodeIdIndex > -1) {
                    this.insertIdIntoNode(nodeKey, insertId, foundNodeIdIndex);
                }
            }
        }
    };
    MultiRootTree.prototype.insertIdAfterId = function (belowId, insertId) {
        var foundRootIdIndex = this.findRootId(belowId);
        if (foundRootIdIndex > -1) {
            this.insertIdIntoRoot(insertId, foundRootIdIndex + 1);
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                var foundNodeIdIndex = this.findNodeId(nodeKey, belowId);
                if (foundNodeIdIndex > -1) {
                    this.insertIdIntoNode(nodeKey, insertId, foundNodeIdIndex + 1);
                }
            }
        }
    };
    MultiRootTree.prototype.insertIdIntoId = function (insideId, insertId) {
        this.nodeInsertAtEnd(insideId, insertId);
        this.nodes[insertId] = [];
    };
    MultiRootTree.prototype.insertIdIntoRoot = function (id, position) {
        if (position === undefined) {
            this.rootInsertAtEnd(id);
        }
        else {
            if (position < 0) {
                var length_1 = this.rootIds.length;
                this.rootIds.splice((position + length_1 + 1), 0, id);
            }
            else {
                this.rootIds.splice(position, 0, id);
            }
        }
        this.nodes[id] = this.nodes[id] || [];
    };
    MultiRootTree.prototype.insertIdIntoNode = function (nodeKey, id, position) {
        this.nodes[nodeKey] = this.nodes[nodeKey] || [];
        this.nodes[id] = this.nodes[id] || [];
        if (position === undefined) {
            this.nodeInsertAtEnd(nodeKey, id);
        }
        else {
            if (position < 0) {
                var length_2 = this.nodes[nodeKey].length;
                this.nodes[nodeKey].splice((position + length_2 + 1), 0, id);
            }
            else {
                this.nodes[nodeKey].splice(position, 0, id);
            }
        }
    };
    MultiRootTree.prototype.moveId = function (moveId, beforeId, direction) {
        var sourceId = moveId;
        var sourceRootIndex = this.findRootId(sourceId);
        var sourceNodeKey;
        var sourceNodeIdIndex;
        if (this.nodes[beforeId]) {
            sourceNodeKey = beforeId;
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                sourceNodeIdIndex = this.findNodeId(nodeKey, beforeId);
                break;
            }
        }
        // got all
        var targetId = beforeId;
        var targetRootIndex = this.findRootId(targetId);
        var targetNodeKey;
        var targetNodeIdIndex;
        if (this.nodes[beforeId]) {
            targetNodeKey = beforeId;
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                targetNodeIdIndex = this.findNodeId(nodeKey, beforeId);
                break;
            }
        }
        // got all
        if (sourceRootIndex > -1) {
            if (targetRootIndex > -1) {
                // moving root to root
                // console.log(`Moving ROOT to ROOT`);
                // console.log(`RootIds:`);
                // console.log(this.rootIds);
                // console.log(`TargetIndex=${targetRootIndex}, SourceIndex=${sourceRootIndex}`);
                // console.log(`TargetId=${targetId}, SourceId=${sourceId}`);
                this.rootDelete(sourceRootIndex); // indexes change now
                if (targetRootIndex > sourceRootIndex) {
                    targetRootIndex--;
                }
                else {
                }
                switch (direction) {
                    case Direction.BEFORE:
                        this.insertIdIntoRoot(sourceId, targetRootIndex);
                        break;
                    case Direction.AFTER:
                        this.insertIdIntoRoot(sourceId, targetRootIndex + 1);
                        break;
                    case Direction.INSIDE_AT_START:
                        this.nodeInsertAtStart(targetId, sourceId);
                        break;
                    case Direction.INSIDE_AT_END:
                        this.nodeInsertAtEnd(targetId, sourceId);
                        break;
                }
            }
            else {
                // moving root (source) ABOVE node (target)
                // will remove one entry from roots
                this.rootDelete(sourceRootIndex);
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, targetId);
                        if (index > -1) {
                            switch (direction) {
                                case Direction.BEFORE:
                                    this.insertIdIntoNode(nodeKey, sourceId, index);
                                    break;
                                case Direction.AFTER:
                                    this.insertIdIntoNode(nodeKey, sourceId, index + 1);
                                    break;
                                case Direction.INSIDE_AT_START:
                                    this.nodeInsertAtStart(targetId, sourceId);
                                    break;
                                case Direction.INSIDE_AT_END:
                                    this.nodeInsertAtEnd(targetId, sourceId);
                                    break;
                            }
                            break;
                        }
                    }
                }
            }
        }
        else {
            if (targetRootIndex > -1) {
                // moving node (source) ABOVE root (target)
                // delete source id from each node
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, sourceId);
                        if (index > -1) {
                            // this.nodeInsertId(nodeKey, sourceId, index);
                            this.nodeDeleteAtIndex(nodeKey, index);
                            break;
                        }
                    }
                }
                switch (direction) {
                    case Direction.BEFORE:
                        this.insertIdIntoRoot(sourceId, targetRootIndex);
                        break;
                    case Direction.AFTER:
                        this.insertIdIntoRoot(sourceId, targetRootIndex + 1);
                        break;
                    case Direction.INSIDE_AT_START:
                        this.nodeInsertAtStart(targetId, sourceId);
                        break;
                    case Direction.INSIDE_AT_END:
                        this.nodeInsertAtEnd(targetId, sourceId);
                        break;
                }
            }
            else {
                // moving node (source) ABOVE node (target)
                // delete source id from each node
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, sourceId);
                        if (index > -1) {
                            this.nodeDeleteAtIndex(nodeKey, index);
                            break;
                        }
                    }
                }
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, targetId);
                        if (index > -1) {
                            switch (direction) {
                                case Direction.BEFORE:
                                    this.insertIdIntoNode(nodeKey, sourceId, index);
                                    break;
                                case Direction.AFTER:
                                    this.insertIdIntoNode(nodeKey, sourceId, index + 1);
                                    break;
                                case Direction.INSIDE_AT_START:
                                    this.nodeInsertAtStart(targetId, sourceId);
                                    break;
                                case Direction.INSIDE_AT_END:
                                    this.nodeInsertAtEnd(targetId, sourceId);
                                    break;
                            }
                            break;
                        }
                    }
                }
            }
        }
    };
    MultiRootTree.prototype.swapArrayElements = function (arr, indexA, indexB) {
        var temp = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = temp;
        return arr;
    };
    MultiRootTree.prototype.rootDeleteId = function (id) {
        var index = this.findRootId(id);
        if (index > -1) {
            this.rootDelete(index);
        }
    };
    MultiRootTree.prototype.nodeAndSubNodesDelete = function (nodeKey) {
        var toDeleteLater = [];
        for (var i = 0; i < this.nodes[nodeKey].length; i++) {
            var id = this.nodes[nodeKey][i];
            this.nodeAndSubNodesDelete(id);
            toDeleteLater.push(nodeKey);
        }
        this.nodeDelete(nodeKey);
        for (var i = 0; i < toDeleteLater.length; i++) {
            this.nodeDelete(toDeleteLater[i]);
        }
    };
    MultiRootTree.prototype.nodeRefrencesDelete = function (id) {
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                for (var i = 0; i < this.nodes[nodeKey].length; i++) {
                    var targetId = this.nodes[nodeKey][i];
                    if (targetId === id) {
                        this.nodeDeleteAtIndex(nodeKey, i);
                    }
                }
            }
        }
    };
    MultiRootTree.prototype.nodeDelete = function (nodeKey) {
        delete this.nodes[nodeKey];
    };
    MultiRootTree.prototype.findRootId = function (id) {
        return this.rootIds.indexOf(id);
    };
    MultiRootTree.prototype.findNodeId = function (nodeKey, id) {
        return this.nodes[nodeKey].indexOf(id);
    };
    MultiRootTree.prototype.findNode = function (nodeKey) {
        return this.nodes[nodeKey];
    };
    MultiRootTree.prototype.nodeInsertAtStart = function (nodeKey, id) {
        this.nodes[nodeKey].unshift(id);
    };
    MultiRootTree.prototype.nodeInsertAtEnd = function (nodeKey, id) {
        this.nodes[nodeKey].push(id);
    };
    MultiRootTree.prototype.rootDelete = function (index) {
        this.rootIds.splice(index, 1);
    };
    MultiRootTree.prototype.nodeDeleteAtIndex = function (nodeKey, index) {
        this.nodes[nodeKey].splice(index, 1);
    };
    MultiRootTree.prototype.rootInsertAtStart = function (id) {
        this.rootIds.unshift(id);
    };
    MultiRootTree.prototype.rootInsertAtEnd = function (id) {
        this.rootIds.push(id);
    };
    return MultiRootTree;
}());
exports.default = MultiRootTree;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var Heap_1 = require("./Heap");
var PriorityQueue = /** @class */ (function () {
    /**
     * Creates an empty priority queue.
     * @class <p>In a priority queue each element is associated with a "priority",
     * elements are dequeued in highest-priority-first order (the elements with the
     * highest priority are dequeued first). Priority Queues are implemented as heaps.
     * If the inserted elements are custom objects a compare function must be provided,
     * otherwise the <=, === and >= operators are used to compare object priority.</p>
     * <pre>
     * function compare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return -1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return 1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     * @constructor
     * @param {function(Object,Object):number=} compareFunction optional
     * function used to compare two element priorities. Must return a negative integer,
     * zero, or a positive integer as the first argument is less than, equal to,
     * or greater than the second.
     */
    function PriorityQueue(compareFunction) {
        this.heap = new Heap_1.default(util.reverseCompareFunction(compareFunction));
    }
    /**
     * Inserts the specified element into this priority queue.
     * @param {Object} element the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    PriorityQueue.prototype.enqueue = function (element) {
        return this.heap.add(element);
    };
    /**
     * Inserts the specified element into this priority queue.
     * @param {Object} element the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    PriorityQueue.prototype.add = function (element) {
        return this.heap.add(element);
    };
    /**
     * Retrieves and removes the highest priority element of this queue.
     * @return {*} the the highest priority element of this queue,
     *  or undefined if this queue is empty.
     */
    PriorityQueue.prototype.dequeue = function () {
        if (this.heap.size() !== 0) {
            var el = this.heap.peek();
            this.heap.removeRoot();
            return el;
        }
        return undefined;
    };
    /**
     * Retrieves, but does not remove, the highest priority element of this queue.
     * @return {*} the highest priority element of this queue, or undefined if this queue is empty.
     */
    PriorityQueue.prototype.peek = function () {
        return this.heap.peek();
    };
    /**
     * Returns true if this priority queue contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this priority queue contains the specified element,
     * false otherwise.
     */
    PriorityQueue.prototype.contains = function (element) {
        return this.heap.contains(element);
    };
    /**
     * Checks if this priority queue is empty.
     * @return {boolean} true if and only if this priority queue contains no items; false
     * otherwise.
     */
    PriorityQueue.prototype.isEmpty = function () {
        return this.heap.isEmpty();
    };
    /**
     * Returns the number of elements in this priority queue.
     * @return {number} the number of elements in this priority queue.
     */
    PriorityQueue.prototype.size = function () {
        return this.heap.size();
    };
    /**
     * Removes all of the elements from this priority queue.
     */
    PriorityQueue.prototype.clear = function () {
        this.heap.clear();
    };
    /**
     * Executes the provided function once for each element present in this queue in
     * no particular order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    PriorityQueue.prototype.forEach = function (callback) {
        this.heap.forEach(callback);
    };
    return PriorityQueue;
}()); // end of priority queue
exports.default = PriorityQueue;

},{"./Heap":6,"./util":16}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList_1 = require("./LinkedList");
var Queue = /** @class */ (function () {
    /**
     * Creates an empty queue.
     * @class A queue is a First-In-First-Out (FIFO) data structure, the first
     * element added to the queue will be the first one to be removed. This
     * implementation uses a linked list as a container.
     * @constructor
     */
    function Queue() {
        this.list = new LinkedList_1.default();
    }
    /**
     * Inserts the specified element into the end of this queue.
     * @param {Object} elem the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    Queue.prototype.enqueue = function (elem) {
        return this.list.add(elem);
    };
    /**
     * Inserts the specified element into the end of this queue.
     * @param {Object} elem the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    Queue.prototype.add = function (elem) {
        return this.list.add(elem);
    };
    /**
     * Retrieves and removes the head of this queue.
     * @return {*} the head of this queue, or undefined if this queue is empty.
     */
    Queue.prototype.dequeue = function () {
        if (this.list.size() !== 0) {
            var el = this.list.first();
            this.list.removeElementAtIndex(0);
            return el;
        }
        return undefined;
    };
    /**
     * Retrieves, but does not remove, the head of this queue.
     * @return {*} the head of this queue, or undefined if this queue is empty.
     */
    Queue.prototype.peek = function () {
        if (this.list.size() !== 0) {
            return this.list.first();
        }
        return undefined;
    };
    /**
     * Returns the number of elements in this queue.
     * @return {number} the number of elements in this queue.
     */
    Queue.prototype.size = function () {
        return this.list.size();
    };
    /**
     * Returns true if this queue contains the specified element.
     * <p>If the elements inside this stack are
     * not comparable with the === operator, a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName (pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} elem element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function to check if two elements are equal.
     * @return {boolean} true if this queue contains the specified element,
     * false otherwise.
     */
    Queue.prototype.contains = function (elem, equalsFunction) {
        return this.list.contains(elem, equalsFunction);
    };
    /**
     * Checks if this queue is empty.
     * @return {boolean} true if and only if this queue contains no items; false
     * otherwise.
     */
    Queue.prototype.isEmpty = function () {
        return this.list.size() <= 0;
    };
    /**
     * Removes all of the elements from this queue.
     */
    Queue.prototype.clear = function () {
        this.list.clear();
    };
    /**
     * Executes the provided function once for each element present in this queue in
     * FIFO order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    Queue.prototype.forEach = function (callback) {
        this.list.forEach(callback);
    };
    return Queue;
}()); // End of queue
exports.default = Queue;

},{"./LinkedList":8}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
var arrays = require("./arrays");
var Dictionary_1 = require("./Dictionary");
var Set = /** @class */ (function () {
    /**
     * Creates an empty set.
     * @class <p>A set is a data structure that contains no duplicate items.</p>
     * <p>If the inserted elements are custom objects a function
     * which converts elements to strings must be provided. Example:</p>
     *
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     *
     * @constructor
     * @param {function(Object):string=} toStringFunction optional function used
     * to convert elements to strings. If the elements aren't strings or if toString()
     * is not appropriate, a custom function which receives an object and returns a
     * unique string must be provided.
     */
    function Set(toStringFunction) {
        this.dictionary = new Dictionary_1.default(toStringFunction);
    }
    /**
     * Returns true if this set contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this set contains the specified element,
     * false otherwise.
     */
    Set.prototype.contains = function (element) {
        return this.dictionary.containsKey(element);
    };
    /**
     * Adds the specified element to this set if it is not already present.
     * @param {Object} element the element to insert.
     * @return {boolean} true if this set did not already contain the specified element.
     */
    Set.prototype.add = function (element) {
        if (this.contains(element) || util.isUndefined(element)) {
            return false;
        }
        else {
            this.dictionary.setValue(element, element);
            return true;
        }
    };
    /**
     * Performs an intersecion between this and another set.
     * Removes all values that are not present this set and the given set.
     * @param {collections.Set} otherSet other set.
     */
    Set.prototype.intersection = function (otherSet) {
        var set = this;
        this.forEach(function (element) {
            if (!otherSet.contains(element)) {
                set.remove(element);
            }
            return true;
        });
    };
    /**
     * Performs a union between this and another set.
     * Adds all values from the given set to this set.
     * @param {collections.Set} otherSet other set.
     */
    Set.prototype.union = function (otherSet) {
        var set = this;
        otherSet.forEach(function (element) {
            set.add(element);
            return true;
        });
    };
    /**
     * Performs a difference between this and another set.
     * Removes from this set all the values that are present in the given set.
     * @param {collections.Set} otherSet other set.
     */
    Set.prototype.difference = function (otherSet) {
        var set = this;
        otherSet.forEach(function (element) {
            set.remove(element);
            return true;
        });
    };
    /**
     * Checks whether the given set contains all the elements in this set.
     * @param {collections.Set} otherSet other set.
     * @return {boolean} true if this set is a subset of the given set.
     */
    Set.prototype.isSubsetOf = function (otherSet) {
        if (this.size() > otherSet.size()) {
            return false;
        }
        var isSub = true;
        this.forEach(function (element) {
            if (!otherSet.contains(element)) {
                isSub = false;
                return false;
            }
            return true;
        });
        return isSub;
    };
    /**
     * Removes the specified element from this set if it is present.
     * @return {boolean} true if this set contained the specified element.
     */
    Set.prototype.remove = function (element) {
        if (!this.contains(element)) {
            return false;
        }
        else {
            this.dictionary.remove(element);
            return true;
        }
    };
    /**
     * Executes the provided function once for each element
     * present in this set.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one arguments: the element. To break the iteration you can
     * optionally return false.
     */
    Set.prototype.forEach = function (callback) {
        this.dictionary.forEach(function (k, v) {
            return callback(v);
        });
    };
    /**
     * Returns an array containing all of the elements in this set in arbitrary order.
     * @return {Array} an array containing all of the elements in this set.
     */
    Set.prototype.toArray = function () {
        return this.dictionary.values();
    };
    /**
     * Returns true if this set contains no elements.
     * @return {boolean} true if this set contains no elements.
     */
    Set.prototype.isEmpty = function () {
        return this.dictionary.isEmpty();
    };
    /**
     * Returns the number of elements in this set.
     * @return {number} the number of elements in this set.
     */
    Set.prototype.size = function () {
        return this.dictionary.size();
    };
    /**
     * Removes all of the elements from this set.
     */
    Set.prototype.clear = function () {
        this.dictionary.clear();
    };
    /*
    * Provides a string representation for display
    */
    Set.prototype.toString = function () {
        return arrays.toString(this.toArray());
    };
    return Set;
}()); // end of Set
exports.default = Set;

},{"./Dictionary":4,"./arrays":15,"./util":16}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList_1 = require("./LinkedList");
var Stack = /** @class */ (function () {
    /**
     * Creates an empty Stack.
     * @class A Stack is a Last-In-First-Out (LIFO) data structure, the last
     * element added to the stack will be the first one to be removed. This
     * implementation uses a linked list as a container.
     * @constructor
     */
    function Stack() {
        this.list = new LinkedList_1.default();
    }
    /**
     * Pushes an item onto the top of this stack.
     * @param {Object} elem the element to be pushed onto this stack.
     * @return {boolean} true if the element was pushed or false if it is undefined.
     */
    Stack.prototype.push = function (elem) {
        return this.list.add(elem, 0);
    };
    /**
     * Pushes an item onto the top of this stack.
     * @param {Object} elem the element to be pushed onto this stack.
     * @return {boolean} true if the element was pushed or false if it is undefined.
     */
    Stack.prototype.add = function (elem) {
        return this.list.add(elem, 0);
    };
    /**
     * Removes the object at the top of this stack and returns that object.
     * @return {*} the object at the top of this stack or undefined if the
     * stack is empty.
     */
    Stack.prototype.pop = function () {
        return this.list.removeElementAtIndex(0);
    };
    /**
     * Looks at the object at the top of this stack without removing it from the
     * stack.
     * @return {*} the object at the top of this stack or undefined if the
     * stack is empty.
     */
    Stack.prototype.peek = function () {
        return this.list.first();
    };
    /**
     * Returns the number of elements in this stack.
     * @return {number} the number of elements in this stack.
     */
    Stack.prototype.size = function () {
        return this.list.size();
    };
    /**
     * Returns true if this stack contains the specified element.
     * <p>If the elements inside this stack are
     * not comparable with the === operator, a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName (pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} elem element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function to check if two elements are equal.
     * @return {boolean} true if this stack contains the specified element,
     * false otherwise.
     */
    Stack.prototype.contains = function (elem, equalsFunction) {
        return this.list.contains(elem, equalsFunction);
    };
    /**
     * Checks if this stack is empty.
     * @return {boolean} true if and only if this stack contains no items; false
     * otherwise.
     */
    Stack.prototype.isEmpty = function () {
        return this.list.isEmpty();
    };
    /**
     * Removes all of the elements from this stack.
     */
    Stack.prototype.clear = function () {
        this.list.clear();
    };
    /**
     * Executes the provided function once for each element present in this stack in
     * LIFO order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    Stack.prototype.forEach = function (callback) {
        this.list.forEach(callback);
    };
    return Stack;
}()); // End of stack
exports.default = Stack;

},{"./LinkedList":8}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
/**
 * Returns the position of the first occurrence of the specified item
 * within the specified array.4
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the position of the first occurrence of the specified element
 * within the specified array, or -1 if not found.
 */
function indexOf(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    for (var i = 0; i < length; i++) {
        if (equals(array[i], item)) {
            return i;
        }
    }
    return -1;
}
exports.indexOf = indexOf;
/**
 * Returns the position of the last occurrence of the specified element
 * within the specified array.
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the position of the last occurrence of the specified element
 * within the specified array or -1 if not found.
 */
function lastIndexOf(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    for (var i = length - 1; i >= 0; i--) {
        if (equals(array[i], item)) {
            return i;
        }
    }
    return -1;
}
exports.lastIndexOf = lastIndexOf;
/**
 * Returns true if the specified array contains the specified element.
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function to
 * check equality between 2 elements.
 * @return {boolean} true if the specified array contains the specified element.
 */
function contains(array, item, equalsFunction) {
    return indexOf(array, item, equalsFunction) >= 0;
}
exports.contains = contains;
/**
 * Removes the first ocurrence of the specified element from the specified array.
 * @param {*} array the array in which to search element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function to
 * check equality between 2 elements.
 * @return {boolean} true if the array changed after this call.
 */
function remove(array, item, equalsFunction) {
    var index = indexOf(array, item, equalsFunction);
    if (index < 0) {
        return false;
    }
    array.splice(index, 1);
    return true;
}
exports.remove = remove;
/**
 * Returns the number of elements in the specified array equal
 * to the specified object.
 * @param {Array} array the array in which to determine the frequency of the element.
 * @param {Object} item the element whose frequency is to be determined.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the number of elements in the specified array
 * equal to the specified object.
 */
function frequency(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    var freq = 0;
    for (var i = 0; i < length; i++) {
        if (equals(array[i], item)) {
            freq++;
        }
    }
    return freq;
}
exports.frequency = frequency;
/**
 * Returns true if the two specified arrays are equal to one another.
 * Two arrays are considered equal if both arrays contain the same number
 * of elements, and all corresponding pairs of elements in the two
 * arrays are equal and are in the same order.
 * @param {Array} array1 one array to be tested for equality.
 * @param {Array} array2 the other array to be tested for equality.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between elemements in the arrays.
 * @return {boolean} true if the two arrays are equal
 */
function equals(array1, array2, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    if (array1.length !== array2.length) {
        return false;
    }
    var length = array1.length;
    for (var i = 0; i < length; i++) {
        if (!equals(array1[i], array2[i])) {
            return false;
        }
    }
    return true;
}
exports.equals = equals;
/**
 * Returns shallow a copy of the specified array.
 * @param {*} array the array to copy.
 * @return {Array} a copy of the specified array
 */
function copy(array) {
    return array.concat();
}
exports.copy = copy;
/**
 * Swaps the elements at the specified positions in the specified array.
 * @param {Array} array The array in which to swap elements.
 * @param {number} i the index of one element to be swapped.
 * @param {number} j the index of the other element to be swapped.
 * @return {boolean} true if the array is defined and the indexes are valid.
 */
function swap(array, i, j) {
    if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
        return false;
    }
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    return true;
}
exports.swap = swap;
function toString(array) {
    return '[' + array.toString() + ']';
}
exports.toString = toString;
/**
 * Executes the provided function once for each element present in this array
 * starting from index 0 to length - 1.
 * @param {Array} array The array in which to iterate.
 * @param {function(Object):*} callback function to execute, it is
 * invoked with one argument: the element value, to break the iteration you can
 * optionally return false.
 */
function forEach(array, callback) {
    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
        var ele = array_1[_i];
        if (callback(ele) === false) {
            return;
        }
    }
}
exports.forEach = forEach;

},{"./util":16}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _hasOwnProperty = Object.prototype.hasOwnProperty;
exports.has = function (obj, prop) {
    return _hasOwnProperty.call(obj, prop);
};
/**
 * Default function to compare element order.
 * @function
 */
function defaultCompare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a === b) {
        return 0;
    }
    else {
        return 1;
    }
}
exports.defaultCompare = defaultCompare;
/**
 * Default function to test equality.
 * @function
 */
function defaultEquals(a, b) {
    return a === b;
}
exports.defaultEquals = defaultEquals;
/**
 * Default function to convert an object to a string.
 * @function
 */
function defaultToString(item) {
    if (item === null) {
        return 'COLLECTION_NULL';
    }
    else if (isUndefined(item)) {
        return 'COLLECTION_UNDEFINED';
    }
    else if (isString(item)) {
        return '$s' + item;
    }
    else {
        return '$o' + item.toString();
    }
}
exports.defaultToString = defaultToString;
/**
* Joins all the properies of the object using the provided join string
*/
function makeString(item, join) {
    if (join === void 0) { join = ','; }
    if (item === null) {
        return 'COLLECTION_NULL';
    }
    else if (isUndefined(item)) {
        return 'COLLECTION_UNDEFINED';
    }
    else if (isString(item)) {
        return item.toString();
    }
    else {
        var toret = '{';
        var first = true;
        for (var prop in item) {
            if (exports.has(item, prop)) {
                if (first) {
                    first = false;
                }
                else {
                    toret = toret + join;
                }
                toret = toret + prop + ':' + item[prop];
            }
        }
        return toret + '}';
    }
}
exports.makeString = makeString;
/**
 * Checks if the given argument is a function.
 * @function
 */
function isFunction(func) {
    return (typeof func) === 'function';
}
exports.isFunction = isFunction;
/**
 * Checks if the given argument is undefined.
 * @function
 */
function isUndefined(obj) {
    return (typeof obj) === 'undefined';
}
exports.isUndefined = isUndefined;
/**
 * Checks if the given argument is a string.
 * @function
 */
function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}
exports.isString = isString;
/**
 * Reverses a compare function.
 * @function
 */
function reverseCompareFunction(compareFunction) {
    if (isUndefined(compareFunction) || !isFunction(compareFunction)) {
        return function (a, b) {
            if (a < b) {
                return 1;
            }
            else if (a === b) {
                return 0;
            }
            else {
                return -1;
            }
        };
    }
    else {
        return function (d, v) {
            return compareFunction(d, v) * -1;
        };
    }
}
exports.reverseCompareFunction = reverseCompareFunction;
/**
 * Returns an equal function given a compare function.
 * @function
 */
function compareToEquals(compareFunction) {
    return function (a, b) {
        return compareFunction(a, b) === 0;
    };
}
exports.compareToEquals = compareToEquals;

},{}],"typescript-collections":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2013 Basarat Ali Syed. All Rights Reserved.
//
// Licensed under MIT open source license http://opensource.org/licenses/MIT
//
// Orginal javascript code was by Mauricio Santos
//
var _arrays = require("./arrays");
exports.arrays = _arrays;
var Bag_1 = require("./Bag");
exports.Bag = Bag_1.default;
var BSTree_1 = require("./BSTree");
exports.BSTree = BSTree_1.default;
var BSTreeKV_1 = require("./BSTreeKV");
exports.BSTreeKV = BSTreeKV_1.default;
var Dictionary_1 = require("./Dictionary");
exports.Dictionary = Dictionary_1.default;
var Heap_1 = require("./Heap");
exports.Heap = Heap_1.default;
var LinkedDictionary_1 = require("./LinkedDictionary");
exports.LinkedDictionary = LinkedDictionary_1.default;
var LinkedList_1 = require("./LinkedList");
exports.LinkedList = LinkedList_1.default;
var MultiDictionary_1 = require("./MultiDictionary");
exports.MultiDictionary = MultiDictionary_1.default;
var FactoryDictionary_1 = require("./FactoryDictionary");
exports.FactoryDictionary = FactoryDictionary_1.default;
var FactoryDictionary_2 = require("./FactoryDictionary");
exports.DefaultDictionary = FactoryDictionary_2.default;
var Queue_1 = require("./Queue");
exports.Queue = Queue_1.default;
var PriorityQueue_1 = require("./PriorityQueue");
exports.PriorityQueue = PriorityQueue_1.default;
var Set_1 = require("./Set");
exports.Set = Set_1.default;
var Stack_1 = require("./Stack");
exports.Stack = Stack_1.default;
var MultiRootTree_1 = require("./MultiRootTree");
exports.MultiRootTree = MultiRootTree_1.default;
var _util = require("./util");
exports.util = _util;

},{"./BSTree":1,"./BSTreeKV":2,"./Bag":3,"./Dictionary":4,"./FactoryDictionary":5,"./Heap":6,"./LinkedDictionary":7,"./LinkedList":8,"./MultiDictionary":9,"./MultiRootTree":10,"./PriorityQueue":11,"./Queue":12,"./Set":13,"./Stack":14,"./arrays":15,"./util":16}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9CU1RyZWUuanMiLCJkaXN0L2xpYi9CU1RyZWVLVi5qcyIsImRpc3QvbGliL0JhZy5qcyIsImRpc3QvbGliL0RpY3Rpb25hcnkuanMiLCJkaXN0L2xpYi9GYWN0b3J5RGljdGlvbmFyeS5qcyIsImRpc3QvbGliL0hlYXAuanMiLCJkaXN0L2xpYi9MaW5rZWREaWN0aW9uYXJ5LmpzIiwiZGlzdC9saWIvTGlua2VkTGlzdC5qcyIsImRpc3QvbGliL011bHRpRGljdGlvbmFyeS5qcyIsImRpc3QvbGliL011bHRpUm9vdFRyZWUuanMiLCJkaXN0L2xpYi9Qcmlvcml0eVF1ZXVlLmpzIiwiZGlzdC9saWIvUXVldWUuanMiLCJkaXN0L2xpYi9TZXQuanMiLCJkaXN0L2xpYi9TdGFjay5qcyIsImRpc3QvbGliL2FycmF5cy5qcyIsImRpc3QvbGliL3V0aWwuanMiLCJkaXN0L2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9aQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEJTVHJlZUtWXzEgPSByZXF1aXJlKFwiLi9CU1RyZWVLVlwiKTtcbi8qKlxuICogU3BlY2lhbC1jYXNlIG9mIHRoZSBiaW5hcnkgc2VhcmNoIHRyZWUgaW4gd2hpY2ggdGhlIHNlYXJjaCBrZXkgaXMgZXF1YWwgdG8gdGhlIGVsZW1lbnQgdHlwZS5cbiAqIFRoaXMgZGVmaW5pdGlvbiBpcyBzdWl0YWJsZSB3aGVuIHRoZSBlbGVtZW50IHR5cGUgY2FuIG5vdCBiZSBzcGxpdCBiZXR3ZWVuIHdoYXQgZGVmaW5lcyBpdHMgb3JkZXJcbiAqIGFuZCB3aGF0IGRvZXMgbm90IChlZy4gcHJpbWl0aXZlIHR5cGVzIGFzIG9wcG9zZWQgdG8gaW5kZXhlZCByZWNvcmRzKS5cbiAqXG4gKiBUaGUgdGFibGUgYmVsb3cgc2hvd3Mgc29tZSB1c2UtY2FzZSBleGFtcGxlcyBmb3IgYm90aCBpbnRlcmZhY2VzOlxuICpcbiAqICAgICAgICAgICBlbGVtZW50IHR5cGUgICAgICAgICAgICAgIHwgIG1vc3Qgc3VpdGFibGUgaW50ZXJmYWNlXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAgbnVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgQlNUcmVlPG51bWJlcj5cbiAqICAgIHN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgIEJTVHJlZTxzdHJpbmc+XG4gKiB7IG9yZGVyOiBudW1iZXIsIGRhdGE6IHN0cmluZyB9ICAgICB8ICBCU1RyZWVLVjx7b3JkZXI6IG51bWJlcn0sIHtvcmRlcjogbnVtYmVyLCBkYXRhOiBzdHJpbmd9PlxuICpcbiAqIEBzZWUgQlNUcmVlS1ZcbiAqL1xudmFyIEJTVHJlZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQlNUcmVlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEJTVHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gQlNUcmVlO1xufShCU1RyZWVLVl8xLmRlZmF1bHQpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEJTVHJlZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUJTVHJlZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBRdWV1ZV8xID0gcmVxdWlyZShcIi4vUXVldWVcIik7XG4vKipcbiAqIEdlbmVyYWwgYmluYXJ5IHNlYXJjaCB0cmVlIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGFsbG93cyBvbmUgdG8gc2VhcmNoIGVsZW1lbnRzIHVzaW5nIGEgc3Vic2V0IG9mIHRoZWlyIGF0dHJpYnV0ZXMgKHRodXMgdGhlXG4gKiB0cmVlIGNhbiBiZSB1c2VkIGFzIGFuIGluZGV4IGZvciBjb21wbGV4IG9iamVjdHMpLlxuICogVGhlIGF0dHJpYnV0ZXMgcmVxdWlyZWQgdG8gZGVmaW5lIGFuIG9yZGVyaW5nIGluIHRoZSB0cmVlIG11c3QgYmUgZGVmaW5lZCBpbiB0aGUgdHlwZSBLLlxuICogQW55IGFkZGl0aW9uYWwgYXR0cmlidXRlIG11c3QgYmUgZGVmaW5lZCBpbiB0aGUgdHlwZSBWLlxuICpcbiAqIEBzZWUgQlNUcmVlXG4gKi9cbnZhciBCU1RyZWVLViA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IGJpbmFyeSBzZWFyY2ggdHJlZS5cbiAgICAgKiBAY2xhc3MgPHA+QSBiaW5hcnkgc2VhcmNoIHRyZWUgaXMgYSBiaW5hcnkgdHJlZSBpbiB3aGljaCBlYWNoXG4gICAgICogaW50ZXJuYWwgbm9kZSBzdG9yZXMgYW4gZWxlbWVudCBzdWNoIHRoYXQgdGhlIGVsZW1lbnRzIHN0b3JlZCBpbiB0aGVcbiAgICAgKiBsZWZ0IHN1YnRyZWUgYXJlIGxlc3MgdGhhbiBpdCBhbmQgdGhlIGVsZW1lbnRzXG4gICAgICogc3RvcmVkIGluIHRoZSByaWdodCBzdWJ0cmVlIGFyZSBncmVhdGVyLjwvcD5cbiAgICAgKiA8cD5Gb3JtYWxseSwgYSBiaW5hcnkgc2VhcmNoIHRyZWUgaXMgYSBub2RlLWJhc2VkIGJpbmFyeSB0cmVlIGRhdGEgc3RydWN0dXJlIHdoaWNoXG4gICAgICogaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczo8L3A+XG4gICAgICogPHVsPlxuICAgICAqIDxsaT5UaGUgbGVmdCBzdWJ0cmVlIG9mIGEgbm9kZSBjb250YWlucyBvbmx5IG5vZGVzIHdpdGggZWxlbWVudHMgbGVzc1xuICAgICAqIHRoYW4gdGhlIG5vZGUncyBlbGVtZW50PC9saT5cbiAgICAgKiA8bGk+VGhlIHJpZ2h0IHN1YnRyZWUgb2YgYSBub2RlIGNvbnRhaW5zIG9ubHkgbm9kZXMgd2l0aCBlbGVtZW50cyBncmVhdGVyXG4gICAgICogdGhhbiB0aGUgbm9kZSdzIGVsZW1lbnQ8L2xpPlxuICAgICAqIDxsaT5Cb3RoIHRoZSBsZWZ0IGFuZCByaWdodCBzdWJ0cmVlcyBtdXN0IGFsc28gYmUgYmluYXJ5IHNlYXJjaCB0cmVlcy48L2xpPlxuICAgICAqIDwvdWw+XG4gICAgICogPHA+SWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGNvbXBhcmUgZnVuY3Rpb24gbXVzdFxuICAgICAqIGJlIHByb3ZpZGVkIGF0IGNvbnN0cnVjdGlvbiB0aW1lLCBvdGhlcndpc2UgdGhlIDw9LCA9PT0gYW5kID49IG9wZXJhdG9ycyBhcmVcbiAgICAgKiB1c2VkIHRvIGNvbXBhcmUgZWxlbWVudHMuIEV4YW1wbGU6PC9wPlxuICAgICAqIDxwcmU+XG4gICAgICogZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XG4gICAgICogIGlmIChhIGlzIGxlc3MgdGhhbiBiIGJ5IHNvbWUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XG4gICAgICogICAgIHJldHVybiAtMTtcbiAgICAgKiAgfSBpZiAoYSBpcyBncmVhdGVyIHRoYW4gYiBieSB0aGUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XG4gICAgICogICAgIHJldHVybiAxO1xuICAgICAqICB9XG4gICAgICogIC8vIGEgbXVzdCBiZSBlcXVhbCB0byBiXG4gICAgICogIHJldHVybiAwO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOm51bWJlcj19IGNvbXBhcmVGdW5jdGlvbiBvcHRpb25hbFxuICAgICAqIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSB0d28gZWxlbWVudHMuIE11c3QgcmV0dXJuIGEgbmVnYXRpdmUgaW50ZWdlcixcbiAgICAgKiB6ZXJvLCBvciBhIHBvc2l0aXZlIGludGVnZXIgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiwgZXF1YWwgdG8sXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gQlNUcmVlS1YoY29tcGFyZUZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGNvbXBhcmVGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRDb21wYXJlO1xuICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IHRvIHRoaXMgdHJlZSBpZiBpdCBpcyBub3QgYWxyZWFkeSBwcmVzZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGluc2VydC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgdHJlZSBkaWQgbm90IGFscmVhZHkgY29udGFpbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5zZXJ0Tm9kZSh0aGlzLmNyZWF0ZU5vZGUoZWxlbWVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cysrO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyB0cmVlLlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgdHJlZSBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgdHJlZSBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzID09PSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgdHJlZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyB0cmVlLlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyB0cmVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHRyZWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuICAgICAqIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlYXJjaE5vZGUodGhpcy5yb290LCBlbGVtZW50KSAhPT0gbnVsbDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIExvb2tzIGZvciB0aGUgdmFsdWUgd2l0aCB0aGUgcHJvdmlkZWQgc2VhcmNoIGtleS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBUaGUga2V5IHRvIGxvb2sgZm9yXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdmFsdWUgZm91bmQgb3IgdW5kZWZpbmVkIGlmIGl0IHdhcyBub3QgZm91bmQuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciByZXQgPSB0aGlzLnNlYXJjaE5vZGUodGhpcy5yb290LCBlbGVtZW50KTtcbiAgICAgICAgaWYgKHJldCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0LmVsZW1lbnQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBmcm9tIHRoaXMgdHJlZSBpZiBpdCBpcyBwcmVzZW50LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyB0cmVlIGNvbnRhaW5lZCB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5zZWFyY2hOb2RlKHRoaXMucm9vdCwgZWxlbWVudCk7XG4gICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVOb2RlKG5vZGUpO1xuICAgICAgICB0aGlzLm5FbGVtZW50cy0tO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHRyZWUgaW5cbiAgICAgKiBpbi1vcmRlci5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXMgaW52b2tlZCB3aXRoIG9uZVxuICAgICAqIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5pbm9yZGVyVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbEF1eCh0aGlzLnJvb3QsIGNhbGxiYWNrLCB7XG4gICAgICAgICAgICBzdG9wOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHRyZWUgaW4gcHJlLW9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpcyBpbnZva2VkIHdpdGggb25lXG4gICAgICogYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnByZW9yZGVyVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucHJlb3JkZXJUcmF2ZXJzYWxBdXgodGhpcy5yb290LCBjYWxsYmFjaywge1xuICAgICAgICAgICAgc3RvcDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyB0cmVlIGluIHBvc3Qtb3JkZXIuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzIGludm9rZWQgd2l0aCBvbmVcbiAgICAgKiBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUucG9zdG9yZGVyVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucG9zdG9yZGVyVHJhdmVyc2FsQXV4KHRoaXMucm9vdCwgY2FsbGJhY2ssIHtcbiAgICAgICAgICAgIHN0b3A6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpblxuICAgICAqIGxldmVsLW9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpcyBpbnZva2VkIHdpdGggb25lXG4gICAgICogYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmxldmVsVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMubGV2ZWxUcmF2ZXJzYWxBdXgodGhpcy5yb290LCBjYWxsYmFjayk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlLlxuICAgICAqIEByZXR1cm4geyp9IHRoZSBtaW5pbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHRyZWUgaXNcbiAgICAgKiBpcyBlbXB0eS5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUubWluaW11bSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNFbXB0eSgpIHx8IHRoaXMucm9vdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5taW5pbXVtQXV4KHRoaXMucm9vdCkuZWxlbWVudDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG1heGltdW0gZWxlbWVudCBvZiB0aGlzIHRyZWUuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIG1heGltdW0gZWxlbWVudCBvZiB0aGlzIHRyZWUgb3IgdW5kZWZpbmVkIGlmIHRoaXMgdHJlZSBpc1xuICAgICAqIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5tYXhpbXVtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5pc0VtcHR5KCkgfHwgdGhpcy5yb290ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLm1heGltdW1BdXgodGhpcy5yb290KS5lbGVtZW50O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpbiBpbm9yZGVyLlxuICAgICAqIEVxdWl2YWxlbnQgdG8gaW5vcmRlclRyYXZlcnNhbC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuXG4gICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5pbm9yZGVyVHJhdmVyc2FsKGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgdHJlZSBpbiBpbi1vcmRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgdHJlZSBpbiBpbi1vcmRlci5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgYXJyYXkucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoaXMgdHJlZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBoZWlnaHQgb2YgdGhpcyB0cmVlIG9yIC0xIGlmIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5oZWlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodEF1eCh0aGlzLnJvb3QpO1xuICAgIH07XG4gICAgLyoqXG4gICAgKiBAcHJpdmF0ZVxuICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnNlYXJjaE5vZGUgPSBmdW5jdGlvbiAobm9kZSwgZWxlbWVudCkge1xuICAgICAgICB2YXIgY21wID0gMTtcbiAgICAgICAgd2hpbGUgKG5vZGUgIT09IG51bGwgJiYgY21wICE9PSAwKSB7XG4gICAgICAgICAgICBjbXAgPSB0aGlzLmNvbXBhcmUoZWxlbWVudCwgbm9kZS5lbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChjbXAgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUubGVmdENoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY21wID4gMCkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnJpZ2h0Q2g7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcbiAgICAvKipcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUudHJhbnNwbGFudCA9IGZ1bmN0aW9uIChuMSwgbjIpIHtcbiAgICAgICAgaWYgKG4xLnBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5yb290ID0gbjI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobjEgPT09IG4xLnBhcmVudC5sZWZ0Q2gpIHtcbiAgICAgICAgICAgIG4xLnBhcmVudC5sZWZ0Q2ggPSBuMjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG4xLnBhcmVudC5yaWdodENoID0gbjI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG4yICE9PSBudWxsKSB7XG4gICAgICAgICAgICBuMi5wYXJlbnQgPSBuMS5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICogQHByaXZhdGVcbiAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5yZW1vdmVOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubGVmdENoID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zcGxhbnQobm9kZSwgbm9kZS5yaWdodENoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChub2RlLnJpZ2h0Q2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNwbGFudChub2RlLCBub2RlLmxlZnRDaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMubWluaW11bUF1eChub2RlLnJpZ2h0Q2gpO1xuICAgICAgICAgICAgaWYgKHkucGFyZW50ICE9PSBub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BsYW50KHksIHkucmlnaHRDaCk7XG4gICAgICAgICAgICAgICAgeS5yaWdodENoID0gbm9kZS5yaWdodENoO1xuICAgICAgICAgICAgICAgIHkucmlnaHRDaC5wYXJlbnQgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cmFuc3BsYW50KG5vZGUsIHkpO1xuICAgICAgICAgICAgeS5sZWZ0Q2ggPSBub2RlLmxlZnRDaDtcbiAgICAgICAgICAgIHkubGVmdENoLnBhcmVudCA9IHk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICogQHByaXZhdGVcbiAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5pbm9yZGVyVHJhdmVyc2FsQXV4ID0gZnVuY3Rpb24gKG5vZGUsIGNhbGxiYWNrLCBzaWduYWwpIHtcbiAgICAgICAgaWYgKG5vZGUgPT09IG51bGwgfHwgc2lnbmFsLnN0b3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlub3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5sZWZ0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xuICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzaWduYWwuc3RvcCA9IGNhbGxiYWNrKG5vZGUuZWxlbWVudCkgPT09IGZhbHNlO1xuICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlub3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5yaWdodENoLCBjYWxsYmFjaywgc2lnbmFsKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICogQHByaXZhdGVcbiAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5sZXZlbFRyYXZlcnNhbEF1eCA9IGZ1bmN0aW9uIChub2RlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcXVldWUgPSBuZXcgUXVldWVfMS5kZWZhdWx0KCk7XG4gICAgICAgIGlmIChub2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBxdWV1ZS5lbnF1ZXVlKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBxdWV1ZS5kZXF1ZXVlKCkgfHwgbnVsbDtcbiAgICAgICAgd2hpbGUgKG5vZGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKG5vZGUuZWxlbWVudCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUubGVmdENoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcXVldWUuZW5xdWV1ZShub2RlLmxlZnRDaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5yaWdodENoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcXVldWUuZW5xdWV1ZShub2RlLnJpZ2h0Q2gpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZSA9IHF1ZXVlLmRlcXVldWUoKSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUucHJlb3JkZXJUcmF2ZXJzYWxBdXggPSBmdW5jdGlvbiAobm9kZSwgY2FsbGJhY2ssIHNpZ25hbCkge1xuICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNpZ25hbC5zdG9wID0gY2FsbGJhY2sobm9kZS5lbGVtZW50KSA9PT0gZmFsc2U7XG4gICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlb3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5sZWZ0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xuICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZW9yZGVyVHJhdmVyc2FsQXV4KG5vZGUucmlnaHRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUucG9zdG9yZGVyVHJhdmVyc2FsQXV4ID0gZnVuY3Rpb24gKG5vZGUsIGNhbGxiYWNrLCBzaWduYWwpIHtcbiAgICAgICAgaWYgKG5vZGUgPT09IG51bGwgfHwgc2lnbmFsLnN0b3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvc3RvcmRlclRyYXZlcnNhbEF1eChub2RlLmxlZnRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XG4gICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zdG9yZGVyVHJhdmVyc2FsQXV4KG5vZGUucmlnaHRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XG4gICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNpZ25hbC5zdG9wID0gY2FsbGJhY2sobm9kZS5lbGVtZW50KSA9PT0gZmFsc2U7XG4gICAgfTtcbiAgICBCU1RyZWVLVi5wcm90b3R5cGUubWluaW11bUF1eCA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHdoaWxlIChub2RlICE9IG51bGwgJiYgbm9kZS5sZWZ0Q2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLmxlZnRDaDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5tYXhpbXVtQXV4ID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgd2hpbGUgKG5vZGUgIT0gbnVsbCAmJiBub2RlLnJpZ2h0Q2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLnJpZ2h0Q2g7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmhlaWdodEF1eCA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHRoaXMuaGVpZ2h0QXV4KG5vZGUubGVmdENoKSwgdGhpcy5oZWlnaHRBdXgobm9kZS5yaWdodENoKSkgKyAxO1xuICAgIH07XG4gICAgLypcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuaW5zZXJ0Tm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBudWxsO1xuICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLnJvb3Q7XG4gICAgICAgIHdoaWxlIChwb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGNtcCA9IHRoaXMuY29tcGFyZShub2RlLmVsZW1lbnQsIHBvc2l0aW9uLmVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKGNtcCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY21wIDwgMCkge1xuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24ubGVmdENoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyZW50ID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbi5yaWdodENoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xuICAgICAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyB0cmVlIGlzIGVtcHR5XG4gICAgICAgICAgICB0aGlzLnJvb3QgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY29tcGFyZShub2RlLmVsZW1lbnQsIHBhcmVudC5lbGVtZW50KSA8IDApIHtcbiAgICAgICAgICAgIHBhcmVudC5sZWZ0Q2ggPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcGFyZW50LnJpZ2h0Q2ggPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH07XG4gICAgLyoqXG4gICAgKiBAcHJpdmF0ZVxuICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIGxlZnRDaDogbnVsbCxcbiAgICAgICAgICAgIHJpZ2h0Q2g6IG51bGwsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBCU1RyZWVLVjtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBCU1RyZWVLVjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUJTVHJlZUtWLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xudmFyIERpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0RpY3Rpb25hcnlcIik7XG52YXIgU2V0XzEgPSByZXF1aXJlKFwiLi9TZXRcIik7XG52YXIgQmFnID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgYmFnLlxuICAgICAqIEBjbGFzcyA8cD5BIGJhZyBpcyBhIHNwZWNpYWwga2luZCBvZiBzZXQgaW4gd2hpY2ggbWVtYmVycyBhcmVcbiAgICAgKiBhbGxvd2VkIHRvIGFwcGVhciBtb3JlIHRoYW4gb25jZS48L3A+XG4gICAgICogPHA+SWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uXG4gICAgICogd2hpY2ggY29udmVydHMgZWxlbWVudHMgdG8gdW5pcXVlIHN0cmluZ3MgbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHBldFRvU3RyaW5nKHBldCkge1xuICAgICAqICByZXR1cm4gcGV0Lm5hbWU7XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZz19IHRvU3RyRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZFxuICAgICAqIHRvIGNvbnZlcnQgZWxlbWVudHMgdG8gc3RyaW5ncy4gSWYgdGhlIGVsZW1lbnRzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcbiAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGFuIG9iamVjdCBhbmQgcmV0dXJucyBhXG4gICAgICogdW5pcXVlIHN0cmluZyBtdXN0IGJlIHByb3ZpZGVkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEJhZyh0b1N0ckZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMudG9TdHJGID0gdG9TdHJGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRUb1N0cmluZztcbiAgICAgICAgdGhpcy5kaWN0aW9uYXJ5ID0gbmV3IERpY3Rpb25hcnlfMS5kZWZhdWx0KHRoaXMudG9TdHJGKTtcbiAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEFkZHMgbkNvcGllcyBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdCB0byB0aGlzIGJhZy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gYWRkLlxuICAgICogQHBhcmFtIHtudW1iZXI9fSBuQ29waWVzIHRoZSBudW1iZXIgb2YgY29waWVzIHRvIGFkZCwgaWYgdGhpcyBhcmd1bWVudCBpc1xuICAgICogdW5kZWZpbmVkIDEgY29weSBpcyBhZGRlZC5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgdW5sZXNzIGVsZW1lbnQgaXMgdW5kZWZpbmVkLlxuICAgICovXG4gICAgQmFnLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZWxlbWVudCwgbkNvcGllcykge1xuICAgICAgICBpZiAobkNvcGllcyA9PT0gdm9pZCAwKSB7IG5Db3BpZXMgPSAxOyB9XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGVsZW1lbnQpIHx8IG5Db3BpZXMgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgY29waWVzOiBuQ29waWVzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LnNldFZhbHVlKGVsZW1lbnQsIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmdldFZhbHVlKGVsZW1lbnQpLmNvcGllcyArPSBuQ29waWVzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubkVsZW1lbnRzICs9IG5Db3BpZXM7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgLyoqXG4gICAgKiBDb3VudHMgdGhlIG51bWJlciBvZiBjb3BpZXMgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QgaW4gdGhpcyBiYWcuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCB0aGUgb2JqZWN0IHRvIHNlYXJjaCBmb3IuLlxuICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGNvcGllcyBvZiB0aGUgb2JqZWN0LCAwIGlmIG5vdCBmb3VuZFxuICAgICovXG4gICAgQmFnLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmdldFZhbHVlKGVsZW1lbnQpLmNvcGllcztcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgYmFnIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGJhZyBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXG4gICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIEJhZy5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmNvbnRhaW5zS2V5KGVsZW1lbnQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgKiBSZW1vdmVzIG5Db3BpZXMgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QgdG8gdGhpcyBiYWcuXG4gICAgKiBJZiB0aGUgbnVtYmVyIG9mIGNvcGllcyB0byByZW1vdmUgaXMgZ3JlYXRlciB0aGFuIHRoZSBhY3R1YWwgbnVtYmVyXG4gICAgKiBvZiBjb3BpZXMgaW4gdGhlIEJhZywgYWxsIGNvcGllcyBhcmUgcmVtb3ZlZC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gcmVtb3ZlLlxuICAgICogQHBhcmFtIHtudW1iZXI9fSBuQ29waWVzIHRoZSBudW1iZXIgb2YgY29waWVzIHRvIHJlbW92ZSwgaWYgdGhpcyBhcmd1bWVudCBpc1xuICAgICogdW5kZWZpbmVkIDEgY29weSBpcyByZW1vdmVkLlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhdCBsZWFzdCAxIGVsZW1lbnQgd2FzIHJlbW92ZWQuXG4gICAgKi9cbiAgICBCYWcucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBuQ29waWVzKSB7XG4gICAgICAgIGlmIChuQ29waWVzID09PSB2b2lkIDApIHsgbkNvcGllcyA9IDE7IH1cbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQoZWxlbWVudCkgfHwgbkNvcGllcyA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuZGljdGlvbmFyeS5nZXRWYWx1ZShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChuQ29waWVzID4gbm9kZS5jb3BpZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5FbGVtZW50cyAtPSBub2RlLmNvcGllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzIC09IG5Db3BpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlLmNvcGllcyAtPSBuQ29waWVzO1xuICAgICAgICAgICAgaWYgKG5vZGUuY29waWVzIDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkucmVtb3ZlKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgYmlnIGluIGFyYml0cmFyeSBvcmRlcixcbiAgICAgKiBpbmNsdWRpbmcgbXVsdGlwbGUgY29waWVzLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyBiYWcuXG4gICAgICovXG4gICAgQmFnLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5kaWN0aW9uYXJ5LnZhbHVlcygpO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHZhbHVlc18xID0gdmFsdWVzOyBfaSA8IHZhbHVlc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB2YWx1ZXNfMVtfaV07XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IG5vZGUudmFsdWU7XG4gICAgICAgICAgICB2YXIgY29waWVzID0gbm9kZS5jb3BpZXM7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvcGllczsgaisrKSB7XG4gICAgICAgICAgICAgICAgYS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHNldCBvZiB1bmlxdWUgZWxlbWVudHMgaW4gdGhpcyBiYWcuXG4gICAgICogQHJldHVybiB7Y29sbGVjdGlvbnMuU2V0PFQ+fSBhIHNldCBvZiB1bmlxdWUgZWxlbWVudHMgaW4gdGhpcyBiYWcuXG4gICAgICovXG4gICAgQmFnLnByb3RvdHlwZS50b1NldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRvcmV0ID0gbmV3IFNldF8xLmRlZmF1bHQodGhpcy50b1N0ckYpO1xuICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLmRpY3Rpb25hcnkudmFsdWVzKCk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgZWxlbWVudHNfMSA9IGVsZW1lbnRzOyBfaSA8IGVsZW1lbnRzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZWxlID0gZWxlbWVudHNfMVtfaV07XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBlbGUudmFsdWU7XG4gICAgICAgICAgICB0b3JldC5hZGQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b3JldDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnRcbiAgICAgKiBwcmVzZW50IGluIHRoaXMgYmFnLCBpbmNsdWRpbmcgbXVsdGlwbGUgY29waWVzLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50LiBUbyBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW5cbiAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cbiAgICAgKi9cbiAgICBCYWcucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmZvckVhY2goZnVuY3Rpb24gKGssIHYpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHYudmFsdWU7XG4gICAgICAgICAgICB2YXIgY29waWVzID0gdi5jb3BpZXM7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcGllczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBiYWcuXG4gICAgICovXG4gICAgQmFnLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBiYWcgY29udGFpbnMgbm8gZWxlbWVudHMuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGJhZyBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBCYWcucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cyA9PT0gMDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgYmFnLlxuICAgICAqL1xuICAgIEJhZy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcbiAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmNsZWFyKCk7XG4gICAgfTtcbiAgICByZXR1cm4gQmFnO1xufSgpKTsgLy8gRW5kIG9mIGJhZ1xuZXhwb3J0cy5kZWZhdWx0ID0gQmFnO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QmFnLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xudmFyIERpY3Rpb25hcnkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBkaWN0aW9uYXJ5LlxuICAgICAqIEBjbGFzcyA8cD5EaWN0aW9uYXJpZXMgbWFwIGtleXMgdG8gdmFsdWVzOyBlYWNoIGtleSBjYW4gbWFwIHRvIGF0IG1vc3Qgb25lIHZhbHVlLlxuICAgICAqIFRoaXMgaW1wbGVtZW50YXRpb24gYWNjZXB0cyBhbnkga2luZCBvZiBvYmplY3RzIGFzIGtleXMuPC9wPlxuICAgICAqXG4gICAgICogPHA+SWYgdGhlIGtleXMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb24gd2hpY2ggY29udmVydHMga2V5cyB0byB1bmlxdWVcbiAgICAgKiBzdHJpbmdzIG11c3QgYmUgcHJvdmlkZWQuIEV4YW1wbGU6PC9wPlxuICAgICAqIDxwcmU+XG4gICAgICogZnVuY3Rpb24gcGV0VG9TdHJpbmcocGV0KSB7XG4gICAgICogIHJldHVybiBwZXQubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZz19IHRvU3RyRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZFxuICAgICAqIHRvIGNvbnZlcnQga2V5cyB0byBzdHJpbmdzLiBJZiB0aGUga2V5cyBhcmVuJ3Qgc3RyaW5ncyBvciBpZiB0b1N0cmluZygpXG4gICAgICogaXMgbm90IGFwcHJvcHJpYXRlLCBhIGN1c3RvbSBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyBhIGtleSBhbmQgcmV0dXJucyBhXG4gICAgICogdW5pcXVlIHN0cmluZyBtdXN0IGJlIHByb3ZpZGVkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIERpY3Rpb25hcnkodG9TdHJGdW5jdGlvbikge1xuICAgICAgICB0aGlzLnRhYmxlID0ge307XG4gICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcbiAgICAgICAgdGhpcy50b1N0ciA9IHRvU3RyRnVuY3Rpb24gfHwgdXRpbC5kZWZhdWx0VG9TdHJpbmc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICAqIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5nIGZvciB0aGlzIGtleS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBhc3NvY2lhdGVkIHZhbHVlIGlzIHRvIGJlIHJldHVybmVkLlxuICAgICAqIEByZXR1cm4geyp9IHRoZSB2YWx1ZSB0byB3aGljaCB0aGlzIGRpY3Rpb25hcnkgbWFwcyB0aGUgc3BlY2lmaWVkIGtleSBvclxuICAgICAqIHVuZGVmaW5lZCBpZiB0aGUgbWFwIGNvbnRhaW5zIG5vIG1hcHBpbmcgZm9yIHRoaXMga2V5LlxuICAgICAqL1xuICAgIERpY3Rpb25hcnkucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgcGFpciA9IHRoaXMudGFibGVbJyQnICsgdGhpcy50b1N0cihrZXkpXTtcbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQocGFpcikpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBc3NvY2lhdGVzIHRoZSBzcGVjaWZpZWQgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICogSWYgdGhlIGRpY3Rpb25hcnkgcHJldmlvdXNseSBjb250YWluZWQgYSBtYXBwaW5nIGZvciB0aGlzIGtleSwgdGhlIG9sZFxuICAgICAqIHZhbHVlIGlzIHJlcGxhY2VkIGJ5IHRoZSBzcGVjaWZpZWQgdmFsdWUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2l0aCB3aGljaCB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHRvIGJlXG4gICAgICogYXNzb2NpYXRlZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgdmFsdWUgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICAqIEByZXR1cm4geyp9IHByZXZpb3VzIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSwgb3IgdW5kZWZpbmVkIGlmXG4gICAgICogdGhlcmUgd2FzIG5vIG1hcHBpbmcgZm9yIHRoZSBrZXkgb3IgaWYgdGhlIGtleS92YWx1ZSBhcmUgdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIERpY3Rpb25hcnkucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQoa2V5KSB8fCB1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0O1xuICAgICAgICB2YXIgayA9ICckJyArIHRoaXMudG9TdHIoa2V5KTtcbiAgICAgICAgdmFyIHByZXZpb3VzRWxlbWVudCA9IHRoaXMudGFibGVba107XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKHByZXZpb3VzRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzKys7XG4gICAgICAgICAgICByZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXQgPSBwcmV2aW91c0VsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50YWJsZVtrXSA9IHtcbiAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBtYXBwaW5nIGZvciB0aGlzIGtleSBmcm9tIHRoaXMgZGljdGlvbmFyeSBpZiBpdCBpcyBwcmVzZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIG1hcHBpbmcgaXMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZVxuICAgICAqIGRpY3Rpb25hcnkuXG4gICAgICogQHJldHVybiB7Kn0gcHJldmlvdXMgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHNwZWNpZmllZCBrZXksIG9yIHVuZGVmaW5lZCBpZlxuICAgICAqIHRoZXJlIHdhcyBubyBtYXBwaW5nIGZvciBrZXkuXG4gICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgayA9ICckJyArIHRoaXMudG9TdHIoa2V5KTtcbiAgICAgICAgdmFyIHByZXZpb3VzRWxlbWVudCA9IHRoaXMudGFibGVba107XG4gICAgICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZChwcmV2aW91c0VsZW1lbnQpKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy50YWJsZVtrXTtcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzLS07XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXNFbGVtZW50LnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBrZXlzIGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqL1xuICAgIERpY3Rpb25hcnkucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBuYW1lXzEgaW4gdGhpcy50YWJsZSkge1xuICAgICAgICAgICAgaWYgKHV0aWwuaGFzKHRoaXMudGFibGUsIG5hbWVfMSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFpciA9IHRoaXMudGFibGVbbmFtZV8xXTtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHBhaXIua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKi9cbiAgICBEaWN0aW9uYXJ5LnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBuYW1lXzIgaW4gdGhpcy50YWJsZSkge1xuICAgICAgICAgICAgaWYgKHV0aWwuaGFzKHRoaXMudGFibGUsIG5hbWVfMikpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFpciA9IHRoaXMudGFibGVbbmFtZV8yXTtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHBhaXIudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuICAgIC8qKlxuICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2gga2V5LXZhbHVlIHBhaXJcbiAgICAqIHByZXNlbnQgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICAgICogaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM6IGtleSBhbmQgdmFsdWUuIFRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgKi9cbiAgICBEaWN0aW9uYXJ5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGZvciAodmFyIG5hbWVfMyBpbiB0aGlzLnRhYmxlKSB7XG4gICAgICAgICAgICBpZiAodXRpbC5oYXModGhpcy50YWJsZSwgbmFtZV8zKSkge1xuICAgICAgICAgICAgICAgIHZhciBwYWlyID0gdGhpcy50YWJsZVtuYW1lXzNdO1xuICAgICAgICAgICAgICAgIHZhciByZXQgPSBjYWxsYmFjayhwYWlyLmtleSwgcGFpci52YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBhIG1hcHBpbmcgZm9yIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIHByZXNlbmNlIGluIHRoaXMgZGljdGlvbmFyeSBpcyB0byBiZVxuICAgICAqIHRlc3RlZC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBhIG1hcHBpbmcgZm9yIHRoZVxuICAgICAqIHNwZWNpZmllZCBrZXkuXG4gICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUuY29udGFpbnNLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiAhdXRpbC5pc1VuZGVmaW5lZCh0aGlzLmdldFZhbHVlKGtleSkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgKiBSZW1vdmVzIGFsbCBtYXBwaW5ncyBmcm9tIHRoaXMgZGljdGlvbmFyeS5cbiAgICAqIEB0aGlzIHtjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5fVxuICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudGFibGUgPSB7fTtcbiAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBrZXktdmFsdWUgbWFwcGluZ3MgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqL1xuICAgIERpY3Rpb25hcnkucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXG4gICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzIDw9IDA7XG4gICAgfTtcbiAgICBEaWN0aW9uYXJ5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRvcmV0ID0gJ3snO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGssIHYpIHtcbiAgICAgICAgICAgIHRvcmV0ICs9IFwiXFxuXFx0XCIgKyBrICsgXCIgOiBcIiArIHY7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdG9yZXQgKyAnXFxufSc7XG4gICAgfTtcbiAgICByZXR1cm4gRGljdGlvbmFyeTtcbn0oKSk7IC8vIEVuZCBvZiBkaWN0aW9uYXJ5XG5leHBvcnRzLmRlZmF1bHQgPSBEaWN0aW9uYXJ5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RGljdGlvbmFyeS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIERpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0RpY3Rpb25hcnlcIik7XG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG52YXIgRmFjdG9yeURpY3Rpb25hcnkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEZhY3RvcnlEaWN0aW9uYXJ5LCBfc3VwZXIpO1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgZGljdGlvbmFyeS5cbiAgICAgKiBAY2xhc3MgPHA+RGljdGlvbmFyaWVzIG1hcCBrZXlzIHRvIHZhbHVlczsgZWFjaCBrZXkgY2FuIG1hcCB0byBhdCBtb3N0IG9uZSB2YWx1ZS5cbiAgICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIGFjY2VwdHMgYW55IGtpbmQgb2Ygb2JqZWN0cyBhcyBrZXlzLjwvcD5cbiAgICAgKlxuICAgICAqIDxwPlRoZSBkZWZhdWx0IGZhY3RvcnkgZnVuY3Rpb24gc2hvdWxkIHJldHVybiBhIG5ldyBvYmplY3Qgb2YgdGhlIHByb3ZpZGVkXG4gICAgICogdHlwZS4gRXhhbXBsZTo8L3A+XG4gICAgICogPHByZT5cbiAgICAgKiBmdW5jdGlvbiBwZXRGYWN0b3J5KCkge1xuICAgICAqICByZXR1cm4gbmV3IFBldCgpO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIDxwPklmIHRoZSBrZXlzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIHdoaWNoIGNvbnZlcnRzIGtleXMgdG8gdW5pcXVlXG4gICAgICogc3RyaW5ncyBtdXN0IGJlIHByb3ZpZGVkLiBFeGFtcGxlOjwvcD5cbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHBldFRvU3RyaW5nKHBldCkge1xuICAgICAqICByZXR1cm4gcGV0Lm5hbWU7XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpWPX0gZGVmYXVsdEZhY3RvcnlGdW5jdGlvbiBmdW5jdGlvbiB1c2VkIHRvIGNyZWF0ZSBhXG4gICAgICogZGVmYXVsdCBvYmplY3QuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZz19IHRvU3RyRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZFxuICAgICAqIHRvIGNvbnZlcnQga2V5cyB0byBzdHJpbmdzLiBJZiB0aGUga2V5cyBhcmVuJ3Qgc3RyaW5ncyBvciBpZiB0b1N0cmluZygpXG4gICAgICogaXMgbm90IGFwcHJvcHJpYXRlLCBhIGN1c3RvbSBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyBhIGtleSBhbmQgcmV0dXJucyBhXG4gICAgICogdW5pcXVlIHN0cmluZyBtdXN0IGJlIHByb3ZpZGVkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEZhY3RvcnlEaWN0aW9uYXJ5KGRlZmF1bHRGYWN0b3J5RnVuY3Rpb24sIHRvU3RyRnVuY3Rpb24pIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgdG9TdHJGdW5jdGlvbikgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuZGVmYXVsdEZhY3RvcnlGdW5jdGlvbiA9IGRlZmF1bHRGYWN0b3J5RnVuY3Rpb247XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXNzb2NpYXRlcyB0aGUgc3BlY2lmaWVkIGRlZmF1bHQgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBpbiB0aGlzIGRpY3Rpb25hcnksXG4gICAgICogaWYgaXQgZGlkbid0IGNvbnRhaW4gdGhlIGtleSB5ZXQuIElmIHRoZSBrZXkgZXhpc3RlZCwgdGhlIGV4aXN0aW5nIHZhbHVlIHdpbGwgYmUgdXNlZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aXRoIHdoaWNoIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgdG8gYmVcbiAgICAgKiBhc3NvY2lhdGVkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0VmFsdWUgZGVmYXVsdCB2YWx1ZSB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gICAgICogQHJldHVybiB7Kn0gcHJldmlvdXMgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LCBvciB0aGUgZGVmYXVsdCB2YWx1ZSxcbiAgICAgKiBpZiB0aGUga2V5IGRpZG4ndCBleGlzdCB5ZXQuXG4gICAgICovXG4gICAgRmFjdG9yeURpY3Rpb25hcnkucHJvdG90eXBlLnNldERlZmF1bHQgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IF9zdXBlci5wcm90b3R5cGUuZ2V0VmFsdWUuY2FsbCh0aGlzLCBrZXkpO1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFZhbHVlKGtleSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICAqIFJldHVybnMgYSBkZWZhdWx0IHZhbHVlIGNyZWF0ZWQgYnkgdGhlIGZhY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3RvcixcbiAgICAgKiBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhpcyBrZXkuIFRoZSBtaXNzaW5nIGtleSB3aWxsXG4gICAgICogYXV0b21hdGljYWxseSBiZSBhZGRlZCB0byB0aGUgZGljdGlvbmFyeS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBhc3NvY2lhdGVkIHZhbHVlIGlzIHRvIGJlIHJldHVybmVkLlxuICAgICAqIEByZXR1cm4geyp9IHRoZSB2YWx1ZSB0byB3aGljaCB0aGlzIGRpY3Rpb25hcnkgbWFwcyB0aGUgc3BlY2lmaWVkIGtleSBvclxuICAgICAqIGEgZGVmYXVsdCB2YWx1ZSBpZiB0aGUgbWFwIGNvbnRhaW5zIG5vIG1hcHBpbmcgZm9yIHRoaXMga2V5LlxuICAgICAqL1xuICAgIEZhY3RvcnlEaWN0aW9uYXJ5LnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGVmYXVsdChrZXksIHRoaXMuZGVmYXVsdEZhY3RvcnlGdW5jdGlvbigpKTtcbiAgICB9O1xuICAgIHJldHVybiBGYWN0b3J5RGljdGlvbmFyeTtcbn0oRGljdGlvbmFyeV8xLmRlZmF1bHQpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEZhY3RvcnlEaWN0aW9uYXJ5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RmFjdG9yeURpY3Rpb25hcnkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgY29sbGVjdGlvbnMgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xudmFyIGFycmF5cyA9IHJlcXVpcmUoXCIuL2FycmF5c1wiKTtcbnZhciBIZWFwID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgSGVhcC5cbiAgICAgKiBAY2xhc3NcbiAgICAgKiA8cD5BIGhlYXAgaXMgYSBiaW5hcnkgdHJlZSwgd2hlcmUgdGhlIG5vZGVzIG1haW50YWluIHRoZSBoZWFwIHByb3BlcnR5OlxuICAgICAqIGVhY2ggbm9kZSBpcyBzbWFsbGVyIHRoYW4gZWFjaCBvZiBpdHMgY2hpbGRyZW4gYW5kIHRoZXJlZm9yZSBhIE1pbkhlYXBcbiAgICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIHVzZXMgYW4gYXJyYXkgdG8gc3RvcmUgZWxlbWVudHMuPC9wPlxuICAgICAqIDxwPklmIHRoZSBpbnNlcnRlZCBlbGVtZW50cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBjb21wYXJlIGZ1bmN0aW9uIG11c3QgYmUgcHJvdmlkZWQsXG4gICAgICogIGF0IGNvbnN0cnVjdGlvbiB0aW1lLCBvdGhlcndpc2UgdGhlIDw9LCA9PT0gYW5kID49IG9wZXJhdG9ycyBhcmVcbiAgICAgKiB1c2VkIHRvIGNvbXBhcmUgZWxlbWVudHMuIEV4YW1wbGU6PC9wPlxuICAgICAqXG4gICAgICogPHByZT5cbiAgICAgKiBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgICAgKiAgaWYgKGEgaXMgbGVzcyB0aGFuIGIgYnkgc29tZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcbiAgICAgKiAgICAgcmV0dXJuIC0xO1xuICAgICAqICB9IGlmIChhIGlzIGdyZWF0ZXIgdGhhbiBiIGJ5IHRoZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcbiAgICAgKiAgICAgcmV0dXJuIDE7XG4gICAgICogIH1cbiAgICAgKiAgLy8gYSBtdXN0IGJlIGVxdWFsIHRvIGJcbiAgICAgKiAgcmV0dXJuIDA7XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogPHA+SWYgYSBNYXgtSGVhcCBpcyB3YW50ZWQgKGdyZWF0ZXIgZWxlbWVudHMgb24gdG9wKSB5b3UgY2FuIGEgcHJvdmlkZSBhXG4gICAgICogcmV2ZXJzZSBjb21wYXJlIGZ1bmN0aW9uIHRvIGFjY29tcGxpc2ggdGhhdCBiZWhhdmlvci4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHJldmVyc2VDb21wYXJlKGEsIGIpIHtcbiAgICAgKiAgaWYgKGEgaXMgbGVzcyB0aGFuIGIgYnkgc29tZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcbiAgICAgKiAgICAgcmV0dXJuIDE7XG4gICAgICogIH0gaWYgKGEgaXMgZ3JlYXRlciB0aGFuIGIgYnkgdGhlIG9yZGVyaW5nIGNyaXRlcmlvbikge1xuICAgICAqICAgICByZXR1cm4gLTE7XG4gICAgICogIH1cbiAgICAgKiAgLy8gYSBtdXN0IGJlIGVxdWFsIHRvIGJcbiAgICAgKiAgcmV0dXJuIDA7XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpudW1iZXI9fSBjb21wYXJlRnVuY3Rpb24gb3B0aW9uYWxcbiAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNvbXBhcmUgdHdvIGVsZW1lbnRzLiBNdXN0IHJldHVybiBhIG5lZ2F0aXZlIGludGVnZXIsXG4gICAgICogemVybywgb3IgYSBwb3NpdGl2ZSBpbnRlZ2VyIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBsZXNzIHRoYW4sIGVxdWFsIHRvLFxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiB0aGUgc2Vjb25kLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEhlYXAoY29tcGFyZUZ1bmN0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSB1c2VkIHRvIHN0b3JlIHRoZSBlbGVtZW50cyBvZiB0aGUgaGVhcC5cbiAgICAgICAgICogQHR5cGUge0FycmF5LjxPYmplY3Q+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGNvbXBhcmVGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0Q29tcGFyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGxlZnQgY2hpbGQgb2YgdGhlIG5vZGUgYXQgdGhlIGdpdmVuIGluZGV4LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBub2RlSW5kZXggVGhlIGluZGV4IG9mIHRoZSBub2RlIHRvIGdldCB0aGUgbGVmdCBjaGlsZFxuICAgICAqIGZvci5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgbGVmdCBjaGlsZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLmxlZnRDaGlsZEluZGV4ID0gZnVuY3Rpb24gKG5vZGVJbmRleCkge1xuICAgICAgICByZXR1cm4gKDIgKiBub2RlSW5kZXgpICsgMTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSByaWdodCBjaGlsZCBvZiB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gZ2V0IHRoZSByaWdodCBjaGlsZFxuICAgICAqIGZvci5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgcmlnaHQgY2hpbGQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5yaWdodENoaWxkSW5kZXggPSBmdW5jdGlvbiAobm9kZUluZGV4KSB7XG4gICAgICAgIHJldHVybiAoMiAqIG5vZGVJbmRleCkgKyAyO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIHBhcmVudCBvZiB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gZ2V0IHRoZSBwYXJlbnQgZm9yLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBwYXJlbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5wYXJlbnRJbmRleCA9IGZ1bmN0aW9uIChub2RlSW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKG5vZGVJbmRleCAtIDEpIC8gMik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgc21hbGxlciBjaGlsZCBub2RlIChpZiBpdCBleGlzdHMpLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0Q2hpbGQgbGVmdCBjaGlsZCBpbmRleC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmlnaHRDaGlsZCByaWdodCBjaGlsZCBpbmRleC5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBpbmRleCB3aXRoIHRoZSBtaW5pbXVtIHZhbHVlIG9yIC0xIGlmIGl0IGRvZXNuJ3RcbiAgICAgKiBleGlzdHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5taW5JbmRleCA9IGZ1bmN0aW9uIChsZWZ0Q2hpbGQsIHJpZ2h0Q2hpbGQpIHtcbiAgICAgICAgaWYgKHJpZ2h0Q2hpbGQgPj0gdGhpcy5kYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGxlZnRDaGlsZCA+PSB0aGlzLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRDaGlsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbXBhcmUodGhpcy5kYXRhW2xlZnRDaGlsZF0sIHRoaXMuZGF0YVtyaWdodENoaWxkXSkgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0Q2hpbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmlnaHRDaGlsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogTW92ZXMgdGhlIG5vZGUgYXQgdGhlIGdpdmVuIGluZGV4IHVwIHRvIGl0cyBwcm9wZXIgcGxhY2UgaW4gdGhlIGhlYXAuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSB0byBtb3ZlIHVwLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUuc2lmdFVwID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudEluZGV4KGluZGV4KTtcbiAgICAgICAgd2hpbGUgKGluZGV4ID4gMCAmJiB0aGlzLmNvbXBhcmUodGhpcy5kYXRhW3BhcmVudF0sIHRoaXMuZGF0YVtpbmRleF0pID4gMCkge1xuICAgICAgICAgICAgYXJyYXlzLnN3YXAodGhpcy5kYXRhLCBwYXJlbnQsIGluZGV4KTtcbiAgICAgICAgICAgIGluZGV4ID0gcGFyZW50O1xuICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5wYXJlbnRJbmRleChpbmRleCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE1vdmVzIHRoZSBub2RlIGF0IHRoZSBnaXZlbiBpbmRleCBkb3duIHRvIGl0cyBwcm9wZXIgcGxhY2UgaW4gdGhlIGhlYXAuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gbW92ZSBkb3duLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUuc2lmdERvd24gPSBmdW5jdGlvbiAobm9kZUluZGV4KSB7XG4gICAgICAgIC8vc21hbGxlciBjaGlsZCBpbmRleFxuICAgICAgICB2YXIgbWluID0gdGhpcy5taW5JbmRleCh0aGlzLmxlZnRDaGlsZEluZGV4KG5vZGVJbmRleCksIHRoaXMucmlnaHRDaGlsZEluZGV4KG5vZGVJbmRleCkpO1xuICAgICAgICB3aGlsZSAobWluID49IDAgJiYgdGhpcy5jb21wYXJlKHRoaXMuZGF0YVtub2RlSW5kZXhdLCB0aGlzLmRhdGFbbWluXSkgPiAwKSB7XG4gICAgICAgICAgICBhcnJheXMuc3dhcCh0aGlzLmRhdGEsIG1pbiwgbm9kZUluZGV4KTtcbiAgICAgICAgICAgIG5vZGVJbmRleCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IHRoaXMubWluSW5kZXgodGhpcy5sZWZ0Q2hpbGRJbmRleChub2RlSW5kZXgpLCB0aGlzLnJpZ2h0Q2hpbGRJbmRleChub2RlSW5kZXgpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGhlYXAuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIHZhbHVlIGF0IHRoZSByb290IG9mIHRoZSBoZWFwLiBSZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGVcbiAgICAgKiBoZWFwIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGdpdmVuIGVsZW1lbnQgaW50byB0aGUgaGVhcC5cbiAgICAgKiBAcGFyYW0geyp9IGVsZW1lbnQgdGhlIGVsZW1lbnQuXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBhZGRlZCBvciBmYWxzIGlmIGl0IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRhdGEucHVzaChlbGVtZW50KTtcbiAgICAgICAgdGhpcy5zaWZ0VXAodGhpcy5kYXRhLmxlbmd0aCAtIDEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyBhbmQgcmVtb3ZlcyB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgaGVhcC5cbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgdmFsdWUgcmVtb3ZlZCBmcm9tIHRoZSByb290IG9mIHRoZSBoZWFwLiBSZXR1cm5zXG4gICAgICogdW5kZWZpbmVkIGlmIHRoZSBoZWFwIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLnJlbW92ZVJvb3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSA9IHRoaXMuZGF0YVt0aGlzLmRhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB0aGlzLmRhdGEuc3BsaWNlKHRoaXMuZGF0YS5sZW5ndGggLSAxLCAxKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2lmdERvd24oMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBoZWFwIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIEhlYXAgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LCBmYWxzZVxuICAgICAqIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciBlcXVGID0gY29sbGVjdGlvbnMuY29tcGFyZVRvRXF1YWxzKHRoaXMuY29tcGFyZSk7XG4gICAgICAgIHJldHVybiBhcnJheXMuY29udGFpbnModGhpcy5kYXRhLCBlbGVtZW50LCBlcXVGKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGhlYXAuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgaGVhcC5cbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGlzIGhlYXAgaXMgZW1wdHkuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbmQgb25seSBpZiB0aGlzIGhlYXAgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoIDw9IDA7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIGhlYXAuXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgaGVhcCBpblxuICAgICAqIG5vIHBhcnRpY3VsYXIgb3JkZXIuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXG4gICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgYXJyYXlzLmZvckVhY2godGhpcy5kYXRhLCBjYWxsYmFjayk7XG4gICAgfTtcbiAgICByZXR1cm4gSGVhcDtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBIZWFwO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9SGVhcC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIERpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0RpY3Rpb25hcnlcIik7XG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG4vKipcbiAqIFRoaXMgY2xhc3MgaXMgdXNlZCBieSB0aGUgTGlua2VkRGljdGlvbmFyeSBJbnRlcm5hbGx5XG4gKiBIYXMgdG8gYmUgYSBjbGFzcywgbm90IGFuIGludGVyZmFjZSwgYmVjYXVzZSBpdCBuZWVkcyB0byBoYXZlXG4gKiB0aGUgJ3VubGluaycgZnVuY3Rpb24gZGVmaW5lZC5cbiAqL1xudmFyIExpbmtlZERpY3Rpb25hcnlQYWlyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExpbmtlZERpY3Rpb25hcnlQYWlyKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgTGlua2VkRGljdGlvbmFyeVBhaXIucHJvdG90eXBlLnVubGluayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wcmV2Lm5leHQgPSB0aGlzLm5leHQ7XG4gICAgICAgIHRoaXMubmV4dC5wcmV2ID0gdGhpcy5wcmV2O1xuICAgIH07XG4gICAgcmV0dXJuIExpbmtlZERpY3Rpb25hcnlQYWlyO1xufSgpKTtcbi8qKlxuICogVGhlIGhlYWQgYW5kIHRhaWwgZWxlbWVudHMgb2YgdGhlIGxpc3QgaGF2ZSBudWxsIGtleSBhbmQgdmFsdWUgcHJvcGVydGllcyBidXQgdGhleVxuICogdXN1YWxseSBsaW5rIHRvIG5vcm1hbCBub2Rlcy5cbiAqL1xudmFyIEhlYWRPclRhaWxMaW5rZWREaWN0aW9uYXJ5UGFpciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIZWFkT3JUYWlsTGlua2VkRGljdGlvbmFyeVBhaXIoKSB7XG4gICAgICAgIHRoaXMua2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgfVxuICAgIEhlYWRPclRhaWxMaW5rZWREaWN0aW9uYXJ5UGFpci5wcm90b3R5cGUudW5saW5rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnByZXYubmV4dCA9IHRoaXMubmV4dDtcbiAgICAgICAgdGhpcy5uZXh0LnByZXYgPSB0aGlzLnByZXY7XG4gICAgfTtcbiAgICByZXR1cm4gSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyO1xufSgpKTtcbmZ1bmN0aW9uIGlzSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyKHApIHtcbiAgICByZXR1cm4gcC5uZXh0ID09PSBudWxsO1xufVxudmFyIExpbmtlZERpY3Rpb25hcnkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKExpbmtlZERpY3Rpb25hcnksIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gTGlua2VkRGljdGlvbmFyeSh0b1N0ckZ1bmN0aW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIHRvU3RyRnVuY3Rpb24pIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmhlYWQgPSBuZXcgSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyKCk7XG4gICAgICAgIF90aGlzLnRhaWwgPSBuZXcgSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyKCk7XG4gICAgICAgIF90aGlzLmhlYWQubmV4dCA9IF90aGlzLnRhaWw7XG4gICAgICAgIF90aGlzLnRhaWwucHJldiA9IF90aGlzLmhlYWQ7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgbmV3IG5vZGUgdG8gdGhlICd0YWlsJyBvZiB0aGUgbGlzdCwgdXBkYXRpbmcgdGhlXG4gICAgICogbmVpZ2hib3JzLCBhbmQgbW92aW5nICd0aGlzLnRhaWwnICh0aGUgRW5kIG9mIExpc3QgaW5kaWNhdG9yKSB0aGF0XG4gICAgICogdG8gdGhlIGVuZC5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5hcHBlbmRUb1RhaWwgPSBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgdmFyIGxhc3ROb2RlID0gdGhpcy50YWlsLnByZXY7XG4gICAgICAgIGxhc3ROb2RlLm5leHQgPSBlbnRyeTtcbiAgICAgICAgZW50cnkucHJldiA9IGxhc3ROb2RlO1xuICAgICAgICBlbnRyeS5uZXh0ID0gdGhpcy50YWlsO1xuICAgICAgICB0aGlzLnRhaWwucHJldiA9IGVudHJ5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIGEgbGlua2VkIGRpY3Rpb25hcnkgZnJvbSB0aGUgdGFibGUgaW50ZXJuYWxseVxuICAgICAqL1xuICAgIExpbmtlZERpY3Rpb25hcnkucHJvdG90eXBlLmdldExpbmtlZERpY3Rpb25hcnlQYWlyID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihrZXkpO1xuICAgICAgICB2YXIgcGFpciA9ICh0aGlzLnRhYmxlW2tdKTtcbiAgICAgICAgcmV0dXJuIHBhaXI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSB0byB3aGljaCB0aGlzIGRpY3Rpb25hcnkgbWFwcyB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBSZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhpcyBrZXkuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgYXNzb2NpYXRlZCB2YWx1ZSBpcyB0byBiZSByZXR1cm5lZC5cbiAgICAgKiBAcmV0dXJuIHsqfSB0aGUgdmFsdWUgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHMgdGhlIHNwZWNpZmllZCBrZXkgb3JcbiAgICAgKiB1bmRlZmluZWQgaWYgdGhlIG1hcCBjb250YWlucyBubyBtYXBwaW5nIGZvciB0aGlzIGtleS5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHBhaXIgPSB0aGlzLmdldExpbmtlZERpY3Rpb25hcnlQYWlyKGtleSk7XG4gICAgICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZChwYWlyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG1hcHBpbmcgZm9yIHRoaXMga2V5IGZyb20gdGhpcyBkaWN0aW9uYXJ5IGlmIGl0IGlzIHByZXNlbnQuXG4gICAgICogQWxzbywgaWYgYSB2YWx1ZSBpcyBwcmVzZW50IGZvciB0aGlzIGtleSwgdGhlIGVudHJ5IGlzIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBpbnNlcnRpb24gb3JkZXJpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgbWFwcGluZyBpcyB0byBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGljdGlvbmFyeS5cbiAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggc3BlY2lmaWVkIGtleSwgb3IgdW5kZWZpbmVkIGlmXG4gICAgICogdGhlcmUgd2FzIG5vIG1hcHBpbmcgZm9yIGtleS5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBwYWlyID0gdGhpcy5nZXRMaW5rZWREaWN0aW9uYXJ5UGFpcihrZXkpO1xuICAgICAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQocGFpcikpIHtcbiAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUucmVtb3ZlLmNhbGwodGhpcywga2V5KTsgLy8gVGhpcyB3aWxsIHJlbW92ZSBpdCBmcm9tIHRoZSB0YWJsZVxuICAgICAgICAgICAgcGFpci51bmxpbmsoKTsgLy8gVGhpcyB3aWxsIHVubGluayBpdCBmcm9tIHRoZSBjaGFpblxuICAgICAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICogUmVtb3ZlcyBhbGwgbWFwcGluZ3MgZnJvbSB0aGlzIExpbmtlZERpY3Rpb25hcnkuXG4gICAgKiBAdGhpcyB7Y29sbGVjdGlvbnMuTGlua2VkRGljdGlvbmFyeX1cbiAgICAqL1xuICAgIExpbmtlZERpY3Rpb25hcnkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfc3VwZXIucHJvdG90eXBlLmNsZWFyLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuaGVhZC5uZXh0ID0gdGhpcy50YWlsO1xuICAgICAgICB0aGlzLnRhaWwucHJldiA9IHRoaXMuaGVhZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgd2hlbiB1cGRhdGluZyBhbiBleGlzdGluZyBLZXlWYWx1ZSBwYWlyLlxuICAgICAqIEl0IHBsYWNlcyB0aGUgbmV3IHZhbHVlIGluZGV4ZWQgYnkga2V5IGludG8gdGhlIHRhYmxlLCBidXQgbWFpbnRhaW5zXG4gICAgICogaXRzIHBsYWNlIGluIHRoZSBsaW5rZWQgb3JkZXJpbmcuXG4gICAgICovXG4gICAgTGlua2VkRGljdGlvbmFyeS5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIChvbGRQYWlyLCBuZXdQYWlyKSB7XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihuZXdQYWlyLmtleSk7XG4gICAgICAgIC8vIHNldCB0aGUgbmV3IFBhaXIncyBsaW5rcyB0byBleGlzdGluZ1BhaXIncyBsaW5rc1xuICAgICAgICBuZXdQYWlyLm5leHQgPSBvbGRQYWlyLm5leHQ7XG4gICAgICAgIG5ld1BhaXIucHJldiA9IG9sZFBhaXIucHJldjtcbiAgICAgICAgLy8gRGVsZXRlIEV4aXN0aW5nIFBhaXIgZnJvbSB0aGUgdGFibGUsIHVubGluayBpdCBmcm9tIGNoYWluLlxuICAgICAgICAvLyBBcyBhIHJlc3VsdCwgdGhlIG5FbGVtZW50cyBnZXRzIGRlY3JlbWVudGVkIGJ5IHRoaXMgb3BlcmF0aW9uXG4gICAgICAgIHRoaXMucmVtb3ZlKG9sZFBhaXIua2V5KTtcbiAgICAgICAgLy8gTGluayBuZXcgUGFpciBpbiBwbGFjZSBvZiB3aGVyZSBvbGRQYWlyIHdhcyxcbiAgICAgICAgLy8gYnkgcG9pbnRpbmcgdGhlIG9sZCBwYWlyJ3MgbmVpZ2hib3JzIHRvIGl0LlxuICAgICAgICBuZXdQYWlyLnByZXYubmV4dCA9IG5ld1BhaXI7XG4gICAgICAgIG5ld1BhaXIubmV4dC5wcmV2ID0gbmV3UGFpcjtcbiAgICAgICAgdGhpcy50YWJsZVtrXSA9IG5ld1BhaXI7XG4gICAgICAgIC8vIFRvIG1ha2UgdXAgZm9yIHRoZSBmYWN0IHRoYXQgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3YXMgZGVjcmVtZW50ZWQsXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gaW5jcmVhc2UgaXQgYnkgb25lLlxuICAgICAgICArK3RoaXMubkVsZW1lbnRzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQXNzb2NpYXRlcyB0aGUgc3BlY2lmaWVkIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCBrZXkgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqIElmIHRoZSBkaWN0aW9uYXJ5IHByZXZpb3VzbHkgY29udGFpbmVkIGEgbWFwcGluZyBmb3IgdGhpcyBrZXksIHRoZSBvbGRcbiAgICAgKiB2YWx1ZSBpcyByZXBsYWNlZCBieSB0aGUgc3BlY2lmaWVkIHZhbHVlLlxuICAgICAqIFVwZGF0aW5nIG9mIGEga2V5IHRoYXQgYWxyZWFkeSBleGlzdHMgbWFpbnRhaW5zIGl0cyBwbGFjZSBpbiB0aGVcbiAgICAgKiBpbnNlcnRpb24gb3JkZXIgaW50byB0aGUgbWFwLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdpdGggd2hpY2ggdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyB0byBiZVxuICAgICAqIGFzc29jaWF0ZWQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIHZhbHVlIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXksIG9yIHVuZGVmaW5lZCBpZlxuICAgICAqIHRoZXJlIHdhcyBubyBtYXBwaW5nIGZvciB0aGUga2V5IG9yIGlmIHRoZSBrZXkvdmFsdWUgYXJlIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGtleSkgfHwgdXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGV4aXN0aW5nUGFpciA9IHRoaXMuZ2V0TGlua2VkRGljdGlvbmFyeVBhaXIoa2V5KTtcbiAgICAgICAgdmFyIG5ld1BhaXIgPSBuZXcgTGlua2VkRGljdGlvbmFyeVBhaXIoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihrZXkpO1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIGVsZW1lbnQgZm9yIHRoYXQga2V5LCB3ZVxuICAgICAgICAvLyBrZWVwIGl0J3MgcGxhY2UgaW4gdGhlIExpbmtlZExpc3RcbiAgICAgICAgaWYgKCF1dGlsLmlzVW5kZWZpbmVkKGV4aXN0aW5nUGFpcikpIHtcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZShleGlzdGluZ1BhaXIsIG5ld1BhaXIpO1xuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nUGFpci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kVG9UYWlsKG5ld1BhaXIpO1xuICAgICAgICAgICAgdGhpcy50YWJsZVtrXSA9IG5ld1BhaXI7XG4gICAgICAgICAgICArK3RoaXMubkVsZW1lbnRzO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIExpbmtlZERpY3Rpb25hcnksIG9yZGVyZWRcbiAgICAgKiBieSBpbnNlcnRpb24gb3JkZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBrZXlzIGluIHRoaXMgTGlua2VkRGljdGlvbmFyeSxcbiAgICAgKiBvcmRlcmVkIGJ5IGluc2VydGlvbiBvcmRlci5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKGtleSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBMaW5rZWREaWN0aW9uYXJ5LCBvcmRlcmVkIGJ5XG4gICAgICogaW5zZXJ0aW9uIG9yZGVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMgTGlua2VkRGljdGlvbmFyeSxcbiAgICAgKiBvcmRlcmVkIGJ5IGluc2VydGlvbiBvcmRlci5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gICAgLyoqXG4gICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBrZXktdmFsdWUgcGFpclxuICAgICogcHJlc2VudCBpbiB0aGlzIExpbmtlZERpY3Rpb25hcnkuIEl0IGlzIGRvbmUgaW4gdGhlIG9yZGVyIG9mIGluc2VydGlvblxuICAgICogaW50byB0aGUgTGlua2VkRGljdGlvbmFyeVxuICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICAgICogaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM6IGtleSBhbmQgdmFsdWUuIFRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjcmF3bE5vZGUgPSB0aGlzLmhlYWQubmV4dDtcbiAgICAgICAgd2hpbGUgKCFpc0hlYWRPclRhaWxMaW5rZWREaWN0aW9uYXJ5UGFpcihjcmF3bE5vZGUpKSB7XG4gICAgICAgICAgICB2YXIgcmV0ID0gY2FsbGJhY2soY3Jhd2xOb2RlLmtleSwgY3Jhd2xOb2RlLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3Jhd2xOb2RlID0gY3Jhd2xOb2RlLm5leHQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBMaW5rZWREaWN0aW9uYXJ5O1xufShEaWN0aW9uYXJ5XzEuZGVmYXVsdCkpOyAvLyBFbmQgb2YgTGlua2VkRGljdGlvbmFyeVxuZXhwb3J0cy5kZWZhdWx0ID0gTGlua2VkRGljdGlvbmFyeTtcbi8vIC8qKlxuLy8gICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBpcyBlcXVhbCB0byB0aGUgZ2l2ZW4gZGljdGlvbmFyeS5cbi8vICAqIFR3byBkaWN0aW9uYXJpZXMgYXJlIGVxdWFsIGlmIHRoZXkgY29udGFpbiB0aGUgc2FtZSBtYXBwaW5ncy5cbi8vICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuRGljdGlvbmFyeX0gb3RoZXIgdGhlIG90aGVyIGRpY3Rpb25hcnkuXG4vLyAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSB2YWx1ZXNFcXVhbEZ1bmN0aW9uIG9wdGlvbmFsXG4vLyAgKiBmdW5jdGlvbiB1c2VkIHRvIGNoZWNrIGlmIHR3byB2YWx1ZXMgYXJlIGVxdWFsLlxuLy8gICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgaXMgZXF1YWwgdG8gdGhlIGdpdmVuIGRpY3Rpb25hcnkuXG4vLyAgKi9cbi8vIGNvbGxlY3Rpb25zLkRpY3Rpb25hcnkucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG90aGVyLHZhbHVlc0VxdWFsRnVuY3Rpb24pIHtcbi8vIFx0Y29uc3QgZXFGID0gdmFsdWVzRXF1YWxGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xuLy8gXHRpZighKG90aGVyIGluc3RhbmNlb2YgY29sbGVjdGlvbnMuRGljdGlvbmFyeSkpe1xuLy8gXHRcdHJldHVybiBmYWxzZTtcbi8vIFx0fVxuLy8gXHRpZih0aGlzLnNpemUoKSAhPT0gb3RoZXIuc2l6ZSgpKXtcbi8vIFx0XHRyZXR1cm4gZmFsc2U7XG4vLyBcdH1cbi8vIFx0cmV0dXJuIHRoaXMuZXF1YWxzQXV4KHRoaXMuZmlyc3ROb2RlLG90aGVyLmZpcnN0Tm9kZSxlcUYpO1xuLy8gfVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TGlua2VkRGljdGlvbmFyeS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBhcnJheXMgPSByZXF1aXJlKFwiLi9hcnJheXNcIik7XG52YXIgTGlua2VkTGlzdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAqIENyZWF0ZXMgYW4gZW1wdHkgTGlua2VkIExpc3QuXG4gICAgKiBAY2xhc3MgQSBsaW5rZWQgbGlzdCBpcyBhIGRhdGEgc3RydWN0dXJlIGNvbnNpc3Rpbmcgb2YgYSBncm91cCBvZiBub2Rlc1xuICAgICogd2hpY2ggdG9nZXRoZXIgcmVwcmVzZW50IGEgc2VxdWVuY2UuXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uIExpbmtlZExpc3QoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAqIEZpcnN0IG5vZGUgaW4gdGhlIGxpc3RcbiAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICogTGFzdCBub2RlIGluIHRoZSBsaXN0XG4gICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmxhc3ROb2RlID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICogTnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBsaXN0XG4gICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICogQWRkcyBhbiBlbGVtZW50IHRvIHRoaXMgbGlzdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIGVsZW1lbnQgdG8gYmUgYWRkZWQuXG4gICAgKiBAcGFyYW0ge251bWJlcj19IGluZGV4IG9wdGlvbmFsIGluZGV4IHRvIGFkZCB0aGUgZWxlbWVudC4gSWYgbm8gaW5kZXggaXMgc3BlY2lmaWVkXG4gICAgKiB0aGUgZWxlbWVudCBpcyBhZGRlZCB0byB0aGUgZW5kIG9mIHRoaXMgbGlzdC5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGVsZW1lbnQgd2FzIGFkZGVkIG9yIGZhbHNlIGlmIHRoZSBpbmRleCBpcyBpbnZhbGlkXG4gICAgKiBvciBpZiB0aGUgZWxlbWVudCBpcyB1bmRlZmluZWQuXG4gICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQoaW5kZXgpKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMubkVsZW1lbnRzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiB0aGlzLm5FbGVtZW50cyB8fCB1dGlsLmlzVW5kZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld05vZGUgPSB0aGlzLmNyZWF0ZU5vZGUoaXRlbSk7XG4gICAgICAgIGlmICh0aGlzLm5FbGVtZW50cyA9PT0gMCB8fCB0aGlzLmxhc3ROb2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBGaXJzdCBub2RlIGluIHRoZSBsaXN0LlxuICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSBuZXdOb2RlO1xuICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IG5ld05vZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5kZXggPT09IHRoaXMubkVsZW1lbnRzKSB7XG4gICAgICAgICAgICAvLyBJbnNlcnQgYXQgdGhlIGVuZC5cbiAgICAgICAgICAgIHRoaXMubGFzdE5vZGUubmV4dCA9IG5ld05vZGU7XG4gICAgICAgICAgICB0aGlzLmxhc3ROb2RlID0gbmV3Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gQ2hhbmdlIGZpcnN0IG5vZGUuXG4gICAgICAgICAgICBuZXdOb2RlLm5leHQgPSB0aGlzLmZpcnN0Tm9kZTtcbiAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbmV3Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBwcmV2ID0gdGhpcy5ub2RlQXRJbmRleChpbmRleCAtIDEpO1xuICAgICAgICAgICAgaWYgKHByZXYgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld05vZGUubmV4dCA9IHByZXYubmV4dDtcbiAgICAgICAgICAgIHByZXYubmV4dCA9IG5ld05vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uRWxlbWVudHMrKztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhpcyBsaXN0LlxuICAgICogQHJldHVybiB7Kn0gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGxpc3Qgb3IgdW5kZWZpbmVkIGlmIHRoZSBsaXN0IGlzXG4gICAgKiBlbXB0eS5cbiAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLmZpcnN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5maXJzdE5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0Tm9kZS5lbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIGxhc3QgZWxlbWVudCBpbiB0aGlzIGxpc3QuXG4gICAgKiBAcmV0dXJuIHsqfSB0aGUgbGFzdCBlbGVtZW50IGluIHRoZSBsaXN0IG9yIHVuZGVmaW5lZCBpZiB0aGUgbGlzdCBpc1xuICAgICogZW1wdHkuXG4gICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5sYXN0Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdE5vZGUuZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIHRoaXMgbGlzdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggZGVzaXJlZCBpbmRleC5cbiAgICAgKiBAcmV0dXJuIHsqfSB0aGUgZWxlbWVudCBhdCB0aGUgZ2l2ZW4gaW5kZXggb3IgdW5kZWZpbmVkIGlmIHRoZSBpbmRleCBpc1xuICAgICAqIG91dCBvZiBib3VuZHMuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuZWxlbWVudEF0SW5kZXggPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGVBdEluZGV4KGluZGV4KTtcbiAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGUuZWxlbWVudDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGluZGV4IGluIHRoaXMgbGlzdCBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGVcbiAgICAgKiBzcGVjaWZpZWQgZWxlbWVudCwgb3IgLTEgaWYgdGhlIExpc3QgZG9lcyBub3QgY29udGFpbiB0aGlzIGVsZW1lbnQuXG4gICAgICogPHA+SWYgdGhlIGVsZW1lbnRzIGluc2lkZSB0aGlzIGxpc3QgYXJlXG4gICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcbiAgICAgKiBwcm92aWRlZCB0byBwZXJmb3JtIHNlYXJjaGVzLCB0aGUgZnVuY3Rpb24gbXVzdCByZWNlaXZlIHR3byBhcmd1bWVudHMgYW5kXG4gICAgICogcmV0dXJuIHRydWUgaWYgdGhleSBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGNvbnN0IHBldHNBcmVFcXVhbEJ5TmFtZSA9IGZ1bmN0aW9uKHBldDEsIHBldDIpIHtcbiAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gT3B0aW9uYWxcbiAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNoZWNrIGlmIHR3byBlbGVtZW50cyBhcmUgZXF1YWwuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgaW5kZXggaW4gdGhpcyBsaXN0IG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlXG4gICAgICogb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50LCBvciAtMSBpZiB0aGlzIGxpc3QgZG9lcyBub3QgY29udGFpbiB0aGVcbiAgICAgKiBlbGVtZW50LlxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAoaXRlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICAgICAgdmFyIGVxdWFsc0YgPSBlcXVhbHNGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRFcXVhbHM7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGVxdWFsc0YoY3VycmVudE5vZGUuZWxlbWVudCwgaXRlbSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoZSBsaXN0IGFyZVxuICAgICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcbiAgICAgICAqIHByb3ZpZGVkIHRvIHBlcmZvcm0gc2VhcmNoZXMsIHRoZSBmdW5jdGlvbiBtdXN0IHJlY2VpdmUgdHdvIGFyZ3VtZW50cyBhbmRcbiAgICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxuICAgICAgICpcbiAgICAgICAqIDxwcmU+XG4gICAgICAgKiBjb25zdCBwZXRzQXJlRXF1YWxCeU5hbWUgPSBmdW5jdGlvbihwZXQxLCBwZXQyKSB7XG4gICAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xuICAgICAgICogfVxuICAgICAgICogPC9wcmU+XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBPcHRpb25hbFxuICAgICAgICogZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLlxuICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGxpc3QgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LCBmYWxzZVxuICAgICAgICogb3RoZXJ3aXNlLlxuICAgICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoaXRlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmluZGV4T2YoaXRlbSwgZXF1YWxzRnVuY3Rpb24pID49IDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW4gdGhpcyBsaXN0LlxuICAgICAqIDxwPklmIHRoZSBlbGVtZW50cyBpbnNpZGUgdGhlIGxpc3QgYXJlXG4gICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcbiAgICAgKiBwcm92aWRlZCB0byBwZXJmb3JtIHNlYXJjaGVzLCB0aGUgZnVuY3Rpb24gbXVzdCByZWNlaXZlIHR3byBhcmd1bWVudHMgYW5kXG4gICAgICogcmV0dXJuIHRydWUgaWYgdGhleSBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGNvbnN0IHBldHNBcmVFcXVhbEJ5TmFtZSA9IGZ1bmN0aW9uKHBldDEsIHBldDIpIHtcbiAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSBlbGVtZW50IHRvIGJlIHJlbW92ZWQgZnJvbSB0aGlzIGxpc3QsIGlmIHByZXNlbnQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbGlzdCBjb250YWluZWQgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChpdGVtLCBlcXVhbHNGdW5jdGlvbikge1xuICAgICAgICB2YXIgZXF1YWxzRiA9IGVxdWFsc0Z1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdEVxdWFscztcbiAgICAgICAgaWYgKHRoaXMubkVsZW1lbnRzIDwgMSB8fCB1dGlsLmlzVW5kZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByZXZpb3VzID0gbnVsbDtcbiAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGVxdWFsc0YoY3VycmVudE5vZGUuZWxlbWVudCwgaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IGN1cnJlbnROb2RlLm5leHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZSA9PT0gdGhpcy5sYXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudE5vZGUgPT09IHRoaXMubGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IHByZXZpb3VzO1xuICAgICAgICAgICAgICAgICAgICBwcmV2aW91cy5uZXh0ID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUubmV4dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcmV2aW91cy5uZXh0ID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUubmV4dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzLS07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2aW91cyA9IGN1cnJlbnROb2RlO1xuICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgbGlzdC5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5maXJzdE5vZGUgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3ROb2RlID0gbnVsbDtcbiAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbGlzdCBpcyBlcXVhbCB0byB0aGUgZ2l2ZW4gbGlzdC5cbiAgICAgKiBUd28gbGlzdHMgYXJlIGVxdWFsIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBvcmRlci5cbiAgICAgKiBAcGFyYW0ge0xpbmtlZExpc3R9IG90aGVyIHRoZSBvdGhlciBsaXN0LlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLiBJZiB0aGUgZWxlbWVudHMgaW4gdGhlIGxpc3RzXG4gICAgICogYXJlIGN1c3RvbSBvYmplY3RzIHlvdSBzaG91bGQgcHJvdmlkZSBhIGZ1bmN0aW9uLCBvdGhlcndpc2VcbiAgICAgKiB0aGUgPT09IG9wZXJhdG9yIGlzIHVzZWQgdG8gY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgbGlzdCBpcyBlcXVhbCB0byB0aGUgZ2l2ZW4gbGlzdC5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIsIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgICAgIHZhciBlcUYgPSBlcXVhbHNGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRFcXVhbHM7XG4gICAgICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgTGlua2VkTGlzdCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zaXplKCkgIT09IG90aGVyLnNpemUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmVxdWFsc0F1eCh0aGlzLmZpcnN0Tm9kZSwgb3RoZXIuZmlyc3ROb2RlLCBlcUYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgKiBAcHJpdmF0ZVxuICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuZXF1YWxzQXV4ID0gZnVuY3Rpb24gKG4xLCBuMiwgZXFGKSB7XG4gICAgICAgIHdoaWxlIChuMSAhPT0gbnVsbCAmJiBuMiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCFlcUYobjEuZWxlbWVudCwgbjIuZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuMSA9IG4xLm5leHQ7XG4gICAgICAgICAgICBuMiA9IG4yLm5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhpcyBsaXN0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBnaXZlbiBpbmRleC5cbiAgICAgKiBAcmV0dXJuIHsqfSByZW1vdmVkIGVsZW1lbnQgb3IgdW5kZWZpbmVkIGlmIHRoZSBpbmRleCBpcyBvdXQgb2YgYm91bmRzLlxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLnJlbW92ZUVsZW1lbnRBdEluZGV4ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5uRWxlbWVudHMgfHwgdGhpcy5maXJzdE5vZGUgPT09IG51bGwgfHwgdGhpcy5sYXN0Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMubkVsZW1lbnRzID09PSAxKSB7XG4gICAgICAgICAgICAvL0ZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXG4gICAgICAgICAgICBlbGVtZW50ID0gdGhpcy5maXJzdE5vZGUuZWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5ub2RlQXRJbmRleChpbmRleCAtIDEpO1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IHRoaXMuZmlyc3ROb2RlLmVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSB0aGlzLmZpcnN0Tm9kZS5uZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocHJldmlvdXMubmV4dCA9PT0gdGhpcy5sYXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmxhc3ROb2RlLmVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IHByZXZpb3VzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZpb3VzICE9PSBudWxsICYmIHByZXZpb3VzLm5leHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gcHJldmlvdXMubmV4dC5lbGVtZW50O1xuICAgICAgICAgICAgICAgIHByZXZpb3VzLm5leHQgPSBwcmV2aW91cy5uZXh0Lm5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uRWxlbWVudHMtLTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBsaXN0IGluIG9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW5cbiAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xuICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayhjdXJyZW50Tm9kZS5lbGVtZW50KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV2ZXJzZXMgdGhlIG9yZGVyIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGxpbmtlZCBsaXN0IChtYWtlcyB0aGUgbGFzdFxuICAgICAqIGVsZW1lbnQgZmlyc3QsIGFuZCB0aGUgZmlyc3QgZWxlbWVudCBsYXN0KS5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5yZXZlcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldmlvdXMgPSBudWxsO1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZmlyc3ROb2RlO1xuICAgICAgICB2YXIgdGVtcCA9IG51bGw7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0ZW1wID0gY3VycmVudC5uZXh0O1xuICAgICAgICAgICAgY3VycmVudC5uZXh0ID0gcHJldmlvdXM7XG4gICAgICAgICAgICBwcmV2aW91cyA9IGN1cnJlbnQ7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGVtcDtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgIHRoaXMuZmlyc3ROb2RlID0gdGhpcy5sYXN0Tm9kZTtcbiAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IHRlbXA7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGxpc3QgaW4gcHJvcGVyXG4gICAgICogc2VxdWVuY2UuXG4gICAgICogQHJldHVybiB7QXJyYXkuPCo+fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyBsaXN0LFxuICAgICAqIGluIHByb3BlciBzZXF1ZW5jZS5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgYXJyYXkucHVzaChjdXJyZW50Tm9kZS5lbGVtZW50KTtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBsaXN0LlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGxpc3QuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHMgPD0gMDtcbiAgICB9O1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYXJyYXlzLnRvU3RyaW5nKHRoaXMudG9BcnJheSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUubm9kZUF0SW5kZXggPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLm5FbGVtZW50cykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ID09PSAodGhpcy5uRWxlbWVudHMgLSAxKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmZpcnN0Tm9kZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleCAmJiBub2RlICE9IG51bGw7IGkrKykge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuY3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbGVtZW50OiBpdGVtLFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIExpbmtlZExpc3Q7XG59KCkpOyAvLyBFbmQgb2YgbGlua2VkIGxpc3RcbmV4cG9ydHMuZGVmYXVsdCA9IExpbmtlZExpc3Q7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1MaW5rZWRMaXN0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xudmFyIERpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0RpY3Rpb25hcnlcIik7XG52YXIgYXJyYXlzID0gcmVxdWlyZShcIi4vYXJyYXlzXCIpO1xudmFyIE11bHRpRGljdGlvbmFyeSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IG11bHRpIGRpY3Rpb25hcnkuXG4gICAgICogQGNsYXNzIDxwPkEgbXVsdGkgZGljdGlvbmFyeSBpcyBhIHNwZWNpYWwga2luZCBvZiBkaWN0aW9uYXJ5IHRoYXQgaG9sZHNcbiAgICAgKiBtdWx0aXBsZSB2YWx1ZXMgYWdhaW5zdCBlYWNoIGtleS4gU2V0dGluZyBhIHZhbHVlIGludG8gdGhlIGRpY3Rpb25hcnkgd2lsbFxuICAgICAqIGFkZCB0aGUgdmFsdWUgdG8gYW4gYXJyYXkgYXQgdGhhdCBrZXkuIEdldHRpbmcgYSBrZXkgd2lsbCByZXR1cm4gYW4gYXJyYXksXG4gICAgICogaG9sZGluZyBhbGwgdGhlIHZhbHVlcyBzZXQgdG8gdGhhdCBrZXkuXG4gICAgICogWW91IGNhbiBjb25maWd1cmUgdG8gYWxsb3cgZHVwbGljYXRlcyBpbiB0aGUgdmFsdWVzLlxuICAgICAqIFRoaXMgaW1wbGVtZW50YXRpb24gYWNjZXB0cyBhbnkga2luZCBvZiBvYmplY3RzIGFzIGtleXMuPC9wPlxuICAgICAqXG4gICAgICogPHA+SWYgdGhlIGtleXMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb24gd2hpY2ggY29udmVydHMga2V5cyB0byBzdHJpbmdzIG11c3QgYmVcbiAgICAgKiBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHBldFRvU3RyaW5nKHBldCkge1xuICAgICAgICogIHJldHVybiBwZXQubmFtZTtcbiAgICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiA8cD5JZiB0aGUgdmFsdWVzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIHRvIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gdmFsdWVzXG4gICAgICogbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHBldHNBcmVFcXVhbEJ5QWdlKHBldDEscGV0Mikge1xuICAgICAgICogIHJldHVybiBwZXQxLmFnZT09PXBldDIuYWdlO1xuICAgICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KTpzdHJpbmc9fSB0b1N0ckZ1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uXG4gICAgICogdG8gY29udmVydCBrZXlzIHRvIHN0cmluZ3MuIElmIHRoZSBrZXlzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcbiAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGEga2V5IGFuZCByZXR1cm5zIGFcbiAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gdmFsdWVzRXF1YWxzRnVuY3Rpb24gb3B0aW9uYWxcbiAgICAgKiBmdW5jdGlvbiB0byBjaGVjayBpZiB0d28gdmFsdWVzIGFyZSBlcXVhbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhbGxvd0R1cGxpY2F0ZVZhbHVlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIE11bHRpRGljdGlvbmFyeSh0b1N0ckZ1bmN0aW9uLCB2YWx1ZXNFcXVhbHNGdW5jdGlvbiwgYWxsb3dEdXBsaWNhdGVWYWx1ZXMpIHtcbiAgICAgICAgaWYgKGFsbG93RHVwbGljYXRlVmFsdWVzID09PSB2b2lkIDApIHsgYWxsb3dEdXBsaWNhdGVWYWx1ZXMgPSBmYWxzZTsgfVxuICAgICAgICB0aGlzLmRpY3QgPSBuZXcgRGljdGlvbmFyeV8xLmRlZmF1bHQodG9TdHJGdW5jdGlvbik7XG4gICAgICAgIHRoaXMuZXF1YWxzRiA9IHZhbHVlc0VxdWFsc0Z1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdEVxdWFscztcbiAgICAgICAgdGhpcy5hbGxvd0R1cGxpY2F0ZSA9IGFsbG93RHVwbGljYXRlVmFsdWVzO1xuICAgIH1cbiAgICAvKipcbiAgICAqIFJldHVybnMgYW4gYXJyYXkgaG9sZGluZyB0aGUgdmFsdWVzIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzXG4gICAgKiB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAqIFJldHVybnMgYW4gZW1wdHkgYXJyYXkgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIG5vIG1hcHBpbmdzIGZvciB0aGlzIGtleS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIGFzc29jaWF0ZWQgdmFsdWVzIGFyZSB0byBiZSByZXR1cm5lZC5cbiAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBob2xkaW5nIHRoZSB2YWx1ZXMgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHNcbiAgICAqIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMuZGljdC5nZXRWYWx1ZShrZXkpO1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5cy5jb3B5KHZhbHVlcyk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSB2YWx1ZSB0byB0aGUgYXJyYXkgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LCBpZlxuICAgICAqIGl0IGlzIG5vdCBhbHJlYWR5IHByZXNlbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2l0aCB3aGljaCB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHRvIGJlXG4gICAgICogYXNzb2NpYXRlZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgdGhlIHZhbHVlIHRvIGFkZCB0byB0aGUgYXJyYXkgYXQgdGhlIGtleVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHZhbHVlIHdhcyBub3QgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggdGhhdCBrZXkuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGtleSkgfHwgdXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJyYXkgPSB0aGlzLmRpY3QuZ2V0VmFsdWUoa2V5KTtcbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQoYXJyYXkpKSB7XG4gICAgICAgICAgICB0aGlzLmRpY3Quc2V0VmFsdWUoa2V5LCBbdmFsdWVdKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5hbGxvd0R1cGxpY2F0ZSkge1xuICAgICAgICAgICAgaWYgKGFycmF5cy5jb250YWlucyhhcnJheSwgdmFsdWUsIHRoaXMuZXF1YWxzRikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXJyYXkucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIHZhbHVlcyBmcm9tIHRoZSBhcnJheSBvZiB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIHRoZVxuICAgICAqIHNwZWNpZmllZCBrZXkuIElmIGEgdmFsdWUgaXNuJ3QgZ2l2ZW4sIGFsbCB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWRcbiAgICAgKiBrZXkgYXJlIHJlbW92ZWQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgbWFwcGluZyBpcyB0byBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGljdGlvbmFyeS5cbiAgICAgKiBAcGFyYW0ge09iamVjdD19IHZhbHVlIG9wdGlvbmFsIGFyZ3VtZW50IHRvIHNwZWNpZnkgdGhlIHZhbHVlIHRvIHJlbW92ZVxuICAgICAqIGZyb20gdGhlIGFycmF5IGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBAcmV0dXJuIHsqfSB0cnVlIGlmIHRoZSBkaWN0aW9uYXJ5IGNoYW5nZWQsIGZhbHNlIGlmIHRoZSBrZXkgZG9lc24ndCBleGlzdCBvclxuICAgICAqIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXNuJ3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICAqL1xuICAgIE11bHRpRGljdGlvbmFyeS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgICB2YXIgdiA9IHRoaXMuZGljdC5yZW1vdmUoa2V5KTtcbiAgICAgICAgICAgIHJldHVybiAhdXRpbC5pc1VuZGVmaW5lZCh2KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJyYXkgPSB0aGlzLmRpY3QuZ2V0VmFsdWUoa2V5KTtcbiAgICAgICAgaWYgKCF1dGlsLmlzVW5kZWZpbmVkKGFycmF5KSAmJiBhcnJheXMucmVtb3ZlKGFycmF5LCB2YWx1ZSwgdGhpcy5lcXVhbHNGKSkge1xuICAgICAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGljdC5yZW1vdmUoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWN0LmtleXMoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIHZhbHVlcyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqL1xuICAgIE11bHRpRGljdGlvbmFyeS5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5kaWN0LnZhbHVlcygpO1xuICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB2YWx1ZXNfMSA9IHZhbHVlczsgX2kgPCB2YWx1ZXNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciB2ID0gdmFsdWVzXzFbX2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgX2EgPSAwLCB2XzEgPSB2OyBfYSA8IHZfMS5sZW5ndGg7IF9hKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdyA9IHZfMVtfYV07XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaCh3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGF0IGxlYXN0IG9uZSB2YWx1ZSBhc3NvY2lhdHRlZCB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBwcmVzZW5jZSBpbiB0aGlzIGRpY3Rpb25hcnkgaXMgdG8gYmVcbiAgICAgKiB0ZXN0ZWQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgYXQgbGVhc3Qgb25lIHZhbHVlIGFzc29jaWF0dGVkXG4gICAgICogdGhlIHNwZWNpZmllZCBrZXkuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5jb250YWluc0tleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdC5jb250YWluc0tleShrZXkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgbWFwcGluZ3MgZnJvbSB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kaWN0LmNsZWFyKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGtleS12YWx1ZSBtYXBwaW5ncyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWN0LnNpemUoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWN0LmlzRW1wdHkoKTtcbiAgICB9O1xuICAgIHJldHVybiBNdWx0aURpY3Rpb25hcnk7XG59KCkpOyAvLyBlbmQgb2YgbXVsdGkgZGljdGlvbmFyeVxuZXhwb3J0cy5kZWZhdWx0ID0gTXVsdGlEaWN0aW9uYXJ5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TXVsdGlEaWN0aW9uYXJ5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIERpcmVjdGlvbjtcbihmdW5jdGlvbiAoRGlyZWN0aW9uKSB7XG4gICAgRGlyZWN0aW9uW0RpcmVjdGlvbltcIkJFRk9SRVwiXSA9IDBdID0gXCJCRUZPUkVcIjtcbiAgICBEaXJlY3Rpb25bRGlyZWN0aW9uW1wiQUZURVJcIl0gPSAxXSA9IFwiQUZURVJcIjtcbiAgICBEaXJlY3Rpb25bRGlyZWN0aW9uW1wiSU5TSURFX0FUX0VORFwiXSA9IDJdID0gXCJJTlNJREVfQVRfRU5EXCI7XG4gICAgRGlyZWN0aW9uW0RpcmVjdGlvbltcIklOU0lERV9BVF9TVEFSVFwiXSA9IDNdID0gXCJJTlNJREVfQVRfU1RBUlRcIjtcbn0pKERpcmVjdGlvbiB8fCAoRGlyZWN0aW9uID0ge30pKTtcbnZhciBNdWx0aVJvb3RUcmVlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE11bHRpUm9vdFRyZWUocm9vdElkcywgbm9kZXMpIHtcbiAgICAgICAgaWYgKHJvb3RJZHMgPT09IHZvaWQgMCkgeyByb290SWRzID0gW107IH1cbiAgICAgICAgaWYgKG5vZGVzID09PSB2b2lkIDApIHsgbm9kZXMgPSB7fTsgfVxuICAgICAgICB0aGlzLnJvb3RJZHMgPSByb290SWRzO1xuICAgICAgICB0aGlzLm5vZGVzID0gbm9kZXM7XG4gICAgICAgIHRoaXMuaW5pdFJvb3RJZHMoKTtcbiAgICAgICAgdGhpcy5pbml0Tm9kZXMoKTtcbiAgICB9XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuaW5pdFJvb3RJZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnJvb3RJZHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm9vdElkID0gX2FbX2ldO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVFbXB0eU5vZGVJZk5vdEV4aXN0KHJvb3RJZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmluaXROb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLm5vZGVzW25vZGVLZXldOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZUxpc3RJdGVtID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUVtcHR5Tm9kZUlmTm90RXhpc3Qobm9kZUxpc3RJdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmNyZWF0ZUVtcHR5Tm9kZUlmTm90RXhpc3QgPSBmdW5jdGlvbiAobm9kZUtleSkge1xuICAgICAgICBpZiAoIXRoaXMubm9kZXNbbm9kZUtleV0pIHtcbiAgICAgICAgICAgIHRoaXMubm9kZXNbbm9kZUtleV0gPSBbXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuZ2V0Um9vdElkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNsb25lID0gdGhpcy5yb290SWRzLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjbG9uZTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmdldE5vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2xvbmUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgIGNsb25lW25vZGVLZXldID0gdGhpcy5ub2Rlc1tub2RlS2V5XS5zbGljZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbG9uZTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmdldE9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJvb3RJZHM6IHRoaXMuZ2V0Um9vdElkcygpLFxuICAgICAgICAgICAgbm9kZXM6IHRoaXMuZ2V0Tm9kZXMoKSxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLnRvT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRPYmplY3QoKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmZsYXR0ZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBleHRyYVByb3BzT2JqZWN0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yb290SWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm9vdElkID0gdGhpcy5yb290SWRzW2ldO1xuICAgICAgICAgICAgZXh0cmFQcm9wc09iamVjdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogcm9vdElkLFxuICAgICAgICAgICAgICAgIGxldmVsOiAwLFxuICAgICAgICAgICAgICAgIGhhc1BhcmVudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJhdmVyc2Uocm9vdElkLCB0aGlzLm5vZGVzLCBleHRyYVByb3BzT2JqZWN0LCAwKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGV4dHJhUHJvcHNPYmplY3RfMSA9IGV4dHJhUHJvcHNPYmplY3Q7IF9pIDwgZXh0cmFQcm9wc09iamVjdF8xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIG8gPSBleHRyYVByb3BzT2JqZWN0XzFbX2ldO1xuICAgICAgICAgICAgby5jaGlsZHJlbkNvdW50ID0gY291bnRDaGlsZHJlbihvLmlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXh0cmFQcm9wc09iamVjdDtcbiAgICAgICAgZnVuY3Rpb24gY291bnRDaGlsZHJlbihpZCkge1xuICAgICAgICAgICAgaWYgKCFfdGhpcy5ub2Rlc1tpZF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbkNvdW50ID0gX3RoaXMubm9kZXNbaWRdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5Db3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0cmF2ZXJzZShzdGFydElkLCBub2RlcywgcmV0dXJuQXJyYXksIGxldmVsKSB7XG4gICAgICAgICAgICBpZiAobGV2ZWwgPT09IHZvaWQgMCkgeyBsZXZlbCA9IDA7IH1cbiAgICAgICAgICAgIGlmICghc3RhcnRJZCB8fCAhbm9kZXMgfHwgIXJldHVybkFycmF5IHx8ICFub2Rlc1tzdGFydElkXSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsKys7XG4gICAgICAgICAgICB2YXIgaWRzTGlzdCA9IG5vZGVzW3N0YXJ0SWRdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZHNMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gaWRzTGlzdFtpXTtcbiAgICAgICAgICAgICAgICByZXR1cm5BcnJheS5wdXNoKHsgaWQ6IGlkLCBsZXZlbDogbGV2ZWwsIGhhc1BhcmVudDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB0cmF2ZXJzZShpZCwgbm9kZXMsIHJldHVybkFycmF5LCBsZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXZlbC0tO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5tb3ZlSWRCZWZvcmVJZCA9IGZ1bmN0aW9uIChtb3ZlSWQsIGJlZm9yZUlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVJZChtb3ZlSWQsIGJlZm9yZUlkLCBEaXJlY3Rpb24uQkVGT1JFKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm1vdmVJZEFmdGVySWQgPSBmdW5jdGlvbiAobW92ZUlkLCBhZnRlcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVJZChtb3ZlSWQsIGFmdGVySWQsIERpcmVjdGlvbi5BRlRFUik7XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5tb3ZlSWRJbnRvSWQgPSBmdW5jdGlvbiAobW92ZUlkLCBpbnNpZGVJZCwgYXRTdGFydCkge1xuICAgICAgICBpZiAoYXRTdGFydCA9PT0gdm9pZCAwKSB7IGF0U3RhcnQgPSB0cnVlOyB9XG4gICAgICAgIGlmIChhdFN0YXJ0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3ZlSWQobW92ZUlkLCBpbnNpZGVJZCwgRGlyZWN0aW9uLklOU0lERV9BVF9TVEFSVCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3ZlSWQobW92ZUlkLCBpbnNpZGVJZCwgRGlyZWN0aW9uLklOU0lERV9BVF9FTkQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5zd2FwUm9vdElkV2l0aFJvb3RJZCA9IGZ1bmN0aW9uIChyb290SWQsIHdpdGhSb290SWQpIHtcbiAgICAgICAgdmFyIGxlZnRJbmRleCA9IHRoaXMuZmluZFJvb3RJZChyb290SWQpO1xuICAgICAgICB2YXIgcmlnaHRJbmRleCA9IHRoaXMuZmluZFJvb3RJZCh3aXRoUm9vdElkKTtcbiAgICAgICAgdGhpcy5zd2FwUm9vdFBvc2l0aW9uV2l0aFJvb3RQb3NpdGlvbihsZWZ0SW5kZXgsIHJpZ2h0SW5kZXgpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuc3dhcFJvb3RQb3NpdGlvbldpdGhSb290UG9zaXRpb24gPSBmdW5jdGlvbiAoc3dhcFJvb3RQb3NpdGlvbiwgd2l0aFJvb3RQb3NpdGlvbikge1xuICAgICAgICB2YXIgdGVtcCA9IHRoaXMucm9vdElkc1t3aXRoUm9vdFBvc2l0aW9uXTtcbiAgICAgICAgdGhpcy5yb290SWRzW3dpdGhSb290UG9zaXRpb25dID0gdGhpcy5yb290SWRzW3N3YXBSb290UG9zaXRpb25dO1xuICAgICAgICB0aGlzLnJvb3RJZHNbc3dhcFJvb3RQb3NpdGlvbl0gPSB0ZW1wO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuZGVsZXRlSWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgdGhpcy5yb290RGVsZXRlSWQoaWQpO1xuICAgICAgICB0aGlzLm5vZGVBbmRTdWJOb2Rlc0RlbGV0ZShpZCk7XG4gICAgICAgIHRoaXMubm9kZVJlZnJlbmNlc0RlbGV0ZShpZCk7XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5pbnNlcnRJZEJlZm9yZUlkID0gZnVuY3Rpb24gKGJlZm9yZUlkLCBpbnNlcnRJZCkge1xuICAgICAgICB2YXIgZm91bmRSb290SWRJbmRleCA9IHRoaXMuZmluZFJvb3RJZChiZWZvcmVJZCk7XG4gICAgICAgIGlmIChmb3VuZFJvb3RJZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvUm9vdChpbnNlcnRJZCwgZm91bmRSb290SWRJbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZE5vZGVJZEluZGV4ID0gdGhpcy5maW5kTm9kZUlkKG5vZGVLZXksIGJlZm9yZUlkKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmROb2RlSWRJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvTm9kZShub2RlS2V5LCBpbnNlcnRJZCwgZm91bmROb2RlSWRJbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5pbnNlcnRJZEFmdGVySWQgPSBmdW5jdGlvbiAoYmVsb3dJZCwgaW5zZXJ0SWQpIHtcbiAgICAgICAgdmFyIGZvdW5kUm9vdElkSW5kZXggPSB0aGlzLmZpbmRSb290SWQoYmVsb3dJZCk7XG4gICAgICAgIGlmIChmb3VuZFJvb3RJZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvUm9vdChpbnNlcnRJZCwgZm91bmRSb290SWRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIG5vZGVLZXkgaW4gdGhpcy5ub2Rlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMubm9kZXMuaGFzT3duUHJvcGVydHkobm9kZUtleSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmROb2RlSWRJbmRleCA9IHRoaXMuZmluZE5vZGVJZChub2RlS2V5LCBiZWxvd0lkKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmROb2RlSWRJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvTm9kZShub2RlS2V5LCBpbnNlcnRJZCwgZm91bmROb2RlSWRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuaW5zZXJ0SWRJbnRvSWQgPSBmdW5jdGlvbiAoaW5zaWRlSWQsIGluc2VydElkKSB7XG4gICAgICAgIHRoaXMubm9kZUluc2VydEF0RW5kKGluc2lkZUlkLCBpbnNlcnRJZCk7XG4gICAgICAgIHRoaXMubm9kZXNbaW5zZXJ0SWRdID0gW107XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5pbnNlcnRJZEludG9Sb290ID0gZnVuY3Rpb24gKGlkLCBwb3NpdGlvbikge1xuICAgICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5yb290SW5zZXJ0QXRFbmQoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGhfMSA9IHRoaXMucm9vdElkcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdGhpcy5yb290SWRzLnNwbGljZSgocG9zaXRpb24gKyBsZW5ndGhfMSArIDEpLCAwLCBpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3RJZHMuc3BsaWNlKHBvc2l0aW9uLCAwLCBpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2Rlc1tpZF0gPSB0aGlzLm5vZGVzW2lkXSB8fCBbXTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmluc2VydElkSW50b05vZGUgPSBmdW5jdGlvbiAobm9kZUtleSwgaWQsIHBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMubm9kZXNbbm9kZUtleV0gPSB0aGlzLm5vZGVzW25vZGVLZXldIHx8IFtdO1xuICAgICAgICB0aGlzLm5vZGVzW2lkXSA9IHRoaXMubm9kZXNbaWRdIHx8IFtdO1xuICAgICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5ub2RlSW5zZXJ0QXRFbmQobm9kZUtleSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGhfMiA9IHRoaXMubm9kZXNbbm9kZUtleV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZXNbbm9kZUtleV0uc3BsaWNlKChwb3NpdGlvbiArIGxlbmd0aF8yICsgMSksIDAsIGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZXNbbm9kZUtleV0uc3BsaWNlKHBvc2l0aW9uLCAwLCBpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm1vdmVJZCA9IGZ1bmN0aW9uIChtb3ZlSWQsIGJlZm9yZUlkLCBkaXJlY3Rpb24pIHtcbiAgICAgICAgdmFyIHNvdXJjZUlkID0gbW92ZUlkO1xuICAgICAgICB2YXIgc291cmNlUm9vdEluZGV4ID0gdGhpcy5maW5kUm9vdElkKHNvdXJjZUlkKTtcbiAgICAgICAgdmFyIHNvdXJjZU5vZGVLZXk7XG4gICAgICAgIHZhciBzb3VyY2VOb2RlSWRJbmRleDtcbiAgICAgICAgaWYgKHRoaXMubm9kZXNbYmVmb3JlSWRdKSB7XG4gICAgICAgICAgICBzb3VyY2VOb2RlS2V5ID0gYmVmb3JlSWQ7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgIHNvdXJjZU5vZGVJZEluZGV4ID0gdGhpcy5maW5kTm9kZUlkKG5vZGVLZXksIGJlZm9yZUlkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBnb3QgYWxsXG4gICAgICAgIHZhciB0YXJnZXRJZCA9IGJlZm9yZUlkO1xuICAgICAgICB2YXIgdGFyZ2V0Um9vdEluZGV4ID0gdGhpcy5maW5kUm9vdElkKHRhcmdldElkKTtcbiAgICAgICAgdmFyIHRhcmdldE5vZGVLZXk7XG4gICAgICAgIHZhciB0YXJnZXROb2RlSWRJbmRleDtcbiAgICAgICAgaWYgKHRoaXMubm9kZXNbYmVmb3JlSWRdKSB7XG4gICAgICAgICAgICB0YXJnZXROb2RlS2V5ID0gYmVmb3JlSWQ7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldE5vZGVJZEluZGV4ID0gdGhpcy5maW5kTm9kZUlkKG5vZGVLZXksIGJlZm9yZUlkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBnb3QgYWxsXG4gICAgICAgIGlmIChzb3VyY2VSb290SW5kZXggPiAtMSkge1xuICAgICAgICAgICAgaWYgKHRhcmdldFJvb3RJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gbW92aW5nIHJvb3QgdG8gcm9vdFxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBNb3ZpbmcgUk9PVCB0byBST09UYCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYFJvb3RJZHM6YCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5yb290SWRzKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgVGFyZ2V0SW5kZXg9JHt0YXJnZXRSb290SW5kZXh9LCBTb3VyY2VJbmRleD0ke3NvdXJjZVJvb3RJbmRleH1gKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgVGFyZ2V0SWQ9JHt0YXJnZXRJZH0sIFNvdXJjZUlkPSR7c291cmNlSWR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb290RGVsZXRlKHNvdXJjZVJvb3RJbmRleCk7IC8vIGluZGV4ZXMgY2hhbmdlIG5vd1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRSb290SW5kZXggPiBzb3VyY2VSb290SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Um9vdEluZGV4LS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5CRUZPUkU6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydElkSW50b1Jvb3Qoc291cmNlSWQsIHRhcmdldFJvb3RJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uQUZURVI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydElkSW50b1Jvb3Qoc291cmNlSWQsIHRhcmdldFJvb3RJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLklOU0lERV9BVF9TVEFSVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUluc2VydEF0U3RhcnQodGFyZ2V0SWQsIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5JTlNJREVfQVRfRU5EOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlSW5zZXJ0QXRFbmQodGFyZ2V0SWQsIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG1vdmluZyByb290IChzb3VyY2UpIEFCT1ZFIG5vZGUgKHRhcmdldClcbiAgICAgICAgICAgICAgICAvLyB3aWxsIHJlbW92ZSBvbmUgZW50cnkgZnJvbSByb290c1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdERlbGV0ZShzb3VyY2VSb290SW5kZXgpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5vZGVLZXkgaW4gdGhpcy5ub2Rlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5maW5kTm9kZUlkKG5vZGVLZXksIHRhcmdldElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uQkVGT1JFOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Ob2RlKG5vZGVLZXksIHNvdXJjZUlkLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uQUZURVI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydElkSW50b05vZGUobm9kZUtleSwgc291cmNlSWQsIGluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uSU5TSURFX0FUX1NUQVJUOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlSW5zZXJ0QXRTdGFydCh0YXJnZXRJZCwgc291cmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLklOU0lERV9BVF9FTkQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVJbnNlcnRBdEVuZCh0YXJnZXRJZCwgc291cmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRhcmdldFJvb3RJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gbW92aW5nIG5vZGUgKHNvdXJjZSkgQUJPVkUgcm9vdCAodGFyZ2V0KVxuICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBzb3VyY2UgaWQgZnJvbSBlYWNoIG5vZGVcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubm9kZXMuaGFzT3duUHJvcGVydHkobm9kZUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuZmluZE5vZGVJZChub2RlS2V5LCBzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMubm9kZUluc2VydElkKG5vZGVLZXksIHNvdXJjZUlkLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlRGVsZXRlQXRJbmRleChub2RlS2V5LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uQkVGT1JFOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Sb290KHNvdXJjZUlkLCB0YXJnZXRSb290SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkFGVEVSOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Sb290KHNvdXJjZUlkLCB0YXJnZXRSb290SW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5JTlNJREVfQVRfU1RBUlQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVJbnNlcnRBdFN0YXJ0KHRhcmdldElkLCBzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uSU5TSURFX0FUX0VORDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUluc2VydEF0RW5kKHRhcmdldElkLCBzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBtb3Zpbmcgbm9kZSAoc291cmNlKSBBQk9WRSBub2RlICh0YXJnZXQpXG4gICAgICAgICAgICAgICAgLy8gZGVsZXRlIHNvdXJjZSBpZCBmcm9tIGVhY2ggbm9kZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIG5vZGVLZXkgaW4gdGhpcy5ub2Rlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5maW5kTm9kZUlkKG5vZGVLZXksIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlRGVsZXRlQXRJbmRleChub2RlS2V5LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmZpbmROb2RlSWQobm9kZUtleSwgdGFyZ2V0SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5CRUZPUkU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydElkSW50b05vZGUobm9kZUtleSwgc291cmNlSWQsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5BRlRFUjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvTm9kZShub2RlS2V5LCBzb3VyY2VJZCwgaW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5JTlNJREVfQVRfU1RBUlQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVJbnNlcnRBdFN0YXJ0KHRhcmdldElkLCBzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uSU5TSURFX0FUX0VORDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUluc2VydEF0RW5kKHRhcmdldElkLCBzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLnN3YXBBcnJheUVsZW1lbnRzID0gZnVuY3Rpb24gKGFyciwgaW5kZXhBLCBpbmRleEIpIHtcbiAgICAgICAgdmFyIHRlbXAgPSBhcnJbaW5kZXhBXTtcbiAgICAgICAgYXJyW2luZGV4QV0gPSBhcnJbaW5kZXhCXTtcbiAgICAgICAgYXJyW2luZGV4Ql0gPSB0ZW1wO1xuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUucm9vdERlbGV0ZUlkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuZmluZFJvb3RJZChpZCk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3REZWxldGUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5ub2RlQW5kU3ViTm9kZXNEZWxldGUgPSBmdW5jdGlvbiAobm9kZUtleSkge1xuICAgICAgICB2YXIgdG9EZWxldGVMYXRlciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubm9kZXNbbm9kZUtleV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMubm9kZXNbbm9kZUtleV1baV07XG4gICAgICAgICAgICB0aGlzLm5vZGVBbmRTdWJOb2Rlc0RlbGV0ZShpZCk7XG4gICAgICAgICAgICB0b0RlbGV0ZUxhdGVyLnB1c2gobm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2RlRGVsZXRlKG5vZGVLZXkpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvRGVsZXRlTGF0ZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubm9kZURlbGV0ZSh0b0RlbGV0ZUxhdGVyW2ldKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUubm9kZVJlZnJlbmNlc0RlbGV0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5vZGVzW25vZGVLZXldLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXRJZCA9IHRoaXMubm9kZXNbbm9kZUtleV1baV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRJZCA9PT0gaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZURlbGV0ZUF0SW5kZXgobm9kZUtleSwgaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm5vZGVEZWxldGUgPSBmdW5jdGlvbiAobm9kZUtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy5ub2Rlc1tub2RlS2V5XTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmZpbmRSb290SWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdElkcy5pbmRleE9mKGlkKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmZpbmROb2RlSWQgPSBmdW5jdGlvbiAobm9kZUtleSwgaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXNbbm9kZUtleV0uaW5kZXhPZihpZCk7XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5maW5kTm9kZSA9IGZ1bmN0aW9uIChub2RlS2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzW25vZGVLZXldO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUubm9kZUluc2VydEF0U3RhcnQgPSBmdW5jdGlvbiAobm9kZUtleSwgaWQpIHtcbiAgICAgICAgdGhpcy5ub2Rlc1tub2RlS2V5XS51bnNoaWZ0KGlkKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm5vZGVJbnNlcnRBdEVuZCA9IGZ1bmN0aW9uIChub2RlS2V5LCBpZCkge1xuICAgICAgICB0aGlzLm5vZGVzW25vZGVLZXldLnB1c2goaWQpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUucm9vdERlbGV0ZSA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLnJvb3RJZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm5vZGVEZWxldGVBdEluZGV4ID0gZnVuY3Rpb24gKG5vZGVLZXksIGluZGV4KSB7XG4gICAgICAgIHRoaXMubm9kZXNbbm9kZUtleV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLnJvb3RJbnNlcnRBdFN0YXJ0ID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHRoaXMucm9vdElkcy51bnNoaWZ0KGlkKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLnJvb3RJbnNlcnRBdEVuZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICB0aGlzLnJvb3RJZHMucHVzaChpZCk7XG4gICAgfTtcbiAgICByZXR1cm4gTXVsdGlSb290VHJlZTtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBNdWx0aVJvb3RUcmVlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TXVsdGlSb290VHJlZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBIZWFwXzEgPSByZXF1aXJlKFwiLi9IZWFwXCIpO1xudmFyIFByaW9yaXR5UXVldWUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBwcmlvcml0eSBxdWV1ZS5cbiAgICAgKiBAY2xhc3MgPHA+SW4gYSBwcmlvcml0eSBxdWV1ZSBlYWNoIGVsZW1lbnQgaXMgYXNzb2NpYXRlZCB3aXRoIGEgXCJwcmlvcml0eVwiLFxuICAgICAqIGVsZW1lbnRzIGFyZSBkZXF1ZXVlZCBpbiBoaWdoZXN0LXByaW9yaXR5LWZpcnN0IG9yZGVyICh0aGUgZWxlbWVudHMgd2l0aCB0aGVcbiAgICAgKiBoaWdoZXN0IHByaW9yaXR5IGFyZSBkZXF1ZXVlZCBmaXJzdCkuIFByaW9yaXR5IFF1ZXVlcyBhcmUgaW1wbGVtZW50ZWQgYXMgaGVhcHMuXG4gICAgICogSWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGNvbXBhcmUgZnVuY3Rpb24gbXVzdCBiZSBwcm92aWRlZCxcbiAgICAgKiBvdGhlcndpc2UgdGhlIDw9LCA9PT0gYW5kID49IG9wZXJhdG9ycyBhcmUgdXNlZCB0byBjb21wYXJlIG9iamVjdCBwcmlvcml0eS48L3A+XG4gICAgICogPHByZT5cbiAgICAgKiBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgICAgKiAgaWYgKGEgaXMgbGVzcyB0aGFuIGIgYnkgc29tZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcbiAgICAgKiAgICAgcmV0dXJuIC0xO1xuICAgICAqICB9IGlmIChhIGlzIGdyZWF0ZXIgdGhhbiBiIGJ5IHRoZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcbiAgICAgKiAgICAgcmV0dXJuIDE7XG4gICAgICogIH1cbiAgICAgKiAgLy8gYSBtdXN0IGJlIGVxdWFsIHRvIGJcbiAgICAgKiAgcmV0dXJuIDA7XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6bnVtYmVyPX0gY29tcGFyZUZ1bmN0aW9uIG9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdXNlZCB0byBjb21wYXJlIHR3byBlbGVtZW50IHByaW9yaXRpZXMuIE11c3QgcmV0dXJuIGEgbmVnYXRpdmUgaW50ZWdlcixcbiAgICAgKiB6ZXJvLCBvciBhIHBvc2l0aXZlIGludGVnZXIgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiwgZXF1YWwgdG8sXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gUHJpb3JpdHlRdWV1ZShjb21wYXJlRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5oZWFwID0gbmV3IEhlYXBfMS5kZWZhdWx0KHV0aWwucmV2ZXJzZUNvbXBhcmVGdW5jdGlvbihjb21wYXJlRnVuY3Rpb24pKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW50byB0aGlzIHByaW9yaXR5IHF1ZXVlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGluc2VydC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBpbnNlcnRlZCwgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmVucXVldWUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWFwLmFkZChlbGVtZW50KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IGludG8gdGhpcyBwcmlvcml0eSBxdWV1ZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCB0aGUgZWxlbWVudCB0byBpbnNlcnQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgaW5zZXJ0ZWQsIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWFwLmFkZChlbGVtZW50KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyBhbmQgcmVtb3ZlcyB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50IG9mIHRoaXMgcXVldWUuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgb2YgdGhpcyBxdWV1ZSxcbiAgICAgKiAgb3IgdW5kZWZpbmVkIGlmIHRoaXMgcXVldWUgaXMgZW1wdHkuXG4gICAgICovXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuZGVxdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaGVhcC5zaXplKCkgIT09IDApIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHRoaXMuaGVhcC5wZWVrKCk7XG4gICAgICAgICAgICB0aGlzLmhlYXAucmVtb3ZlUm9vdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMsIGJ1dCBkb2VzIG5vdCByZW1vdmUsIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgb2YgdGhpcyBxdWV1ZS5cbiAgICAgKiBAcmV0dXJuIHsqfSB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50IG9mIHRoaXMgcXVldWUsIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHF1ZXVlIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlYXAucGVlaygpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgcHJpb3JpdHkgcXVldWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgcHJpb3JpdHkgcXVldWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuICAgICAqIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlYXAuY29udGFpbnMoZWxlbWVudCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhpcyBwcmlvcml0eSBxdWV1ZSBpcyBlbXB0eS5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoaXMgcHJpb3JpdHkgcXVldWUgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlYXAuaXNFbXB0eSgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgcHJpb3JpdHkgcXVldWUuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgcHJpb3JpdHkgcXVldWUuXG4gICAgICovXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVhcC5zaXplKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIHByaW9yaXR5IHF1ZXVlLlxuICAgICAqL1xuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmhlYXAuY2xlYXIoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHF1ZXVlIGluXG4gICAgICogbm8gcGFydGljdWxhciBvcmRlci5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuXG4gICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmhlYXAuZm9yRWFjaChjYWxsYmFjayk7XG4gICAgfTtcbiAgICByZXR1cm4gUHJpb3JpdHlRdWV1ZTtcbn0oKSk7IC8vIGVuZCBvZiBwcmlvcml0eSBxdWV1ZVxuZXhwb3J0cy5kZWZhdWx0ID0gUHJpb3JpdHlRdWV1ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVByaW9yaXR5UXVldWUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgTGlua2VkTGlzdF8xID0gcmVxdWlyZShcIi4vTGlua2VkTGlzdFwiKTtcbnZhciBRdWV1ZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IHF1ZXVlLlxuICAgICAqIEBjbGFzcyBBIHF1ZXVlIGlzIGEgRmlyc3QtSW4tRmlyc3QtT3V0IChGSUZPKSBkYXRhIHN0cnVjdHVyZSwgdGhlIGZpcnN0XG4gICAgICogZWxlbWVudCBhZGRlZCB0byB0aGUgcXVldWUgd2lsbCBiZSB0aGUgZmlyc3Qgb25lIHRvIGJlIHJlbW92ZWQuIFRoaXNcbiAgICAgKiBpbXBsZW1lbnRhdGlvbiB1c2VzIGEgbGlua2VkIGxpc3QgYXMgYSBjb250YWluZXIuXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gUXVldWUoKSB7XG4gICAgICAgIHRoaXMubGlzdCA9IG5ldyBMaW5rZWRMaXN0XzEuZGVmYXVsdCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbnRvIHRoZSBlbmQgb2YgdGhpcyBxdWV1ZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSB0aGUgZWxlbWVudCB0byBpbnNlcnQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgaW5zZXJ0ZWQsIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBRdWV1ZS5wcm90b3R5cGUuZW5xdWV1ZSA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QuYWRkKGVsZW0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW50byB0aGUgZW5kIG9mIHRoaXMgcXVldWUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gdGhlIGVsZW1lbnQgdG8gaW5zZXJ0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGVsZW1lbnQgd2FzIGluc2VydGVkLCBvciBmYWxzZSBpZiBpdCBpcyB1bmRlZmluZWQuXG4gICAgICovXG4gICAgUXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QuYWRkKGVsZW0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSBoZWFkIG9mIHRoaXMgcXVldWUuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIGhlYWQgb2YgdGhpcyBxdWV1ZSwgb3IgdW5kZWZpbmVkIGlmIHRoaXMgcXVldWUgaXMgZW1wdHkuXG4gICAgICovXG4gICAgUXVldWUucHJvdG90eXBlLmRlcXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3Quc2l6ZSgpICE9PSAwKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSB0aGlzLmxpc3QuZmlyc3QoKTtcbiAgICAgICAgICAgIHRoaXMubGlzdC5yZW1vdmVFbGVtZW50QXRJbmRleCgwKTtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzLCBidXQgZG9lcyBub3QgcmVtb3ZlLCB0aGUgaGVhZCBvZiB0aGlzIHF1ZXVlLlxuICAgICAqIEByZXR1cm4geyp9IHRoZSBoZWFkIG9mIHRoaXMgcXVldWUsIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHF1ZXVlIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIFF1ZXVlLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5saXN0LnNpemUoKSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5maXJzdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBxdWV1ZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBxdWV1ZS5cbiAgICAgKi9cbiAgICBRdWV1ZS5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5zaXplKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBxdWV1ZSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICogPHA+SWYgdGhlIGVsZW1lbnRzIGluc2lkZSB0aGlzIHN0YWNrIGFyZVxuICAgICAqIG5vdCBjb21wYXJhYmxlIHdpdGggdGhlID09PSBvcGVyYXRvciwgYSBjdXN0b20gZXF1YWxzIGZ1bmN0aW9uIHNob3VsZCBiZVxuICAgICAqIHByb3ZpZGVkIHRvIHBlcmZvcm0gc2VhcmNoZXMsIHRoZSBmdW5jdGlvbiBtdXN0IHJlY2VpdmUgdHdvIGFyZ3VtZW50cyBhbmRcbiAgICAgKiByZXR1cm4gdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLiBFeGFtcGxlOjwvcD5cbiAgICAgKlxuICAgICAqIDxwcmU+XG4gICAgICogY29uc3QgcGV0c0FyZUVxdWFsQnlOYW1lIChwZXQxLCBwZXQyKSB7XG4gICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdG8gY2hlY2sgaWYgdHdvIGVsZW1lbnRzIGFyZSBlcXVhbC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgcXVldWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuICAgICAqIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBRdWV1ZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5jb250YWlucyhlbGVtLCBlcXVhbHNGdW5jdGlvbik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhpcyBxdWV1ZSBpcyBlbXB0eS5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoaXMgcXVldWUgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIFF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LnNpemUoKSA8PSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBxdWV1ZS5cbiAgICAgKi9cbiAgICBRdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGlzdC5jbGVhcigpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgcXVldWUgaW5cbiAgICAgKiBGSUZPIG9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW5cbiAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cbiAgICAgKi9cbiAgICBRdWV1ZS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjYWxsYmFjayk7XG4gICAgfTtcbiAgICByZXR1cm4gUXVldWU7XG59KCkpOyAvLyBFbmQgb2YgcXVldWVcbmV4cG9ydHMuZGVmYXVsdCA9IFF1ZXVlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UXVldWUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG52YXIgYXJyYXlzID0gcmVxdWlyZShcIi4vYXJyYXlzXCIpO1xudmFyIERpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0RpY3Rpb25hcnlcIik7XG52YXIgU2V0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgc2V0LlxuICAgICAqIEBjbGFzcyA8cD5BIHNldCBpcyBhIGRhdGEgc3RydWN0dXJlIHRoYXQgY29udGFpbnMgbm8gZHVwbGljYXRlIGl0ZW1zLjwvcD5cbiAgICAgKiA8cD5JZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudHMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb25cbiAgICAgKiB3aGljaCBjb252ZXJ0cyBlbGVtZW50cyB0byBzdHJpbmdzIG11c3QgYmUgcHJvdmlkZWQuIEV4YW1wbGU6PC9wPlxuICAgICAqXG4gICAgICogPHByZT5cbiAgICAgKiBmdW5jdGlvbiBwZXRUb1N0cmluZyhwZXQpIHtcbiAgICAgKiAgcmV0dXJuIHBldC5uYW1lO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KTpzdHJpbmc9fSB0b1N0cmluZ0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWRcbiAgICAgKiB0byBjb252ZXJ0IGVsZW1lbnRzIHRvIHN0cmluZ3MuIElmIHRoZSBlbGVtZW50cyBhcmVuJ3Qgc3RyaW5ncyBvciBpZiB0b1N0cmluZygpXG4gICAgICogaXMgbm90IGFwcHJvcHJpYXRlLCBhIGN1c3RvbSBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyBhbiBvYmplY3QgYW5kIHJldHVybnMgYVxuICAgICAqIHVuaXF1ZSBzdHJpbmcgbXVzdCBiZSBwcm92aWRlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTZXQodG9TdHJpbmdGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkgPSBuZXcgRGljdGlvbmFyeV8xLmRlZmF1bHQodG9TdHJpbmdGdW5jdGlvbik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHNldCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzZXQgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuICAgICAqIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBTZXQucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS5jb250YWluc0tleShlbGVtZW50KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IHRvIHRoaXMgc2V0IGlmIGl0IGlzIG5vdCBhbHJlYWR5IHByZXNlbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgdGhlIGVsZW1lbnQgdG8gaW5zZXJ0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzZXQgZGlkIG5vdCBhbHJlYWR5IGNvbnRhaW4gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGFpbnMoZWxlbWVudCkgfHwgdXRpbC5pc1VuZGVmaW5lZChlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LnNldFZhbHVlKGVsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGFuIGludGVyc2VjaW9uIGJldHdlZW4gdGhpcyBhbmQgYW5vdGhlciBzZXQuXG4gICAgICogUmVtb3ZlcyBhbGwgdmFsdWVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IHRoaXMgc2V0IGFuZCB0aGUgZ2l2ZW4gc2V0LlxuICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXG4gICAgICovXG4gICAgU2V0LnByb3RvdHlwZS5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAob3RoZXJTZXQpIHtcbiAgICAgICAgdmFyIHNldCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKCFvdGhlclNldC5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHNldC5yZW1vdmUoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBhIHVuaW9uIGJldHdlZW4gdGhpcyBhbmQgYW5vdGhlciBzZXQuXG4gICAgICogQWRkcyBhbGwgdmFsdWVzIGZyb20gdGhlIGdpdmVuIHNldCB0byB0aGlzIHNldC5cbiAgICAgKiBAcGFyYW0ge2NvbGxlY3Rpb25zLlNldH0gb3RoZXJTZXQgb3RoZXIgc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUudW5pb24gPSBmdW5jdGlvbiAob3RoZXJTZXQpIHtcbiAgICAgICAgdmFyIHNldCA9IHRoaXM7XG4gICAgICAgIG90aGVyU2V0LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNldC5hZGQoZWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBhIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGlzIGFuZCBhbm90aGVyIHNldC5cbiAgICAgKiBSZW1vdmVzIGZyb20gdGhpcyBzZXQgYWxsIHRoZSB2YWx1ZXMgdGhhdCBhcmUgcHJlc2VudCBpbiB0aGUgZ2l2ZW4gc2V0LlxuICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXG4gICAgICovXG4gICAgU2V0LnByb3RvdHlwZS5kaWZmZXJlbmNlID0gZnVuY3Rpb24gKG90aGVyU2V0KSB7XG4gICAgICAgIHZhciBzZXQgPSB0aGlzO1xuICAgICAgICBvdGhlclNldC5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBzZXQucmVtb3ZlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIHNldCBjb250YWlucyBhbGwgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxuICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBpcyBhIHN1YnNldCBvZiB0aGUgZ2l2ZW4gc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuaXNTdWJzZXRPZiA9IGZ1bmN0aW9uIChvdGhlclNldCkge1xuICAgICAgICBpZiAodGhpcy5zaXplKCkgPiBvdGhlclNldC5zaXplKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaXNTdWIgPSB0cnVlO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmICghb3RoZXJTZXQuY29udGFpbnMoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBpc1N1YiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGlzU3ViO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgZnJvbSB0aGlzIHNldCBpZiBpdCBpcyBwcmVzZW50LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzZXQgY29udGFpbmVkIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKi9cbiAgICBTZXQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LnJlbW92ZShlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50XG4gICAgICogcHJlc2VudCBpbiB0aGlzIHNldC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50czogdGhlIGVsZW1lbnQuIFRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkuZm9yRWFjaChmdW5jdGlvbiAoaywgdikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHYpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0IGluIGFyYml0cmFyeSBvcmRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS52YWx1ZXMoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHNldCBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc2V0IGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS5pc0VtcHR5KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzZXQuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS5zaXplKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIHNldC5cbiAgICAgKi9cbiAgICBTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkuY2xlYXIoKTtcbiAgICB9O1xuICAgIC8qXG4gICAgKiBQcm92aWRlcyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBmb3IgZGlzcGxheVxuICAgICovXG4gICAgU2V0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5cy50b1N0cmluZyh0aGlzLnRvQXJyYXkoKSk7XG4gICAgfTtcbiAgICByZXR1cm4gU2V0O1xufSgpKTsgLy8gZW5kIG9mIFNldFxuZXhwb3J0cy5kZWZhdWx0ID0gU2V0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U2V0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIExpbmtlZExpc3RfMSA9IHJlcXVpcmUoXCIuL0xpbmtlZExpc3RcIik7XG52YXIgU3RhY2sgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBTdGFjay5cbiAgICAgKiBAY2xhc3MgQSBTdGFjayBpcyBhIExhc3QtSW4tRmlyc3QtT3V0IChMSUZPKSBkYXRhIHN0cnVjdHVyZSwgdGhlIGxhc3RcbiAgICAgKiBlbGVtZW50IGFkZGVkIHRvIHRoZSBzdGFjayB3aWxsIGJlIHRoZSBmaXJzdCBvbmUgdG8gYmUgcmVtb3ZlZC4gVGhpc1xuICAgICAqIGltcGxlbWVudGF0aW9uIHVzZXMgYSBsaW5rZWQgbGlzdCBhcyBhIGNvbnRhaW5lci5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTdGFjaygpIHtcbiAgICAgICAgdGhpcy5saXN0ID0gbmV3IExpbmtlZExpc3RfMS5kZWZhdWx0KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhbiBpdGVtIG9udG8gdGhlIHRvcCBvZiB0aGlzIHN0YWNrLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIHRoZSBlbGVtZW50IHRvIGJlIHB1c2hlZCBvbnRvIHRoaXMgc3RhY2suXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgcHVzaGVkIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBTdGFjay5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QuYWRkKGVsZW0sIDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGFuIGl0ZW0gb250byB0aGUgdG9wIG9mIHRoaXMgc3RhY2suXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gdGhlIGVsZW1lbnQgdG8gYmUgcHVzaGVkIG9udG8gdGhpcyBzdGFjay5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBwdXNoZWQgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LmFkZChlbGVtLCAwKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG9iamVjdCBhdCB0aGUgdG9wIG9mIHRoaXMgc3RhY2sgYW5kIHJldHVybnMgdGhhdCBvYmplY3QuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIG9iamVjdCBhdCB0aGUgdG9wIG9mIHRoaXMgc3RhY2sgb3IgdW5kZWZpbmVkIGlmIHRoZVxuICAgICAqIHN0YWNrIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QucmVtb3ZlRWxlbWVudEF0SW5kZXgoMCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBMb29rcyBhdCB0aGUgb2JqZWN0IGF0IHRoZSB0b3Agb2YgdGhpcyBzdGFjayB3aXRob3V0IHJlbW92aW5nIGl0IGZyb20gdGhlXG4gICAgICogc3RhY2suXG4gICAgICogQHJldHVybiB7Kn0gdGhlIG9iamVjdCBhdCB0aGUgdG9wIG9mIHRoaXMgc3RhY2sgb3IgdW5kZWZpbmVkIGlmIHRoZVxuICAgICAqIHN0YWNrIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LmZpcnN0KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzdGFjay5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzdGFjay5cbiAgICAgKi9cbiAgICBTdGFjay5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5zaXplKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBzdGFjayBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICogPHA+SWYgdGhlIGVsZW1lbnRzIGluc2lkZSB0aGlzIHN0YWNrIGFyZVxuICAgICAqIG5vdCBjb21wYXJhYmxlIHdpdGggdGhlID09PSBvcGVyYXRvciwgYSBjdXN0b20gZXF1YWxzIGZ1bmN0aW9uIHNob3VsZCBiZVxuICAgICAqIHByb3ZpZGVkIHRvIHBlcmZvcm0gc2VhcmNoZXMsIHRoZSBmdW5jdGlvbiBtdXN0IHJlY2VpdmUgdHdvIGFyZ3VtZW50cyBhbmRcbiAgICAgKiByZXR1cm4gdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLiBFeGFtcGxlOjwvcD5cbiAgICAgKlxuICAgICAqIDxwcmU+XG4gICAgICogY29uc3QgcGV0c0FyZUVxdWFsQnlOYW1lIChwZXQxLCBwZXQyKSB7XG4gICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdG8gY2hlY2sgaWYgdHdvIGVsZW1lbnRzIGFyZSBlcXVhbC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc3RhY2sgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuICAgICAqIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBTdGFjay5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5jb250YWlucyhlbGVtLCBlcXVhbHNGdW5jdGlvbik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhpcyBzdGFjayBpcyBlbXB0eS5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoaXMgc3RhY2sgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LmlzRW1wdHkoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgc3RhY2suXG4gICAgICovXG4gICAgU3RhY2sucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxpc3QuY2xlYXIoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHN0YWNrIGluXG4gICAgICogTElGTyBvcmRlci5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuXG4gICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgU3RhY2sucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2FsbGJhY2spO1xuICAgIH07XG4gICAgcmV0dXJuIFN0YWNrO1xufSgpKTsgLy8gRW5kIG9mIHN0YWNrXG5leHBvcnRzLmRlZmF1bHQgPSBTdGFjaztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVN0YWNrLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGl0ZW1cbiAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5LjRcbiAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIHNlYXJjaCB0aGUgZWxlbWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHRvIHNlYXJjaC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG9cbiAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxuICogd2l0aGluIHRoZSBzcGVjaWZpZWQgYXJyYXksIG9yIC0xIGlmIG5vdCBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgaXRlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICB2YXIgZXF1YWxzID0gZXF1YWxzRnVuY3Rpb24gfHwgdXRpbC5kZWZhdWx0RXF1YWxzO1xuICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZXF1YWxzKGFycmF5W2ldLCBpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZXhwb3J0cy5pbmRleE9mID0gaW5kZXhPZjtcbi8qKlxuICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5LlxuICogQHBhcmFtIHsqfSBhcnJheSB0aGUgYXJyYXkgaW4gd2hpY2ggdG8gc2VhcmNoIHRoZSBlbGVtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gdGhlIGVsZW1lbnQgdG8gc2VhcmNoLlxuICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZCB0b1xuICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgcG9zaXRpb24gb2YgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5IG9yIC0xIGlmIG5vdCBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gbGFzdEluZGV4T2YoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgdmFyIGVxdWFscyA9IGVxdWFsc0Z1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdEVxdWFscztcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSBsZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAoZXF1YWxzKGFycmF5W2ldLCBpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZXhwb3J0cy5sYXN0SW5kZXhPZiA9IGxhc3RJbmRleE9mO1xuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCBhcnJheSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gKiBAcGFyYW0geyp9IGFycmF5IHRoZSBhcnJheSBpbiB3aGljaCB0byBzZWFyY2ggdGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0ge09iamVjdH0gaXRlbSB0aGUgZWxlbWVudCB0byBzZWFyY2guXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB0b1xuICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIGFycmF5IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gY29udGFpbnMoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGluZGV4T2YoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSA+PSAwO1xufVxuZXhwb3J0cy5jb250YWlucyA9IGNvbnRhaW5zO1xuLyoqXG4gKiBSZW1vdmVzIHRoZSBmaXJzdCBvY3VycmVuY2Ugb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50IGZyb20gdGhlIHNwZWNpZmllZCBhcnJheS5cbiAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIHNlYXJjaCBlbGVtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gdGhlIGVsZW1lbnQgdG8gc2VhcmNoLlxuICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdG9cbiAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGFycmF5IGNoYW5nZWQgYWZ0ZXIgdGhpcyBjYWxsLlxuICovXG5mdW5jdGlvbiByZW1vdmUoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgdmFyIGluZGV4ID0gaW5kZXhPZihhcnJheSwgaXRlbSwgZXF1YWxzRnVuY3Rpb24pO1xuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0cy5yZW1vdmUgPSByZW1vdmU7XG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgc3BlY2lmaWVkIGFycmF5IGVxdWFsXG4gKiB0byB0aGUgc3BlY2lmaWVkIG9iamVjdC5cbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRoZSBhcnJheSBpbiB3aGljaCB0byBkZXRlcm1pbmUgdGhlIGZyZXF1ZW5jeSBvZiB0aGUgZWxlbWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHdob3NlIGZyZXF1ZW5jeSBpcyB0byBiZSBkZXRlcm1pbmVkLlxuICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZCB0b1xuICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBzcGVjaWZpZWQgYXJyYXlcbiAqIGVxdWFsIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBmcmVxdWVuY3koYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgdmFyIGVxdWFscyA9IGVxdWFsc0Z1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdEVxdWFscztcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIHZhciBmcmVxID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChlcXVhbHMoYXJyYXlbaV0sIGl0ZW0pKSB7XG4gICAgICAgICAgICBmcmVxKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZyZXE7XG59XG5leHBvcnRzLmZyZXF1ZW5jeSA9IGZyZXF1ZW5jeTtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB0d28gc3BlY2lmaWVkIGFycmF5cyBhcmUgZXF1YWwgdG8gb25lIGFub3RoZXIuXG4gKiBUd28gYXJyYXlzIGFyZSBjb25zaWRlcmVkIGVxdWFsIGlmIGJvdGggYXJyYXlzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyXG4gKiBvZiBlbGVtZW50cywgYW5kIGFsbCBjb3JyZXNwb25kaW5nIHBhaXJzIG9mIGVsZW1lbnRzIGluIHRoZSB0d29cbiAqIGFycmF5cyBhcmUgZXF1YWwgYW5kIGFyZSBpbiB0aGUgc2FtZSBvcmRlci5cbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5MSBvbmUgYXJyYXkgdG8gYmUgdGVzdGVkIGZvciBlcXVhbGl0eS5cbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5MiB0aGUgb3RoZXIgYXJyYXkgdG8gYmUgdGVzdGVkIGZvciBlcXVhbGl0eS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG9cbiAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gZWxlbWVtZW50cyBpbiB0aGUgYXJyYXlzLlxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdHdvIGFycmF5cyBhcmUgZXF1YWxcbiAqL1xuZnVuY3Rpb24gZXF1YWxzKGFycmF5MSwgYXJyYXkyLCBlcXVhbHNGdW5jdGlvbikge1xuICAgIHZhciBlcXVhbHMgPSBlcXVhbHNGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRFcXVhbHM7XG4gICAgaWYgKGFycmF5MS5sZW5ndGggIT09IGFycmF5Mi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkxLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghZXF1YWxzKGFycmF5MVtpXSwgYXJyYXkyW2ldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0cy5lcXVhbHMgPSBlcXVhbHM7XG4vKipcbiAqIFJldHVybnMgc2hhbGxvdyBhIGNvcHkgb2YgdGhlIHNwZWNpZmllZCBhcnJheS5cbiAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IHRvIGNvcHkuXG4gKiBAcmV0dXJuIHtBcnJheX0gYSBjb3B5IG9mIHRoZSBzcGVjaWZpZWQgYXJyYXlcbiAqL1xuZnVuY3Rpb24gY29weShhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5jb25jYXQoKTtcbn1cbmV4cG9ydHMuY29weSA9IGNvcHk7XG4vKipcbiAqIFN3YXBzIHRoZSBlbGVtZW50cyBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9ucyBpbiB0aGUgc3BlY2lmaWVkIGFycmF5LlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IGluIHdoaWNoIHRvIHN3YXAgZWxlbWVudHMuXG4gKiBAcGFyYW0ge251bWJlcn0gaSB0aGUgaW5kZXggb2Ygb25lIGVsZW1lbnQgdG8gYmUgc3dhcHBlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBqIHRoZSBpbmRleCBvZiB0aGUgb3RoZXIgZWxlbWVudCB0byBiZSBzd2FwcGVkLlxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYXJyYXkgaXMgZGVmaW5lZCBhbmQgdGhlIGluZGV4ZXMgYXJlIHZhbGlkLlxuICovXG5mdW5jdGlvbiBzd2FwKGFycmF5LCBpLCBqKSB7XG4gICAgaWYgKGkgPCAwIHx8IGkgPj0gYXJyYXkubGVuZ3RoIHx8IGogPCAwIHx8IGogPj0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmV4cG9ydHMuc3dhcCA9IHN3YXA7XG5mdW5jdGlvbiB0b1N0cmluZyhhcnJheSkge1xuICAgIHJldHVybiAnWycgKyBhcnJheS50b1N0cmluZygpICsgJ10nO1xufVxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLyoqXG4gKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBhcnJheVxuICogc3RhcnRpbmcgZnJvbSBpbmRleCAwIHRvIGxlbmd0aCAtIDEuXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgaW4gd2hpY2ggdG8gaXRlcmF0ZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2goYXJyYXksIGNhbGxiYWNrKSB7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBhcnJheV8xID0gYXJyYXk7IF9pIDwgYXJyYXlfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIGVsZSA9IGFycmF5XzFbX2ldO1xuICAgICAgICBpZiAoY2FsbGJhY2soZWxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZm9yRWFjaCA9IGZvckVhY2g7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcnJheXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbmV4cG9ydHMuaGFzID0gZnVuY3Rpb24gKG9iaiwgcHJvcCkge1xuICAgIHJldHVybiBfaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufTtcbi8qKlxuICogRGVmYXVsdCBmdW5jdGlvbiB0byBjb21wYXJlIGVsZW1lbnQgb3JkZXIuXG4gKiBAZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gZGVmYXVsdENvbXBhcmUoYSwgYikge1xuICAgIGlmIChhIDwgYikge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHRDb21wYXJlID0gZGVmYXVsdENvbXBhcmU7XG4vKipcbiAqIERlZmF1bHQgZnVuY3Rpb24gdG8gdGVzdCBlcXVhbGl0eS5cbiAqIEBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBkZWZhdWx0RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYSA9PT0gYjtcbn1cbmV4cG9ydHMuZGVmYXVsdEVxdWFscyA9IGRlZmF1bHRFcXVhbHM7XG4vKipcbiAqIERlZmF1bHQgZnVuY3Rpb24gdG8gY29udmVydCBhbiBvYmplY3QgdG8gYSBzdHJpbmcuXG4gKiBAZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gZGVmYXVsdFRvU3RyaW5nKGl0ZW0pIHtcbiAgICBpZiAoaXRlbSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJ0NPTExFQ1RJT05fTlVMTCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzVW5kZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiAnQ09MTEVDVElPTl9VTkRFRklORUQnO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc1N0cmluZyhpdGVtKSkge1xuICAgICAgICByZXR1cm4gJyRzJyArIGl0ZW07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gJyRvJyArIGl0ZW0udG9TdHJpbmcoKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHRUb1N0cmluZyA9IGRlZmF1bHRUb1N0cmluZztcbi8qKlxuKiBKb2lucyBhbGwgdGhlIHByb3BlcmllcyBvZiB0aGUgb2JqZWN0IHVzaW5nIHRoZSBwcm92aWRlZCBqb2luIHN0cmluZ1xuKi9cbmZ1bmN0aW9uIG1ha2VTdHJpbmcoaXRlbSwgam9pbikge1xuICAgIGlmIChqb2luID09PSB2b2lkIDApIHsgam9pbiA9ICcsJzsgfVxuICAgIGlmIChpdGVtID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAnQ09MTEVDVElPTl9OVUxMJztcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNVbmRlZmluZWQoaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuICdDT0xMRUNUSU9OX1VOREVGSU5FRCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgdG9yZXQgPSAneyc7XG4gICAgICAgIHZhciBmaXJzdCA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gaXRlbSkge1xuICAgICAgICAgICAgaWYgKGV4cG9ydHMuaGFzKGl0ZW0sIHByb3ApKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b3JldCA9IHRvcmV0ICsgam9pbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdG9yZXQgPSB0b3JldCArIHByb3AgKyAnOicgKyBpdGVtW3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b3JldCArICd9JztcbiAgICB9XG59XG5leHBvcnRzLm1ha2VTdHJpbmcgPSBtYWtlU3RyaW5nO1xuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24uXG4gKiBAZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jKSB7XG4gICAgcmV0dXJuICh0eXBlb2YgZnVuYykgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50IGlzIHVuZGVmaW5lZC5cbiAqIEBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChvYmopIHtcbiAgICByZXR1cm4gKHR5cGVvZiBvYmopID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudCBpcyBhIHN0cmluZy5cbiAqIEBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBpc1N0cmluZyhvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuLyoqXG4gKiBSZXZlcnNlcyBhIGNvbXBhcmUgZnVuY3Rpb24uXG4gKiBAZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gcmV2ZXJzZUNvbXBhcmVGdW5jdGlvbihjb21wYXJlRnVuY3Rpb24pIHtcbiAgICBpZiAoaXNVbmRlZmluZWQoY29tcGFyZUZ1bmN0aW9uKSB8fCAhaXNGdW5jdGlvbihjb21wYXJlRnVuY3Rpb24pKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgaWYgKGEgPCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhID09PSBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oZCwgdikgKiAtMTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5leHBvcnRzLnJldmVyc2VDb21wYXJlRnVuY3Rpb24gPSByZXZlcnNlQ29tcGFyZUZ1bmN0aW9uO1xuLyoqXG4gKiBSZXR1cm5zIGFuIGVxdWFsIGZ1bmN0aW9uIGdpdmVuIGEgY29tcGFyZSBmdW5jdGlvbi5cbiAqIEBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBjb21wYXJlVG9FcXVhbHMoY29tcGFyZUZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oYSwgYikgPT09IDA7XG4gICAgfTtcbn1cbmV4cG9ydHMuY29tcGFyZVRvRXF1YWxzID0gY29tcGFyZVRvRXF1YWxzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIENvcHlyaWdodCAyMDEzIEJhc2FyYXQgQWxpIFN5ZWQuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgTUlUIG9wZW4gc291cmNlIGxpY2Vuc2UgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuLy9cbi8vIE9yZ2luYWwgamF2YXNjcmlwdCBjb2RlIHdhcyBieSBNYXVyaWNpbyBTYW50b3Ncbi8vXG52YXIgX2FycmF5cyA9IHJlcXVpcmUoXCIuL2FycmF5c1wiKTtcbmV4cG9ydHMuYXJyYXlzID0gX2FycmF5cztcbnZhciBCYWdfMSA9IHJlcXVpcmUoXCIuL0JhZ1wiKTtcbmV4cG9ydHMuQmFnID0gQmFnXzEuZGVmYXVsdDtcbnZhciBCU1RyZWVfMSA9IHJlcXVpcmUoXCIuL0JTVHJlZVwiKTtcbmV4cG9ydHMuQlNUcmVlID0gQlNUcmVlXzEuZGVmYXVsdDtcbnZhciBCU1RyZWVLVl8xID0gcmVxdWlyZShcIi4vQlNUcmVlS1ZcIik7XG5leHBvcnRzLkJTVHJlZUtWID0gQlNUcmVlS1ZfMS5kZWZhdWx0O1xudmFyIERpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0RpY3Rpb25hcnlcIik7XG5leHBvcnRzLkRpY3Rpb25hcnkgPSBEaWN0aW9uYXJ5XzEuZGVmYXVsdDtcbnZhciBIZWFwXzEgPSByZXF1aXJlKFwiLi9IZWFwXCIpO1xuZXhwb3J0cy5IZWFwID0gSGVhcF8xLmRlZmF1bHQ7XG52YXIgTGlua2VkRGljdGlvbmFyeV8xID0gcmVxdWlyZShcIi4vTGlua2VkRGljdGlvbmFyeVwiKTtcbmV4cG9ydHMuTGlua2VkRGljdGlvbmFyeSA9IExpbmtlZERpY3Rpb25hcnlfMS5kZWZhdWx0O1xudmFyIExpbmtlZExpc3RfMSA9IHJlcXVpcmUoXCIuL0xpbmtlZExpc3RcIik7XG5leHBvcnRzLkxpbmtlZExpc3QgPSBMaW5rZWRMaXN0XzEuZGVmYXVsdDtcbnZhciBNdWx0aURpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL011bHRpRGljdGlvbmFyeVwiKTtcbmV4cG9ydHMuTXVsdGlEaWN0aW9uYXJ5ID0gTXVsdGlEaWN0aW9uYXJ5XzEuZGVmYXVsdDtcbnZhciBGYWN0b3J5RGljdGlvbmFyeV8xID0gcmVxdWlyZShcIi4vRmFjdG9yeURpY3Rpb25hcnlcIik7XG5leHBvcnRzLkZhY3RvcnlEaWN0aW9uYXJ5ID0gRmFjdG9yeURpY3Rpb25hcnlfMS5kZWZhdWx0O1xudmFyIEZhY3RvcnlEaWN0aW9uYXJ5XzIgPSByZXF1aXJlKFwiLi9GYWN0b3J5RGljdGlvbmFyeVwiKTtcbmV4cG9ydHMuRGVmYXVsdERpY3Rpb25hcnkgPSBGYWN0b3J5RGljdGlvbmFyeV8yLmRlZmF1bHQ7XG52YXIgUXVldWVfMSA9IHJlcXVpcmUoXCIuL1F1ZXVlXCIpO1xuZXhwb3J0cy5RdWV1ZSA9IFF1ZXVlXzEuZGVmYXVsdDtcbnZhciBQcmlvcml0eVF1ZXVlXzEgPSByZXF1aXJlKFwiLi9Qcmlvcml0eVF1ZXVlXCIpO1xuZXhwb3J0cy5Qcmlvcml0eVF1ZXVlID0gUHJpb3JpdHlRdWV1ZV8xLmRlZmF1bHQ7XG52YXIgU2V0XzEgPSByZXF1aXJlKFwiLi9TZXRcIik7XG5leHBvcnRzLlNldCA9IFNldF8xLmRlZmF1bHQ7XG52YXIgU3RhY2tfMSA9IHJlcXVpcmUoXCIuL1N0YWNrXCIpO1xuZXhwb3J0cy5TdGFjayA9IFN0YWNrXzEuZGVmYXVsdDtcbnZhciBNdWx0aVJvb3RUcmVlXzEgPSByZXF1aXJlKFwiLi9NdWx0aVJvb3RUcmVlXCIpO1xuZXhwb3J0cy5NdWx0aVJvb3RUcmVlID0gTXVsdGlSb290VHJlZV8xLmRlZmF1bHQ7XG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuZXhwb3J0cy51dGlsID0gX3V0aWw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXX0=
return require('typescript-collections');
});