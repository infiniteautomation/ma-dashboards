var gulp = require('gulp');
var exists = require('path-exists').sync;
var gulpIgnore = require('gulp-ignore');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var watch = require('gulp-watch');
var MA_HOME = process.env.MA_HOME;

var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
    replaceString: /\bgulp[\-.]/
});

var paths = {
    dest: 'web/vendor'
};

gulp.task('default', function() {
    var mainFiles = plugins.mainBowerFiles().map(function(path, index, arr) {
        var newPath = path.replace(/.([^.]+)$/g, '.min.$1');
        return exists(newPath) ? newPath : path;
    });

    return gulp.src(mainFiles, {
            base: 'bower_components'
        })
        .pipe(plugins.rename(function(path) {
            path.dirname = path.dirname.replace(/dist(?:\\|\/)globalize$/g, 'globalize');
            path.dirname = path.dirname.replace(/dist(?:\\|\/)cldr$/g, 'cldr');
            path.dirname = path.dirname.replace(/^ace-builds(\\|\/)src-min-noconflict/g, 'ace');
            path.dirname = path.dirname.replace(/(\\|\/)(min|dist|build|builds|lib|release|build(\\|\/)scripts)$/g, '');
            path.basename = path.basename.replace(/\.min$/g, '');
        }))
        //.pipe(plugins.filter('**/*.js'))
        //.pipe(plugins.uglify())
        .pipe(gulp.dest(paths.dest));
});

gulp.task('clean', function() {
    return gulp.src(paths.dest, {
            read: false
        })
        .pipe(plugins.clean());
});


gulp.task('build-ngdocs', [], function() {
    var gulpDocs = require('gulp-ngdocs');

    console.log('Compiling Docs');

    var options = {
        title: "Mango UI 3.x Documentation",
        html5Mode: false
    };
    
    return gulp.src('web/ngMango-3.2/**/*.js')
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('docs/ngMango-3.2'));
});

gulp.task('copy-docs', ['build-ngdocs'], function() {

    console.log('Copying Doc Partials');
    
    return gulp.src(['docs/ngMango-3.2/partials/api/*.html','docs/ngMango-3.2/js/docs-setup.js'])
        .pipe(gulp.dest('web/ui/views/docs'));
});

gulp.task('watchDocs', function() {
    // Watch .js files
    gulp.watch('web/ngMango-3.2/**/*.js', ['copy-docs']);
});

gulp.task('watch-web', function() {
    return gulp.src('web/**')
        .pipe(watch('web/**', {ignoreInitial: false, verbose: true}))
        .pipe(gulp.dest(MA_HOME + '/web/modules/mangoUI/web'));
});

gulp.task('watch-properties', function() {
    return gulp.src('classes/**')
        .pipe(watch('classes/**', {ignoreInitial: false, verbose: true}))
        .pipe(gulp.dest(MA_HOME + '/web/modules/mangoUI/classes'));
});

gulp.task('build-amcharts', function() {
    var amchart = gulp.src([
        'utils/Class.js',
        'utils/Utils.js',
        'axes/AxisBase.js',
        'axes/ValueAxis.js',
        'axes/RecAxis.js',
        'axes/RecItem.js',
        'axes/RecFill.js',
        'chartClasses/AmChart.js',
        'chartClasses/AmGraph.js',
        'chartClasses/ChartCursor.js',
        'chartClasses/SimpleChartScrollbar.js',
        'chartClasses/ChartScrollbar.js',
        'chartClasses/AmBalloon.js',
        'chartClasses/AmCoordinateChart.js',
        'chartClasses/TrendLine.js',
        'chartClasses/Image.js',
        'geom/Geom.js',
        'geom/Bezier.js',
        'drawingEngine/AmDraw.js',
        'drawingEngine/AmDObject.js',
        'drawingEngine/VMLRenderer.js',
        'drawingEngine/SVGRenderer.js',
        'AmLegend.js',
        'utils/DateUtils.js'],
        {cwd: 'bower_components/amcharts'})
    .pipe(concat('amcharts.js'));
    
    var serial = gulp.src([
        'chartClasses/AmRectangularChart.js',
        'AmSerialChart.js',
        'geom/Cuboid.js',
        'axes/CategoryAxis.js'],
        {cwd: 'bower_components/amcharts'})
    .pipe(concat('serial.js'));
    
    return merge(amchart, serial)
        .pipe(gulp.dest('web/vendor/amcharts'));
});
