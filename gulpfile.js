'use strict';

// ----------------------------------------
// Imports
// ----------------------------------------

const gulp = require('gulp');
const iF = require('gulp-if');
const sass = require('gulp-sass');
const posctcss = require('gulp-postcss');
const argv = require('yargs').argv;
const notify = require('gulp-notify');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const browserSync = require('browser-sync').create();

// ----------------------------------------
// Private
// ----------------------------------------

const sassDest = './css/';
const sassSource = './sass/*.scss';
const sassWatch = ['./sass/**/*.scss', './prismjs-theme-sass-core/**/*.scss', './sass/_*.scss'];

const onProduction = !!argv.production;
const onWriteDest = argv.dest !== false;

// ----------------------------------------
// Public
// ----------------------------------------

gulp.task('sass', () => {
	if (onProduction) {
		return gulp.src(sassSource)
			.pipe(sass({
				indentType: 'tab',
				indentWidth: 1,
				linefeed: 'crlf',
				outputStyle: 'expanded',
				includePaths: [
					'./node_modules/'
				]
			}))
			.pipe(iF(onWriteDest, gulp.dest(sassDest)))
			.pipe(posctcss([
				cssnano({
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
			.on('data', file => {
				file.stem = file.stem + '.min';
			})
			.pipe(iF(onWriteDest, gulp.dest(sassDest)));
	}

	return gulp.src(sassSource)
		.pipe(sourcemaps.init())
		.pipe(sass({
			indentType: 'tab',
			indentWidth: 1,
			linefeed: 'crlf',
			outputStyle: 'expanded',
			includePaths: [
				'./node_modules/'
			]
		}).on('error', notify.onError({
			message: 'Error: <%= error.message %>',
			title: 'Error running something'
		})))
		.pipe(sourcemaps.write())
		.pipe(changed(sassDest, { hasChanged: changed.compareContents }))
		.pipe(gulp.dest(sassDest))
		.pipe(browserSync.stream());
});

gulp.task('serve', () => {
	browserSync.init({
		server: {
			baseDir: './',
			directory: true
		}
	});

	gulp.watch(sassWatch, gulp.series('sass'));
	gulp.watch('./index.html').on('change', browserSync.reload);
});

// ----------------------------------------
// Public
// ----------------------------------------

gulp.task('build', gulp.series('sass'));
gulp.task('dev', gulp.series('sass', 'serve'));
