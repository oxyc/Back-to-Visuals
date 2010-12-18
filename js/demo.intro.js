/**
 * Intro scene with sliding image of Beauty ( http://www.sxc.hu/photo/1101935 )
 * This entire scene need to be remade... That's what happens with your first scene
 */

var Intro = function () {
    this.img = new Image();
    this.img.src = "images/bw_girl.png";

    this.pattern_img = new Image();
    this.pattern_img.src = "images/pattern.png";
};

Intro.prototype = {

    __init : function () {
        var tctx, i,
                ctx      = this.canvas.ctx,
                fn       = this.fn,
                text_obj = {
                    size   : 0,
                    family : "PetMe128Medium",
                    style  : ctx.createPattern( this.pattern_img, 'repeat' )
                };
            
        // Settings
        this.speed           = 45;
        this.line_num        = 20;

        this.line_width      = ~~( this.width / this.line_num );
        this.line_rendered   = null;
        this.line_array      = [];
        this.line_current    = this.line_num;
        this.cursor_rendered = this.width - this.line_width;
        this.cursor          = -this.line_width;
        this.font_size       = 0;
        this.image_pos       = {x : this.width - this.img.width, y : 0};

        // Temporary storage canvas to extract data
        tctx            = new Canvas().setSize(this.width, this.height).ctx;
        tctx.fillStyle  = "#fff";
        tctx.fillRect( 0, 0, this.width, this.height );
        tctx.drawImage( this.img, this.image_pos.x, this.image_pos.y );

        // Timers / placeholders
        this.phase = 1;
        
        // Extract lines of pixels from the temporary canvas
        for ( i = this.line_num; i > 0; i--) {
            try { // ff
                this.line_array.push(
                    tctx.getImageData( ( i - 1 ) * this.line_width, 0, this.line_width, this.height )
                );  
            } catch ( e ) {
                throw new Error("Can't access image object, probably because domain difference between image and js.");
            }
        }
        
        // Messages
        this.msg_welcome = new Text( fn.extend( true, text_obj, {text : "WELCOME"} ), ctx );
        this.msg_year    = new Text( fn.extend( true, text_obj, {text : "2010.4" } ), ctx );
        this.msg_tlk     = new Text( fn.extend( true, text_obj, {
            text   : "TLK LAN",
            shadow : {
                x     : -7,
                y     : 7,
                color : "#000"
        }} ), ctx );

    },
    
    __output : function () {
        this.canvas.ctx.clearRect( 0, 0, this.width, this.height );

        // Render lines already moved
        this.line_rendered && this.canvas.ctx.putImageData( this.line_rendered, 0, 0 );

        // Yes this is stupid but I'm lazy and at least it's more readable than
        // a massive if statement...
        switch( this.phase ) {
        case 1: // Slide in image slices
            this.phase_one();

            if ( !this.line_array.length ) {
                this.phase = 2;
            }
            break;

        case 2: // Fly in welcome message
            this.phase_two();

            if( this.tick > 490 ) {
                this.phase = 3;
                this.font_size = 0;
            }
            break;

        case 3: // Fly in information message
            this.phase_three();
            break;
        }
    },
    
    phase_one : function () {
        
        try { // ff
            this.canvas.ctx.putImageData( this.line_array[0], this.cursor, 0 );
        } catch ( e ) {}

        // Line needs to be moved
        if ( this.cursor < this.cursor_rendered ) {

            // Make sure the last line is rendered fully
            if ( this.cursor < this.cursor_rendered - this.speed ) {
                this.cursor += this.speed;
            } else {
                this.cursor += this.cursor_rendered - this.cursor;
            }
            
        // Line is in proper place
        } else {

            // Fill gap
            if ( this.line_array.length === 1 && this.cursor > 0 ) {
                this.canvas.ctx.fillStyle = "#fff";
                this.canvas.ctx.fillRect( 0, 0, this.cursor, this.height );
            }

            this.line_rendered    = this.canvas.ctx.getImageData( 0, 0, this.width, this.height );
            this.cursor_rendered -= this.line_width;
            this.line_array.shift();
            this.cursor           = -this.line_width;
        }
        
        return true;
    },

    phase_two : function () {
        var textmovement = Math.sin( this.tick / 15 ) * 200,
            offset       = 200;

        // Grow fonts
        if ( this.font_size < 200 ) {
            this.font_size += 2;
        }
        
        this.msg_welcome.set({
            size : this.font_size,
            x    : offset + textmovement,
            y    : offset - textmovement
        });
    },

    phase_three : function () {
        var textmovement = Math.sin( this.tick / 15 ) * 200;

        if ( this.font_size < 150 ) {
            this.font_size++;
        }

        this.msg_tlk.set({
            size   : this.font_size,
            x      : 200 + textmovement - 7,
            y      : 307,
            scolor : "#000"
        });

        this.msg_year.set({
            size   : this.font_size * 0.9,
            x      : 200 - textmovement,
            y      : 500
        });
    },

    toString : function () {
        return "Init effect";
    }
};