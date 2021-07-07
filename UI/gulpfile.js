/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

const gulp = require('gulp');
const del = require('del');
const MA_HOME = process.env.MA_HOME;

gulp.task('default', ['build-docs']);

const buildDocs = function() {
    const gulpDocs = require('gulp-ngdocs');

    console.log('Compiling docs into web-src/docs/ngMango');

    const options = {
        title: "Mango UI 3.x Documentation",
        html5Mode: false
    };

    return gulp.src('web-src/ngMango/**/*.js')
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('web-src/docs/ngMango'));
}

gulp.task('build-docs', ['clean-docs'], buildDocs);
gulp.task('build-docs-no-clean', buildDocs);

gulp.task('clean-docs', function() {
    console.log('Cleaning docs');
    
    return del([
        'web-src/docs/**'
    ]);
});
