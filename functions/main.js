/* FUNCIONES */

// prueba creacion base de datos web
var db;

var map;

$(document).ready(init);

function OpenDataBase() {
    db = openDatabase("TestDB", 1, "guardar test", 1024);
};

function init() {
    OpenDataBase();
};



// funciones OnsenUI
// manejo pantalla inicia Login/Registrar
window.fnLogin = {};

window.fnLogin.loadLogin = function (page) {
    var content = document.getElementById("contentLogin");
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
    var menu = document.getElementById("menu");
    menu.open();
};

window.fn.load = function (page) {

    var content = document.getElementById("content");
    var menu = document.getElementById("menu");
    content.load(page)
        .then(menu.close.bind(menu));


    switch (page) {
        case "altaMedioPago.html":
            $("#nroTarjeta").ready(MostrarIconoTarjeta);
            ObtenerSaldo("alta");
            break;
        case "bajaMedioPago.html":
            $("#nroTarjeta").ready(MostrarIconoTarjeta);
            ObtenerSaldo("baja");
            break;
        case "cargarSaldo.html":
            ObtenerSaldo("cargar");
            break;
        case "home.html":
            ConsultarMonopatines();
            break;
        default:
            break;
    }
};


// funcion de Login
function Login() {
    // obtengo los valores del form
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

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

                var content = document.getElementById("contentLogin");
                content.load("appPage.html");
                ConsultarMonopatines();

            })

            .fail(function (response) {
                console.log("failLogin");
                console.log(response.responseJSON.mensaje);
                ons.notification.alert(response.responseJSON.mensaje);
            });
    } else {
        ons.notification.alert("Los campos no pueden quedar en blanco.");
    }
};


// funcion registro 
function Registrar() {
    // obtengo los valores del form
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confPassword = document.getElementById("confPassword").value;

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
                    ons.notification.alert("Registro con Exito<br>Ahora puedes ingresar");
                    var contentLogin = document.getElementById("contentLogin");
                    contentLogin.load("login.html");
                })

                .fail(function (response) {
                    console.log("failReg");
                    console.log(response.responseJSON.mensaje);
                    ons.notification.alert(response.responseJSON.mensaje);
                });
        } else {
            ons.notification.alert("Las contraseñas deben ser identicas.");
        }
    } else {
        ons.notification.alert("Los campos no pueden quedar en blanco.");
    }
};


function MostrarMapa() {
    console.log("MostrarMapa");
    navigator.geolocation.getCurrentPosition(CrearMapa);

}

function CrearMapa(pos) {
    console.log("CrearMapa");
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    }).addTo(map);

    // ubicacion actual
    //L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map)
    //    .bindPopup("Mi ubicacion.")
    //    .openPopup();

}

function CentrarMapa(lat, lon) {
    map = L.map("map").setView([lat, lon], 13);

    // ubicacion API
    L.marker([lat, lon]).addTo(map)
        .bindPopup("Mi ubicacion.")
        .openPopup();
}


function ConsultarMonopatines() {
    var settings = {
        "url": "http://oransh.develotion.com/monopatines.php",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "token": sessionStorage.getItem("token")
        }
    };

    $.ajax(settings)
        .done(function (response) {
            console.log("doneMP");
            console.log(response);
            MostrarMapa();
            MostrarMonopatines(response);
        })
        .fail(function (response) {
            console.log("failMP");
            console.log(response.responseJSON.mensaje);
            ons.notification.alert("No se pueden obtener los monopatines.");
        });
}

function MostrarMonopatines(response) {

    var myLat = response.centrado.latitud;
    var myLon = response.centrado.longitud;
    var monopatinesCercanos = [];
    var distancias = [];

    CentrarMapa(myLat, myLon);    

    // obtengo distancias
    response.monopatines.forEach(mp => {
        distancias.push(FormulaHaversine([mp.latitud, mp.longitud], [myLat, myLon], mp.codigo));
    });

    distancias.sort();    

    // obtengo los 5 mas cercanos
    for (let i = 0; i < 5; i++) {
        response.monopatines.forEach(mp => {
            if (mp.codigo == distancias[i][1]) {
                monopatinesCercanos.push(mp);
            };
        });        
    };

    console.log(monopatinesCercanos);

    monopatinesCercanos.forEach(mpC => {
        L.marker([mpC.latitud, mpC.longitud]).addTo(map)
            .bindPopup(VentanaMonopatin(mpC))
            .on('popupopen', function () {
                console.log("popup opened !");
                $(".desbloquear").on("click", function () {
                    var codigo = $("#monopatin #cod").text();
                    var bateria = $("#monopatin #bat").text();
                    console.log("monopatin " + codigo + " " + bateria);
                    if (bateria > 4) {
                        DesbloquearMonopatin();
                    } else {
                        ons.notification.alert("Bateria menor al 5%");
                    }
                });
            });;
    });



}

function FormulaHaversine(coords1, coords2, cod) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return [d,cod];
}

function VentanaMonopatin(monopatin) {
    var ventana = "<div id='monopatin'><p>Monopatin <span id='cod'>" + monopatin.codigo + "</span></p>";
    ventana += "<p>Bateria restante <span id='bat'>" + monopatin.bateria + "</span>%</p>";
    ventana += "<button class='desbloquear'>Desbloquear</button></div>";

    return ventana;
}


function DesbloquearMonopatin() {
    // TO-DO    
    // validar saldo [salta si no tiene tarjeta]
    // modificar ventana monopatin    
    // setear monopatin en uso [manejar con sessionStorage?]

}

function BloquearMonopatin() {
    // TO-DO
    // finalizar calculo de costo
    // restar saldo
    // setear monopatin como libre [manejar con sessionStorage?]
    // guardar registro para historial
}





// alta medio de pago
function AltaMedioPago() {
    // var nroTarjeta = document.getElementById("nroTarjeta").value;
    var nroTarjeta = $("#nroTarjeta").val();
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
                $("#nroTarjeta").prop("disabled", true);
                $("#AgregarMedioPago").prop("disabled", true);
                ons.notification.alert(response.mensaje);

            })
            .fail(function (response) {
                console.log("failAlta");
                console.log(response.responseJSON.mensaje);
                ons.notification.alert(response.responseJSON.mensaje);
            });
    } else {
        ons.notification.alert("Debe ingresar 16 digitos.");
    }

};


function BajaMedioPago() {

    ons.notification.confirm({
        message: "Desea eliminar su medio de pago?",
        callback: function (answer) {
            if (answer) {
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
                        MostrarNumeroTarjeta("Tarjeta eliminada")
                        ons.notification.alert(response.mensaje);
                    })

                    .fail(function (response) {
                        console.log("failBaja");
                        console.log(response);
                    });
            };
        }
    });
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


function MostrarNumeroTarjeta(nro) {

    $("#nroTarjeta").val(nro);

    $("#nroTarjeta").prop("disabled", true);

    $("#AgregarMedioPago").prop("disabled", true);

    $("#EliminarMedioPago").prop("disabled", false);

    $("#logoTarjeta").attr("src", IconoTarjeta(nro));

    // valido si recibo un mensaje y no el nro de tarjeta.
    if (nro.includes("arjeta")) {
        $("#EliminarMedioPago").prop("disabled", true)
    }
}


function ObtenerSaldo(option) {
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
            console.log(response);
            switch (option) {
                case "alta":
                    MostrarNumeroTarjeta(response.numero);
                    ons.notification.alert("Ya cuenta con un medio de pago.");
                    break;
                case "baja":
                    MostrarNumeroTarjeta(response.numero);
                    break;
                case "cargar":
                    $("#saldoActual").val(response.saldo);
                    break;
                default:
                    break;
            }


        })
        .fail(function (response) {
            console.log("failGet");
            console.log(response.responseJSON.mensaje);
            switch (option) {
                case "baja":
                    MostrarNumeroTarjeta(response.responseJSON.mensaje);
                    break;
                case "cargar":
                    $("#AgregarSaldo").prop("disabled", true);
                    ons.notification.alert(response.responseJSON.mensaje);
                    break;
                default:
                    break;
            }
        });
}


function ModificarSaldo() {

    var saldo = $("#saldoModificar").val();

    if (saldo > 0 && saldo % 100 == 0) {
        var settings = {
            "url": "http://oransh.develotion.com/tarjetas.php",
            "method": "PUT",
            "timeout": 0,
            "headers": {
                "token": sessionStorage.getItem("token"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
                "id": sessionStorage.getItem("id"),
                "saldo": saldo
            }
        };

        $.ajax(settings)
            .done(function (response) {
                console.log("donePut");
                console.log(response);
                $("#saldoActual").val(response.saldo);
                $("#saldoModificar").val("");
                ons.notification.alert(response.mensaje);
            })
            .fail(function (response) {
                console.log("failPut");
                console.log(response.responseJSON.mensaje);

            });
    } else {
        ons.notification.alert("El monto debe ser multiplo de 100.");
    }

}






