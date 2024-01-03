// ** React Imports
import { useEffect, useState } from 'react'

import { useAuth } from 'src/hooks/useAuth'

const ServerSideNavItems = () => {
  // ** State
  const [menuItems, setMenuItems] = useState([])
  const auth = useAuth()

  useEffect(() => {
    setMenuItems(auth.userMenu.menus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { menuItems }
}

export default ServerSideNavItems
