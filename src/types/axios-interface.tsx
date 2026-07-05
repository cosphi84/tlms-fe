import {getErrorMessage} from "@/lib/axios";

export interface ErrorResponse {
    data:{
        statusCode: number;
        message: string;
    };
    status: number;
    statusText: string;
}

export type ApiRequestError = ReturnType<typeof getErrorMessage> & {
    response: ErrorResponse;
}