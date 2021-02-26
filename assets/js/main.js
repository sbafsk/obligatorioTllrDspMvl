$(document).ready(init);

const urlApi = "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/"
const urlImg = "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/"
let token
let posUsuario = {
    latitud: -32.898038, longitud: -55.805054
}
let mymap;

function init() {
    // deberia checkear la session antes de cargar el html
    checkSession();
    getLocation();
};

function getLocation() {
    window.navigator.geolocation.getCurrentPosition(
        function (geoData) {
            posUsuario.latitud = geoData.coords.latitude;
            posUsuario.longitud = geoData.coords.longitude;
        },
        function (errorData) {
            ons.notification.toast('No se pudo obtener la posición!', { timeout: 2000 })
        })
}

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
            listarPedidos();
            break;
        // validar id ????
        case "detalle.html":
            if (idFlag) getProducto(idFlag, "detalle");
            break;
        case "altaPedido.html":
            if (idFlag) getProducto(idFlag, "altaPedido");
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

                let prod = `<ons-list-header class='hStyle center'>${value.nombre}</ons-list-header>
                    <ons-list-item class='prod-Style__data' tappable><div class='left'>
                    <img class='list-item-thumbnail imgStyle' src='${urlImg + value.urlImagen}.jpg'>
                    </div>  <div class='center prodStyle'>
                    <span class='list-item__subtitle'> ${value.codigo}<br>${value.estado}<br>$${value.precio}  
                    </span>  </div>
                    </ons-list-item>
                    <ons-list-item class='prod-Style__data'><div class='center tagSize'>${value.etiquetas.join(" / ")}</div>
                    </ons-list-item>
                    <ons-list-item><ons-button onclick='loadPage("detalle.html", "${value._id}")' class='btn'>Ver detalle</ons-button></ons-list-item>;
                    </ons-list>`;

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

function getProducto(idProd, origen) {

    //let value = false;

    $.ajax({
        url: urlApi + "productos/" + idProd,
        type: "GET",
        contentType: 'application/json',
        headers: { "x-auth": token },
        success: function (response) {
            console.log(response);
            handlerGetProducto(response.data, origen);
            //detalleProducto(response.data);
        },
        error: function (response) {
            console.log("fail Consultar Producots");
            console.log(response.error);
            ons.notification.alert("Hubo un problema para acceder al listado de productos.");
        }
    })

    //return value;
};

function handlerGetProducto(data, origen) {
    if (origen == "detalle") detalleProducto(data);

    if (origen == "altaPedido") vistaAltaPedido(data);
}

function detalleProducto(data) {


    let prod = `<ons-list-header class='hStyle center'>  ${data.nombre}  </ons-list-header>`;

    prod += `<ons-list-item class='prod-Style__data' tappable>  <div class='left'>
                 <img class='list-item-thumbnail imgStyle' src='${urlImg + data.urlImagen}.jpg'>
                 </div>  <div class='center prodStyle'>
                 <span class='list-item__subtitle'>     ${data.codigo}  <br>  ${data.estado}  <br>  $ ${data.precio}
                 </span>  </div>
                 </ons-list-item>
                 <ons-list-item class='prod-Style__data'>  <div class='center tagSize'>${data.etiquetas.join(" / ")}</div>
                 </ons-list-item>
                 <ons-list-item class='prod-Style__data'>  <div class='center'>  ${data.descripcion}  </div>
                 </ons-list-item>`;

    let disable = true;

    if (data.stock > 0) disable = false;

    prod += `<ons-list-item class='prod-Style__data'>  <ons-button class='right btn' disable='${disable}' onclick='loadPage("altaPedido.html", "${data._id}")'>Hacer pedido</ons-button></ons-list-item>
                 </ons-list-item>`;

    $("#bodyDetalles").append(prod);
}

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

function vistaAltaPedido(prod) {

    //$("#cantidad").on("change", function() {totalPedido()});

    let name = prod.nombre;
    let price = prod.precio;

    let view = `<span>Producto: ${name}</span><br>Precio $<span id="precio">${price}</span><br>`;


    $("#bodyAlta").append(view);
    // MAPA
    prepararMapa();
    // COMBO SUCURSALES y ubicacion
    getSucursales();
};

function getSucursales() {

    //Llamo sucursales a la Api (GET)
    $.ajax({
        url: urlApi + "sucursales",
        type: "GET",
        contentType: 'application/json',
        headers: { "x-auth": token },
        success: function (response) {
            comboSucursales(response.data);
            //preparo el mapa

        },
        error: function (response) {
            console.log("Sucursal no obtenida");
            console.log(response);
        }
    })
}

function comboSucursales(response) {
    let slc = '';
    for (i = 0; i < response.length; i++) {
        let nombreSucursal = response[i].nombre;
        let id = response[i]._id;

        slc += `<option value="${id}">${nombreSucursal}</option> `

        buscarPosicionSucursal(response[i]);
    }
    $('#sucursal').html(slc);
}

function totalPedido() {

    let qty = $("#cantidad").val();
    let price = $("#precio").text();

    if (isNaN(qty)) {
        ons.notification.toast("Cantidad debe ser numerico.", { timeout: 2000 })
    } else {
        total = price * qty;
        $("#precioTotal").text(total);
    }

}

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

function prepararMapa() {

    //remuevo el mapa si existe un mapa activo
    if (mymap) {
        mymap = mymap.remove();
    }
    //inicializo nuevamente el mapa
    mymap = L.map('idMapa').setView([posUsuario.latitud, posUsuario.longitud], 11);
    //agrego la cartografía
    L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWNhaWFmYSIsImEiOiJjanh4cThybXgwMjl6M2RvemNjNjI1MDJ5In0.BKUxkp2V210uiAM4Pd2YWw",
        {
            attribution:
                'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: "mapbox/streets-v11",
            accessToken: "your.mapbox.access.token",
        }
    ).addTo(mymap);

    //ubico al usuario conectado
    L.marker([posUsuario.latitud, posUsuario.longitud]).addTo(mymap).bindPopup('Aqui se encuentra usted');
}


function buscarPosicionSucursal(sucursal) {
    //spinnerModal.show();

    //realizo la llamada a la api nominatim.openstring para obtener los datos de geolocation
    //a partir de texto con los datos de la dirección
    //para más parámetros revisar la doc de la api
    $.ajax({
        method: 'GET',
        url: `http://nominatim.openstreetmap.org/search?format=json&street=${sucursal.direccion}&country=Uruguay`,
        success: function (dataResponse) {
            //en caso de éxito y de que haya algún dato.
            if (dataResponse.length > 0) {
                //tomo el primero (si los datos de la dirección son precisos solo debería tener 1)
                let sucGeolocation = dataResponse[0];

                //utilizo la función de distancia que tiene el mapa para calcular la distancia en metros
                let distanciaMetros = mymap.distance(L.latLng(posUsuario.latitud, posUsuario.longitud), L.latLng(sucGeolocation.lat, sucGeolocation.lon))
                //convierto a km con 2 lugares luego de la coma
                let distanciaKm = (distanciaMetros / 1000).toFixed(2);
                //agrego todos los datos al marcador
                L.marker([sucGeolocation.lat, sucGeolocation.lon]).addTo(mymap).bindPopup(`${sucursal.nombre} ${distanciaKm}km`);
            }
            else {
                ons.notification.toast('Error al obtener ubicación de la sucursal', { timeout: 2000 });
            }
        },
        error: function () { console.log('Error') }
    })
}