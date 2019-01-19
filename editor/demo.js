
function Application() {
    this.images = images
    this.slider = document.querySelector('.swiper-wrapper')
    this.drawing = new SVG('rectNoClick').size('100%', '100%')
    this.isControlPressed = false,
    this.isAltPressed = false,
    this.isShiftPressed = false,
    this.rectList = [],
    this.rect = this.drawing.rect().attr('stroke-width',4).attr('fill','none');



    this.init = function () {

        // handler for generating image list for slider
        this.generateImageList()

        // init swiper slider
        this.initSlider()

        //handler for choosing image for refactoring
        this.setImageClickHandlers()

        // events for choosing part of image
        this.handleMouseDownImage()
        this.handleMouseUpImage()

        // handlers for keys - ctrl, alt shift
        this.handleDocumentKeyUp()
        this.handleDocumentKeyPress()

    }


    this.initSlider = function () {
        var swiper = new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            speed: 700,
            slidesPerGroup: 5,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    this.generateImageList = function () {
        this.images.forEach(function (item, i) {
            var img = document.createElement('img'),
                div = document.createElement('div')

            div.className = 'swiper-slide';

            img.src = item;
            img.setAttribute('id', 'img' + i)
            img.className = 'thumb'

            div.appendChild(img)

            this.slider.appendChild(div)
        }.bind(this))
    }
    this.setImageClickHandlers = function () {
        this.images.forEach(function (img,i) {
            document.getElementById("img"+i)
                .addEventListener(
                    "click",
                    function() {
                        document.getElementById("rectNoClick")
                            .style
                            .backgroundImage= "url('"+ img + "')";
                    }
                );
        })

    }

    this.getRandomColor = function () {
        var letters = '0123456789ABCDEF'.split(''),
            color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    this.handleMouseDownImage = function () {
        this.drawing.on('mousedown', function(e){

            (this.rect) && this.rect.attr('stroke-width', 2);

            this.rect = this.drawing
                .rect().attr('stroke-width',4)
                .attr('fill','none');

            var currentColor = this.getRandomColor();

            this.rect.attr('stroke', currentColor);
            this.rectList.push(this.rect);
            this.rect.draw(e);

            var ul = document.getElementById("labels"),
                li = document.createElement("li");

            li.style.color = currentColor;
            li.style.fontWeight = "bold";
            li.appendChild(document.createTextNode("" + this.rect.id()));

            ul.appendChild(li);

        }.bind(this), false);
    }

    this.handleMouseUpImage = function () {
        this.drawing.on(
            'mouseup',
            function(e){
                this.rect.draw('stop', e)
            }.bind(this),
            false
        );
    }

    this.handleDocumentKeyPress = function () {
        document.addEventListener('keyup', function(e){

            e.keyCode === 16 && (this.isShiftPressed = false);
            e.keyCode === 17 && (this.isControlPressed = false);
            e.keyCode === 18 && (this.isAltPressed = false)

        }.bind(this));
    }
    this.handleDocumentKeyUp = function () {
        document.addEventListener('keydown', function(e){
            //Shift
            (e.keyCode === 16) && (this.isShiftPressed = true);

            //Ctrl
            (e.keyCode === 17) && (this.isControlPressed = true);
            (e.keyCode === 18) && (this.isAltPressed = true);
            (e.keyCode === 80) &&  console.log("previous Rect");

            //N => new rect
            if(e.keyCode === 78) {
                this.rect && this
                    .rect
                    .attr('stroke-width', 2);

                this.rect = this.drawing
                    .rect()
                    .attr('stroke-width',4)
                    .attr('fill','none');

                this.rectList.push(this.rect);
            };

            //Del
            (e.keyCode === 46) && this.rect.cancel();

            //D or Right arrow
            (e.keyCode === 68 || e.keyCode === 39) &&
            (this.isControlPressed
                    ? this.rect.attr('width', this.rect.attr('width') + 1)
                    : this.rect.attr('x', this.rect.attr('x') + 1));


            //A or Left arrow
            (e.keyCode === 65 || e.keyCode === 37) &&
            (this.isControlPressed
                    ? this.rect.attr('width', this.rect.attr('width') - 1)
                    : this.rect.attr('x', this.rect.attr('x') - 1));


            //W or Up arrow
            (e.keyCode === 87 || e.keyCode === 38) &&
            (this.isControlPressed
                    ? this.rect.attr('height', this.rect.attr('height') - 1)
                    : this.rect.attr('y', this.rect.attr('y') - 1));

            //S or Down arrow
            (e.keyCode === 83 || e.keyCode === 40) &&
            (this.isControlPressed
                    ? this.rect.attr('height',this.rect.attr('height') + 1)
                    : this.rect.attr('y', this.rect.attr('y') + 1));

        }.bind(this));

    }
}

new Application().init()
