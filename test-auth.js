const http = require('http');
const randomEmail = `testnode${Date.now()}@example.com`;

const registerData = JSON.stringify({
  name: 'Test Node',
  email: randomEmail,
  password: 'password123',
  mobileNumber: '1234567890',
  role: 'USER'
});

const reqReg = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(registerData)
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Register Response Status:', res.statusCode);
    console.log('Register Response:', data);

    // Now try login
    const loginData = JSON.stringify({
      email: randomEmail,
      password: 'password123'
    });

    const reqLog = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, res2 => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('Login Response Status:', res2.statusCode);
        console.log('Login Response:', data2);
      });
    });
    
    reqLog.on('error', e => console.error(e));
    reqLog.write(loginData);
    reqLog.end();
  });
});

reqReg.on('error', e => console.error(e));
reqReg.write(registerData);
reqReg.end();
