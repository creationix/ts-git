local connect = require('coro-net').connect
local split = require('coro-split')

require('weblit-websocket')
require('weblit-app')

  .bind({
    host = "127.0.0.1",
    port = 8080
  })

  .use(require('weblit-logger'))
  .use(require('weblit-auto-headers'))
  .use(require('weblit-etag-cache'))

  .use(require('weblit-static')("www"))
  .use(require('weblit-static')("."))

  .websocket({
    path = "/net/:protocol/:host/:port",
    protocol = "ws-proxy",
  }, function (req, lRead, lWrite)
    local host = req.params.host
    local port = tonumber(req.params.port)
    local tls = req.params.protocol == "tls"
    p{host=host,port=port,tls=tls}
    p(req, read, write)
    local rRead, rWrite, rSocket = assert(connect{host=host,port=port})
    p(rRead, rWrite, rSocket)
    lWrite({
      opcode = 1,
      payload = "connected"
    })
    split(function ()
      for message in lRead do
        if message.opcode == 1 or message.opcode == 2 then
          rWrite(message.payload)
        end
      end
      rWrite()
    end, function ()
      for chunk in rRead do
        lWrite(chunk)
      end
      lWrite()
    end)
  end)

  .start()

