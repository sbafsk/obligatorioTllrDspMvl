/* FUNCIONES */

// creacion base de datos web
var db;

$(document).ready(function(){
    db = openDatabase('Test',1,'guardar test', 1024);
});



// funciones OnsenUI
window.fnLogin = {};


window.fnLogin.loadLogin = function (page) {
    var content = document.getElementById('contentLogin');
    content.load(page);
};

window.fn = {};

window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};

window.fn.load = function (page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
        .then(menu.close.bind(menu));
};

// funcion registro 
var login = function () {
    // obtengo los valores del form
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confPassword = document.getElementById('confPassword').value;

    // valido que los campos tengan valores
    if (username != "" && password != "" && confPassword != "") {
        if (password === confPassword) {
            // llamada al API para obtener y comparar los valores del usuario
            var settings = {
                "url": "http://oransh.develotion.com/usuarios.php",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                "data": {
                    "usuario": username,
                    "password": password
                }
            };

            $.ajax(settings).done(function (response) {
                console.log(response);
                // navego a la siguiente pagina
                ons.notification.alert('Ahora puedes ingresar');
                var contentLogin = document.getElementById('contentLogin');                
                contentLogin.load('login.html');
            });

            $.ajax(settings).fail(function (response) {
                console.log(response.mensaje);
                ons.notification.alert(response.mensaje);
            });
        } else {
            ons.notification.alert('Las contraseñas deben ser identicas.');
        }
    } else {
        ons.notification.alert('Los campos no pueden quedar en blanco.');
    }
};

// funcion de Login
var login = function () {
    // obtengo los valores del form
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // valido que los campos tengan valores
    if (username != "" && password != "") {
        // llamada al API para obtener y comparar los valores del usuario
        var settings = {
            "url": "http://oransh.develotion.com/login.php",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
                "usuario": username,
                "password": password
            }
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            // navego a la siguiente pagina
            ons.notification.alert('Congratulations!');
            var content = document.getElementById('contentLogin');
            content.load('appPage.html');
        });

        $.ajax(settings).fail(function (response) {
            console.log(response.mensaje);
            ons.notification.alert(response.mensaje);
        });
    } else {
        ons.notification.alert('Los campos no pueden quedar en blanco.');
    }
};