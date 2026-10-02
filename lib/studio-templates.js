// The Foundry Studio collection: original templates designed and written for
// this store, photo-led where the business needs it. Photographs are
// CC BY 2.0 (credited in each template's credits.html and README); everything
// else is covered by the Foundry licence.
export const STUDIO_TEMPLATES = [
  {
    slug: "saltbox-seafood",
    name: "Saltbox",
    tagline: "Seafood restaurant & oyster bar",
    category: "Restaurants & food",
    tier: "premium",
    blurb:
      "A photo-led site for a seafood restaurant: a daily catch board, a filterable menu, a booking flow with real time slots and a private dining page.",
    audience: "Seafood restaurants, oyster bars, fish kitchens, coastal bistros",
    keywords: ["seafood", "fish", "oysters", "restaurant", "bistro", "booking", "private dining", "menu"],
    stack: ["HTML", "CSS", "Vanilla JS"],
    livePreview: true,
    photos: true,
    pageList: [
      { file: "index.html", name: "Home", blurb: "Photo hero, today's catch board, story, signature dishes, oyster list and visit block.", try: "The top line works out whether the restaurant is open right now." },
      { file: "menu.html", name: "Menu", blurb: "Six sections with tabs and gluten-free and vegetarian filters.", try: "Tick Gluten-free, then switch sections: dishes that don't fit drop out." },
      { file: "book.html", name: "Book a table", blurb: "Date, party size, live time slots, seating choice and a running summary.", try: "Pick a Monday: the form knows it's closed. Pick a Friday and choose a time." },
      { file: "visit.html", name: "Visit & private dining", blurb: "Hours, directions, three private dining packages, an enquiry form and an FAQ.", try: "Send the enquiry form empty to see each field explain what it needs." },
    ],
    pages: 4,
    features: [
      "Daily catch board that dates itself",
      "Menu filters for gluten-free and vegetarian",
      "Booking form with time slots built from your opening hours",
      "Open-now status on every page",
      "Private dining packages with an enquiry form",
      "Real photography, credited (CC BY 2.0)",
    ],
    build: "Open index.html",
  },
];
