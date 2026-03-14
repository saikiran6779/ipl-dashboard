import { createContext, useContext, useEffect, useState } from 'react'
import { getTeams } from '../services/api'

// Provides a { [teamId]: logoUrl } map fetched once on app mount.
// Components read via useTeamLogos(); missing logos are silently absent → fallback badges.

const TeamLogosCtx = createContext({})

export function TeamLogosProvider({ children }) {
  const [logoMap, setLogoMap] = useState({})

  useEffect(() => {
    getTeams()
      .then(teams => {
        const map = {}
        teams.forEach(t => { if (t.logoUrl) map[t.id] = t.logoUrl })
        setLogoMap(map)
      })
      .catch(() => {}) // silent — logos simply show fallback badges
  }, [])

  return <TeamLogosCtx.Provider value={logoMap}>{children}</TeamLogosCtx.Provider>
}

export const useTeamLogos = () => useContext(TeamLogosCtx)
