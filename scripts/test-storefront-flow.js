const BACKEND_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_8ce9c3ec20d7421b134a24f0b5557c817456fcc960beba2acb3a2f955f5f37c9';

async function testStorefrontFlow() {
  console.log('=== 1. Login as approved customer ===');
  const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      email: 'manoj.orders@ingredientsbazar.com',
      password: 'Password123!',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Login token obtained:', !!token);

  const authHeaders = {
    'content-type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY,
    authorization: `Bearer ${token}`,
  };

  console.log('=== 2. Retrieve customer /me with groups ===');
  const custRes = await fetch(`${BACKEND_URL}/store/customers/me?fields=*groups`, {
    headers: authHeaders,
  });
  const custData = await custRes.json();
  const isApproved = custData.customer?.groups?.some(g => g.name === 'Approved');
  console.log('Customer id:', custData.customer?.id, 'Email:', custData.customer?.email, 'isApproved:', isApproved);

  console.log('=== 3. Get Region ===');
  const regionRes = await fetch(`${BACKEND_URL}/store/regions`, {
    headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const { regions } = await regionRes.json();
  const inRegion = regions.find(r => r.countries.some(c => c.iso_2 === 'in'));
  console.log('Region for IN:', inRegion?.id);

  console.log('=== 4. Create Cart ===');
  const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      region_id: inRegion.id,
    }),
  });
  const { cart } = await cartRes.json();
  console.log('Cart created:', cart?.id);

  console.log('=== 5. Get Product Variant ===');
  const prodRes = await fetch(`${BACKEND_URL}/store/products?handle=sunfiber-fgi-taiyo-13023239`, {
    headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
  });
  const prodData = await prodRes.json();
  const product = prodData.products?.[0];
  
  // Fetch variants for this product
  const varRes = await fetch(`${BACKEND_URL}/store/product-variants?product_id=${product.id}`, {
    headers: authHeaders,
  });
  const varData = await varRes.json();
  const variant = varData.variants?.[0];
  console.log('Product:', product?.title, 'Variant ID:', variant?.id, 'Metadata min_quantity:', variant?.metadata?.min_quantity);

  console.log('=== 6. Add Line Item to Cart (qty: 10) ===');
  const itemRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      variant_id: variant.id,
      quantity: 10,
    }),
  });
  const itemData = await itemRes.json();
  console.log('Line item added status:', itemRes.status, 'Items count:', itemData.cart?.items?.length, 'Item total:', itemData.cart?.items?.[0]?.total);

  console.log('=== 7. Set Shipping and Billing Addresses (Checkout Step 1) ===');
  const addrRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      shipping_address: {
        first_name: 'Manoj',
        last_name: 'Kumar',
        address_1: '123 MG Road',
        city: 'Bengaluru',
        country_code: 'in',
        postal_code: '560001',
        phone: '917619114115',
        company: 'IBazaar Tech Pvt Ltd',
        province: 'Karnataka',
      },
      billing_address: {
        first_name: 'Manoj',
        last_name: 'Kumar',
        address_1: '123 MG Road',
        city: 'Bengaluru',
        country_code: 'in',
        postal_code: '560001',
        phone: '917619114115',
        company: 'IBazaar Tech Pvt Ltd',
        province: 'Karnataka',
      },
      email: 'manoj.orders@ingredientsbazar.com',
    }),
  });
  const addrData = await addrRes.json();
  console.log('Address set status:', addrRes.status, 'Cart shipping addr:', !!addrData.cart?.shipping_address);

  console.log('=== 8. List Shipping Options ===');
  const shipOptRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
    headers: authHeaders,
  });
  const shipOptData = await shipOptRes.json();
  console.log('Available shipping options:', shipOptData.shipping_options?.map(s => ({ id: s.id, name: s.name, price_type: s.price_type, amount: s.amount })));

  const shippingOption = shipOptData.shipping_options?.[0];
  if (!shippingOption) {
    console.error('No shipping option found for cart!');
    return;
  }

  console.log('=== 9. Select Shipping Method ===');
  const addShipRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      option_id: shippingOption.id,
    }),
  });
  const addShipData = await addShipRes.json();
  console.log('Shipping method added status:', addShipRes.status, 'Total:', addShipData.cart?.total);

  console.log('=== 10. List Payment Providers ===');
  const payProvRes = await fetch(`${BACKEND_URL}/store/payment-providers?region_id=${inRegion.id}`, {
    headers: authHeaders,
  });
  const payProvData = await payProvRes.json();
  console.log('Payment providers:', payProvData.payment_providers);

  console.log('=== 11. Initiate Payment Session ===');
  const cartWithPayment = await fetch(`${BACKEND_URL}/store/carts/${cart.id}?fields=*payment_collection.payment_sessions`, {
    headers: authHeaders,
  }).then(r => r.json());

  let paymentCollectionId = cartWithPayment.cart?.payment_collection?.id;
  if (!paymentCollectionId) {
    const initPayRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        cart_id: cart.id,
      }),
    });
    const initPayData = await initPayRes.json();
    paymentCollectionId = initPayData.payment_collection?.id;
  }
  console.log('Cart payment collection:', paymentCollectionId);

  const initSessionRes = await fetch(`${BACKEND_URL}/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      provider_id: 'pp_system_default',
    }),
  });
  const initSessionData = await initSessionRes.json();
  console.log('Payment session status:', initSessionRes.status, 'Session provider:', initSessionData.payment_collection?.payment_sessions?.[0]?.provider_id);

  console.log('=== 12. Complete Cart (Place Order) ===');
  const completeRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
    method: 'POST',
    headers: authHeaders,
  });
  const completeData = await completeRes.json();
  console.log('Complete cart status:', completeRes.status, 'Type:', completeData.type, 'Order ID:', completeData.order?.id, 'Display ID:', completeData.order?.display_id);
}

testStorefrontFlow().catch(console.error);
