import PocketBase from "pocketbase";
import type { TypedPocketBase } from "./pocketbase-types";

const PB_URL = process.env.PB_URL || import.meta.env.PB_URL || "http://127.0.0.1:8090/";

const pb = new PocketBase(PB_URL) as TypedPocketBase;


export default pb;