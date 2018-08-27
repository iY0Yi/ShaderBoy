'use strict';

import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import webpack from 'webpack';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import webpackConfig from './webpack.config.js';
import pck from './package.json';

// const reload = browserSync.reload;
const $ = gulpLoadPlugins(
	{
		pattern: ['gulp-*', 'gulp.*'],
		replaceString: /\bgulp[\-.]/
	});

gulp.task('webpack', () => {
	gulp.src('src/js/**/*.js')
		.pipe($.webpack(webpackConfig))
		.pipe(gulp.dest('dest/js/'));
});

gulp.task('lint', () =>
	gulp.src('src/js/**/*.js')
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

gulp.task('copy', () => {
	gulp.src('src/html/index.html').pipe(gulp.dest('dest'));
	gulp.src('src/css/style.css').pipe(gulp.dest('dest/css'));
	gulp.src([
		'src/js/shader/**/*.vs',
		'src/js/shader/**/*.fs'
	]).pipe(gulp.dest('dest/shader'));
});

gulp.task('reload', () => {
	browserSync.reload();
});

gulp.task('clearCache', (done) => {
	$.cache.clearAll(done);
});

gulp.task('clean', () => del(['dest/*', '!dest/.git'],
	{
		dot: true
	}));

gulp.task('build', () => {
	runSequence(
		'clearCache',
		'clean', ['webpack', 'copy']
	);
});

gulp.task('serve', ['webpack', 'copy', 'reload'], () => {
	browserSync(
		{
			notify: true,
			logPrefix: pck.name,
			server: 'dest',
			port: 8000,
			reloadDelay: 1500,
			logFileChanges: true
		});

	gulp.watch(['src/js/**/*.js'], ['webpack']);
	gulp.watch(['src/html/index.html'], ['copy']);
	gulp.watch([
		'src/js/shader/**/*.vs',
		'src/js/shader/**/*.fs'
	], ['copy']);

	gulp.watch([
		'dest/js/**/*.js',
		'dest/shader/**/*.vs',
		'dest/shader/**/*.fs'
	]).on('change', function (e) {
		return gulp.src(e.path)
			.pipe(browserSync.reload({ stream: true }));
	});
});

gulp.task('default', ['serve']);
