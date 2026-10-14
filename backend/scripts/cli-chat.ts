import * as readline from 'readline';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🕉️  ================================================');
console.log('   SARATHI SAKHA (सारथी सखा) — TERMINAL COUNSEL');
console.log('   Zero-Token-Cost Local Divine AI Companion');
console.log('   Type "exit" to quit');
console.log('================================================\n');

function askQuestion() {
  rl.question('\n👤 Partha (You): ', async (query) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      askQuestion();
      return;
    }
    if (cleanQuery.toLowerCase() === 'exit') {
      console.log('\n🙏 Om Shanti. May righteousness guide your charioteer.\n');
      rl.close();
      process.exit(0);
    }

    process.stdout.write('\n🦚 Sri Krishna: ');

    try {
      const response = await fetch(`${BACKEND_URL}/consult/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanQuery }),
      });

      if (!response.body) {
        console.log('Error: Empty response body.');
        askQuestion();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawData = line.slice(6).trim();
              if (rawData === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.text) {
                  process.stdout.write(parsed.text);
                } else if (parsed.crisis) {
                  console.log('\n' + parsed.text);
                }
              } catch {
                // Ignore partial JSON lines
              }
            }
          }
        }
      }
      console.log('\n');
    } catch (err: any) {
      console.error(`\nConnection error: ${err.message}`);
    }

    askQuestion();
  });
}

askQuestion();
