/*
配置具体任务
*/
//引入path模块 处理文件路径
const path = require('path');
//引入gulp 处理api
const gulp= require('gulp');
//拆分页面
const fileinclude = require('gulp-file-include');
//处理less
const less = require('gulp-less');
//自动添加兼容前缀
const autoprefixer = require('gulp-autoprefixer');
//压缩css
const cssmin = require('gulp-cssmin');
//压缩js
const uglify = require('gulp-uglify');
//ES6语法转换
const babel = require('gulp-babel');
//压缩HTML
const htmlmin = require('gulp-htmlmin');
//调试
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
//清理文件夹
const clean = require('gulp-clean');
//使任务按照顺序执行
const runSequence = require('run-sequence');
//处理文件指纹
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
//对文件进行重命名
const rename = require('gulp-rename');


//处理清理操作
gulp.task('clean',function () {
    return gulp.src(path.join(__dirname,'./dist/*'),{read:false})
        .pipe(clean())
})mm
// 处理css
gulp.task('css',function(){
    return gulp.src(path.join(__dirname,'src','css/*'))
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(rev())
        .pipe(gulp.dest(path.join(__dirname,'dist','css')))
        .pipe(rev.manifest())
        .pipe(rename('css-manifest.json'))
        .pipe(gulp.dest('./dist/rev'));
})

// 处理js
gulp.task('js',function(){
    return gulp.src(path.join(__dirname,'src','js/**/*.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(path.join(__dirname,'dist','js')))
        .pipe(rev.manifest())
        .pipe(rename('js-manifest.json'))
        .pipe(gulp.dest('./dist/rev'));
})

// 处理html
gulp.task('html',function(){
    return gulp.src(path.join(__dirname, 'src/view/**/*.html'))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlmin({             // 把html交给htmlmin插件处理
            collapseWhitespace: true, // 设置参数去除空白
            minifyJS: true,           // 压缩html中的js
            minifyCSS: true,          // 压缩html中的css
            removeComments: true      // 去除html注释
        }))
        .pipe(gulp.dest(path.join('dist')));
})

// gulp.task('build',['css','js','html']);
gulp.task('build',function(){
    // 保证任务串行
    runSequence('clean', ['css','js','html'],function(){
        return gulp.src(['./dist/rev/*.json', './dist/index.html'])
            .pipe(revCollector())
            .pipe(gulp.dest('./dist'));
    })
})

// 调试
gulp.task('dev',['build'],function(){
    browserSync.init({
        server: {
            baseDir: "./dist" // 监控目录的基准路径
        },
        port:8888, // 配置服务端口
        notify: false // 设置页面是否有提示信息
    });
    // 具体监听什么
    gulp.watch(path.join(__dirname,'src',"view/**/*"), ['html']).on('change', reload);
    gulp.watch(path.join(__dirname,'src',"css/**/*"), ['css']).on('change', reload);
    gulp.watch(path.join(__dirname,'src',"js/**/*"), ['js']).on('change', reload);
});

// 默认任务配置
gulp.task('default',['dev'])
