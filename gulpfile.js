const gulp = require('gulp'),
      clean = require('gulp-clean'),
      sass = require('gulp-sass'),
      rev = require('gulp-rev'),
      nunjucksRender = require('gulp-nunjucks-render'),
      markdown = require('gulp-markdown'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      browserSync = require('browser-sync').create(),
      fs = require('fs'),
      srcPaths  = {
        'templates': 'src/templates/**/*.html',
        'pages': 'src/pages/**/*.html',
        'posts': 'src/posts/**/*.md',
        'assets': 'src/assets/',
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
    .pipe(gulp.dest(buildPaths.assets))
    .pipe(rev.manifest('css-manifest.json'))
    .pipe(gulp.dest(buildPaths.assets));;
});

gulp.task('js', ['clean', 'sass'], function () {
  return gulp.src(srcPaths.js)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(buildPaths.assets))
    .pipe(rev.manifest('js-manifest.json'))
    .pipe(gulp.dest(buildPaths.assets));
});

gulp.task('compile-templates', ['clean', 'js'], function() {
  jsManifest = JSON.parse(fs.readFileSync(buildPaths.assets + 'js-manifest.json', 'utf8'));
  cssManifest = JSON.parse(fs.readFileSync(buildPaths.assets + 'css-manifest.json', 'utf8'));
  data = {
    jsFile: 'assets/' + jsManifest['main.js'],
    cssFile: 'assets/' + cssManifest['main.css']
  }
  return gulp.src(srcPaths.pages)
    .pipe(nunjucksRender({data: data}))
    .pipe(gulp.dest(buildPaths.root));
});

gulp.task('default', ['compile-templates']);
