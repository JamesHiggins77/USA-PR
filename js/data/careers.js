// Political careers: when figures enter national politics and when they leave
// it (retirement or death, following their real careers where known; dates
// are approximate and a scenario assumption). Newcomers are added to their
// party's roster and become available from their entry year.
(function (G) {
  'use strict';
  var U = G.USA;
  // name: [enters, leaves] (0 = from the start / still active)
  U.CAREERS = {
    // LDP
    'Bill Clinton': [0, 2009], 'Joe Lieberman': [0, 2013], 'Ted Kennedy': [0, 2009], 'John Lewis': [0, 2020], 'Evan Bayh': [0, 2011], 'Howard Dean': [0, 2009],
    'John Kerry': [0, 2017], 'Dick Gephardt': [0, 2005], 'Nancy Pelosi': [0, 2024], 'Bob Kerrey': [0, 2001], 'Tom Daschle': [0, 2005], 'Hillary Rodham Clinton': [0, 2017],
    'Madeleine Albright': [0, 2002], 'Robert Rubin': [0, 2001], 'Janet Reno': [0, 2002], 'Henry Cisneros': [0, 1999], 'Chris Dodd': [0, 2011], 'Dianne Feinstein': [0, 2023],
    'Mario Cuomo': [0, 2002], 'Ann Richards': [0, 2001], 'Barack Obama': [2004, 2018], 'Joe Biden': [0, 2025], 'Bill Richardson': [0, 2011],
    'Kamala Harris': [2004, 0], 'Pete Buttigieg': [2012, 0], 'Cory Booker': [2006, 0], 'Amy Klobuchar': [2006, 0], 'Gavin Newsom': [2004, 0], 'Hakeem Jeffries': [2013, 0],
    'Josh Shapiro': [2017, 0], 'Raphael Warnock': [2021, 0], 'Tim Kaine': [2002, 0], 'Jon Tester': [2007, 2025], 'Joe Manchin': [2005, 2025], 'Kyrsten Sinema': [2013, 2025],
    'Chuck Schumer': [1999, 0], 'Kirsten Gillibrand': [2009, 0], "Martin O'Malley": [2007, 2016],
    // SDLP
    'Paul Wellstone': [0, 2002], 'Tom Harkin': [0, 2015], 'David Bonior': [0, 2003], 'Dennis Kucinich': [0, 2013], 'John Sweeney': [0, 2009], 'Richard Trumka': [0, 2021],
    'Barney Frank': [0, 2013], 'Jesse Jackson': [0, 2017], 'Russ Feingold': [0, 2017], 'Robert Reich': [0, 2003], 'Carl Levin': [0, 2015], 'Ed Rendell': [0, 2011],
    'Jennifer Granholm': [2002, 0], 'Debbie Stabenow': [2000, 2025], 'Elizabeth Warren': [2008, 0], 'Tim Walz': [2007, 0], 'John Fetterman': [2016, 0], 'Shawn Fain': [2023, 0],
    'Tammy Baldwin': [1999, 0], 'Keith Ellison': [2007, 0],
    // CDP
    'Dennis Hastert': [0, 2007], 'Richard Lugar': [0, 2013], 'Pete Domenici': [0, 2009], 'Olympia Snowe': [0, 2013], 'Christine Todd Whitman': [0, 2003], 'George Pataki': [0, 2007],
    'Tom Ridge': [0, 2005], 'Colin Powell': [0, 2005], 'Elizabeth Dole': [0, 2009], 'Arlen Specter': [0, 2011], 'Mitt Romney': [2002, 2025],
    'Liz Cheney': [2017, 0], 'Adam Kinzinger': [2011, 2023], 'Paul Ryan': [1999, 2019], 'Larry Hogan': [2015, 0], 'Chris Christie': [2010, 0], 'Lisa Murkowski': [2002, 0], 'Charlie Baker': [2015, 2023],
    // CC
    'Newt Gingrich': [0, 2012], 'Dick Armey': [0, 2003], 'Tom DeLay': [0, 2006], 'Trent Lott': [0, 2007], 'Ted Stevens': [0, 2009], 'Jesse Helms': [0, 2003], 'Phil Gramm': [0, 2002],
    'Dick Cheney': [0, 2009], 'Donald Rumsfeld': [0, 2007], 'John Ashcroft': [0, 2005], 'Bob Dole': [0, 2001], 'Jack Kemp': [0, 2009], 'Haley Barbour': [0, 2012], 'Bill Frist': [0, 2007],
    'Zell Miller': [0, 2005], 'Sam Nunn': [0, 2001], 'Dan Quayle': [0, 2000], 'George H. W. Bush': [0, 2010], 'Condoleezza Rice': [2001, 2009], 'Mike Pence': [2001, 0],
    'Ted Cruz': [2013, 0], 'Marco Rubio': [2011, 0], 'Nikki Haley': [2011, 0], 'Mike Huckabee': [0, 2016], 'Bobby Jindal': [2008, 2016], 'Tim Scott': [2013, 0], 'Tom Cotton': [2015, 0],
    // ASP
    'Orrin Hatch': [0, 2019], 'Mike Leavitt': [0, 2009], 'Jon Huntsman Jr.': [2004, 0], 'Bob Casey Jr.': [2004, 2025], 'Jim Jeffords': [0, 2007], 'Sam Brownback': [0, 2018], 'Joe Donnelly': [2013, 0],
    // others
    'Ross Perot': [0, 2001], 'Pat Buchanan': [0, 2012], 'Jesse Ventura': [0, 2003], 'Ralph Nader': [0, 2008], 'Peter Camejo': [0, 2008], 'Jill Stein': [2002, 0], 'Jello Biafra': [2000, 2004],
    'Cynthia McKinney': [2008, 0], 'Gus Hall': [0, 2000], 'Barbara Ehrenreich': [0, 2022], 'Ron Dellums': [0, 2018], 'Alexandria Ocasio-Cortez': [2018, 0], 'Rashida Tlaib': [2019, 0],
    'Zohran Mamdani': [2021, 0], 'Bhaskar Sunkara': [2011, 0], 'Bill de Blasio': [2001, 2022], 'Letitia James': [2004, 0], 'Jumaane Williams': [2010, 0], 'Jamaal Bowman': [2020, 0],
    'Harry Browne': [0, 2006], 'Gary Johnson': [2011, 0], 'Bill Weld': [2016, 0], 'Michael Badnarik': [2004, 2010], 'Justin Amash': [2020, 0], 'Rand Paul': [2011, 0], 'Jo Jorgensen': [2020, 0],
    'Howard Phillips': [0, 2013], 'Michael Peroutka': [2004, 0], 'Chuck Baldwin': [2004, 0], 'Virgil Goode': [2012, 0], 'Roy Moore': [2001, 0], 'Darrell Castle': [2016, 0],
    'Ron Paul': [0, 2013], 'Debra Medina': [2010, 0], 'Daniel Miller': [2005, 0], 'Larry Kilgore': [2008, 0], 'Lester Maddox': [0, 2003], 'Strom Thurmond': [0, 2003],
    'Harry F. Byrd Jr.': [0, 2001], 'Kirk Fordice': [0, 2004], 'Jerry Brown': [0, 2019], 'Tom Hayden': [0, 2016], 'Willie Brown': [0, 2004], 'Pete Wilson': [0, 1999],
    'Arnold Schwarzenegger': [2003, 2011], 'Darrell Issa': [2000, 0], 'Walter Hickel': [0, 2010], 'Sarah Palin': [2006, 0], 'Todd Palin': [2006, 2012],
    'Lowell Weicker': [0, 2000], 'Michael Bloomberg': [2001, 0], 'Carl Paladino': [2010, 0], 'Andrew Yang': [2020, 0], 'Angus King': [0, 0],
    'Ron DeSantis': [2012, 0], 'Stephen Miller': [2016, 0], 'J. D. Vance': [2022, 0], 'Marjorie Taylor Greene': [2021, 0], 'Matt Gaetz': [2017, 0], 'Elon Musk': [2024, 0],
    'Robert F. Kennedy Jr.': [2024, 0], 'Josh Hawley': [2019, 0], 'Tucker Carlson': [2024, 0]
  };
  // newcomers not yet in the 1997 rosters, by party
  var NEW = {
    ldp: ['Kamala Harris', 'Pete Buttigieg', 'Cory Booker', 'Amy Klobuchar', 'Gavin Newsom', 'Hakeem Jeffries', 'Josh Shapiro', 'Raphael Warnock', 'Tim Kaine', 'Jon Tester', 'Joe Manchin', 'Kyrsten Sinema', 'Chuck Schumer', 'Kirsten Gillibrand', "Martin O'Malley"],
    sdlp: ['Elizabeth Warren', 'Tim Walz', 'John Fetterman', 'Shawn Fain', 'Tammy Baldwin', 'Keith Ellison'],
    cdp: ['Liz Cheney', 'Adam Kinzinger', 'Paul Ryan', 'Larry Hogan', 'Chris Christie', 'Lisa Murkowski', 'Charlie Baker'],
    cc: ['Ted Cruz', 'Marco Rubio', 'Nikki Haley', 'Mike Huckabee', 'Bobby Jindal', 'Tim Scott', 'Tom Cotton'],
    asp: ['Joe Donnelly'], grn: ['Jill Stein'], dsa: ['Alexandria Ocasio-Cortez', 'Rashida Tlaib', 'Zohran Mamdani', 'Bhaskar Sunkara'],
    wfp: ['Jumaane Williams', 'Jamaal Bowman'], lib: ['Justin Amash', 'Rand Paul', 'Jo Jorgensen'], con: ['Darrell Castle'], nyfp: ['Andrew Yang'],
    maga: ['J. D. Vance', 'Marjorie Taylor Greene', 'Matt Gaetz', 'Elon Musk', 'Robert F. Kennedy Jr.', 'Josh Hawley'], afp: ['Tucker Carlson']
  };
  for (var p in NEW) if (U.PEOPLE[p]) NEW[p].forEach(function (n) { if (U.PEOPLE[p].indexOf(n) < 0) U.PEOPLE[p].push(n); if (U.PERSON_PARTY) U.PERSON_PARTY[n] = U.PERSON_PARTY[n] || p; });
  U.NEWCOMERS = NEW;
  // is a person active in national politics in a given year?
  U.activeIn = function (name, year) { var c = U.CAREERS[name]; if (!c) return true; return (!c[0] || year >= c[0]) && (!c[1] || year < c[1]); };
})(typeof globalThis !== 'undefined' ? globalThis : window);
