/*
 * Vertical lines
 * 128 + (128 * sin) is always between 0 and 256
 * 100 is controlling the period
 * var color = 128 + (128 * Math.sin(x / 100));
 */

/*
 * Circles
 * Sinus of the distance between (x1, x2) and the middle of the image
 * var color = 128 + ( 128 * Math.sin(
        distance( x, y, ( image.width / 2 ), ( image.height / 2 ) ) / 40
    ));
 */

var Plasma = function () {
};

Plasma.prototype = {

    __init : function () {

        // Settings
        this.twidth  = this.width  >> 3; // performance hack, rescale later
        this.theight = this.height >> 3;
        this.palette_multipliers = [ 1, 1, 1 ];
        this.multipliers         = [ 4, 8, 16, 16, 1, 1, 1 ];

        // Temporary canvas for scaling purposes
        this.temp  = new Canvas().setSize( this.twidth, this.theight );
        this.tctx  = this.temp.ctx;
        this.timg  = this.tctx.createImageData( this.temp.width, this.temp.height );
        this.tdata = this.timg.data;

        // Timers / placeholders
        this.palette = [];
        this.timer    = 0;
        this.setPalette( 1, 1, 1 );

    },
    
    __output : function () {
        var idx, x, y, depth,
                x2 = this.trigTo256( Math.sin( -this.timer / this.multipliers[0] ) ),
                y2 = this.trigTo256( Math.cos( -this.timer / this.multipliers[1] ) );
        
        // Fade in
        if ( this.timer < 55 ) {
            //this.multipliers[0]-= 0.01;
            this.multipliers[1]-= 0.01;
            this.multipliers[2]-= 0.01;
            this.multipliers[3]-= 0.02;
        }
        
        // Switch palette every 16th tick
        if ( ( this.tick & 15 ) === 0 ) { // % 16
            this.setPalette(
                ++this.multipliers[4] * 0.015,
                  this.multipliers[5] * 0,
                ++this.multipliers[6] * 0.03
            );
        }

        for( x = 0; x < this.twidth; x++ ) {
            for( y = 0; y < this.theight; y++ ) {

                // Index of the pixel in the array
                idx = ( x + y * this.twidth ) << 2;

                // Combination of vertical line and circle + time distorter
                depth = this.to255( 128 + ( 128 * 
                        ( Math.sin( this.distance( x, y, x2, y2      ) / this.multipliers[2] ) +
                          Math.cos( this.distance( x, y, x2, y2 >> 2 ) / this.multipliers[3] ) +
                          Math.sin( x / 8 + this.timer ) ) ) );

                // Set the pixel color data
                this.tdata[ idx + 0 ] = this.palette[ depth ][ 0 ];  // R
                this.tdata[ idx + 1 ] = this.palette[ depth ][ 1 ];  // G
                this.tdata[ idx + 2 ] = this.palette[ depth ][ 2 ];  // B
                this.tdata[ idx + 3 ] = 255;                         // A

            }

        }
        this.timer = this.timer + 0.1; // distort

        // Hidden canvas
        this.tctx.putImageData( this.timg, 0, 0 );

        // Visible canvas scaled
        this.canvas.ctx.drawImage( this.temp.element, 0, 0, this.width, this.height );

    },

    /**
     * Setup palette of colors
     * @param r red
     * @param g green
     * @param b blue
     */
    setPalette : function ( r, g, b ) {
        for( var i = 0; i < 256; i++ ) {
            this.palette[ i ] = [];
            this.palette[ i ][ 0 ] = this.trigTo256( -Math.cos( 3.14 * i / 128 * r ) );
            this.palette[ i ][ 1 ] = this.trigTo256(  Math.sin( 3.14 * i / 128 * g ) );
            this.palette[ i ][ 2 ] = this.trigTo256(  Math.sin( 3.14 * i / 128 * b ) );
        }
    },

    /**
     * Calculate distance between two points
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @return distance
     */
    distance : function ( x1, y1, x2, y2 ) {
        return Math.sqrt( ( x1 - x2 ) * ( x1 - x2 ) + ( y1 - y2) * ( y1 - y2 ) );
    },

    /**
     * Convert [-1,1] to [0, 256]
     * @param x trig value
     * @return new value
     */
    trigTo256 : function ( x ) {
       return ~~( 256 * ( x + 1) / 2 );
    },

    /**
     * Cap to 0-255 range
     * @param x
     * @return new value
     */
    to255 : function ( x ) {
       return ~~( Math.max( 0, Math.min( 255, x ) ) );
    },

    toString : function () {
        return "Plasma";
    }
};