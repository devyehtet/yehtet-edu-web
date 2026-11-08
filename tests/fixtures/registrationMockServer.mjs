// Local browser QA only. No submissions are forwarded or written to disk.
import { createServer } from 'node:http';

let attempts = 0;
const server = createServer(async (request, response) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://127.0.0.1:5187' };
  if (request.method !== 'POST' || request.url !== '/registration') {
    response.writeHead(404, headers).end(JSON.stringify({ error: 'Mock registration only' }));
    return;
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const data = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': request.headers['content-type'] } }).formData();
  attempts++;
  console.log(JSON.stringify({ attempt: attempts, mode: data.get('learning_mode'), fee: data.get('standard_course_fee'), plan: data.get('payment_plan'), hasSlip: data.has('payment_slip') }));
  response.writeHead(attempts === 1 ? 503 : 200, headers).end(JSON.stringify(attempts === 1
    ? { error: 'TEST ONLY: registration temporarily unavailable. Please retry.' }
    : { ok: true, next: '/thanks' }));
});
server.listen(5186, '127.0.0.1', () => console.log('Registration mock: http://127.0.0.1:5186/registration'));
