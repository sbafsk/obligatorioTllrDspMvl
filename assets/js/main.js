$(document).ready(init);

function init() {
    // deberia checkear la session antes de cargar el html
    checkSession();

};

const urlApi = "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/"

// funciones OnsenUI
// manejo pantalla inicio - Login/Registrar

function loadLogin(page) {
    let content = $("#contentLogin")[0];
    content.load(page);
};


function logOut() {

    window.localStorage.removeItem("token");
    console.log("Se limpia token del localStorage");
    loadLogin('login.html');
}

// manejo pantalla principal

function openMenu() {
    let menu = $("#menu")[0];
    menu.open();
};

function loadPage(page) {

    let content = $("#content")[0];
    let menu = $("#menu")[0];
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

    let token = window.localStorage.getItem("token");

    if (token != null && token != undefined) {

        $.ajax({
            url: urlApi + "usuarios/session",
            type: "GET",
            contentType: 'application/json',
            headers: { "x-auth": token },
            success: function () {
                loadLogin("appPage.html");
            },
            error: function (json) {
                console.log(json);
                //ons.notification.alert(json);
            }
        });
    }
}

function Registrar() {


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


function Login() {

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
                window.localStorage.setItem("token", json.data.token)
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

function favLoader() {
    let stringHtml = ""
}