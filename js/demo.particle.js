/**
 * Particle objects used in starfield
 * this.speed.x
 * this.speed.y
 * this.speed.z
 * this.size
 * this.depth
 * this.boundries.x.min
 * this.boundries.x.max
 * this.boundries.y.min
 * this.boundries.y.max
 */

/**
 * Create a new particle with defined properties
 * @param {Object} properties
 */
var Particle = function ( properties ) {
    this.prop = properties;
    this.create();
};

Particle.prototype = {

    /**
     * Move the particle according to speed properties
     * @returns object containing particle x, y and size property
     */
    move : function () {

        /**
         * Make a projection
         * @private
         * @param x
         * @param y
         * @param z
         * @returns 2d coordinate object
         */
        function projection( x, y, z ) {
            return {
                x: x / z,
                y: y / z
            };
        }

        this.x         += this.prop.speed.x;
        this.y         += this.prop.speed.y;
        this.z         += this.prop.speed.z;
        this.projection = projection( this.x, this.y, this.z );

        // reset particle if it's outside of boundries
        if (    this.projection.x > this.prop.boundries.x.max ||
                this.projection.x < this.prop.boundries.x.min ||
                this.projection.y > this.prop.boundries.y.max ||
                this.projection.y < this.prop.boundries.y.min || this.z < 0 ) {
            this.create();
        }

        //size = Math.min( this.prop.size / this.z, this.prop.size );

        return {
            x    : this.projection.x,
            y    : this.projection.y,
            size : Math.min( this.prop.size / this.z, this.prop.size )
        };
    },

    /**
     * Create a new particle with random properties
     */
    create : function () {
        this.x = this.random( this.prop.boundries.x.min, this.prop.boundries.x.max );
        this.y = this.random( this.prop.boundries.y.min, this.prop.boundries.y.max );
        this.z = this.random( 0, this.prop.depth );
    },
    
    /**
     * Randomize within range
     * @param min
     * @param max
     * @returns value
     */
    random : function ( min, max ) {
        // [1,6] : 1 + 1 * ( 6 - 1 ) = 6; 1 + 0 * ( 6 - 1 ) = 1
        return min + Math.floor( Math.random() * (max - min ) );
    }
};