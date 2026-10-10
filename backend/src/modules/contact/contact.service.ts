import { prisma } from "../../database/prisma";
import { notify } from "../../services/mail.service";
import { HttpError } from "../../utils/httpError";
import type { ContactInput } from "./contact.types";

const MAX_MESSAGES = 3; // per IP ...
const WINDOW_MINUTES = 10; // ... within this many minutes

/** Saves the message (max 3 per IP per 10 minutes) and emails it to the owner. */
export async function saveContactMessage(
  contactMessage: ContactInput,
  ip: string,
): Promise<void> {
  const recent = await prisma.message.count({
    where: {
      ip,
      created_at: { gt: new Date(Date.now() - WINDOW_MINUTES * 60 * 1000) },
    },
  });
  if (recent >= MAX_MESSAGES) {
    throw new HttpError(
      429,
      "Too many messages. Please try again in a few minutes.",
    );
  }

  const saved = await prisma.message.create({
    data: {
      name: contactMessage.name,
      email: contactMessage.email,
      message: contactMessage.message,
      ip,
    },
    select: { id: true },
  });

  // The message is already saved; a failed email must not make the visitor's request fail.
  let sent = false;
  try {
    sent = await notify(contactMessage);
  } catch (error) {
    console.error("mail failed:", (error as Error).message);
  }
  if (sent)
    await prisma.message.update({
      where: { id: saved.id },
      data: { notified: true },
    });
}
