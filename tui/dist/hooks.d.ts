export declare class FetchError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare const fetcher: (url: string) => Promise<any>;
export declare function convertTime(ms: number): string;
