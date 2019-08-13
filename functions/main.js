/* FUNCIONES */

// prueba creacion base de datos web
var db;

$(document).ready(init);

function OpenDataBase(){
    db = openDatabase('TestDB',1,'guardar test', 1024);
};

function init() {
    OpenDataBase();  
};


function FuncionesAltaMedioDePago(){
    // obtengo primer digito para setear la imagen de la tarjeta
    $("#nroTarjeta").on("input", function() {
        var nro = document.getElementById("nroTarjeta").value;
        $("#logoTarjeta").attr("src",IconoNroTarjeta(nro));
    });
       
    function IconoNroTarjeta(nro) {    
        var src = "";
        if (nro.charAt(0) == "4"){
            src = "../img/visa-icon.png";
        } else if (nro.charAt(0) == "5"){
            src = "../img/master-icon.png";
        }
        return src;
    };     
}

function FuncionesBajaMedioDePago() {

}

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

    if (page == "altaMedioPago.html") {
        $("#nroTarjeta").ready(FuncionesAltaMedioDePago);
    }

    if (page == "bajaMedioPago.html") {
        $("#nroTarjeta").ready(FuncionesBajaMedioDePago);
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

        $.ajax(settings).done(function (response) {
            sessionStorage.setItem("token", response.token);
            sessionStorage.setItem("id", response.id);       
            
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

    if (nroTarjeta.length == 16 ) {
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
    } else {
        ons.notification.alert('Debe ingresar 16 digitos.');
    }
    
};

function BajaMedioPago() {

    if (console.prompt("Desea eliminar su medio de pago ?")) {
        var settings = {
            "url": "http://oransh.develotion.com/tarjetas.php",
            "method": "DEL",
            "timeout": 0,
            "headers": {
              "token": sessionStorage.getItem("token"),
              "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
              "id": sessionStorage.getItem("id")
            }
          };
          
          $.ajax(settings).done(function (response) {
            console.log(response.responseJSON.mensaje);
          });
          
          $.ajax(settings).fail(function (response) {
            console.log(response.responseJSON.mensaje);
          });
    }; 
    
};





