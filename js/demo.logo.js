/**
 * Morhping particle system
 * Big bang -> torus -> logo -> tlk
 */
var Logo = function () {
    this.img     = new Image();
    this.img.src = "images/tlk.png";
};

Logo.prototype = {

    __init : function () {
        var tctx, offset, x, y, idx, i, j, k, data, message_width;

        // Settings
        this.num          = 3000;
        this.units        = [];
        this.size         = 5;

        // Torus settings
        this.radius_inner = 40;
        this.radius_outer = 130;
        this.rings        = 60;
        this.dots         = 50; // 60 * 50 = 3000 : totaling this.num
        this.speed        = 0.1;

        // Cache
        this.cache            = [];
        this.cache["message"] = [];
        this.cache["logo"]    = [];

        offset = {
            logo : {
                x : ( this.width - this.img.width ) / 2,
                y : 0
            },
            message : {
                x : 0,
                y : 0
            }
        };

        //this.translate_x = ( this.width  - this.img.width  ) / 2;
        //this.translate_y = ( this.height - this.img.height ) / 2;

        // Setup LOGO
        this.temp = new Canvas().setSize( this.width, this.height );
        tctx      = this.temp.ctx;
        tctx.drawImage( this.img, 0, 0 );
        data      = tctx.getImageData( 0, 0, this.img.width, this.img.height ).data;

        for ( x = 0; x < this.img.width; x++ ) {
            for ( y = 0; y < this.img.height; y++ ) {
                idx = ( x + y * this.img.width ) << 2;

                // Only check if R channel is 255
                if ( data[ idx ] === 255 ) {
                    this.cache["logo"].push({
                        x : x + offset.logo.x,
                        y : y + offset.logo.y
                    });
                }
            }
        }
        tctx.clearRect( 0, 0, this.width, this.height);

        // SETUP MESSAGE
        tctx.font      = "400px PetMe128Medium";
        tctx.fillStyle = "#fff";
        tctx.fillText( "TLK", 0, 400 );

        // line height is messing with us
        message_width = tctx.measureText( "TLK" ).width;
        data          = tctx.getImageData( 0, 0, message_width, ( this.width > 400 ) ?
                400 : this.width ).data;

        for ( i = 0; i < message_width; i++ ) {
            for ( j = 0; j < 800; j++ ) { // 800: data height
                idx = ( i + j * message_width ) << 2;

                // Only check if R channel is 255
                if ( data[ idx ] === 255) {
                    this.cache["message"].push({
                        x : i + (this.width - message_width) / 2 + offset.message.x,
                        y : j + offset.message.y
                    });
                }
            }
        }

        // Initialize particle units
        for ( k = 0; k < this.num; k++ ) {

            //this.units.push( this.logo[~~( Math.random() * pixels )] );
            this.units.push(new Pixel(
                this.width >> 1, this.height >> 1
            ));
        }
        
        //ctx.translate( this.translate_x, this.translate_y );
    },

    __output : function () {
        var i, particle,
                ctx   = this.canvas.ctx,
                units = this.units.length;

        ctx.fillStyle = "#000";
        ctx.fillRect( 0, 0, this.width, this.height );
        ctx.fillStyle = "rgba(255,100,255,.5)";
        //ctx.fillRect( -this.translate_x, -this.translate_y, this.width, this.height );
        
        if ( this.tick === 0 ) {
            this.toRandom();
        } else if ( this.tick > 150 && this.tick < 650 ) {
            this.toTorus();
        } else if ( this.tick === 650 ) {
            this.toLogo();
        } else if ( this.tick === 900 ) {
            this.cache["logo"] = null;
            this.toText();
        }

        // Draw particles
        for ( i = 0; i < units; i++) {
            particle = this.units[ i ].reset( Math.random(), Math.random() * 3 );
            ctx.fillRect( particle.x, particle.y, this.size, this.size );
        }

    },

    /**
     * Big Bang randomizer
     */
    toRandom : function () {
        var i, units = this.units.length;

        for ( i = 0; i < units; i++ ) {
            this.units[ i ].set(
                (1 - Math.random() * 2 ) * ( this.width  << 2 ) * Math.random(),
                (1 - Math.random() * 2 ) * ( this.height << 2 ) * Math.random()
            );
        }
    },

    toLogo : function () {
        var point,i,
            pixels = this.cache["logo"].length - 1,
            units  = this.units.length;

        for ( i = 0; i < units; i++ ) {
            point = this.cache["logo"][ ~~( Math.random() * pixels ) ];
            this.units[ i ].set( point.x, point.y );
        }
    },

    toText : function () {
        var point, i,
                pixels = this.cache["message"].length - 1,
                units  = this.units.length;
            
        for( i = 0; i < units; i++ ) {
            point = this.cache["message"][ ~~( Math.random() * pixels ) ];
            this.units[ i ].set( point.x, point.y );
        }
    },

    /*
     * x(u,v) = (R + r cos v) cos u
     * y(u,v) = (R + r cos v) sin u
     * z(u,v) = r sin v
     */
    toTorus : function () {
        var i, j, v, u, torus, x, y, z,
                dot_deg  = 2 * Math.PI / this.rings,
                ring_deg = 2 * Math.PI / this.dots,
                modifier = this.tick * this.speed,
                width    = this.width  >> 1,
                height   = this.height >> 1;
            
        for ( i = 0; i < this.rings; i++ ) {
            v = i % this.rings; // [0,2pi]

            for ( j = 0; j < this.dots; j++ ) {
                u = j % this.dots; // [0,2pi]

                torus = this.radius_outer + ( this.radius_inner * Math.cos( u * ring_deg ) );

                x     = torus * Math.cos( ( v + modifier ) * dot_deg );
                y     = torus * Math.sin( ( v + modifier ) * dot_deg ) * Math.cos( modifier / 2 );
                z     = this.radius_inner * Math.sin( u * ring_deg ) * Math.sin( modifier / 2 );

                // Set new particle origin
                this.units[ ( i + j * this.rings ) ].set(
                    width + ~~( x - y ),
                    height + ~~( x + y + 2 * z )
                );

                /*ctx.fillRect(
                    160 + Math.floor( ( x - y ) ),
                    200 + Math.floor( ( x + y ) + z ), 1, 1);*/
            }
        }
    },

    toString : function () {
        return "TLK Logo";
    }
};

/**
 * Particle system
 * Should check if we loose performance by merging with particle system used in starfield
 */
var Pixel = function ( x, y ) {
    this.orig   = {};
    this.orig.x = this.x = x;
    this.orig.y = this.y = y;
};

Pixel.prototype = {

    move : function ( x, y ) {
        this.x += x;
        this.y += y;
        return {
            x : this.x,
            y : this.y
        };
    },

    reset : function ( x_off, y_off ) {
        return this.move( ( this.orig.x - this.x ) * 0.025 + ( x_off || 0 ),
                ( this.orig.y - this.y ) * 0.025 + ( y_off || 0 ) );
    },

    set : function ( x, y ) {
        this.orig.x = x;
        this.orig.y = y;
    }
};