// Politicians: real historical figures, placed in this setting's parties by
// their real-world politics (designer request). The first name in each list
// is the party's leader at the start (or at its founding). Party placement,
// roles and ratings are scenario assumptions, not claims about these people.
// For the regionalist, secessionist and far-right parties, only figures who
// publicly held matching views (secession, states' rights, regional
// nationalism, hard-right nationalism) are used.
(function (G) {
  'use strict';
  var U = G.USA;
  U.PEOPLE = {
    ldp: ['Al Gore', 'Bill Clinton', 'Joe Lieberman', 'Ted Kennedy', 'John Lewis', 'Evan Bayh', 'Howard Dean', 'John Kerry', 'Dick Gephardt',
      'Nancy Pelosi', 'Steny Hoyer', 'Bob Kerrey', 'Tom Daschle', 'Hillary Rodham Clinton', 'Madeleine Albright', 'Robert Rubin', 'Janet Reno',
      'Bill Richardson', 'Henry Cisneros', 'Joe Biden', 'Chris Dodd', 'Dianne Feinstein', 'Mario Cuomo', 'Ann Richards', 'Barack Obama'],
    sdlp: ['Bill Bradley', 'Paul Wellstone', 'Tom Harkin', 'David Bonior', 'Marcy Kaptur', 'Sherrod Brown', 'Dennis Kucinich', 'John Sweeney',
      'Richard Trumka', 'Barney Frank', 'Maxine Waters', 'Jesse Jackson', 'Russ Feingold', 'Patty Murray', 'Robert Reich', 'Ted Strickland',
      'Ed Rendell', 'Jennifer Granholm', 'Carl Levin', 'Debbie Stabenow'],
    cdp: ['John McCain', 'Dennis Hastert', 'Chris Shays', 'Fred Upton', 'Richard Lugar', 'Pete Domenici', 'Olympia Snowe', 'Susan Collins',
      'Christine Todd Whitman', 'George Pataki', 'Tom Ridge', 'Colin Powell', 'Elizabeth Dole', 'Arlen Specter', 'Mitt Romney'],
    cc: ['George W. Bush', 'Newt Gingrich', 'Dick Armey', 'Tom DeLay', 'Trent Lott', 'Ted Stevens', 'Jesse Helms', 'Phil Gramm',
      'Dick Cheney', 'Donald Rumsfeld', 'John Ashcroft', 'Jeb Bush', 'Bob Dole', 'Jack Kemp', 'Haley Barbour', 'Mitch McConnell', 'Bill Frist',
      'Zell Miller', 'Sam Nunn', 'Mike Pence', 'John Kasich', 'Lindsey Graham', 'Rick Santorum', 'Condoleezza Rice', 'Dan Quayle', 'George H. W. Bush'],
    asp: ['Orrin Hatch', 'Mike Leavitt', 'Jon Huntsman Jr.', 'Bob Casey Jr.', 'Bart Stupak', 'Lincoln Chafee', 'Jim Jeffords', 'Sam Brownback'],
    reform: ['Ross Perot', 'Pat Buchanan', 'Jesse Ventura', 'Russ Verney', 'Pat Choate', 'Dean Barkley', 'Jack Gargan'],
    grn: ['Ralph Nader', 'Winona LaDuke', 'Medea Benjamin', 'Peter Camejo', 'Howie Hawkins', 'Jello Biafra', 'Cynthia McKinney'],
    cpusa: ['Gus Hall', 'Sam Webb', 'Angela Davis', 'Jarvis Tyner'],
    dsa: ['Barbara Ehrenreich', 'Cornel West', 'Ron Dellums', 'Major Owens', 'Danny Davis'],
    wfp: ['Dan Cantor', 'Bertha Lewis', 'Bill de Blasio', 'Letitia James', 'Stanley Aronowitz'],
    revsoc: ['Gloria La Riva', 'Brian Becker', 'Larry Holmes', 'James Harris', 'David North'],
    vpp: ['Peter Clavelle', 'Bernie Sanders', 'Anthony Pollina', 'Terry Bouricius', 'Bob Kiss', 'David Zuckerman'],
    ul: ['Bernie Sanders'],
    lib: ['Harry Browne', 'David Bergland', 'Gary Johnson', 'Andre Marrou', 'Michael Badnarik', 'Bill Weld'],
    con: ['Howard Phillips', 'Michael Peroutka', 'Chuck Baldwin', 'Alan Keyes', 'Virgil Goode', 'Roy Moore'],
    acp: ['Haz Al-Din', 'Jackson Hinkle', 'Chris Helali', 'Caleb Maupin'],
    maga: ['Donald Trump', 'Steve Bannon', 'Kellyanne Conway', 'Rudy Giuliani', 'Jeff Sessions', 'Stephen Miller', 'Mike Pompeo',
      'Ron DeSantis', 'Jim Jordan', 'Mark Meadows', 'Kevin McCarthy'],
    afp: ['Steve King', 'Tom Tancredo', 'Nick Fuentes', 'Paul Gosar', 'Laura Loomer'],
    aga: ['Jim Sykes', 'Greg Gerritt', 'Gail Parker', 'Joe Oddo', 'Carol Miller'],
    lsp: ['Ron Paul', 'Debra Medina', 'Kinky Friedman', 'Daniel Miller', 'Larry Kilgore'],
    srp: ['Lester Maddox', 'Strom Thurmond', 'Harry F. Byrd Jr.', 'Fob James', 'Michael Hill', 'Kirk Fordice'],
    cnp: ['Jerry Brown', 'Tom Hayden', 'Willie Brown', 'Marcus Ruiz Evans', 'Louis Marinelli'],
    cfc: ['Pete Wilson', 'Arnold Schwarzenegger', 'Tom McClintock', 'Richard Riordan', 'Darrell Issa'],
    alk: ['Walter Hickel', 'Jack Coghill', 'Sarah Palin', 'Lynette Clark', 'Todd Palin'],
    aloha: ['Haunani-Kay Trask', 'Mililani Trask', 'Bumpy Kanahele', 'Lilikalā Kameʻeleihiwa', 'Kioni Dudley'],
    raza: ['José Ángel Gutiérrez', 'Mario Compean', 'Ramsey Muñiz', 'Maria Elena Martinez', 'Rodolfo "Corky" Gonzales'],
    nenp: ['Angus King', 'Lowell Weicker', 'Thomas Naylor', 'Kirkpatrick Sale', 'Rob Williams'],
    nyfp: ['Tom Golisano', 'Lenora Fulani', 'Frank MacKay', 'Michael Bloomberg', 'Carl Paladino']
  };
  U.PERSON_PARTY = {};
  Object.keys(U.PEOPLE).forEach(function (p) { U.PEOPLE[p].forEach(function (n) { if (!U.PERSON_PARTY[n] || p !== 'ul') U.PERSON_PARTY[n] = p; }); });

  // Stable ratings (0-100) derived from the name; scenario assumptions.
  U.personStats = function (name) {
    var h = 2166136261; for (var i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 16777619); }
    var r = function (k) { var x = Math.imul(h ^ (k * 0x9e3779b9), 2654435761) >>> 0; return 35 + (x % 56); };
    return { competence: r(1), charisma: r(2), loyalty: r(3) };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
