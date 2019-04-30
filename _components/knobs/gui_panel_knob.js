document.addEventListener('DOMContentLoaded', function ()
{
    window.app = new Vue({
        el: '#gui-panel-knob',
        data: {
            show: true,
            knobs:
                [
                    { id: 0, name: 's0x', circle: null, value: 0, active: true },
                    { id: 1, name: 's0y', circle: null, value: 0, active: true },
                    { id: 2, name: 's0z', circle: null, value: 0, active: true },

                    { id: 3, name: 's1x', circle: null, value: 0, active: true },
                    { id: 4, name: 's1y', circle: null, value: 0, active: true },
                    { id: 5, name: 's1z', circle: null, value: 0, active: true },

                    { id: 6, name: 's2x', circle: null, value: 0, active: true },
                    { id: 7, name: 's2y', circle: null, value: 0, active: true },
                    { id: 8, name: 's2z', circle: null, value: 0, active: true },

                    { id: 9, name: 's3x', circle: null, value: 0, active: true },
                    { id: 10, name: 's3y', circle: null, value: 0, active: false },
                    { id: 11, name: 's3z', circle: null, value: 0, active: false },

                    { id: 12, name: 's4x', circle: null, value: 0, active: false },
                    { id: 13, name: 's4y', circle: null, value: 0, active: false },
                    { id: 14, name: 's4z', circle: null, value: 0, active: false },

                    { id: 15, name: 's5x', circle: null, value: 0, active: false },
                    { id: 16, name: 's5y', circle: null, value: 0, active: false },
                    { id: 17, name: 's5z', circle: null, value: 0, active: false },

                    { id: 18, name: 's6x', circle: null, value: 0, active: false },
                    { id: 19, name: 's6y', circle: null, value: 0, active: false },
                    { id: 20, name: 's6z', circle: null, value: 0, active: false },

                    { id: 21, name: 's7x', circle: null, value: 0, active: false },
                    { id: 22, name: 's7y', circle: null, value: 0, active: false },
                    { id: 23, name: 's7z', circle: null, value: 0, active: false },
                ]
        },
        mounted()
        {
            let knobs = document.getElementsByClassName("gui_knob comp");
            const precision = 360 * 10;
            for (let i = 0; i < knobs.length; i++)
            {
                console.log(knobs[i]);

                let element = knobs[i].children[1];
                this.knobs[i].circle = element;

                if (this.knobs[i].active === false)
                {
                    this.knobs[i].circle.parentElement.style.opacity = "0.2";
                }

                knobs[i].onmousewheel = function (e)
                {
                    e.preventDefault();
                    if (app.knobs[i].active === true)
                    {
                        // console.log(e);
                        // console.log(i);
                        let deg = e.deltaY;
                        app.knobs[i].value += deg * 1 / precision;
                        app.knobs[i].value = Math.max(app.knobs[i].value, -1);
                        app.knobs[i].value = Math.min(app.knobs[i].value, 1);
                        app.knobs[i].value = Number(app.knobs[i].value.toFixed(3));
                        element.style.transform = 'rotate(' + app.knobs[i].value * precision + 'deg)';
                    }
                };

                knobs[i].onclick = function (e)
                {
                    app.knobs[i].value = 0;
                    app.knobs[i].active = !app.knobs[i].active;

                    if (app.knobs[i].circle !== null)
                    {
                        if (app.knobs[i].active === false)
                        {
                            console.log(app.knobs[i].circle);
                            app.knobs[i].circle.style.transition = 'all 600ms ease-in-out';
                            app.knobs[i].circle.style.transform = 'rotate(0deg)';
                            app.knobs[i].circle.parentElement.style.opacity = "0.2";
                            app.knobs[i].circle.parentElement.style.transition = 'all 600ms ease-in-out';
                        }
                        else
                        {
                            app.knobs[i].circle.style.transition = 'all 0ms ease-in-out';
                            app.knobs[i].circle.parentElement.style.opacity = "1.0";
                            app.knobs[i].circle.parentElement.style.transition = 'all 600ms ease-in-out';
                        }
                    }
                };
            }
        },
        methods:
        {
        }
    });
});