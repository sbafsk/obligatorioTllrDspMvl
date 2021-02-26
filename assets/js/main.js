$(document).ready(init);



function init() {
    // deberia checkear la session antes de cargar el html
    checkSession();

};

const urlApi = "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/"
const urlImg = "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/"
let token
// funciones OnsenUI
// manejo pantalla inicio - Login/Registrar

function loadLogin(page) {
    let content = document.querySelector("#contentLogin");
    content.load(page);
};


function logOut() {

    window.localStorage.removeItem("token");
    console.log("Se limpia token del localStorage");
    loadLogin('login.html');
}

// manejo pantalla principal

function openMenu() {
    let menu = document.querySelector("#menu");
    menu.open();
};

function loadPage(page, idFlag = false) {

    let content = document.querySelector("#content");

    let menu = document.querySelector("#menu");

    content.load(page)
        .then(menu.close.bind(menu));


    switch (page) {
        case "catalogo.html":
            $("#prodName").val('');
            $("#prodCod").val('');
            listarProductos();
            break;
        case "pedidos.html":
            listarPedidos()
            break;
        // validar id ????
        case "detalle.html":
            if (!idFlag) detalleProducto(idFlag);
            break;
        case "altaPedido.html":
            if (!idFlag) altaPedido(idFlag);
            break;
        default:
            break;
    }
};

function home() {
    $.ajax({
        url: urlApi + "productos",
        type: "GET",
        contentType: 'application/json',
        headers: { "x-auth": token },
        success: function () {
            productList();
        },
        error: function (json) {
            console.log(json);
            //ons.notification.alert(json);
        }
    });
}


function checkSession() {

    token = window.localStorage.getItem("token");

    if (token != null && token != undefined) {

        $.ajax({
            url: urlApi + "usuarios/session",
            type: "GET",
            contentType: "application/json",
            headers: { "x-auth": token },
            success: function () {
                loadLogin("appPage.html");
            },
            error: function (json) {
                console.log(json);
            }
        });
    }
}

function registrar() {


    let email = $("#r_email").val();
    let pass = $("#r_pass").val();
    let c_pass = $("#r_confPass").val();
    let name = $("#r_name").val();
    let lName = $("#r_lName").val();
    let addr = $("#r_addr").val();


    try {

        if (pass != c_pass) throw new Error("Las contraseñas debe coincidir");

        if (pass.length < 8) throw new Error("Las contraseña debe tener 8 caracteres minimo.");

        let re = /\S+@\S+\.\S+/;
        if (!re.test(email)) throw new Error("Email no tiene el formato indicado.");


        let datos = {
            "nombre": name,
            "apellido": lName,
            "email": email,
            "direccion": addr,
            "password": pass
        }

        $.ajax({
            url: urlApi + "usuarios",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify(datos),
            contentType: 'application/json',
            success: function () {
                ons.notification.alert("Registro con Exito");
                loadLogin("login.html");
            },
            error: function (json) {
                let jR = json.responseJSON;
                console.log(jR.error);
                ons.notification.alert(jR.error);

            }
        });

    } catch (error) {

        ons.notification.alert(error.message);
    }

};


function login() {

    let emailImpt = $("#email").val();
    let passwordImpt = $("#password").val();

    try {

        if (emailImpt === "") throw new Error("El email no puede estar vacio");

        if (passwordImpt === "") throw new Error("La contraseña no puede estar vacio");


        $.ajax({
            url: urlApi + "usuarios/session",
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({ email: emailImpt, password: passwordImpt }),
            contentType: 'application/json',
            success: function (json) {
                window.localStorage.setItem("token", json.data.token);
                token = json.data.token;
                loadLogin("appPage.html");
            },
            error: function (json) {
                console.log(json.error);
                ons.notification.alert(json.error);
            }
        });

    } catch (e) {
        alert(e.message);
    }

};

function listarProductos() {

    let name = $("#prodName").val();
    let codigo = $("#prodCod").val();
    $("#listProductos").html("");

    data = {
        nombre: name,
        codigo: codigo
    }

    $.ajax({
        url: urlApi + "productos",
        type: "GET",
        contentType: 'application/json',
        headers: { "x-auth": token },
        data: data,
        success: function (response) {
            console.log(response)
            let found = false;
            $.each(response.data, function (i, value) {

                let prod = "<ons-list modifier='inset' style='margin-bottom: 1vh'>"
                    + "  <img src='" + urlImg + value.urlImagen + ".jpg' style='width: 100%'>"
                    + "  <ons-list-header>" + value.nombre + "</ons-list-header>"
                    + "  <ons-list-item><div class='right'>$" + value.precio + "</div></ons-list-item>"
                    + "  <ons-list-item modifier='longdivider'>" + value.codigo + "</ons-list-item>"
                    + "  <ons-list-item modifier='longdivider'>" + value.estado + " </ons-list-item>"
                    + "  <ons-list-item>" + value.etiquetas.join(" | ") + " </ons-list-item>"
                    + "  <ons-list-item onclick='loadPage('detalle.html'," + value.id + ")><button>Ver detalle</button></ons-list-item>";
                + "  </ons-list>";

                $("#listProductos").append(prod);
                found = true;
            });

            if (!found) {
                ons.notification.alert("No se encontraron productos");
            }

        },
        error: function (response) {
            console.log("fail Consultar Producots");
            console.log(response.error);
            ons.notification.alert("Hubo un problema para acceder al listado de productos.");
        }
    })
};

function detalleProducto(idProd) {

    $.ajax({
        url: urlApi + "productos/" + idProd,
        type: "GET",
        contentType: 'application/json',
        headers: { "x-auth": token },
        success: function (response) {
            console.log(response)

            let value = rensponse.data

            let prod = "<ons-list-header class='hStyle center'>" + value.nombre + "</ons-list-header>";

            prod += "<ons-list-item class='prod-Style__data' tappable>" + "<div class='left'>"
                + "<img class='list-item-thumbnail imgStyle' src='" + urlImg + value.urlImagen + ".jpg'>"
                + "</div>" + "<div class='center prodStyle'>"
                + "<span class='list-item__subtitle'>" + " " + value.codigo + "<br>" + value.estado + "<br>" + "$" + value.precio
                + "</span>" + "</div>"
                + "</ons-list-item>"
                + "<ons-list-item class='prod-Style__data'>" + "<div class='center tagSize'>" + value.etiquetas.join(" / ") + "</div>"
                + "</ons-list-item>"
                + "<ons-list-item class='prod-Style__data'>" + "<div class='center prodStyle'>" + value.descripcion + "</div>"
                + "</ons-list-item>";

            let disable = "true";

            if (value.stock > 0) disable = "false";

            prod += "<ons-list-item class='prod-Style__data'>" + "<button class='right' disable='" + disable + "' onclick=" + loadPage("altaPedido.html", value.codigo) + ">Hacer pedido</ons-button></ons-list-item>"
                + "</ons-list-item>";

            $("#bodyDetalles").append(prod);

        },
        error: function (response) {
            console.log("fail Consultar Producots");
            console.log(response.error);
            ons.notification.alert("Hubo un problema para acceder al listado de productos.");
        }
    })
};


function listarPedidos() {

    let name = $("#prodName").val();
    let codigo = $("#prodCod").val();
    $("#listProductos").html("");

    data = {
        nombre: name,
        codigo: codigo
    }

    $.ajax({
        url: urlApi + "pedidos",
        type: "GET",
        contentType: 'application/json',
        headers: { "x-auth": token },
        data: data,
        success: function (response) {
            console.log(response)
            let found = false;
            $.each(response.data, function (i, value) {

                let prod = "<ons-list modifier='inset' style='margin-bottom: 1vh'>"
                    + "  <img src='" + urlImg + value.producto.urlImagen + ".jpg' style='width: 20%'>"
                    + "  <ons-list-header>" + value.producto.nombre + "</ons-list-header>"
                    + "  <ons-list-item><div class='right'>$" + value.total + "</div></ons-list-item>"
                    + "  <ons-list-item>" + value.producto.codigo + "</ons-list-item>"
                    + "  <ons-list-item>" + value.producto.estado + " </ons-list-item>"
                    + "  <ons-list-item>" + value.producto.etiquetas.join(" | ") + " </ons-list-item>"
                    + "  <ons-list-item>Sucursal: " + value.sucursal.nombre + " <div class='right'>Estado: " + value.estado + "</div></ons-list-item>"
                    + "  </ons-list>";

                $("#listPedidos").append(prod);
                found = true;
            });

            if (!found) {
                ons.notification.alert("No se encontraron pedidos");
            }

        },
        error: function (response) {
            console.log("fail Consultar Pedidos");
            console.log(response.error);
            ons.notification.alert("Hubo un problema para acceder al listado de Pedidos.");
        }
    })
};

function detallePedido() {

    // TODO

    let name = $("#prodName").val();
    let codigo = $("#prodCod").val();
    $("#listProductos").html("");

    data = {
        nombre: name,
        codigo: codigo
    }

    $.ajax({
        url: urlApi + "pedidos",
        type: "GET",
        contentType: 'application/json',
        headers: { "x-auth": token },
        data: data,
        success: function (response) {
            console.log(response)
            let found = false;
            $.each(response.data, function (i, value) {

                let prod = "<ons-list modifier='inset' style='margin-bottom: 1vh'>"
                    + "  <img src='" + urlImg + value.producto.urlImagen + ".jpg' style='width: 100%'>"
                    + "  <ons-list-header>" + value.producto.nombre + "</ons-list-header>"
                    + "  <ons-list-item><div class='right'>$" + value.total + "</div></ons-list-item>"
                    + "  <ons-list-item>" + value.producto.codigo + "</ons-list-item>"
                    + "  <ons-list-item>" + value.producto.estado + " </ons-list-item>"
                    + "  <ons-list-item>" + value.producto.etiquetas.join(" | ") + " </ons-list-item>"
                    + "  <ons-list-item>Sucursal: " + value.sucursal.nombre + " <div class='right'>Estado: " + value.estado + "</div></ons-list-item>"
                    + "  </ons-list>";

                $("#listPedidos").append(prod);
                found = true;
            });

            if (!found) {
                ons.notification.alert("No se encontraron pedidos");
            }

        },
        error: function (response) {
            console.log("fail Consultar Pedidos");
            console.log(response.error);
            ons.notification.alert("Hubo un problema para acceder al listado de Pedidos.");
        }
    })
};

function altaPedido(idProd) {

    let itemQty = $("#itemQty").val();
    idProd = $("#prodId").val();
    let idSuc = $("#sucId").val();

    try {

        if (itemQty < 1) throw Error("La cantidad debe ser mayor a 0.")

        data = {
            cantidad: itemQty,
            idProducto: idProd,
            idSucursal: idSuc
        }

        $.ajax({
            url: urlApi + "pedidos",
            type: "POST",
            contentType: 'application/json',
            headers: { "x-auth": token },
            data: data,
            success: function (response) {
                console.log(response)
                ons.notification.alert("Pedido creado.");
            },
            error: function (response) {
                console.log("fail alta Pedidos");
                console.log(response);
                ons.notification.alert("Hubo un problema al realizar alta de Pedido.");
            }
        })
    } catch (e) {
        alert(e.message);
    }


};


function modificarPedido() {

    let comment = $("#itemQty").val();
    let idProd = $("#prodId").val();
    let idSuc = $("#sucId").val();

    try {

        if (itemQty < 1) throw Error("La cantidad debe ser mayor a 0.")

        data = {
            cantidad: itemQty,
            idProducto: idProd,
            idSucursal: idSuc
        }

        $.ajax({
            url: urlApi + "pedidos",
            type: "POST",
            contentType: 'application/json',
            headers: { "x-auth": token },
            data: data,
            success: function (response) {
                console.log(response)
                ons.notification.alert("Pedido creado.");
            },
            error: function (response) {
                console.log("fail alta Pedidos");
                console.log(response);
                ons.notification.alert("Hubo un problema al realizar alta de Pedido.");
            }
        })
    } catch (e) {
        alert(e.message);
    }


};




//--------------------------------------------------------------------------------------------------------//
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

    let myLat = response.centrado.latitud;
    let myLon = response.centrado.longitud;
    let monopatinesCercanos = [];
    let distancias = [];

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
                    let codigo = $("#monopatin #cod").text();
                    let bateria = $("#monopatin #bat").text();
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

    let lon1 = coords1[0];
    let lat1 = coords1[1];

    let lon2 = coords2[0];
    let lat2 = coords2[1];

    let R = 6371; // km

    let x1 = lat2 - lat1;
    let dLat = toRad(x1);
    let x2 = lon2 - lon1;
    let dLon = toRad(x2)
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    return [d, cod];
}

function VentanaMonopatin(monopatin) {
    let ventana = "<div id='monopatin'><p>Monopatin <span id='cod'>" + monopatin.codigo + "</span></p>";
    ventana += "<p>Bateria restante <span id='bat'>" + monopatin.bateria + "</span>%</p>";
    ventana += "<button class='desbloquear'>Desbloquear</button></div>";

    return ventana;
}








// alta medio de pago
function AltaMedioPago() {
    // let nroTarjeta = $("#nroTarjeta").value;
    let nroTarjeta = $("#nroTarjeta").val();
    // el numero de la tarjeta deben ser 16 digitos
    if (nroTarjeta.length == 16) {
        let settings = {
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
                let settings = {
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
        let nro = $("#nroTarjeta").val();
        $("#logoTarjeta").attr("src", IconoTarjeta(nro));
    });
}

function IconoTarjeta(nro) {
    let src = "";
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
    let settings = {
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

    let saldo = $("#saldoModificar").val();

    if (saldo > 0 && saldo % 100 == 0) {
        let settings = {
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






function favLoader() {
    let stringHtml = ""
}
