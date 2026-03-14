export const TEAMS = [
  { id: 'MI',   name: 'Mumbai Indians',              color: '#004BA0', accent: '#D1AB3E' },
  { id: 'CSK',  name: 'Chennai Super Kings',         color: '#F9CD1C', accent: '#0081C8' },
  { id: 'RCB',  name: 'Royal Challengers Bengaluru', color: '#C8102E', accent: '#231F20' },
  { id: 'KKR',  name: 'Kolkata Knight Riders',       color: '#3A225D', accent: '#F2A900' },
  { id: 'DC',   name: 'Delhi Capitals',              color: '#0078BC', accent: '#EF1B23' },
  { id: 'PBKS', name: 'Punjab Kings',                color: '#ED1B24', accent: '#A7A9AC' },
  { id: 'RR',   name: 'Rajasthan Royals',            color: '#EA1A85', accent: '#254AA5' },
  { id: 'SRH',  name: 'Sunrisers Hyderabad',         color: '#FF822A', accent: '#1B1B1B' },
  { id: 'GT',   name: 'Gujarat Titans',              color: '#1C1C59', accent: '#B8D1D9' },
  { id: 'LSG',  name: 'Lucknow Super Giants',        color: '#A72B6D', accent: '#00AEEF' },
]

// VENUES list removed — venues are now a DB entity served by GET /api/venues

export const getTeam = (id) => TEAMS.find(t => t.id === id) || { id, name: id, color: '#444', accent: '#fff' }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const parts = String(dateStr).split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Cricsheet player name → DB player name
// Keys  = name as it appears in Cricsheet JSON (info.players / info.player_of_match)
// Values = name stored in the DB players table
// Include both initials-form AND full-name variants so either source resolves.
// ─────────────────────────────────────────────────────────────────────────────
export const CRICSHEET_ALIASES = {
  // ── RCB ──────────────────────────────────────────────────────────────────
  'Virat Kohli':             'Virat Kohli',            // exact
  'Rajat Patidar':           'Rajat Patidar',           // exact
  'Devdutt Padikkal':        'Devdutt Padikkal',        // exact
  'Mayank Agarwal':          'Mayank Agarwal',          // exact
  'Swastik Chhikara':        'Swastik Chhikara',        // exact
  'PD Salt':                 'Phil Salt',               // initials
  'Phil Salt':               'Phil Salt',               // exact variant
  'Jitesh Sharma':           'Jitesh Sharma',           // exact
  'Krunal Pandya':           'Krunal Pandya',           // exact
  'LS Livingstone':          'Liam Livingstone',        // initials
  'Liam Livingstone':        'Liam Livingstone',        // exact variant
  'TH David':                'Tim David',               // initials
  'Tim David':               'Tim David',               // exact variant
  'JM Bethell':              'Jacob Bethell',           // initials
  'Jacob Bethell':           'Jacob Bethell',           // exact variant
  'RAS Shepherd':            'Romario Shepherd',        // initials
  'Romario Shepherd':        'Romario Shepherd',        // exact variant
  'Swapnil Singh':           'Swapnil Singh',           // exact
  'Manoj Bhandage':          'Manoj Bhandage',          // exact
  'Abhinandan Singh':        'Abhinandan Singh',        // exact
  'JR Hazlewood':            'Josh Hazlewood',          // initials
  'Josh Hazlewood':          'Josh Hazlewood',          // exact variant
  'Bhuvneshwar Kumar':       'Bhuvneshwar Kumar',       // exact
  'Yash Dayal':              'Yash Dayal',              // exact
  'M Nuwan Thushara':        'Nuwan Thushara',          // Cricsheet prepends initial
  'Nuwan Thushara':          'Nuwan Thushara',          // exact variant
  'Suyash Sharma':           'Suyash Sharma',           // exact
  'Mohit Rathee':            'Mohit Rathee',            // exact
  'Rasikh Dar Salam':        'Rasikh Dar Salam',        // exact

  // ── KKR ──────────────────────────────────────────────────────────────────
  'AM Rahane':               'Ajinkya Rahane',          // initials
  'Ajinkya Rahane':          'Ajinkya Rahane',          // exact variant
  'Venkatesh Iyer':          'Venkatesh Iyer',          // exact
  'Angkrish Raghuvanshi':    'Angkrish Raghuvanshi',    // exact
  'Manish Pandey':           'Manish Pandey',           // exact
  'Rahmanullah Gurbaz':      'Rahmanullah Gurbaz',      // exact
  'Q de Kock':               'Quinton de Kock',         // initials
  'Quinton de Kock':         'Quinton de Kock',         // exact variant
  'SP Narine':               'Sunil Narine',            // initials
  'Sunil Narine':            'Sunil Narine',            // exact variant
  'AD Russell':              'Andre Russell',           // initials
  'Andre Russell':           'Andre Russell',           // exact variant
  'Rinku Singh':             'Rinku Singh',             // exact
  'Ramandeep Singh':         'Ramandeep Singh',         // exact
  'RP Powell':               'Rovman Powell',           // initials
  'Rovman Powell':           'Rovman Powell',           // exact variant
  'Moeen Ali':               'Moeen Ali',               // exact
  'Varun Chakravarthy':      'Varun Chakravarthy',      // exact
  'Harshit Rana':            'Harshit Rana',            // exact
  'SPD Johnson':             'Spencer Johnson',         // initials
  'Spencer Johnson':         'Spencer Johnson',         // exact variant
  'Anrich Nortje':           'Anrich Nortje',           // exact
  'Vaibhav Arora':           'Vaibhav Arora',           // exact
  'Umran Malik':             'Umran Malik',             // exact
  'Mayank Markande':         'Mayank Markande',         // exact

  // ── CSK ──────────────────────────────────────────────────────────────────
  'MS Dhoni':                'MS Dhoni',                // exact
  'RD Gaikwad':              'Ruturaj Gaikwad',         // initials
  'Ruturaj Gaikwad':         'Ruturaj Gaikwad',         // exact variant
  'Rahul Tripathi':          'Rahul Tripathi',          // exact
  'Shaik Rasheed':           'Shaik Rasheed',           // exact
  'Deepak Hooda':            'Deepak Hooda',            // exact
  'Andre Siddarth':          'Andre Siddarth',          // exact
  'DP Conway':               'Devon Conway',            // initials
  'Devon Conway':            'Devon Conway',            // exact variant
  'Vansh Bedi':              'Vansh Bedi',              // exact
  'RA Jadeja':               'Ravindra Jadeja',         // initials
  'Ravindra Jadeja':         'Ravindra Jadeja',         // exact variant
  'Shivam Dube':             'Shivam Dube',             // exact
  'R Ashwin':                'R Ashwin',                // exact (DB stores initials form)
  'Ravichandran Ashwin':     'R Ashwin',                // full name → DB initials form
  'SM Curran':               'Sam Curran',              // initials
  'Sam Curran':              'Sam Curran',              // exact variant
  'Rachin Ravindra':         'Rachin Ravindra',         // exact
  'Vijay Shankar':           'Vijay Shankar',           // exact
  'Anshul Kamboj':           'Anshul Kamboj',           // exact
  'Jamie Overton':           'Jamie Overton',           // exact
  'Ramakrishna Ghosh':       'Ramakrishna Ghosh',       // exact
  'Noor Ahmad':              'Noor Ahmad',              // exact
  'Shreyas Gopal':           'Shreyas Gopal',           // exact
  'Matheesha Pathirana':     'Matheesha Pathirana',     // exact
  'Khaleel Ahmed':           'Khaleel Ahmed',           // exact
  'Mukesh Choudhary':        'Mukesh Choudhary',        // exact
  'Gurjapneet Singh':        'Gurjapneet Singh',        // exact
  'Nathan Ellis':            'Nathan Ellis',            // exact
  'Kamlesh Nagarkoti':       'Kamlesh Nagarkoti',       // exact

  // ── MI ───────────────────────────────────────────────────────────────────
  'Rohit Sharma':            'Rohit Sharma',            // exact
  'Suryakumar Yadav':        'Suryakumar Yadav',        // exact
  'Tilak Varma':             'Tilak Varma',             // exact
  'RR Rickelton':            'Ryan Rickelton',          // initials
  'Ryan Rickelton':          'Ryan Rickelton',          // exact variant
  'Robin Minz':              'Robin Minz',              // exact
  'HH Pandya':               'Hardik Pandya',           // initials
  'Hardik Pandya':           'Hardik Pandya',           // exact variant
  'Naman Dhir':              'Naman Dhir',              // exact
  'WG Jacks':                'Will Jacks',              // initials
  'Will Jacks':              'Will Jacks',              // exact variant
  'Raj Angad Bawa':          'Raj Angad Bawa',          // exact
  'Vignesh Puthur':          'Vignesh Puthur',          // exact
  'Allah Ghazanfar':         'Allah Ghazanfar',         // exact
  'MJ Santner':              'Mitchell Santner',        // initials
  'Mitchell Santner':        'Mitchell Santner',        // exact variant
  'Jasprit Bumrah':          'Jasprit Bumrah',          // exact
  'Deepak Chahar':           'Deepak Chahar',           // exact
  'TA Boult':                'Trent Boult',             // initials
  'Trent Boult':             'Trent Boult',             // exact variant
  'RJW Topley':              'Reece Topley',            // initials
  'Reece Topley':            'Reece Topley',            // exact variant
  'Ashwani Kumar':           'Ashwani Kumar',           // exact
  'Satyanarayana Raju':      'Satyanarayana Raju',      // exact
  'Arjun Tendulkar':         'Arjun Tendulkar',         // exact
  'LJ Williams':             'Lizaad Williams',         // initials
  'Lizaad Williams':         'Lizaad Williams',         // exact variant
  'Bevan-John Jacobs':       'Bevan-John Jacobs',       // exact
  'Karn Sharma':             'Karn Sharma',             // exact

  // ── DC ───────────────────────────────────────────────────────────────────
  'JA Fraser-McGurk':        'Jake Fraser-McGurk',      // initials
  'Jake Fraser-McGurk':      'Jake Fraser-McGurk',      // exact variant
  'HG Brook':                'Harry Brook',             // initials
  'Harry Brook':             'Harry Brook',             // exact variant
  'TP Stubbs':               'Tristan Stubbs',          // initials
  'Tristan Stubbs':          'Tristan Stubbs',          // exact variant
  'F du Plessis':            'Faf du Plessis',          // initials
  'Faf du Plessis':          'Faf du Plessis',          // exact variant
  'Karun Nair':              'Karun Nair',              // exact
  'KL Rahul':                'KL Rahul',                // exact (DB stores initials form)
  'Abishek Porel':           'Abishek Porel',           // exact
  'DN Ferreira':             'Donovan Ferreira',        // initials
  'Donovan Ferreira':        'Donovan Ferreira',        // exact variant
  'Axar Patel':              'Axar Patel',              // exact
  'Ashutosh Sharma':         'Ashutosh Sharma',         // exact
  'Sameer Rizvi':            'Sameer Rizvi',            // exact
  'Darshan Nalkande':        'Darshan Nalkande',        // exact
  'Vipraj Nigam':            'Vipraj Nigam',            // exact
  'Ajay Mandal':             'Ajay Mandal',             // exact
  'Manvanth Kumar':          'Manvanth Kumar',          // exact
  'Tripurana Vijay':         'Tripurana Vijay',         // exact
  'Madhav Tiwari':           'Madhav Tiwari',           // exact
  'Kuldeep Yadav':           'Kuldeep Yadav',           // exact
  'MA Starc':                'Mitchell Starc',          // initials
  'Mitchell Starc':          'Mitchell Starc',          // exact variant
  'Mukesh Kumar':            'Mukesh Kumar',            // exact
  'T Natarajan':             'T Natarajan',             // exact (DB stores initials form)
  'Mohit Sharma':            'Mohit Sharma',            // exact
  'PVD Chameera':            'Dushmantha Chameera',     // initials (Dushmantha = D, P, V?)
  'Dushmantha Chameera':     'Dushmantha Chameera',     // exact variant

  // ── SRH ──────────────────────────────────────────────────────────────────
  'TM Head':                 'Travis Head',             // initials
  'Travis Head':             'Travis Head',             // exact variant
  'Abhinav Manohar':         'Abhinav Manohar',         // exact
  'Aniket Verma':            'Aniket Verma',            // exact
  'Sachin Baby':             'Sachin Baby',             // exact
  'HH Klaasen':              'Heinrich Klaasen',        // initials
  'Heinrich Klaasen':        'Heinrich Klaasen',        // exact variant
  'Ishan Kishan':            'Ishan Kishan',            // exact
  'Atharva Taide':           'Atharva Taide',           // exact
  'Abhishek Sharma':         'Abhishek Sharma',         // exact
  'N Kumar Reddy':           'Nitish Kumar Reddy',      // partial initials
  'Nitish Kumar Reddy':      'Nitish Kumar Reddy',      // exact variant
  'Kamindu Mendis':          'Kamindu Mendis',          // exact
  'A Zampa':                 'Adam Zampa',              // initials
  'Adam Zampa':              'Adam Zampa',              // exact variant
  'Rahul Chahar':            'Rahul Chahar',            // exact
  'Zeeshan Ansari':          'Zeeshan Ansari',          // exact
  'PJ Cummins':              'Pat Cummins',             // initials
  'Pat Cummins':             'Pat Cummins',             // exact variant
  'Mohammed Shami':          'Mohammed Shami',          // exact
  'Harshal Patel':           'Harshal Patel',           // exact
  'Simarjeet Singh':         'Simarjeet Singh',         // exact
  'Jaydev Unadkat':          'Jaydev Unadkat',          // exact
  'B Carse':                 'Brydon Carse',            // initials
  'Brydon Carse':            'Brydon Carse',            // exact variant
  'Eshan Malinga':           'Eshan Malinga',           // exact

  // ── GT ───────────────────────────────────────────────────────────────────
  'Shubman Gill':            'Shubman Gill',            // exact
  'B Sai Sudharsan':         'Sai Sudharsan',           // Cricsheet prepends initial
  'Sai Sudharsan':           'Sai Sudharsan',           // exact variant
  'Rahul Tewatia':           'Rahul Tewatia',           // exact
  'SE Rutherford':           'Sherfane Rutherford',     // initials
  'Sherfane Rutherford':     'Sherfane Rutherford',     // exact variant
  'JC Buttler':              'Jos Buttler',             // initials
  'Jos Buttler':             'Jos Buttler',             // exact variant
  'Kumar Kushagra':          'Kumar Kushagra',          // exact
  'Anuj Rawat':              'Anuj Rawat',              // exact
  'Rashid Khan':             'Rashid Khan',             // exact
  'W Sundar':                'Washington Sundar',       // initials
  'Washington Sundar':       'Washington Sundar',       // exact variant
  'M Shahrukh Khan':         'M Shahrukh Khan',         // exact (DB stores with initial)
  'Mahipal Lomror':          'Mahipal Lomror',          // exact
  'Nishant Sindhu':          'Nishant Sindhu',          // exact
  'Arshad Khan':             'Arshad Khan',             // exact
  'Jayant Yadav':            'Jayant Yadav',            // exact
  'GD Phillips':             'Glenn Phillips',          // initials
  'Glenn Phillips':          'Glenn Phillips',          // exact variant
  'Karim Janat':             'Karim Janat',             // exact
  'Manav Suthar':            'Manav Suthar',            // exact
  'R Sai Kishore':           'Sai Kishore',             // Cricsheet prepends initial
  'Sai Kishore':             'Sai Kishore',             // exact variant
  'K Rabada':                'Kagiso Rabada',           // initials
  'Kagiso Rabada':           'Kagiso Rabada',           // exact variant
  'Mohammed Siraj':          'Mohammed Siraj',          // exact
  'Prasidh Krishna':         'Prasidh Krishna',         // exact
  'M Prasidh Krishna':       'Prasidh Krishna',         // Cricsheet prepends initial
  'GF Coetzee':              'Gerald Coetzee',          // initials
  'Gerald Coetzee':          'Gerald Coetzee',          // exact variant
  'Gurnoor Brar':            'Gurnoor Brar',            // exact
  'Ishant Sharma':           'Ishant Sharma',           // exact
  'Kulwant Khejroliya':      'Kulwant Khejroliya',      // exact

  // ── PBKS ─────────────────────────────────────────────────────────────────
  'SS Iyer':                 'Shreyas Iyer',            // initials
  'Shreyas Iyer':            'Shreyas Iyer',            // exact variant
  'Shashank Singh':          'Shashank Singh',          // exact
  'Nehal Wadhera':           'Nehal Wadhera',           // exact
  'Harnoor Singh Pannu':     'Harnoor Singh Pannu',     // exact
  'Priyansh Arya':           'Priyansh Arya',           // exact
  'Pyla Avinash':            'Pyla Avinash',            // exact
  'JR Inglis':               'Josh Inglis',             // initials
  'Josh Inglis':             'Josh Inglis',             // exact variant
  'Vishnu Vinod':            'Vishnu Vinod',            // exact
  'Prabhsimran Singh':       'Prabhsimran Singh',       // exact
  'GJ Maxwell':              'Glenn Maxwell',           // initials
  'Glenn Maxwell':           'Glenn Maxwell',           // exact variant
  'MP Stoinis':              'Marcus Stoinis',          // initials
  'Marcus Stoinis':          'Marcus Stoinis',          // exact variant
  'M Jansen':                'Marco Jansen',            // initials
  'Marco Jansen':            'Marco Jansen',            // exact variant
  'Harpreet Brar':           'Harpreet Brar',           // exact
  'AZ Omarzai':              'Azmatullah Omarzai',      // initials
  'Azmatullah Omarzai':      'Azmatullah Omarzai',      // exact variant
  'AJ Hardie':               'Aaron Hardie',            // initials
  'Aaron Hardie':            'Aaron Hardie',            // exact variant
  'Musheer Khan':            'Musheer Khan',            // exact
  'Suryansh Shedge':         'Suryansh Shedge',         // exact
  'Yuzvendra Chahal':        'Yuzvendra Chahal',        // exact
  'Pravin Dubey':            'Pravin Dubey',            // exact
  'Arshdeep Singh':          'Arshdeep Singh',          // exact
  'LH Ferguson':             'Lockie Ferguson',         // initials
  'Lockie Ferguson':         'Lockie Ferguson',         // exact variant
  'Yash Thakur':             'Yash Thakur',             // exact
  'Vijaykumar Vyshak':       'Vijaykumar Vyshak',       // exact
  'Kuldeep Sen':             'Kuldeep Sen',             // exact
  'XC Bartlett':             'Xavier Bartlett',         // initials
  'Xavier Bartlett':         'Xavier Bartlett',         // exact variant

  // ── RR ───────────────────────────────────────────────────────────────────
  'YBK Jaiswal':             'Yashasvi Jaiswal',        // initials
  'Yashasvi Jaiswal':        'Yashasvi Jaiswal',        // exact variant
  'Nitish Rana':             'Nitish Rana',             // exact
  'SO Hetmyer':              'Shimron Hetmyer',         // initials
  'Shimron Hetmyer':         'Shimron Hetmyer',         // exact variant
  'Shubham Dubey':           'Shubham Dubey',           // exact
  'V Suryavanshi':           'Vaibhav Sooryavanshi',    // initials + spelling variant
  'Vaibhav Suryavanshi':     'Vaibhav Sooryavanshi',    // spelling variant
  'Vaibhav Sooryavanshi':    'Vaibhav Sooryavanshi',    // exact
  'SV Samson':               'Sanju Samson',            // initials
  'Sanju Samson':            'Sanju Samson',            // exact variant
  'Dhruv Jurel':             'Dhruv Jurel',             // exact
  'L-D Pretorius':           'Lhuan-dre Pretorius',     // initials/hyphenated
  'Lhuan-dre Pretorius':     'Lhuan-dre Pretorius',     // exact variant
  'Riyan Parag':             'Riyan Parag',             // exact
  'WAR Hasaranga de Silva':  'Wanindu Hasaranga',       // full Cricsheet name → DB name
  'W Hasaranga':             'Wanindu Hasaranga',       // short form
  'Wanindu Hasaranga':       'Wanindu Hasaranga',       // exact variant
  'Yudhvir Singh':           'Yudhvir Singh',           // exact
  'JC Archer':               'Jofra Archer',            // initials
  'Jofra Archer':            'Jofra Archer',            // exact variant
  'M Theekshana':            'Maheesh Theekshana',      // initials
  'Maheesh Theekshana':      'Maheesh Theekshana',      // exact variant
  'Akash Madhwal':           'Akash Madhwal',           // exact
  'Tushar Deshpande':        'Tushar Deshpande',        // exact
  'Sandeep Sharma':          'Sandeep Sharma',          // exact
  'NM Burger':               'Nandre Burger',           // initials
  'Nandre Burger':           'Nandre Burger',           // exact variant
  'Fazalhaq Farooqi':        'Fazalhaq Farooqi',        // exact
  'KD Maphaka':              'Kwena Maphaka',           // initials
  'Kwena Maphaka':           'Kwena Maphaka',           // exact variant
  'Kunal Singh Rathore':     'Kunal Singh Rathore',     // exact

  // ── LSG ──────────────────────────────────────────────────────────────────
  'AK Markram':              'Aiden Markram',           // initials
  'Aiden Markram':           'Aiden Markram',           // exact variant
  'DA Miller':               'David Miller',            // initials
  'David Miller':            'David Miller',            // exact variant
  'Abdul Samad':             'Abdul Samad',             // exact
  'MR Marsh':                'Mitchell Marsh',          // initials
  'Mitchell Marsh':          'Mitchell Marsh',          // exact variant
  'Ayush Badoni':            'Ayush Badoni',            // exact
  'Himmat Singh':            'Himmat Singh',            // exact
  'MB Breetzke':             'Matthew Breetzke',        // initials
  'Matthew Breetzke':        'Matthew Breetzke',        // exact variant
  'Rishabh Pant':            'Rishabh Pant',            // exact
  'NL Pooran':               'Nicholas Pooran',         // initials
  'Nicholas Pooran':         'Nicholas Pooran',         // exact variant
  'Aryan Juyal':             'Aryan Juyal',             // exact
  'Shahbaz Ahmed':           'Shahbaz Ahmed',           // exact
  'ST Thakur':               'Shardul Thakur',          // initials
  'Shardul Thakur':          'Shardul Thakur',          // exact variant
  'Rajvardhan Hangargekar':  'Rajvardhan Hangargekar',  // exact
  'Arshin Kulkarni':         'Arshin Kulkarni',         // exact
  'Yuvraj Chaudhary':        'Yuvraj Chaudhary',        // exact
  'Ravi Bishnoi':            'Ravi Bishnoi',            // exact
  'M Siddharth':             'M Siddharth',             // exact (DB stores initials form)
  'Digvesh Singh':           'Digvesh Singh',           // exact
  'Mayank Yadav':            'Mayank Yadav',            // exact
  'Avesh Khan':              'Avesh Khan',              // exact
  'Akash Deep':              'Akash Deep',              // exact
  'Shamar Joseph':           'Shamar Joseph',           // exact
  'Prince Yadav':            'Prince Yadav',            // exact
  "WA O'Rourke":             "Will O'Rourke",           // initials
  "Will O'Rourke":           "Will O'Rourke",           // exact variant
}

/**
 * Given a Cricsheet player name and the full players array from the API,
 * returns the matched player object { id, name, teamId, role } or null.
 *
 * Resolution order:
 *   1. Alias map normalisation
 *   2. Exact name match (case-insensitive)
 *   3. Last-name unique match
 *   4. Partial containment unique match
 */
export function resolvePlayerFromJson(cricsheetName, players) {
  if (!cricsheetName || !players?.length) return null

  const normalized = CRICSHEET_ALIASES[cricsheetName] ?? cricsheetName

  // 1. Exact match
  const exact = players.find(p => p.name.toLowerCase() === normalized.toLowerCase())
  if (exact) return exact

  // 2. Last-name unique match
  const lastName = normalized.split(' ').pop().toLowerCase()
  const byLast   = players.filter(p => p.name.split(' ').pop().toLowerCase() === lastName)
  if (byLast.length === 1) return byLast[0]

  // 3. Partial containment unique match
  const normLower = normalized.toLowerCase()
  const partial   = players.filter(p => {
    const dbLower = p.name.toLowerCase()
    return dbLower.includes(normLower) || normLower.includes(dbLower)
  })
  if (partial.length === 1) return partial[0]

  return null
}
