/* FUNCIONES */


// funcion registro 
/*{
    "token": "992d9497d99915c2332562a08c63f453",
    "id": "268"
}*/

// funcion de Login
var login = function() {
    // obtengo los valores del form
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    // valido que los campos tengan valores
    if(username != "" && password != "") {
        // llamada al API para obtener y comparar los valores del usuario
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
            // navego a la siguiente pagina
            ons.notification.alert('Congratulations!');
        });

        $.ajax(settings).fail(function (response) {
            console.log(response);
            ons.notification.alert('Usuario o Contraseña incorrecto.');
        });
    } else {
        ons.notification.alert('Los campos no pueden quedar en blanco.');
    }   
    
    
    
    
};