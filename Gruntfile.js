module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      js: {
        src: [
          'assets/js/src/vue.js',
          'assets/js/src/moment.js',
          'assets/js/src/app.js'],
        dest: 'assets/js/src/app.combined.js'
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        sourceMap: true,
      },
      js: {
        files: {
          'assets/js/app.min.js': ['<%= concat.js.dest %>']
        }
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat','uglify']);
};
