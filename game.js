const net = require("net");
const result = require("./gamelogic");
const os = require("os");
const server = net.createServer();
const clients = [];
let clientIdCounter = 0;
const allowed_data = ["rock", "paper", "scissors"];
const moves = { 1: "nomove", 2: "nomove", count: 0 };
const score = { 1: 0, 2: 0 };

server.on("connection", (socket) => {
  server.getConnections((err, count) => {
    if (err) {
      console.error("Error getting connection count:", err);
      return;
    }

    console.log("Current number of connections:", count);

    if (count > 2) {
      console.log(
        "Max clients reached. Closing connection for Client",
        clientId
      );
      socket.write("Max connections reached. Try again later.\n");
      socket.end();
      return;
    }
  });

  if (clientIdCounter < 0) {
    clientIdCounter = 1;
  }
  const clientId = ++clientIdCounter;
  console.log(`New client connected: Client ${clientId}`);
  const client = { id: clientId, socket, state: "idle", move: "move" };
  client.socket.write("Your client id is  " + clientId + "\n");

  clients.push(client);

  socket.on("data", (data) => {
    const receivedData = data.toString().trim();
    console.log(`Received data from Client ${clientId}:`, receivedData);

    if (!allowed_data.includes(receivedData)) {
      socket.write(
        "Invalid input. Please enter 'rock', 'paper', or 'scissors'.\n"
      );
      return;
    }
    // console.log(client.state);

    if (client.state == "sender") {
      socket.write("Waiting for opponent's reply...\n");
      return;
    }

    client.state = "sender";
    client.move = receivedData;

    moves[clientId] = receivedData;

    clients.forEach((otherClient) => {
      if (otherClient !== client) {
        otherClient.state = "receiver";
        otherClient.socket.write(
          "Opponent has given the move now it's your turn:"
        );
      }
    });
    moves.count = moves.count + 1;

    if (moves.count == 2) {
      // console.log(moves);

      moves.count = 0;
      const r = result(moves["1"], moves["2"]);

      switch (r) {
        case "1":
          score[1]++;
          break;
        case "2":
          score[2]++;
          break;

        case "draw":
          break;
      }

      // console.log(score);
      // console.log("clientid is " + clientId.toString());
      // console.log("result is --> " + r);

      clients.forEach((client) => {
        switch (r) {
          case client.id.toString():
            client.socket.write(
              `Your opponent chose:\n${moves[client.id === 1 ? 2 : 1]}\n`
            );
            client.socket.write("You are the winner");

            break;

          case "draw":
            client.socket.write(
              `Your opponent chose:\n${moves[client.id === 1 ? 2 : 1]}\n`
            );

            client.socket.write("The result is draw\n");
            break;

          default:
            client.socket.write(
              `Your opponent chose:\n${moves[client.id === 1 ? 2 : 1]}\n`
            );

            client.socket.write("Opponent is the winner");
            break;
        }
        client.state = "idle";
      });
      return;
    }
    // console.log(moves);
  });

  socket.on("end", () => {
    console.log(`Client ${clientId} disconnected`);

    const index = clients.findIndex((client) => client.id === clientId);
    // console.log(index);
    if (index == 0) {
      clientIdCounter -= 2;
    } else {
      clientIdCounter -= 1;
    }
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

const PORT = 3000;
// const networkInterfaces = os.networkInterfaces();
// const address = networkInterfaces["Wi-Fi"][0].address;

const networkInterfaces = os.networkInterfaces();

let activeInterface = null;

for (const [name, interfaces] of Object.entries(networkInterfaces)) {
  for (const iface of interfaces) {
    console.log(iface);
    if (!iface.internal && iface.family === 'IPv4') {
      activeInterface = iface;
      console.log(`Active Interface Name: ${name}`);
      console.log(`Address: ${iface.address}`);
      console.log(`Family: ${iface.family}`);
      break;
    }
  }
  if (activeInterface) break;
}

if (!activeInterface) {
  console.log('No active network interface found.');
  return;
}

const address = activeInterface.address;

// console.log(address);
server.listen({ host: address || "0.0.0.0", port: PORT }, () => {
  console.log(`Server started on tcp://${address}:${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
