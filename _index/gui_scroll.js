var state = { count: 0 };
var numb = 0;
document.addEventListener('DOMContentLoaded', function ()
{
    window.app = new Vue({
        el: '#gui_scroll',
        data: {
            show: true,
            knobs:
                [
                    { id: 0, name: 's0x', circle: null, value: 0 },
                    { id: 1, name: 's0y', circle: null, value: 0 },
                    { id: 2, name: 's0z', circle: null, value: 0 },

                    { id: 3, name: 's1x', circle: null, value: 0 },
                    { id: 4, name: 's1y', circle: null, value: 0 },
                    { id: 5, name: 's1z', circle: null, value: 0 },

                    { id: 6, name: 's2x', circle: null, value: 0 },
                    { id: 7, name: 's2y', circle: null, value: 0 },
                    { id: 8, name: 's2z', circle: null, value: 0 },

                    { id: 9, name: 's3x', circle: null, value: 0 },
                    { id: 10, name: 's3y', circle: null, value: 0 },
                    { id: 11, name: 's3z', circle: null, value: 0 },

                    { id: 12, name: 's4x', circle: null, value: 0 },
                    { id: 13, name: 's4y', circle: null, value: 0 },
                    { id: 14, name: 's4z', circle: null, value: 0 },

                    { id: 15, name: 's5x', circle: null, value: 0 },
                    { id: 16, name: 's5y', circle: null, value: 0 },
                    { id: 17, name: 's5z', circle: null, value: 0 },

                    { id: 18, name: 's6x', circle: null, value: 0 },
                    { id: 19, name: 's6y', circle: null, value: 0 },
                    { id: 20, name: 's6z', circle: null, value: 0 },

                    { id: 21, name: 's7x', circle: null, value: 0 },
                    { id: 22, name: 's7y', circle: null, value: 0 },
                    { id: 23, name: 's7z', circle: null, value: 0 },
                ]
        },
        mounted()
        {
            let knobs = document.getElementsByClassName("gui_knob comp");
            const precision = 360 * 10;
            for (let i = 0; i < knobs.length; i++)
            {
                console.log(knobs[i]);
                knobs[i].onmousewheel = function (e)
                {
                    e.preventDefault();
                    // console.log(e);
                    // console.log(i);
                    let deg = e.deltaY;
                    app.knobs[i].value += deg * 1 / precision;
                    app.knobs[i].value = Math.max(app.knobs[i].value, -1);
                    app.knobs[i].value = Math.min(app.knobs[i].value, 1);
                    app.knobs[i].value = Number(app.knobs[i].value.toFixed(3));

                    let element = knobs[i].children[1];
                    app.knobs[i].circle = element;
                    element.style.transition = 'transform 0ms ease-in-out';
                    element.style.transform = 'rotate(' + app.knobs[i].value * precision + 'deg)';
                };

                knobs[i].onclick = function (e)
                {
                    app.knobs[i].value = 0;
                    if (app.knobs[i].circle !== null)
                    {
                        app.knobs[i].circle.style.transition = 'transform 400ms ease-in-out';
                        app.knobs[i].circle.style.transform = 'rotate(0deg)';
                    }
                };
            }
        },
        methods:
        {
            handleScroll(e)
            {
                console.log(e);
                console.log(e.target.dataset.id);
                let deg = e.deltaY;
                e.path[2].style.transform = 'rotate(' + deg + 'deg)';
                // this.scrollY = window.scrollY;
            }
        }
    });
    console.log(app.message);
});