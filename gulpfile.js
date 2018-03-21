"use strict";

const gulp                  = require('gulp'),
    concat                  = require('gulp-concat'),
    uglify                  = require('gulp-uglify'),
  imagemin                  = require('gulp-imagemin'),
    rename                  = require('gulp-rename'),
     babel                  = require('gulp-babel'),
      sass                  = require('gulp-sass'),
    cssmin                  = require('gulp-cssmin'),
      maps                  = require('gulp-sourcemaps'),
       del                  = require('del');

const jsMain = [
    'src/js/base/function.js',
    'src/js/partials/nav.js',
    'src/js/partials/annotation.js',
    'src/js/components/format-conversions.js',
    'src/js/user/add-product.js',
    'src/js/user/delete-product.js'];

gulp.task("jsMain", () => {
    return gulp.src(jsMain)
        .pipe(concat('index.min.js'))
        .pipe(maps.init({ loadMaps: true }))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(maps.write('.'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task("jsMainMin", () => {
    return gulp.src(jsMain)
        .pipe(concat('index.min.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task("jsCheckoutMin", () => {
    return gulp.src('src/js/layout/checkout.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(rename('checkout.min.js'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task("jsCreateProfileMin", () => {
    return gulp.src('src/js/layout/create-profile.js')
        // .pipe(babel({
        //     presets: ['env']
        // }))
        // .pipe(uglify())
        .pipe(rename('create-profile.min.js'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task("jsProductMin", () => {
    return gulp.src('src/js/layout/product.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(rename('product.min.js'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('sassMain', () => {
    return gulp.src('src/styles/application.scss')
        .pipe(maps.init({ loadMaps: true }))
        .pipe(maps.identityMap())
        .pipe(sass())
        .pipe(maps.write('.'))
        .pipe(rename('application.min.css'))
        .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('sassMainMin', () => {
    return gulp.src('src/styles/application.scss')
        .pipe(sass())
        .pipe(cssmin())
        .pipe(rename('index.min.css'))
        .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('readmeImages', () => {
    gulp.src(['src/readme/img/*.*'])
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('doc/images'));
});

gulp.task('imageMin', () => {
    gulp.src(['src/img/*.*'])
            .pipe(imagemin({optimizationLevel: 5}))
            .pipe(gulp.dest('public/img'));
});

gulp.task('watchLists', () => {
    gulp.watch('src/styles/**/*.scss', ['sassMain']);
    gulp.watch(jsMain, ['jsMain']);
    gulp.watch('src/js/layout/checkout.js', ['jsCheckoutMin']);
    gulp.watch('src/js/layout/create-profile.js', ['jsCreateProfileMin']);
    gulp.watch('src/js/layout/product.js', ['jsProductMin']);
    gulp.watch('src/img/*.*', ['imageMin']);
    gulp.watch('src/readme/img/*.*', ['readmeImages']);
});

gulp.task('clean', () => {
    del(['map', 'public/img/**', 'public/javascripts/**', 
        'public/stylesheets/**', 'doc/images']);
});

gulp.task('default', ['watchLists']);

gulp.task('development', ['clean', 'sassMain', 'jsMain', 'jsCreateProfileMin', 
    'jsCheckoutMin', 'jsProductMin', 'imageMin', 'readmeImages']);

gulp.task('build', ['clean', 'sassMainMin', 'jsMainMin', 'jsCreateProfileMin',
    'jsCheckoutMin', 'jsProductMin', 'imageMin', 'readmeImages']);

