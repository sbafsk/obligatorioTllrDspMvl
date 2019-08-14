/* FUNCIONES */

// prueba creacion base de datos web
var db;

$(document).ready(init);

function OpenDataBase() {
    db = openDatabase('TestDB', 1, 'guardar test', 1024);
};

function init() {
    OpenDataBase();
};



// funciones OnsenUI
// manejo pantalla inicia Login/Registrar
window.fnLogin = {};

window.fnLogin.loadLogin = function (page) {
    var content = document.getElementById('contentLogin');
    content.load(page);
    // intente asignarle null, pero luego al valdar (id != null) siempre da true, JS es raro.
    if (sessionStorage.getItem("id") != "vacio") {
        sessionStorage.setItem("token", "vacio");
        sessionStorage.setItem("id", "vacio");
        console.log("Se limpia el sessionStorage");
        console.log(sessionStorage.getItem("id"));
    }
};


// manejo pantalla principal Mapa/AB medio pago/cargar saldo
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

    if (page == "altaMedioPago.html" || page == "bajaMedioPago.html") {
        $("#nroTarjeta").ready(MostrarIconoTarjeta);
    }

    if (page == "bajaMedioPago.html") {
        ObtenerSaldo();
    }

};


// funcion de Login
function Login() {
    // obtengo los valores del form
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // valido que los campos tengan valores
    if (username != "" && password != "") {
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

        $.ajax(settings)
            .done(function (response) {
                console.log("doneLogin");
                sessionStorage.setItem("token", response.token);
                sessionStorage.setItem("id", response.id);

                var content = document.getElementById('contentLogin');
                content.load('appPage.html');
            })

            .fail(function (response) {
                console.log("failLogin");
                console.log(response.responseJSON.mensaje);
                ons.notification.alert(response.responseJSON.mensaje);
            });
    } else {
        ons.notification.alert('Los campos no pueden quedar en blanco.');
    }
};


// funcion registro 
function Registrar() {
    // obtengo los valores del form
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confPassword = document.getElementById('confPassword').value;

    // valido que los campos tengan valores
    if (username != "" && password != "" && confPassword != "") {

        if (password === confPassword) {
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

            $.ajax(settings)
                .done(function (response) {
                    console.log("doneReg");
                    ons.notification.alert('Registro con Exito<br>Ahora puedes ingresar');
                    var contentLogin = document.getElementById('contentLogin');
                    contentLogin.load('login.html');
                })

                .fail(function (response) {
                    console.log("failReg");
                    console.log(response.responseJSON.mensaje);
                    ons.notification.alert(response.responseJSON.mensaje);
                });
        } else {
            ons.notification.alert('Las contraseñas deben ser identicas.');
        }
    } else {
        ons.notification.alert('Los campos no pueden quedar en blanco.');
    }
};


function MostrarIconoTarjeta() {
    // obtengo primer digito para setear la imagen de la tarjeta
    $("#nroTarjeta").on("input", function () {
        var nro = document.getElementById("nroTarjeta").value;
        $("#logoTarjeta").attr("src", IconoTarjeta(nro));
    });
}


function IconoTarjeta(nro) {
    var src = "";
    if (nro.charAt(0) == "4") {
        src = "../img/visa-icon.png";
    } else if (nro.charAt(0) == "5") {
        src = "../img/master-icon.png";
    }
    return src;
};


// alta medio de pago
function AltaMedioPago() {
    var nroTarjeta = document.getElementById('nroTarjeta').value;
    // el numero de la tarjeta deben ser 16 digitos
    if (nroTarjeta.length == 16) {
        var settings = {
            "url": "http://oransh.develotion.com/tarjetas.php",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "token": sessionStorage.getItem("token"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
                "id": sessionStorage.getItem("id"),
                "numero": nroTarjeta
            }
        };

        $.ajax(settings)
            .done(function (response) {
                console.log("doneAlta");
                console.log(response.mensaje);
                ons.notification.alert(response.mensaje);
            })
            .fail(function (response) {
                console.log("failAlta");
                console.log(response.responseJSON.mensaje);
                ons.notification.alert(response.responseJSON.mensaje);
            });
    } else {
        ons.notification.alert('Debe ingresar 16 digitos.');
    }

};


function FuncionesBajaMedioDePago() {

}

function MostrarNumeroTarjeta(nro) {

    $("#nroTarjeta").val(nro);
    $("#nroTarjeta").prop("disabled", true);
    $("#logoTarjeta").attr("src", IconoTarjeta(nro));

    if (nro.includes("arjeta")) {
        $('#EliminarMedioPago').prop("disabled", true)
    }
}

function BajaMedioPago() {

    if (confirm("Desea eliminar su medio de pago ?")) {
        var settings = {
            "url": "http://oransh.develotion.com/tarjetas.php",
            "method": "DELETE",
            "timeout": 0,
            "headers": {
                "token": sessionStorage.getItem("token"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
                "id": sessionStorage.getItem("id")
            }
        };

        $.ajax(settings)
            .done(function (response) {
                console.log("doneBaja");
                console.log(response.mensaje);
                ons.notification.alert(response.mensaje);
                MostrarNumeroTarjeta("Tarjeta eliminada")
            })

            .fail(function (response) {
                console.log("failBaja");
                console.log(response);
            });
    };

};


function ObtenerSaldo() {
    var settings = {
        "url": "http://oransh.develotion.com/tarjetas.php",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "token": sessionStorage.getItem("token"),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "data": {
            "id": sessionStorage.getItem("id")
        }
    };

    $.ajax(settings)
        .done(function (response) {
            console.log("doneGet");
            console.log(response.numero);
            MostrarNumeroTarjeta(response.numero);

        })
        .fail(function (response) {
            console.log("failGet");
            console.log(response.responseJSON.mensaje);
            MostrarNumeroTarjeta(response.responseJSON.mensaje);
        });
}




