import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import {
  ContainerRegistrationKeys,
  Modules,
} from '@medusajs/framework/utils';

type PasswordResetData = {
  entity_id: string;
  actor_type: string;
  token: string;
};

// Medusa's /auth/customer/emailpass/reset-password route only creates the
// token and emits `auth.password_reset`; delivering the link is ours to do.
// The link opens the storefront's reset page, which posts the new password to
// /auth/customer/emailpass/update. Tokens expire after 15 minutes.
export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetData>) {
  if (data.actor_type !== 'customer') return;

  const storefrontUrl = (
    process.env.STOREFRONT_URL || 'http://localhost:8000'
  ).replace(/\/$/, '');
  const url =
    `${storefrontUrl}/reset-password` +
    `?token=${encodeURIComponent(data.token)}` +
    `&email=${encodeURIComponent(data.entity_id)}`;

  // Until a real e-mail provider is configured, the link is only visible in
  // the server log; print it on its own line so it's easy to find in dev.
  if (process.env.NODE_ENV !== 'production') {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    logger.info(`PASSWORD RESET LINK for ${data.entity_id}: ${url}`);
  }

  const notificationService = container.resolve(Modules.NOTIFICATION);
  await notificationService.createNotifications({
    to: data.entity_id,
    channel: 'email',
    template: 'password-reset',
    data: { url, email: data.entity_id },
  });
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
};
