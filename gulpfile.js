/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
  concat = require('gulp-concat'),
  cleanCSS = require('gulp-clean-css'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  stripDebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify');
  sass = require('gulp-sass');

// create a default task and just log a message
gulp.task('default', ['uglify-js', 'minify-css', 'minify-html', 'optimize-images', 'remove-logs' ]);


// Concatenate & Minify JS
gulp.task('uglify-js', function() {
    return gulp.src(['angular-inventory/**/*.js', '!angular-inventory/app.js', '!angular-inventory/libs/**/*'])

        .pipe(uglify().on('error', function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(function(file) {
   return file.base;
 }));

});


gulp.task('minify-css', function() {
  	return gulp.src(['angular-inventory/**/*.css', '!angular-inventory/css/style.css'])
     .pipe(cleanCSS({compatibility: 'ie8'}))
     .pipe(gulp.dest(function(file) {
    return file.base;
  }));
});

gulp.task('styleSass', function() {
    gulp.src('angular-inventory/css/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(function(file){
            return file.base;
        }));
});

gulp.task('minify-html', function() {
  	return gulp.src('angular-inventory/**/*.html')
     .pipe(htmlmin({collapseWhitespace: true}))
     .pipe(gulp.dest(function(file) {
    return file.base;
  }));
});

// gulp.task('minify', function() {
//   return gulp.src('angular-inventory/**/*.html')
//     .pipe(htmlmin({collapseWhitespace: true}))
//     .pipe(gulp.dest('dist'));
// });


gulp.task('optimize-images', function() {
  	return gulp.src(['angular-inventory/**/*.+(png|jpg|jpeg|gif|svg)', '!angular-inventory/libs/**/*'])
     .pipe(imagemin().on('error', function(e){
            console.log(e);
         }))

     .pipe(gulp.dest(function(file) {
    return file.base;
  }));
});


//Strip console, alert, and debugger statements from JavaScript code with strip-debug
gulp.task('remove-logs', function () {
    return gulp.src(['angular-inventory/**/*.js', '!angular-inventory/libs/**/*'])
         .pipe(stripDebug().on('error', function(e){
            console.log(e);
         }))
         .pipe(gulp.dest(function(file) {
        return file.base;
  }));
});
