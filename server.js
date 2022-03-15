const WebSocketServer = require("websocket").server;
const http = require("http");

const server = http.createServer(function(request, response) {
	console.log(`${new Date() } Received request for ${ request.url}`);
	response.writeHead(404);
	response.end();
});
server.listen(8080, function() {
	console.log(`${new Date() } Server is listening on port 8080`);
});
const tokens = ["token1", "token2"];
const users = new Map();
const wsServer = new WebSocketServer({
	"httpServer": server,
	"autoAcceptConnections": false
});
wsServer.on("request", request => {
	const connection = request.accept();
	connection.on("message", data => {
		if (data.type != "utf8") connection.close();
		const data_parse = JSON.parse(data.utf8Data);
		if ((tokens.indexOf(data_parse.d.token) < 0 && data_parse.op == 1) || (users[data_parse.d.token] && data_parse.op == 1)) {
			connection.close();
		} else if (data_parse.op == 1) {
			users.set(data_parse.d.token, new user(connection, data_parse.d.token, data_parse.d.user_name));
		}

	});

});
class user {
	constructor(connection, token, username) {
		this.connection = connection;
		this.token = token;
		this.username = username;
		this.analys_message();
		this.send_hello();
	}
	send_hello() {
		const data = {
			"op": 2,
			"d": null
		};
		this.connection.sendUTF(JSON.stringify(data));
	}
	analys_message() {
		this.connection.on("message", data => {
			if (data.type != "utf8") this.connection.close();
			const data_parse = JSON.parse(data.utf8Data);
			if (data_parse.op == 3 && data_parse.d.msg != null) {
				const msg = {
					"op": 4,
					"d": {
						"msg": data_parse.d.msg,
						"user_name": this.username
					}
				};
				const sends = new Map(users);
				sends.delete(this.token);
				sends.forEach(user_ => {
					user_.connection.sendUTF(JSON.stringify(msg));
				});
			}
		});
	}
}