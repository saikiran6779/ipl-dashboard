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
