/* FUNCIONES */


var db = null;
var dbBusquedaID = 0;
var map;
sessionStorage.setItem("id", "123");

$(document).ready(init);

function init() {
    // creacion base de datos web
    if(db === null){
        db = openDatabase("tiendaOnlineDB","1.0","Tienda Online","2*1024*1024"); 
        
    } 
    if(db!==null){
        db.transaction(function (tx){
            tx.executeSql("DROP TABLE IF EXISTS Busquedas");  
            tx.executeSql("CREATE TABLE Busquedas (descripcion,fecha,id unique)");  
        });
    }
};

function GuardarBusqueda(){
    
    var desc = $("#descripcionImp").val()

    if(desc === "") {
        ons.notification.alert("Ingrese una descripcion."); 
    } else {
        if(guardarDatosBusqueda(desc)) {
            ons.notification.alert("La busqueda fue guardada correctamente.");  
        } else {
            ons.notification.alert("Hubo un problema al intentar guardar la busqueda."); 
        }
    }
    
}

function guardarDatosBusqueda(descripcion){
    var fecha = new Date();
   
    try {
        db.transaction(function (tx){
            tx.executeSql("Insert into Busquedas values (?,?,?)",[descripcion,fecha.toLocaleString(),dbBusquedaID]);
            dbBusquedaID++;
        });
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
        
    
}

function ListarDatos(){    
    db.transaction(function (tx){
        tx.executeSql("Select * from Busquedas where id=? order by fecha desc", [1], function (tx,results){
            if(results.rows.length >0){
                return results;
                /*$.each(results.rows, function (i,value){
                    alert(value.nombre);
                    alert(value.apellido);
                    alert(value.email);
                })*/
            }
        })
  
    })
};
// funciones OnsenUI
// manejo pantalla inicio - Login/Registrar
window.fnLogin = {};

window.fnLogin.loadLogin = function (page) {       

    var content = $("#contentLogin")[0];               
    content.load(page);
    

    // intente asignarle null, pero luego al validar (id != null) siempre da true, JS es raro.
    if (sessionStorage.getItem("id") != "vacio") {
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

    if (sessionStorage.getItem("id") === "vacio") {
        ons.notification.alert("Debe iniciar session para navegar."); 
    } else {
        var content = $("#contentPage")[0];
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
            success: function (json) {
                sessionStorage.setItem("id", json._id);
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
                if(response.length > 0) {

                    $("#resultadoBusqueda").append(
                        "<p style='margin-top: 30px;'> Guardar Busqueda <br>"                    
                        +   "<ons-input type='text' input-id='descripcionImp' modifier='underbar' placeholder='Descripcion...' float></ons-input> "    
                        +   "<ons-button id='guardarBusuqueda' onclick='GuardarBusqueda()'>Guardar</ons-button>"
                        +"</p>");

                    $.each(response,function(i,value){  

                        if(producto === "" || value.name.toUpperCase().includes(filtro.toUpperCase())) {  
    
                            var prod = "<ons-list modifier='inset' style='margin-bottom: 1vh'>"
                                +"  <img src='"+value.photo+"' style='width: 100%'>" 
                                +"  <ons-list-item modifier='longdivider'><div class='center'><b>"+value.name+"</b></div></ons-list-item>"                         
                                +"  <ons-list-item modifier='longdivider'><div class='right'>$"+value.price+"</div></ons-list-item>"
                                +"  <ons-list-item modifier='longdivider'>"+value.description+"</ons-list-item>"
                                +"  <ons-list-item modifier='longdivider'>En "+value.branches.length+" sucursales."
                                +"  <div class='right'><ons-button id='verMapa' onclick=\"fn.load('mapaSucursales.html')\" modifier='quiet'>Ver en Mapa</ons-button></div></ons-list-item>"
                                +"</ons-list>"; 
                            $("#resultadoBusqueda").append(prod);                  
                            found = true;
                        }
                    });
                } else {
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
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(CrearMapa);
    }
}

function CrearMapa(posActual,sucursales) {
    console.log("CrearMapa");

    longitudActual=posActual.coords.longitude;
    latitudActual=posActual.coords.latitude;

    map = L.map('map').setView([latitudActual, -longitudActual], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([latitudActual,longitudActual]).addTo(map)
        .bindPopup('Esta es mi posicion')
        .openPopup();
        cargarSucursales(sucursales);

}

function cargarSucursales(sucursales){
   
    $.each(sucursales,function(i,value){
        var lugar = sucursales[i];
        var contenido = "<p>El nombre del lugar es" + lugar.nombre+"<p><br><input type='button' onclick='mostrarRuta("+lugar.latitude+","+lugar.longitude+")'>";
        
        var latitud=lugar.latitude;
        var longitud=lugar.longitude;

        L.marker([latitud,longitud]).addTo(map)
        .bindPopup(contenido)
        .openPopup();
    })

}

function mostrarRuta(latitude,longitude){
    L.Routing.control({
        waypoints: [
          L.latLng(latitudActual,longitudActual),
          L.latLng(latitude, longitude)
        ]
      }).addTo(map);
 
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
