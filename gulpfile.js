'use strict';

var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
    compass = require( 'gulp-compass' ),
    plumber = require( 'gulp-plumber' ),
	watchify = require('watchify'),
	source = require('vinyl-source-stream'),
	browserify = require('browserify'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	babelify = require('babelify'),
	buffer = require('vinyl-buffer'),
	jshint = require('gulp-jshint');

gulp.task( 'sass', function( done ) {
	gulp.src( './src/*.scss' )
		.pipe( plumber( {
			errorHandler: function ( error ) {
				console.log( error.message );
				this.emit( 'end' );
			}
		} ) )
    	.pipe( compass( {
    		css: './dist',
    		sass: './src',
    		style: 'nested'
    	} ) )
    	.on( 'error', function( error ) {
      		console.log( error.message ); 
    	} )
    	.pipe( gulp.dest( './dist' ) )
    	.on('end', function () { done(); });
});

gulp.task('prod', ['sass'], function(){

	var b = browserify({
		entries: ['./src/index.js'],
		debug: true
	});

	b.transform("babelify", {presets: ["es2015"]});

	b.bundle()
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(rename('main.js'))
		.pipe(gulp.dest('./dist/'));		
});
gulp.task('build', ['sass'], function(){
	
	var b = browserify({
		entries: ['./src/index.js'],
		debug: true
	});

	b.bundle()
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write())
		.pipe(rename('main.js'))
		.pipe(gulp.dest('./dist/'));		
});

gulp.task('watch', function(){
	var props = {
	        entries: ['./src/index.js'],
	        debug: true,
	        cache: {},
	        packageCache: {},
	    };
		
	var bundler = watchify(browserify(props));
	
	function rebundle() {
    	
    	var stream = bundler.bundle();
    	return stream.on('error', function(error){
    		console.log(error);
    	}).pipe(source('index.js')).pipe(rename('main.js')).pipe(gulp.dest('./dist/'));
	}

	bundler.on('update', function() {
		return rebundle();
	});

  return rebundle();
});

gulp.task( 'lint', function() {
	return gulp.src( './src/**/*.js' )
	   .pipe( jshint() )
	   .pipe( jshint.reporter( 'default' ) );
});