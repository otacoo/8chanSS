(function() {
    module.exports = function(grunt) {
      var concatOptions, pkg, shellOptions;
      pkg = grunt.file.readJSON('package.json');
      concatOptions = {
        process: {
          data: pkg
        }
      };
      shellOptions = {
        stdout: true,
        stderr: true,
        failOnError: true
      };
      grunt.initConfig({
        pkg: pkg,
        concat: {
          style: {
            options: concatOptions,
            files: {
              'tmp/style.css': 'src/style.js'
            }
          },
          userscript: {
            options: concatOptions,
            files: {
              'builds/<%= pkg.name %>.meta.js': 'src/meta/metadata.js',
              'builds/<%= pkg.name %>.user.js': ['src/meta/metadata.js', 'src/script.js']
            }
          }
        },
        cssmin: {
          minify: {
            src: 'tmp/style.css',
            dest: 'tmp/style.min.css'
          }
        },
        clean: {
          tmp: 'tmp/'
        }
      });
      grunt.loadNpmTasks('grunt-bump');
      grunt.loadNpmTasks('grunt-contrib-clean');
      grunt.loadNpmTasks('grunt-contrib-concat');
      grunt.loadNpmTasks('grunt-contrib-copy');
      grunt.loadNpmTasks('grunt-shell');
      grunt.loadNpmTasks('grunt-contrib-cssmin');
      grunt.registerTask('default', ['build']);
      grunt.registerTask('build', ['concat:style', 'cssmin:minify', 'concat:userscript', 'clean:tmp']);
      grunt.registerTask('release', ['default']);
      grunt.registerTask('patch', ['bump-only', 'reloadPkg', 'updcl:3']);
      grunt.registerTask('minor', ['bump-only:minor', 'reloadPkg', 'updcl:2']);
      grunt.registerTask('major', ['bump-only:major', 'reloadPkg', 'updcl:1']);
      grunt.registerTask('reloadPkg', 'Reload the package', function() {
        pkg = grunt.file.readJSON('package.json');
        grunt.config.data.pkg = concatOptions.process.data = pkg;
        return grunt.log.ok('pkg reloaded.');
      });
      return grunt.registerTask('updcl', 'Update the changelog', function(i) {
        var version;
        version = [];
        version.length = +i + 1;
        version = version.join('#') + ' v' + pkg.version + '\n*' + grunt.template.today('yyyy-mm-dd') + '*\n';
        grunt.file.write('CHANGELOG.md', version + '\n' + grunt.file.read('CHANGELOG.md'));
        return grunt.log.ok('Changelog updated for v' + pkg.version + '.');
      });
    };
  
  }).call(this);