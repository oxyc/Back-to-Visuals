/**
 * I admit, I got so lost trying to get this to work the way I wanted it to,
 * now I'm too tired to figure out how ot zoom it properly - next time.
 */

var Mandelbrot = function () {
};

Mandelbrot.prototype = {

    __init : function () {
        var height, width;

        // Settings
        this.chars          = " .,:+ccbbxxXXÖ#;,.";
        this.black_hole     = " ";
        this.font_size      = 8;
        this.max_iterations = 20;
        height              = this.height /= this.font_size;
        width               = this.width  /= this.font_size;

        this.real = {
            min   : -30,
            max   : -10,
            factor: function() {
                return ( this.max - this.min ) / ( width -1 );
            }
        };
        this.imag = { 
            min   : -2.8,
            max   : ( -2.8 + ( 14 ) * this.height / this.width ),
            factor : function() {
                return ( this.max - this.min ) / ( height -1 );
            }
        };
        this.ascii.style.fontSize = this.font_size +"px";

        // Timers and placeholders

    },
    __output : function () {
        var coord_imag, coord_real, complex_imag, complex_real, exists,
                complex_real2, complex_imag2, real_factor, imag_factor, x, y, n,
                output = "";
            
        this.real.min =  this.real.min * 0.990 + ( ( 1 + Math.sin(this.tick * 0.001 ) ) * 0.01 ); //= -3,
        this.real.max = -this.real.min + this.tick * 0.001; //0.007; //= 2,

        //this.imag.min = -this.real.max * ( Math.sin( this.tick * 0.01 ) ); //0.007; //= -1.4,
        this.imag.min = -this.real.max * ( Math.sin( this.tick * 0.01 ) ) - 0.7;
        this.imag.max =  this.imag.min + ( this.real.max - this.real.min ) * this.height / this.width; // 1.2
        
        real_factor   = this.real.factor();
        imag_factor   = this.imag.factor();

        for ( y = 0; y < this.height; y++ ) {
            coord_imag = this.imag.max - ( y * imag_factor );

            for ( x = 0; x < this.width; x++ ) {
                coord_real = this.real.min + ( x * real_factor );

                // Calculate whether the coordinate belongs to the Mandelbrot set

                complex_real = coord_real;
                complex_imag = coord_imag; // Set Z = c
                exists       = true;

                // Looks whether Z is greater than 2.
                for ( n = 0; n <= this.max_iterations; n++ ) {

                    complex_real2 = complex_real * complex_real;
                    complex_imag2 = complex_imag * complex_imag;

                    // Math.sqrt( complex_real * complex_real + complex_imag * complex_imag ) > 2;
                    if ( complex_real2 + complex_imag2 > 4 ) {

                        // Does not belong to set
                        exists = false;
                        break;
                    }

                    // ( a + bi )² = a² - b² + 2abi
                    // real : a² - b² && imag : 2abi
                    complex_imag = 2 * complex_real  * complex_imag  + coord_imag;
                    complex_real =     complex_real2 - complex_imag2 + coord_real;

                }

                if ( exists ) {
                    output += this.black_hole;
                } else {
                    output += this.chars.charAt( ~~( n * ( this.chars.length / this.max_iterations ) ) );
                }

            }
            output +="\n";
        }
        this.ascii.innerHTML = output;
    },
    toString : function () {
        return "Mandelbrot";
    }
};