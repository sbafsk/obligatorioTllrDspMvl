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
// manejo pantalla inicio - Login/Registrar
window.fnLogin = {};

window.fnLogin.loadLogin = function (page) {
    var content = $("#contentLogin")[0];               
    content.load(page);
    

    // intente asignarle null, pero luego al valdar (id != null) siempre da true, JS es raro.
    if (sessionStorage.getItem("id") != "vacio") {
        sessionStorage.setItem("token", "vacio");
        sessionStorage.setItem("id", "vacio");
        console.log("Se limpia el sessionStorage");
        console.log(sessionStorage.getItem("id"));
    }
};


// manejo pantalla principal - Mapa/AB medio pago/cargar saldo
window.fn = {};

window.fn.open = function () {    
    var menu = $("#menu")[0];
    menu.open();
};

window.fn.load = function (page) {

    var content = $("#content")[0];
    var menu = $("#menu")[0];
    content.load(page)
        .then(menu.close.bind(menu));


    switch (page) {   
        case "home.html":
            
            break;     
        case "misBusquedas.html":            
            
            break;
        case "escanearProducto.html":
            
            break;
        
        default:
            break;
    }
};


// funcion de Login
function Login() {
    // obtengo los valores del form
    var emailImpt = $("#email").val();
    var passwordImpt = $("#password").val();
    try {

        if (emailImpt === "") {
            throw new Error("El email no puede estar vacio");
        }
        if (passwordImpt === "") {
            throw new Error("La contraseña no puede estar vacio");
        }


        $.ajax({
            url: "https://tiendanatural2020.herokuapp.com/api/user/login",
            type: "POST", //forma de envio de datos 
            dataType: "JSON", //tipo de dato de retorno
            data: JSON.stringify({ email: emailImpt, password: passwordImpt }),
            contentType: 'application/json',
            success: function () {
                var content = $("#contentLogin")[0];                
                content.load("appPage.html");

            },
            error: function (json) {               
                console.log(json.responseJSON.name);   
                ons.notification.alert(json.responseJSON.name + " : <br> Verifique mail y contraseña."); 
            }
        });

    } catch (e) {
        alert(e.message);
    }
   
};


// funcion registro 
function Registrar() {
    // obtengo los valores del form
    var emailImpt = $("#email").val();
    var passwordImpt = $("#password").val();
    var confPassword = $("#confPassword").val();

    try {
        if (emailImpt === "") {
            throw new Error("El email no puede estar vacio");
        }
        if (passwordImpt === "") {
            throw new Error("La contraseña no puede estar vacio");
        }
        if (confPassword === "") {
            throw new Error("La confirmacion de contraseña no puede estar vacio");
        }
        if (passwordImpt != confPassword) {
            throw new Error("Las contraseñas debe coincidir");
        }
        
        var datos = { email: emailImpt, password: passwordImpt }

        $.ajax({
            url: "https://tiendanatural2020.herokuapp.com/api/user/register",
            type: "POST", //forma de envio de datos 
            dataType: "JSON", //tipo de dato de retorno
            data: JSON.stringify(datos),
            contentType: 'application/json',
            success: function () {  
                ons.notification.alert("Registro con Exito<br>Ahora puedes ingresar");
                var contentLogin = $("#contentLogin")[0];
                contentLogin.load("login.html");
            },
            error: function (json) {
                var jR = json.responseJSON;
                console.log(jR);
                if(jR.reason) {
                    console.log(jR.reason); 
                    ons.notification.alert(jR.reason);  
                } else {
                    console.log(jR.data.error.errors.email.message); 
                    ons.notification.alert(jR.data.error.errors.email.message); 
                }
                      

            }
        });

    } catch (error) {
        ons.notification.alert(error.message);
    }
   
};

// buscar producto
function BuscarProducto() {
    
    var filtro = $("#productoInp").val(); 
    $("#resultadoBusqueda").html(""); 
    
    try{        

        $.ajax({        
            url:"http://tiendanatural2020.herokuapp.com/api/product/all",
    
            type:"GET",
    
            dataType:"Json",
    
            contentType:'application/json',           
    
            success: function(response){              
                var found = false;              

                $.each(response,function(i,value){  

                    if(producto === "" || value.name.toUpperCase().includes(filtro.toUpperCase())) {  

                        var prod = "<ons-list modifier='inset' style='margin-bottom: 1vh'>"
                            +"  <img src='"+value.photo+"' style='width: 100%'>" 
                            +"  <ons-list-item><div class='center'><b>"+value.name+"</b></div></ons-list-item>"                         
                            +"  <ons-list-item><div class='right'>$"+value.price+"</div></ons-list-item>"
                            +"  <ons-list-item modifier='longdivider'>"+value.description+"</ons-list-item>"
                            +"  <ons-list-item modifier='longdivider'>En "+value.branches.length+" sucursales.</ons-list-item>"
                            +"</ons-list>"; 
                        $("#resultadoBusqueda").append(prod);                  
                        found = true;
                    }
                });

                if(!found) {
                    ons.notification.alert("No se encontraron productos");
                }

            },            
            error: function(response) {
                console.log("failConsultarProducots");
                console.log(response.mensaje);
                ons.notification.alert("Hubo un problema para acceder al listado de productos.");
            }
        })
        

    } catch (error) {
        ons.notification.alert(error.message);
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
        var nro = $("#nroTarjeta").val();
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






