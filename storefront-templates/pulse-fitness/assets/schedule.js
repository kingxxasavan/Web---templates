/* ==========================================================================
   The weekly timetable, as data. This is the file you edit every week.

   day     0 = Monday … 6 = Sunday
   time    24-hour "HH:MM" — used for sorting and for the "next class" logic
   minutes class length
   type    must match a key in CLASS_TYPES below (drives the colour and filter)
   spaces  places left; 0 renders the class as full and disables booking
   ========================================================================== */

window.CLASS_TYPES = {
  strength:  { label: 'Strength',  bg: '#fdeced', fg: '#b52f35' },
  condition: { label: 'Condition', bg: '#e8f1fb', fg: '#2f6bb5' },
  mobility:  { label: 'Mobility',  bg: '#e9f5ec', fg: '#26723f' },
  skills:    { label: 'Skills',    bg: '#f4eefb', fg: '#6b3fb5' },
};

window.SCHEDULE = [
  // Monday
  { day: 0, time: '06:15', minutes: 45, name: 'Barbell Club', coach: 'Ade Fashola', type: 'strength', spaces: 4, cap: 12 },
  { day: 0, time: '12:15', minutes: 30, name: 'Express Conditioning', coach: 'Nour Haddad', type: 'condition', spaces: 8, cap: 16 },
  { day: 0, time: '18:00', minutes: 60, name: 'Strength Foundations', coach: 'Ade Fashola', type: 'strength', spaces: 0, cap: 12 },
  { day: 0, time: '19:15', minutes: 45, name: 'Hips & Shoulders', coach: 'Kit Marsden', type: 'mobility', spaces: 6, cap: 14 },

  // Tuesday
  { day: 1, time: '06:15', minutes: 45, name: 'Engine Room', coach: 'Nour Haddad', type: 'condition', spaces: 3, cap: 14 },
  { day: 1, time: '09:30', minutes: 60, name: 'Strength Foundations', coach: 'Ade Fashola', type: 'strength', spaces: 7, cap: 12 },
  { day: 1, time: '18:00', minutes: 60, name: 'Olympic Lifting', coach: 'Ade Fashola', type: 'skills', spaces: 2, cap: 8 },
  { day: 1, time: '19:15', minutes: 45, name: 'Engine Room', coach: 'Nour Haddad', type: 'condition', spaces: 5, cap: 14 },

  // Wednesday
  { day: 2, time: '06:15', minutes: 45, name: 'Barbell Club', coach: 'Ade Fashola', type: 'strength', spaces: 6, cap: 12 },
  { day: 2, time: '12:15', minutes: 30, name: 'Express Conditioning', coach: 'Kit Marsden', type: 'condition', spaces: 11, cap: 16 },
  { day: 2, time: '17:45', minutes: 60, name: 'Gymnastic Skills', coach: 'Kit Marsden', type: 'skills', spaces: 1, cap: 10 },
  { day: 2, time: '19:00', minutes: 45, name: 'Restorative', coach: 'Kit Marsden', type: 'mobility', spaces: 9, cap: 16 },

  // Thursday
  { day: 3, time: '06:15', minutes: 45, name: 'Engine Room', coach: 'Nour Haddad', type: 'condition', spaces: 0, cap: 14 },
  { day: 3, time: '09:30', minutes: 60, name: 'Strength Foundations', coach: 'Ade Fashola', type: 'strength', spaces: 8, cap: 12 },
  { day: 3, time: '18:00', minutes: 60, name: 'Olympic Lifting', coach: 'Ade Fashola', type: 'skills', spaces: 3, cap: 8 },
  { day: 3, time: '19:15', minutes: 45, name: 'Hips & Shoulders', coach: 'Kit Marsden', type: 'mobility', spaces: 7, cap: 14 },

  // Friday
  { day: 4, time: '06:15', minutes: 45, name: 'Barbell Club', coach: 'Ade Fashola', type: 'strength', spaces: 5, cap: 12 },
  { day: 4, time: '12:15', minutes: 30, name: 'Express Conditioning', coach: 'Nour Haddad', type: 'condition', spaces: 6, cap: 16 },
  { day: 4, time: '17:30', minutes: 60, name: 'Friday Partner Workout', coach: 'Nour Haddad', type: 'condition', spaces: 2, cap: 20 },

  // Saturday
  { day: 5, time: '08:00', minutes: 60, name: 'Saturday Strength', coach: 'Ade Fashola', type: 'strength', spaces: 4, cap: 14 },
  { day: 5, time: '09:15', minutes: 60, name: 'Engine Room', coach: 'Nour Haddad', type: 'condition', spaces: 0, cap: 16 },
  { day: 5, time: '10:30', minutes: 45, name: 'Restorative', coach: 'Kit Marsden', type: 'mobility', spaces: 10, cap: 18 },

  // Sunday — open gym only, no classes. The timetable renders a rest-day card.
];
