const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const path = require('path')
const fs = require('fs')
const chat = require('./chatGTP')


const servicioPath = path.join(__dirname, "mensajes", "servicios.txt")
const servicios = fs.readFileSync(servicioPath, "utf-8")


const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('¡Hola! Bienvenido a StartCode. ¿En qué puedo ayudarte hoy?')

const flowServicios = addKeyword(EVENTS.ACTION)
    .addAnswer(['1.- Desarrollo de software',
                '2.- Desarrollo de Paginas Web',
                '3.- Desarrollo de Aplicaciones Móviles'  
            ])

const flowProyectos = addKeyword(EVENTS.ACTION)
    .addAnswer('Nuestro Proyectos: https://wa.me/c/51931055100')

const flowConsulta = addKeyword(EVENTS.ACTION)
    .addAnswer('¿Cual es tu consulta?',{capture:true}, async(ctx, ctxFn) =>{
        const prompt = "Responder hola"
        const consulta = ctx.body
        const answer = await chat(prompt, consulta)
        console.log(answer.content)
    })

    /** 
const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer('Este es un flujo welcome',{
        delay: 5000,
    },
    async (ctx, ctxFn) => {
        if (ctx.body.includes("casas")) {
            await ctxFn.flowDynamic("Escrivistes casas")
        } else {
            await ctxFn.flowDynamic("Escrivistes otra cosa")
        }
    }
    )
    */

const seriviciosFlow = addKeyword("servicios").addAnswer(
    servicios,
    {capture: true},
    async (ctx, {gotoFlow, fallBack, flowDynamic}) =>{
        if (!["1","2","3","0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no valida por favor seleccione uno de las opciones."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowServicios);
            case "2":
                return gotoFlow(flowProyectos); 
            case "3":
                return gotoFlow(flowConsulta); 
            case "0":
                return await flowDynamic(
                    "saliendo... puder acceder a este menu escribiendo 'menu'"
                );
        }
    }
);

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal,seriviciosFlow,flowServicios,flowProyectos,flowConsulta])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
