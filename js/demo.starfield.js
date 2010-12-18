

var Starfield = function() {
};

Starfield.prototype = {

    __init : function () {
        var i, ctx      = this.canvas.ctx,
                fn       = this.fn,
                text_obj = {
                    size      : 0,
                    family    : "PetMe128Medium",
                    style     : "#fff",
                    x         : -this.width * 0.45
                },
                plasma_obj = fn.extend( true, {
                    x         : 0,
                    y         : 0,
                    shadow    : {
                        color : "#ff0000",
                        blur  : 10
                    }
                }, text_obj );

        // Settings
        this.stars      = 700;
        this.units      = [];
        this.depth      = 3;
        this.opacity    = 0.75;
        this.speed      = {x : 0, y : 0, z : -0.075};
        this.properties = {
            speed     : {x : 0,y : 0,z : -0.075},
            size      : 1.5,
            depth     : this.depth,
            boundries : {
                x : {min : -this.width >> 1, max : this.width >> 1},
                y : {min : -this.width >> 1, max : this.width}
            }
        };

        // Timers / placeholders
        //this.tick  = 0;
        this.tick2 = 0;

        // Create stars
        for ( i = 0; i < this.stars; i++ ) {
            this.units.push( new Particle( this.properties ) );
        }
        ctx.translate( this.width >> 1, this.height >> 1 );

        // Messages
        this.msg = [
            new Text( fn.extend( true, {
                text : "Let's",
                y    : -this.height >> 2
            }, text_obj ), ctx ),

            new Text( fn.extend( true, {
                text : "step it",
                y    : 0
            }, text_obj ), ctx ),
            
            new Text( fn.extend( true, {
                text : "up a notch!",
                y    : this.height >> 2
            }, text_obj ), ctx )
        ];

        this.msg_plasma = [
            new Text( fn.extend( {text: "A DEMO"  }, plasma_obj ), ctx ),
            new Text( fn.extend( {text: "WITHOUT" }, plasma_obj ), ctx ),
            new Text( fn.extend( {text: "PLASMA?" }, plasma_obj ), ctx ),
            new Text( fn.extend( {text: "OH"      }, plasma_obj ), ctx ),
            new Text( fn.extend( {text: "HELL NO!"}, plasma_obj ), ctx )
        ];
        
    },

    __output : function () {
        var i, prop,
                ctx = this.canvas.ctx;

        ctx.fillStyle = "rgba(0,0,0,"+ this.opacity +")";
        ctx.fillRect( -this.width >> 1, -this.height >> 1, this.width ,this.height );

        // Output messages one at a time
        if ( this.msg[0] ) {
            this.msg[0].grow({
                size     : 300,
                duration : 75, // I'm getting too lazy tbh
                callback : function() {
                    this.msg.shift();
                },
                scope    : this
            });

        // When the array is empty, render the effect
        } else {
            ctx.save();
            
            // Simulate zooming into
            if ( this.tick < 100 ) {
                ctx.scale( this.tick * 0.01, this.tick * 0.01 );
            }

            ctx.rotate( Math.sin( this.tick2++ / 300) * 10 );//* 0.025);
            ctx.fillStyle = "rgb(255,100,255)";

            // Move the stars
            for( i = 0; i < this.stars; i++ ) {
                prop = this.units[ i ].move();
                ctx.fillRect( prop.x, prop.y, prop.size, prop.size );
            }
            ctx.restore();
            
            if ( this.tick > 600 && this.msg_plasma[0] ) {
                this.msg_plasma[0].grow({
                    size     : 400,
                    duration : 100,
                    zoom     : true,
                    callback : function() {
                        this.msg_plasma.shift();
                    },
                    scope    : this
                });
            }
            
            if ( !this.msg_plasma.length ) {
                this.opacity -= 0.0045;
            }
        }
    },

    __destruct : function () {
        
        // Reset position
        this.canvas.ctx.translate( -this.width >> 1, -this.height >> 1 );
    },
    
    toString : function () {
        return "Starfield";
    }
};