import React from 'react'

// ** Layout Import
// import BlankLayout from 'src/@core/layouts/BlankLayout'

const dashboardSCM = () => {
  return <div>Dashboard SCM</div>
}

dashboardSCM.acl = {
  action: 'manage',
  subject: 'dashboard-scm'
}

export default dashboardSCM
