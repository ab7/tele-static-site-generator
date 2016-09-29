const gulp = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const rev = require('gulp-rev');
const nunjucksRender = require('gulp-nunjucks-render');
const markdown = require('gulp-markdown');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const browserSync = require('browser-sync').create();


// Directory names
const srcRoot = 'src/';
const distRoot = 'dist/';
const assetsDir = 'assets/';
const stylesDir = 'scss/';
const jsDir = 'js/';
const templatesDir = 'templates/';
const pagesDir = 'pages/';

// Paths
const srcAssestsPath = srcRoot + assetsDir;
const srcStylesPath = srcAssestsPath + stylesDir;
const srcJsPath = srcAssestsPath + jsDir;
const distAssetsPath = distRoot + assetsDir;
const templatesPath = srcRoot + templatesDir;
const pagesPath = srcRoot + pagesDir;


gulp.task('clean', function () {
  return gulp.src(distRoot + '*', {read: false})
    .pipe(clean());
});

gulp.task('sass', ['clean'], function () {
  var options = {
    outputStyle: 'compressed'
  };
  return gulp.src(srcStylesPath + 'main.scss')
    .pipe(sass(options).on('error', sass.logError))
    .pipe(rev())
    .pipe(gulp.dest(distAssetsPath));
});

gulp.task('js', function () {
  return gulp.src(srcJsPath + '**/*.js')
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(distAssetsPath));
});

gulp.task('compile-templates', ['clean'], function() {
  return gulp.src(pagesPath + '*.html')
    .pipe(nunjucksRender())
    .pipe(gulp.dest(distRoot))
});

gulp.task('default', ['compile-templates', 'sass', 'js']);
