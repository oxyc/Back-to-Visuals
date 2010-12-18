/**
 * End scene with flames and credits
 */

var Credits = function () {
};

Credits.prototype = {

    __init : function () {
        var x , y, ctx   = this.canvas.ctx,
                fn       = this.fn,
                text_obj = {
                    size   : 50,
                    family : "PetMe128Medium",
                    style  : "#000",
                    shadow : {
                        color : "rgba(255,255,255,0.3)",
                        x     : 1,
                        y     : 1
                    },
                    x      : 0,
                    width  : this.width,
                    align  : "center"
                };

        // Settings
        this.twidth  = this.width  >> 4; // performance hack, scale back later
        this.theight = this.height >> 6; // distort it
        this.palette_multipliers = [ 1, 1, 1 ];
        this.multipliers         = [ 4, 8, 16, 16, 1, 1, 1 ];

        // Temporary canvas for scaling purposes
        this.temp           = new Canvas().setSize( this.twidth, this.theight );
        this.tctx           = this.temp.ctx;
        this.tctx.fillStyle = "#000";
        this.tctx.fillRect( 0, 0, this.twidth, this.theight );

        this.timg           = this.tctx.getImageData( 0, 0, this.temp.width, this.temp.height );
        this.tidata         = this.timg.data;

        this.buffer         = [];
        this.multiplier     = 0;

        // Fill buffer with black
        for ( x = 0; x < this.width; x++ ) {
            this.buffer[ x ] = [];

            for ( y = 0; y < this.height; y++ ) {
                this.buffer[ x ][ y ] = 0;
            }
        }

        this.msg = [
            new Text( fn.extend( {
                text  : "BACK TO VISUALS! A JAVASCRIPT DEMO FOR TLK LAN 2010.4. THANKS FOR WATCHING!",
                size  : 75,
                y     : 200,
                x     : this.width,
                align : "left",
                style : "rgb(255,255,255)"
            }, text_obj ), ctx ),

            new Text( fn.extend( true, {
                text  : "CODE BY : oxy   ",
                y     : this.height - 200
            }, text_obj ), ctx ),

            new Text( fn.extend( true, {
                text  : "MUSIC BY : Scarzix",
                y     : this.height - 130
            }, text_obj ), ctx )
        ];

    },

    __output : function () {
        var one_above, two_above, idx, x, y, i, temp,
                ctx    = this.canvas.ctx,
                width  = this.twidth,
                height = this.theight;

        if ( this.tick < 100 ) {
            this.multiplier = this.tick * 0.02;
        }

        // Randomize first line
        for ( x = 0; x < width; x++ ) {
            this.buffer[ x ][ height - 1 ] = Math.random();
        }

        // Caculate top lines according to first line
        for ( y = 0; y < height - 1; y++ ) {
            one_above = ( y + 1 ) % height;
            two_above = ( y + 2 ) % height;

            for ( x = 0; x < width; x++ ) {
                temp =  this.buffer[ x ][ y ] = ( ( (
                        this.buffer[ ( x - 1 + width ) % width ][ one_above ] +
                        this.buffer[ ( x )             % width ][ one_above ] +
                        this.buffer[ ( x + 1 )         % width ][ one_above ] +
                        this.buffer[ ( x )             % width ][ two_above ] ) *
                        this.multiplier ) / 9 );
                idx = ( x + y * width ) * 4;

                this.tidata[ idx + 0 ] = 255 * temp; // reg
                this.tidata[ idx + 1 ] = 25  * temp; // green
            }
        }
        
        this.tctx.putImageData( this.timg, 0, 0 );
        ctx.drawImage( this.temp.element, 0, 0, this.width, this.height + 40 );

        // Thanks for watching
        if ( this.tick > 150 ) {
            this.msg[ 0 ].move( -10, 0 );
        }

        // Credits
        if ( this.tick > 250 ) {
            for ( i = this.msg.length; i--; ) {
                this.msg[ i ].create();
            }
        }


    },
    toString : function() {
        return "End credits";
    }
};