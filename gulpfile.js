'use strict';

// ----------------------------------------
// Imports
// ----------------------------------------

const gulp = require('gulp');
const iF = require('gulp-if');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const posctcss = require('gulp-postcss');
const argv = require('yargs').argv;
const notify = require('gulp-notify');
const changed = require('gulp-changed');

// ----------------------------------------
// Private
// ----------------------------------------

const sassDest = './css/';
const sassSource = './sass/*.scss';
// const sassWatch = './sass/**/*.scss';

const onProduction = !!argv.production;
const onWriteDest = argv.dest !== false;

// ----------------------------------------
// Public
// ----------------------------------------

gulp.task('sass', () => {
	if (onProduction) {
		return gulp.src(sassSource)
			.pipe(sass())
			.pipe(posctcss([
				require('cssnano')({
					preset: ['default', {
						zindex: false,
						autoprefixer: false,
						reduceIdents: false,
						discardUnused: false,
						cssDeclarationSorter: false, // disable plugin
						postcssCalc: false // disable plugin
					}]
				})
			]))
			.pipe(iF(onWriteDest, gulp.dest(sassDest)));
	}

	return gulp.src(sassSource)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', notify.onError({
			message: 'Error: <%= error.message %>',
			title: 'Error running something'
		})))
		.pipe(sourcemaps.write())
		.pipe(changed(sassDest, { hasChanged: changed.compareContents }))
		.pipe(gulp.dest(sassDest));
});

// ----------------------------------------
// Exports
// ----------------------------------------

// Если это модуль, он должен экспортировать
// Описаный в нем функционал или данные из текущего файла
