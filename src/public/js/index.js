
const socket = io()
let user
const mensaje = document.getElementById('texto')
const mensajeInput = document.getElementById('input')
const respuestaDiv = document.getElementById('enviar')

Swal.fire({
    title: 'Identificarse',
    input: 'text',
    text: 'Ingresa el usuario para identificarse en el chat',
    inputValidator: (value) => {
        return !value && 'Necesitas escribir un nombre de usuario para conectarse'
    },
    toast: true

}).then(result => {
    mensaje.value = ''
    user = result.value

    socket.emit('identificarse', user)

    socket.on('mensaje_servidor_broadcast', (element) => {

        mensaje.value += `${element.id} ${element.data} ${element.date}` + "\n"
    })

    socket.on('message', data => {
        let result = ''
        data.forEach(element => {
            result += `${element.id} dice: ${element.data} ${element.date}` + "\n"
        })
        mensaje.value += result
    })

    respuestaDiv.addEventListener('click', () => {
        if (mensajeInput.value) {
            // Enviar mensaje al servidor
            socket.emit('message', mensajeInput.value, user)
            mensajeInput.value = '' // Limpiar el input
        }
    })

    window.addEventListener('beforeunload', () => {
        socket.emit('disconnection', user)
    })

})