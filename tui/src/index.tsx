import React, {useState} from 'react';
import {Box, render, Text, useInput} from 'ink';
import {fetcher, convertTime, FetchError} from './hooks.js';

import dotenv from 'dotenv';
dotenv.config();

const backendApiUrl = process.env['BACKEND_API_URL'] || 'http://localhost:5174';

const banner = `
██   ██ ██   ██ ███████ ████████      ██████ ██   ██ ██ ███████  █████  ███    ██
██   ██ ██   ██ ██         ██        ██      ██   ██ ██ ██      ██   ██ ████   ██
███████ ██   ██ ███████    ██        ██      ███████ ██ █████   ███████ ██ ██  ██
██   ██ ██   ██      ██    ██        ██      ██   ██ ██ ██      ██   ██ ██  ██ ██
██   ██  █████   ██████    ██         ██████ ██   ██ ██ ██      ██   ██ ██   ████
`;

const ErrorText: React.FC<{children: React.ReactNode}> = ({children}) => (
	<Text color="red">{children}</Text>
);

const SuccessText: React.FC<{children: React.ReactNode}> = ({children}) => (
	<Text color="green">{children}</Text>
);

const PromptText: React.FC<{children: React.ReactNode}> = ({children}) => (
	<Text color="cyan">{children}</Text>
);

const App: React.FC = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState<React.ReactNode[]>([]);

	const backendNote = backendApiUrl.includes('localhost')
		? 'Using local backend'
		: `Using backend at ${backendApiUrl}`;

	const commands: Record<
		string,
		() => Promise<React.ReactNode> | React.ReactNode
	> = {
		ls: async () => {
			const res = await fetcher(`${backendApiUrl}/canteen`);
			const data = res.data;
			if (!data || data.length === 0) {
				return <ErrorText>No canteens found</ErrorText>;
			}
			return (
				<Box flexDirection="column" marginY={1}>
					{data.map((c: any) => (
						<Text key={c.name}>
							{c.name}{' '}
							{c.times.map((t: any, i: number) => (
								<Text key={t} dimColor>
									{t.start} - {t.end} {i < c.times.length - 1 ? '/ ' : ''}
								</Text>
							))}
						</Text>
					))}
				</Box>
			);
		},
		open: async () => {
			const res = await fetcher(`${backendApiUrl}/canteen/status`);
			const data = res.data;
			if (!data) {
				return <ErrorText>Failed to fetch canteen status</ErrorText>;
			}
			const openedCanteens = data.filter((c: any) => c.status === 'open');
			if (openedCanteens.length === 0) {
				return <ErrorText>坏了，现在没有吃的了</ErrorText>;
			}
			return (
				<Box flexDirection="column" marginY={1}>
					{openedCanteens.map((c: any) => {
						return (
							<Text key={c.name}>
								{c.name} 还能吃 {convertTime(c.remaining)}
							</Text>
						);
					})}
				</Box>
			);
		},
		next: async () => {
			const res = await fetcher(`${backendApiUrl}/canteen/status`);
			const data = res.data;
			if (!data) {
				return <ErrorText>Failed to fetch canteen status</ErrorText>;
			}
			const closedCanteens = data.filter((c: any) => c.status === 'closed');
			if (closedCanteens.length === 0) {
				return <SuccessText>所有食堂都可以吃！</SuccessText>;
			}
			return (
				<Box flexDirection="column" marginY={1}>
					{closedCanteens.map((c: any) => {
						return (
							<Text key={c.name}>
								{c.name}{' '}
								{c.next ? (
									<SuccessText>{convertTime(c.next)} 后开饭</SuccessText>
								) : (
									<ErrorText>坏了，今天没有饭了</ErrorText>
								)}
							</Text>
						);
					})}
				</Box>
			);
		},
		health: async () => {
			const health = await fetcher(`${backendApiUrl}/health`);
			if (health.status !== 'ok') {
				return (
					<Box marginY={1}>
						<ErrorText>Backend is not healthy</ErrorText>
					</Box>
				);
			}
			return (
				<Box marginY={1}>
					<SuccessText>Backend is healthy</SuccessText>
				</Box>
			);
		},
		q: () => {
			process.exit(0);
		},
	};

	const executeCommand = async (raw: string) => {
		const trimmed = raw.replace(/^:/, '').trim();

		if (!trimmed) return;

		const command = commands[trimmed];

		if (!command) {
			setOutput(prev => [
				...prev,
				<PromptText key={`cmd-${Date.now()}`}>
					{'>'} {raw}
				</PromptText>,
				<ErrorText key={`err-${Date.now()}`}>
					Unknown command: {trimmed}
				</ErrorText>,
			]);
			return;
		}

		try {
			const result = await command();
			setOutput(prev => [
				...prev,
				<PromptText key={`cmd-${Date.now()}`}>
					{'>'} {raw}
				</PromptText>,
				<Box key={`res-${Date.now()}`}>{result}</Box>,
			]);
		} catch (err) {
			let errorMessage: string;
			if (err instanceof FetchError) {
				errorMessage = err.message;
			} else if (err instanceof Error) {
				errorMessage = err.message;
			} else {
				errorMessage = String(err);
			}
			setOutput(prev => [
				...prev,
				<PromptText key={`cmd-${Date.now()}`}>
					{'>'} {raw}
				</PromptText>,
				<ErrorText key={`err-${Date.now()}`}>
					Error: {errorMessage}
				</ErrorText>,
			]);
		}
	};

	useInput((char, key) => {
		if (key.return) {
			executeCommand(input);
			setInput('');
			return;
		}

		if (key.backspace || key.delete) {
			setInput(prev => prev.slice(0, -1));
			return;
		}

		setInput(prev => prev + char);
	});

	return (
		<Box flexDirection="column" height="100%">
			<Box>
				<Text color="cyanBright">{banner}</Text>
			</Box>

			<Box marginY={1}>
				<Text dimColor color="cyanBright">
					{backendNote}. Use `ls` to list canteens, `open` to see open canteens,
					`next` to see when closed canteens open, and `health` to check backend
					health.
				</Text>
			</Box>

			<Box flexDirection="column" flexGrow={1} marginY={1}>
				{output.map((line, i) => (
					<Box key={i}>{line}</Box>
				))}
			</Box>

			<Box>
				<Text>:{input}</Text>
			</Box>
		</Box>
	);
};

render(<App />);
