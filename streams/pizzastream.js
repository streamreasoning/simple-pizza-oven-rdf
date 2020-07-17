'use strict';

const WebSocket = require('ws');
const uuid = require('uuid');
const gaussian = require('gaussian');
const temperature = gaussian(280, 10);

const pizzastream_wss = new WebSocket.Server({
    port: 9400
});

const ovenstream_wss = new WebSocket.Server({
    port: 9500
});

function broadcastOven(id) {
    let jsonld = {
        "@context": {
            "qudt": "http://qudt.org/1.1/schema/qudt#",
            "qudt-unit": "http://qudt.org/1.1/vocab/unit#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "sosa": "http://www.w3.org/ns/sosa/",
            "xsd": "http://www.w3.org/2001/XMLSchema#"
        },
        "@base": `http://linkeddata.stream/streams/pizza-S2/${Date.now()}`,
        "@id": uuid.v4(),
        "@type": "sosa:Observation",
        "sosa:hasFeatureOfInterest": {
            "@id": `${id}`
        },
        "sosa:hasResult": {
            "@type": "qudt:QuantityValue",
            "qudt:numericValue": {
                "@type": "xsd:decimal",
                "@value": `${temperature.ppf(Math.random())}`
            },
            "qudt:unit": {
                "@id": "qudt-unit:DegreeCelsius"
            }
        }
    }

    const jsonldString = JSON.stringify(jsonld);

    ovenstream_wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(jsonldString);
        }
    });
}

function broadcastPizza(id) {
    let jsonld = {
        "@context": {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "pizza": "http://www.co-ode.org/ontologies/pizza/pizza.owl#"
        },
        "@base": `http://linkeddata.stream/streams/pizza-S1/${Date.now()}`,
        "@id": `${id}`,
        "@type": "pizza:Pizza",
        "pizza:hasTopping": [
            {
                "@id": "pizza:TomatoTopping"
            },
            {
                "@id": "pizza:MozzarellaTopping"
            }
        ]
    }

    // fi american pizza add PeperoniSausageTopping
    if (Math.random() >= 0.5) {
        jsonld["pizza:hasTopping"].push({
            "@id": "pizza:PeperoniSausageTopping"
        })
    }

    const jsonldString = JSON.stringify(jsonld);

    pizzastream_wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(jsonldString);
        }
    });
}

console.log('Pizzastream Web Socket on port 9400!');
console.log('Ovenstream Web Socket on port 9500!');

(function loop() {
    setTimeout(function () {
        const id = uuid.v4();
        broadcastPizza(id);
        const f = function () { broadcastOven(id); };
        setTimeout(f, 500);
        setTimeout(f, 1000);
        setTimeout(f, 1500);
        setTimeout(f, 2000);
        setTimeout(f, 2500);
        setTimeout(f, 3000);
        setTimeout(f, 3500);
        setTimeout(f, 4000);
        setTimeout(f, 4500);
        loop();
    }, 5000);
}());
