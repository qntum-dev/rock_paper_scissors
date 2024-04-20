const net = require("net");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the server address: ", (address) => {
  rl.question("Enter the server port: ", (port) => {
    const client = net.createConnection({ host: address, port: parseInt(port) }, () => {
      console.log("Connected to server\n");

      // Start listening for user input after connecting to the server
      rl.on("line", (input) => {
        client.write(input);
      });

      // Handle CTRL+C (SIGINT) gracefully
      process.on("SIGINT", () => {
        console.log("Terminating client\n");
        client.end();
        rl.close();
      });
    });

    client.on("close", () => {
      console.log("Server connection closed\n");
      process.exit();
    });

    client.on("data", (data) => {
      console.log("\n" + data.toString());
    });

    client.on("error", (err) => {
      //   console.error("Client error:", err);
      if (err.code === "ECONNRESET") {
        console.log("Server forcibly closed the connection.\n");
      }
      process.exit(1); // Exit with error code 1
    });
  });
});
