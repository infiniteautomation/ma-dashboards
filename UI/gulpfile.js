/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const gulp = require('gulp');
const del = require('del');
const MA_HOME = process.env.MA_HOME;

gulp.task('default', ['clean-and-build-docs']);

gulp.task('clean-and-build-docs', ['clean-docs', 'build-docs']);

gulp.task('build-docs', [], function() {
    const gulpDocs = require('gulp-ngdocs');

    console.log('Compiling docs into web-src/docs/ngMango');

    const options = {
        title: "Mango UI 3.x Documentation",
        html5Mode: false
    };

    return gulp.src('web-src/ngMango/**/*.js')
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('web-src/docs/ngMango'));
});

gulp.task('clean-docs', function() {
    console.log('Cleaning docs');
    
    return del([
        'web-src/docs/**'
    ]);
});
