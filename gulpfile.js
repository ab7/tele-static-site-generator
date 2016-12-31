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
      };

function getAssetFileNames() {
  var jsManifest = JSON.parse(fs.readFileSync(buildPaths.assets + 'js-manifest.json', 'utf8'));
  var cssManifest = JSON.parse(fs.readFileSync(buildPaths.assets + 'css-manifest.json', 'utf8'));
  return {
    jsFile: 'assets/' + jsManifest['main.js'],
    cssFile: 'assets/' + cssManifest['main.css']
  }
}

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

gulp.task('clean', function () {
  return gulp.src(buildPaths.root, {read: false})
    .pipe(clean());
});

gulp.task('sass', ['clean'], function () {
  var options = {
    outputStyle: 'compressed'
  };
  return gulp.src(srcPaths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass(options).on('error', sass.logError))
    .pipe(rev())
    .pipe(sourcemaps.write('.', {includeContent: true}))
    .pipe(gulp.dest(buildPaths.assets))
    .pipe(rev.manifest('css-manifest.json'))
    .pipe(gulp.dest(buildPaths.assets));;
});

gulp.task('js', ['clean', 'sass'], function () {
  return gulp.src(srcPaths.js)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(sourcemaps.write('.', {includeContent: true}))
    .pipe(gulp.dest(buildPaths.assets))
    .pipe(rev.manifest('js-manifest.json'))
    .pipe(gulp.dest(buildPaths.assets));
});

gulp.task('images', ['clean', 'js'], function () {
  return gulp.src(srcPaths.images +'*.{png,gif,jpg}')
    .pipe(gulp.dest(buildPaths.images));
});

gulp.task('favicon', ['clean'], function () {
  return gulp.src(srcPaths.images + 'favicon.ico')
    .pipe(gulp.dest(buildPaths.root));
});

gulp.task('compile-templates', ['clean', 'images', 'favicon'], function() {
  data = {};
  data.assets = getAssetFileNames();
  data.navLinks = getNavLinks();
  data.posts = getPostData();
  return gulp.src(srcPaths.pages)
    .pipe(nunjucksRender({data: data}))
    .pipe(gulp.dest(buildPaths.root));
});

gulp.task('compile-posts', ['clean', 'images', 'favicon'], function() {
  data = {};
  data.assets = getAssetFileNames();
  data.navLinks = getNavLinks();
  return gulp.src(srcPaths.posts)
    .pipe(markdown())
    .pipe(gap.prependText('{% extends "src/templates/base.html" %}{% block content %}'))
    .pipe(gap.appendText('{% endblock %}'))
    .pipe(nunjucksRender({data: data}))
    .pipe(gulp.dest(buildPaths.root));
});

gulp.task('watch', function() {
  gulp.watch(srcPaths.root + '**/*', ['build']);
});

gulp.task('build', ['compile-templates', 'compile-posts']);
