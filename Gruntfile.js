/*global module */
/*global require */

(function () {
  'use strict';
  module.exports = function (grunt) {
    // Apparently I have to require mozjpeg anyways
    // need to research why. Is it because it's not
    // seen as a grunt package?
    var mozjpeg = require('imagemin-mozjpeg');
    // require time-grunt at the top and pass in the grunt instance
    // it will measure how long things take for performance
    //testing
    require('time-grunt')(grunt);

    // load-grunt will read the package file and automatically
    // load all our packages configured there.
    // Yay for laziness
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

      // Reference to the package file
      pkg: grunt.file.readJSON('package.json'),

      // JAVASCRIPT TASKS
      // Hint the grunt file and all files under js/
      // and one directory below
      jshint: {
        files: [ 'Gruntfile.js', 'js/{,*/}*.js'],
        options: {
          reporter: require('jshint-stylish')
          // options here to override JSHint defaults
        }
      },

      // Takes all the files under js/ and concatenates
      // them together. I've chosen not to mangle the compressed file
      uglify: {
        main: {
          options: {
            mangle: false,
            sourceMap: true,
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> ' +
            'Released under the MIT license http://caraya.mit-license.org/*/'
          },
          files: {
            'js/build.js': [ 'js/*.js' ],
          }
        },
        libs: {
          options: {
            mangle: false,
            sourceMap: true
          },
          files: {
            'lib/vendor/allLibs.js': [
              'lib/vendor/*.js',
              '!lib/vendor/modernizr-2.8.3.min.js' ],
          }
        },
        plugins: {
          options: {
            mangle:false,
            sourceMap: true
          },
          files: {
            'lib/plugins/allPlugs.js': [ 'lib/plugins/*.js' ]
          }
        }
      },


      // OPTIONAL JS TASKS
      // Both Coffescript and Babel will generate Javascript files.
      // May want to run them before concat and uglify to make sure we
      // have all our files ready to be processed.
      // If you're using either Babel or Coffeescript run the corresponding
      // task below

      // COFFEESCRIPT
      // If you want to use coffeescript (http://coffeescript.org/)
      // change the cwd value to the locations of your coffee files
      coffee: {
        files: {
          expand: true,
          flatten: true,
          cwd: 'coffee',
          src: ['*.coffee'],
          dest: 'js/',
          ext: '.js'
        }
      },

      // BABEL
      // Babel allows you to transpile ES6 to current ES5 without needing
      // a plugin or anything installed in your application. This will
      // eventually go away when I'm happy with ES6 support in browsers
      // See http://babeljs.io/ for more information.
      babel: {
        options: {
          sourceMap: true
        },
        dist: {
          files: {
            'es6/*.js': 'src/*.js'
          }
        }
      },

      // SASS AND CSS RELATED TASKS
      // Converts all the files under scss/ ending with .scss
      // into the equivalent css file on the css/ directory
      sass: {
        dev: {
          options: {
            style: 'expanded'
          },
          files: [ {
            expand: true,
            cwd: 'sass',
            src: [ '*.scss'],
            dest: 'css',
            ext: '.css'
          }]
        },
        production: {
          options: {
            style: 'compress'
          },
          files: [ {
            expand: true,
            cwd: 'sass',
            src: [ '*.scss'],
            dest: 'css',
            ext: '.css'
          }]
        }
      },

      // This task requires the scss-lint ruby gem to be
      // installed on your system If you choose not to
      // install it, comment out this task and the prep-css
      // and work-lint tasks below
      //
      // I've chosen not to fail on errors or warnings.
      scsslint: {
        allFiles: [
          'scss/*.scss',
          'scss/modules/_mixins.scss',
          'scss/modules/_variables.scss',
          'scss/partials/*.scss'],
        options: {
          force: true,
          colorizeOutput: true
        }
      },

      // Optional CSS Post Process
      // Autoprefixer will check caniuse.com's database and
      // add the necessary prefixes to CSS elements as needed.
      // This saves us from doing the work manually
      autoprefixer: {
        options: {
          browsers: [
            'ie >= 10',
            'ie_mob >= 10',
            'ff >= 30',
            'chrome >= 34',
            'safari >= 7',
            'opera >= 23',
            'ios >= 7',
            'android >= 4.4',
            'bb >= 10'
          ]
        },

        files: {
          expand: true,
          flatten: true,
          src: 'css/*.css',
          dest: 'css/*.css'
        }
      },

      // UNCSS will analyzes the your HTML pages and
      // remove from the CSS all the classes that are
      // not used in any of your HTML pages
      //
      // This task needs to be run in the processed CSS
      // rather than the SCSS files
      //
      //See https://github.com/addyosmani/grunt-uncss
      // for more information
      uncss: {
        dist: {
          files: {
            'dist/css/main.css': [ 'dist/*.html' ]
          }
        }
      },

      imagemin: {
        png: {
          options: {
            optimizationLevel: 7
          },
          files: [
            {
              // Set to true to enable the following options…
              expand: true,
              // cwd is 'current working directory'
              cwd: 'images/',
              src: ['**/*.png'],
              // Could also match cwd line above. i.e. project-directory/img/
              dest: 'dist/images/',
              ext: '.png'
            }
          ]
        },
        jpg: {
          options: {
            progressive: true,
            use: [mozjpeg()]
          },
          files: [
            {
              // Set to true to enable the following options…
              expand: true,
              // cwd is 'current working directory'
              cwd: 'images/',
              src: ['**/*.jpg'],
              // Could also match cwd. i.e. project-directory/img/
              dest: 'dist/images/',
              ext: '.jpg'
            }
          ]
        }
      },

      // GH-PAGES TASK
      // Push the specified content into the repositories
      // gh-pages branch
      'gh-pages': {
        options: {
          message: 'Content committed from Grunt gh-pages',
          dotfiles: false,
          base: 'dist/'
        },
        // These files will get pushed to the `
        // gh-pages` branch (the default)
        src: ['**/*']
      },

      // FILE MANAGEMENT
      // Can't seem to make the copy task create the directory
      // if it doesn't exist so we go to another task to create
      // the fn directory
      mkdir: {
        build: {
          options: {
            create: [ 'dist' ]
          }
        }
      },

      // Copy the files from our repository into the dist
      // directory. Do not do deep copy of HTML files.
      // It'll copy stuff that we keep around for testing,
      // like the webfont loader docs. Either delete the
      // webfont loader stuff or just copy html from the
      // top level directory (which I changed it to do)
      copy: {
        dist: {
          files: [ {
            expand: true,
            src: [
              'fonts/**/*',
              'css/**/*',
              'lib/**/*',
              'js/**/*',
              '*.html'],
            dest: 'dist/'
          }]
        }
      },

      // Clean the build directory
      clean: {
        all: [ 'dist/' ]
      },

      perfbudget: {
        all: {
          options: {
            url: 'https://caraya.github.io/books-as-apps/typography.html',
            key: 'A.be974c9b235f69677db80813612925c6',
            budget: {
              visualComplete: '4000',
              SpeedIndex: '1500'
            }
          }
        }
      },

      critical: {
        typography: {
          options: {
            minify: true,
            base: './',
            css: [
              'css/main.css'
            ],
            width: 1200,
            height: 800
          },
          src: 'typography.html',
          dest: 'dist/typography.html'
        }
      },


      // Compare the size of the listed files
      compare_size: {
        files: [
          'dist/js/*.js',
          'dist/css/*.css'
        ],
        options: {
          // Location of stored size data
          cache: '.sizecache.json',

          // Compressor label-function pairs
          compress: {
            gz: function (fileContents) {
              return require('gzip-js').zip(fileContents, {}).length;
            }
          }
        }
      }



    });
    // closes initConfig

    // CUSTOM TASKS
    // Usually a combination of one or more tasks defined above

    grunt.task.registerTask(
      'lint',
      [ 'jshint' ]
    );

    grunt.task.registerTask(
      'publish',
      [ 'clean:all', 'copy:dist', 'imagemin', 'gh-pages' ]
    );
    grunt.task.registerTask(
      'lint-all',
      [ 'scsslint', 'jshint']
    );

    // Prep CSS starting with SASS, autoprefix et. al
    grunt.task.registerTask(
      'prep-css',
      [ 'scsslint', 'sass:dev', 'autoprefixer' ]
    );

    grunt.task.registerTask(
      'optional-js',
      [ 'coffeescript', 'babel' ]
    );

    grunt.task.registerTask(
      'prep-js',
      [ 'jshint', 'concat:dist', 'uglify' ]
    );

    grunt.task.registerTask(
      'all-js',
      [' optional-js', 'prep-js' ]
    );

  };
  // closes module.exports
}
());
// closes the use strict function
