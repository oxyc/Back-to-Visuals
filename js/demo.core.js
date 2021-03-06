/**
 * BACK TO VISUALS
 *  a javascript demo created by oxy
 *  submitted for the wild demo compo at tlk lan 2010.4
 *
 * @author Oskar Schöldström
 * @version 1.0
 * @license MIT, code only
 *
 * A few methods borrowed from Modernizr and jQuery.
 *
 * A question if someone reads this, should I skip using block comments for methods?
 * Personally I find them quite unnecessary and line consuming but thought it could
 * help people understand the wrapper easier.
 *
 * Hope you had as fun watching the demo as I had making it!
 */

var Demo = (function ( window ) {
    
    var document        = window.document,
        canvas_support  = false,
        webgl_support   = false,
        ready           = false,
        initialized     = false,
        running         = false,
        paused          = false,
        loop_id         = null,         // ID of the interval loop in progress
        tick            = 0,            // Animation cycles already ran
        scenes          = [],           // Defined scenes in chronological order
        playlist        = [],           // Audio tracks
        start,
        end,
        delay,
        setup_fn        = 'onSetup',    // triggered during scene setup
        draw_fn         = 'onDraw',     // triggered during loop setup
        init_fn         = '__init',     // triggered during internal initialization
        output_fn       = '__output',   // the internal animation function
        destruct_fn     = '__destruct', // triggered when the duration has elapsed
        complete_fn     = 'onComplete', // triggered at loop destruction

        sound           = true,         // sound enabled
        logging         = true;         // logging enabled

    /**
     * Internal init function, checks for Canvas, WebGL support and makes the demo ready
     * for running
     * @param {Object} args containing settings, will extend demo, but can't override
     * @returns demo
     */
    function init ( args ) {
        if ( ( canvas_support = canvasSupport() ) ) {
            webgl_support = webglSupport();

            demo.extend( args );
            demo.canvas = new Canvas( demo.canvas,
                    demo.width  || demo.canvas.width,
                    demo.height || demo.canvas.height );

            delay = demo.delay;

            // Listen to window onload and keyboard commands
            addListener( window, "load", onload, true);
            addListener( document, "keyup", keyboard, true );

            initialized = true;
            log("Initialization successful");

            return demo;
        }
        log("Initialization failed");
        return false;
    }

    /**
     * This is the public API object, extendable
     */
    var demo = {
        helper  : {},

        /**
         * Setup the audio settings, this function might be further extended
         * @param list an array of audio objects
         */
        setupAudio : function ( list ) {
            if ( !( playlist = list || null ) ) {
                sound = false;
            }

            sound && playlist.forEach(function( track ) {
                track.setAttribute( "preload", "auto" );
                track.load();
            });
            
            return this;
        },

        /**
         * Setup the scenes and execute existing onSetup functions
         * @param list  an array of scene objects containing respective settings
         */
        setupScenes : function ( list ) {
            var scene, start, end, onsetup, transition, duration,
                    transitions = demo.transitions,
                    offset = 0;

            while ( ( scene = list.shift() ) ) {
                transition = scene.transition;
                start      = offset;
                duration   = scene.duration + ( transition ? transition.duration : 0 );
                end        = ~~( offset + duration / delay );

                scenes.push( demo.extend( new Scene(), scene.effect, {
                    time: {
                        "start"     : start,
                        "end"       : offset = end,
                        "duration"  : duration,
                        "delay"     : delay
                    },
                    outer : {
                        "onDraw"     : scene.onDraw,
                        "onComplete" : scene.onComplete,
                        "transition" : transition
                    }
                } ) );
                    
                if ( isFunction( onsetup = scene[ setup_fn] ) ) {
                    onsetup.call( window );
                }
                log("Scene "+ scene.effect + " added ("+ start +" - "+ end +")");
            }
        },
        
        /**
         * Public init method shadowing the internal one
         * @param args containing setup properties
         */
        init : function ( args ) {
            if ( !initialized ) {
                return init( args );
            } else {
                log("The demo is already initialized");
                
                return this;
            }
        },

        /**
         * Returns the private id of the ongoing loop
         * @returns loop id
         */
        get loop_id() {
            return loop_id;
        },

        /**
         * Tells if the demo is running or not
         * @returns boolean
         */
        get running() {
            return running;
        },

        /**
         * Do we have canvas support
         * @returns boolean
         */
        get canvas_support() {
            return canvas_support;
        },

        /**
         * Do we have WebGL support
         * @returns boolean
         */
        get webgl_support() {
            return webgl_support;
        }
    };

    /**
     * Convert Array like object to a real Array
     * @member demo.helper
     * @param args
     * @return array
     */
    var toArray = demo.helper.toArray = function ( args ) {
        return Array.prototype.slice.call( args );
    };

    /**
     * Check if the passed object is a function or not
     * @member demo.helper
     * @param object
     * @returns boolean
     */
    var isFunction = demo.helper.isFunction = function ( fn ) {
        return ( typeof fn === "function" );
    };

    /**
     * Add an event listener
     * @member demo.helper
     * @param {HTMLElement}     element to attach the event
     * @param {String}          type of event
     * @param {Object Function} fn the callback function
     * @param {Boolean}         capture
     */
    var addListener = demo.helper.addListener = function ( element, type, fn, capture ) {
        if ( document.addEventListener ) {
            element.addEventListener( type,  fn, capture || false );
        } else if ( document.attachEvent ) {
            element.attachEvent( type, fn );
        }
    };

    /**
     * Removes an event listener
     * @member demo.helper
     * @param {HTMLElement}     element attached with event
     * @param {String}          type of event
     * @param {Object Function} fn the callback function
     * @param {Boolean}         capture
     */
    var removeListener = demo.helper.removeListener = function ( element, type, fn, capture ) {
        if ( document.removeEventListener ) {
            element.removeEventListener( type,  fn, capture || false );
        } else if ( document.detachEvent ) {
            element.detachEvent( type, fn );
        }
    };

    /**
     * Extend objects, heavily inspired by the awesome jQuery method,
     * everything is optional, if no parent is available, this will be extended
     * @member demo.helper && demo
     * @param {Boolean} override properties already present
     * @param {Object}  superclass object to be extended
     * @param {Object}  subclass objects listed one by one
     * @returns superclass
     */
    var extend = demo.extend = demo.helper.extend = function () {
        var prop, subclass, object = {},
                superclass = arguments[0],
                length     = arguments.length,
                i          = 1,
                override   = false;

        // Override activate
        if ( typeof superclass === "boolean" ) {
            override   = superclass;
            superclass = arguments[1] || {};
            i++;
        }

        // Extend this, no defined super
        if ( length === i ) {
            superclass = this;
            --i;
        }

        for ( ; i < length; i++ ) {

            // Extend prototype if object is a function
            object = ( isFunction( superclass ) ) ? superclass.prototype : superclass;

            for ( prop in ( subclass = arguments[ i ] ) ) {
                
                if ( object.hasOwnProperty( prop ) && !override ) {
                    log("Can't override property "+ prop +" ["+ object[ prop ] +"="+ subclass[ prop ] +"]");
                    continue;
                }
                object[ prop ] = subclass[ prop ];
            }
        }

        return object;
    };

    /**
     * Clone an object and automatically extend it with objects listed in arguments
     * @member demo.helper && demo
     * @param {Object}  superclass object to clone
     * @param {Object}  objects to extend clone with
     * @returns clone
     */
    var clone = demo.clone = demo.helper.clone = function () {
        var superclass = arguments[ 0 ],
            length = arguments.length,
            i = 1,
            dummy = isFunction( superclass) ? new superclass() : superclass;

        for( ; i < length; i++ ) {
            dummy = demo.extend( true, dummy, arguments[ i ] );
        }
        
        return dummy;
        
    };

/*
 * These are the control flow methods, available in the API
 * - demo.run
 * - demo.kill
 * - demo.play
 * - demo.pause
 * - demo.next
 */
    demo.extend({
        /**
         * Execute the demo if everything is ready
         */
        run : function () {

            // The onload event hasn't fired yet
            if ( !ready ) {
                var scope = demo;

                window.setTimeout( function() {
                    demo.run.call( demo );
                }, 10 );

                return;
            }

            if ( !scenes ) {
                throw "No scenes are set up.";
            }

            running = true;
            start   = +new Date();
            this.audio.play();
            this.play();

            log("Running demo.");
        },

        /**
         * Kill the demo
         */
        kill : function() {
            var duration;

            end      = +new Date();
            duration = ( end - start ) / 1000;

            log("The demo has ended with "+ tick +" ticks in " + duration +" seconds ("+
                ( duration - ( ( tick * this.delay ) / 1000 ) ) +"s delayed)");

            clearLoop();
            this.audio.stopAll();
            removeListener( window, "load", onload, true) ;
            removeListener( document, "keyup", keyboard, true );
            document.body.innerHTML = null;       // empty screen
            running                 = false;      // set as non-running
        },

        /**
         * Initializes a new animation or resumes a current one and sends it to the loop
         * @param resume boolean informing if this is a resume request or not
         */
        play : function( resume ) {
            clearLoop();
            if( !( scene = scenes[0]) ) {
                return this.kill();
            }
            // resume the animation instead of starting a new one
            if ( resume ) {
                return loop( scene.animate );
            }

            return scene.init();
        },

        /**
         * Pause / Resume the demo
         */
        pause : function() {
            if ( !paused ) {
                this.audio.pause();
                paused = true;
                clearLoop();
                log("Pausing demo.");
            } else {
                this.audio.play();
                paused = false;
                this.play( true );
                log("Resuming demo.");
            }
        },

        /**
         * Destroy the current scene and play the one next in line
         * TODO: Push transitions into the scenes variable and trigger them
         * with this function.
         */
        next : function () {
            var expected, scene = scenes.shift(),
                    stamp = (+new Date() - scene.time.stamp );

            if ( isFunction( scene.outer[ complete_fn ] ) ) {
                scene.outer[ complete_fn ]();
            }
            
            log("Scene "+ scene +" took "+ stamp / 1000 +" seconds to render ("+
                    ( stamp - scene.time.duration ) +" ms delayed)");
            demo.play();
        }
    });

/*
 * These are the default transition effects, available in the API, easily extendable
 * from the outside
 * TODO: Core transition functions should be moved to Canvas prototype instead
 * - demo.transitions.fadeTo
 */
    demo.extend({
        transitions : {

            /**
             * Fade scene to assigned color at ending
             * @param {Object} obj 'color' in the form of r,g,b
             *                     'duration' in milliseconds
             */
            fadeTo : function ( obj ) {
                obj.duration = obj.duration || 1000;
                obj.color    = obj.color    || "0,0,0";

                var max    = 1,
                    min    = 0,
                    incr   = max / ( obj.duration / delay ), // ( 1 / ( 1000 / 20 ) )
                    alpha  = min,
                    canvas = demo.canvas;

                // Returns the animation function
                return function () {
                    
                    // Checks to see if complete
                    if ( ( alpha += incr ) >= max ) {
                        return demo.next();
                    }
                    canvas.ctx.fillStyle = "rgba("+ obj.color +", "+ alpha +")";
                    canvas.ctx.fillRect( 0, 0, canvas.width, canvas.height );
                };
            }
        }
    });

/*
 * These are audio controls available in the API
 * - demo.audio.play
 * - demo.audio.pause
 * - demo.audio.stop
 * - demo.audio.stopAll
 * - demo.audio.next
 * - demo.audio.active
 */
    demo.extend({
        audio : {

            /**
             * Play the current track on the playlist
             * @returns boolean
             */
            play : function () {
                if ( !this.active() ) {
                    return false;
                }
                playlist[0].play();

                return true;
            },

            /**
             * Pause current track
             * @returns boolean
             */
            pause : function () {
                if ( !this.active() ) {
                    return false;
                }

                playlist[0].pause();
                return true;
            },

            /**
             * Remove current track by force
             * @param track audio element
             */
            stop : function ( track ) {
                !track.paused && track.pause();
                track.src = "";

                try {
                    track.load(); // fix for firefox 3.x

                } catch(e) {}
            },

            /**
             * Remove all audio elements
             * @returns boolean
             */
            stopAll : function () {
                if ( !this.active() ) {
                    return false;
                }
                playlist.forEach( this.stop );

                return true;
            },

            /**
             * Remove current track and fade into next one
             * @param {Float} duration of fade in ms
             * @returns boolean
             */
            next : function ( duration ) {
                if ( !this.active() ) {
                    return false;
                }

                if ( typeof duration === "number" ) {
                    return this.fade({duration : duration});
                }

                this.stop( playlist[0] );

                return playlist.shift() && this.play();
            },

            /**
             * Audio fader function
             * @param {Object}  duration in ms
             *                  step usually defined internally
             */
            fade : function ( obj ) {
                var that  = this,
                    track = playlist[0];

                obj.step  = obj.step || delay / ( obj.duration || 1 );

                window.setTimeout(function() {

                    if ( track.volume - obj.step >= 0 ) {
                        track.volume -= obj.step;
                        that.fade( obj );
                    } else {
                        that.next( obj );
                    }
                }, this.delay );
            },

            /**
             * Check to see if audio is activated
             * @return success boolean
             */
            active : function() {
                return !!( sound && playlist );
            }
        }
    });

    /**
     * Scene object to inherit from
     * @see demo.setupScene
     * 
     * - Scene.outer.onSetup
     * - Scene.outer.onDraw
     * - Scene.outer.onComplete
     * - Scene.outer.transition.effect
     * - Scene.outer.transition.duration
     * - Scene.outer.transition.color
     * - Scene.init
     * - Scene.animate
     * - Scene.fn
     * - Scene.time.start
     * - Scene.time.end
     * - Scene.time.duration
     * - Scene.canvas
     * - Scene.width
     * - Scene.height
     * - Scene.ascii
     * - Scene.audio
     * - Scene.tick
     * - Scene.__init
     * - Scene.__destruct
     * - Scene.__output
     * - Scene.toString
     */
    var Scene = function () {
        this.canvas = demo.canvas;
        this.height = demo.height;
        this.width  = demo.width;
        this.ascii  = demo.ascii;
        this.audio  = demo.audio;
        this.tick   = 0;
    };

    Scene.prototype = {
        /**
         * Run init function, onDraw function and initialize animation
         */
        init : function () {
            /*
             *scene = scenes[ scenes.length-1 ];
                if( isFunction( scene[ init_fn ] ) ) {
                    console.log("lol");
                    scene[ init_fn ]();
                }
             */
            if( isFunction( this[ init_fn ] ) ) {
                this[ init_fn ]();
            }

            if( isFunction( this.outer[ draw_fn ] ) ) {
                this.outer[ draw_fn ].call( window );
            }
            this.time.stamp = +new Date();
            loop( this.animate );
        },

        /**
         * Animation loop
         */
        animate : function () {
            this[ output_fn ]();    // draw scene
            this.tick++;        // increase scenes tick value
            tick++;             // increase demos total tick value

            if ( this.tick >= ( this.time.end - this.time.start ) ) {
                var transition = this.outer.transition;

                clearLoop();

                if ( isFunction( this[ destruct_fn ] ) ) {
                    this[ destruct_fn ]();
                }
                // Run transition effects for the scene about to end
                if ( transition && demo.transitions.hasOwnProperty( transition.effect ) ) {
                    return loop( demo.transitions[ transition.effect ]( transition ) );
                }
                return demo.next();
            }
        },
        
        /**
         * Attach helper object
         */
        fn : demo.helper
    };

    /**
     * Clear the current loop
     * @private
     */
    function clearLoop() {
        window.clearInterval( loop_id );
    }

    /**
     * Begin a new interval loop and store the id
     * @private
     */
    var loop = function ( fn ) {
        clearLoop();
        loop_id = window.setInterval( function() {
            fn.call( scenes[0] );
        }, demo.delay );
    };

    /**
     * Listener assigned to the window objects onload event,
     * used to make sure the Demo has finished preloading
     * @private
     */
    var onload = function() {
        ready = true;
    };

    /**
     * Listener assigned to keyup event to capture flow control
     * @private
     * @param event automatically passed from window object
     */
    var keyboard = function( event ) {
        switch ( event.keyCode ) {
        case 13 : // enter
            !running && demo.run();
            break;

        case 27 : // esc
            running && demo.kill();
            break;

        case 39 : // right arrow
            //
            // TODO: because of translate skip, hmm dont really know how to fix this properly...
            if ( isFunction( scenes[0][ destruct_fn ] ) ) {
                scenes[0][ destruct_fn ]();
            }
            running && demo.next();
            break;

        case 32 : // space
            running && demo.pause();
            break;
        }
    };


    /**
     * Check for Canvas Support, Modernizr,
     * stores value in demo.canvas_support
     * @private
     * @returns boolean
     */
    function canvasSupport () {
        var element = document.createElement('canvas');
        return !!( element.getContext && element.getContext('2d') );
    }

    /**
     * Check for WebGL Support, Modernizr
     * stores value in demo.webgl_support
     * @returns boolean
     */
    function webglSupport () {
        var element = document.createElement('canvas');

        try {
            if ( element.getContext('webgl') ) {
                return true;
            }
        } catch(e) {}

        try {
            if ( element.getContext('experimental-webgl') ) {
                return true;
            }
        } catch(e) {}

        return false;
    }

    /**
     * Global logging function for more informational messages
     * @member Window
     * @param {String} message
     */
    var log = window.log = function( message ) {
        var tostring = arguments.callee.caller.prototype.toString();

        tostring = ( tostring !== "[object Object]" ) ? " ~ "+ tostring : "";
        logging && window.console && window.console.log( "Demo"+ tostring +": "+ message );
    };

    return demo;
})( window );
