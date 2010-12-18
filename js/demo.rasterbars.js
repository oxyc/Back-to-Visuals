var Rasterbars = function () {
    this.img      = new Image();
    this.img.src  = "images/silhouette.png";
    
    this.iimg     = new Image();
    this.iimg.src = "images/silhouette_inverted.png";
};

Rasterbars.prototype = {

    __init : function () {
        var ctx = this.canvas.ctx;

        // Settings
        this.bar_num   = 15;
        this.bar_begin = 200;
        this.image_pos = {
            x : ( this.width  - this.img.width  ) >> 1,
            y : ( this.height - this.img.height ) >> 1
        };

        this.pattern  = [ 'd563db', 'f054b8', 'f53a80', 'fa1e42', 'ff0205', 'e8061e',
                'cf0c3f', 'b9125d', 'a0187d', '871e9e', '6e25be', '562bdf', '3f31fd',
                '362be1', '2e25c1', '261fa0', '1f1980', '171362', '100c41', '080621' ];
        
        this.bar_height  =  this.pattern.length;
        this.bar_spacing = -this.pattern.length;
        /*
         * replaced with static colors, 20 values
        this.bar_height = 20;
        this.bar_spacing = -20;
        */

        // Timers / placeholders
        this.fade = 255;

        // Messages
        this.msg_hope = new Text({
            text      : "Yo! I hope you're enjoying the party!",
            size      : 100,
            family    : "PetMe128Medium",
            style     : "#000",
            spacing   : 10,
            speed     : 10,
            x         : this.width,
            y         : this.height >> 1,
            hidden    : true
        }, ctx);

        // Static ctx content
        ctx.fillStyle = "#fff";
        ctx.fillRect( 0, 0, this.width, this.height );
        ctx.drawImage( this.img, this.image_pos.x, this.image_pos.y );

    },

    __output : function () {
        var r, g, b, current_pos, i, j, temp,
                ctx = this.canvas.ctx;

        ctx.clearRect( 0, 0, this.width, this.height );

        // Fade to black
        if ( this.fade > 0 ) {
            this.fade    -= 4;
            ctx.fillStyle = "rgb("+ this.fade +","+ this.fade +","+ this.fade +")";
            ctx.fillRect( 0, 0, this.width, this.height );
            ctx.drawImage( this.img, this.image_pos.x, this.image_pos.y );
            this.tick = 0;

        // Draw rasterbars
        } else {
            temp = Math.sin( ( ( this.tick ) / 20) * Math.PI );
            r    = ~~(128 +  temp * 128 );
            g    = ~~(128 +  Math.cos( ( ( this.tick ) / 20) * Math.PI ) * 128 );
            b    = ~~(128 + -temp * 128 );

            // Background
            ctx.fillStyle = "#000";
            ctx.fillRect( 0, 0, this.width, this.height );

            // Inverted image
            ctx.fillStyle = "rgb("+ r +","+ g +", "+ b +")";
            ctx.fillRect( this.image_pos.x + 1, this.image_pos.y + 1,
                    this.iimg.width - 1, this.iimg.height - 1 );
            ctx.drawImage( this.iimg, this.image_pos.x, this.image_pos.y );

            for ( i = 0; i < this.bar_num; i++ ) {

                // Calculate where the next bar should be positioned
                current_pos = 200 + ( Math.sin( ( this.tick * ( Math.PI * i * 0.1 ) ) * 0.0075 ) ) *
                        300 + this.bar_begin + ( i * ( this.bar_height + this.bar_spacing ) );

                /*
                too intense for FF
                gradient = ctx.createLinearGradient( 0, current_pos, 0, current_pos + this.bar_height );
                gradient.addColorStop(0.0, '#ec6ef1');
                gradient.addColorStop(0.2, '#ff0000');
                gradient.addColorStop(0.6, '#3d31ff');
                gradient.addColorStop(1.0, '#000');
                ctx.fillStyle = gradient;
                ctx.fillRect( 0, current_pos, this.width, this.bar_height );
                 */

                for ( j = 0; j < this.bar_height - 1; j++ ) {
                    ctx.fillStyle = '#'+ this.pattern[ j ];
                    ctx.fillRect( 0, current_pos + j, this.width, 2 ); // 2 to prevent alpha
                }
            }

            if ( this.tick > 255 ) {
                this.msg_hope.sineScroller({
                    r        : function( i, j ) { return 128 + Math.sin( ( ( i + j ) / 30 ) * Math.PI ) * 128; },
                    g        : function( i, j ) { return 128 + Math.cos( ( ( i + j ) / 30 ) * Math.PI ) * 128; },
                    b        : function( i, j ) { return 0; },
                    y_offset : function( i, j ) { return Math.sin( ( ( i + j ) / 30 ) * Math.PI ) * 256; },
                    width    : this.width
                });
            }
        }

    },
    
    toString : function () {
        return "Rasterbars";
    }
};