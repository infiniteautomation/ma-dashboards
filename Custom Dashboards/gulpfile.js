var gulp = require('gulp');
var exists = require('path-exists').sync;
var gulpIgnore = require('gulp-ignore');

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
            path.dirname = path.dirname.replace(/^ace-builds(\\|\/)src-min-noconflict/g, 'ace');
            path.dirname = path.dirname.replace(/(\\|\/)(min|dist|build|builds|lib|release)$/g, '');
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
        title: "Custom Dashboard 3.x Documentation",
        startPage: "/",
        html5Mode: false,
        loadDefaults: {
            angular: false,
            angularAnimate: false
        },
        scripts: [
            '../../../vendor/angular/angular.js',
            '../../../vendor/angular-animate/angular-animate.js'
        ]
    }

    
    return gulp.src('web/js/mango-3.0/**/*.js')
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('docs/mango-3.2'));
});

gulp.task('copy-docs', [], function() {
    var gulpDocs = require('gulp-ngdocs');

    console.log('Copying Doc Partials');
    
    return gulp.src(['docs/mango-3.2/partials/api/*.html','docs/mango-3.2/js/docs-setup.js'])
        .pipe(gulp.dest('web/mdAdmin/views/docs'));
});

gulp.task('watchDocs', function() {
    // Watch .js files
    gulp.watch('web/js/mango-3.0/**/*.js', ['build-ngdocs', 'copy-docs']);
});
