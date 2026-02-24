import axios, {type AxiosError} from 'axios';

export class FetchError extends Error {
	constructor(
		message: string,
		public code?: string,
	) {
		super(message);
		this.name = 'FetchError';
	}
}

export const fetcher = async (url: string) => {
	try {
		const res = await axios.get(url);
		return res.data;
	} catch (err) {
		const error = err as AxiosError;
		if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
			throw new FetchError('Backend is not responding. Is it running?', error.code);
		}
		if (error.response?.status === 404) {
			throw new FetchError('API endpoint not found.', 'NOT_FOUND');
		}
		throw new FetchError(error.message, error.code);
	}
};

export function convertTime(ms: number) {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours} 小时 ${minutes % 60} 分`;
	} else {
		return `${minutes} 分`;
	}
}
