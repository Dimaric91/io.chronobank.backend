var swaggerJSDoc = require('swagger-jsdoc')

var swaggerDefinition = {
  info: {
    title: 'Chronobank API',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  basePath: '/',
}
  
var options = {
  swaggerDefinition: swaggerDefinition,
  apis: ['./routes/index.js'],
}

console.log(swaggerJSDoc(options))
