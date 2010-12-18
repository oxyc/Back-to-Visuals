/**
 * Text object
 * @param attr  attribute object
 * @param ctx   canvas 2d context
 *
 * this.x
 * this.y
 * this.size
 * this.family
 * this.style
 * this.shadow.x
 * this.shadow.y
 * this.shadow.blur
 * this.shadow.color
 * this.align
 * this.width
 * this.hidden
 */

/**
 * Text object
 * @param {Object}                      attr to pass as settings
 * @param {CanvasRenderingContext2D}    ctx to render into
 */
var Text = function ( attr, ctx ) {
    var i, shadow;

    this.ctx = ctx;

    for ( i in attr ) {
        this[ i ] = attr[i];
    }

    if ( ( shadow = this.shadow ) ) {
        shadow.x     = ( shadow.hasOwnProperty("x")     ) ? shadow.x     : 0;
        shadow.y     = ( shadow.hasOwnProperty("y")     ) ? shadow.y     : 0;
        shadow.blur  = ( shadow.hasOwnProperty("blur")  ) ? shadow.blur  : 0;
        shadow.color = ( shadow.hasOwnProperty("color") ) ? shadow.color : 0;
    }

    if ( this.x && this.y && this.hidden !== true ) {
        this.create();
    }

    return this;
};

Text.prototype = {
    
    /**
     * Append the text to the context
     * @returns this
     */
    create : function () {
        var ctx = this.ctx,
            shadow = this.shadow;

        ctx.save();
        ctx.font = this.size +"px "+ this.family;

        if ( shadow ) {

            // The style is defined as a color
            if ( typeof this.style === "string" ) {
                ctx.shadowOffsetX = shadow.x;
                ctx.shadowOffsetY = shadow.y;
                ctx.shadowBlur    = shadow.blur;
                ctx.shadowColor   = shadow.color;

            // Pattern + Shadow BUG
            } else {
                ctx.fillStyle = shadow.color;
                ctx.fillText( this.text, this.x + shadow.x, this.y + shadow.y );
            }
        }

        if ( !this.text_width ) {
            this.text_width = ctx.measureText( this.text ).width;
        }

        if ( this.align ) {
            switch ( this.align ) {
            case "center":
                this.x = ( this.width - this.text_width) / 2;
                break;
            case "right":
                this.x = ( this.width - this.text_width);
                break;
            }
        }
        ctx.fillStyle = this.style;
        ctx.fillText( this.text, this.x, this.y );
        ctx.restore();
        return this;
    },

    /**
     * Set attributes
     * @param {Object} attr settings to change
     * @returns this
     */
    set : function ( attr ) {
        for ( var i in attr ) {
            this[ i ] = ( typeof attr[ i ] === "number" ) ? ~~attr[ i ] : attr[ i ];
        }
        return this.create();
    },

    /**
     * Move the text
     * @param {Float} x
     * @param {Float} y
     * @returns this
     */
    move : function ( x, y ) {

        // The text is still visible
        if ( this.x > ( 0 - this.text_width || 0 ) ) {
            this.x += x;
            this.y += y;
            return this.create();
        }
        return null;
    },

    /**
     * Grow the text
     * @param {Object } obj size, the size to grow the text into
     *                  zoom, should the text stay in place
     *                  duration, in milliseconds divided by Demo dealy (TODO)
     *                  callback, function to call
     *                  scope, scope for callback function
     * @returns this
     */
    grow : function ( obj ) {

        if ( this.size <= obj.size ) {
            if ( obj.zoom ) {
                this.size =  ( this.size === 0 ) ? 1 : this.size * 1.1 ;
                this.x    = -( this.size * this.text.length ) / 2;
                this.y    = this.size / 2;
            } else {
                this.size_step = this.size_step || (obj.size - this.size ) / obj.duration;
                this.size     += this.size_step;
            }
        } else {
            if(typeof obj.callback === "function" ) {
                obj.callback.apply( obj.scope, arguments );
            }
        }
        return this.create();
    },

    /**
     * Text sinescroller
     * @param {Object} obj  width, the width of the scroller
     *                      r, function to calculate red
     *                      g, function to calculate green
     *                      b, function to calculate blue
     *                      y_offset, how big the curve should be
     * @returns true when scroll is complete
     */
    sineScroller : function ( obj ) {
        var i, left;

        if ( !this.x_offset ) {
            this.x_offset = 0;
            this.tick     = 0;
        }
        this.ctx.font = this.size +"px "+ this.family;

        for ( i = 0; i < this.text.length; i++ ) {
            left = obj.width - ( this.x_offset * this.speed ) +
                    ( i * ( this.size + this.spacing ) );
            this.ctx.fillStyle = " rgb( "+
                    ~~obj.r( this.tick, i ) +", "+
                    ~~obj.g( this.tick, i ) +", "+
                    ~~obj.b( this.tick, i ) +" )";
            this.ctx.fillText( this.text.charAt( i ), left, this.y + obj.y_offset( this.tick, i ) );

            if( i === this.text.length - 1 && left < -this.size ) {
                return true;
            }
        }
        this.x_offset++;
        this.tick++;
    },

    /**
     * Slide text
     * @param {Object} obj  x, position to scroll to
     *                      duraiton, in milliseconds divided by demo delay (TODO)
     *                      callback, function to call when slide is complete
     * @return this
     */
    slide : function( obj ) {
        if ( !this.step ) {
            this.step = ( ( obj.x - this.x ) / obj.duration );
        }

        if ( this.x >= obj.x ) {
            this.move( this.step, 0 );
        } else {
            if ( typeof obj.callback === "function" ) {
                obj.callback.apply(obj.scope, arguments );
            }
        }
        return this.create();
    }
};