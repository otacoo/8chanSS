(function() {
    module.exports = function(grunt) {
      var concatOptions, pkg, shellOptions;
      pkg = grunt.file.readJSON('package.json');
      concatOptions = {
        process: function(src, filepath) {
          if (/metadata\.js$/.test(filepath)) {
            return grunt.template.process(src, { data: pkg });
          }
          var css = function(file) {
            return function() { return JSON.stringify(grunt.file.read(file)); };
          };
          var favStyles = ["default", "eight", "eight_dark", "pixel", "pixel_alt"];
          favStyles.forEach(function(style) {
            var key = "__SS_FAV_" + style.toUpperCase() + "_BASE__";
            var b64 = grunt.file.read("src/img/fav/" + style + "_base.png", { encoding: "base64" });
            src = src.split(key).join(JSON.stringify(b64));
          });
          return src
            .replace(/__SS_VERSION__/g, function() { return pkg.version; })
            .replace(/__SS_SHIM_CSS__/g, css('tmp/shim.min.css'))
            .replace(/__SS_SITE_CSS__/g, css('tmp/site.min.css'))
            .replace(/__SS_THREAD_CSS__/g, css('tmp/thread.min.css'))
            .replace(/__SS_CATALOG_CSS__/g, css('tmp/catalog.min.css'));
        }
      };
      shellOptions = {
        stdout: true,
        stderr: true,
        failOnError: true
      };
      grunt.initConfig({
        pkg: pkg,
        remove_comments: {
          js: {
            options: {
              multiline: true,
              singleline: true,
              keepSpecialComments: false
            },
            src: 'src/script.js',
            dest: 'tmp/script.nocomment.js'
          },
        },
        cssmin: {
          target: {
            files: { //workaround cssmin bug by directly specifying files
              'tmp/catalog.min.css': ['src/css/catalog.css'],
              'tmp/site.min.css': ['src/css/site.css'],
              'tmp/thread.min.css': ['src/css/thread.css'],
              'tmp/shim.min.css': ['src/css/shim.css']
            }
          }
        },
        concat: {
          userscript: {
            options: concatOptions,
            files: {
              'builds/<%= pkg.name %>.meta.js': 'src/meta/metadata.js',
              'builds/<%= pkg.name %>.user.js': ['src/meta/metadata.js', 'tmp/script.nocomment.js']
            }
          }
        },
        clean: {
          tmp: 'tmp/'
        }
      });
      grunt.loadNpmTasks('grunt-bump');
      grunt.loadNpmTasks('grunt-remove-comments');
      grunt.loadNpmTasks('grunt-contrib-cssmin');
      grunt.loadNpmTasks('grunt-contrib-clean');
      grunt.loadNpmTasks('grunt-contrib-concat');
      grunt.loadNpmTasks('grunt-contrib-copy');
      grunt.loadNpmTasks('grunt-shell');
      grunt.registerTask('default', ['build']);
      grunt.registerTask('build', ['remove_comments', 'cssmin', 'concat:userscript', 'clean:tmp']);
      grunt.registerTask('release', ['default']);
      grunt.registerTask('patch', ['bump-only', 'updcl:3']);
      grunt.registerTask('minor', ['bump-only:minor', 'updcl:2']);
      grunt.registerTask('major', ['bump-only:major', 'updcl:1']);
      return grunt.registerTask('updcl', 'Update the changelog', function(i) {
        var pkg = grunt.file.readJSON('package.json');
        var version = [];
        version.length = +i + 1;
        version = version.join('#') + ' v' + pkg.version + '\n*' + grunt.template.today('yyyy-mm-dd') + '*\n';
        grunt.file.write('CHANGELOG.md', version + '\n' + grunt.file.read('CHANGELOG.md'));
        return grunt.log.ok('Changelog updated for v' + pkg.version + '.');
      });
    };
  
  }).call(this);