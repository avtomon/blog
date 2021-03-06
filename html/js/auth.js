/**
 * Created by Александр on 04.03.15.
 */

$.ajax({
    async: false,
    url: "/html/js/notejs/note.min.js",
    dataType: "script"
});

const URL = '/router.php',
      SUBMIT_SELECTOR = '.save',
      ENABLED_SUBMIT_TIMEOUT = 500,
      SUBMIT_DISABLED_CLASS = 'disabled',
      error = window.showError || alert;

$.ajaxSetup({ cache: true });

$('body').on('click', '.login', function ()
{
    if (window.location.pathname != '/')
    {
        window.location = '/login?referer=' + window.location.pathname;
        return false;
    }
});

$('body').append('<div id="page_up"></div>');
var up = $('#page_up');
$(window).on('scroll', function ()
{
    if ($(this).scrollTop() > $(this).outerHeight()/2)
    {
        up.show();
    }
    else
    {
        up.hide();
    }
});

up.click( function ()
{
    $('html').animate({scrollTop: 0}, 300);
});

$.getScript('/html/js/SkipZ/skipz.min.js', function ()
{
    $.onZ('blur', 'form input[name], form select[name], form textarea[name]', function ()
    {
        if (!$(this).hasClass('invalid'))
        {
            if (!$(this).is('input[type=file], select'))
            {
                $(this).val($.trim($(this).val()));
            }
            if ($(this).hasClass('required') && !$(this).val())
            {
                $(this).addClass('invalid').parents('form').find(SUBMIT_SELECTOR).addClass('disabled');
                popupNotification('Не заполнены необходимые поля', true);
            }
            else
            {
                $(this).removeClass('invalid');
            }
        }

        return false;
    }, 100);

    $('html').onZ('keyup change', 'input.error, select.error, textarea.error', function ()
    {
        if ($(this).val())
        {
            $(this).removeClass('invalid');
        }

        return false;
    }, 102);

    $('body').onZ('blur', 'input.date', function ()
    {
        if (!$(this).hasClass('error'))
        {
            var v = $(this).val();
            if ('__.__.____' != v)
            {
                if (v)
                {
                    var va = v.split('.');
                    if (va.length == 3 && va[0] > 0 && va[0] < 32 && va[1] > 0 && va[1] < 13 && va[2] > 1900 && va[2] < 2038)
                    {
                        return true;
                    }
                    $(this).addClass('invalid').parents('form').find(SUBMIT_SELECTOR).addClass('disabled');
                    error('Неверный формат даты');
                    return false;
                }
            }
            else
            {
                if ($(this).hasClass('required'))
                {
                    $(this).addClass('invalid').parents('form').find(SUBMIT_SELECTOR).addClass('disabled');
                    error('Заполните поле даты');
                    return false;
                }
            }
        }
        return false;

    }, 90);
});

$.getScript('/html/js/jquery.cookie.min.js', function ()
{
    var l = $.cookie('login');
    if (l)
    {
        $('.register')
            .removeClass('no_display')
            .find('a')
            .eq(0)
            .text(l)
            .attr('href', '/profile/' + l);

        $('.mainmenu:not(.register)').addClass('no_display');
    }
    else
    {
        $('#mycomment').remove();
    }

    $('.logout').click( function ()
    {
        var params = {
            class: 'User',
            method: 'logout'
        };
        request(params, true, 'POST', function (data)
        {
            if (data.success == true)
            {
                $('.mainmenu.register').addClass('no_display').siblings().removeClass('no_display');
                $.cookie('login', undefined);
                $('#mycomment').remove();
            }
        });
    });
});

$.fn.hasAttr = function(name)
{
    return this.attr(name) !== undefined;
};

function parseISO8601 (dateString)
{
    var isoExp = /^\s*(\d\d)\.(\d\d)\.(\d{4})\s*$/,
        date = new Date(NaN), month,
        parts = isoExp.exec(dateString);

    if(parts) {
        month = +parts[2];
        date.setFullYear(parts[3], month - 1, parts[1]);
        if(month != date.getMonth() + 1) {
            date.setTime(NaN);
        }
    }
    return date;
}

$.ajax({
    async: false,
    url: "/html/js/jquery.maskedinput.min.js",
    dataType: "script",
    success: function ()
    {
        window.convertDateToUnixFormat = function (element)
        {
            var convert = function (el) {
                $(el).each(function ()
                {
                    var v = $(this).val();
                    if (/\d{2}\.\d{2}\.\d{4}/.test(v))
                    {
                        var d;
                        if (getInternetExplorerVersion() == -1)
                        {
                            d = $(this).val().split('.');
                            d = Math.floor(Date.parse(d[2] + '-' + d[1] + '-' + d[0]) / 1000) - 10800;
                        }
                        else
                        {
                            d = Math.floor(Date.parse(parseISO8601($(this).val())) / 1000);
                        }
                        $(this).unmask().val(d);
                    }
                    else
                    {
                        $(this).val('');
                    }
                });
            };
            if (element === undefined)
            {
                $('.date').each(function () {
                    convert(this);
                });
            }
            else
            {
                convert(element);
            }
        };

        window.convertDateToClientForm = function (val, with_time)
        {
            var convert = function (val, with_time)
            {
                if (val && parseInt(val) == val && !isNaN(parseInt(val)))
                {
                    var d = new Date(val * 1000), result;

                    if (with_time) {
                        result = d.toLocaleString().replace(/[^ -~]/g,'');
                        return result != 'Invalid Date' ? result : val;
                    }
                    else {
                        result = d.toLocaleDateString().replace(/[^ -~]/g,'');
                        return result != 'Invalid Date' ? result : val;
                    }
                }
                else
                {
                    return val;
                }
            };

            if (val !== undefined)
            {
                return convert(val, with_time)
            }
            else
            {
                $('.date').each(function ()
                {
                    if ($(this).hasAttr('value')) {
                        $(this).mask('99.99.9999').val(convert($(this).val(), with_time));
                    }
                    else {
                        $(this).text(convert($(this).text(), with_time));
                    }
                });
            }
        };

        window.convertTimeToUnixFormat = function (time)
        {
            if (time)
            {
                time = time.split(':');
                if (time[0] < 24 && time[1] < 60)
                {
                    return time[0] * 3600 + time[1] * 60;
                }
                else
                {
                    throw new Error('Неверный формат времени');
                }
            }
            else
            {
                return 0;
            }
        };
    }
});

function trim (str, charlist) {
    charlist = !charlist ? ' \\s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
    return str.replace(re, '');
}