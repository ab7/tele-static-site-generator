const gulp = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const rev = require('gulp-rev');
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


gulp.task('clean', function () {
    return gulp.src(distRoot, {read: false})
        .pipe(clean());
});

gulp.task('sass', function () {
  var options = {
    outputStyle: 'compressed'
  };
  return gulp.src(srcStylesPath + 'main.scss')
    .pipe(sass(options).on('error', sass.logError))
    .pipe(rev())
    .pipe(gulp.dest(distAssetsPath));
});

gulp.task('default', ['clean', 'sass']);
