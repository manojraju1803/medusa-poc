#!/usr/bin/env node

/**
 * WhatsApp Cloud API Test & Simulation Script for IngredientsBazar
 * 
 * Usage:
 *   node scripts/test-whatsapp.js <PHONE_NUMBER> [MODE/MESSAGE] [OPTIONS...]
 * 
 * Modes:
 *   1. Order Confirmation:
 *      node scripts/test-whatsapp.js <PHONE> confirmed [ORDER_NO] [CUSTOMER_NAME] [TOTAL_AMOUNT]
 *      node scripts/test-whatsapp.js 917619114115 confirmed 1042 "Phanendra" "₹14,500"
 * 
 *   2. Order Dispatched / Shipped:
 *      node scripts/test-whatsapp.js <PHONE> dispatched [ORDER_NO] [CUSTOMER_NAME] [TRACKING_NO] [CARRIER]
 *      node scripts/test-whatsapp.js 917619114115 dispatched 1042 "Phanendra" "BLUEDART-98765432" "BlueDart Express"
 * 
 *   3. Custom Message:
 *      node scripts/test-whatsapp.js <PHONE> "Your custom message here"
 */

const fs = require('fs');
const path = require('path');

// 1. Load environment variables from apps/backend/.env
function loadEnv() {
  const envPath = path.resolve(__dirname, '../apps/backend/.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

loadEnv();

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '616368184901733';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const STOREFRONT_URL = process.env.STOREFRONT_URL || 'https://storefront-snowy-iota.vercel.app';

function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.length === 10) {
    cleaned = '91' + cleaned; // default India code
  }
  return cleaned;
}

function buildMessagePayload(mode, args, recipient) {
  const normalizedMode = (mode || '').toLowerCase().trim();

  // Mode 0: Hello World Template
  if (normalizedMode === 'hello_world' || normalizedMode === 'template' || normalizedMode === 'hello') {
    return {
      type: 'Hello World Template',
      isTemplate: true,
      templateName: 'hello_world',
      languageCode: 'en_US',
    };
  }

  // Mode 1: Order Confirmation
  if (normalizedMode === 'confirmed' || normalizedMode === 'placed' || normalizedMode === 'order-placed' || normalizedMode === 'order-confirmation') {
    const orderNumber = args[0] ? `#${args[0].replace(/^#/, '')}` : '#1042';
    const customerName = args[1] || 'Valued Customer';
    const totalAmount = args[2] || '₹12,450';
    const orderUrl = `${STOREFRONT_URL}/in/account/orders`;

    return {
      type: 'Order Confirmation',
      header: '🎉 Order Confirmed',
      body: `Hi ${customerName},\n\nThank you for ordering with IngredientsBazar!\n\nYour order ${orderNumber} for ${totalAmount} has been placed successfully and is now being prepared for fulfillment.\n\nClick below to view full order invoice & summary.`,
      footer: 'IngredientsBazar Customer Support',
      buttonText: 'View Order Details',
      buttonUrl: orderUrl,
    };
  }

  // Mode 2: Order Dispatched
  if (normalizedMode === 'dispatched' || normalizedMode === 'shipped' || normalizedMode === 'order-dispatched' || normalizedMode === 'dispatch') {
    const orderNumber = args[0] ? `#${args[0].replace(/^#/, '')}` : '#1042';
    const customerName = args[1] || 'Valued Customer';
    const trackingNo = args[2] || 'EXP-8891234';
    const carrier = args[3] || 'Delhivery Logistics';
    const trackingUrl = `${STOREFRONT_URL}/in/account/orders`;

    return {
      type: 'Order Dispatched',
      header: '🚚 Order Dispatched',
      body: `Hi ${customerName},\n\nGreat news! Your IngredientsBazar order ${orderNumber} has been handed over to ${carrier}.\n\nTracking Number: ${trackingNo}\nEstimated Delivery: 2-3 Business Days.\n\nClick below to track your live shipment.`,
      footer: 'IngredientsBazar Logistics',
      buttonText: 'Track Live Shipment',
      buttonUrl: trackingUrl,
    };
  }

  // Mode 3: Custom Text
  const customMessage = mode || 'Hello! This is a test notification from IngredientsBazar WhatsApp Integration.';
  return {
    type: 'Custom Message',
    header: 'IngredientsBazar Notification',
    body: customMessage,
    footer: 'IngredientsBazar Automated Support',
    buttonText: 'Visit Storefront',
    buttonUrl: STOREFRONT_URL,
  };
}

async function run() {
  const rawRecipient = process.argv[2];
  const modeOrMessage = process.argv[3];
  const extraArgs = process.argv.slice(4);

  if (!rawRecipient) {
    console.error('\n❌ ERROR: Please provide a recipient phone number.\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 IngredientsBazar WhatsApp Messenger Usage:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('0️⃣  Hello World Template:');
    console.log('   node scripts/test-whatsapp.js <PHONE> hello_world\n');
    console.log('1️⃣  Order Confirmation:');
    console.log('   node scripts/test-whatsapp.js <PHONE> confirmed [ORDER_NO] [CUSTOMER_NAME] [TOTAL_AMOUNT]\n');
    console.log('2️⃣  Order Dispatched:');
    console.log('   node scripts/test-whatsapp.js <PHONE> dispatched [ORDER_NO] [CUSTOMER_NAME] [TRACKING_NO] [CARRIER]\n');
    console.log('3️⃣  Custom Message:');
    console.log('   node scripts/test-whatsapp.js <PHONE> "Your custom test message here"\n');
    process.exit(1);
  }

  if (!ACCESS_TOKEN) {
    console.error('❌ ERROR: WHATSAPP_ACCESS_TOKEN is missing in apps/backend/.env or environment.\n');
    process.exit(1);
  }

  const recipient = normalizePhone(rawRecipient);
  const msgConfig = buildMessagePayload(modeOrMessage, extraArgs, recipient);

  console.log('\n======================================================');
  console.log(`🚀 IngredientsBazar WhatsApp: [${msgConfig.type}]`);
  console.log('======================================================');
  console.log(`📱 Phone Number ID  : ${PHONE_ID}`);
  console.log(`👤 Recipient Phone  : ${recipient}`);

  let payload;
  if (msgConfig.isTemplate) {
    console.log(`🏷️  Template Name    : ${msgConfig.templateName} (${msgConfig.languageCode})`);
    console.log('------------------------------------------------------\n');
    payload = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: msgConfig.templateName,
        language: {
          code: msgConfig.languageCode,
        },
      },
    };
  } else {
    console.log(`🏷️  Header           : ${msgConfig.header}`);
    console.log(`💬 Body Message     :\n${msgConfig.body}`);
    console.log(`🔘 CTA Button       : [${msgConfig.buttonText}] -> ${msgConfig.buttonUrl}`);
    console.log('------------------------------------------------------\n');
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'interactive',
      interactive: {
        type: 'cta_url',
        header: {
          type: 'text',
          text: msgConfig.header,
        },
        body: {
          text: msgConfig.body,
        },
        footer: {
          text: msgConfig.footer,
        },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: msgConfig.buttonText,
            url: msgConfig.buttonUrl,
          },
        },
      },
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`;
    console.log('⏳ Dispatching to Meta Graph API...');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('\n❌ META GRAPH API ERROR:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('\n✅ SUCCESS! WhatsApp message delivered successfully.');
    console.log(`📬 Message ID: ${data.messages?.[0]?.id || 'N/A'}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ NETWORK EXCEPTION:', err.message || err);
    process.exit(1);
  }
}

run();
