/**
 * Canvas object
 * @param element   HTML element
 * @param width     (opt) desired width
 * @param height    (opt) desired height
 * @return self for chaining
 *
 * this.element
 * this.ctx
 * this.width
 * this.height
 */
var Canvas = function ( element, width, height ) {

    this.element = element || this.create();

    if ( width && height ) {
        this.setSize( width, height );
    }

    this.ctx = this.element.getContext('2d');
    
    return this;
};

Canvas.prototype = {
    /**
     * Create the HTML element
     */
    create : function () {
        log("Canvas: Canvas element created");
        return window.document.createElement('canvas');
    },
    /**
     * Append the element to the DOM
     * @param parent    (opt) element, default is body
     * @return element
     */
    append : function ( parent ) {
        return ( parent ? parent : window.document.body )['appendChild']( this.element );
    },
    /**
     * Change the size of the element
     * @param width
     * @param height
     * @return self
     */
    setSize : function( width, height) {
        this.element.width  = this.width  = width;
        this.element.height = this.height = height;
        return this;
    }
};