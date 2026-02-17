import { EventEmitter } from "node:events";
import { createAlert } from "../utils/createAlert.js";

export const uploadEvents = new EventEmitter();

uploadEvents.on("notes-added", createAlert);
