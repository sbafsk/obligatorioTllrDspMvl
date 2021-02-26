
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