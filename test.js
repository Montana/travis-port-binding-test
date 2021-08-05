import path from 'path'
import test from 'ava'

const protoLoader = require('@grpc/proto-loader')
const grpc = require('grpc')

const PROTO_PATH = path.resolve(__dirname, './hello.proto')
const pd = protoLoader.loadSync(PROTO_PATH)
const hp = grpc.loadPackageDefinition(pd).helloworld

function sayHello (call, fn) {
  fn(null, { message: 'Hello ' + call.request.name })
}

test.cb('should bind service', t => {
  t.plan(1)

  const server = new grpc.Server()
  const port = 50051
  server.addService(hp.Greeter.service, { sayHello: sayHello })

  const bound = server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())

  t.is(bound, port)

  server.tryShutdown(t.end)
})

test.cb('should return 0 when binding to already taken port', t => {
  t.plan(2)

  const server = new grpc.Server()
  const port = 50052
  server.addService(hp.Greeter.service, { sayHello: sayHello })

  const bound = server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())

  t.is(bound, port)

  const bound2 = server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())

  t.is(bound2, 0)

  server.tryShutdown(t.end)
})
