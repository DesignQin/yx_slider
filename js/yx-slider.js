(function($) {
    /**
     * 创建轮播
     * @description 用于实例化一个 yx-slider 轮播组件
     * @param {Object} ele 轮播组件的根节点
     * @param {Object} options 配置项
     */
    var yxStart = function(ele, options) {
        // 默认配置
        var config = {
                isFade: false, // 是否使用淡入淡出效果
                interval: 3500, // 轮播间隔，毫秒
                speed: 600, // 动画持续时间
                vertical: false, // 是否使用垂直轮播(未完成)
                btn: true, // 是否启用切换按钮
                pointer: true, // 是否显示计数点
                autoPlay: true, // 是否自动播放
                pointerHover: false // 指示器是否悬停触发，默认是点击触发
            }
            // 配置参数合并
        $.extend(true, config, options);

        // 指示器事件类型
        var pointerEventType = config.pointerHover ? 'mouseenter' : 'click';
        // 初始化
        var $view = $(ele).find('.yx-slider-view');
        $view.find('.item').eq(0).css({
            display: "inline"
        }).addClass('active');
        // 创建控制层
        var $ctrl = $('<div class="yx-slider-ctrl">');
        // 插入控制层
        $(ele).append($ctrl);
        // 生成控件
        createController();
        // 调用启动函数
        if (config.isFade) {
            fade();
        } else {
            slide();
        }

        /**
         * 控制层控件生成
         * @description 根据 config 配置项创建控制层控制器
         */
        function createController() {
            // 插入切换按钮
            config.btn &&
                $ctrl.append('<div class="yx-slider-ctrl-btn"><span class="yx-prev">&lt;</span><span class="yx-next">&gt;</span></div>');
            // 插入计数点
            if (config.pointer) {
                var str = '<div class="yx-slider-ctrl-pointer">';
                for (var i = 0; i < $view.find('.item').length; i++) {
                    !i ? str += '<i class="active"></i>' : str += '<i></i>';
                }
                str += '</div>';
                $ctrl.append(str);
            }
        }

        /**
         * 淡入淡出轮播，当 config.isFade === true 时调用
         */
        function fade() {
            // 配置轮播视图(yx-slider-view)为 fade 样式
            $view.addClass('yx-view-fade');
            var $item = $view.find('.item');
            var index = 0; // 索引值
            var timer = null;

            autoPlay();

            // 事件
            $ctrl.on('click', '.yx-prev', function() {
                index--;
                if (index < 0) {
                    index = $item.length - 1;
                }
                startFade(index);
            }).on('click', '.yx-next', function() {
                next();
            }).on(pointerEventType, '.yx-slider-ctrl-pointer i', function() {
                index = $(this).index();
                startFade(index);
            });
            $(ele).on('mouseenter', function() {
                clearInterval(timer);
                timer = null;
            }).on('mouseleave', function() {
                autoPlay();
            });

            function next() {
                index++;
                if (index > $item.length - 1) {
                    index = 0;
                }
                startFade(index);
            }

            /**
             * @param {Object} index 索引
             */
            function startFade(index) {
                // 视图
                $item.eq(index).fadeIn(config.speed).addClass('active').siblings().fadeOut(config.speed).removeClass('active');
                //控制器
                $ctrl.find('.yx-slider-ctrl-pointer i').eq(index).addClass('active').siblings().removeClass('active');
            }

            function autoPlay() {
                if (!config.autoPlay) {
                    return;
                }
                timer = setInterval(next, config.interval);
            }
        }

        /**
         * 滑动轮播，默认(config.isFade == false)调用
         */
        function slide() {
            // 配置轮播视图(yx-slider-view)为 slide 样式
            $view.addClass('yx-view-slide');
            // 复制第一张在尾部插入
            $view.append($view.find('.item').first().clone(true));
            // 获取 item 集合,包括复制元素
            var $item = $view.find('.item');
            // 获取 item 总数
            var total = $item.length;
            //  		console.log(total)
            // 计算步长
            var step = $view.find('.item').width();
            //  		console.log(step)
            // 修改 item 宽度为视口(yx-slider)的宽度
            $item.width($(ele).width());
            // 修改胶卷(view)宽度为 item 集合总宽度(+100为防止溢出)
            $view.width(total * step + 100);
            var index = 0; // 索引
            var timer = null;
            autoPlay();

            //事件
            $ctrl.on('click', '.yx-prev', function() {
                prev();
            }).on('click', '.yx-next', function() {
                next();
            }).on(pointerEventType, '.yx-slider-ctrl-pointer i', function() {
                index = $(this).index();
                startSlide(index);
            });
            $(ele).on('mouseenter', function() {
                clearInterval(timer);
                timer = null;
            }).on('mouseleave', function() {
                autoPlay();
            });

            /**
             * 下一张
             */
            function next() {
                index++;
                if (index > total - 1) {
                    //右侧超出，重置坐标设为0
                    $view.css('left', 0);
                    index = 1;
                }
                startSlide(index);
            }

            function prev() {
                index--;
                if (index < 0) {
                    //左侧超出，重置坐标到末尾插入的那张
                    $view.css('left', -(total - 1) * step);
                    index = total - 2; //准备前往最后一张图(非插入的那张)
                }
                startSlide(index);
            }
            /**
             * @description 根据索引值滚动
             * @param {Object} index 索引值
             */
            function startSlide(index) {
                // 视图
                $view.stop().animate({
                    left: -index * step
                }, config.speed);
                // 控制器
                if (index == total - 1) {
                    //是末尾复制的那张则将active设置到第一张
                    $ctrl.find('.yx-slider-ctrl-pointer i').eq(0).addClass('active').siblings().removeClass('active');
                } else {
                    $ctrl.find('.yx-slider-ctrl-pointer i').eq(index).addClass('active').siblings().removeClass('active');
                }
            }
            /**
             * 设置定时器自动轮播
             */
            function autoPlay() {
                if (!config.autoPlay) {
                    return;
                }
                timer = setInterval(next, config.interval);
            }
        }
    }
    $.fn.yxSlide = function(options) {
        $(this).each(function(index, ele) {
            yxStart(ele, options);
        });
        // 返回值，以便支持链式调用
        return this;
    }
})(jQuery);