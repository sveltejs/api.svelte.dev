type TODO = any;

type Nullable<T> = T | null;
type Arrayable<T> = T | T[];
type Promisable<T> = T | Promise<T>;

declare namespace Fixed {
	type String<N extends number> = { 0: string; length: N } & string;
	type Array<N extends number, T> = N extends 0 ? never[] : { 0: T; length: N } & T[];
}

type TIMESTAMP = number;
