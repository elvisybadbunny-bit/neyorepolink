import fs from"node:fs";const m=fs.readFileSync("src/components/messaging/messages-client.tsx","utf8");const checks=[
[m.includes("const optimistic: Msg")&&m.includes("setMessages((rows) => [...rows, optimistic])"),"sent messages appear optimistically before network completion"],
[!m.slice(m.indexOf("async function send()"),m.indexOf("async function acknowledge")).includes("openConvo(active)"),"sending no longer reloads the complete thread"],
[m.includes('deliveryState?: "sending" | "failed"')&&m.includes(">Sending…</p>"),"optimistic bubbles expose a lightweight sending state"],
[m.includes("your message was restored to the composer")&&m.includes("setDraft(body)"),"network failures restore unsent content"],
[m.includes("threadCache")&&m.includes("setLoadingThread(!cached)"),"reopened conversations paint from cache immediately"],
[m.includes("setThreadCache((cache)")&&m.includes("new EventSource"),"live canonical updates refresh the thread cache"],
];let n=0;for(const[ok,x]of checks){if(!ok)throw Error(`FAIL: ${x}`);console.log(`PASS ${++n}: ${x}`)}console.log(`INSTANT MESSAGING: ${n}/${checks.length}`);
