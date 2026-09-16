/* ==========================================================================
   The menu, as data. This is the only file you edit to change what is served.
   Prices are in pence. `tags` renders as small caps beneath the dish;
   the tag "v" and "vg" get the green treatment automatically.
   ========================================================================== */
window.EMBER_MENU = {
  small: {
    label: 'Small plates',
    note: 'Three or four between two is about right.',
    dishes: [
      { name: 'Focaccia, rosemary, new oil', price: 650, desc: 'Baked to order, so give it fifteen minutes.', tags: ['vg'] },
      { name: 'Anchovy, butter, sourdough', price: 800, desc: 'Cantabrian, salted eighteen months.' },
      { name: 'Burrata, blood orange, chilli', price: 1200, desc: 'Puglian burrata, oranges from the same crate as the marmalade.', tags: ['v'] },
      { name: 'Nduja croquettes, four', price: 900, desc: 'Hot in both senses. Wait a minute.' },
      { name: 'Grilled hispi, anchovy cream', price: 850, desc: 'Charred hard over the wood.', tags: [] },
      { name: 'Olives, Nocellara', price: 450, desc: 'Just olives. Good ones.', tags: ['vg'] },
    ],
  },
  pizza: {
    label: 'From the oven',
    note: 'Dough is fermented 48 hours and fired at 430°C. Bases occasionally char — that is the oven working, not a mistake.',
    dishes: [
      { name: 'Marinara', price: 1000, desc: 'Tomato, garlic, oregano, oil. No cheese, and it does not need any.', tags: ['vg'] },
      { name: 'Margherita', price: 1150, desc: 'Fior di latte, basil, oil.', tags: ['v'] },
      { name: 'Nduja &amp; honey', price: 1450, desc: 'Fior di latte, nduja, hot honey, oregano.' },
      { name: 'Mushroom, taleggio, thyme', price: 1400, desc: 'Chestnut and oyster, cooked down with garlic first.', tags: ['v'] },
      { name: 'Sausage &amp; fennel', price: 1500, desc: 'Made in-house on Tuesdays, so Monday is the one day we run out.' },
      { name: 'Potato, rosemary, pecorino', price: 1300, desc: 'Sounds wrong, is the one people come back for.', tags: ['v'] },
    ],
  },
  sides: {
    label: 'Sides & salads',
    note: '',
    dishes: [
      { name: 'Leaves, lemon, parmesan', price: 550, desc: '', tags: ['v'] },
      { name: 'Radicchio, walnut, honey', price: 700, desc: 'Bitter, and meant to be.', tags: ['v'] },
      { name: 'Roast potatoes, garlic oil', price: 600, desc: 'Cooked in the pizza oven after service starts.', tags: ['vg'] },
      { name: 'Fennel &amp; orange', price: 650, desc: '', tags: ['vg'] },
    ],
  },
  sweet: {
    label: 'Sweet',
    note: '',
    dishes: [
      { name: 'Tiramisu', price: 750, desc: 'Made that morning. When it is gone it is gone.', tags: ['v'] },
      { name: 'Affogato', price: 550, desc: 'Add amaretto for £3.', tags: ['v'] },
      { name: 'Olive oil cake, mascarpone', price: 700, desc: '', tags: ['v'] },
      { name: 'Nutella pizza, two to share', price: 900, desc: 'Not authentic. Not sorry.', tags: ['v'] },
    ],
  },
};
