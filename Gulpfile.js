var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', function() {
    gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/css/'));

    gulp.src('./src/index.html')
        .pipe(gulp.dest('./public/'));
    
    gulp.src('./src/js/*.js')
        .pipe(gulp.dest('./public/js/'));
});