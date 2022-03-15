const { EventEmitter } = require("stream");

const WebSocketClient = require("websocket").client;


const client = new WebSocketClient();
let conn = null;
client.on("connect", connection => {
	conn = connection;
	connection.on("message", data => {
		if (data.type === "utf8") {
			const msg = JSON.parse(data.utf8Data);
			if (msg.op == 4) {
				console.log(`${msg.d.user_name}: ${msg.d.msg}`);
			}
		}
	});
	const data = {
		"op": 1,
		"d": {
			"token": "token2",
			"user_name": "aov2"
		}
	};
	connection.sendUTF(JSON.stringify(data));
	const main_ = new main();
	main_.start();
});
client.connect("ws://localhost:8080");
class main extends EventEmitter {
	constructor() {
		super();
		this.on("text", async () => {
			const text = await this.Ask("");
			if (conn != null) {
				const data = {
					"op": 3,
					"d": {
						"msg": text
					}
				};

				conn.sendUTF(JSON.stringify(data));
				this.emit("text");
			}
		});
	}
	start() {
		this.emit("text");
	}
	Ask(query) {
		const readline = require("readline").createInterface({
			"input": process.stdin,
			"output": process.stdout
		});

		return new Promise(resolve => readline.question(query, ans => {
			readline.close();
			resolve(ans);
		}));
	}

}


