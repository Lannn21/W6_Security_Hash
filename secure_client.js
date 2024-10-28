const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = "";

// Fungsi untuk membuat hash dari pesan
function createHash(message) {
    return crypto.createHash('sha256').update(message).digest('hex'); //Secure Hash Algorithm 256-bit dari crypto
}

socket.on("connect", () => {
    console.log("Connected to the server");

    rl.question("Enter your username: ", (input) => {
        username = input;
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        rl.on("line", (message) => {
            if (message.trim()) {
                const hash = createHash(message); // Buat hash dari pesan
                socket.emit("message", { username, message, hash }); // Kirim pesan beserta hash
            }
            rl.prompt();
        });
    });
});

// Menerima pesan dari server
socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage, hash: serverHash } = data;

    // Periksa apakah hash dari pesan sama dengan hash yang diterima dari server
    const calculatedHash = createHash(senderMessage);
    if (calculatedHash === serverHash) {
        console.log(`${senderUsername}: ${senderMessage}`);
    } else {
        console.log(`⚠️ Warning: Message from ${senderUsername} has been modified!`);
    }
    rl.prompt();
});

socket.on("disconnect", () => {
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () => {
    console.log("\nExiting...");
    socket.disconnect();
    rl.close();
    process.exit(0);
});
