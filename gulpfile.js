const gulp = require('gulp'),
      clean = require('gulp-clean'),
      sass = require('gulp-sass'),
      rev = require('gulp-rev'),
      nunjucksRender = require('gulp-nunjucks-render'),
      markdown = require('gulp-markdown'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      browserSync = require('browser-sync').create(),
      srcPaths  = {
        'templates': 'src/templates/**/*.html',
        'pages': 'src/pages/**/*.html',
        'posts': 'src/posts/**/*.md',
        'sass': 'src/assets/scss/**/*.scss',
        'js': 'src/assets/js/**/*.js'
      },
      buildPaths = {
        'root': 'build/',
        'assets': 'build/assets/'
      };

gulp.task('clean', function () {
  return gulp.src(buildPaths.root, {read: false})
    .pipe(clean());
});

gulp.task('sass', ['clean'], function () {
  var options = {
    outputStyle: 'compressed'
  };
  return gulp.src(srcPaths.sass)
    .pipe(sass(options).on('error', sass.logError))
    .pipe(rev())
    .pipe(gulp.dest(buildPaths.assets));
});

gulp.task('js', ['clean'], function () {
  return gulp.src(srcPaths.js)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(buildPaths.assets));
});

gulp.task('compile-templates', ['clean'], function() {
  return gulp.src(srcPaths.pages)
    .pipe(nunjucksRender())
    .pipe(gulp.dest(buildPaths.root))
});

gulp.task('default', ['compile-templates', 'sass', 'js']);
