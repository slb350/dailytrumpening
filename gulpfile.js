var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-minify-css');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var rev = require('gulp-rev');

gulp.task('styles', function () {
    gulp.src('./assets/stylesheets/sass/index.scss')
    .pipe(sass())
    .pipe(cssmin())
    .pipe(gulp.dest('./assets/stylesheets/'));
});

gulp.task('scripts', function() {
    gulp.src(['./assets/js/src/*.js'])
        .pipe(sourcemaps.init('.'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/js'));
})

gulp.task('default', function() {
    gulp.run('styles', 'scripts');
})

gulp.task('watch', function(){
    gulp.watch(['assets/js/src/**/*.js', 'assets/stylesheets/sass/**/*.scss'], ['default']);
})
