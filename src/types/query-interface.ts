import { Instance } from "@/lib/axios";

export type Query = Record<string, string | number | undefined>;

export interface FetcherArgs<TQuery extends Query = Query> {
    axios: Instance;
    query: TQuery;
}

export interface OptionalFetcherArgs<TQuery extends Query = Query> {
    axios: Instance;
    query?: TQuery;
}

export interface PaginationRequestProps<TQuery extends Query = Query> {
    page?: number;
    currentPage?: number;
    rows: number;
    query: TQuery;
}