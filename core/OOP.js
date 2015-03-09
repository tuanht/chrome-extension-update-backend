/**
 * Core for OOP's inherits implementation
 */

/*
* Define parent function for class
*/
function parent() {
    // Get the caller that call this function
    var fn = arguments.callee.caller;
    // If the caller has _super method, then call it
    if (!fn._super) return;
    return fn._super.apply(this, arguments);
}

/**
 * Set superclass for each implementation (method)
 * @param superclass Super class
 * @param implementation Class implementation
 *      Inlude properties and methods (functions) declare by JSON
 */
Function.prototype._inherits = function(superclass, implementation) {
    implementation.constructor = this;
    this.prototype = implementation;

    // Loop every method
    for (var k in implementation) {
        // if method k is exists in superclass
        if (implementation[k] instanceof Function &&
                superclass.prototype[k] instanceof Function) {
            // Then set _super property of method to superclass's method
            implementation[k]._super = superclass.prototype[k]; 
        }
    }
    this.prototype.__proto__ = superclass.prototype;

    // Bind parent function to new class
    this.prototype.parent = parent;

    return this;
};

/**
 * Use this function to declare a class
 * @param sclass Super class
 * @param impl Class implementation.
 *      Inlude properties and methods (functions) declare by JSON
 */
function inherit(sclass, impl) {
    // If implementation is null, then set to superclass
    (impl != null) || (impl = sclass, sclass = Object);
    return (function() {
        // Init is constructor function, will be call
        // automatically when create (new) class
        this.init && this.init.apply(this, arguments);
    })._inherits(sclass, impl);
}

exports.inherit = inherit;
