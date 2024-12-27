import * as vscode from 'vscode';

const BASE_PROMPT = 'You are a helpful code tutor. Your job is to teach the user with simple descriptions and sample code of the concept. Respond with a guided overview of the concept in a series of messages. Do not give the user the answer directly, but guide them to find the answer themselves. If the user asks a non-programming question, politely decline to respond.';

export function activate(context: vscode.ExtensionContext) {
	console.log("activate!!", context);
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		const prompt = BASE_PROMPT;
		const messages = [
			vscode.LanguageModelChatMessage.User(prompt),
		];

		context.history.map((h) => {
			console.log("h!!", h);
		});

		const previousMessages = context.history.filter(
			(h) => h instanceof vscode.ChatResponseTurn
		);

		for (const m of previousMessages) {
			let fullMessage = '';
			for (const r of m.response) {
				const mdPart = r as vscode.ChatResponseMarkdownPart;
				fullMessage += mdPart.value.value;
			}
			messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
			console.log("fullMessage!!", fullMessage);
		}

		messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

		const chatResponse = await request.model.sendRequest(messages, {}, token);

		for await (const fragment of chatResponse.text) {
			stream.markdown(fragment);
		}

		return;

	};

	const tutor = vscode.chat.createChatParticipant("chat2.code-tutor", handler);
	tutor.iconPath = vscode.Uri.joinPath(context.extensionUri, 'tutor.jpeg');
	console.log("tutor.iconPath!!", tutor.iconPath);
}

export function deactivate() {}
