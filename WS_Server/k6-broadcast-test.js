import ws from 'k6/ws';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

export const options = {
  vus: 15, 
  duration: '0.5m', 
};

const WS_URL = 'wss://www.rtc-app.linkpc.net/ws';

const messageDelay = new Trend('message_delay_ms'); 

export default function () {
  const res = ws.connect(WS_URL, {}, function (socket) {
    let startTime;

    socket.on('open', function () {
     
      startTime = Date.now();
      socket.send(JSON.stringify({ type: 'test', content: 'Hello from k6 user' }));
    });

    socket.on('message', function (data) {
      const endTime = Date.now();
      const delay = endTime - startTime;
      messageDelay.add(delay); 
      console.log(`Message delay: ${delay} ms`);
    });

    socket.on('close', function () {
    });

    socket.on('error', function (e) {
    });

    socket.setTimeout(function () {
      socket.close();
    }, 10000); 
  });

  check(res, { 'Connected successfully': (r) => r && r.status === 101 });
}
