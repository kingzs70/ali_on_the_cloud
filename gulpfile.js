require('colors');
var through = require('through2');
var del = require('del');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');
var less = require('gulp-less');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');

var STATIC_HOST = 'http://ali001.b0.upaiyun.com/';

var isBuild = true;

function err(error) {
    console.error('[ERROR]'.red + error.message);
    this.emit('end');
}

function statichost() {
    function replace(file, encoding, cb) {
        file.contents = new Buffer(file.contents.toString()
                .replace(/src=['"](?!http)\/?([^'^"]+)['"]/g, 'src="'+STATIC_HOST +'$1"')
                .replace(/href=['"](?!http)\/?([^'^"]+)['"]/g, 'href="'+STATIC_HOST +'$1"'));
        return cb(null, file);
    }
    return through.obj(replace);
}


gulp.task('clean', function (cb) {
    isBuild ? del(['build'], cb) : cb();
});

var ifless = function (file) {
    var extname = path.extname(file.path);
    return extname === '.less' ? true : false;
};

gulp.task('css', ['clean'], function () {
    return gulp.src(['src/**/*.css', 'src/**/*.less'])
        .pipe(sourcemaps.init())
        .pipe(gulpif(ifless, less()))
        .pipe(gulpif(isBuild, minifyCss()))
        .pipe(gulpif(isBuild, concatCss('css/all.min.css')))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build'));
});


gulp.task('js', ['clean'], function () {
    return gulp.src(['src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('js/all.min.js'))
        .pipe(gulp.dest('build'));
});

gulp.task("html", ["clean"], function() {
    return gulp.src(["src/**/*.html"])
        .pipe(statichost())
        .pipe(gulp.dest("build"));
});

gulp.task("copy", ["clean"], function () {
    return gulp.src(["src/**/*.png", "src/**/*.jpg", "src/**/*.jpeg", "src/**/*.gif", "src/**/*.mp3", "src/**/*ogg",
      "src/**/*.ttf", "src/**/*.eot", "src/**/*.svg", "src/**/*.less", "src/**/*.otf"])
        .pipe(gulp.dest("build"));
});


gulp.task('default', ['clean', 'html', 'css', 'js', 'copy']);

gulp.task("watch", ["default"], function () {
    isBuild = false;
    gulp.watch(['src/**/*.js'], ["js"]);
    gulp.watch(['src/**/*.css', 'src/**/*.less'], ["css"]);
});

