'use strict';
var gitRev = require('git-rev-sync');

module.exports = function(grunt) {
    // Unified Watch Object
    var watchFiles = {
        serverViews: ['app/views/**/*.*'],
        serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js', '!node_modules/**/*.js'],
        clientViews: ['public/modules/**/views/**/*.html'],
        clientJS: ['public/js/*.js', 'public/modules/**/*.js'],
        clientCSS: ['public/modules/**/*.css'],
        clientStylus: ['public/assets/stylesheets/**/*.styl'],
        mochaTests: ['app/tests/**/*.js']
    };

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            serverViews: {
                files: watchFiles.serverViews,
                options: {
                    livereload: true
                }
            },
            serverJS: {
                files: watchFiles.serverJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientViews: {
                files: watchFiles.clientViews,
                options: {
                    livereload: true,
                }
            },
            clientJS: {
                files: watchFiles.clientJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientCSS: {
                files: watchFiles.clientCSS,
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            },
            clientStylus: {
                files: ['public/assets/stylesheets/**/*.styl'],
                tasks: ['stylus'],
                options: {
                    livereload: true
                }
            }
        },
        concat: {
            js: {
                src: 'public/js/*.js',
                dest: 'public/js/main.js'
            },
            css: {
                src: 'public/css/*.css',
                dest: 'public/css/main.css'
            }
        },
        jshint: {
            all: {
                src: watchFiles.clientJS.concat(watchFiles.serverJS),
                options: {
                    jshintrc: true,
                    moment: false,
                    braintree: false
                }
            }
        },
        stylus: {
            compile: {
                options: {
                    paths: ['public/assets/stylesheets/**']
                },
                files: [{
                    dest: 'public/css/',
                    cwd: 'public/assets/stylesheets/',
                    src: '*.styl',
                    ext: '.css',
                    expand: true
                }]
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc',
            },
            all: {
                src: watchFiles.clientCSS
            }
        },
        uglify: {
            production: {
                options: {
                    mangle: true
                },
                files: {
                    '<%= minifiedApplicationJavaScriptFiles %>': 'public/dist/application.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/dist/application.min.css': '<%= applicationCSSFiles %>'
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:3000'
            }
        },
        nodemon: {
            dev: {
                script: 'trajans.js',
                options: {
                    nodeArgs: ['--debug'],
                    ext: 'js,html',
                    watch: watchFiles.serverViews.concat(watchFiles.serverJS),
                    ignore: ['node_modules/**']
                }
            }
        },
        'node-inspector': {
            custom: {
                options: {
                    'web-port': 1337,
                    'web-host': 'localhost',
                    'debug-port': 5858,
                    'save-live-edit': true,
                    'no-preload': true,
                    'stack-trace-limit': 50,
                    'hidden': []
                }
            }
        },
        ngAnnotate: {
            production: {
                files: {
                    'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
                }
            }
        },
        concurrent: {
            default: ['nodemon', 'open', 'watch'],
            debug: ['nodemon', 'watch', 'node-inspector'],
            options: {
                logConcurrentOutput: true
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        mochaTest: {
            src: watchFiles.mochaTests,
            options: {
                reporter: 'spec',
                require: 'server.js'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        ngtemplates: {
            options: {
                url: function(url) {
                    return url.replace('public', 'assets');
                },
                prefix: '/'
            },
            'Trajans-marketplace': {
                src: 'public/modules/**/**.html',
                dest: 'public/dist/templates.js'
            }
        }
    });

    // Load NPM tasks 
    require('load-grunt-tasks')(grunt);

    // Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    // A Task for loading the configuration object
    grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
        var config = require('./server/build/src/config/config').default;

        grunt.config.set('applicationJavaScriptFiles', config.assets.js);
        grunt.config.set('applicationCSSFiles', config.assets.css);

        var version = gitRev.short();
        grunt.config.set('minifiedApplicationJavaScriptFiles', 'public/dist/application-' + version + '.min.js');

    });

    // Default task(s).
    grunt.registerTask('default', ['lint', 'concurrent:default']);

    // Debug task.
    grunt.registerTask('debug', ['lint', 'concurrent:debug']);

    // Lint task(s).
    grunt.registerTask('lint', ['jshint', 'csslint']);

    // Build task(s).
    grunt.registerTask('build', ['lint', 'loadConfig', 'ngtemplates', 'ngAnnotate', 'uglify', 'stylus', 'cssmin']);

    // Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);

    grunt.loadNpmTasks('grunt-contrib-stylus');
};
