export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/fuel-prices') {
      const prices = await env.FUEL_PRICES.get('inland', 'json');
      if (prices) {
        return new Response(JSON.stringify(prices), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
      return new Response(JSON.stringify({ error: 'prices not yet loaded' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env) {
    await updateFuelPrices(env);
  },
};

async function updateFuelPrices(env) {
  try {
    const res = await fetch('https://www.aa.co.za/motoring/fuel-price/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Dealr/1.0; +https://dealr.simmico.co.za)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const prices = parseAAFuelPrices(html);

    if (prices) {
      prices.updated = new Date().toISOString();
      prices.source = 'AA South Africa';
      await env.FUEL_PRICES.put('inland', JSON.stringify(prices));
      console.log('Fuel prices updated:', JSON.stringify(prices));
    } else {
      console.error('Could not parse fuel prices from AA page');
    }
  } catch (err) {
    console.error('Fuel price update failed:', err.message);
  }
}

function parseAAFuelPrices(html) {
  // Strip HTML tags to get plain text, preserving whitespace around elements
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

  const find = (regex) => {
    const m = text.match(regex);
    return m ? parseFloat(m[1]) : null;
  };

  // Match patterns like "Petrol 95 ... 22.87" or "Petrol 95 R22.87"
  const petrol95  = find(/[Pp]etrol\s*95\b[^0-9]{0,60}?(\d{2}\.\d{2})/);
  const petrol93  = find(/[Pp]etrol\s*93\b[^0-9]{0,60}?(\d{2}\.\d{2})/);
  const diesel50  = find(/[Dd]iesel\b[^0-9]{0,30}50\s*ppm[^0-9]{0,60}?(\d{2}\.\d{2})/i)
                 ?? find(/50\s*ppm[^0-9]{0,60}?(\d{2}\.\d{2})/i);
  const diesel500 = find(/[Dd]iesel\b[^0-9]{0,30}500\s*ppm[^0-9]{0,60}?(\d{2}\.\d{2})/i)
                 ?? find(/500\s*ppm[^0-9]{0,60}?(\d{2}\.\d{2})/i);

  if (!petrol95 || !diesel50) return null;

  return {
    petrol95:  petrol95,
    petrol93:  petrol93  ?? petrol95 - 0.25,
    diesel50:  diesel50,
    diesel500: diesel500 ?? diesel50 - 0.20,
  };
}
