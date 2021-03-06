var less = require('gulp-less');
var gulp = require('gulp');
var gutil = require('gulp-util');
var webserver = require('gulp-webserver');

gulp.task('compileLess', function () {

    return gulp.src('./less/*.less')
        .pipe(less())
        .on('end', function(){
            gutil.log("compilation done");
        })
        .pipe(gulp.dest('./css'));

});

gulp.task('watch', function () {
    gulp.watch('./less/*.less', ['compileLess']);
});



gulp.task('webserver', function() {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});