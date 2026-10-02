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
  {
    slug: "signal-conference",
    name: "Signal",
    tagline: "Tech conference",
    category: "Events & courses",
    tier: "premium",
    blurb:
      "A bold conference site with a live countdown, four colour-coded tracks, speaker bios, a schedule visitors can star and filter, and a ticket checkout.",
    audience: "Conferences, summits, meetups, festivals of ideas",
    keywords: ["conference", "event", "summit", "tickets", "schedule", "speakers", "agenda", "tech"],
    stack: ["HTML", "CSS", "Vanilla JS"],
    livePreview: true,
    pageList: [
      { file: "index.html", name: "Overview", blurb: "Countdown hero, tracks, speakers, venue map, ticket tiers and FAQ.", try: "Select a speaker to open their bio and session." },
      { file: "schedule.html", name: "Schedule", blurb: "Two days of sessions with day tabs, track filters and a personal schedule.", try: "Star two sessions, then switch on My schedule." },
      { file: "speakers.html", name: "Speakers", blurb: "Sixteen speakers with monogram avatars, filterable by track.", try: "Filter to Design, then open a bio." },
      { file: "tickets.html", name: "Tickets", blurb: "Ticket quantities, a live order summary, promo codes and the attendee form.", try: "Add two tickets and apply the code COMMUNITY15." },
    ],
    pages: 4,
    features: [
      "Live countdown to the first session",
      "Schedule with day tabs, track filters and starred sessions",
      "Speaker bios in an accessible dialog",
      "Ticket checkout with quantities and promo codes",
      "Hand-drawn venue map",
      "Works before you have headshots: monogram avatars",
    ],
    build: "Open index.html",
  },
];
