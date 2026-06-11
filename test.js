

async function run() {
  const res = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation {
          register(name: "Test", email: "test@lapmart.com", password: "password", role: BUYER) {
            token
            user { email role }
          }
        }
      `
    })
  });
  const data = await res.text();
  console.log(data);
}

run();
