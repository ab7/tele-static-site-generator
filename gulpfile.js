const gulp = require('gulp');
const sass = require('gulp-sass');
const nunjucks = require('gulp-nunjucks');
const markdown = require('gulp-markdown');
const browserSync = require('browser-sync').create();

// Directory names
const srcRoot = 'src/';
const distRoot = 'dist/';
const assetsDir = 'assets/';
const stylesDir = 'scss/';

// Paths
const srcAssestsPath = srcRoot + assetsDir;
const srcStylesPath = srcAssestsPath + stylesDir;
const distAssetsPath = distRoot + assetsDir;


gulp.task('sass', function () {
  var options = {
    outputStyle: 'compressed'
  };
  return gulp.src(srcStylesPath + 'main.scss')
    .pipe(sass(options).on('error', sass.logError))
    .pipe(gulp.dest(distAssetsPath));
});

gulp.task('default', ['sass']);
