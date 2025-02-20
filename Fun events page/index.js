var c = document.getElementById("rainbow");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#FFCE2E";
var animations = [];
var circles = [];

var colorPicker = (function () {
    var colors = ["#FFCE2E", "#0093D9", "#00E9A8", "#38E54D"];
    var index = 0;
    function next() {
        index = index++ < colors.length - 1 ? index : 0;
        return colors[index];
    }
    function current() {
        return colors[index]
    }
    return {
        next: next,
        current: current
    }
})();

function removeAnimation(animation) {
    var index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
}

function calcPageFillRadius(x, y) {
    var l = Math.max(x - 0, cW - x);
    var h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

function addClickListeners() {
    document.addEventListener("touchstart", handleEvent);
    document.addEventListener("mousedown", handleEvent);
};

function handleEvent(e) {
    if (e.touches) {
        e.preventDefault();
        e = e.touches[0];
    }
    var currentColor = colorPicker.current();
    var nextColor = colorPicker.next();
    var targetR = calcPageFillRadius(e.pageX, e.pageY);
    var rippleSize = Math.min(200, (cW * .4));
    var minCoverDuration = 1750;

    var pageFill = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: nextColor
    });
    var fillAnimation = anime({
        targets: pageFill,
        r: targetR,
        duration: Math.max(targetR / 2, minCoverDuration),
        easing: "easeOutQuart",
        complete: function () {
            bgColor = pageFill.fill;
            removeAnimation(fillAnimation);
        }
    });

    var ripple = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: currentColor,
        stroke: {
            width: 3,
            color: currentColor
        },
        opacity: 1
    });
    var rippleAnimation = anime({
        targets: ripple,
        r: rippleSize,
        opacity: 0,
        easing: "easeOutExpo",
        duration: 900,
        complete: removeAnimation
    });

    var particles = [];
    for (var i = 0; i < 32; i++) {
        var particle = new Circle({
            x: e.pageX,
            y: e.pageY,
            fill: currentColor,
            r: anime.random(24, 48)
        })
        particles.push(particle);
    }
    var particlesAnimation = anime({
        targets: particles,
        x: function (particle) {
            return particle.x + anime.random(rippleSize, -rippleSize);
        },
        y: function (particle) {
            return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
        },
        r: 0,
        easing: "easeOutExpo",
        duration: anime.random(1000, 1300),
        complete: removeAnimation
    });
    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
}

function extend(a, b) {
    for (var key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}

var Circle = function (opts) {
    extend(this, opts);
}

Circle.prototype.draw = function () {
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
        ctx.strokeStyle = this.stroke.color;
        ctx.lineWidth = this.stroke.width;
        ctx.stroke();
    }
    if (this.fill) {
        ctx.fillStyle = this.fill;
        ctx.fill();
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
}

var animate = anime({
    duration: Infinity,
    update: function () {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
        animations.forEach(function (anim) {
            anim.animatables.forEach(function (animatable) {
                animatable.target.draw();
            });
        });
    }
});

var resizeCanvas = function () {
    cW = document.querySelector('.header').offsetWidth;
    cH = document.querySelector('.header').offsetHeight;
    c.width = cW * devicePixelRatio;
    c.height = cH * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
};

(function init() {
    resizeCanvas();
    if (window.CP) {
        // CodePen's loop detection was causin' problems
        // and I have no idea why, so...
        window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;
    }
    window.addEventListener("resize", resizeCanvas);
    addClickListeners();
    if (!!window.location.pathname.match(/fullcpgrid/)) {
        startFauxClicking();
    }
    handleInactiveUser();
})();

function handleInactiveUser() {
    var inactive = setTimeout(function () {
        fauxClick(cW / 2, cH / 2);
    }, 5000);

    function clearInactiveTimeout() {
        clearTimeout(inactive);
        document.removeEventListener("mousedown", clearInactiveTimeout);
        document.removeEventListener("touchstart", clearInactiveTimeout);
    }

    document.addEventListener("mousedown", clearInactiveTimeout);
    document.addEventListener("touchstart", clearInactiveTimeout);
}

function startFauxClicking() {
    setTimeout(function () {
        fauxClick(anime.random(cW * .2, cW * .8), anime.random(cH * .2, cH * .8));
        startFauxClicking();
    }, anime.random(200, 900));
}

function fauxClick(x, y) {
    var fauxClick = new Event("mousedown");
    fauxClick.pageX = x;
    fauxClick.pageY = y;
    document.dispatchEvent(fauxClick);
}

// Automatically click the header part every 10 seconds to show the animation
// click randomly on the header part
setInterval(function () {
    var header = document.querySelector('.header');
    var headerRect = header.getBoundingClientRect();
    var x = headerRect.left + Math.random() * headerRect.width;
    var y = headerRect.top + Math.random() * headerRect.height;
    fauxClick(x, y);
}, 10000);




// Event counter animation
function animateCounter(el, start, end, duration, html) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        el.innerHTML = `${Math.floor(progress * (end - start) + start)}${html}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

const totalEventsEl = document.getElementById("total-events");
// animateCounter(totalEventsEl, 1, 17, 800, "+ <rt>Total Events</rt>");

const totalFunEventsEl = document.getElementById("total-fun-events");
// animateCounter(totalFunEventsEl, 1, 6, 800, "+ <rt>Fun Events</rt>");

// start the animation when the div is intersected

const handleEventsCounterIntersection = (entries) => {
    entries.forEach((entrie) => {
        if (entrie.isIntersecting) {
            animateCounter(totalEventsEl, 1, 17, 800, "+ <rt>Total Events</rt>");
            animateCounter(totalFunEventsEl, 1, 6, 800, "+ <rt>Fun Events</rt>");
        }
    })
};

const eventsCounterObserver = new IntersectionObserver(handleEventsCounterIntersection, {});
eventsCounterObserver.observe(totalEventsEl);








// Balloons
const balloonContainer = document.getElementById("balloon-container");

function random(num) {
    return Math.floor(Math.random() * num);
}

function getRandomStyles() {
    var r = random(255);
    var g = random(255);
    var b = random(255);
    var mt = random(200);
    var ml = random(50);
    var dur = random(5) + 5;
    return `
  background-color: rgba(${r},${g},${b},0.7);
  color: rgba(${r},${g},${b},0.7); 
  box-shadow: inset -7px -3px 10px rgba(${r - 10},${g - 10},${b - 10},0.7);
  margin: ${mt}px 0 0 ${ml}px;
  animation: float ${dur}s ease-in infinite
  `;
}

function createBalloons(num) {
    for (var i = num; i > 0; i--) {
        var balloon = document.createElement("div");
        balloon.className = "balloonB";
        balloon.style.cssText = getRandomStyles();
        balloonContainer.append(balloon);
    }
}

function removeBalloons() {
    balloonContainer.style.opacity = 0;
    setTimeout(() => {
        balloonContainer.remove()
    }, 500)
}

window.addEventListener("load", () => {
    createBalloons(30)
});

window.addEventListener("click", () => {
    removeBalloons();
});
