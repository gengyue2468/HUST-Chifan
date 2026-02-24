import React, { useState } from 'react';
import { Box, render, Text, useInput } from 'ink';
import { fetcher, convertTime, FetchError } from './hooks.js';
import dotenv from 'dotenv';
dotenv.config();
const backendApiUrl = process.env['BACKEND_API_URL'] || 'http://localhost:3000';
const banner = `
██   ██ ██   ██ ███████ ████████      ██████ ██   ██ ██ ███████  █████  ███    ██
██   ██ ██   ██ ██         ██        ██      ██   ██ ██ ██      ██   ██ ████   ██
███████ ██   ██ ███████    ██        ██      ███████ ██ █████   ███████ ██ ██  ██
██   ██ ██   ██      ██    ██        ██      ██   ██ ██ ██      ██   ██ ██  ██ ██
██   ██  █████   ██████    ██         ██████ ██   ██ ██ ██      ██   ██ ██   ████
`;
const ErrorText = ({ children }) => (React.createElement(Text, { color: "red" }, children));
const SuccessText = ({ children }) => (React.createElement(Text, { color: "green" }, children));
const PromptText = ({ children }) => (React.createElement(Text, { color: "cyan" }, children));
const App = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState([]);
    const backendNote = backendApiUrl.includes('localhost')
        ? 'Using local backend'
        : `Using backend at ${backendApiUrl}`;
    const commands = {
        ls: async () => {
            const res = await fetcher(`${backendApiUrl}/canteen`);
            const data = res.data;
            if (!data || data.length === 0) {
                return React.createElement(ErrorText, null, "No canteens found");
            }
            return (React.createElement(Box, { flexDirection: "column", marginY: 1 }, data.map((c) => (React.createElement(Text, { key: c.name },
                c.name,
                ' ',
                c.times.map((t, i) => (React.createElement(Text, { key: t, dimColor: true },
                    t.start,
                    " - ",
                    t.end,
                    " ",
                    i < c.times.length - 1 ? '/ ' : ''))))))));
        },
        open: async () => {
            const res = await fetcher(`${backendApiUrl}/canteen/status`);
            const data = res.data;
            if (!data) {
                return React.createElement(ErrorText, null, "Failed to fetch canteen status");
            }
            const openedCanteens = data.filter((c) => c.status === 'open');
            if (openedCanteens.length === 0) {
                return React.createElement(ErrorText, null, "\u574F\u4E86\uFF0C\u73B0\u5728\u6CA1\u6709\u5403\u7684\u4E86");
            }
            return (React.createElement(Box, { flexDirection: "column", marginY: 1 }, openedCanteens.map((c) => {
                return (React.createElement(Text, { key: c.name },
                    c.name,
                    " \u8FD8\u80FD\u5403 ",
                    convertTime(c.remaining)));
            })));
        },
        next: async () => {
            const res = await fetcher(`${backendApiUrl}/canteen/status`);
            const data = res.data;
            if (!data) {
                return React.createElement(ErrorText, null, "Failed to fetch canteen status");
            }
            const closedCanteens = data.filter((c) => c.status === 'closed');
            if (closedCanteens.length === 0) {
                return React.createElement(SuccessText, null, "\u6240\u6709\u98DF\u5802\u90FD\u53EF\u4EE5\u5403\uFF01");
            }
            return (React.createElement(Box, { flexDirection: "column", marginY: 1 }, closedCanteens.map((c) => {
                return (React.createElement(Text, { key: c.name },
                    c.name,
                    ' ',
                    c.next ? (React.createElement(SuccessText, null,
                        convertTime(c.next),
                        " \u540E\u5F00\u996D")) : (React.createElement(ErrorText, null, "\u574F\u4E86\uFF0C\u4ECA\u5929\u6CA1\u6709\u996D\u4E86"))));
            })));
        },
        health: async () => {
            const health = await fetcher(`${backendApiUrl}/health`);
            if (health.status !== 'ok') {
                return (React.createElement(Box, { marginY: 1 },
                    React.createElement(ErrorText, null, "Backend is not healthy")));
            }
            return (React.createElement(Box, { marginY: 1 },
                React.createElement(SuccessText, null, "Backend is healthy")));
        },
        q: () => {
            process.exit(0);
        },
    };
    const executeCommand = async (raw) => {
        const trimmed = raw.replace(/^:/, '').trim();
        if (!trimmed)
            return;
        const command = commands[trimmed];
        if (!command) {
            setOutput(prev => [
                ...prev,
                React.createElement(PromptText, { key: `cmd-${Date.now()}` },
                    '>',
                    " ",
                    raw),
                React.createElement(ErrorText, { key: `err-${Date.now()}` },
                    "Unknown command: ",
                    trimmed),
            ]);
            return;
        }
        try {
            const result = await command();
            setOutput(prev => [
                ...prev,
                React.createElement(PromptText, { key: `cmd-${Date.now()}` },
                    '>',
                    " ",
                    raw),
                React.createElement(Box, { key: `res-${Date.now()}` }, result),
            ]);
        }
        catch (err) {
            let errorMessage;
            if (err instanceof FetchError) {
                errorMessage = err.message;
            }
            else if (err instanceof Error) {
                errorMessage = err.message;
            }
            else {
                errorMessage = String(err);
            }
            setOutput(prev => [
                ...prev,
                React.createElement(PromptText, { key: `cmd-${Date.now()}` },
                    '>',
                    " ",
                    raw),
                React.createElement(ErrorText, { key: `err-${Date.now()}` },
                    "Error: ",
                    errorMessage),
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
    return (React.createElement(Box, { flexDirection: "column", height: "100%" },
        React.createElement(Box, null,
            React.createElement(Text, { color: "cyanBright" }, banner)),
        React.createElement(Box, { marginY: 1 },
            React.createElement(Text, { dimColor: true, color: "cyanBright" },
                backendNote,
                ". Use `ls` to list canteens, `open` to see open canteens, `next` to see when closed canteens open, and `health` to check backend health.")),
        React.createElement(Box, { flexDirection: "column", flexGrow: 1, marginY: 1 }, output.map((line, i) => (React.createElement(Box, { key: i }, line)))),
        React.createElement(Box, null,
            React.createElement(Text, null,
                ":",
                input))));
};
render(React.createElement(App, null));
