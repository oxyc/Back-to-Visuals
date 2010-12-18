/**
 * Seems like drawing lines and filling is realy slow in FF, is this a fact or
 * does my code fail somewhere?
 */
var Tunnel = function() {
};

Tunnel.prototype = {

    __init : function () {

        // Settings
        this.scale       = this.height >> 2;
        this.rings       = 28;
        this.points      = 15;
        this.depth       = {max:3};
        this.depth.step  = 1.5 * this.depth.max / this.rings;
        this.depth.shift = this.depth.step;
        this.col         = {step: 2 * Math.PI / this.points};

        // Timers and placeholders
        this.ticks       = 0;
        this.movementx   = 1;
        this.movementy   = 1;
        this.light       = 1;

        this.canvas.ctx.translate( this.width >> 1, this.height >> 1 );
        
    },

    __output : function () {
        var ring_curr, ring, point, z, color, column, t, multiplier, posx, posy,
                ctx = this.canvas.ctx,
                ring_prev = 0;

        this.ticks++;
        this.depth.shift -= this.depth.step / 2.8;

        if ( this.depth.shift < 0 ) {
            this.depth.shift += this.depth.step;
        }

        switch ( true ) {
        case ( this.ticks >  128  && this.ticks < 256 ) :
            this.movementx++;
            break;

        case ( this.ticks >  368  && this.ticks < 900 ) :
            this.movementy++;
            break;

        case ( this.ticks > 768 ) :
            this.light -= 0.01;

            if ( this.movementx > -64 ) {
                this.movementx--;
            }

            if ( this.ticks > 1100 && this.rings > 1 ) {
                this.rings--;
            }

            if ( this.ticks > 1024 && this.movementy > -64 ) {
                this.movementy--;
            }
            break;
        }
        
        // A black plane at the end of the tunnel, so we can knit the tunnel to background
        ctx.fillStyle = ( this.ticks < 1024 ) ? "rgb(97,194,194)" : "rgb(255,255,255)";
        ctx.fillRect( -this.width >> 1, -this.height >> 1, this.width, this.height );

        if ( this.ticks < 768 ) {
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect( -this.width >> 2, -this.height >> 2, this.width >> 1, this.height >> 1 );
        }

        for ( ring = this.rings; ring--; ) {
            z          = ring * this.depth.step + this.depth.shift;
            color      = ~~( 200 - 168 / ( this.depth.max + this.depth.shift ) * z * this.light );
            posx       = Math.sin( z + this.ticks / 50) * this.movementx;
            posy       = Math.cos( z + this.ticks / 40) * this.movementy;
            multiplier = this.scale / z;
            ring_curr  = []; // Current active 4 points
            // walls
            ctx.strokeStyle = ctx.fillStyle= "rgb("+ ~~( color / 2 ) +", "+ color +", "+ color +")";
            
            for ( point = 0 ; point < this.points * 4 ; point += 4 ) {
                column     = point / 4;
                t          = column * this.col.step + Math.PI + Math.sin( this.ticks / 100 ); // rotates the camera

                ring_curr[ point     ] = posy + Math.sin( t                 ) * multiplier;
                ring_curr[ point + 1 ] = posx + Math.cos( t                 ) * multiplier;
                ring_curr[ point + 2 ] = posy + Math.sin( t + this.col.step ) * multiplier;
                ring_curr[ point + 3 ] = posx + Math.cos( t + this.col.step ) * multiplier;
                
                if ( ring_prev ) {
                    this.connect([
                        [ ring_curr[ point     ], ring_curr[ point + 1 ] ],
                        [ ring_curr[ point + 2 ], ring_curr[ point + 3 ] ],
                        [ ring_prev[ point + 2 ], ring_prev[ point + 3 ] ],
                        [ ring_prev[ point     ], ring_prev[ point + 1 ] ]
                    ]);
                }
            }
            ring_prev = ring_curr;
        }
    },
    
    /**
     * Connect 4 coordinates and fill the area
     * @param dots  4 coordinates in a two-dimensional array
     */
    connect : function ( dots ) {
        var ctx = this.canvas.ctx;

        ctx.beginPath();
        ctx.moveTo( dots[0][0], dots[0][1] );
        ctx.lineTo( dots[1][0], dots[1][1] );
        ctx.lineTo( dots[2][0], dots[2][1] );
        ctx.lineTo( dots[3][0], dots[3][1] );
        ctx.fill();
        ctx.stroke();
    },

    __destruct : function () {
        this.audio.next( 10000 );
        this.canvas.ctx.translate( -this.width >> 1, -this.height >> 1 );
    },
    
    toString : function () {
        return "Tunnel";
    }
};