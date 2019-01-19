function generateImageList() {
    var container = document.querySelector('.swiper-wrapper')
    images.forEach(function (item, i) {
        var img = document.createElement('img'),
            div = document.createElement('div')

        div.className = 'swiper-slide';

        img.src = item;
        img.setAttribute('id', 'img' + i)
        img.className = 'thumb'

        div.appendChild(img)

        container.appendChild(div)
    })
}

generateImageList()

var swiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    speed: 700,
    slidesPerGroup: 5,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

function setImageClickHandlers() {

    for(let i=0;i<images.length;i++){

        document.getElementById("img"+i)
            .addEventListener(
                "click",
                function() {
                    console.log(
                        "click on img: " + this.id + " src:" + this.src
                    );
                    document.getElementById("rectNoClick")
                        .style
                        .backgroundImage= "url('"+ this.src + "')";
                }
            );

    }

}

setImageClickHandlers();

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split(''),
        color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

var isControlPressed = false, isAltPressed = false,
    isShiftPressed = false,
    drawing = new SVG('rectNoClick').size('100%', '100%'),
    rectList = [],
    rect = drawing.rect().attr('stroke-width',4).attr('fill','none');


drawing.on('mousedown', function(e){
    console.log(e);

    if(rect) rect.attr('stroke-width', 2);

    rect = drawing.rect().attr('stroke-width',4).attr('fill','none');

    var currentColor = getRandomColor();

    rect.attr('stroke', currentColor);
    rectList.push(rect);
    rect.draw(e);

    console.log("rectID: " + rect.id());

    var ul = document.getElementById("labels"),
        li = document.createElement("li");

    li.style.color = currentColor;
    li.style.fontWeight = "bold";
    li.appendChild(document.createTextNode("" + rect.id()));

    ul.appendChild(li);

}, false);

drawing.on('mouseup', function(e){ rect.draw('stop', e) }, false);

document.addEventListener('keyup', function(e){
    console.log("keyUp keyCode: " + e.keyCode);

    e.keyCode == 16 && (isShiftPressed = false);
    e.keyCode == 17 && (isControlPressed = false);
    e.keyCode == 18 && (isAltPressed = false)

});

//keyboard events
document.addEventListener('keydown', function(e){
    console.log("keyCode: " + e.keyCode);

    //Shift
    (e.keyCode === 16) && (isShiftPressed = true)

    //Ctrl

    (e.keyCode === 17) && (isControlPressed = true)
    (e.keyCode === 18) && (isAltPressed = true)
    (e.keyCode === 80) &&  console.log("previous Rect")

    if(e.keyCode === 13){
        //enter
        console.log(rect);
        console.log(rect.attr('x'));
        console.log(rect.attr('y'));
        console.log(rect.attr('width'));
        console.log(rect.attr('height'));
    }

    if(e.keyCode === 78) {
        //N => new rect
        console.log("create new rect");
        if(rect) rect.attr('stroke-width', 2);
        rect = drawing
            .rect()
            .attr('stroke-width',4)
            .attr('fill','none');

        rectList.push(rect);
    }

    if(e.keyCode === 46) {
        //Del
        console.log("delete current Rect");
        rect.cancel();
    }
    if(e.keyCode === 68 || e.keyCode === 39) {
        //D or Right arrow
        console.log("move right");
        if(isControlPressed){
            let w = rect.attr('width');
            rect.attr('width', w + 1);
        }else{
            let cx = rect.attr('x');
            rect.attr('x', cx + 1);
        }
    }
    if(e.keyCode === 65 || e.keyCode === 37) {
        //A or Left arrow
        console.log("move left");

        if(isControlPressed){
            let w = rect.attr('width');
            rect.attr('width', w - 1);
        }else{
            let cx = rect.attr('x');
            rect.attr('x', cx - 1);
        }
    }

    if(e.keyCode === 87 || e.keyCode === 38) {
        //W or Up arrow
        console.log("move up");

        if(isControlPressed){
            let h = rect.attr('height');
            rect.attr('height', h - 1);
        }else{
            let cy = rect.attr('y');
            rect.attr('y', cy - 1);
        }

    }
    if(e.keyCode === 83 || e.keyCode === 40) {
        //S or Down arrow
        console.log("move down");

        if(isControlPressed){
            let h = rect.attr('height');
            rect.attr('height', h + 1);
        }else{
            let cy = rect.attr('y');
            rect.attr('y', cy + 1);
        }
    }
});
