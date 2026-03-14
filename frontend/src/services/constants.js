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

export const VENUES = [
  'Wankhede Stadium, Mumbai',
  'M. A. Chidambaram Stadium, Chennai',
  'M. Chinnaswamy Stadium, Bengaluru',
  'Eden Gardens, Kolkata',
  'Arun Jaitley Stadium, Delhi',
  'HPCA Stadium, Dharamsala',
  'Sawai Mansingh Stadium, Jaipur',
  'Rajiv Gandhi Intl Stadium, Hyderabad',
  'Narendra Modi Stadium, Ahmedabad',
  'BRSABV Ekana Stadium, Lucknow',
]

export const getTeam = (id) => TEAMS.find(t => t.id === id) || { id, name: id, color: '#444', accent: '#fff' }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const parts = String(dateStr).split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`
}

// ── Cricsheet player name → DB player name ────────────────────────────────────
// Cricsheet uses initials+surname for most overseas players and some Indians.
// Where the Cricsheet name exactly matches the DB name, no alias is needed —
// resolvePlayerFromJson handles exact + last-name + partial matching at runtime.
// Add explicit aliases only where runtime matching would fail or be ambiguous.
export const CRICSHEET_ALIASES = {
  // ── RCB ──────────────────────────────────────────────────────────────────
  'Virat Kohli':          'Virat Kohli',          // exact
  'Rajat Patidar':        'Rajat Patidar',         // exact
  'Devdutt Padikkal':     'Devdutt Padikkal',      // exact
  'Mayank Agarwal':       'Mayank Agarwal',        // exact
  'PD Salt':              'Phil Salt',             // initials (Philip Dean Salt)
  'Jitesh Sharma':        'Jitesh Sharma',         // exact
  'Krunal Pandya':        'Krunal Pandya',         // exact
  'LS Livingstone':       'Liam Livingstone',      // initials (Liam Stephen)
  'TH David':             'Tim David',             // initials (Tim Henry)
  'JM Bethell':           'Jacob Bethell',         // initials (Jacob Michael)
  'RL Shepherd':          'Romario Shepherd',      // initials (Romario Leroy)
  'Swapnil Singh':        'Swapnil Singh',         // exact
  'JR Hazlewood':         'Josh Hazlewood',        // initials (Joshua Ross)
  'Bhuvneshwar Kumar':    'Bhuvneshwar Kumar',     // exact
  'Yash Dayal':           'Yash Dayal',            // exact
  'Rasikh Dar Salam':     'Rasikh Dar Salam',      // exact
  'Rasikh Dar':           'Rasikh Dar Salam',      // Cricsheet sometimes drops 'Salam'
  'Suyash Sharma':        'Suyash Sharma',         // exact
  'Nuwan Thushara':       'Nuwan Thushara',        // exact
  'Mohit Rathee':         'Mohit Rathee',          // exact

  // ── KKR ──────────────────────────────────────────────────────────────────
  'Ajinkya Rahane':       'Ajinkya Rahane',        // exact
  'Venkatesh Iyer':       'Venkatesh Iyer',        // exact
  'Angkrish Raghuvanshi': 'Angkrish Raghuvanshi',  // exact
  'Manish Pandey':        'Manish Pandey',         // exact
  'Rahmanullah Gurbaz':   'Rahmanullah Gurbaz',    // exact
  'Q de Kock':            'Quinton de Kock',       // initials
  'Quinton de Kock':      'Quinton de Kock',       // exact (alternate Cricsheet form)
  'Sunil Narine':         'Sunil Narine',          // exact
  'SP Narine':            'Sunil Narine',          // initials form (Sunil Philip)
  'AD Russell':           'Andre Russell',         // initials (Andre Dwayne)
  'Rinku Singh':          'Rinku Singh',           // exact
  'Ramandeep Singh':      'Ramandeep Singh',       // exact
  'R Powell':             'Rovman Powell',         // last-name form
  'RS Powell':            'Rovman Powell',         // initials form
  'MM Ali':               'Moeen Ali',             // initials (Moeen Munir)
  'Varun Chakravarthy':   'Varun Chakravarthy',    // exact
  'Harshit Rana':         'Harshit Rana',          // exact
  'SA Johnson':           'Spencer Johnson',       // initials (Spencer Alan)
  'A Nortje':             'Anrich Nortje',         // initials
  'Vaibhav Arora':        'Vaibhav Arora',         // exact
  'Umran Malik':          'Umran Malik',           // exact
  'Mayank Markande':      'Mayank Markande',       // exact

  // ── CSK ──────────────────────────────────────────────────────────────────
  'Ruturaj Gaikwad':      'Ruturaj Gaikwad',       // exact
  'Rahul Tripathi':       'Rahul Tripathi',        // exact
  'Shaik Rasheed':        'Shaik Rasheed',         // exact
  'Deepak Hooda':         'Deepak Hooda',          // exact
  'MS Dhoni':             'MS Dhoni',              // exact (official abbrev)
  'DP Conway':            'Devon Conway',          // initials (Devon Philip)
  'Devon Conway':         'Devon Conway',          // exact (alternate form)
  'Ravindra Jadeja':      'Ravindra Jadeja',       // exact
  'Shivam Dube':          'Shivam Dube',           // exact
  'R Ashwin':             'R Ashwin',              // exact (official abbrev)
  'SM Curran':            'Sam Curran',            // initials (Samuel Matthew)
  'Rachin Ravindra':      'Rachin Ravindra',       // exact
  'Vijay Shankar':        'Vijay Shankar',         // exact
  'Anshul Kamboj':        'Anshul Kamboj',         // exact
  'JC Overton':           'Jamie Overton',         // initials (Jamie Craig)
  'Noor Ahmad':           'Noor Ahmad',            // exact
  'Shreyas Gopal':        'Shreyas Gopal',         // exact
  'MP Pathirana':         'Matheesha Pathirana',   // initials (Matheesha Pathirana)
  'Matheesha Pathirana':  'Matheesha Pathirana',   // exact
  'Khaleel Ahmed':        'Khaleel Ahmed',         // exact
  'Kamlesh Nagarkoti':    'Kamlesh Nagarkoti',     // exact
  'Mukesh Choudhary':     'Mukesh Choudhary',      // exact
  'NA Ellis':             'Nathan Ellis',          // initials (Nathan Andrew)
  'Nathan Ellis':         'Nathan Ellis',          // exact

  // ── MI ───────────────────────────────────────────────────────────────────
  'Rohit Sharma':         'Rohit Sharma',          // exact
  'RG Sharma':            'Rohit Sharma',          // initials form (Rohit Gurunath) — older Cricsheet
  'Suryakumar Yadav':     'Suryakumar Yadav',      // exact
  'Tilak Varma':          'Tilak Varma',           // exact
  'BJ Jacobs':            'Bevan-John Jacobs',     // initials
  'Bevan-John Jacobs':    'Bevan-John Jacobs',     // exact
  'Robin Minz':           'Robin Minz',            // exact
  'RM Rickelton':         'Ryan Rickelton',        // initials (Ryan Matthew?)
  'Ryan Rickelton':       'Ryan Rickelton',        // exact
  'Hardik Pandya':        'Hardik Pandya',         // exact
  'Naman Dhir':           'Naman Dhir',            // exact
  'WG Jacks':             'Will Jacks',            // initials (William Gareth)
  'Will Jacks':           'Will Jacks',            // exact
  'Raj Angad Bawa':       'Raj Angad Bawa',        // exact
  'Allah Ghazanfar':      'Allah Ghazanfar',       // exact
  'Karn Sharma':          'Karn Sharma',           // exact
  'MJ Santner':           'Mitchell Santner',      // initials (Mitchell Josef)
  'Mitchell Santner':     'Mitchell Santner',      // exact
  'Jasprit Bumrah':       'Jasprit Bumrah',        // exact
  'DS Chahar':            'Deepak Chahar',         // initials (Deepak Singh)
  'Deepak Chahar':        'Deepak Chahar',         // exact
  'TA Boult':             'Trent Boult',           // initials (Trent Alexander)
  'Trent Boult':          'Trent Boult',           // exact
  'RT Topley':            'Reece Topley',          // initials (Reece Thomas)
  'Reece Topley':         'Reece Topley',          // exact
  'L Williams':           'Lizaad Williams',       // initials
  'LW Williams':          'Lizaad Williams',       // alternate initials form
  'Arjun Tendulkar':      'Arjun Tendulkar',       // exact

  // ── DC ───────────────────────────────────────────────────────────────────
  'J Fraser-McGurk':      'Jake Fraser-McGurk',    // initials (Jacob/Jake)
  'JA Fraser-McGurk':     'Jake Fraser-McGurk',    // initials
  'Jake Fraser-McGurk':   'Jake Fraser-McGurk',    // exact
  'HC Brook':             'Harry Brook',           // initials (Harry Cherrington)
  'Harry Brook':          'Harry Brook',           // exact
  'TS Stubbs':            'Tristan Stubbs',        // initials (Tristan Shane)
  'Tristan Stubbs':       'Tristan Stubbs',        // exact
  'F du Plessis':         'Faf du Plessis',        // initials (Faf = Francois)
  'Faf du Plessis':       'Faf du Plessis',        // exact
  'Karun Nair':           'Karun Nair',            // exact
  'KL Rahul':             'KL Rahul',              // exact (official abbrev)
  'Abishek Porel':        'Abishek Porel',         // exact
  'AR Patel':             'Axar Patel',            // initials (Axar Rajendrasinh)
  'Axar Patel':           'Axar Patel',            // exact
  'Ashutosh Sharma':      'Ashutosh Sharma',       // exact
  'Sameer Rizvi':         'Sameer Rizvi',          // exact
  'Kuldeep Yadav':        'Kuldeep Yadav',         // exact
  'MA Starc':             'Mitchell Starc',        // initials (Mitchell Aaron)
  'Mitchell Starc':       'Mitchell Starc',        // exact
  'Mukesh Kumar':         'Mukesh Kumar',          // exact
  'T Natarajan':          'T Natarajan',           // exact (official abbrev)
  'Mohit Sharma':         'Mohit Sharma',          // exact
  'DC Chameera':          'Dushmantha Chameera',   // initials (Dushmantha Chameera)
  'Dushmantha Chameera':  'Dushmantha Chameera',   // exact

  // ── SRH ──────────────────────────────────────────────────────────────────
  'TM Head':              'Travis Head',           // initials (Travis Michael)
  'Travis Head':          'Travis Head',           // exact
  'Abhinav Manohar':      'Abhinav Manohar',       // exact
  'Aniket Verma':         'Aniket Verma',          // exact
  'HE Klaasen':           'Heinrich Klaasen',      // initials (Heinrich Engelbrecht)
  'Heinrich Klaasen':     'Heinrich Klaasen',      // exact
  'Ishan Kishan':         'Ishan Kishan',          // exact (confirmed from usage)
  'Abhishek Sharma':      'Abhishek Sharma',       // exact
  'Nitish Kumar Reddy':   'Nitish Kumar Reddy',    // exact
  'Kamindu Mendis':       'Kamindu Mendis',        // exact
  'M Kamindu Mendis':     'Kamindu Mendis',        // Cricsheet full-name form
  'AT Zampa':             'Adam Zampa',            // initials (Adam Trevor? / Adam Thomas)
  'Adam Zampa':           'Adam Zampa',            // exact
  'Rahul Chahar':         'Rahul Chahar',          // exact
  'Zeeshan Ansari':       'Zeeshan Ansari',        // exact
  'PA Cummins':           'Pat Cummins',           // initials (Patrick Aaron)
  'Pat Cummins':          'Pat Cummins',           // exact
  'Mohammed Shami':       'Mohammed Shami',        // exact
  'Harshal Patel':        'Harshal Patel',         // exact
  'Simarjeet Singh':      'Simarjeet Singh',       // exact
  'JD Unadkat':           'Jaydev Unadkat',        // initials (Jaydev Dipakbhai)
  'Jaydev Unadkat':       'Jaydev Unadkat',        // exact
  'BC Carse':             'Brydon Carse',          // initials (Brydon Alexander Carse)
  'Brydon Carse':         'Brydon Carse',          // exact
  'Eshan Malinga':        'Eshan Malinga',         // exact

  // ── GT ───────────────────────────────────────────────────────────────────
  'Shubman Gill':         'Shubman Gill',          // exact
  'B Sai Sudharsan':      'Sai Sudharsan',         // Cricsheet uses 'B Sai Sudharsan' (Baba)
  'Sai Sudharsan':        'Sai Sudharsan',         // exact
  'Rahul Tewatia':        'Rahul Tewatia',         // exact
  'SE Rutherford':        'Sherfane Rutherford',   // initials (Sherfane Ewart)
  'Sherfane Rutherford':  'Sherfane Rutherford',   // exact
  'JC Buttler':           'Jos Buttler',           // initials (Joseph Charles)
  'Jos Buttler':          'Jos Buttler',           // exact
  'Rashid Khan':          'Rashid Khan',           // exact
  'Washington Sundar':    'Washington Sundar',     // exact
  'M Shahrukh Khan':      'M Shahrukh Khan',       // exact
  'Mahipal Lomror':       'Mahipal Lomror',        // exact
  'Nishant Sindhu':       'Nishant Sindhu',        // exact
  'Arshad Khan':          'Arshad Khan',           // exact
  'Jayant Yadav':         'Jayant Yadav',          // exact
  'GP Phillips':          'Glenn Phillips',        // initials (Glenn Dwight)
  'Glenn Phillips':       'Glenn Phillips',        // exact
  'Karim Janat':          'Karim Janat',           // exact
  'Manav Suthar':         'Manav Suthar',          // exact
  'R Sai Kishore':        'Sai Kishore',           // Cricsheet uses 'R Sai Kishore'
  'Sai Kishore':          'Sai Kishore',           // exact
  'KA Rabada':            'Kagiso Rabada',         // initials (Kagiso Andre)
  'Kagiso Rabada':        'Kagiso Rabada',         // exact
  'Mohammed Siraj':       'Mohammed Siraj',        // exact
  'Prasidh Krishna':      'Prasidh Krishna',       // exact
  'M Prasidh Krishna':    'Prasidh Krishna',       // Cricsheet full form sometimes
  'GF Coetzee':           'Gerald Coetzee',        // initials (Gerald Francois)
  'Gerald Coetzee':       'Gerald Coetzee',        // exact
  'Gurnoor Brar':         'Gurnoor Brar',          // exact
  'Ishant Sharma':        'Ishant Sharma',         // exact
  'Kulwant Khejroliya':   'Kulwant Khejroliya',    // exact

  // ── PBKS ─────────────────────────────────────────────────────────────────
  'Shreyas Iyer':         'Shreyas Iyer',          // exact
  'Shashank Singh':       'Shashank Singh',        // exact
  'Nehal Wadhera':        'Nehal Wadhera',         // exact
  'Priyansh Arya':        'Priyansh Arya',         // exact
  'JA Inglis':            'Josh Inglis',           // initials (Joshua Alexander)
  'Josh Inglis':          'Josh Inglis',           // exact
  'Prabhsimran Singh':    'Prabhsimran Singh',     // exact
  'GJ Maxwell':           'Glenn Maxwell',         // initials (Glenn James)
  'Glenn Maxwell':        'Glenn Maxwell',         // exact
  'MA Stoinis':           'Marcus Stoinis',        // initials (Marcus Peter)
  'Marcus Stoinis':       'Marcus Stoinis',        // exact
  'MG Jansen':            'Marco Jansen',          // initials (Marco Gideon)
  'Marco Jansen':         'Marco Jansen',          // exact
  'Harpreet Brar':        'Harpreet Brar',         // exact
  'Azmatullah Omarzai':   'Azmatullah Omarzai',    // exact
  'AW Hardie':            'Aaron Hardie',          // initials (Aaron Wynne)
  'Aaron Hardie':         'Aaron Hardie',          // exact
  'Musheer Khan':         'Musheer Khan',          // exact
  'Yuzvendra Chahal':     'Yuzvendra Chahal',      // exact
  'Arshdeep Singh':       'Arshdeep Singh',        // exact
  'LH Ferguson':          'Lockie Ferguson',       // initials (Logan Hector)
  'Lockie Ferguson':      'Lockie Ferguson',       // exact
  'Yash Thakur':          'Yash Thakur',           // exact
  'Vijaykumar Vyshak':    'Vijaykumar Vyshak',     // exact
  'XC Bartlett':          'Xavier Bartlett',       // initials (Xavier Craig)
  'Xavier Bartlett':      'Xavier Bartlett',       // exact

  // ── RR ───────────────────────────────────────────────────────────────────
  'Yashasvi Jaiswal':     'Yashasvi Jaiswal',      // exact
  'Nitish Rana':          'Nitish Rana',           // exact
  'SM Hetmyer':           'Shimron Hetmyer',       // initials (Shimron Odilon)
  'Shimron Hetmyer':      'Shimron Hetmyer',       // exact
  'Shubham Dubey':        'Shubham Dubey',         // exact
  'Vaibhav Sooryavanshi': 'Vaibhav Sooryavanshi',  // exact
  'Sanju Samson':         'Sanju Samson',          // exact
  'Dhruv Jurel':          'Dhruv Jurel',           // exact
  'L Pretorius':          'Lhuan-dre Pretorius',   // short form
  'Lhuan-dre Pretorius':  'Lhuan-dre Pretorius',   // exact
  'Riyan Parag':          'Riyan Parag',           // exact
  'Wanindu Hasaranga':    'Wanindu Hasaranga',     // exact
  'WM de Silva':          'Wanindu Hasaranga',     // Cricsheet uses WM de Silva sometimes
  'JC Archer':            'Jofra Archer',          // initials (Jofra Chioke)
  'Jofra Archer':         'Jofra Archer',          // exact
  'MT Theekshana':        'Maheesh Theekshana',    // initials (Maheesh Theekshana)
  'Maheesh Theekshana':   'Maheesh Theekshana',    // exact
  'Akash Madhwal':        'Akash Madhwal',         // exact
  'TU Deshpande':         'Tushar Deshpande',      // initials (Tushar Umashankar) — confirmed
  'Tushar Deshpande':     'Tushar Deshpande',      // exact
  'Sandeep Sharma':       'Sandeep Sharma',        // exact
  'NE Burger':            'Nandre Burger',         // initials (Nandre Ethan?)
  'N Burger':             'Nandre Burger',         // alternate short form
  'Fazalhaq Farooqi':     'Fazalhaq Farooqi',      // exact
  'KA Maphaka':           'Kwena Maphaka',         // initials (Kwena Alfred)
  'Kwena Maphaka':        'Kwena Maphaka',         // exact

  // ── LSG ──────────────────────────────────────────────────────────────────
  'AK Markram':           'Aiden Markram',         // initials (Aiden Kyle)
  'Aiden Markram':        'Aiden Markram',         // exact
  'DA Miller':            'David Miller',          // initials (David Andrew)
  'David Miller':         'David Miller',          // exact
  'Abdul Samad':          'Abdul Samad',           // exact
  'MR Marsh':             'Mitchell Marsh',        // initials (Mitchell Ross)
  'Mitchell Marsh':       'Mitchell Marsh',        // exact
  'Ayush Badoni':         'Ayush Badoni',          // exact
  'MB Breetzke':          'Matthew Breetzke',      // initials (Matthew Barry)
  'Matthew Breetzke':     'Matthew Breetzke',      // exact
  'Rishabh Pant':         'Rishabh Pant',          // exact
  'N Pooran':             'Nicholas Pooran',       // initials
  'NE Pooran':            'Nicholas Pooran',       // initials (Nicholas Eknath?)
  'Nicholas Pooran':      'Nicholas Pooran',       // exact
  'Shahbaz Ahmed':        'Shahbaz Ahmed',         // exact
  'Shardul Thakur':       'Shardul Thakur',        // exact
  'Ravi Bishnoi':         'Ravi Bishnoi',          // exact
  'M Siddharth':          'M Siddharth',           // exact (official abbrev)
  'Mayank Yadav':         'Mayank Yadav',          // exact
  'Avesh Khan':           'Avesh Khan',            // exact
  'Akash Deep':           'Akash Deep',            // exact
  'SC Joseph':            'Shamar Joseph',         // initials (Shamar Clauric)
  'Shamar Joseph':        'Shamar Joseph',         // exact
  "WD O'Rourke":          "Will O'Rourke",         // initials (Will Dougal)
  "Will O'Rourke":        "Will O'Rourke",         // exact
}

/**
 * Given a Cricsheet player name and the API players array,
 * returns the matched player object { id, name, teamId, role } or null.
 *
 * Resolution order:
 *   1. Alias map normalisation
 *   2. Exact match (case-insensitive)
 *   3. Last-name match (unique only)
 *   4. Partial containment match (unique only)
 */
export function resolvePlayerFromJson(cricsheetName, players) {
  if (!cricsheetName || !players?.length) return null

  // Step 1: normalise via alias map
  const normalized = CRICSHEET_ALIASES[cricsheetName] ?? cricsheetName

  // Step 2: exact match
  const exact = players.find(p => p.name.toLowerCase() === normalized.toLowerCase())
  if (exact) return exact

  // Step 3: last-name match (unique only)
  const lastName = normalized.split(' ').pop().toLowerCase()
  const byLastName = players.filter(p => p.name.split(' ').pop().toLowerCase() === lastName)
  if (byLastName.length === 1) return byLastName[0]

  // Step 4: partial containment (unique only)
  const normLower = normalized.toLowerCase()
  const partial = players.filter(p => {
    const pLower = p.name.toLowerCase()
    return pLower.includes(normLower) || normLower.includes(pLower)
  })
  if (partial.length === 1) return partial[0]

  return null
}
