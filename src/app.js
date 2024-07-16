// import { MongoClient } from 'mongodb'
// import express from 'express'
// import engine from "express-handlebars"
// import { Server } from "socket.io"
// import viewsrouter from "./routers/viewsrouter.js"
// import __dirname from "./utils.js"

const { MongoClient } = require('mongodb')
const express = require('express')
const engine = require("express-handlebars")
const { Server } = require("socket.io")
const viewsrouter = require("./routers/viewsrouter.js")


const app = express()
const httpserver = app.listen(8080, () => console.log("servidor escuchando en el puerto 8080"))
const socketserver = new Server(httpserver)
app.engine("handlebars", engine.engine())
app.set("view engine", "handlebars")
app.set("views", __dirname + "/views")
app.use(express.static(__dirname + "/public"))
app.use("/", viewsrouter)
app.use('/css', express.static('public/css'))

socketserver.on('connection', socket => {

  socket.on('identificarse', us => {

    console.log(`Cliente conectado: ${socket.id}`);

    const date = new Date()
    const mess = {
      id: us,
      data: 'Conectado ',
      date: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    }
    obtenerTodosLosDocumentos(socket)
    socket.broadcast.emit('mensaje_servidor_broadcast', mess)
  })

  socket.on('message', async (data, user) => {
    const date = new Date()
    const mess ={
      id: user,
      data,
      date: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    }
    insertarUnElemento(mess)
    socketserver.emit('message', [mess])
  })

  socket.on('disconnection', (us) => {
    console.log(`Cliente desconectado: ${socket.id}`);
    const date = new Date()
    socket.broadcast.emit('mensaje_servidor_broadcast', {
      id: us,
      data: 'Desconectado ',
      date: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    })
  })
})



// Función para conectar a la base de datos y ejecutar operaciones
async function insertarUnElemento(messages) {
  let client = new MongoClient(process.env.MONGO_URL)
  try {
    // Conectar al servidor MongoDB
    await client.connect();
    console.log('Conectado correctamente al servidor de MongoDB inertarUnElemento');

    // Seleccionar una base de datos
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection(process.env.MONGO_COLLECTION);
    await collection.insertOne(messages);
  } catch (error) {
    console.error('Error al conectar o interactuar con la base de datos inertarUnElemento:', error);
  } finally {
    await client.close(); // Cerrar la conexión cuando termine
    console.log('Conexión cerrada correctamente en inertarUnElemento');
  }
}

// Función para obtener todos los documentos de una colección
async function obtenerTodosLosDocumentos(socketserver) {
  let client = new MongoClient(process.env.MONGO_URL)
  try {
    await client.connect(); // Conexión a la base de datos
    console.log('Conectado correctamente al servidor de MongoDB obtenerTodosLosDocumentos');
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection(process.env.MONGO_COLLECTION)
    // Consulta para obtener todos los documentos de la colección
    const documents = await collection.find({}).toArray();
    socketserver.emit('message', documents)
  } catch (error) {
    console.error('Error al conectar o interactuar con la base de datos en obtenerTodoslosDocumentos', error);

  } finally {
    await client.close(); // Cerrar la conexión cuando termine
    console.log('Conexión cerrada correctamente en obtenerTodoslosDocumentos');
  }
}