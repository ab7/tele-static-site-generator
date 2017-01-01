const gulp = require('gulp'),
      clean = require('gulp-clean'),
      sass = require('gulp-sass'),
      rev = require('gulp-rev'),
      nunjucksRender = require('gulp-nunjucks-render'),
      markdown = require('gulp-markdown'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      browserSync = require('browser-sync').create(),
      sourcemaps = require('gulp-sourcemaps'),
      fs = require('fs'),
      gap = require('gulp-append-prepend'),
      htmlmin = require('gulp-htmlmin'),
      srcPaths  = {
        'root': 'src/',
        'templates': 'src/templates/**/*.html',
        'pagesDir': 'src/pages/',
        'pages': 'src/pages/**/*.html',
        'postsDir': 'src/posts/',
        'posts': 'src/posts/**/*.md',
        'assets': 'src/assets/',
        'sass': 'src/assets/scss/**/*.scss',
        'js': 'src/assets/js/**/*.js',
        'images': 'src/assets/images/'
      },
      buildPaths = {
        'root': 'build/',
        'assets': 'build/assets/',
        'images': 'build/assets/images/'
      },
      distPaths = {
        'root': 'dist/',
        'assets': 'dist/assets/',
        'images': 'dist/assets/images'
      };

//
// Post functions
// -------------------------------------------------------------

function getPostData() {
  var postData = [];

  fs.readdir(srcPaths.postsDir , function(err, files) {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    files.forEach(function(file, index) {
      fs.readFile(srcPaths.postsDir + file, 'utf-8', function (err, content) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        var postText = content.substring(content.lastIndexOf('<!--//') + 1, content.lastIndexOf('//-->'));
        var lines = postText.split('\n');
        var postObj = {};
        for (var i = 0; i < lines.length; i++) {
          if (lines[i]) {
            var data = lines[i].split(':');
            postObj[data[0]] = data[1];
          }
        }
        filename = file.split('.')[0];
        postObj.slug = filename + '.html';
        postData.push(postObj);
      });
    });
  });

  return postData;
}

function getNavLinks() {
  var navLinks = [];

  fs.readdir(srcPaths.pagesDir , function(err, files) {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    files.forEach(function(file, index) {
      navObj = {};

      if (file === 'index.html') {
        navLinks.push({title: 'Home', link: file});
        return;
      }

      navObj.title = toTitleCase(file.split('.')[0]);
      navObj.link = file;

      navLinks.push(navObj);
    });
  });

  return navLinks;
}

function toTitleCase(str) {
  // per http://stackoverflow.com/a/196991
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

//
// Build tasks
// -------------------------------------------------------------

gulp.task('build-clean', function () {
  return gulp.src(buildPaths.root + '*', {read: false})
    .pipe(clean());
});

gulp.task('build-sass', ['build-clean'], function () {
  var options = {
    outputStyle: 'compressed'
  };
  return gulp.src(srcPaths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass(options).on('error', sass.logError))
    .pipe(sourcemaps.write('.', {includeContent: true}))
    .pipe(gulp.dest(buildPaths.assets))
});

gulp.task('build-js', ['build-clean', 'build-sass'], function () {
  return gulp.src(srcPaths.js)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.', {includeContent: true}))
    .pipe(gulp.dest(buildPaths.assets))
});

gulp.task('build-images', ['build-clean', 'build-js'], function () {
  return gulp.src(srcPaths.images +'*.{png,gif,jpg}')
    .pipe(gulp.dest(buildPaths.images));
});

gulp.task('build-favicon', ['build-clean'], function () {
  return gulp.src(srcPaths.images + 'favicon.ico')
    .pipe(gulp.dest(buildPaths.root));
});

gulp.task('build-templates', ['build-clean', 'build-images', 'build-favicon'], function() {
  var data = {};
  data.navLinks = getNavLinks();
  data.posts = getPostData();
  return gulp.src(srcPaths.pages)
    .pipe(nunjucksRender({data: data}))
    .pipe(gulp.dest(buildPaths.root));
});

gulp.task('build-posts', ['build-clean', 'build-images', 'build-favicon'], function() {
  var data = {};
  data.navLinks = getNavLinks();
  return gulp.src(srcPaths.posts)
    .pipe(markdown())
    .pipe(gap.prependText('{% extends "src/templates/base.html" %}{% block content %}'))
    .pipe(gap.appendText('{% endblock %}'))
    .pipe(nunjucksRender({data: data}))
    .pipe(gulp.dest(buildPaths.root));
});

//
// Dist tasks
// -------------------------------------------------------------

gulp.task('dist-clean', function () {
  return gulp.src(distPaths.root + '*', {read: false})
    .pipe(clean());
});

gulp.task('dist-css', ['dist-clean'], function() {
  return gulp.src(buildPaths.assets + '**/*.css')
    .pipe(rev())
    .pipe(gulp.dest(distPaths.assets));
});

gulp.task('dist-js', ['dist-clean'], function() {
  return gulp.src(buildPaths.assets + '**/*.js')
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(distPaths.assets));
});

gulp.task('dist-images', ['dist-clean', 'dist-js'], function () {
  return gulp.src(buildPaths.images +'*.{png,gif,jpg}')
    .pipe(gulp.dest(distPaths.images));
});

gulp.task('dist-favicon', ['dist-clean'], function () {
  return gulp.src(buildPaths.root + 'favicon.ico')
    .pipe(gulp.dest(distPaths.root));
});

gulp.task('dist-html', ['dist-clean', 'dist-css', 'dist-js'], function() {
  var options = {
    collapseWhitespace: true,
    removeComments: true
  }
  return gulp.src(buildPaths.root + '*.html')
    .pipe(htmlmin(options))
    .pipe(gulp.dest(distPaths.root));
});

//
// Main tasks
// -------------------------------------------------------------

gulp.task('watch', function() {
  gulp.watch(srcPaths.root + '**/*', ['build']);
});

gulp.task('build', ['build-templates', 'build-posts']);

gulp.task('dist', ['dist-html', 'dist-favicon', 'dist-images']);
