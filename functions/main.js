/* FUNCIONES */

// prueba creacion base de datos web
var db;

$(document).ready(init);

function OpenDataBase(){
    db = openDatabase('Test',1,'guardar test', 1024);
};

function init() {
    OpenDataBase();

    // evento espero digito de tarjeta
    $("#nroTarjeta").on('input', function() {
        var nro = document.getElementById('nroTarjeta').value;
        console.log("starting digit " + nro.charAt(0));
        $("#logoTarjeta").attr("src",IconoNroTarjeta(nro));
    });
};


// modifico logo tarjeta
function IconoNroTarjeta(nro) {    
    var src = "";
    if (nro.charAt(0) == 4){
        src = "../img/visa-icon.png";
    } else if (nro.charAt(0) == 5){
        src = "../img/master-icon.png";
    }
    return src;
};


// funciones OnsenUI
// manejo pantalla inicia Login/Registrar
window.fnLogin = {};

window.fnLogin.loadLogin = function (page) {
    var content = document.getElementById('contentLogin');
    content.load(page);
    if(sessionStorage.getItem("id") != null) {
        sessionStorage.setItem("token", null);
        sessionStorage.setItem("id", null);
        console.log("Se limpia el sessionStorage");
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

        $.ajax(settings).done(function (response) {
            console.log(response);
            sessionStorage.setItem("token", response.token);
            sessionStorage.setItem("id", response.id);
            console.log(sessionStorage.getItem("id"));
            console.log(sessionStorage.getItem("token"));
            ons.notification.alert('Bienvenido !');
            var content = document.getElementById('contentLogin');
            content.load('appPage.html');
        });

        $.ajax(settings).fail(function (response) {
            console.log(response.responseJSON.mensaje);
            ons.notification.alert(response.responseJSON.mensaje);
        });
    } else {
        ons.notification.alert('Los campos no pueden quedar en blanco.');
    }
};


// funcion registro 
function Registar() {
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

            $.ajax(settings).done(function (response) {   
                ons.notification.alert('Registro con Exito<br>Ahora puedes ingresar');
                var contentLogin = document.getElementById('contentLogin');                
                contentLogin.load('login.html');
            });

            $.ajax(settings).fail(function (response) {
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


function AltaMedioPago() {

    var nroTarjeta = document.getElementById('nroTarjeta').value;
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
      
      $.ajax(settings).done(function (response) {
        console.log(response.responseJSON.mensaje);
      });
      
      $.ajax(settings).fail(function (response) {
        console.log(response.responseJSON.mensaje);
      });
};





